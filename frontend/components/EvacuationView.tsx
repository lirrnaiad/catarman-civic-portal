"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { EVACUATION_CENTERS } from "@/lib/evacuation-centers";
import { findNearestOpenCenter, getStatusCounts } from "@/lib/evacuation-utils";
import { useGeolocation } from "@/lib/useGeolocation";
import CapacityLegend from "@/components/CapacityLegend";
import NearestCenterBanner from "@/components/NearestCenterBanner";

// Leaflet touches `window` at import time, so it can only render client-side.
const EvacuationMap = dynamic(() => import("@/components/EvacuationMap"), {
  ssr: false,
  loading: () => (
    <div className="skeleton h-full w-full" aria-label="Loading map" />
  ),
});

export default function EvacuationView() {
  const geo = useGeolocation();
  const userLat = geo.status === "granted" ? geo.lat : null;
  const userLng = geo.status === "granted" ? geo.lng : null;

  const userLocation = useMemo(
    () => (userLat !== null && userLng !== null ? { lat: userLat, lng: userLng } : null),
    [userLat, userLng],
  );

  const nearest = useMemo(() => {
    if (!userLocation) return null;
    return findNearestOpenCenter(userLocation, EVACUATION_CENTERS);
  }, [userLocation]);

  const statusCounts = useMemo(() => getStatusCounts(EVACUATION_CENTERS), []);

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-civic">
              Catarman, Northern Samar · MDRRMO
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Evacuation Centers
            </h1>
          </div>
          <CapacityLegend counts={statusCounts} />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-3 p-4 sm:p-6">
        <NearestCenterBanner geo={geo} nearest={nearest} />

        {/*
          Leaflet's internal panes are absolutely-positioned, so they can't
          establish an auto-height on a relatively-sized ancestor. This div
          needs a genuinely *definite* height (not just flex-grow + min-height
          chained up through body's min-h-full) or Leaflet measures a
          near-zero box and only renders a sliver of tiles. h-[70vh] is
          definite regardless of ancestor flex sizing.
        */}
        <div className="h-[70vh] min-h-[420px] overflow-hidden rounded-lg border border-slate-200 shadow-sm">
          <EvacuationMap
            centers={EVACUATION_CENTERS}
            userLocation={userLocation}
            nearestOpenCenterId={nearest?.id ?? null}
          />
        </div>
      </div>
    </div>
  );
}
