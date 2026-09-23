import type { ReportPayload } from "./types";

/**
 * Offline submission queue (Story 3.2).
 *
 * Split of responsibilities per the PRD:
 * - Reporter side (ReportForm.tsx): calls `enqueueReport` when a live POST
 *   fails because the device is offline, and shows the "Queued" state.
 * - Infra side (offlineSync.ts): detects reconnection and calls
 *   `flushQueue`, which reads everything here and re-POSTs it.
 *
 * Uses raw IndexedDB rather than a dependency — the API is small enough
 * that pulling in a library isn't worth it here. Every queued item is a
 * plain, JSON-serializable ReportPayload (photos are already base64 data
 * URLs), so no Blob/File handling is needed in the queue itself.
 */

const DB_NAME = "civic-report-offline";
const STORE_NAME = "queued-reports";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueReport(payload: ReportPayload): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(payload);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getQueuedReports(): Promise<ReportPayload[]> {
  const db = await openDb();
  const result = await new Promise<ReportPayload[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as ReportPayload[]);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}

export async function dequeueReport(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getQueuedCount(): Promise<number> {
  const all = await getQueuedReports();
  return all.length;
}
