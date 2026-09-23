// Static mirror of backend/seed.sql's `evacuation_centers` rows.
//
// Until the PHP API is wired up, the map reads this file directly. Once
// `GET /evacuation_centers` is live (see backend/README.md — it needs to
// return lat/lng, not just name/barangay/capacity/current_occupancy per the
// original brief), swap the fetch in `lib/fetch-evacuation-centers.ts` for
// the real call and delete this file's use as a data source (keep the type).
//
// Keep this in sync with backend/seed.sql if you change occupancy numbers —
// the "nearest open center" demo depends on Catarman Cathedral being FULL.

export type EvacuationCenter = {
  id: string;
  name: string;
  barangay: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
};

export const EVACUATION_CENTERS: EvacuationCenter[] = [
  {
    id: "municipal-evacuation-center",
    name: "Municipal Evacuation Center",
    barangay: "Yakal",
    lat: 12.490191,
    lng: 124.645432,
    capacity: 800,
    currentOccupancy: 420,
  },
  {
    id: "catarman-cathedral",
    name: "Catarman Cathedral",
    barangay: "Jose P. Rizal",
    lat: 12.498694,
    lng: 124.6365,
    capacity: 1200,
    currentOccupancy: 1200,
  },
  {
    id: "st-michael-academy",
    name: "St. Michael Academy",
    barangay: "Casoy",
    lat: 12.505873,
    lng: 124.636417,
    capacity: 600,
    currentOccupancy: 610,
  },
  {
    id: "liga-ng-mga-barangay-building",
    name: "Liga ng mga Barangay Building",
    barangay: "Yakal",
    lat: 12.4908,
    lng: 124.6447,
    capacity: 300,
    currentOccupancy: 150,
  },
  {
    id: "catarman-nhs-capitol-gym",
    name: "Catarman National High School / Capitol Gym",
    barangay: "Dalakit",
    lat: 12.5051,
    lng: 124.62509,
    capacity: 2500,
    currentOccupancy: 1800,
  },
  {
    id: "cltt-building",
    name: "CLTT Building",
    barangay: "Narra",
    lat: 12.49759,
    lng: 124.627539,
    capacity: 400,
    currentOccupancy: 100,
  },
  {
    id: "annex-building",
    name: "Annex Building",
    barangay: "Molave",
    lat: 12.500264,
    lng: 124.641122,
    capacity: 350,
    currentOccupancy: 350,
  },
  {
    id: "northern-samar-colleges",
    name: "Northern Samar Colleges",
    barangay: "Ipil-ipil",
    lat: 12.492938,
    lng: 124.645924,
    capacity: 1000,
    currentOccupancy: 300,
  },
  {
    id: "pagcor-multipurpose-evacuation-center",
    name: "PAGCOR Multi-Purpose Evacuation Center",
    barangay: "Polangi",
    lat: 12.3971,
    lng: 124.6298,
    capacity: 6000,
    currentOccupancy: 3200,
  },
];

/** Fallback map center: Catarman Poblacion, used before geolocation resolves. */
export const CATARMAN_TOWN_CENTER: [number, number] = [12.4987, 124.6365];
