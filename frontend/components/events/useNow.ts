"use client";

import { useEffect, useState } from "react";

/** Ticking clock for countdowns. Starts from the server's `initial` so hydration matches. */
export function useNow(initial: number, everyMs = 30_000): number {
  const [now, setNow] = useState(initial);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), everyMs);
    return () => window.clearInterval(t);
  }, [everyMs]);
  return now;
}
