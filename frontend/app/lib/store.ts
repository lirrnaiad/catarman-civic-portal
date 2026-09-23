import { promises as fs } from "fs";
import path from "path";
import type { AdminReport, ReportStatus } from "./types";

/**
 * File-backed report store (reverted from the MySQL version).
 *
 * Not safe for concurrent writes at real scale (no file locking) — fine for
 * a prototype/demo, not for production traffic. Swap this out for a real
 * database later and keep the same three function signatures
 * (listReports / insertReport / updateReportStatus) so nothing else in the
 * app has to change.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "reports.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

async function readAll(): Promise<AdminReport[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw) as AdminReport[];
  } catch {
    return [];
  }
}

async function writeAll(reports: AdminReport[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(reports, null, 2), "utf-8");
}

export interface ReportFilters {
  category?: string;
  barangay?: string;
  status?: string;
}

export async function listReports(filters: ReportFilters = {}): Promise<AdminReport[]> {
  const all = await readAll();
  return all
    .filter((r) => !filters.category || r.category === filters.category)
    .filter((r) => !filters.status || r.status === filters.status)
    .filter(
      (r) =>
        !filters.barangay ||
        (r.barangay ?? "").toLowerCase().includes(filters.barangay.toLowerCase())
    )
    .sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1)); // newest first
}

export async function insertReport(report: AdminReport): Promise<AdminReport> {
  const all = await readAll();
  // Idempotent on id — a re-flushed offline-queue submission won't duplicate.
  if (all.some((r) => r.id === report.id)) {
    return report;
  }
  all.push(report);
  await writeAll(all);
  return report;
}

/**
 * Updates a single report's workflow status.
 * Used by the PATCH handler in app/api/reports/route.ts (and by the
 * admin dashboard, which calls that route).
 */
export async function updateReportStatus(
  id: string,
  status: ReportStatus
): Promise<AdminReport | null> {
  const all = await readAll();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) return null;
  all[index] = { ...all[index], status };
  await writeAll(all);
  return all[index];
}