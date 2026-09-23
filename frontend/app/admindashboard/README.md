# Civic Report (Next.js)

A mobile-first citizen report form (category picker, geotagged map pin, photo
upload, submit flow) plus the LGU-facing side: an offline-first PWA shell, an
offline submission queue, and an admin dashboard (master map + filterable
table + status workflow). Everything reads from and writes to the same
`/api/reports` endpoint, so the reporter and admin sides stay in sync.

## Files

```
app/layout.tsx               Root layout: PWA manifest link, mounts the offline sync listener
app/report/page.tsx          Reporter-facing page
app/admin/page.tsx           Admin dashboard page (server-rendered initial data)
app/api/reports/route.ts     POST (submit) + GET (list, with filters)
app/api/reports/[id]/route.ts  PATCH — update a report's status
next.config.js                next-pwa setup (Story 1.2)
public/manifest.json          Web app manifest

components/ReportForm.tsx           The reporter form
components/ReportForm.module.css
components/LocationPicker.tsx       Map + geolocation + draggable pin
components/LocationPicker.module.css
components/OfflineSyncProvider.tsx  Mounts the reconnection listener app-wide

components/admin/AdminDashboard.tsx   Ties map + table together, polls for updates
components/admin/AdminMap.tsx         Master map, all reports, colored by category
components/admin/ReportsTable.tsx     Filterable table with a status toggle
components/admin/*.module.css

lib/types.ts        Shared types — the integration contract (reporter ⇄ admin ⇄ external systems)
lib/id.ts            UUID helper
lib/store.ts          File-backed report store — swap for a real database
lib/offlineQueue.ts    IndexedDB queue (Story 3.2, reporter half: enqueue on submit)
lib/offlineSync.ts      Reconnection detection + queue flush (Story 3.2, infra half)

data/reports.json    Seed file for the store — gitignore this in a real deployment
```

## Setup

```bash
npm install leaflet react-leaflet next-pwa
npm install -D @types/leaflet
```

Requires Next.js 13+ with the App Router and TypeScript. The `@/` import
alias assumes the default `tsconfig.json` path mapping (`"@/*": ["./*"]`);
adjust the imports if your project uses a different alias or a `src/`
directory.

If your Next.js version complains about importing `leaflet/dist/leaflet.css`
from inside a component, move that one import line into your root
`app/layout.tsx` instead — the rest of the code doesn't change.

Drop the form into any page:

```tsx
import ReportForm from "@/components/ReportForm";

export default function Page() {
  return <ReportForm />;
}
```

## Integrating with another system

The form is deliberately decoupled from any specific backend. Pick whichever
of these fits:

### Option 1 — point it at your own endpoint
By default the form POSTs `multipart/form-data` (fields: `id`, `category`,
`description`, `lat`, `lng`, `accuracy`, `reporterContact`, `createdAt`,
`photos`) to `/api/reports`. Change the target:

```tsx
<ReportForm apiEndpoint="https://your-service.example.com/api/intake" />
```

The example handler in `app/api/reports/route.ts` shows how to validate the
payload and forward it to an external system via
`EXTERNAL_REPORTS_WEBHOOK_URL` (set as an env var), which avoids the CORS
issues you'd hit calling a third party directly from the browser.

### Option 2 — hand off with a callback
If your host app wants full control (its own SDK, GraphQL mutation, native
bridge, offline queue, etc.), skip the built-in POST entirely:

```tsx
<ReportForm
  onSubmit={async (payload, files) => {
    // payload matches lib/types.ts ReportPayload
    // files is the raw File[] if you'd rather upload separately from the
    // base64 dataUrl already included on each payload.photos[i]
    await myInternalSdk.createTicket(payload);
    return { ok: true, id: payload.id };
  }}
/>
```

### Option 3 — listen for a DOM event
Useful if the form is embedded in a page you don't otherwise control (e.g. a
micro-frontend or a non-React shell):

```js
window.addEventListener("civic-report:submitted", (e) => {
  console.log(e.detail.payload, e.detail.result);
});
```

This event fires alongside whichever of Options 1/2 was used, so it's
additive, not a replacement.

## Payload shape (`lib/types.ts`)

```ts
interface ReportPayload {
  id: string;                 // client-generated UUID
  category: "flood_landslide" | "garbage_segregation" | "crime" | "infrastructure";
  description: string;
  location: { lat: number; lng: number; accuracy?: number };
  photos: { fileName: string; mimeType: string; sizeBytes: number; dataUrl: string }[];
  reporterContact?: string;
  barangay?: string;          // free text, used by the admin dashboard's filter
  createdAt: string;          // ISO 8601, set on the client
}

// What the server stores and the admin dashboard reads (ReportPayload + workflow state)
interface AdminReport extends ReportPayload {
  status: "new" | "in_progress" | "resolved";
  receivedAt: string;         // ISO 8601, set on the server
}
```

