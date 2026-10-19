// IndexedDB wrapper for chart persistence
// Database: chartcraft-db, Store: charts

export type ChartStatus = 'incomplete' | 'complete';

export interface SavedChart {
  id: string;
  title: string;
  composer: string;
  style: string;
  key: string;
  chordText: string;
  sourceUrl?: string;
  tempo?: number;
  status: ChartStatus;
  version: number;
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = 'chartcraft-db';
const DB_VERSION = 1;
const STORE_NAME = 'charts';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}

function generateId(): string {
  return crypto.randomUUID();
}

export async function getAllCharts(): Promise<SavedChart[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      // Sort by updatedAt descending (most recent first)
      const charts = request.result as SavedChart[];
      charts.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(charts);
    };
  });
}

export async function getChart(id: string): Promise<SavedChart | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function saveChart(
  chart: Omit<SavedChart, 'id' | 'createdAt' | 'updatedAt' | 'version'>
): Promise<string> {
  const db = await openDB();
  const now = Date.now();
  const newChart: SavedChart = {
    ...chart,
    id: generateId(),
    status: chart.status ?? 'incomplete',
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(newChart);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(newChart.id);
  });
}

export async function updateChart(
  id: string,
  updates: Partial<Omit<SavedChart, 'id' | 'createdAt' | 'version'>>
): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Get existing chart within the same transaction
    const getRequest = store.get(id);
    
    getRequest.onerror = () => reject(getRequest.error);
    getRequest.onsuccess = () => {
      const existing = getRequest.result as SavedChart | undefined;
      
      if (!existing) {
        reject(new Error(`Chart with id ${id} not found`));
        return;
      }
      
      const updatedChart: SavedChart = {
        ...existing,
        ...updates,
        version: (existing.version || 1) + 1,
        updatedAt: Date.now(),
      };
      
      const putRequest = store.put(updatedChart);
      putRequest.onerror = () => reject(putRequest.error);
      putRequest.onsuccess = () => resolve();
    };
  });
}

export async function deleteChart(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
