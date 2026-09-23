"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { AdminReport, ReportStatus } from "@/app/lib/types";
import ReportsTable, { type Filters } from "./ReportsTable";
import styles from "./AdminDashboard.module.css";

const AdminMap = dynamic(() => import("./AdminMap"), {
  ssr: false,
  loading: () => <div className={styles.mapPlaceholder}>Loading map…</div>,
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
      const res = await fetch(`/api/reports`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch {
      // Revert on failure by re-pulling the source of truth.
      fetchReports();
    }
  }, [fetchReports]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Reports</h1>
        <span className={styles.subtitle}>
          {reports.length} shown
          {lastFetchedAt ? ` · updated ${lastFetchedAt.toLocaleTimeString()}` : ""}
        </span>
      </header>

      <AdminMap
        reports={reports}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onStatusChange={handleStatusChange}
      />

      <ReportsTable
        reports={reports}
        filters={filters}
        onFiltersChange={setFilters}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}