import type { EvacuationCenter } from "./evacuation-centers";

export type CapacityStatus = "open" | "near-full" | "full";

/** Color thresholds: <70% open (green), 70-99% near-full (amber), >=100% full (red). */
export function getCapacityStatus(center: EvacuationCenter): CapacityStatus {
  const ratio = center.currentOccupancy / center.capacity;
  if (ratio >= 1) return "full";
  if (ratio >= 0.7) return "near-full";
  return "open";
}

export function getOccupancyRatio(center: EvacuationCenter): number {
  return center.currentOccupancy / center.capacity;
}

export const STATUS_COLOR: Record<CapacityStatus, string> = {
  open: "#16a34a", // green-600
  "near-full": "#d97706", // amber-600
  full: "#dc2626", // red-600
};

export const STATUS_LABEL: Record<CapacityStatus, string> = {
  open: "Open",
  "near-full": "Near Full",
  full: "Full",
};

/**
 * Haversine great-circle distance in kilometers between two lat/lng points.
 * Good enough for "which center is closer" ranking — no need for road
 * distance in an 8-hour build.
 */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371; // Earth radius, km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Nearest center that still has open capacity (AC: Story 2.2 — "highlights
 * the closest one with available capacity"). Full centers are skipped
 * entirely, not just ranked last.
 */
export function findNearestOpenCenter(
  userLocation: { lat: number; lng: number },
  centers: EvacuationCenter[],
): (EvacuationCenter & { distanceKm: number }) | null {
  const open = centers.filter((c) => getCapacityStatus(c) !== "full");
  if (open.length === 0) return null;

  let nearest = open[0];
  let nearestDist = distanceKm(userLocation, nearest);
  for (const c of open.slice(1)) {
    const d = distanceKm(userLocation, c);
    if (d < nearestDist) {
      nearest = c;
      nearestDist = d;
    }
  }
  return { ...nearest, distanceKm: nearestDist };
}
