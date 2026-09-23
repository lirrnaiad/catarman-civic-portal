// Evacuation centers live in MySQL (`evacuation_centers`, managed by MDRRMO
// from the admin dashboard); see lib/centers.ts. This file keeps the shared
// type and the town-center fallback for maps.

export type EvacuationCenter = {
  id: number;
  name: string;
  barangay: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
  /** False when MDRRMO hasn't activated the center or has closed it. */
  isOpen: boolean;
  contact?: string;
  /** ISO 8601: when MDRRMO last changed this center (e.g. a headcount). */
  updatedAt: string;
};

export const CATARMAN_TOWN_CENTER: [number, number] = [12.4987, 124.6365];
