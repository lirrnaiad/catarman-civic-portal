// Catarman's 55 barangays with centroids, generated from backend/seed.sql
// (the `barangays` table). Centroids are approximate: good for a "near
// Brgy. X" suggestion the reporter can change, not for exact boundaries.

export const BARANGAYS: { name: string; lat: number; lng: number }[] = [
  { name: "Acacia", lat: 12.510155, lng: 124.640138 },
  { name: "Aguinaldo", lat: 12.510737, lng: 124.629206 },
  { name: "Airport Village", lat: 12.504089, lng: 124.638394 },
  { name: "Bangkerohan", lat: 12.498474, lng: 124.64592 },
  { name: "Baybay", lat: 12.507157, lng: 124.643018 },
  { name: "Bocsol", lat: 12.485362, lng: 124.649529 },
  { name: "Cabayhan", lat: 12.534424, lng: 124.676729 },
  { name: "Cag-abaca", lat: 12.461152, lng: 124.666359 },
  { name: "Cal-igang", lat: 12.519797, lng: 124.650056 },
  { name: "Calachuchi", lat: 12.500692, lng: 124.631931 },
  { name: "Casoy", lat: 12.505873, lng: 124.636417 },
  { name: "Cawayan", lat: 12.507737, lng: 124.657957 },
  { name: "Cervantes", lat: 12.475523, lng: 124.608573 },
  { name: "Cularima", lat: 12.466048, lng: 124.633708 },
  { name: "Daganas", lat: 12.520645, lng: 124.661249 },
  { name: "Dalakit", lat: 12.5051, lng: 124.62509 },
  { name: "Do\u00f1a Pulqueria", lat: 12.480964, lng: 124.590679 },
  { name: "Galutan", lat: 12.481083, lng: 124.664426 },
  { name: "Gebalagnan", lat: 12.544105, lng: 124.65423 },
  { name: "Gibulwangan", lat: 12.458189, lng: 124.630223 },
  { name: "Guba", lat: 12.54301, lng: 124.653015 },
  { name: "Hinatad", lat: 12.495223, lng: 124.638338 },
  { name: "Imelda", lat: 12.539626, lng: 124.641023 },
  { name: "Ipil-ipil", lat: 12.492938, lng: 124.645924 },
  { name: "Jose Abad Santos", lat: 12.500032, lng: 124.647737 },
  { name: "Jose P. Rizal", lat: 12.487392, lng: 124.627295 },
  { name: "Lapu-lapu", lat: 12.505889, lng: 124.640721 },
  { name: "Liberty", lat: 12.517973, lng: 124.612483 },
  { name: "Libjo", lat: 12.504103, lng: 124.643231 },
  { name: "Mabini", lat: 12.468989, lng: 124.656506 },
  { name: "Mabolo", lat: 12.49707, lng: 124.627779 },
  { name: "Macagtas", lat: 12.456792, lng: 124.625373 },
  { name: "Malvar", lat: 12.484955, lng: 124.664886 },
  { name: "McKinley", lat: 12.510917, lng: 124.679129 },
  { name: "Molave", lat: 12.500264, lng: 124.641122 },
  { name: "Narra", lat: 12.49759, lng: 124.627539 },
  { name: "New Rizal", lat: 12.469573, lng: 124.619019 },
  { name: "Old Rizal", lat: 12.509199, lng: 124.5927 },
  { name: "Paticua", lat: 12.487617, lng: 124.601188 },
  { name: "Polangi", lat: 12.3971, lng: 124.6298 },
  { name: "Quezon", lat: 12.485764, lng: 124.648535 },
  { name: "Salvacion", lat: 12.512534, lng: 124.626138 },
  { name: "Sampaguita", lat: 12.494896, lng: 124.637336 },
  { name: "San Julian", lat: 12.502647, lng: 124.609129 },
  { name: "San Pascual", lat: 12.532257, lng: 124.628191 },
  { name: "Santol", lat: 12.493211, lng: 124.633832 },
  { name: "Somoge", lat: 12.514528, lng: 124.615606 },
  { name: "Talisay", lat: 12.509835, lng: 124.626421 },
  { name: "Tinowaran", lat: 12.483904, lng: 124.628772 },
  { name: "Trangue", lat: 12.46442, lng: 124.608202 },
  { name: "UEP Zone I", lat: 12.510594, lng: 124.667247 },
  { name: "UEP Zone II", lat: 12.513959, lng: 124.661567 },
  { name: "UEP Zone III", lat: 12.47636, lng: 124.659619 },
  { name: "Washington", lat: 12.493869, lng: 124.643062 },
  { name: "Yakal", lat: 12.490191, lng: 124.645432 },
];

/** Closest barangay centroid to a point (equirectangular distance is plenty at town scale). */
export function nearestBarangay(lat: number, lng: number): string {
  const cos = Math.cos((lat * Math.PI) / 180);
  let best = BARANGAYS[0];
  let bestD = Infinity;
  for (const b of BARANGAYS) {
    const d = (b.lat - lat) ** 2 + ((b.lng - lng) * cos) ** 2;
    if (d < bestD) {
      bestD = d;
      best = b;
    }
  }
  return best.name;
}
