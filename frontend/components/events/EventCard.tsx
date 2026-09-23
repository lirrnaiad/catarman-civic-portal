"use client";

import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";
import Icon from "@/components/Icon";
import { categoryInfo, countdown, dateParts, isHappening, timeRange } from "@/lib/eventFormat";
import type { CivicEvent } from "@/lib/types";
import styles from "./events.module.css";

interface EventCardProps {
  event: CivicEvent;
  now: number;
  saved?: boolean;
  onToggleSave?: (id: number) => void;
  /** Position in the list, for the staggered entrance. */
  index?: number;
  /** Agency preview: no link, no bookmark. */
  preview?: boolean;
}

export default function EventCard({ event, now, saved = false, onToggleSave, index = 0, preview }: EventCardProps) {
  const cat = categoryInfo(event.category);
  const { month, day } = dateParts(event.startsAt);
  const live = isHappening(event, now);
  const style = { "--i": Math.min(index, 8), "--cat": cat.color, "--cat-soft": cat.soft } as CSSProperties;

  const body = (
    <>
      {/* Same name as the detail page's badge: it morphs there on tap. */}
      <ViewTransition name={`event-badge-${event.id}`} share="auto" default="none">
        <div className={styles.dateBadge}>
          <span className={styles.dateMonth}>{month}</span>
          <span className={styles.dateDay}>{day}</span>
        </div>
      </ViewTransition>
      <div className={styles.cardBody}>
        <span className={styles.catTag}>
          <span className={styles.catDot} aria-hidden />
          {cat.label}
          {live && <span className={styles.liveTag}>Live</span>}
        </span>
        <h3 className={styles.cardTitle}>{event.title || "Event title"}</h3>
        <span className={styles.cardMeta}>
          <Icon name="clock" className="h-3.5 w-3.5" />
          <span suppressHydrationWarning>{timeRange(event)}</span>
          {!live && !preview && (
            <span className={styles.countdown} suppressHydrationWarning>
              {countdown(event, now)}
            </span>
          )}
        </span>
        <span className={styles.cardMeta}>
          <Icon name="mapPin" className="h-3.5 w-3.5" />
          {event.location || "Location"}
        </span>
        <span className={styles.agency}>
          <Icon name="verified" className="h-4 w-4" />
          {event.agency}
        </span>
      </div>
    </>
  );

  if (preview) {
    return (
      <div className={`${styles.card} ${styles.cardPreview}`} style={style}>
        {body}
      </div>
    );
  }

  return (
    <div className={styles.card} style={style}>
      <Link href={`/events/${event.id}`} className={styles.cardLink}>
        {body}
      </Link>
      {onToggleSave && (
        <button
          type="button"
          className={`${styles.saveBtn} ${saved ? styles.saveBtnOn : ""}`}
          aria-pressed={saved}
          aria-label={saved ? `Unsave ${event.title}` : `Save ${event.title}`}
          onClick={() => onToggleSave(event.id)}
        >
          <Icon name="bookmark" className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
        </button>
      )}
    </div>
  );
}
