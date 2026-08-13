/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SidebarNav, TabType } from './components/SidebarNav';
import { DashboardView } from './components/DashboardView';
import { AssetRegistryView } from './components/AssetRegistryView';
import { AssetDetailModal } from './components/AssetDetailModal';
import { AssetFormModal } from './components/AssetFormModal';
import { LiveTrackingMapView } from './components/LiveTrackingMapView';
import { FindAssetRadarModal } from './components/FindAssetRadarModal';
import { CheckoutCustodyView } from './components/CheckoutCustodyView';
import { GeofenceAlertsView } from './components/GeofenceAlertsView';
import { InventoryView } from './components/InventoryView';
import { MaintenanceView } from './components/MaintenanceView';
import { UtilizationRentalView } from './components/UtilizationRentalView';
import { HardwareManagementView } from './components/HardwareManagementView';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { MobileFieldScannerView } from './components/MobileFieldScannerView';
import { AiEventBehaviorView } from './components/AiEventBehaviorView';
import { SettingsView } from './components/SettingsView';
import { UserPortalView } from './components/UserPortalView';
import { PlaybackView } from './components/PlaybackView';
import { DeveloperApiView } from './components/DeveloperApiView';
import { AuditLogsView } from './components/AuditLogsView';
import { HardwareSimulatorDrawer } from './components/HardwareSimulatorDrawer';
import { QrCodeModal } from './components/QrCodeModal';
import { PublicAssetView } from './components/PublicAssetView';
import { CsvImportModal } from './components/CsvImportModal';

import {
  fetchAssets,
  fetchSites,
  fetchCheckouts,
  fetchAlerts,
  fetchEvents,
  fetchMaintenance,
  fetchInventory,
  fetchReaders,
  fetchUsers,
  fetchAuditLogs,
  createAsset,
  createAssetsBatch,
  updateAsset,
  deleteAsset,
  createCheckout,
  returnCheckout,
  resolveAlert,
  createMaintenance,
  updateInventory,
  simulateScan
} from './services/api';

import {
  seedInitialFirestoreData,
  checkFirestoreConnection,
  subscribeAssets,
  subscribeSites,
  subscribeCheckouts,
  subscribeAlerts,
  subscribeReadEvents,
  subscribeMaintenance,
  subscribeInventory,
  subscribeReaders,
  subscribeUsers,
  subscribeAuditLogs,
  createFirestoreAsset,
  createFirestoreAssetsBatch,
  updateFirestoreAsset,
  deleteFirestoreAsset,
  createFirestoreCheckout,
  returnFirestoreCheckout,
  resolveFirestoreAlert,
  createFirestoreMaintenance,
  updateFirestoreInventory
} from './services/firestoreService';

