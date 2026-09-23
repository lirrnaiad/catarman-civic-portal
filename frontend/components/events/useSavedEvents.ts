"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "civic-saved-events";
const CHANGE = "civic-saved-events-change";

function read(): number[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

/**
 * Events the citizen bookmarked, kept on this device only (no account needed).
 * Starts empty on the server render and loads after mount, so hydration matches;
 * stays in sync across the list and detail pages.
 */
export function useSavedEvents() {
  const [saved, setSaved] = useState<number[]>([]);

  useEffect(() => {
    const sync = () => setSaved(read());
    sync();
    window.addEventListener(CHANGE, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: number) => {
    const current = read();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Private mode / storage blocked: keep it for this page view only.
    }
    setSaved(next);
    window.dispatchEvent(new Event(CHANGE));
  }, []);

  return { saved, isSaved: (id: number) => saved.includes(id), toggle };
}
