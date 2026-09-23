import type { CenterFields } from "./centers";

/**
 * Validates a center body from the admin UI. With `partial`, only the fields
 * present are checked (headcount / open-close updates send one field).
 */
export function parseCenterInput(
  body: unknown,
  partial: boolean
): { input: Partial<CenterFields> } | { error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const has = (k: string) => k in b;
  const out: Partial<CenterFields> = {};

  const text = (k: string, max: number) => (typeof b[k] === "string" ? (b[k] as string).trim().slice(0, max) : "");
  const int = (k: string) => (typeof b[k] === "number" && Number.isFinite(b[k]) ? Math.round(b[k] as number) : NaN);

  if (!partial || has("name")) {
    out.name = text("name", 150);
    if (!out.name) return { error: "Add the center's name." };
  }
  if (!partial || has("barangay")) {
    out.barangay = text("barangay", 100);
    if (!out.barangay) return { error: "Choose a barangay." };
  }
  if (!partial || has("lat") || has("lng")) {
    const lat = Number(b.lat);
    const lng = Number(b.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return { error: "Drop a pin for the location." };
    }
    out.lat = lat;
    out.lng = lng;
  }
  if (!partial || has("capacity")) {
    out.capacity = int("capacity");
    if (!(out.capacity > 0)) return { error: "Capacity must be more than 0." };
  }
  if (!partial || has("currentOccupancy")) {
    out.currentOccupancy = has("currentOccupancy") ? int("currentOccupancy") : 0;
    if (!(out.currentOccupancy >= 0)) return { error: "Headcount can't be negative." };
  }
  if (!partial || has("isOpen")) out.isOpen = has("isOpen") ? Boolean(b.isOpen) : true;
  if (!partial || has("contact")) out.contact = text("contact", 50) || undefined;

  return { input: out };
}
