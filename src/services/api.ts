import { Asset, Checkout, Alert, ReadEvent, MaintenanceLog, Reader, Site, InventoryItem, User, AuditLog } from '../types';

const API_BASE = '/api/v1';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchSummary() {
  const res = await fetch(`${API_BASE}/reports/summary`);
  return res.json();
}

export async function fetchAssets(params?: { siteId?: string; category?: string; status?: string; search?: string }): Promise<Asset[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE}/assets?${query}`);
  return res.json();
}

export async function createAsset(data: Partial<Asset>): Promise<Asset> {
  const res = await fetch(`${API_BASE}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
  const res = await fetch(`${API_BASE}/assets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteAsset(id: string): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/assets/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchCheckouts(): Promise<Checkout[]> {
  const res = await fetch(`${API_BASE}/checkouts`);
  return res.json();
}

export async function createCheckout(data: { assetId: string; userId: string; jobId?: string; expectedReturnHours?: number; notes?: string; photoUrl?: string }): Promise<Checkout> {
  const res = await fetch(`${API_BASE}/checkouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function returnCheckout(checkoutId: string, condition: string): Promise<Checkout> {
  const res = await fetch(`${API_BASE}/checkouts/${checkoutId}/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ condition })
  });
  return res.json();
}

export async function fetchEvents(): Promise<ReadEvent[]> {
  const res = await fetch(`${API_BASE}/events`);
  return res.json();
}

export async function simulateScan(epc: string, readerId: string, rssi?: number): Promise<{ event: ReadEvent; assetUpdated: boolean }> {
  const res = await fetch(`${API_BASE}/events/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ epc, readerId, rssi })
  });
  return res.json();
}

export async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch(`${API_BASE}/alerts`);
  return res.json();
}

export async function resolveAlert(id: string, resolvedBy: string): Promise<Alert> {
  const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolvedBy })
  });
  return res.json();
}

export async function fetchSites(): Promise<Site[]> {
  const res = await fetch(`${API_BASE}/sites`);
  return res.json();
}

export async function fetchReaders(): Promise<Reader[]> {
  const res = await fetch(`${API_BASE}/readers`);
  return res.json();
}

export async function fetchMaintenance(): Promise<MaintenanceLog[]> {
  const res = await fetch(`${API_BASE}/maintenance`);
  return res.json();
}

export async function createMaintenance(data: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
  const res = await fetch(`${API_BASE}/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE}/inventory`);
  return res.json();
}

export async function updateInventory(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE}/inventory/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE}/audit-logs`);
  return res.json();
}

export async function toggleHardwareStream(offlineBufferMode?: boolean) {
  const res = await fetch(`${API_BASE}/hardware/stream/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offlineBufferMode })
  });
  return res.json();
}
