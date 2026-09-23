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
  // Visual dot stays compact so markers don't crowd each other at street
  // level, but the icon's own box is padded out for a larger, easier tap
  // target on mobile than the dot alone would give.
  const dot = highlighted ? 22 : 16;
  const box = highlighted ? 34 : 28;
  const offset = (box - dot) / 2;
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block; position:relative; width:${box}px; height:${box}px;
    ">
      <span style="
        position:absolute; left:${offset}px; top:${offset}px;
        width:${dot}px; height:${dot}px;
        border-radius:9999px;
        background:${color};
        border:${highlighted ? 3 : 2}px solid white;
        box-shadow:0 1px 3px rgba(0,0,0,0.4)${highlighted ? ", 0 0 0 4px rgba(37,99,235,0.5)" : ""};
      "></span>
    </span>`,
    iconSize: [box, box],
    iconAnchor: [box / 2, box / 2],
    popupAnchor: [0, -box / 2],
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
          pathOptions={{ color: "#1d4ed8", fillColor: "#1d4ed8", fillOpacity: 0.9 }}
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
            <Popup minWidth={200}>
              <div className="space-y-1.5 text-sm">
                <p className="font-semibold text-slate-900">{center.name}</p>
                {highlighted && (
                  <p className="text-xs font-semibold text-civic">
                    Nearest open center
                  </p>
                )}
                <p className="text-slate-600">Brgy. {center.barangay}</p>
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLOR[status] }}
                  />
                  <span className="font-medium" style={{ color: STATUS_COLOR[status] }}>
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="text-slate-500">
                    · {center.currentOccupancy.toLocaleString()} /{" "}
                    {center.capacity.toLocaleString()} (
                    {Math.round(getOccupancyRatio(center) * 100)}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round(getOccupancyRatio(center) * 100))}%`,
                      backgroundColor: STATUS_COLOR[status],
                    }}
                  />
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
