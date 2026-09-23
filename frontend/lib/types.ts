/**
 * Shared types for the civic report form.
 *
 * These are the "contract" between this form and whatever backend or
 * external system receives the reports. Keep this file framework-agnostic
 * so it can be copied into a shared package if the form and the receiving
 * system live in different repos.
 */

export type ReportCategory =
  | "flood_landslide"
  | "garbage"
  | "crime"
  | "infrastructure";

export interface CategoryOption {
  value: ReportCategory;
  label: string;
  hint: string;
}

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  {
    value: "flood_landslide",
    label: "Flood / Landslide",
    hint: "Rising water, blocked drainage, ground movement",
  },
  {
    value: "garbage",
    label: "Garbage / Segregation",
    hint: "Uncollected waste, improper segregation, illegal dumping",
  },
  {
    value: "crime",
    label: "Crime",
    hint: "Theft, disturbance, safety concerns",
  },
  {
    value: "infrastructure",
    label: "General Infrastructure",
    hint: "Roads, streetlights, water lines, electrical",
  },
];

export const CATEGORY_COLORS: Record<ReportCategory, string> = {
  flood_landslide: "#2D6CDF",
  garbage: "#4C9A2A",
  crime: "#C43D3D",
  infrastructure: "#B98900",
};

export interface GeoLocation {
  lat: number;
  lng: number;
  /** Meters, from the browser Geolocation API when available. */
  accuracy?: number;
}

/**
 * A photo attached to a report.
 *
 * `dataUrl` carries the image as a base64 data URL so the report can travel
 * as plain JSON to any receiving system (webhook, queue, third-party API)
 * with no multipart parsing required on their end. If you're wiring this to
 * your own backend and prefer real multipart upload for large files, use the
 * `files` argument passed alongside the payload in `onSubmit` instead (see
 * ReportForm props) and ignore `dataUrl`.
 */
export interface ReportPhoto {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
}

/**
 * The full payload produced by <ReportForm />.
 * This is the shape an external system should expect to receive.
 */
export interface ReportPayload {
  /** Client-generated UUID. Safe to use as an idempotency key downstream. */
  id: string;
  category: ReportCategory;
  description: string;
  location: GeoLocation;
  photos: ReportPhoto[];
  reporterContact?: string;
  /** Free-text barangay/area name, used by the admin dashboard's filter. */
  barangay?: string;
  /** ISO 8601 timestamp, set at submit time on the client. */
  createdAt: string;
}

export interface SubmitResult {
  ok: boolean;
  id: string;
  message?: string;
}

/** Workflow state, set and owned server-side — never sent by the reporting form. */
export type ReportStatus = "new" | "in_progress" | "resolved";

export const REPORT_STATUSES: { value: ReportStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

/** A stored report as the admin dashboard sees it: the reporter's payload plus workflow state. */
export interface AdminReport extends ReportPayload {
  status: ReportStatus;
  /** Server-side receipt time, distinct from the client's createdAt. */
  receivedAt: string;
}
