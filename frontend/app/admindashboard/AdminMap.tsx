"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CATEGORY_COLORS,
  DEFAULT_CATEGORIES,
  REPORT_STATUSES,
  type AdminReport,
  type ReportStatus,
} from "@/app/lib/types";
import styles from "./AdminMap.module.css";

const categoryLabel = (value: string) =>
  DEFAULT_CATEGORIES.find((c) => c.value === value)?.label ?? value;

function pinIcon(color: string, dimmed: boolean) {
  return L.divIcon({
    className: styles.pinIcon,
    html: `<svg width="28" height="36" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" style="opacity:${dimmed ? 0.45 : 1}">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12.7 17 27 17 27s17-14.3 17-27C34 7.6 26.4 0 17 0z" fill="${color}"/>
      <circle cx="17" cy="17" r="7" fill="#fff"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
  });
}

function FlyToSelected({ reports, selectedId }: { reports: AdminReport[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    const selected = reports.find((r) => r.id === selectedId);
    if (selected) {
      map.flyTo([selected.location.lat, selected.location.lng], Math.max(map.getZoom(), 15), {
        duration: 0.6,
      });
    }
    // Only re-run when the selection changes, not on every report update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);
  return null;
}

interface AdminMapProps {
  reports: AdminReport[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: ReportStatus) => void;
  center?: [number, number];
}

export default function AdminMap({
  reports,
  selectedId,
  onSelect,
  onStatusChange,
  center = [14.5995, 120.9842],
}: AdminMapProps) {
  const mapCenter = useMemo<[number, number]>(() => {
    if (reports.length === 0) return center;
    const withLoc = reports[0];
    return [withLoc.location.lat, withLoc.location.lng];
  }, [reports, center]);

  return (
    <div className={styles.shell}>
      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom className={styles.map}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToSelected reports={reports} selectedId={selectedId} />
        {reports.map((r) => (
          <Marker
            key={r.id}
            position={[r.location.lat, r.location.lng]}
            icon={pinIcon(CATEGORY_COLORS[r.category], r.status === "resolved")}
            eventHandlers={{ click: () => onSelect(r.id) }}
          >
            <Popup>
              <div className={styles.popup}>
                <strong>{categoryLabel(r.category)}</strong>
                {r.barangay && <div className={styles.popupBarangay}>{r.barangay}</div>}
                <p className={styles.popupDescription}>{r.description}</p>
                <label className={styles.popupStatusLabel}>
                  Status
                  <select
                    value={r.status}
                    onChange={(e) => onStatusChange(r.id, e.target.value as ReportStatus)}
                  >
                    {REPORT_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {selectedId && <div className={styles.selectionNote}>Showing report {selectedId}</div>}
    </div>
  );
}
