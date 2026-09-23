import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db } from "./db";
import type { CivicEvent, CivicEventInput, EventCategory } from "./types";

/** MySQL-backed events store (table `events` in backend/schema.sql). */

interface EventRow extends RowDataPacket {
  id: number;
  title: string;
  agency: string;
  category: EventCategory;
  starts_at: Date;
  ends_at: Date | null;
  location: string;
  description: string | null;
}

function toEvent(row: EventRow): CivicEvent {
  return {
    id: row.id,
    title: row.title,
    agency: row.agency,
    category: row.category,
    startsAt: row.starts_at.toISOString(),
    endsAt: row.ends_at ? row.ends_at.toISOString() : undefined,
    location: row.location,
    description: row.description ?? "",
  };
}

/** Upcoming and still-running events, soonest first. Optionally one agency's. */
export async function listEvents(opts: { agency?: string; includePast?: boolean } = {}): Promise<CivicEvent[]> {
  const where: string[] = [];
  const params: string[] = [];
  if (!opts.includePast) {
    // Keep events visible until they end (or for 3 hours if no end time).
    where.push("COALESCE(ends_at, starts_at + INTERVAL 3 HOUR) >= NOW()");
  }
  if (opts.agency) {
    where.push("agency = ?");
    params.push(opts.agency);
  }
  const [rows] = await db.query<EventRow[]>(
    `SELECT * FROM events ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY starts_at`,
    params
  );
  return rows.map(toEvent);
}

export async function getEvent(id: number): Promise<CivicEvent | null> {
  const [rows] = await db.query<EventRow[]>("SELECT * FROM events WHERE id = ?", [id]);
  return rows[0] ? toEvent(rows[0]) : null;
}

export async function createEvent(agency: string, input: CivicEventInput): Promise<CivicEvent> {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO events (title, agency, category, starts_at, ends_at, location, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      agency,
      input.category,
      new Date(input.startsAt),
      input.endsAt ? new Date(input.endsAt) : null,
      input.location,
      input.description,
    ]
  );
  return (await getEvent(result.insertId)) as CivicEvent;
}

/** Updates only if the event belongs to `agency`. Returns null if not found / not theirs. */
export async function updateEvent(
  id: number,
  agency: string,
  input: CivicEventInput
): Promise<CivicEvent | null> {
  await db.query(
    `UPDATE events SET title = ?, category = ?, starts_at = ?, ends_at = ?, location = ?, description = ?
     WHERE id = ? AND agency = ?`,
    [
      input.title,
      input.category,
      new Date(input.startsAt),
      input.endsAt ? new Date(input.endsAt) : null,
      input.location,
      input.description,
      id,
      agency,
    ]
  );
  // affectedRows is 0 when nothing changed too, so re-read with the ownership check.
  const event = await getEvent(id);
  return event && event.agency === agency ? event : null;
}

export async function deleteEvent(id: number, agency: string): Promise<boolean> {
  const [result] = await db.query<ResultSetHeader>("DELETE FROM events WHERE id = ? AND agency = ?", [id, agency]);
  return result.affectedRows > 0;
}