Keep this file in sync (or share it via an npm package) with whatever system
consumes the reports, so both sides agree on the schema.

## Customizing categories

Pass your own list instead of the default four:

```tsx
<ReportForm
  categories={[
    { value: "flood_landslide", label: "Baha / Guha", hint: "..." },
    // ...
  ]}
/>
```

## Admin dashboard (`/admin`)

Reads from the same store the reporter form writes to via `POST
/api/reports`, so a submission shows up on the dashboard on its next poll
(every 15s) with no separate wiring.

- **Master map** (`AdminMap.tsx`): every report plotted, pin colored by
  category, click a pin for a popup with a quick status change. Resolved
  reports render dimmed rather than disappearing.
- **Table** (`ReportsTable.tsx`): filters by category and status (dropdowns)
  and barangay (free-text, matches the `barangay` field from the form).
  Clicking a row flies the map to that report; the status dropdown in each
  row calls `PATCH /api/reports/:id`.
- Selection is synced both ways — clicking a map pin or a table row updates
  the same `selectedId` state in `AdminDashboard.tsx`.

There's no auth on `/admin` or the API routes here — add your own
session/role check (e.g. middleware, or a check at the top of each route
handler) before deploying this for real LGU staff use.

If you're on Next.js 15+, route handler `params` are a `Promise` rather than
a plain object — update the signature in
`app/api/reports/[id]/route.ts` accordingly
(`{ params }: { params: Promise<{ id: string }> }`, then `await params`).

## PWA app shell (Story 1.2)

`next.config.js` wraps the app with `next-pwa`, which generates
`public/sw.js` at build time and registers it automatically — nothing to
call manually. It precaches the built app shell (so `/report` loads with no
network) plus runtime caching rules for map tiles and images so a
previously-viewed map area still renders offline.

PWA behavior is disabled in `next dev` (hot reload and service workers don't
mix well); test it with:

```bash
npm run build && npm run start
```

You'll also want real icon files at `public/icons/icon-192.png` and
`icon-512.png` — `public/manifest.json` references them but placeholders
aren't included here.

## Offline submission queue (Story 3.2)

Split across two files, matching the PRD's split of responsibilities:

- **`lib/offlineQueue.ts`** (reporter half) — a small IndexedDB wrapper.
  `ReportForm.tsx` calls `enqueueReport(payload)` when a submission can't
  reach the server (the device is offline, or the `fetch` throws), and shows
  a "Queued — will send once you're back online" screen instead of an error.
  Because photos are already base64 `dataUrl`s on the payload, the whole
  report is one JSON-serializable object — no separate Blob storage needed.
- **`lib/offlineSync.ts`** (infra half) — listens for the browser's `online`
  event, plus does an on-load check and a light 30s poll (some mobile
  networks reconnect without firing a clean event), and flushes everything
  in the queue by POSTing it as JSON to `/api/reports`. Mounted once via
  `components/OfflineSyncProvider.tsx` in the root layout, so it runs
  app-wide regardless of which page is open.
- A plain `online` event listener was chosen over the Background Sync API
  because Safari/iOS doesn't support Background Sync — a real gap for a
  citizen-facing PWA. The trade-off: the flush only runs while a tab is
  open. If you need delivery even when the app is fully closed, add a
  Background Sync registration in the generated service worker as a
  progressive enhancement on top of this.

To see it work locally: open `/report`, go offline (DevTools → Network →
Offline), submit — you'll get the "Queued" screen. Go back online and the
report POSTs automatically within a few seconds; check `/admin` for it to
appear.

## Notes / things to adjust for production

- **Map center**: `initialMapCenter` defaults to a generic Philippines-wide
  center. Pass your actual service area's centroid via
  `<ReportForm initialMapCenter={[lat, lng]} />`.
- **Photo size**: capped client-side at 8MB/photo, 5 photos. Adjust
  `MAX_PHOTOS` / `MAX_PHOTO_MB` in `ReportForm.tsx`. Large base64 payloads
  increase JSON size ~33%; if you expect many/large photos, prefer reading
  `files` in `onSubmit` and uploading them separately (e.g. to object
  storage) rather than relying on the inline `dataUrl`.
- **Offline handling**: not included. If reports need to work with spotty
  connectivity, wrap the `fetch`/`onSubmit` call with a retry queue (e.g.
  persist to IndexedDB and flush when back online).
- **Auth**: none included. Add your session/auth headers in the `fetch` call
  or inside `onSubmit`.
- **Data store**: `lib/store.ts` is a JSON file (`data/reports.json`) so the
  admin dashboard has something to read out of the box. It has no file
  locking, so it's fine for a prototype/demo but not for concurrent
  production traffic — swap in a real database and keep the same four
  function signatures (`listReports`, `insertReport`, `updateReportStatus`)
  so nothing else has to change. Add `data/reports.json` to `.gitignore` once
  you're storing real submissions.
