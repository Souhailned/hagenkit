// lib/editor/assets/asset-storage.ts
// IndexedDB-based asset storage for uploaded 3D models (GLTF/GLB).
// Stores binary blobs keyed by asset ID, enabling offline-first usage.
//
// Assets are stored with the "asset://" protocol prefix when referenced
// in node.src fields. This module handles the raw storage; see
// use-asset-url.ts for resolving asset:// URLs to blob URLs.

const DB_NAME = "horecagrond-assets";
const STORE_NAME = "models";
const DB_VERSION = 1;

// ---------------------------------------------------------------------------
// Internal: open / create the database
// ---------------------------------------------------------------------------

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Save a 3D model blob to IndexedDB under the given ID.
 * Overwrites any existing blob with the same ID.
 */
export async function saveAsset(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(blob, id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Load a 3D model blob from IndexedDB.
 * Returns null if the asset does not exist.
 */
export async function loadAsset(id: string): Promise<Blob | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Delete a 3D model blob from IndexedDB.
 */
export async function deleteAsset(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * List all stored asset IDs.
 */
export async function listAssets(): Promise<string[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAllKeys();
    request.onsuccess = () =>
      resolve((request.result as IDBValidKey[]).map(String));
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}
