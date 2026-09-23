"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Icon from "@/components/Icon";
import { nearestBarangay } from "@/lib/barangays";
import type { GeoLocation } from "@/lib/types";
import styles from "./LocationPicker.module.css";

// Leaflet's default marker images don't resolve correctly under most
// bundlers. Using an inline SVG divIcon avoids shipping/resolving image
// assets entirely. The wrapper class runs a short drop-and-bounce.
const pinIcon = L.divIcon({
  className: styles.pinIcon,
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 0C7.6 0 0 7.6 0 17c0 12.7 17 27 17 27s17-14.3 17-27C34 7.6 26.4 0 17 0z" fill="#1d4ed8"/>
    <circle cx="17" cy="17" r="7" fill="#fff"/>
  </svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
});

type LocateState = "idle" | "locating" | "gps" | "manual" | "error";

interface LocationPickerProps {
  value: GeoLocation | null;
  onChange: (location: GeoLocation) => void;
  /** Map center used before any location is known. Configure for your deployment area. */
  initialCenter?: [number, number];
  initialZoom?: number;
}

function ClickToPlace({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPlace(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** MapContainer's center is only the initial view; follow the pin after that. */
function FollowPin({ value }: { value: GeoLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (value) map.panTo([value.lat, value.lng], { animate: true });
  }, [map, value]);
  return null;
}

export default function LocationPicker({
  value,
  onChange,
  initialCenter = [12.4994, 124.6328], // Catarman, Northern Samar — override per deployment
  initialZoom = 15,
}: LocationPickerProps) {
  const [state, setState] = useState<LocateState>(value ? "manual" : "idle");
  const autoTried = useRef(false);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState("error");
      return;
    }
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setState("gps");
      },
      () => setState("error"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [onChange]);

  // Find the reporter automatically when the form opens; the button stays for retries.
  useEffect(() => {
    if (autoTried.current || value) return;
    autoTried.current = true;
    locate();
  }, [locate, value]);

  const place = (lat: number, lng: number, accuracy?: number) => {
    onChange({ lat, lng, accuracy });
    setState("manual");
  };

  const near = value ? nearestBarangay(value.lat, value.lng) : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.status} role="status" aria-live="polite">
        {state === "locating" && (
          <>
            <span className={styles.spinner} aria-hidden />
            Finding your location…
          </>
        )}
        {(state === "gps" || state === "manual") && value && (
          <>
            <span className={styles.statusOk} aria-hidden>
              <Icon name="check" className="h-3.5 w-3.5" />
            </span>
            <span>
              {state === "gps" ? "Using your location" : "Pin set"} · near <strong>Brgy. {near}</strong>
              {state === "gps" && value.accuracy ? ` (±${Math.round(value.accuracy)} m)` : ""}
            </span>
          </>
        )}
        {state === "error" && (
          <span className={styles.statusWarn}>Couldn&apos;t get your location. Tap the map to drop a pin.</span>
        )}
        {state === "idle" && <span>Tap the map to drop a pin.</span>}
      </div>

      <div className={styles.mapShell}>
        <MapContainer
          center={value ? [value.lat, value.lng] : initialCenter}
          zoom={initialZoom}
          scrollWheelZoom={false}
          className={styles.map}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPlace={(lat, lng) => place(lat, lng)} />
          <FollowPin value={value} />
          {value && (
            <Marker
              // Remount on every move so the drop animation replays.
              key={`${value.lat.toFixed(6)},${value.lng.toFixed(6)}`}
              position={[value.lat, value.lng]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const pos = (e.target as L.Marker).getLatLng();
                  place(pos.lat, pos.lng, value.accuracy);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.locateBtn} onClick={locate} disabled={state === "locating"}>
          <Icon name="crosshair" className="h-4 w-4" />
          {state === "locating" ? "Finding you…" : "Use my location"}
        </button>
        <span className={styles.hint}>Drag the pin or tap the map to adjust.</span>
      </div>
    </div>
  );
}
