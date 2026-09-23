"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import type { EvacuationCenter } from "@/lib/evacuation-centers";
import { findNearestOpenCenter, spacesLeft, walkMinutes } from "@/lib/evacuation-utils";

const CACHE_KEY = "civic-centers-cache"; // written by CentersView

/**
 * Shown on the report form when someone picks Flood / Landslide: the moment
 * they're most likely to need shelter. Works offline from the last cached list.
 */
export default function NearestCenterHint({ location }: { location: { lat: number; lng: number } | null }) {
  const [centers, setCenters] = useState<EvacuationCenter[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fromCache = () => {
      try {
        return (JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null")?.centers ?? null) as EvacuationCenter[] | null;
      } catch {
        return null;
      }
    };
    fetch("/api/centers")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (cancelled) return;
        setCenters(d.centers);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ centers: d.centers, at: Date.now() }));
        } catch {}
      })
      .catch(() => !cancelled && setCenters(fromCache()));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!centers || !location) return null;
  const nearest = findNearestOpenCenter(location, centers);
  if (!nearest) return null;

  return (
    <Link
      href="/evacuation"
      className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-3 text-green-900 transition-transform active:scale-[0.99]"
      style={{ animation: "civicFadeUp 320ms ease-out both" }}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
        <Icon name="shield" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 text-sm leading-snug">
        <strong className="block">Need shelter? Nearest open center:</strong>
        {nearest.name} · {nearest.distanceKm.toFixed(1)} km (~{walkMinutes(nearest.distanceKm)} min walk) ·{" "}
        {spacesLeft(nearest).toLocaleString()} spaces left
      </span>
      <Icon name="chevronRight" className="h-5 w-5 shrink-0" />
    </Link>
  );
}
