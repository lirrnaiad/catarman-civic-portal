import { EVENT_CATEGORIES, type CivicEvent, type EventCategory } from "./types";

/**
 * Event date helpers. Everything is formatted in Catarman time on both the
 * server and the phone, so labels like "Today" or "Starts in 2h" match
 * between the server render and hydration.
 */

export const TZ = "Asia/Manila";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export const categoryInfo = (value: EventCategory) =>
  EVENT_CATEGORIES.find((c) => c.value === value) ?? EVENT_CATEGORIES[2];

/** "2026-09-24" for the Catarman calendar day of a timestamp. */
export function dayKey(time: string | number | Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(time)
  );
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export function timeRange(event: CivicEvent): string {
  return event.endsAt ? `${formatTime(event.startsAt)} – ${formatTime(event.endsAt)}` : `Starts ${formatTime(event.startsAt)}`;
}

/** Month and day parts for date badges, e.g. { month: "SEP", day: "24", weekday: "Thu" }. */
export function dateParts(time: string | number) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric", weekday: "short" })
    .formatToParts(new Date(time))
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return { month: parts.month.toUpperCase(), day: parts.day, weekday: parts.weekday };
}

/** "Today", "Tomorrow" or "Friday, Sep 25", relative to `now`. */
export function dayLabel(key: string, now: number): string {
  if (key === dayKey(now)) return "Today";
  if (key === dayKey(now + DAY)) return "Tomorrow";
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", month: "short", day: "numeric" }).format(
    new Date(`${key}T12:00:00+08:00`)
  );
}

export function isHappening(event: CivicEvent, now: number): boolean {
  const start = Date.parse(event.startsAt);
  const end = event.endsAt ? Date.parse(event.endsAt) : start + 3 * HOUR;
  return start <= now && now < end;
}

/** "Happening now", "Starts in 45m", "Starts in 3h 10m", "In 4 days". */
export function countdown(event: CivicEvent, now: number): string {
  if (isHappening(event, now)) return "Happening now";
  const ms = Date.parse(event.startsAt) - now;
  if (ms <= 0) return "Ended";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `Starts in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Starts in ${hrs}h${mins % 60 ? ` ${mins % 60}m` : ""}`;
  const days = Math.round(ms / DAY);
  return days === 1 ? "Tomorrow" : `In ${days} days`;
}

export function mapsUrl(event: CivicEvent): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.location}, Catarman, Northern Samar`)}`;
}

// ---------------------------------------------------------------------------
// Add to calendar (.ics), works with Google Calendar, iOS and Android.
// ---------------------------------------------------------------------------

const icsDate = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");

export function toIcs(event: CivicEvent, url: string): string {
  const start = Date.parse(event.startsAt);
  const end = event.endsAt ? Date.parse(event.endsAt) : start + HOUR;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Catarman Civic Portal//Events//EN",
    "BEGIN:VEVENT",
    `UID:event-${event.id}@catarman-civic-portal`,
    `DTSTAMP:${icsDate(Date.now())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsText(event.title)}`,
    `LOCATION:${icsText(`${event.location}, Catarman, Northern Samar`)}`,
    `DESCRIPTION:${icsText(`${event.description}\n\nPosted by ${event.agency} · ${url}`)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(event: CivicEvent) {
  const url = `${window.location.origin}/events/${event.id}`;
  const blob = new Blob([toIcs(event, url)], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
