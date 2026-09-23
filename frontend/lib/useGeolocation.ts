"use client";

import { useEffect, useState } from "react";

export type GeolocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "granted"; lat: number; lng: number }
  | { status: "denied"; message: string }
  | { status: "unsupported" };

/**
 * Requests HTML5 geolocation permission on mount (Story 2.2, AC1) and
 * exposes the result. Never throws — a denial or unsupported browser just
 * falls into its own state so the caller can fall back to the town center.
 */
function isGeolocationSupported() {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>(() =>
    isGeolocationSupported() ? { status: "idle" } : { status: "unsupported" },
  );

  useEffect(() => {
    if (!isGeolocationSupported()) return;

    // Synchronous setState here just reflects that we're about to call out
    // to the Geolocation API (an external system) below — the actual
    // subscription/callback is async, this is only the "waiting" state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading" });
    const watchId = navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "granted",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setState({ status: "denied", message: error.message });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );

    return () => {
      // getCurrentPosition has no cleanup handle; watchId here is a request
      // id, not a watch handle, so nothing to clear.
      void watchId;
    };
  }, []);

  return state;
}
