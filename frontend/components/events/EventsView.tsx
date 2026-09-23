"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import Icon from "@/components/Icon";
import {
  categoryInfo,
  countdown,
  dateParts,
  dayKey,
  dayLabel,
  downloadIcs,
  isHappening,
  timeRange,
} from "@/lib/eventFormat";
import { EVENT_CATEGORIES, type CivicEvent, type EventCategory } from "@/lib/types";
import EventCard from "./EventCard";
import styles from "./events.module.css";
import { useNow } from "./useNow";
import { useSavedEvents } from "./useSavedEvents";

const DAY = 86_400_000;
type Filter = "all" | "saved" | EventCategory;

export default function EventsView({ events, now: serverNow }: { events: CivicEvent[]; now: number }) {
  const now = useNow(serverNow);
  const { saved, isSaved, toggle } = useSavedEvents();
  const [filter, setFilter] = useState<Filter>("all");
  const [day, setDay] = useState<string | null>(null);

  // Next 14 days for the date strip, with a dot on days that have events.
  const days = useMemo(() => {
    const withEvents = new Set(events.map((e) => dayKey(e.startsAt)));
    return Array.from({ length: 14 }, (_, i) => {
      const key = dayKey(serverNow + i * DAY);
      return { key, ...dateParts(serverNow + i * DAY), hasEvents: withEvents.has(key) };
    });
  }, [events, serverNow]);

  const upNext = events.find((e) => isHappening(e, now)) ?? events.find((e) => Date.parse(e.startsAt) > now);

  const visible = events.filter(
    (e) =>
      (filter === "all" || (filter === "saved" ? saved.includes(e.id) : e.category === filter)) &&
      (!day || dayKey(e.startsAt) === day)
  );

  const groups = visible.reduce<{ key: string; items: CivicEvent[] }[]>((acc, e) => {
    const key = dayKey(e.startsAt);
    const last = acc[acc.length - 1];
    if (last?.key === key) last.items.push(e);
    else acc.push({ key, items: [e] });
    return acc;
  }, []);

  let index = 0;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Events</h1>
        <p className={styles.subtitle}>
          <Icon name="verified" className="h-4 w-4 text-civic" />
          Official schedules from LGU Catarman offices
        </p>
      </header>

      {upNext && (
        <UpNext
          event={upNext}
          now={now}
          saved={isSaved(upNext.id)}
          onToggleSave={() => toggle(upNext.id)}
        />
      )}

      <section aria-label="Pick a day">
        <div className={styles.dayStrip}>
          <button
            type="button"
            className={`${styles.dayPill} ${day === null ? styles.dayPillOn : ""}`}
            aria-pressed={day === null}
            aria-label="All days"
            onClick={() => setDay(null)}
          >
            <span className={styles.dayWeek}>All</span>
            <span className={styles.dayNum}>
              <Icon name="calendar" className="h-5 w-5" />
            </span>
          </button>
          {days.map((d) => (
            <button
              key={d.key}
              type="button"
              className={`${styles.dayPill} ${day === d.key ? styles.dayPillOn : ""}`}
              aria-pressed={day === d.key}
              aria-label={dayLabel(d.key, serverNow)}
              onClick={() => setDay(day === d.key ? null : d.key)}
            >
              <span className={styles.dayWeek}>{d.key === dayKey(serverNow) ? "Today" : d.weekday}</span>
              <span className={styles.dayNum}>{d.day}</span>
              <span className={`${styles.dayDot} ${d.hasEvents ? "" : styles.dayDotEmpty}`} aria-hidden />
            </button>
          ))}
        </div>
      </section>

      <div className={styles.chips} role="group" aria-label="Filter events">
        <Chip on={filter === "all"} onClick={() => setFilter("all")}>
          All
        </Chip>
        <Chip on={filter === "saved"} onClick={() => setFilter("saved")}>
          <Icon name="bookmark" className={`h-4 w-4 ${filter === "saved" ? "fill-current" : ""}`} />
          Saved{saved.length ? ` (${saved.length})` : ""}
        </Chip>
        {EVENT_CATEGORIES.map((c) => (
          <Chip key={c.value} on={filter === c.value} onClick={() => setFilter(c.value)} color={c.color}>
            <span className={styles.chipDot} aria-hidden />
            {c.label}
          </Chip>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden>
            <Icon name={filter === "saved" ? "bookmark" : "calendar"} className="h-7 w-7" />
          </span>
          <p className={styles.emptyTitle}>{filter === "saved" ? "No saved events yet" : "Nothing scheduled"}</p>
          <p className={styles.emptyBody}>
            {filter === "saved"
              ? "Tap the bookmark on any event to keep it here."
              : "Try another day or type. New events from LGU offices appear here first."}
          </p>
        </div>
      ) : (
        // Re-key on filter/day so the list replays its entrance animation.
        <div key={`${filter}-${day}`}>
          {groups.map((g) => (
            <section key={g.key} className={styles.group} aria-labelledby={`day-${g.key}`}>
              <h2 id={`day-${g.key}`} className={styles.groupTitle} suppressHydrationWarning>
                {dayLabel(g.key, now)}
              </h2>
              <div className={styles.cardList}>
                {g.items.map((e) => (
                  <EventCard
                    key={e.id}
                    event={e}
                    now={now}
                    index={index++}
                    saved={isSaved(e.id)}
                    onToggleSave={toggle}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function Chip({
  on,
  onClick,
  color,
  children,
}: {
  on: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      className={`${styles.chip} ${on ? styles.chipOn : ""}`}
      style={color ? ({ "--cat": color } as CSSProperties) : undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function UpNext({
  event,
  now,
  saved,
  onToggleSave,
}: {
  event: CivicEvent;
  now: number;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const cat = categoryInfo(event.category);
  const live = isHappening(event, now);
  return (
    <section
      className={styles.hero}
      style={{ "--cat": cat.color } as CSSProperties}
      aria-label={live ? "Happening now" : "Up next"}
    >
      <Link href={`/events/${event.id}`} className={styles.heroLink}>
        <span className={styles.heroEyebrow}>
          {live ? (
            <>
              <span className={styles.livePulse} aria-hidden /> Happening now
            </>
          ) : (
            "Up next"
          )}
        </span>
        <span className={styles.heroTitle}>{event.title}</span>
        <span className={styles.heroMeta} suppressHydrationWarning>
          {dayLabel(dayKey(event.startsAt), now)} · {timeRange(event)}
        </span>
        <span className={styles.heroMeta}>
          <Icon name="mapPin" className="h-4 w-4" />
          {event.location}
        </span>
        {!live && (
          <span className={styles.heroCountdown} suppressHydrationWarning>
            {countdown(event, now)}
          </span>
        )}
      </Link>
      <div className={styles.heroActions}>
        <button type="button" className={styles.heroBtn} onClick={() => downloadIcs(event)}>
          <Icon name="calendarPlus" className="h-4 w-4" />
          Add to calendar
        </button>
        <button
          type="button"
          className={`${styles.heroBtn} ${styles.heroBtnIcon} ${saved ? styles.heroBtnOn : ""}`}
          aria-pressed={saved}
          aria-label={saved ? "Unsave" : "Save"}
          onClick={onToggleSave}
        >
          <Icon name="bookmark" className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>
      <span className={styles.heroAgency}>
        <Icon name="verified" className="h-4 w-4" />
        {event.agency}
      </span>
    </section>
  );
}
