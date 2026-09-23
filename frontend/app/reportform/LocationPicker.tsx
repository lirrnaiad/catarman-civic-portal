"use client";

import { useCallback, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoLocation } from "@/lib/types";
import styles from "./LocationPicker.module.css";

// Leaflet's default marker images don't resolve correctly under most
// bundlers. Using an inline SVG divIcon avoids shipping/resolving image
// assets entirely.
const pinIcon = L.divIcon({
  className: styles.pinIcon,
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 0C7.6 0 0 7.6 0 17c0 12.7 17 27 17 27s17-14.3 17-27C34 7.6 26.4 0 17 0z" fill="#1d4ed8"/>
    <circle cx="17" cy="17" r="7" fill="#fff"/>
  </svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
});

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

export default function LocationPicker({
  value,
  onChange,
  initialCenter = [14.5995, 120.9842], // generic PH default center — override per deployment
  initialZoom = 14,
}: LocationPickerProps) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const center = useMemo<[number, number]>(
    () => (value ? [value.lat, value.lng] : initialCenter),
    [value, initialCenter]
  );

  const useMyLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Location services aren't available on this device.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLocating(false);
      },
      () => {
        setError("Couldn't get your location. Tap the map to drop a pin instead.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onChange]);

  return (
    <div className={styles.wrap}>
      <div className={styles.mapShell}>
        <MapContainer
          center={center}
          zoom={initialZoom}
          scrollWheelZoom={false}
          className={styles.map}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPlace={(lat, lng) => onChange({ lat, lng })} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target as L.Marker;
                  const pos = marker.getLatLng();
                  onChange({ lat: pos.lat, lng: pos.lng, accuracy: value.accuracy });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.locateBtn}
          onClick={useMyLocation}
          disabled={locating}
        >
          {locating ? "Finding you…" : "Use my current location"}
        </button>
        {value && (
          <span className={styles.coords}>
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            {value.accuracy ? ` · ±${Math.round(value.accuracy)}m` : ""}
          </span>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <p className={styles.hint}>Drag the pin or tap the map to fine-tune the spot.</p>
    </div>
  );
}
