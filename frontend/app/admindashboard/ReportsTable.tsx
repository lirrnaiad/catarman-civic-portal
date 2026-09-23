"use client";

import { DEFAULT_CATEGORIES, REPORT_STATUSES, type AdminReport, type ReportStatus } from "@/lib/types";
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
}

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

export default function ReportsTable({
  reports,
  filters,
  onFiltersChange,
  selectedId,
  onSelect,
  onStatusChange,
}: ReportsTableProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.filters}>
        <select
          className={styles.filterInput}
          value={filters.category}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
        >
          <option value="">All categories</option>
          {DEFAULT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <input
          className={styles.filterInput}
          type="text"
          placeholder="Filter by barangay"
          value={filters.barangay}
          onChange={(e) => onFiltersChange({ ...filters, barangay: e.target.value })}
        />

        <select
          className={styles.filterInput}
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
        >
          <option value="">All statuses</option>
          {REPORT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

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
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  No reports match these filters.
                </td>
              </tr>
            )}
            {reports.map((r) => (
              <tr
                key={r.id}
                className={r.id === selectedId ? styles.rowSelected : styles.row}
                onClick={() => onSelect(r.id)}
              >
                <td>{categoryLabel(r.category)}</td>
                <td>{r.barangay || "—"}</td>
                <td className={styles.descriptionCell}>{r.description}</td>
                <td>{timeAgo(r.receivedAt)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select
                    className={`${styles.statusSelect} ${styles[`status_${r.status}`]}`}
                    value={r.status}
                    onChange={(e) => onStatusChange(r.id, e.target.value as ReportStatus)}
                  >
                    {REPORT_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
