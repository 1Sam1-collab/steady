// Shrinks photos and keeps them in IndexedDB, on this device only.
const DB_NAME = 'steady-photos';
const STORE = 'photos';
let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('no-indexeddb')); return; }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(mode, fn) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const result = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(result && result.result !== undefined ? result.result : undefined);
    t.onerror = () => reject(t.error);
  }));
}

export function shrink(file, maxSide = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('shrink-failed'))), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad-image')); };
    img.src = url;
  });
}

export async function savePhoto(file, productId, week) {
  const blob = await shrink(file);
  const id = `${productId}-w${week}-${Date.now()}`;
  await tx('readwrite', s => s.put({ id, productId, week, blob }));
  return id;
}

export async function getPhoto(id) {
  if (!id) return null;
  try {
    const rec = await tx('readonly', s => s.get(id));
    return rec ? rec.blob : null;
  } catch (e) {
    return null;
  }
}

export async function deletePhotos(ids) {
  if (!ids || !ids.length) return;
  try { await tx('readwrite', s => ids.forEach(id => s.delete(id))); } catch (e) { /* ignore */ }
}

export async function deleteAllPhotos() {
  try { await tx('readwrite', s => s.clear()); } catch (e) { /* ignore */ }
}
