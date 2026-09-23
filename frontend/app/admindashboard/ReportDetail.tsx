"use client";

import { useEffect, useRef, useState } from "react";
import Icon, { type IconName } from "@/components/Icon";
import { TZ } from "@/lib/eventFormat";
import { directionsUrl } from "@/lib/evacuation-utils";
import {
  CATEGORY_COLORS,
  DEFAULT_CATEGORIES,
  REPORT_STATUSES,
  type AdminReport,
  type ReportPhoto,
  type ReportStatus,
} from "@/lib/types";
import styles from "./ReportDetail.module.css";

const CATEGORY_ICON: Record<string, IconName> = {
  flood_landslide: "waves",
  garbage: "trash",
  crime: "siren",
  infrastructure: "wrench",
};

const categoryLabel = (value: string) => DEFAULT_CATEGORIES.find((c) => c.value === value)?.label ?? value;

const fullTime = (iso: string) =>
  new Intl.DateTimeFormat("en-PH", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

interface ReportDetailProps {
  report: AdminReport;
  onClose: () => void;
  onStatusChange: (id: string, status: ReportStatus) => void;
  onShowOnMap: (id: string) => void;
}

/**
 * The whole report: full description, photos, contact and location.
 * A bottom sheet on phones, a right-hand drawer on wider screens, so the
 * list (and map) stay in place behind it. Esc or the backdrop closes it.
 */
export default function ReportDetail({ report, onClose, onStatusChange, onShowOnMap }: ReportDetailProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  // The list omits photo data (it polls every 15s); fetch it for this report.
  const [photos, setPhotos] = useState<{ id: string; list: ReportPhoto[] } | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const expectsPhotos = report.photos.length > 0;

  useEffect(() => {
    if (!expectsPhotos) return;
    let cancelled = false;
    fetch(`/api/reports/${encodeURIComponent(report.id)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setPhotos({ id: report.id, list: data.report.photos });
      })
      .catch(() => {
        if (!cancelled) setPhotoError(report.id);
      });
    return () => {
      cancelled = true;
    };
  }, [report.id, expectsPhotos]);

  // Focus the dialog, close on Esc, and keep the page behind from scrolling.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const color = CATEGORY_COLORS[report.category];
  const loadedPhotos = photos?.id === report.id ? photos.list : null;
  // Offline-queued reports reach us later than they were made: show both times then.
  const sentLate = Date.parse(report.receivedAt) - Date.parse(report.createdAt) > 5 * 60_000;
  const phone = report.reporterContact?.replace(/[^\d+]/g, "");

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden />
        <header className={styles.head}>
          <span className={styles.catIcon} style={{ color, background: `${color}1a` }} aria-hidden>
            <Icon name={CATEGORY_ICON[report.category] ?? "alert"} className="h-5 w-5" />
          </span>
          <div className={styles.headText}>
            <h2 id="report-detail-title">{categoryLabel(report.category)}</h2>
            <p>{report.barangay ? `Brgy. ${report.barangay}` : "Barangay not given"}</p>
          </div>
          <button ref={closeRef} type="button" className={styles.closeBtn} aria-label="Close report" onClick={onClose}>
            <Icon name="close" className="h-5 w-5" />
          </button>
        </header>

        <div className={styles.body}>
          <label className={styles.statusRow}>
            <span>Status</span>
            <select
              className={`${styles.status} ${styles[`status_${report.status}`]}`}
              value={report.status}
              onChange={(e) => onStatusChange(report.id, e.target.value as ReportStatus)}
            >
              {REPORT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <section className={styles.section} aria-labelledby="report-desc">
            <h3 id="report-desc">What was reported</h3>
            {report.description ? (
              <p className={styles.description}>{report.description}</p>
            ) : (
              <p className={styles.muted}>No description given.</p>
            )}
          </section>

          {expectsPhotos && (
            <section className={styles.section} aria-labelledby="report-photos">
              <h3 id="report-photos">Photos ({report.photos.length})</h3>
              {loadedPhotos ? (
                <div className={styles.photos}>
                  {loadedPhotos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, not an optimizable asset
                    <img key={i} src={p.dataUrl} alt={`Photo ${i + 1} of the report`} loading="lazy" />
                  ))}
                </div>
              ) : photoError === report.id ? (
                <p className={styles.muted}>Couldn&apos;t load the photos. Close and reopen to retry.</p>
              ) : (
                <div className={styles.photos}>
                  {report.photos.map((_, i) => (
                    <div key={i} className={`${styles.photoSkeleton} skeleton`} aria-label="Loading photo" />
                  ))}
                </div>
              )}
            </section>
          )}

          <dl className={styles.facts}>
            <div>
              <dt>
                <Icon name="clock" className="h-4 w-4" /> Received
              </dt>
              <dd>{fullTime(report.receivedAt)}</dd>
            </div>
            {sentLate && (
              <div>
                <dt>
                  <Icon name="clock" className="h-4 w-4" /> Made offline
                </dt>
                <dd>{fullTime(report.createdAt)}</dd>
              </div>
            )}
            <div>
              <dt>
                <Icon name="phone" className="h-4 w-4" /> Contact
              </dt>
              <dd>
                {phone ? <a href={`tel:${phone}`}>{report.reporterContact}</a> : report.reporterContact || "Not given"}
              </dd>
            </div>
            <div>
              <dt>
                <Icon name="mapPin" className="h-4 w-4" /> Location
              </dt>
              <dd>
                {report.location.lat.toFixed(5)}, {report.location.lng.toFixed(5)}
                {report.location.accuracy != null && (
                  <span className={styles.muted}> · ±{Math.round(report.location.accuracy)} m</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <footer className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={() => onShowOnMap(report.id)}>
            <Icon name="map" className="h-4 w-4" />
            Show on map
          </button>
          <a className={styles.primary} href={directionsUrl(report.location)} target="_blank" rel="noopener noreferrer">
            Directions
            <Icon name="arrowUpRight" className="h-4 w-4" />
          </a>
        </footer>
        <p className={styles.ref}>Ref. {report.id.replace(/-/g, "").slice(0, 8).toUpperCase()}</p>
      </div>
    </div>
  );
}
