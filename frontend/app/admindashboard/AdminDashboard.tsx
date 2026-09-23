"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { AdminReport, ReportStatus } from "@/lib/types";
import Icon from "@/components/Icon";
import ReportsTable, { type Filters } from "./ReportsTable";
import styles from "./AdminDashboard.module.css";

const AdminMap = dynamic(() => import("./AdminMap"), {
  ssr: false,
  loading: () => <div className={`${styles.mapPlaceholder} skeleton`} aria-label="Loading map" />,
});

const POLL_INTERVAL_MS = 15_000;

interface AdminDashboardProps {
  initialReports: AdminReport[];
}

export default function AdminDashboard({ initialReports }: AdminDashboardProps) {
  const [reports, setReports] = useState<AdminReport[]>(initialReports);
  const [filters, setFilters] = useState<Filters>({ category: "", barangay: "", status: "" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  // Phones show one view at a time; desktop shows both side by side.
  const [view, setView] = useState<"list" | "map">("list");

  const fetchReports = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.barangay) params.set("barangay", filters.barangay);
    if (filters.status) params.set("status", filters.status);

    try {
      const res = await fetch(`/api/reports?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setReports(data.reports);
      setLastFetchedAt(new Date());
    } catch {
      // Dashboard just keeps showing the last-known list; the next poll retries.
    }
  }, [filters]);

  // Re-fetch whenever filters change, and poll while the tab is open so new
  // submissions from the report form show up without a manual refresh.
  useEffect(() => {
    fetchReports();
    const interval = window.setInterval(fetchReports, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [fetchReports]);

  const handleStatusChange = useCallback(async (id: string, status: ReportStatus) => {
    // Optimistic update so the click feels immediate.
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch {
      // Revert on failure by re-pulling the source of truth.
      fetchReports();
    }
  }, [fetchReports]);

  const counts = {
    new: reports.filter((r) => r.status === "new").length,
    in_progress: reports.filter((r) => r.status === "in_progress").length,
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Reports</h1>
          <p className={styles.subtitle}>
            <span className={styles.countNew}>{counts.new} new</span>
            {" · "}
            {counts.in_progress} in progress · {reports.length} shown
            {lastFetchedAt ? ` · updated ${lastFetchedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}
          </p>
        </div>
        <div className={styles.segmented} role="tablist" aria-label="View">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              className={`${styles.segment} ${view === v ? styles.segmentActive : ""}`}
              onClick={() => setView(v)}
            >
              <Icon name={v} className="h-4 w-4" />
              {v === "list" ? "List" : "Map"}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.body}>
        <div className={`${styles.mapPane} ${view === "map" ? "" : styles.hiddenOnPhone}`}>
          <AdminMap
            reports={reports}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onStatusChange={handleStatusChange}
          />
        </div>

        <div className={`${styles.listPane} ${view === "list" ? "" : styles.hiddenOnPhone}`}>
          <ReportsTable
            reports={reports}
            filters={filters}
            onFiltersChange={setFilters}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onStatusChange={handleStatusChange}
            onShowOnMap={(id) => {
              setSelectedId(id);
              setView("map");
            }}
          />
        </div>
      </div>
    </div>
  );
}
