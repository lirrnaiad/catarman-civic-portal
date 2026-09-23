# Handoff — Inovero (Admin Dashboard + Offline track)

**Your branch:** `feature/reports`, shared with the report form work (replaces `feature/admin-dashboard` and `feature/report-form-admin-dashboard`)
**Your stories:** 1.2 PWA App Shell · 3.2 Offline Queue (*detect reconnect + flush*) · 3.3 LGU Admin Dashboard

## What changed with the admin code

The combined report/admin branch was split so each track has its own branch. The original author keeps credit.

| Before | Now | Why |
|---|---|---|
| `app/admindashboard/*` | `app/admindashboard/*` (unchanged path) | — |
| `admindashboard/mnt/user-data/outputs/civic-report/app/api/reports/[id]/route.ts` | `app/api/reports/[id]/route.ts` | Next only routes files under `app/api/`. The status toggle returned **404** before the move |
| `PATCH` handler took `params: { id }` | `const { id } = await params` | Next 16 passes route params as a Promise. It failed the build once it was in the right place |
| `admindashboard/offlineSync.ts` | `lib/offlineSync.ts` | Sits next to the queue it flushes |
| `admindashboard/next.config.js` (next-pwa) | **removed** | Next ignores a config inside `app/`, and `next-pwa` isn't installed. See to-do #2 |
| `app/lib/*` imports | `@/lib/*` | One `lib/` folder for the whole app |
| Colors hardcoded in CSS modules | `var(--civic)`, `var(--line)`, … | Shared PRD palette. Status chips keep semantic red/amber/green |

## Start working (once)

```bash
git fetch origin
git switch feature/reports          # tracks origin/feature/reports
git merge origin/integration         # pulls in the palette/icon restyle
```


> **The app now needs MySQL.** Reports are stored in MySQL (`lib/store.ts`). Before `npm run dev`, set up the database once by following `backend/README.md` (XAMPP works). Without it, `/admindashboard` and report submission will error.

> ✅ **Already done on `integration`:** offline queue (report form saves offline, shows "Saved on this device"), reconnect sync + online/offline banner (`components/OfflineSync.tsx`, mounted in the layout), and the portal nav bar (`components/SiteNav.tsx`; the events page's own header/sidebar was removed). Don't rebuild these.

## Your to-do list (priority order)

1. **PWA app shell, Story 1.2.** Don't use `next-pwa`: it's webpack-only and unmaintained, and Next 16 builds with Turbopack. The bundled Next docs cover this:
   - `node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md`: `app/manifest.ts` and a hand-written `public/sw.js` registered from a client component. Alternatively use **Serwist**, which has a Turbopack example.
   - `node_modules/next/dist/docs/01-app/02-guides/offline-support.md`: the experimental `useOffline` hook.
   - Cache the app shell and `/api/reports` GETs (cache-then-network), then test with `npm run build && npm start` and devtools set to Offline.
   - `next.config.ts` is shared, so tell Fabia what needs adding.
2. **Role-based access, FR6.** Ordonia is building shared auth for events (Story 4.1). Agree on a single login early and gate `/admindashboard` and `PATCH /api/reports/[id]` with it. Don't build a second login system.

## Rules for your branch

- **You own:** `app/admindashboard/`, `app/api/reports/[id]/`, `lib/offlineSync.ts`, and the service worker/manifest once you add them.
- **Shared (ask Fabia first):** `lib/types.ts`, `lib/store.ts`, `lib/offlineQueue.ts`, `app/api/reports/route.ts`, `next.config.ts`, `globals.css`, `layout.tsx`, `package.json`.
- **Colors:** use tokens, not hex. In CSS modules: `var(--civic)`, `var(--civic-soft)`, `var(--hazard)`, `var(--danger)`, `var(--ink)`, `var(--ink-subtle)`, `var(--line)`, `var(--surface-muted)`. In Tailwind: `bg-civic`, `text-danger`, and so on. The list is at the top of `app/globals.css`.
- **Icons:** `import Icon from "@/components/Icon"`. No emoji in buttons.
- **Done with a chunk?** Push `feature/reports`, then tell Fabia and it gets merged into `integration`.
