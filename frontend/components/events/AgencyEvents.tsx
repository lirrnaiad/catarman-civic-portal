"use client";

import Link from "next/link";
import { useState } from "react";
import { logout } from "@/app/login/actions";
import Icon from "@/components/Icon";
import { TZ, categoryInfo } from "@/lib/eventFormat";
import { EVENT_CATEGORIES, type CivicEvent, type CivicEventInput, type EventCategory } from "@/lib/types";
import EventCard from "./EventCard";
import styles from "./agency.module.css";

interface Draft {
  title: string;
  category: EventCategory;
  date: string;
  start: string;
  end: string;
  location: string;
  description: string;
}

/** Split an ISO time into Catarman date + time strings for the form inputs. */
function toParts(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d),
    time: new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d),
  };
}

const toIso = (date: string, time: string) => (date && time ? `${date}T${time}:00+08:00` : "");

function blankDraft(now: number): Draft {
  return {
    title: "",
    category: "community",
    date: toParts(new Date(now + 86_400_000).toISOString()).date,
    start: "09:00",
    end: "",
    location: "",
    description: "",
  };
}

function draftFrom(event: CivicEvent): Draft {
  const s = toParts(event.startsAt);
  return {
    title: event.title,
    category: event.category,
    date: s.date,
    start: s.time,
    end: event.endsAt ? toParts(event.endsAt).time : "",
    location: event.location,
    description: event.description,
  };
}

function toInput(d: Draft): CivicEventInput {
  return {
    title: d.title,
    category: d.category,
    startsAt: toIso(d.date, d.start),
    endsAt: d.end ? toIso(d.date, d.end) : undefined,
    location: d.location,
    description: d.description,
  };
}

