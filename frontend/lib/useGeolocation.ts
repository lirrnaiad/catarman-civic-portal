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
  // Initial state must be identical on server and client — the server has
  // no `navigator`, so isGeolocationSupported() can't run at initializer
  // time without producing a different first paint than the client and
  // causing a hydration mismatch. "idle" is a safe, environment-independent
  // starting point; the real detection happens below, in an effect, which
  // only ever runs client-side after hydration.
  const [state, setState] = useState<GeolocationState>({ status: "idle" });

  useEffect(() => {
    // Both of these setState calls are synchronizing React with an external
    // system (the browser's Geolocation API) per the effect's own job, not
    // state that could have been computed during render — see note above on
    // why "unsupported" can't be the initial value.
    if (!isGeolocationSupported()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "unsupported" });
      return;
    }

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
