import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_ASSETS,
  INITIAL_SITES,
  INITIAL_USERS,
  INITIAL_READERS,
  INITIAL_CHECKOUTS,
  INITIAL_MAINTENANCE_LOGS,
  INITIAL_ALERTS,
  INITIAL_INVENTORY,
  INITIAL_READ_EVENTS,
  INITIAL_AUDIT_LOGS
} from './src/data/initialData.ts';
import { Asset, Checkout, Alert, ReadEvent, MaintenanceLog, Reader, Site, InventoryItem, User, AuditLog } from './src/types.ts';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data_db.json');

// Initialize database in memory
interface DbState {
  assets: Asset[];
  sites: Site[];
  users: User[];
  readers: Reader[];
  checkouts: Checkout[];
  maintenance: MaintenanceLog[];
  alerts: Alert[];
  inventory: InventoryItem[];
  events: ReadEvent[];
  auditLogs: AuditLog[];
  streamConfig: {
    isStreaming: boolean;
    eventsPerMinute: number;
    offlineBufferMode: boolean;
    bufferedCount: number;
    lastIngestedEpc?: string;
  };
}

let db: DbState = {
  assets: [...INITIAL_ASSETS],
  sites: [...INITIAL_SITES],
  users: [...INITIAL_USERS],
  readers: [...INITIAL_READERS],
  checkouts: [...INITIAL_CHECKOUTS],
  maintenance: [...INITIAL_MAINTENANCE_LOGS],
  alerts: [...INITIAL_ALERTS],
  inventory: [...INITIAL_INVENTORY],
  events: [...INITIAL_READ_EVENTS],
  auditLogs: [...INITIAL_AUDIT_LOGS],
  streamConfig: {
    isStreaming: true,
    eventsPerMinute: 12,
    offlineBufferMode: false,
    bufferedCount: 0
  }
};

// Try to load persisted DB if file exists
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    db = { ...db, ...parsed };
    console.log('Successfully loaded persisted MongoDB collection state from file.');
  }
} catch (e) {
  console.warn('Could not read persistent db file, using initial memory dataset.', e);
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to write db file:', err);
  }
}