export default function AgencyEvents({
  agency,
  agencyName,
  isAdmin,
  initialEvents,
  now,
}: {
  agency: string;
  agencyName: string;
  isAdmin: boolean;
  initialEvents: CivicEvent[];
  now: number;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [editing, setEditing] = useState<{ id: number | null; draft: Draft } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const upcoming = events.filter((e) => Date.parse(e.endsAt ?? e.startsAt) >= now);
  const past = events.filter((e) => Date.parse(e.endsAt ?? e.startsAt) < now).reverse();

  const open = (id: number | null, draft: Draft) => {
    setError(null);
    setEditing({ id, draft });
  };

  const set = (patch: Partial<Draft>) =>
    setEditing((cur) => (cur ? { ...cur, draft: { ...cur.draft, ...patch } } : cur));

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(editing.id ? `/api/events/${editing.id}` : "/api/events", {
        method: editing.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toInput(editing.draft)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Couldn't save. Try again.");
        return;
      }
      const saved: CivicEvent = data.event;
      setEvents((prev) =>
        [...prev.filter((e) => e.id !== saved.id), saved].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      );
      flash(editing.id ? "Changes saved" : "Published: citizens can see it now");
      setEditing(null);
    } catch {
      setError("No connection. Check your signal and try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      flash("Event deleted");
    } else {
      flash("Couldn't delete the event");
    }
    setConfirmDelete(null);
  };

  const draft = editing?.draft;
  const previewEvent: CivicEvent | null = draft
    ? {
        id: 0,
        agency,
        ...toInput(draft),
        startsAt: toIso(draft.date, draft.start) || new Date(now).toISOString(),
      }
    : null;

  const renderList = (list: CivicEvent[]) => (
    <ul className={styles.list}>
      {list.map((e) => (
        <li key={e.id} className={styles.item}>
          <EventCard event={e} now={now} preview />
          <div className={styles.itemActions}>
            {confirmDelete === e.id ? (
              <>
                <span className={styles.confirmText}>Delete this event?</span>
                <button type="button" className={styles.ghostBtn} onClick={() => setConfirmDelete(null)}>
                  Cancel
                </button>
                <button type="button" className={styles.dangerBtn} onClick={() => remove(e.id)}>
                  Delete
                </button>
              </>
            ) : (
              <>
                <Link href={`/events/${e.id}`} className={styles.ghostBtn}>
                  View
                </Link>
                <button type="button" className={styles.ghostBtn} onClick={() => open(e.id, draftFrom(e))}>
                  <Icon name="edit" className="h-4 w-4" />
                  Edit
                </button>
                <button type="button" className={styles.ghostBtn} onClick={() => setConfirmDelete(e.id)}>
                  <Icon name="trash" className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <main className={styles.page}>
      <div className={styles.staffBar}>
        <span className={styles.postingAs}>
          <Icon name="verified" className="h-4 w-4" />
          Posting as <strong>{agency}</strong>
        </span>
        {isAdmin && (
          <Link href="/admindashboard" className={styles.ghostBtn}>
            Reports
          </Link>
        )}
        <form action={logout}>
          <button type="submit" className={styles.ghostBtn}>
            Sign out
          </button>
        </form>
      </div>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Your events</h1>
          <p className={styles.subtitle}>{agencyName}</p>
        </div>
        <button type="button" className={styles.newBtn} onClick={() => open(null, blankDraft(now))}>
          <Icon name="plus" className="h-5 w-5" />
          New event
        </button>
      </header>

      <section>
        <h2 className={styles.sectionTitle}>Upcoming ({upcoming.length})</h2>
        {upcoming.length ? (
          renderList(upcoming)
        ) : (
          <p className={styles.empty}>No upcoming events. Tap “New event” to publish one.</p>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Past</h2>
          {renderList(past)}
        </section>
      )}

      {editing && draft && previewEvent && (
        <div className={styles.overlay} onClick={() => !saving && setEditing(null)}>
          <div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHandle} aria-hidden />
            <div className={styles.sheetHead}>
              <h2 id="editor-title" className={styles.sheetTitle}>
                {editing.id ? "Edit event" : "New event"}
              </h2>
              <button type="button" className={styles.closeBtn} aria-label="Close" onClick={() => setEditing(null)}>
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>

            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <label className={styles.field}>
                <span>Title</span>
                <input
                  value={draft.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="e.g. Free Vaccination Day"
                  maxLength={150}
                  required
                  autoFocus
                />
              </label>

              <fieldset className={styles.field}>
                <legend>Type</legend>
                <div className={styles.typeGrid}>
                  {EVENT_CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      aria-pressed={draft.category === c.value}
                      className={`${styles.typeChip} ${draft.category === c.value ? styles.typeChipOn : ""}`}
                      style={{ "--cat": c.color, "--cat-soft": c.soft } as React.CSSProperties}
                      onClick={() => set({ category: c.value })}
                    >
                      <span className={styles.typeDot} aria-hidden />
                      {c.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className={styles.row}>
                <label className={styles.field}>
                  <span>Date</span>
                  <input type="date" value={draft.date} onChange={(e) => set({ date: e.target.value })} required />
                </label>
              </div>
              <div className={styles.row}>
                <label className={styles.field}>
                  <span>Starts</span>
                  <input type="time" value={draft.start} onChange={(e) => set({ start: e.target.value })} required />
                </label>
                <label className={styles.field}>
                  <span>
                    Ends <em>optional</em>
                  </span>
                  <input type="time" value={draft.end} onChange={(e) => set({ end: e.target.value })} />
                </label>
              </div>

              <label className={styles.field}>
                <span>Where</span>
                <input
                  value={draft.location}
                  onChange={(e) => set({ location: e.target.value })}
                  placeholder="e.g. Catarman Rural Health Unit"
                  maxLength={150}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>
                  Details <em>optional</em>
                </span>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder="What citizens should know or bring"
                />
              </label>

              <div className={styles.preview}>
                <span className={styles.previewLabel}>How citizens will see it</span>
                <EventCard event={previewEvent} now={now} preview />
                <span className={styles.previewCat} style={{ color: categoryInfo(draft.category).color }}>
                  Appears under {categoryInfo(draft.category).label} on the Events tab
                </span>
              </div>

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <div className={styles.sheetActions}>
                <button type="button" className={styles.ghostBtn} onClick={() => setEditing(null)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className={styles.publishBtn} disabled={saving}>
                  {saving ? "Saving…" : editing.id ? "Save changes" : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={styles.toast} role="status">
          <Icon name="check" className="h-4 w-4" />
          {toast}
        </div>
      )}
    </main>
  );
}
