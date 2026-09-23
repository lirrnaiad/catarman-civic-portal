"use client";

import { useOnline } from "@/lib/useOnline";

/** Always-visible connection status, so the offline-first story is on screen. */
export default function ConnectionPill() {
  const online = useOnline();
  return (
    <span
      role="status"
      className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ${
        online ? "bg-green-50 text-green-800" : "bg-amber-100 text-amber-900"
      }`}
    >
      <span aria-hidden className={`h-2 w-2 rounded-full ${online ? "bg-green-600" : "bg-amber-600"}`} />
      {online ? "Online" : "Offline"}
    </span>
  );
}
