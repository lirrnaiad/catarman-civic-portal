"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import type { EvacuationCenter } from "@/lib/evacuation-centers";
import { CATARMAN_TOWN_CENTER } from "@/lib/evacuation-centers";
import {
  getCapacityStatus,
  getOccupancyRatio,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@/lib/evacuation-utils";

function centerIcon(color: string, highlighted: boolean) {
  const size = highlighted ? 26 : 20;
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;
      width:${size}px;height:${size}px;
      border-radius:9999px;
      background:${color};
      border:${highlighted ? 3 : 2}px solid white;
      box-shadow:0 0 0 1px rgba(0,0,0,0.35)${highlighted ? ", 0 0 0 4px rgba(37,99,235,0.5)" : ""};
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export default function EvacuationMap({
  centers,
  userLocation,
  nearestOpenCenterId,
}: {
  centers: EvacuationCenter[];
  userLocation: { lat: number; lng: number } | null;
  nearestOpenCenterId: string | null;
}) {
  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : CATARMAN_TOWN_CENTER;

  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Defensive re-measure: if the container's real size settles after
    // Leaflet's initial measurement (font swap, a parent's flex layout
    // finishing a tick late, a dynamic-import chunk arriving mid-layout),
    // this catches Leaflet holding onto a stale, too-small size.
    const map = mapRef.current;
    if (!map) return;
    const raf = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <MapContainer
      ref={mapRef}
      center={mapCenter}
      zoom={13}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={8}
          pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.9 }}
        >
          <Popup>Your location</Popup>
        </CircleMarker>
      )}

      {centers.map((center) => {
        const status = getCapacityStatus(center);
        const highlighted = center.id === nearestOpenCenterId;
        return (
          <Marker
            key={center.id}
            position={[center.lat, center.lng]}
            icon={centerIcon(STATUS_COLOR[status], highlighted)}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong>{center.name}</strong>
                {highlighted && (
                  <div style={{ color: "#2563eb", fontWeight: 600, fontSize: 12 }}>
                    Nearest open center
                  </div>
                )}
                <div>Brgy. {center.barangay}</div>
                <div>
                  {center.currentOccupancy.toLocaleString()} /{" "}
                  {center.capacity.toLocaleString()} occupied (
                  {Math.round(getOccupancyRatio(center) * 100)}%)
                </div>
                <div style={{ color: STATUS_COLOR[status], fontWeight: 600 }}>
                  {STATUS_LABEL[status]}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
