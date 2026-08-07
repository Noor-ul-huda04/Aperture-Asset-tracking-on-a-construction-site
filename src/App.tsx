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
import { ApiTesterModal } from './components/ApiTesterModal';
import { HardwareSimulatorDrawer } from './components/HardwareSimulatorDrawer';

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
  updateFirestoreAsset,
  deleteFirestoreAsset,
  createFirestoreCheckout,
  returnFirestoreCheckout,
  resolveFirestoreAlert,
  createFirestoreMaintenance,
  updateFirestoreInventory
} from './services/firestoreService';

import { Asset, Site, Checkout, Alert, ReadEvent, MaintenanceLog, InventoryItem, Reader, User, AuditLog } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('ALL');

  // Core Data Collections State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [readEvents, setReadEvents] = useState<ReadEvent[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // System Hardware Stream State
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);

  // Modals & Drawers
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [inspectingAsset, setInspectingAsset] = useState<Asset | null>(null);
  const [radarAsset, setRadarAsset] = useState<Asset | null>(null);
  const [hardwareDrawerOpen, setHardwareDrawerOpen] = useState(false);
  const [apiTesterOpen, setApiTesterOpen] = useState(false);

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
      const [ast, st, chk, alt, evt, mnt, inv, rdr, usr, aud] = await Promise.all([
        fetchAssets({ siteId: selectedSiteId !== 'ALL' ? selectedSiteId : undefined }),
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

      setAssets(ast);
      setSites(st);
      setCheckouts(chk);
      setAlerts(alt);
      setReadEvents(evt);
      setMaintenanceLogs(mnt);
      setInventory(inv);
      setReaders(rdr);
      if (usr.length > 0) setUsers(usr);
      setAuditLogs(aud);
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

  // Handler functions with Firestore synchronization
  const handleSaveAsset = async (data: Partial<Asset>) => {
    if (editingAsset) {
      await Promise.all([
        updateAsset(editingAsset.id, data),
        updateFirestoreAsset(editingAsset.id, data)
      ]);
    } else {
      const created = await createAsset(data);
      await createFirestoreAsset({ ...data, id: created.id });
    }
    setEditingAsset(null);
    loadAllData();
  };

  const handleDeleteAsset = async (id: string) => {
    if (confirm('Are you sure you want to remove this asset from Aperture catalog?')) {
      await Promise.all([
        deleteAsset(id),
        deleteFirestoreAsset(id)
      ]);
      loadAllData();
    }
  };

  const handleCreateCheckout = async (data: { assetId: string; userId: string; jobId?: string; expectedReturnHours?: number; notes?: string }) => {
    await Promise.all([
      createCheckout(data),
      createFirestoreCheckout(data)
    ]);
    loadAllData();
  };

  const handleReturnCheckout = async (checkoutId: string, condition: string) => {
    await Promise.all([
      returnCheckout(checkoutId, condition),
      returnFirestoreCheckout(checkoutId, condition)
    ]);
    loadAllData();
  };

  const handleResolveAlert = async (id: string) => {
    await Promise.all([
      resolveAlert(id, currentUser.name),
      resolveFirestoreAlert(id, currentUser.name)
    ]);
    loadAllData();
  };

  const handleCreateMaintenance = async (data: Partial<MaintenanceLog>) => {
    await Promise.all([
      createMaintenance(data),
      createFirestoreMaintenance(data)
    ]);
    loadAllData();
  };

  const handleUpdateInventoryQuantity = async (id: string, delta: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.quantityOnHand + delta);
    await Promise.all([
      updateInventory(id, { quantityOnHand: newQty }),
      updateFirestoreInventory(id, { quantityOnHand: newQty })
    ]);
    loadAllData();
  };

  const handleImportCsvSimulation = () => {
    alert('CSV Batch Import Simulation: Successfully parsed and registered 12 new UHF RFID tagged assets.');
    loadAllData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      
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
              assets={assets}
              alerts={alerts}
              readEvents={readEvents}
              sites={sites}
              checkouts={checkouts}
              onNavigateTab={setActiveTab}
              onOpenAssetDetail={setInspectingAsset}
              onOpenAlertsModal={() => setActiveTab('geofencing')}
            />
          )}

          {activeTab === 'assets' && (
            <AssetRegistryView
              assets={assets}
              sites={sites}
              onOpenRegisterModal={() => { setEditingAsset(null); setAssetFormOpen(true); }}
              onOpenDetailModal={setInspectingAsset}
              onFindRadar={setRadarAsset}
              onCheckoutAsset={() => setActiveTab('checkouts')}
              onEditAsset={(a) => { setEditingAsset(a); setAssetFormOpen(true); }}
              onDeleteAsset={handleDeleteAsset}
              onImportCsv={handleImportCsvSimulation}
            />
          )}

          {activeTab === 'tracking' && (
            <LiveTrackingMapView
              assets={assets}
              sites={sites}
              readers={readers}
              selectedSiteId={selectedSiteId}
              onSelectSite={setSelectedSiteId}
              onOpenAssetDetail={setInspectingAsset}
              onFindRadar={setRadarAsset}
            />
          )}

          {activeTab === 'checkouts' && (
            <CheckoutCustodyView
              checkouts={checkouts}
              assets={assets}
              users={users}
              onCreateCheckout={handleCreateCheckout}
              onReturnCheckout={handleReturnCheckout}
            />
          )}

          {activeTab === 'geofencing' && (
            <GeofenceAlertsView
              alerts={alerts}
              onResolveAlert={handleResolveAlert}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              onUpdateQuantity={handleUpdateInventoryQuantity}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView
              maintenanceLogs={maintenanceLogs}
              assets={assets}
              onCreateMaintenance={handleCreateMaintenance}
            />
          )}

          {activeTab === 'utilization' && (
            <UtilizationRentalView assets={assets} />
          )}

          {activeTab === 'hardware' && (
            <HardwareManagementView
              readers={readers}
              onUpdatePower={(id, power) => console.log('Power set:', id, power)}
              onFlushBuffer={loadAllData}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsAnalyticsView
              assets={assets}
              maintenanceLogs={maintenanceLogs}
              auditLogs={auditLogs}
            />
          )}

          {activeTab === 'mobile' && (
            <MobileFieldScannerView
              assets={assets}
              users={users}
              checkouts={checkouts}
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

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200">
                <h2 className="font-bold text-lg text-white font-mono">Aperture REST API Specification</h2>
                <p className="text-xs text-slate-400 mt-1">Single ingestion REST endpoints for LLRP UHF Hardware Middleware</p>
                
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setApiTesterOpen(true)}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg font-mono"
                  >
                    Launch Interactive API POST Tester
                  </button>
                </div>
              </div>
            </div>
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
      />

      <FindAssetRadarModal
        asset={radarAsset}
        onClose={() => setRadarAsset(null)}
      />

      <ApiTesterModal
        isOpen={apiTesterOpen}
        onClose={() => setApiTesterOpen(false)}
        onRefreshAll={loadAllData}
      />

      <HardwareSimulatorDrawer
        isOpen={hardwareDrawerOpen}
        onClose={() => setHardwareDrawerOpen(false)}
        isStreaming={isStreaming}
        offlineMode={offlineMode}
        onRefreshAll={loadAllData}
      />

    </div>
  );
}
