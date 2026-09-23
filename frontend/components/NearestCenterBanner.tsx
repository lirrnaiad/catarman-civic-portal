"use client";

import type { GeolocationState } from "@/lib/useGeolocation";
import type { EvacuationCenter } from "@/lib/evacuation-centers";
import Alert from "@/components/Alert";

export default function NearestCenterBanner({
  geo,
  nearest,
}: {
  geo: GeolocationState;
  nearest: (EvacuationCenter & { distanceKm: number }) | null;
}) {
  if (geo.status === "idle" || geo.status === "loading") {
    return (
      <Alert variant="info">
        Locating you to find the nearest open evacuation center…
      </Alert>
    );
  }

  if (geo.status === "unsupported") {
    return (
      <Alert variant="warning">
        Your browser doesn&apos;t support location services. Showing all
        centers from the Poblacion.
      </Alert>
    );
  }

  if (geo.status === "denied") {
    return (
      <Alert variant="warning">
        Location permission denied — showing all centers from the Poblacion.
        Enable location to see the nearest open center to you.
      </Alert>
    );
  }

  if (!nearest) {
    return (
      <Alert variant="danger">
        <span className="font-semibold">
          Every designated evacuation center is currently at capacity.
        </span>{" "}
        Contact MDRRMO for the next open overflow site.
      </Alert>
    );
  }

  return (
    <Alert variant="success">
      <span className="font-semibold">Nearest open center: {nearest.name}</span>
      <span className="block sm:inline">
        {" "}
        (Brgy. {nearest.barangay}) — {nearest.distanceKm.toFixed(1)} km away,{" "}
        {(nearest.capacity - nearest.currentOccupancy).toLocaleString()} slots
        free.
      </span>
    </Alert>
  );
}
