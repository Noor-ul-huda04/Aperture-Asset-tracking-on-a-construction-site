import { Asset, Checkout, Alert, ReadEvent, MaintenanceLog, Reader, Site, InventoryItem, User, AuditLog } from '../types';
import { secureFetch } from '../lib/firebase';

const API_BASE = '/api';

/**
 * Safely handles API responses and ensures valid JSON payload parsing.
 * Converts any non-JSON or HTML error responses into descriptive Error instances.
 */
async function safeJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status} ${res.statusText}`;
    if (contentType.includes('application/json')) {
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (_) {
        // Fallback
      }
    } else {
      const text = await res.text();
      errorMessage = `Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}`;
    }
    throw new Error(errorMessage);
  }

  if (contentType.includes('application/json')) {
    return res.json() as Promise<T>;
  }

  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch (_) {
    throw new Error(`Expected JSON from API endpoint, received non-JSON payload: ${text.slice(0, 100)}`);
  }
}

export async function fetchHealth() {
  const res = await secureFetch(`${API_BASE}/health`);
  return safeJson<any>(res);
}

export async function fetchSummary() {
  const res = await secureFetch(`${API_BASE}/reports/summary`);
  return safeJson<any>(res);
}

export async function fetchAssets(params?: { siteId?: string; category?: string; status?: string; search?: string }): Promise<Asset[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await secureFetch(`${API_BASE}/assets?${query}`);
  return safeJson<Asset[]>(res);
}

export async function createAsset(data: Partial<Asset>): Promise<Asset> {
  const res = await secureFetch(`${API_BASE}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return safeJson<Asset>(res);
}

export async function createAssetsBatch(assets: Partial<Asset>[]): Promise<{ count: number; importedAssets: Asset[] }> {
  const res = await secureFetch(`${API_BASE}/assets/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assets })
  });
  return safeJson<{ count: number; importedAssets: Asset[] }>(res);
}

export async function updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
  const res = await secureFetch(`${API_BASE}/assets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return safeJson<Asset>(res);
}

export async function deleteAsset(id: string): Promise<{ id: string }> {
  const res = await secureFetch(`${API_BASE}/assets/${id}`, { method: 'DELETE' });
  return safeJson<{ id: string }>(res);
}

export async function fetchCheckouts(): Promise<Checkout[]> {
  const res = await secureFetch(`${API_BASE}/checkouts`);
  return safeJson<Checkout[]>(res);
}

export async function createCheckout(data: { assetId: string; userId: string; jobId?: string; expectedReturnHours?: number; notes?: string; photoUrl?: string }): Promise<Checkout> {
  const res = await secureFetch(`${API_BASE}/checkouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return safeJson<Checkout>(res);
}

export async function returnCheckout(checkoutId: string, condition: string): Promise<Checkout> {
  const res = await secureFetch(`${API_BASE}/checkouts/${checkoutId}/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ condition })
  });
  return safeJson<Checkout>(res);
}

export async function fetchEvents(): Promise<ReadEvent[]> {
  const res = await secureFetch(`${API_BASE}/events`);
  return safeJson<ReadEvent[]>(res);
}

export async function simulateScan(epc: string, readerId: string, rssi?: number): Promise<{ event: ReadEvent; assetUpdated: boolean }> {
  const res = await secureFetch(`${API_BASE}/events/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ epc, readerId, rssi })
  });
  return safeJson<{ event: ReadEvent; assetUpdated: boolean }>(res);
}

export async function fetchAlerts(): Promise<Alert[]> {
  const res = await secureFetch(`${API_BASE}/alerts`);
  return safeJson<Alert[]>(res);
}

export async function resolveAlert(id: string, resolvedBy: string): Promise<Alert> {
  const res = await secureFetch(`${API_BASE}/alerts/${id}/resolve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolvedBy })
  });
  return safeJson<Alert>(res);
}

export async function fetchSites(): Promise<Site[]> {
  const res = await secureFetch(`${API_BASE}/sites`);
  return safeJson<Site[]>(res);
}

export async function fetchReaders(): Promise<Reader[]> {
  const res = await secureFetch(`${API_BASE}/readers`);
  return safeJson<Reader[]>(res);
}

export async function fetchMaintenance(): Promise<MaintenanceLog[]> {
  const res = await secureFetch(`${API_BASE}/maintenance`);
  return safeJson<MaintenanceLog[]>(res);
}

export async function createMaintenance(data: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
  const res = await secureFetch(`${API_BASE}/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return safeJson<MaintenanceLog>(res);
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const res = await secureFetch(`${API_BASE}/inventory`);
  return safeJson<InventoryItem[]>(res);
}

export async function updateInventory(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
  const res = await secureFetch(`${API_BASE}/inventory/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return safeJson<InventoryItem>(res);
}

export async function fetchUsers(): Promise<User[]> {
  const res = await secureFetch(`${API_BASE}/users`);
  return safeJson<User[]>(res);
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await secureFetch(`${API_BASE}/audit-logs`);
  return safeJson<AuditLog[]>(res);
}

export async function toggleHardwareStream(offlineBufferMode?: boolean) {
  const res = await secureFetch(`${API_BASE}/hardware/stream/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offlineBufferMode })
  });
  return safeJson<any>(res);
}
