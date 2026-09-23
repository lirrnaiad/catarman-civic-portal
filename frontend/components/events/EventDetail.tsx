"use client";

import Link from "next/link";
import { useState, ViewTransition, type CSSProperties } from "react";
import Icon from "@/components/Icon";
import {
  categoryInfo,
  countdown,
  dateParts,
  dayKey,
  dayLabel,
  downloadIcs,
  isHappening,
  mapsUrl,
  timeRange,
} from "@/lib/eventFormat";
import { AGENCIES, type CivicEvent } from "@/lib/types";
import styles from "./eventDetail.module.css";
import { useNow } from "./useNow";
import { useSavedEvents } from "./useSavedEvents";

export default function EventDetail({ event, now: serverNow }: { event: CivicEvent; now: number }) {
  const now = useNow(serverNow);
  const { isSaved, toggle } = useSavedEvents();
  const [toast, setToast] = useState<string | null>(null);
  const cat = categoryInfo(event.category);
  const { month, day } = dateParts(event.startsAt);
  const saved = isSaved(event.id);
  const live = isHappening(event, now);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const share = async () => {
    const url = window.location.href;
    const text = `${event.title} · ${dayLabel(dayKey(event.startsAt), Date.now())}, ${timeRange(event)} at ${event.location}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      flash("Link copied");
    } catch {
      // Share sheet dismissed: nothing to do.
    }
  };

  return (
    <main className={styles.page} style={{ "--cat": cat.color, "--cat-soft": cat.soft } as CSSProperties}>
      <Link href="/events" className={styles.back}>
        <Icon name="arrowLeft" className="h-4 w-4" />
        All events
      </Link>

      <section className={styles.hero}>
        <ViewTransition name={`event-badge-${event.id}`} share="auto" default="none">
          <div className={styles.badge}>
            <span className={styles.badgeMonth}>{month}</span>
            <span className={styles.badgeDay}>{day}</span>
          </div>
        </ViewTransition>
        <div className={styles.heroText}>
          <span className={styles.cat}>{cat.label}</span>
          <h1 className={styles.title}>{event.title}</h1>
          <span className={styles.agency}>
            <Icon name="verified" className="h-4 w-4" />
            {AGENCIES[event.agency] ?? event.agency}
          </span>
        </div>
      </section>

      <div className={styles.status} suppressHydrationWarning>
        {live ? (
          <>
            <span className={styles.livePulse} aria-hidden /> Happening now
          </>
        ) : (
          countdown(event, now)
        )}
      </div>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>
            <Icon name="clock" className="h-5 w-5" />
            <span className="sr-only">When</span>
          </dt>
          <dd suppressHydrationWarning>
            <strong>{dayLabel(dayKey(event.startsAt), now)}</strong>
            <span>{timeRange(event)}</span>
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>
            <Icon name="mapPin" className="h-5 w-5" />
            <span className="sr-only">Where</span>
          </dt>
          <dd>
            <strong>{event.location}</strong>
            <a href={mapsUrl(event)} target="_blank" rel="noopener noreferrer" className={styles.mapsLink}>
              Open in Google Maps
              <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
            </a>
          </dd>
        </div>
      </dl>

      {event.description && (
        <section className={styles.about}>
          <h2>About this event</h2>
          <p>{event.description}</p>
        </section>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={() => downloadIcs(event)}>
          <Icon name="calendarPlus" className="h-5 w-5" />
          Add to calendar
        </button>
        <button
          type="button"
          className={`${styles.iconBtn} ${saved ? styles.iconBtnOn : ""}`}
          aria-pressed={saved}
          aria-label={saved ? "Unsave event" : "Save event"}
          onClick={() => {
            toggle(event.id);
            flash(saved ? "Removed from saved" : "Saved to your events");
          }}
        >
          <Icon name="bookmark" className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Share event" onClick={share}>
          <Icon name="share" className="h-5 w-5" />
        </button>
      </div>

      {toast && (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      )}
    </main>
  );
}
