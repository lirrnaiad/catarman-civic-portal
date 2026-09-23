"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Icon from "@/components/Icon";
import { useNow } from "@/components/events/useNow";
import { BARANGAYS } from "@/lib/barangays";
import type { EvacuationCenter } from "@/lib/evacuation-centers";
import {
  directionsUrl,
  distanceKm,
  findNearestOpenCenter,
  getCapacityStatus,
  getOccupancyRatio,
  spacesLeft,
  STATUS_COLOR,
  STATUS_LABEL,
  walkMinutes,
  type CapacityStatus,
} from "@/lib/evacuation-utils";
import { useGeolocation } from "@/lib/useGeolocation";
import { useOnline } from "@/lib/useOnline";
import styles from "./centers.module.css";
import { useCountUp } from "./useCountUp";

// Leaflet touches `window` at import time, so it can only render client-side.
const CentersMap = dynamic(() => import("./CentersMap"), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" aria-label="Loading map" />,
});

const POLL_MS = 20_000;
const CACHE_KEY = "civic-centers-cache";

type Filter = "all" | "space" | "full" | "closed";

function ago(iso: string, now: number): string {
  const mins = Math.round((now - Date.parse(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.round(hrs / 24)}d ago`;
}

export default function CentersView({ initialCenters, now: serverNow }: { initialCenters: EvacuationCenter[]; now: number }) {
  const now = useNow(serverNow);
  const online = useOnline();
  const geo = useGeolocation();
  const [centers, setCenters] = useState(initialCenters);
  const [fetchedAt, setFetchedAt] = useState(serverNow);
  const [stale, setStale] = useState(false);
  const [flash, setFlash] = useState<Set<number>>(new Set());
  const [barangay, setBarangay] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const prev = useRef(new Map(initialCenters.map((c) => [c.id, c.currentOccupancy])));

  // Live occupancy: poll, animate changes, keep the last good copy for offline.
  useEffect(() => {
    const apply = (next: EvacuationCenter[], at: number) => {
      const changed = next.filter((c) => prev.current.has(c.id) && prev.current.get(c.id) !== c.currentOccupancy);
      prev.current = new Map(next.map((c) => [c.id, c.currentOccupancy]));
      setCenters(next);
      setFetchedAt(at);
      if (changed.length) {
        setFlash(new Set(changed.map((c) => c.id)));
        window.setTimeout(() => setFlash(new Set()), 2000);
      }
    };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ centers: initialCenters, at: serverNow }));
    } catch {}

    const poll = async () => {
      try {
        const res = await fetch("/api/centers", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        apply(data.centers, Date.now());
        setStale(false);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ centers: data.centers, at: Date.now() }));
        } catch {}
      } catch {
        setStale(true);
      }
    };
    const t = window.setInterval(poll, POLL_MS);
    window.addEventListener("online", poll);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("online", poll);
    };
  }, [initialCenters, serverNow]);

  const gps = geo.status === "granted" ? { lat: geo.lat, lng: geo.lng } : null;
  const picked = BARANGAYS.find((b) => b.name === barangay);
  const originKey = gps ? `${gps.lat},${gps.lng}` : picked ? picked.name : "";
  const origin = useMemo(
    () => gps ?? (picked ? { lat: picked.lat, lng: picked.lng } : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [originKey]
  );
  const locating = geo.status === "idle" || geo.status === "loading";

  const nearest = origin ? findNearestOpenCenter(origin, centers) : null;

  const counts = centers.reduce<Record<CapacityStatus, number>>(
    (acc, c) => ({ ...acc, [getCapacityStatus(c)]: acc[getCapacityStatus(c)] + 1 }),
    { open: 0, "near-full": 0, full: 0, closed: 0 }
  );

  const sorted = [...centers]
    .map((c) => ({ c, km: origin ? distanceKm(origin, c) : null, status: getCapacityStatus(c) }))
    .filter(({ status }) =>
      filter === "all"
        ? true
        : filter === "space"
          ? status === "open" || status === "near-full"
          : status === filter
    )
    .sort((a, b) => {
      const rank = (s: CapacityStatus) => (s === "closed" ? 2 : s === "full" ? 1 : 0);
      if (rank(a.status) !== rank(b.status)) return rank(a.status) - rank(b.status);
      if (a.km !== null && b.km !== null) return a.km - b.km;
      return spacesLeft(b.c) - spacesLeft(a.c);
    });

  const showOnMap = (id: number) => {
    setSelectedId(id);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Catarman · MDRRMO</p>
        <h1 className={styles.title}>Evacuation Centers</h1>
        <p className={styles.live} suppressHydrationWarning>
          {online && !stale ? (
            <>
              <span className={styles.liveDot} aria-hidden /> Live capacity · updated {ago(new Date(fetchedAt).toISOString(), now)}
            </>
          ) : (
            <>
              <Icon name="clock" className="h-4 w-4" /> Offline · showing the last update from{" "}
              {new Date(fetchedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </>
          )}
        </p>
      </header>

      <Hero
        locating={locating && !picked}
        origin={origin}
        viaBarangay={!gps && !!picked}
        nearest={nearest}
        needsBarangay={!gps && !locating}
        barangay={barangay}
        onBarangay={setBarangay}
        onShowOnMap={showOnMap}
      />

      <div className={styles.chips} role="group" aria-label="Filter centers">
        <Chip on={filter === "all"} onClick={() => setFilter("all")} label={`All (${centers.length})`} />
        <Chip
          on={filter === "space"}
          onClick={() => setFilter("space")}
          label={`Has space (${counts.open + counts["near-full"]})`}
          color={STATUS_COLOR.open}
        />
        <Chip on={filter === "full"} onClick={() => setFilter("full")} label={`Full (${counts.full})`} color={STATUS_COLOR.full} />
        {counts.closed > 0 && (
          <Chip
            on={filter === "closed"}
            onClick={() => setFilter("closed")}
            label={`Closed (${counts.closed})`}
            color={STATUS_COLOR.closed}
          />
        )}
      </div>

      <div ref={mapRef} className={styles.mapBox}>
        <CentersMap
          centers={centers}
          origin={origin}
          nearestId={nearest?.id ?? null}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <ul className={styles.list} key={filter}>
        {sorted.map(({ c, km, status }, i) => (
          <CenterCard
            key={c.id}
            center={c}
            km={km}
            status={status}
            index={i}
            now={now}
            nearest={c.id === nearest?.id}
            selected={c.id === selectedId}
            flashing={flash.has(c.id)}
            onShowOnMap={() => showOnMap(c.id)}
          />
        ))}
        {sorted.length === 0 && <li className={styles.empty}>No centers match this filter.</li>}
      </ul>
    </main>
  );
}

function Chip({ on, onClick, label, color }: { on: boolean; onClick: () => void; label: string; color?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      className={`${styles.chip} ${on ? styles.chipOn : ""}`}
      style={color ? ({ "--st": color } as CSSProperties) : undefined}
      onClick={onClick}
    >
      {color && <span className={styles.chipDot} aria-hidden />}
      {label}
    </button>
  );
}

function Hero({
  locating,
  origin,
  viaBarangay,
  nearest,
  needsBarangay,
  barangay,
  onBarangay,
  onShowOnMap,
}: {
  locating: boolean;
  origin: { lat: number; lng: number } | null;
  viaBarangay: boolean;
  nearest: (EvacuationCenter & { distanceKm: number }) | null;
  needsBarangay: boolean;
  barangay: string;
  onBarangay: (b: string) => void;
  onShowOnMap: (id: number) => void;
}) {
  const left = useCountUp(nearest ? spacesLeft(nearest) : 0);

  const picker = needsBarangay && (
    <label className={styles.pick}>
      <span>{viaBarangay ? "Measuring from" : "Location is off. Choose your barangay:"}</span>
      <select value={barangay} onChange={(e) => onBarangay(e.target.value)} aria-label="Your barangay">
        <option value="">Select barangay…</option>
        {BARANGAYS.map((b) => (
          <option key={b.name} value={b.name}>
            {b.name}
          </option>
        ))}
      </select>
    </label>
  );

  if (locating) {
    return (
      <section className={`${styles.hero} ${styles.heroLoading}`} aria-busy="true">
        <span className={styles.heroEyebrow}>Finding the nearest open center…</span>
        <span className={`skeleton ${styles.skelLine}`} />
        <span className={`skeleton ${styles.skelLineShort}`} />
      </section>
    );
  }

  if (!origin) {
    return <section className={`${styles.hero} ${styles.heroNeutral}`}>{picker}</section>;
  }

  if (!nearest) {
    return (
      <section className={`${styles.hero} ${styles.heroFull}`} role="alert">
        <span className={styles.heroEyebrow}>All centers are full</span>
        <span className={styles.heroTitle}>Every designated center is at capacity.</span>
        <span className={styles.heroMeta}>Contact MDRRMO or your barangay officials for the next overflow site.</span>
        {picker}
      </section>
    );
  }

  const ratio = Math.min(1, getOccupancyRatio(nearest));
  return (
    <section className={styles.hero} aria-label="Nearest open center">
      <span className={styles.heroEyebrow}>
        <Icon name="shield" className="h-4 w-4" />
        Your nearest open center
      </span>
      <span className={styles.heroTitle}>{nearest.name}</span>
      <span className={styles.heroMeta}>
        Brgy. {nearest.barangay} · {nearest.distanceKm.toFixed(1)} km · ~{walkMinutes(nearest.distanceKm)} min walk
        {viaBarangay && " (from your barangay)"}
      </span>
      <div className={styles.heroCap}>
        <span className={styles.heroSpaces}>
          <strong>{left.toLocaleString()}</strong> spaces left
        </span>
        <span className={styles.heroPct}>{Math.round(ratio * 100)}% full</span>
      </div>
      <div className={styles.heroBar} aria-hidden>
        <span style={{ "--w": `${ratio * 100}%` } as CSSProperties} />
      </div>
      <div className={styles.heroActions}>
        <a href={directionsUrl(nearest)} target="_blank" rel="noopener noreferrer" className={styles.heroPrimary}>
          <Icon name="arrowUpRight" className="h-5 w-5" />
          Directions
        </a>
        <button type="button" className={styles.heroSecondary} onClick={() => onShowOnMap(nearest.id)}>
          <Icon name="map" className="h-5 w-5" />
          Show on map
        </button>
      </div>
      {nearest.contact && (
        <a href={`tel:${nearest.contact.replace(/[^\d+]/g, "")}`} className={styles.heroContact}>
          Call center: {nearest.contact}
        </a>
      )}
      {picker}
    </section>
  );
}

function CenterCard({
  center,
  km,
  status,
  index,
  now,
  nearest,
  selected,
  flashing,
  onShowOnMap,
}: {
  center: EvacuationCenter;
  km: number | null;
  status: CapacityStatus;
  index: number;
  now: number;
  nearest: boolean;
  selected: boolean;
  flashing: boolean;
  onShowOnMap: () => void;
}) {
  const ratio = Math.min(1, getOccupancyRatio(center));
  const occupancy = useCountUp(center.currentOccupancy);
  const style = {
    "--st": STATUS_COLOR[status],
    "--i": Math.min(index, 8),
    "--w": `${status === "closed" ? 0 : ratio * 100}%`,
  } as CSSProperties;

  return (
    <li
      className={`${styles.card} ${selected ? styles.cardSelected : ""} ${flashing ? styles.cardFlash : ""}`}
      style={style}
    >
      <button type="button" className={styles.cardMain} onClick={onShowOnMap}>
        <span className={styles.cardTop}>
          <span className={styles.cardName}>{center.name}</span>
          <span className={styles.status}>{STATUS_LABEL[status]}</span>
        </span>
        <span className={styles.cardMeta}>
          Brgy. {center.barangay}
          {km !== null && ` · ${km.toFixed(1)} km`}
          {nearest && <span className={styles.nearestTag}>Nearest</span>}
        </span>
        <span className={styles.bar} aria-hidden>
          <span />
        </span>
        <span className={styles.cardNums}>
          {status === "closed" ? (
            "Not accepting evacuees"
          ) : (
            <>
              <span>
                <strong>{occupancy.toLocaleString()}</strong> / {center.capacity.toLocaleString()}
              </span>
              <span>{status === "full" ? "No space" : `${spacesLeft(center).toLocaleString()} spaces left`}</span>
            </>
          )}
        </span>
        <span className={styles.updated} suppressHydrationWarning>
          Updated {ago(center.updatedAt, now)}
        </span>
      </button>
      {status !== "closed" && (
        <a
          href={directionsUrl(center)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.dirBtn}
          aria-label={`Directions to ${center.name}`}
        >
          <Icon name="arrowUpRight" className="h-5 w-5" />
        </a>
      )}
    </li>
  );
}