import { Asset, Site, Checkout, Alert, ReadEvent, MaintenanceLog, InventoryItem, Reader, User, AuditLog } from './types';
import {
  INITIAL_ASSETS,
  INITIAL_SITES,
  INITIAL_CHECKOUTS,
  INITIAL_ALERTS,
  INITIAL_READ_EVENTS,
  INITIAL_MAINTENANCE_LOGS,
  INITIAL_INVENTORY,
  INITIAL_READERS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('ALL');

  // Core Data Collections State (Pre-populated with default seed data for immediate visibility)
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [sites, setSites] = useState<Site[]>(INITIAL_SITES);
  const [checkouts, setCheckouts] = useState<Checkout[]>(INITIAL_CHECKOUTS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [readEvents, setReadEvents] = useState<ReadEvent[]>(INITIAL_READ_EVENTS);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(INITIAL_MAINTENANCE_LOGS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [readers, setReaders] = useState<Reader[]>(INITIAL_READERS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // System Hardware Stream State
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);

  // Firestore Connection & Manual Sync State
  const [isFirestoreOnline, setIsFirestoreOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(new Date().toLocaleTimeString());

  // Real-time Network Connectivity Monitoring
  useEffect(() => {
    const handleOnline = async () => {
      setIsFirestoreOnline(true);
      const connected = await checkFirestoreConnection();
      setIsFirestoreOnline(connected);
    };
    const handleOffline = () => {
      setIsFirestoreOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial server ping check
    checkFirestoreConnection().then(connected => {
      setIsFirestoreOnline(connected);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Modals & Drawers
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [inspectingAsset, setInspectingAsset] = useState<Asset | null>(null);
  const [radarAsset, setRadarAsset] = useState<Asset | null>(null);
  const [qrModalAsset, setQrModalAsset] = useState<Asset | null>(null);
  const [hardwareDrawerOpen, setHardwareDrawerOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  // Public View State (from URL query ?publicAsset=ASSET_ID)
  const initialPublicAsset = new URLSearchParams(window.location.search).get('publicAsset');
  const [publicAssetId, setPublicAssetId] = useState<string | null>(initialPublicAsset);

  // Current User Persona
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-1',
    name: 'Sarah Jenkins',
    email: 'sjenkins@apertureconst.com',
    role: 'Site Manager',
    siteAccess: ['site-1', 'site-2'],
    badgeId: 'BDG-8801',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    phone: '+1 (555) 234-5678'
  });

  // Initialize Firestore seeding and real-time listeners
  useEffect(() => {
    // Seed Firestore if empty
    seedInitialFirestoreData();

    // Set up real-time snapshot listeners
    const unsubAssets = subscribeAssets((items) => {
      if (items.length > 0) setAssets(items);
    });
    const unsubSites = subscribeSites((items) => {
      if (items.length > 0) setSites(items);
    });
    const unsubCheckouts = subscribeCheckouts((items) => {
      if (items.length > 0) setCheckouts(items);
    });
    const unsubAlerts = subscribeAlerts((items) => {
      if (items.length > 0) setAlerts(items);
    });
    const unsubReadEvents = subscribeReadEvents((items) => {
      if (items.length > 0) setReadEvents(items);
    });
    const unsubMaintenance = subscribeMaintenance((items) => {
      if (items.length > 0) setMaintenanceLogs(items);
    });
    const unsubInventory = subscribeInventory((items) => {
      if (items.length > 0) setInventory(items);
    });
    const unsubReaders = subscribeReaders((items) => {
      if (items.length > 0) setReaders(items);
    });
    const unsubUsers = subscribeUsers((items) => {
      if (items.length > 0) setUsers(items);
    });
    const unsubAuditLogs = subscribeAuditLogs((items) => {
      if (items.length > 0) setAuditLogs(items);
    });

    return () => {
      unsubAssets();
      unsubSites();
      unsubCheckouts();
      unsubAlerts();
      unsubReadEvents();
      unsubMaintenance();
      unsubInventory();
      unsubReaders();
      unsubUsers();
      unsubAuditLogs();
    };
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      const [ast, st, chk, alt, evt, mnt, inv, rdr, usr, aud] = await Promise.allSettled([
        fetchAssets(selectedSiteId && selectedSiteId !== 'ALL' ? { siteId: selectedSiteId } : undefined),
        fetchSites(),
        fetchCheckouts(),
        fetchAlerts(),
        fetchEvents(),
        fetchMaintenance(),
        fetchInventory(),
        fetchReaders(),
        fetchUsers(),
        fetchAuditLogs()
      ]);

      if (ast.status === 'fulfilled' && ast.value?.length > 0) setAssets(ast.value);
      if (st.status === 'fulfilled' && st.value?.length > 0) setSites(st.value);
      if (chk.status === 'fulfilled' && chk.value?.length > 0) setCheckouts(chk.value);
      if (alt.status === 'fulfilled' && alt.value?.length > 0) setAlerts(alt.value);
      if (evt.status === 'fulfilled' && evt.value?.length > 0) setReadEvents(evt.value);
      if (mnt.status === 'fulfilled' && mnt.value?.length > 0) setMaintenanceLogs(mnt.value);
      if (inv.status === 'fulfilled' && inv.value?.length > 0) setInventory(inv.value);
      if (rdr.status === 'fulfilled' && rdr.value?.length > 0) setReaders(rdr.value);
      if (usr.status === 'fulfilled' && usr.value?.length > 0) setUsers(usr.value);
      if (aud.status === 'fulfilled' && aud.value?.length > 0) setAuditLogs(aud.value);
    } catch (err) {
      console.warn('Failed to load API data:', err);
    }
  }, [selectedSiteId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Polling for live RFID events every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAllData();
    }, 4000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  // Manual Force Sync Handler
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const connected = await checkFirestoreConnection();
      setIsFirestoreOnline(connected);
      await loadAllData();
      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Manual sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handler functions with API primary and optional Firestore sync
  const handleSaveAsset = async (data: Partial<Asset>) => {
    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, data);
        try { await updateFirestoreAsset(editingAsset.id, data); } catch (_) {}
      } else {
        const created = await createAsset(data);
        if (created?.id) {
          try { await createFirestoreAsset({ ...data, id: created.id }); } catch (_) {}
        }
      }
    } catch (err: any) {
      console.error('Failed to save asset:', err);
      alert(`Error saving asset: ${err.message || String(err)}`);
    } finally {
      setEditingAsset(null);
      setAssetFormOpen(false);
      await loadAllData();
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (confirm('Are you sure you want to remove this asset from Aperture catalog?')) {
      try {
        await deleteAsset(id);
        try { await deleteFirestoreAsset(id); } catch (_) {}
      } catch (err: any) {
        console.error('Failed to delete asset:', err);
        alert(`Error deleting asset: ${err.message || String(err)}`);
      } finally {
        await loadAllData();
      }
    }
  };

  const handleCreateCheckout = async (data: { assetId: string; userId: string; jobId?: string; expectedReturnHours?: number; notes?: string }) => {
    try {
      await createCheckout(data);
      try { await createFirestoreCheckout(data); } catch (_) {}
    } catch (err: any) {
      console.error('Failed to create checkout:', err);
      alert(`Error creating checkout: ${err.message || String(err)}`);
    } finally {
      await loadAllData();
    }
  };

  const handleReturnCheckout = async (checkoutId: string, condition: string = 'GOOD') => {
    try {
      await returnCheckout(checkoutId, condition);
      try { await returnFirestoreCheckout(checkoutId, condition); } catch (_) {}
    } catch (err: any) {
      console.error('Failed to return checkout:', err);
    } finally {
      await loadAllData();
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await resolveAlert(id, currentUser.name);
      try { await resolveFirestoreAlert(id, currentUser.name); } catch (_) {}
    } catch (err: any) {
      console.error('Failed to resolve alert:', err);
    } finally {
      await loadAllData();
    }
  };

  const handleCreateMaintenance = async (data: Partial<MaintenanceLog>) => {
    try {
      await createMaintenance(data);
      try { await createFirestoreMaintenance(data); } catch (_) {}
    } catch (err: any) {
      console.error('Failed to create maintenance:', err);
      alert(`Error creating maintenance log: ${err.message || String(err)}`);
    } finally {
      await loadAllData();
    }
  };

  const handleUpdateInventoryQuantity = async (id: string, delta: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.quantityOnHand + delta);
    try {
      await updateInventory(id, { quantityOnHand: newQty });
      try { await updateFirestoreInventory(id, { quantityOnHand: newQty }); } catch (_) {}
    } catch (err: any) {
      console.error('Failed to update inventory:', err);
    } finally {
      await loadAllData();
    }
  };

  const handleBatchImportAssets = async (newAssetsList: Partial<Asset>[]) => {
    const res = await createAssetsBatch(newAssetsList);
    if (res?.importedAssets && res.importedAssets.length > 0) {
      await createFirestoreAssetsBatch(res.importedAssets);
    }
    await loadAllData();
  };

  // If URL query parameter or state specifies public view mode, render PublicAssetView
  if (publicAssetId) {
    return (
      <PublicAssetView
        assetId={publicAssetId}
        assets={assets}
        sites={sites}
        readEvents={readEvents}
        checkouts={checkouts}
        onExitPublicView={() => {
          setPublicAssetId(null);
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  const filteredAssets = selectedSiteId === 'ALL' ? assets : assets.filter(a => a.siteId === selectedSiteId);
  const filteredAlerts = selectedSiteId === 'ALL' ? alerts : alerts.filter(a => a.siteId === selectedSiteId);
  const filteredReadEvents = selectedSiteId === 'ALL' ? readEvents : readEvents.filter(e => e.siteId === selectedSiteId);
  const filteredCheckouts = selectedSiteId === 'ALL' ? checkouts : checkouts.filter(c => {
    const asset = assets.find(a => a.id === c.assetId);
    return asset && asset.siteId === selectedSiteId;
  });
  const filteredInventory = selectedSiteId === 'ALL' ? inventory : inventory.filter(i => i.siteId === selectedSiteId);
  const filteredMaintenanceLogs = selectedSiteId === 'ALL' ? maintenanceLogs : maintenanceLogs.filter(m => {
    const asset = assets.find(a => a.id === m.assetId);
    return asset && asset.siteId === selectedSiteId;
  });
  const filteredReaders = selectedSiteId === 'ALL' ? readers : readers.filter(r => r.siteId === selectedSiteId);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Platform Top Navigation Header */}
      <Header
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSelectSite={setSelectedSiteId}
        alerts={alerts}
        onOpenAlertsModal={() => setActiveTab('geofencing')}
        onOpenHardwareDrawer={() => setHardwareDrawerOpen(true)}
        onOpenMobileView={() => setActiveTab('mobile')}
        currentUser={currentUser}
        onSwitchUserRole={(u) => setCurrentUser(u)}
        allUsers={users}
        isStreaming={isStreaming}
        offlineMode={offlineMode}
        isFirestoreOnline={isFirestoreOnline}
        onManualSync={handleManualSync}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
        onNavigateTab={setActiveTab}
      />

      {/* Main Body Area: Sidebar Nav + Tab Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unresolvedAlertsCount={alerts.filter(a => !a.resolved).length}
        />

        {/* Dynamic View Tab Body */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden space-y-6">
          
          {activeTab === 'dashboard' && (
            <DashboardView
              assets={filteredAssets}
              alerts={filteredAlerts}
              readEvents={filteredReadEvents}
              sites={sites}
              checkouts={filteredCheckouts}
              onNavigateTab={setActiveTab}
              onOpenAssetDetail={setInspectingAsset}
              onOpenAlertsModal={() => setActiveTab('geofencing')}
            />
          )}

          {activeTab === 'users' && (
            <UserPortalView
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              users={users}
              sites={sites}
              checkouts={filteredCheckouts}
              maintenanceLogs={filteredMaintenanceLogs}
              auditLogs={auditLogs}
              onNavigateTab={setActiveTab}
              onReturnCheckout={handleReturnCheckout}
            />
          )}

          {activeTab === 'assets' && (
            <AssetRegistryView
              assets={filteredAssets}
              sites={sites}
              onOpenRegisterModal={() => { setEditingAsset(null); setAssetFormOpen(true); }}
              onOpenDetailModal={setInspectingAsset}
              onOpenQrModal={(a) => setQrModalAsset(a)}
              onFindRadar={setRadarAsset}
              onCheckoutAsset={() => setActiveTab('checkouts')}
              onEditAsset={(a) => { setEditingAsset(a); setAssetFormOpen(true); }}
              onDeleteAsset={handleDeleteAsset}
              onImportCsv={() => setCsvImportOpen(true)}
            />
          )}

          {activeTab === 'tracking' && (
            <LiveTrackingMapView
              assets={filteredAssets}
              sites={sites}
              readers={filteredReaders}
              selectedSiteId={selectedSiteId}
              onSelectSite={setSelectedSiteId}
              onOpenAssetDetail={setInspectingAsset}
              onOpenQrModal={(a) => setQrModalAsset(a)}
              onFindRadar={setRadarAsset}
              onRefreshData={loadAllData}
            />
          )}

          {activeTab === 'checkouts' && (
            <CheckoutCustodyView
              checkouts={filteredCheckouts}
              assets={filteredAssets}
              users={users}
              onCreateCheckout={handleCreateCheckout}
              onReturnCheckout={handleReturnCheckout}
            />
          )}

          {activeTab === 'geofencing' && (
            <GeofenceAlertsView
              alerts={filteredAlerts}
              onResolveAlert={handleResolveAlert}
              onOpenSettings={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'ai_behavior' && (
            <AiEventBehaviorView
              events={filteredReadEvents}
              assets={filteredAssets}
              onRefreshData={loadAllData}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={filteredInventory}
              onUpdateQuantity={handleUpdateInventoryQuantity}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView
              maintenanceLogs={filteredMaintenanceLogs}
              assets={filteredAssets}
              onCreateMaintenance={handleCreateMaintenance}
            />
          )}

          {activeTab === 'utilization' && (
            <UtilizationRentalView assets={filteredAssets} />
          )}

          {activeTab === 'hardware' && (
            <HardwareManagementView
              readers={filteredReaders}
              onUpdatePower={(id, power) => console.log('Power set:', id, power)}
              onFlushBuffer={loadAllData}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsAnalyticsView
              assets={filteredAssets}
              maintenanceLogs={filteredMaintenanceLogs}
              auditLogs={auditLogs}
            />
          )}

          {activeTab === 'mobile' && (
            <MobileFieldScannerView
              assets={filteredAssets}
              users={users}
              checkouts={filteredCheckouts}
              onScanCheckout={async (assetId, userId) => {
                await createCheckout({ assetId, userId, jobId: 'job-mobile-field' });
                loadAllData();
              }}
              onScanReturn={async (checkoutId) => {
                await returnCheckout(checkoutId, 'Good');
                loadAllData();
              }}
            />
          )}

          {activeTab === 'playback' && (
            <PlaybackView assets={filteredAssets} />
          )}

          {activeTab === 'audit' && (
            <AuditLogsView auditLogs={auditLogs} />
          )}

          {activeTab === 'developer' && (
            <DeveloperApiView />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              sites={sites}
              currentUser={currentUser}
              onRefreshAll={loadAllData}
              onNavigateTab={(tab: TabType | string) => setActiveTab(tab as TabType)}
            />
          )}

        </main>

      </div>

      {/* Global Modals & Drawers */}
      <AssetFormModal
        isOpen={assetFormOpen}
        onClose={() => setAssetFormOpen(false)}
        onSubmit={handleSaveAsset}
        sites={sites}
        initialAsset={editingAsset}
      />

      <AssetDetailModal
        asset={inspectingAsset}
        onClose={() => setInspectingAsset(null)}
        readEvents={readEvents}
        checkouts={checkouts}
        onFindRadar={setRadarAsset}
        onCheckout={() => setActiveTab('checkouts')}
        onEdit={(a) => { setEditingAsset(a); setAssetFormOpen(true); }}
        onOpenQrModal={(a) => setQrModalAsset(a)}
      />

      <QrCodeModal
        asset={qrModalAsset}
        onClose={() => setQrModalAsset(null)}
        onOpenPublicView={(id) => {
          setQrModalAsset(null);
          setPublicAssetId(id);
        }}
      />

      <FindAssetRadarModal
        asset={radarAsset}
        onClose={() => setRadarAsset(null)}
      />

      <HardwareSimulatorDrawer
        isOpen={hardwareDrawerOpen}
        onClose={() => setHardwareDrawerOpen(false)}
        isStreaming={isStreaming}
        offlineMode={offlineMode}
        onRefreshAll={loadAllData}
      />

      <CsvImportModal
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        sites={sites}
        onImportBatch={handleBatchImportAssets}
      />

    </div>
  );
}
