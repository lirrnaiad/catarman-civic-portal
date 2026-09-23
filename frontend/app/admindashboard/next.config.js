// Story 1.2 — PWA app shell.
//
// Requires: npm install next-pwa
//
// next-pwa generates a service worker at build time (public/sw.js) that
// precaches the built static assets and the app shell, and registers itself
// automatically on page load. Nothing else in the app needs to call
// navigator.serviceWorker.register manually.
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // easier local debugging; test PWA behavior with `next build && next start`
  runtimeCaching: [
    {
      // App shell + pages: serve from cache first so the shell loads offline,
      // then update the cache in the background for next time.
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages-cache",
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      // Map tiles: cache aggressively so a previously-viewed map area still
      // renders offline.
      urlPattern: /^https:\/\/[a-z]\.tile\.openstreetmap\.org\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "map-tiles",
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