function addAuditLog(action: string, entityType: AuditLog['entityType'], entityId: string, entityName: string, userName: string, details: string) {
  const log: AuditLog = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    entityType,
    entityId,
    entityName,
    userId: 'usr-sys',
    userName,
    timestamp: new Date().toISOString(),
    details
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 200) db.auditLogs.pop();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // ----------------------------------------------------
  // REST API ROUTES (/api/v1/...)
  // ----------------------------------------------------

  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Aperture RFID Asset Tracking Engine',
      database: 'MongoDB (In-Memory/JSON Document Store)',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Assets
  app.get('/api/v1/assets', (req, res) => {
    const { siteId, category, status, search } = req.query;
    let list = db.assets;
    if (siteId && typeof siteId === 'string') {
      list = list.filter(a => a.siteId === siteId);
    }
    if (category && typeof category === 'string') {
      list = list.filter(a => a.category === category);
    }
    if (status && typeof status === 'string') {
      list = list.filter(a => a.status === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(a => 
        a.name.toLowerCase().includes(q) ||
        a.tagEpc.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.manufacturer.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q)
      );
    }
    res.json(list);
  });

  app.post('/api/v1/assets', (req, res) => {
    const body = req.body;
    const newAsset: Asset = {
      id: `ast-${Date.now()}`,
      name: body.name || 'Untitled Asset',
      category: body.category || 'Tools',
      subCategory: body.subCategory || 'General',
      manufacturer: body.manufacturer || 'Generic',
      model: body.model || 'Standard',
      serialNumber: body.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      tagEpc: body.tagEpc || `E2801191A000001000000${Math.floor(100 + Math.random() * 900)}`,
      qrCode: `QR-${Math.floor(1000 + Math.random() * 9000)}`,
      status: body.status || 'In Zone',
      siteId: body.siteId || db.sites[0].id,
      siteName: db.sites.find(s => s.id === body.siteId)?.name || db.sites[0].name,
      zoneId: body.zoneId || db.sites[0].zones[0].id,
      zoneName: db.sites[0].zones.find(z => z.id === body.zoneId)?.name || db.sites[0].zones[0].name,
      purchaseDate: body.purchaseDate || new Date().toISOString().split('T')[0],
      cost: Number(body.cost) || 500,
      rentalCostPerDay: body.isRental ? Number(body.rentalCostPerDay) || 50 : undefined,
      isRental: Boolean(body.isRental),
      rentalEndDate: body.rentalEndDate,
      lastSeenAt: new Date().toISOString(),
      lastReaderId: 'reader-101',
      rssi: -50,
      photoUrl: body.photoUrl || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600',
      condition: body.condition || 'Excellent',
      customFields: body.customFields || {},
      notes: body.notes
    };
    db.assets.unshift(newAsset);
    addAuditLog('ASSET_REGISTERED', 'ASSET', newAsset.id, newAsset.name, 'Admin', `Bound RFID tag ${newAsset.tagEpc}`);
    saveDb();
    res.status(201).json(newAsset);
  });

  app.patch('/api/v1/assets/:id', (req, res) => {
    const idx = db.assets.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Asset not found' });
    db.assets[idx] = { ...db.assets[idx], ...req.body };
    addAuditLog('ASSET_UPDATED', 'ASSET', db.assets[idx].id, db.assets[idx].name, 'Admin', `Updated details`);
    saveDb();
    res.json(db.assets[idx]);
  });

  app.delete('/api/v1/assets/:id', (req, res) => {
    const idx = db.assets.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Asset not found' });
    const removed = db.assets.splice(idx, 1)[0];
    addAuditLog('ASSET_DELETED', 'ASSET', removed.id, removed.name, 'Admin', 'Removed from registry');
    saveDb();
    res.json({ message: 'Asset removed', id: req.params.id });
  });

  // Checkouts
  app.get('/api/v1/checkouts', (req, res) => {
    res.json(db.checkouts);
  });

  app.post('/api/v1/checkouts', (req, res) => {
    const { assetId, userId, jobId, expectedReturnHours, notes, photoUrl } = req.body;
    const asset = db.assets.find(a => a.id === assetId);
    const user = db.users.find(u => u.id === userId);
    if (!asset) return res.status(400).json({ error: 'Asset invalid' });

    const expectedHours = Number(expectedReturnHours) || 8;
    const newCheckout: Checkout = {
      id: `chk-${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      assetCategory: asset.category,
      tagEpc: asset.tagEpc,
      userId: user?.id || 'usr-3',
      userName: user?.name || 'Carlos Mendez',
      badgeId: user?.badgeId || 'BDG-1029',
      checkoutTime: new Date().toISOString(),
      expectedReturn: new Date(Date.now() + 1000 * 60 * 60 * expectedHours).toISOString(),
      jobId: jobId || 'job-general',
      jobName: jobId ? `Job #${jobId}` : 'General Site Work',
      checkoutCondition: asset.condition,
      notes: notes || 'Handheld scanner checkout',
      photoUrl,
      status: 'ACTIVE'
    };

    asset.status = 'Checked Out';
    asset.custodianId = newCheckout.userId;
    asset.custodianName = newCheckout.userName;

    db.checkouts.unshift(newCheckout);
    addAuditLog('CHECKOUT_ISSUED', 'CHECKOUT', newCheckout.id, asset.name, newCheckout.userName, `Checked out for job ${newCheckout.jobName}`);
    saveDb();
    res.status(201).json(newCheckout);
  });

  app.post('/api/v1/checkouts/:id/return', (req, res) => {
    const checkout = db.checkouts.find(c => c.id === req.params.id);
    if (!checkout) return res.status(404).json({ error: 'Checkout record not found' });

    checkout.status = 'RETURNED';
    checkout.actualReturn = new Date().toISOString();
    checkout.returnCondition = req.body.condition || 'Good';

    const asset = db.assets.find(a => a.id === checkout.assetId);
    if (asset) {
      asset.status = 'In Zone';
      asset.custodianId = undefined;
      asset.custodianName = undefined;
      if (req.body.condition) asset.condition = req.body.condition;
    }

    addAuditLog('CHECKOUT_RETURNED', 'CHECKOUT', checkout.id, checkout.assetName, checkout.userName, `Returned to zone in ${checkout.returnCondition} condition`);
    saveDb();
    res.json(checkout);
  });

  // RFID Event Ingestion Pipeline (Simulates Edge Reader / LLRP Middleware)
  app.post('/api/v1/events/scan', (req, res) => {
    const { epc, readerId, rssi } = req.body;
    const reader = db.readers.find(r => r.id === readerId) || db.readers[0];
    const asset = db.assets.find(a => a.tagEpc === epc);

    reader.readCountTotal += 1;
    reader.lastHeartbeat = new Date().toISOString();

    if (db.streamConfig.offlineBufferMode) {
      db.streamConfig.bufferedCount += 1;
      reader.bufferedEventsCount += 1;
      return res.json({ buffered: true, bufferedCount: db.streamConfig.bufferedCount });
    }

    const event: ReadEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      epc: epc || 'UNKNOWN_EPC',
      assetId: asset?.id,
      assetName: asset?.name || 'Unbound Tag',
      assetCategory: asset?.category,
      readerId: reader.id,
      readerName: reader.name,
      siteId: reader.siteId,
      siteName: reader.siteName,
      zoneId: reader.zoneId,
      zoneName: reader.zoneName,
      rssi: Number(rssi) || -52,
      timestamp: new Date().toISOString(),
      eventType: 'SCAN',
      antennaId: 1
    };

    if (asset) {
      asset.lastSeenAt = event.timestamp;
      asset.lastReaderId = reader.id;
      asset.rssi = event.rssi;
      asset.siteId = reader.siteId;
      asset.siteName = reader.siteName;
      asset.zoneId = reader.zoneId;
      asset.zoneName = reader.zoneName;

      // Check Geofence Breach Logic
      if (reader.zoneName.includes('Gate') && asset.status !== 'Checked Out' && asset.status !== 'In Transit') {
        event.eventType = 'GEOFENCE_BREACH';
        const existingAlert = db.alerts.find(a => a.assetId === asset.id && !a.resolved && a.type === 'GEOFENCE_BREACH');
        if (!existingAlert) {
          const alert: Alert = {
            id: `alt-${Date.now()}`,
            type: 'GEOFENCE_BREACH',
            severity: 'CRITICAL',
            assetId: asset.id,
            assetName: asset.name,
            siteId: reader.siteId,
            siteName: reader.siteName,
            zoneId: reader.zoneId,
            zoneName: reader.zoneName,
            triggeredAt: event.timestamp,
            resolved: false,
            message: `CRITICAL: Asset "${asset.name}" detected passing ${reader.name} without checkout authorization!`
          };
          db.alerts.unshift(alert);
          asset.status = 'Missing';
          addAuditLog('GEOFENCE_BREACH', 'ASSET', asset.id, asset.name, 'SYS-RFID', alert.message);
        }
      }
    }

    db.events.unshift(event);
    if (db.events.length > 300) db.events.pop();

    db.streamConfig.lastIngestedEpc = epc;
    saveDb();
    res.json({ success: true, event, assetUpdated: Boolean(asset) });
  });

  app.get('/api/v1/events', (req, res) => {
    res.json(db.events);
  });

  // Alerts
  app.get('/api/v1/alerts', (req, res) => {
    res.json(db.alerts);
  });

  app.patch('/api/v1/alerts/:id/resolve', (req, res) => {
    const alert = db.alerts.find(a => a.id === req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = req.body.resolvedBy || 'Site Manager';

    if (alert.assetId) {
      const asset = db.assets.find(a => a.id === alert.assetId);
      if (asset && asset.status === 'Missing') {
        asset.status = 'In Zone';
      }
    }

    addAuditLog('ALERT_RESOLVED', 'ASSET', alert.assetId || alert.id, alert.assetName || alert.message, alert.resolvedBy, 'Resolved alert in dashboard');
    saveDb();
    res.json(alert);
  });

  // Sites
  app.get('/api/v1/sites', (req, res) => {
    res.json(db.sites);
  });

  app.post('/api/v1/sites', (req, res) => {
    const newSite: Site = {
      id: `site-${Date.now()}`,
      name: req.body.name || 'New Construction Site',
      code: req.body.code || `SITE-${Math.floor(10 + Math.random()*90)}`,
      address: req.body.address || 'Address pending',
      manager: req.body.manager || 'Unassigned',
      activeAssetsCount: 0,
      totalAssetsValue: 0,
      coordinates: req.body.coordinates || { lat: 37.7749, lng: -122.4194 },
      zones: []
    };
    db.sites.push(newSite);
    saveDb();
    res.status(201).json(newSite);
  });

  app.post('/api/v1/sites/:siteId/zones', (req, res) => {
    const site = db.sites.find(s => s.id === req.params.siteId);
    if (!site) return res.status(404).json({ error: 'Site not found' });
    const newZone = {
      id: `z-${Date.now()}`,
      siteId: site.id,
      name: req.body.name || 'New Zone',
      type: req.body.type || 'Laydown Yard',
      readerIds: [],
      capacity: Number(req.body.capacity) || 50,
      currentCount: 0,
      color: req.body.color || '#3b82f6'
    };
    site.zones.push(newZone as any);
    saveDb();
    res.status(201).json(newZone);
  });

  // Readers
  app.get('/api/v1/readers', (req, res) => {
    res.json(db.readers);
  });

  app.post('/api/v1/readers', (req, res) => {
    const newReader: Reader = {
      id: `reader-${Date.now()}`,
      name: req.body.name || 'New RFID Portal',
      type: req.body.type || 'Fixed Portal',
      siteId: req.body.siteId || db.sites[0].id,
      siteName: db.sites.find(s => s.id === req.body.siteId)?.name || db.sites[0].name,
      zoneId: req.body.zoneId || db.sites[0].zones[0].id,
      zoneName: db.sites[0].zones.find(z => z.id === req.body.zoneId)?.name || 'Gate Portal',
      status: 'Online',
      lastHeartbeat: new Date().toISOString(),
      antennaPowerDbm: Number(req.body.antennaPowerDbm) || 30,
      ipAddress: req.body.ipAddress || '192.168.1.200',
      readCountTotal: 0,
      bufferedEventsCount: 0,
      firmwareVersion: 'v3.4.2-Impinj'
    };
    db.readers.push(newReader);
    saveDb();
    res.status(201).json(newReader);
  });

  app.patch('/api/v1/readers/:id', (req, res) => {
    const reader = db.readers.find(r => r.id === req.params.id);
    if (!reader) return res.status(404).json({ error: 'Reader not found' });
    Object.assign(reader, req.body);
    saveDb();
    res.json(reader);
  });

  // Maintenance
  app.get('/api/v1/maintenance', (req, res) => {
    res.json(db.maintenance);
  });

  app.post('/api/v1/maintenance', (req, res) => {
    const newMaint: MaintenanceLog = {
      id: `maint-${Date.now()}`,
      assetId: req.body.assetId,
      assetName: req.body.assetName || 'Asset',
      type: req.body.type || 'Preventive',
      date: req.body.date || new Date().toISOString().split('T')[0],
      scheduledDate: req.body.scheduledDate || new Date().toISOString().split('T')[0],
      cost: Number(req.body.cost) || 0,
      technician: req.body.technician || 'Elena Rostova',
      status: req.body.status || 'Scheduled',
      notes: req.body.notes || '',
      workOrderId: `WO-${Math.floor(1000 + Math.random()*9000)}`
    };
    db.maintenance.unshift(newMaint);

    if (newMaint.status === 'In Progress') {
      const asset = db.assets.find(a => a.id === newMaint.assetId);
      if (asset) asset.status = 'Under Maintenance';
    }

    addAuditLog('MAINTENANCE_CREATED', 'MAINTENANCE', newMaint.id, newMaint.assetName, newMaint.technician, `Created work order ${newMaint.workOrderId}`);
    saveDb();
    res.status(201).json(newMaint);
  });

  // Inventory & Supplies
  app.get('/api/v1/inventory', (req, res) => {
    res.json(db.inventory);
  });

  app.patch('/api/v1/inventory/:id', (req, res) => {
    const item = db.inventory.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    Object.assign(item, req.body);
    saveDb();
    res.json(item);
  });

  // Users & Audit
  app.get('/api/v1/users', (req, res) => res.json(db.users));
  app.get('/api/v1/audit-logs', (req, res) => res.json(db.auditLogs));

  // Executive & System Summary
  app.get('/api/v1/reports/summary', (req, res) => {
    const totalAssetValue = db.assets.reduce((sum, a) => sum + a.cost, 0);
    const checkedOutCount = db.assets.filter(a => a.status === 'Checked Out').length;
    const inZoneCount = db.assets.filter(a => a.status === 'In Zone').length;
    const missingCount = db.assets.filter(a => a.status === 'Missing').length;
    const maintenanceCount = db.assets.filter(a => a.status === 'Under Maintenance').length;
    const totalAssets = db.assets.length;

    const utilizationRate = totalAssets > 0 ? Math.round(((checkedOutCount + inZoneCount * 0.4) / totalAssets) * 100) : 0;
    const lossPercentage = totalAssets > 0 ? Number(((missingCount / totalAssets) * 100).toFixed(1)) : 0;
    const criticalAlertsCount = db.alerts.filter(a => !a.resolved && a.severity === 'CRITICAL').length;

    res.json({
      totalAssetValue,
      totalAssets,
      checkedOutCount,
      inZoneCount,
      missingCount,
      maintenanceCount,
      utilizationRate,
      lossPercentage,
      criticalAlertsCount,
      activeReadersCount: db.readers.filter(r => r.status === 'Online').length,
      sitesCount: db.sites.length
    });
  });

  // Hardware Stream Control Simulation
  app.post('/api/v1/hardware/stream/toggle', (req, res) => {
    db.streamConfig.isStreaming = !db.streamConfig.isStreaming;
    if (req.body.offlineBufferMode !== undefined) {
      db.streamConfig.offlineBufferMode = Boolean(req.body.offlineBufferMode);
    }
    if (db.streamConfig.offlineBufferMode === false && db.streamConfig.bufferedCount > 0) {
      // Sync buffered events when connection restored!
      addAuditLog('HARDWARE_SYNC', 'READER', 'EDGE-GATEWAY', 'Edge Controller', 'System', `Flushed ${db.streamConfig.bufferedCount} offline buffered RFID events to cloud DB.`);
      db.streamConfig.bufferedCount = 0;
      db.readers.forEach(r => r.bufferedEventsCount = 0);
    }
    saveDb();
    res.json(db.streamConfig);
  });

  // Automated Hardware Scanner Background Pulse (Simulates active readers)
  setInterval(() => {
    if (!db.streamConfig.isStreaming || db.assets.length === 0) return;

    // Pick a random asset and reader to simulate periodic heartbeat/zone detection
    const randomAsset = db.assets[Math.floor(Math.random() * db.assets.length)];
    const randomReader = db.readers[Math.floor(Math.random() * db.readers.length)];

    const rssi = -35 - Math.floor(Math.random() * 35);
    randomReader.readCountTotal += 1;
    randomReader.lastHeartbeat = new Date().toISOString();

    if (db.streamConfig.offlineBufferMode) {
      db.streamConfig.bufferedCount += 1;
      randomReader.bufferedEventsCount += 1;
      return;
    }

    const event: ReadEvent = {
      id: `evt-auto-${Date.now()}`,
      epc: randomAsset.tagEpc,
      assetId: randomAsset.id,
      assetName: randomAsset.name,
      assetCategory: randomAsset.category,
      readerId: randomReader.id,
      readerName: randomReader.name,
      siteId: randomReader.siteId,
      siteName: randomReader.siteName,
      zoneId: randomReader.zoneId,
      zoneName: randomReader.zoneName,
      rssi,
      timestamp: new Date().toISOString(),
      eventType: 'SCAN',
      antennaId: Math.floor(1 + Math.random() * 4)
    };

    randomAsset.lastSeenAt = event.timestamp;
    randomAsset.lastReaderId = randomReader.id;
    randomAsset.rssi = rssi;

    db.events.unshift(event);
    if (db.events.length > 300) db.events.pop();
  }, 10000); // Pulse every 10s

  // ----------------------------------------------------
  // VITE / STATIC FILE SERVING
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aperture Server] Operating on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
