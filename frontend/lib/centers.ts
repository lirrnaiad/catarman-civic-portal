import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db } from "./db";
import type { EvacuationCenter } from "./evacuation-centers";

/** MySQL-backed evacuation centers (table `evacuation_centers`), managed by MDRRMO. */

interface CenterRow extends RowDataPacket {
  id: number;
  name: string;
  barangay: string;
  lat: number;
  lng: number;
  capacity: number;
  current_occupancy: number;
  is_open: number;
  contact: string | null;
  updated_at: Date;
}

function toCenter(row: CenterRow): EvacuationCenter {
  return {
    id: row.id,
    name: row.name,
    barangay: row.barangay,
    lat: row.lat,
    lng: row.lng,
    capacity: row.capacity,
    currentOccupancy: row.current_occupancy,
    isOpen: Boolean(row.is_open),
    contact: row.contact ?? undefined,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listCenters(): Promise<EvacuationCenter[]> {
  const [rows] = await db.query<CenterRow[]>("SELECT * FROM evacuation_centers ORDER BY name");
  return rows.map(toCenter);
}

export async function getCenter(id: number): Promise<EvacuationCenter | null> {
  const [rows] = await db.query<CenterRow[]>("SELECT * FROM evacuation_centers WHERE id = ?", [id]);
  return rows[0] ? toCenter(rows[0]) : null;
}

export type CenterFields = Omit<EvacuationCenter, "id" | "updatedAt">;

export async function createCenter(input: CenterFields): Promise<EvacuationCenter> {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO evacuation_centers (name, barangay, lat, lng, capacity, current_occupancy, is_open, contact)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.barangay,
      input.lat,
      input.lng,
      input.capacity,
      input.currentOccupancy,
      input.isOpen,
      input.contact ?? null,
    ]
  );
  return (await getCenter(result.insertId)) as EvacuationCenter;
}

const COLUMNS: Record<keyof CenterFields, string> = {
  name: "name",
  barangay: "barangay",
  lat: "lat",
  lng: "lng",
  capacity: "capacity",
  currentOccupancy: "current_occupancy",
  isOpen: "is_open",
  contact: "contact",
};

/** Partial update, e.g. just { currentOccupancy } from the headcount buttons. */
export async function updateCenter(id: number, patch: Partial<CenterFields>): Promise<EvacuationCenter | null> {
  const keys = (Object.keys(patch) as (keyof CenterFields)[]).filter((k) => k in COLUMNS);
  if (keys.length) {
    await db.query(
      `UPDATE evacuation_centers SET ${keys.map((k) => `${COLUMNS[k]} = ?`).join(", ")}, updated_at = NOW() WHERE id = ?`,
      [...keys.map((k) => patch[k] ?? null), id]
    );
  }
  return getCenter(id);
}

export async function deleteCenter(id: number): Promise<boolean> {
  const [result] = await db.query<ResultSetHeader>("DELETE FROM evacuation_centers WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
