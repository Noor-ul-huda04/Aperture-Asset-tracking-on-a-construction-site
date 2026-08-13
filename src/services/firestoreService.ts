import {
  collection,
  doc,
  getDocs,
  getDoc,
  getDocFromCache,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, firebaseConfig } from '../lib/firebase';
import { Asset, Site, Checkout, Alert, ReadEvent, MaintenanceLog, InventoryItem, Reader, User, AuditLog } from '../types';
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
} from '../data/initialData';

// Helper to check live Firestore server connection
export async function checkFirestoreConnection(): Promise<boolean> {
  if (!navigator.onLine) return false;
  try {
    const testDoc = doc(db, 'sites', 'site-1');
    const snap = await getDoc(testDoc);
    return snap.exists();
  } catch (_err) {
    try {
      const cacheSnap = await getDocFromCache(doc(db, 'sites', 'site-1'));
      return cacheSnap.exists();
    } catch (_cacheErr) {
      return false;
    }
  }
}

// Utility to recursively strip undefined properties before passing to Firestore
function cleanFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// Seed initial data into Firestore if collection is empty
export async function seedInitialFirestoreData() {
  try {
    const assetsSnap = await getDocs(collection(db, 'assets'));
    if (assetsSnap.empty) {
      console.log('Seeding initial assets to Firestore...');
      const batch = writeBatch(db);
      
      INITIAL_ASSETS.forEach(item => {
        batch.set(doc(db, 'assets', item.id), cleanFirestoreData(item));
      });
      INITIAL_SITES.forEach(item => {
        batch.set(doc(db, 'sites', item.id), cleanFirestoreData(item));
      });
      INITIAL_USERS.forEach(item => {
        batch.set(doc(db, 'users', item.id), cleanFirestoreData(item));
      });
      INITIAL_READERS.forEach(item => {
        batch.set(doc(db, 'readers', item.id), cleanFirestoreData(item));
      });
      INITIAL_CHECKOUTS.forEach(item => {
        batch.set(doc(db, 'checkouts', item.id), cleanFirestoreData(item));
      });
      INITIAL_MAINTENANCE_LOGS.forEach(item => {
        batch.set(doc(db, 'maintenanceLogs', item.id), cleanFirestoreData(item));
      });
      INITIAL_ALERTS.forEach(item => {
        batch.set(doc(db, 'alerts', item.id), cleanFirestoreData(item));
      });
      INITIAL_INVENTORY.forEach(item => {
        batch.set(doc(db, 'inventory', item.id), cleanFirestoreData(item));
      });
      INITIAL_READ_EVENTS.forEach(item => {
        batch.set(doc(db, 'readEvents', item.id), cleanFirestoreData(item));
      });
      INITIAL_AUDIT_LOGS.forEach(item => {
        batch.set(doc(db, 'auditLogs', item.id), cleanFirestoreData(item));
      });

      await batch.commit();
      console.log('Initial Firestore database successfully seeded!');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seedData');
  }
}

// Assets
export function subscribeAssets(callback: (assets: Asset[]) => void) {
  const path = 'assets';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Asset[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Asset);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function createFirestoreAsset(data: Partial<Asset>): Promise<Asset> {
  const path = 'assets';
  try {
    const newId = data.id || `ast-${Date.now()}`;
    const newAsset: Asset = {
      id: newId,
      name: data.name || 'New Asset',
      category: data.category || 'Tools',
      subCategory: data.subCategory || 'Hand Tools',
      serialNumber: data.serialNumber || `SN-${Math.floor(Math.random() * 90000) + 10000}`,
      tagEpc: data.tagEpc || `E2801191A00000${Date.now().toString().slice(-8)}`,
      siteId: data.siteId || 'site-1',
      siteName: data.siteName || 'Downtown High-Rise',
      zoneId: data.zoneId || 'zone-laydown',
      zoneName: data.zoneName || 'Laydown Yard A',
      rssi: data.rssi || -45,
      status: data.status || 'In Zone',
      cost: data.cost || 500,
      purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
      isRental: Boolean(data.isRental),
      rentalCostPerDay: data.rentalCostPerDay || 0,
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
      model: data.model || 'MOD-100',
      manufacturer: data.manufacturer || 'DeWalt',
      lastSeenAt: new Date().toISOString(),
      lastReaderId: data.lastReaderId || 'rdr-101',
      condition: data.condition || 'Good'
    };
    await setDoc(doc(db, path, newId), cleanFirestoreData(newAsset));
    return newAsset;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function createFirestoreAssetsBatch(assetsList: Asset[]): Promise<void> {
  const path = 'assets';
  try {
    const batch = writeBatch(db);
    assetsList.forEach(asset => {
      batch.set(doc(db, path, asset.id), cleanFirestoreData(asset));
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateFirestoreAsset(id: string, data: Partial<Asset>): Promise<void> {
  const path = `assets/${id}`;
  try {
    await updateDoc(doc(db, 'assets', id), cleanFirestoreData(data));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreAsset(id: string): Promise<void> {
  const path = `assets/${id}`;
  try {
    await deleteDoc(doc(db, 'assets', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Checkouts
export function subscribeCheckouts(callback: (checkouts: Checkout[]) => void) {
  const path = 'checkouts';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Checkout[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Checkout);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function createFirestoreCheckout(data: {
  assetId: string;
  userId: string;
  jobId?: string;
  expectedReturnHours?: number;
  notes?: string;
}): Promise<Checkout> {
  const path = 'checkouts';
  try {
    // Fetch asset details
    const assetSnap = await getDoc(doc(db, 'assets', data.assetId));
    const asset = assetSnap.exists() ? (assetSnap.data() as Asset) : null;
    
    // Fetch user details
    const userSnap = await getDoc(doc(db, 'users', data.userId));
    const user = userSnap.exists() ? (userSnap.data() as User) : null;

    const newId = `chk-${Date.now()}`;
    const now = new Date();
    const expHours = data.expectedReturnHours || 8;
    const expected = new Date(now.getTime() + expHours * 3600 * 1000);

    const newCheckout: Checkout = {
      id: newId,
      assetId: data.assetId,
      assetName: asset ? asset.name : 'Unknown Equipment',
      assetCategory: asset ? asset.category : 'Tools',
      tagEpc: asset ? asset.tagEpc : 'EPC-UNKNOWN',
      userId: data.userId,
      userName: user ? user.name : 'Worker',
      badgeId: user ? user.badgeId : 'BDG-0000',
      jobId: data.jobId || 'job-1',
      jobName: 'Structural Concrete Pouring Phase 2',
      checkoutCondition: asset ? asset.condition : 'Good',
      checkoutTime: now.toISOString(),
      expectedReturn: expected.toISOString(),
      status: 'ACTIVE',
      notes: data.notes || ''
    };

    await setDoc(doc(db, path, newId), cleanFirestoreData(newCheckout));

    // Update asset status
    if (asset) {
      await updateDoc(doc(db, 'assets', data.assetId), cleanFirestoreData({
        status: 'Checked Out',
        lastSeenAt: now.toISOString()
      }));
    }

    return newCheckout;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function returnFirestoreCheckout(checkoutId: string, condition: string): Promise<void> {
  const path = `checkouts/${checkoutId}`;
  try {
    const chkSnap = await getDoc(doc(db, 'checkouts', checkoutId));
    if (chkSnap.exists()) {
      const chk = chkSnap.data() as Checkout;
      const now = new Date().toISOString();

      await updateDoc(doc(db, 'checkouts', checkoutId), cleanFirestoreData({
        status: 'RETURNED',
        actualReturn: now,
        returnCondition: condition as any
      }));

      // Reset asset status
      await updateDoc(doc(db, 'assets', chk.assetId), cleanFirestoreData({
        status: 'In Zone',
        lastSeenAt: now,
        condition: condition as any
      }));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Alerts
export function subscribeAlerts(callback: (alerts: Alert[]) => void) {
  const path = 'alerts';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Alert[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Alert);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function resolveFirestoreAlert(id: string, resolvedBy: string): Promise<void> {
  const path = `alerts/${id}`;
  try {
    await updateDoc(doc(db, 'alerts', id), cleanFirestoreData({
      resolved: true,
      resolvedBy,
      resolvedAt: new Date().toISOString()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Sites
export function subscribeSites(callback: (sites: Site[]) => void) {
  const path = 'sites';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Site[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Site);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Readers
export function subscribeReaders(callback: (readers: Reader[]) => void) {
  const path = 'readers';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Reader[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Reader);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Inventory
export function subscribeInventory(callback: (inventory: InventoryItem[]) => void) {
  const path = 'inventory';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: InventoryItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as InventoryItem);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function updateFirestoreInventory(id: string, data: Partial<InventoryItem>): Promise<void> {
  const path = `inventory/${id}`;
  try {
    await updateDoc(doc(db, 'inventory', id), cleanFirestoreData(data));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Maintenance
export function subscribeMaintenance(callback: (logs: MaintenanceLog[]) => void) {
  const path = 'maintenanceLogs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: MaintenanceLog[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as MaintenanceLog);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function createFirestoreMaintenance(data: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
  const path = 'maintenanceLogs';
  try {
    const newId = `mnt-${Date.now()}`;
    const newLog: MaintenanceLog = {
      id: newId,
      workOrderId: data.workOrderId || `WO-${Math.floor(Math.random() * 9000) + 1000}`,
      assetId: data.assetId || 'ast-101',
      assetName: data.assetName || 'Equipment',
      type: data.type || 'Preventive',
      technician: data.technician || 'Elena Rostova',
      date: data.date || new Date().toISOString().split('T')[0],
      scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
      cost: data.cost || 200,
      notes: data.notes || '',
      status: data.status || 'In Progress'
    };
    await setDoc(doc(db, path, newId), cleanFirestoreData(newLog));
    return newLog;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Read Events
export function subscribeReadEvents(callback: (events: ReadEvent[]) => void) {
  const path = 'readEvents';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ReadEvent[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ReadEvent);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Users
export function subscribeUsers(callback: (users: User[]) => void) {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: User[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as User);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function createFirestoreUser(userData: Partial<User>): Promise<User> {
  const path = 'users';
  try {
    const newId = userData.id || `usr-${Date.now()}`;
    const newUser: User = {
      id: newId,
      name: userData.name || 'New Site User',
      email: userData.email || 'user@apertureconst.com',
      role: userData.role || 'Field Worker',
      siteAccess: userData.siteAccess && userData.siteAccess.length > 0 ? userData.siteAccess : ['site-1'],
      badgeId: userData.badgeId || `BDG-${Math.floor(1000 + Math.random() * 9000)}`,
      avatarUrl: userData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: userData.phone || '+1 (555) 019-2831'
    };
    await setDoc(doc(db, path, newId), cleanFirestoreData(newUser));
    return newUser;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function updateFirestoreUser(userId: string, updates: Partial<User>): Promise<void> {
  const path = 'users';
  try {
    await updateDoc(doc(db, path, userId), cleanFirestoreData(updates));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${userId}`);
    throw error;
  }
}

export async function deleteFirestoreUser(userId: string): Promise<void> {
  const path = 'users';
  try {
    await deleteDoc(doc(db, path, userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${userId}`);
    throw error;
  }
}

export async function upsertFirestoreUser(user: User): Promise<void> {
  const path = 'users';
  try {
    await setDoc(doc(db, path, user.id), cleanFirestoreData(user), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${user.id}`);
    throw error;
  }
}

// Audit Logs
export function subscribeAuditLogs(callback: (logs: AuditLog[]) => void) {
  const path = 'auditLogs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: AuditLog[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as AuditLog);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}
