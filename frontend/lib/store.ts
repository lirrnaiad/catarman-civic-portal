import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db } from "./db";
import type { AdminReport, ReportPhoto } from "./types";

/**
 * MySQL-backed report store (tables in backend/schema.sql). The API routes
 * only call these three functions, so storage details stay in this file.
 */

interface ReportRow extends RowDataPacket {
  id: string;
  category: AdminReport["category"];
  description: string;
  barangay: string | null;
  lat: number;
  lng: number;
  location_accuracy: number | null;
  reporter_contact: string | null;
  status: AdminReport["status"];
  created_at: Date;
  received_at: Date;
}

interface PhotoRow extends RowDataPacket {
  report_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  data_url: string;
}

function toReport(row: ReportRow, photos: ReportPhoto[]): AdminReport {
  return {
    id: row.id,
    category: row.category,
    description: row.description,
    barangay: row.barangay ?? undefined,
    location: {
      lat: row.lat,
      lng: row.lng,
      accuracy: row.location_accuracy ?? undefined,
    },
    photos,
    reporterContact: row.reporter_contact ?? undefined,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    receivedAt: row.received_at.toISOString(),
  };
}

/**
 * Photo metadata for these reports. The dashboard polls the list every 15s
 * and only shows photo counts, so the (multi-MB) image data is left out
 * unless `withData` is set; those photos come back with an empty dataUrl.
 */
async function photosFor(ids: string[], withData = false): Promise<Map<string, ReportPhoto[]>> {
  const byReport = new Map<string, ReportPhoto[]>();
  if (ids.length === 0) return byReport;
  const [rows] = await db.query<PhotoRow[]>(
    `SELECT report_id, file_name, mime_type, size_bytes, ${withData ? "data_url" : "'' AS data_url"}
       FROM report_photos WHERE report_id IN (?) ORDER BY id`,
    [ids]
  );
  for (const row of rows) {
    const list = byReport.get(row.report_id) ?? [];
    list.push({
      fileName: row.file_name,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      dataUrl: row.data_url,
    });
    byReport.set(row.report_id, list);
  }
  return byReport;
}

export interface ReportFilters {
  category?: string;
  barangay?: string;
  status?: string;
}

export async function listReports(filters: ReportFilters = {}): Promise<AdminReport[]> {
  const where: string[] = [];
  const params: string[] = [];
  if (filters.category) {
    where.push("category = ?");
    params.push(filters.category);
  }
  if (filters.status) {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters.barangay) {
    where.push("barangay LIKE ?");
    params.push(`%${filters.barangay}%`);
  }

  const [rows] = await db.query<ReportRow[]>(
    `SELECT * FROM reports ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY received_at DESC`,
    params
  );
  const photos = await photosFor(rows.map((r) => r.id));
  return rows.map((row) => toReport(row, photos.get(row.id) ?? []));
}

/** One report with its photo data, for the dashboard's detail panel. */
export async function getReport(id: string): Promise<AdminReport | null> {
  const [rows] = await db.query<ReportRow[]>("SELECT * FROM reports WHERE id = ?", [id]);
  if (rows.length === 0) return null;
  const photos = await photosFor([id], true);
  return toReport(rows[0], photos.get(id) ?? []);
}

export async function insertReport(report: AdminReport): Promise<AdminReport> {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // Idempotent on id: a re-flushed offline-queue submission is ignored, not duplicated.
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT IGNORE INTO reports
         (id, category, description, barangay, lat, lng, location_accuracy, reporter_contact, status, created_at, received_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        report.id,
        report.category,
        report.description,
        report.barangay ?? null,
        report.location.lat,
        report.location.lng,
        report.location.accuracy ?? null,
        report.reporterContact ?? null,
        report.status,
        new Date(report.createdAt),
        new Date(report.receivedAt),
      ]
    );
    if (result.affectedRows > 0) {
      for (const photo of report.photos) {
        await conn.query(
          "INSERT INTO report_photos (report_id, file_name, mime_type, size_bytes, data_url) VALUES (?, ?, ?, ?, ?)",
          [report.id, photo.fileName, photo.mimeType, photo.sizeBytes, photo.dataUrl]
        );
      }
    }
    await conn.commit();
    return report;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateReportStatus(
  id: string,
  status: AdminReport["status"]
): Promise<AdminReport | null> {
  await db.query("UPDATE reports SET status = ? WHERE id = ?", [status, id]);
  // Re-read rather than trust affectedRows, which is 0 when the status didn't change.
  const [rows] = await db.query<ReportRow[]>("SELECT * FROM reports WHERE id = ?", [id]);
  if (rows.length === 0) return null;
  const photos = await photosFor([id]);
  return toReport(rows[0], photos.get(id) ?? []);
}
