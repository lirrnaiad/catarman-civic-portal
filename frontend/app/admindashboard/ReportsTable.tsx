"use client";

import Icon, { type IconName } from "@/components/Icon";
import {
  CATEGORY_COLORS,
  DEFAULT_CATEGORIES,
  REPORT_STATUSES,
  type AdminReport,
  type ReportStatus,
} from "@/lib/types";
import styles from "./ReportsTable.module.css";

export interface Filters {
  category: string;
  barangay: string;
  status: string;
}

interface ReportsTableProps {
  reports: AdminReport[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: ReportStatus) => void;
  /** Phones: jump from a card to that report on the map. */
  onShowOnMap?: (id: string) => void;
}

const CATEGORY_ICON: Record<string, IconName> = {
  flood_landslide: "waves",
  garbage: "trash",
  crime: "siren",
  infrastructure: "wrench",
};

const categoryLabel = (value: string) =>
  DEFAULT_CATEGORIES.find((c) => c.value === value)?.label ?? value;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function StatusSelect({
  report,
  onStatusChange,
}: {
  report: AdminReport;
  onStatusChange: (id: string, status: ReportStatus) => void;
}) {
  return (
    <select
      aria-label={`Status of report ${report.id.slice(0, 8)}`}
      className={`${styles.statusSelect} ${styles[`status_${report.status}`]}`}
      value={report.status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onStatusChange(report.id, e.target.value as ReportStatus)}
    >
      {REPORT_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`${styles.chip} ${active ? styles.chipActive : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function ReportsTable({
  reports,
  filters,
  onFiltersChange,
  selectedId,
  onSelect,
  onStatusChange,
  onShowOnMap,
}: ReportsTableProps) {
  const set = (patch: Partial<Filters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <div className={styles.wrap}>
      <div className={styles.filters}>
        <div className={styles.chipRow} role="group" aria-label="Filter by category">
          <Chip active={!filters.category} onClick={() => set({ category: "" })}>
            All
          </Chip>
          {DEFAULT_CATEGORIES.map((c) => (
            <Chip key={c.value} active={filters.category === c.value} onClick={() => set({ category: c.value })}>
              <Icon name={CATEGORY_ICON[c.value] ?? "alert"} className="h-4 w-4" />
              {c.label}
            </Chip>
          ))}
        </div>
        <div className={styles.chipRow} role="group" aria-label="Filter by status">
          <Chip active={!filters.status} onClick={() => set({ status: "" })}>
            Any status
          </Chip>
          {REPORT_STATUSES.map((s) => (
            <Chip key={s.value} active={filters.status === s.value} onClick={() => set({ status: s.value })}>
              <span className={`${styles.dot} ${styles[`dot_${s.value}`]}`} aria-hidden />
              {s.label}
            </Chip>
          ))}
        </div>
        <label className={styles.search}>
          <Icon name="search" className="h-4 w-4" />
          <input
            type="search"
            placeholder="Search barangay"
            aria-label="Filter by barangay"
            value={filters.barangay}
            onChange={(e) => set({ barangay: e.target.value })}
          />
        </label>
      </div>

      {reports.length === 0 && <p className={styles.empty}>No reports match these filters.</p>}

      {/* Phones and tablets: cards */}
      <ul className={styles.cards}>
        {reports.map((r) => (
          <li
            key={r.id}
            className={`${styles.card} ${r.id === selectedId ? styles.cardSelected : ""}`}
            onClick={() => onSelect(r.id)}
          >
            <div className={styles.cardTop}>
              <span
                className={styles.cardIcon}
                style={{ color: CATEGORY_COLORS[r.category], background: `${CATEGORY_COLORS[r.category]}1a` }}
                aria-hidden
              >
                <Icon name={CATEGORY_ICON[r.category] ?? "alert"} className="h-5 w-5" />
              </span>
              <div className={styles.cardHeading}>
                <strong>{categoryLabel(r.category)}</strong>
                <span className={styles.cardMeta} suppressHydrationWarning>
                  {r.barangay ? `Brgy. ${r.barangay}` : "Barangay not given"} · {timeAgo(r.receivedAt)}
                </span>
              </div>
            </div>
            <p className={r.description ? styles.cardDesc : styles.cardDescEmpty}>
              {r.description || "No description"}
            </p>
            <div className={styles.cardActions}>
              <StatusSelect report={r} onStatusChange={onStatusChange} />
              {r.photos.length > 0 && (
                <span className={styles.cardPhotos}>
                  <Icon name="camera" className="h-4 w-4" />
                  {r.photos.length}
                </span>
              )}
              {onShowOnMap && (
                <button
                  type="button"
                  className={styles.mapBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowOnMap(r.id);
                  }}
                >
                  <Icon name="map" className="h-4 w-4" />
                  Map
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      {reports.length > 0 && (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Barangay</th>
                <th>Description</th>
                <th>Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className={r.id === selectedId ? styles.rowSelected : styles.row}
                  onClick={() => onSelect(r.id)}
                >
                  <td>{categoryLabel(r.category)}</td>
                  <td>{r.barangay || "—"}</td>
                  <td className={styles.descriptionCell}>{r.description || "—"}</td>
                  {/* Relative to "now", so server and browser can differ by a minute. */}
                  <td suppressHydrationWarning>{timeAgo(r.receivedAt)}</td>
                  <td>
                    <StatusSelect report={r} onStatusChange={onStatusChange} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
