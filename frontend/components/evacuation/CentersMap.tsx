"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { CATARMAN_TOWN_CENTER, type EvacuationCenter } from "@/lib/evacuation-centers";
import { getCapacityStatus, spacesLeft, STATUS_COLOR, STATUS_LABEL } from "@/lib/evacuation-utils";
import styles from "./centers.module.css";

function centerIcon(color: string, nearest: boolean, selected: boolean) {
  // Small dot, padded tap box; the nearest open center gets a pulsing ring.
  const dot = nearest || selected ? 22 : 16;
  const box = 40;
  return L.divIcon({
    className: "",
    html: `<span class="${styles.pin}" style="width:${box}px;height:${box}px">
      ${nearest ? `<span class="${styles.pinPulse}" style="background:${color}"></span>` : ""}
      <span class="${styles.pinDot}" style="width:${dot}px;height:${dot}px;background:${color};${
        selected ? "box-shadow:0 0 0 4px rgba(29,78,216,.45),0 2px 6px rgba(0,0,0,.35)" : ""
      }"></span>
    </span>`,
    iconSize: [box, box],
    iconAnchor: [box / 2, box / 2],
    popupAnchor: [0, -14],
  });
}

/** Leaflet keeps its first measured size; re-measure when the box changes. */
function ResizeWatcher() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function FlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    const size = map.getSize();
    if (!size.x || !size.y) return; // hidden: flyTo on a 0x0 map yields NaN
    map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 15), { duration: 0.7 });
  }, [map, target]);
  return null;
}

export default function CentersMap({
  centers,
  origin,
  nearestId,
  selectedId,
  onSelect,
}: {
  centers: EvacuationCenter[];
  origin: { lat: number; lng: number } | null;
  nearestId: number | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const selected = centers.find((c) => c.id === selectedId) ?? null;
  return (
    <MapContainer
      center={origin ? [origin.lat, origin.lng] : CATARMAN_TOWN_CENTER}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ResizeWatcher />
      <FlyTo target={selected} />

      {origin && (
        <CircleMarker
          center={[origin.lat, origin.lng]}
          radius={8}
          pathOptions={{ color: "#fff", weight: 3, fillColor: "#1d4ed8", fillOpacity: 1 }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>
      )}

      {centers.map((center) => {
        const status = getCapacityStatus(center);
        return (
          <Marker
            key={`${center.id}-${status}-${center.id === nearestId}-${center.id === selectedId}`}
            position={[center.lat, center.lng]}
            icon={centerIcon(STATUS_COLOR[status], center.id === nearestId, center.id === selectedId)}
            eventHandlers={{ click: () => onSelect(center.id) }}
          >
            <Popup>
              <strong>{center.name}</strong>
              <br />
              <span style={{ color: STATUS_COLOR[status], fontWeight: 700 }}>{STATUS_LABEL[status]}</span>
              {status !== "closed" && ` · ${spacesLeft(center).toLocaleString()} spaces left`}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
