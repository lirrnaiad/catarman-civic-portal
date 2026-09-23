"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Alert from "@/components/Alert";
import { getQueuedCount } from "@/lib/offlineQueue";
import { initOfflineSync, onFlush } from "@/lib/offlineSync";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

const plural = (n: number) => (n === 1 ? "1 report" : `${n} reports`);

/**
 * Mounted once in the root layout. Starts the reconnect flush (Story 3.2,
 * infra half) and shows the PRD's "offline state transparency" banner:
 * offline notice, saved-report count, and a confirmation once they're sent.
 */
export default function OfflineSync() {
  // Server snapshot is "online" so the first client render matches the HTML.
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  const [queued, setQueued] = useState(0);
  const [justSent, setJustSent] = useState(0);

  useEffect(() => {
    const refreshCount = () => {
      getQueuedCount().then(setQueued, () => setQueued(0));
    };
    refreshCount();

    const stopSync = initOfflineSync();
    const stopListening = onFlush(({ flushed }) => {
      refreshCount();
      if (flushed > 0) setJustSent(flushed);
    });
    window.addEventListener("civic-report:queued", refreshCount);

    return () => {
      stopSync();
      stopListening();
      window.removeEventListener("civic-report:queued", refreshCount);
    };
  }, []);

  useEffect(() => {
    if (justSent === 0) return;
    const timer = window.setTimeout(() => setJustSent(0), 6000);
    return () => window.clearTimeout(timer);
  }, [justSent]);

  let banner = null;
  if (!online) {
    banner = (
      <Alert variant="warning">
        <strong>You&apos;re offline.</strong> Reports you submit are saved on this device and sent
        automatically when you reconnect.
        {queued > 0 && <> {plural(queued)} waiting to send.</>}
      </Alert>
    );
  } else if (queued > 0) {
    banner = <Alert variant="info">Back online. Sending {plural(queued)} saved on this device…</Alert>;
  } else if (justSent > 0) {
    banner = <Alert variant="success">{plural(justSent)} saved offline {justSent === 1 ? "was" : "were"} sent to the LGU.</Alert>;
  }

  if (!banner) return null;
  return <div className="sticky top-0 z-[1090] lg:top-14 mx-auto w-full max-w-5xl px-4 pt-3">{banner}</div>;
}
