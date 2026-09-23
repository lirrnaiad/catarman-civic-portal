"use client";

import type { GeolocationState } from "@/lib/useGeolocation";
import type { EvacuationCenter } from "@/lib/evacuation-centers";

export default function NearestCenterBanner({
  geo,
  nearest,
}: {
  geo: GeolocationState;
  nearest: (EvacuationCenter & { distanceKm: number }) | null;
}) {
  if (geo.status === "idle" || geo.status === "loading") {
    return (
      <div className="rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
        Locating you to find the nearest open evacuation center…
      </div>
    );
  }

  if (geo.status === "unsupported") {
    return (
      <div className="rounded-md bg-zinc-100 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        Your browser doesn&apos;t support location services. Showing all
        centers from the Poblacion.
      </div>
    );
  }

  if (geo.status === "denied") {
    return (
      <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
        Location permission denied — showing all centers from the Poblacion.
        Enable location to see the nearest open center to you.
      </div>
    );
  }

  if (!nearest) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-900 dark:bg-red-950 dark:text-red-100">
        Every designated evacuation center is currently at capacity. Contact
        MDRRMO for the next open overflow site.
      </div>
    );
  }

  return (
    <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-900 dark:bg-green-950 dark:text-green-100">
      Nearest open center: <strong>{nearest.name}</strong> (Brgy.{" "}
      {nearest.barangay}) — {nearest.distanceKm.toFixed(1)} km away,{" "}
      {(nearest.capacity - nearest.currentOccupancy).toLocaleString()} slots
      free.
    </div>
  );
}
