import { dequeueReport, getQueuedReports } from "@/lib/offlineQueue";

/**
 * Story 3.2 — infra half: detect reconnection and flush the offline queue.
 *
 * Primary mechanism: a `window.addEventListener("online", ...)` listener,
 * which is the "event listener" branch of the AC and works in every
 * browser (unlike the Background Sync API, which Safari/iOS doesn't
 * support — a real risk for a citizen-facing PWA). We also run a flush on
 * load and poll lightly while the tab is open, in case a device regains a
 * usable connection without firing a clean "online" event (common on flaky
 * mobile networks).
 *
 * Enhancement path noted in the README: register a Background Sync event in
 * the service worker for the case where the tab isn't open at all when
 * connectivity returns.
 */

const FLUSH_ENDPOINT = "/api/reports";
const POLL_INTERVAL_MS = 30_000;

let flushing = false;
let started = false;

export type FlushListener = (info: { queued: number; flushed: number; failed: number }) => void;
const listeners = new Set<FlushListener>();

export function onFlush(listener: FlushListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function flushQueue(): Promise<void> {
  if (flushing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  flushing = true;
  const queued = await getQueuedReports().catch(() => []);
  let flushed = 0;
  let failed = 0;

  for (const payload of queued) {
    try {
      const res = await fetch(FLUSH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await dequeueReport(payload.id);
        flushed += 1;
      } else if (res.status === 400 || res.status === 413) {
        // The server rejected this report itself; resending the same data
        // would fail forever (and re-upload its photos every 30s).
        console.warn(`Dropping queued report ${payload.id}: server responded ${res.status}`);
        await dequeueReport(payload.id);
        failed += 1;
      } else {
        failed += 1;
      }
    } catch {
      // Still offline, or the request failed in flight — leave it queued
      // and stop this pass; the next online event or poll tick retries.
      failed += 1;
      break;
    }
  }

  flushing = false;
  listeners.forEach((l) => l({ queued: queued.length, flushed, failed }));
}

/** Call once, e.g. from a top-level client component mounted in the root layout. */
export function initOfflineSync(): () => void {
  if (started) return () => {};
  started = true;

  const handleOnline = () => {
    void flushQueue();
  };

  window.addEventListener("online", handleOnline);
  // Fires once on mount in case the tab was already online with a stale queue.
  void flushQueue();

  const interval = window.setInterval(() => {
    void flushQueue();
  }, POLL_INTERVAL_MS);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.clearInterval(interval);
    started = false;
  };
}
