"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { EVACUATION_CENTERS } from "@/lib/evacuation-centers";
import { findNearestOpenCenter } from "@/lib/evacuation-utils";
import { useGeolocation } from "@/lib/useGeolocation";
import CapacityLegend from "@/components/CapacityLegend";
import NearestCenterBanner from "@/components/NearestCenterBanner";

// Leaflet touches `window` at import time, so it can only render client-side.
const EvacuationMap = dynamic(() => import("@/components/EvacuationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
      Loading map…
    </div>
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

  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Evacuation Centers</h1>
        <CapacityLegend />
      </div>

      <NearestCenterBanner geo={geo} nearest={nearest} />

      <div className="min-h-[420px] flex-1 overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
        <EvacuationMap
          centers={EVACUATION_CENTERS}
          userLocation={userLocation}
          nearestOpenCenterId={nearest?.id ?? null}
        />
      </div>
    </div>
  );
}
