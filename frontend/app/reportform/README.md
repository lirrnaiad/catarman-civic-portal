# Civic Report Form (Next.js)

A mobile-first report form with a category picker, a geotagged map pin, photo
upload, and a submit flow. Built to drop into an existing Next.js app (App
Router) and to be easy to wire into whatever backend or third-party system
receives the reports.

## Files

```
app/report/page.tsx        Example page rendering the form
app/api/reports/route.ts   Example receiving endpoint (swap for your backend)
components/ReportForm.tsx        The form itself
components/ReportForm.module.css
components/LocationPicker.tsx    Map + geolocation + draggable pin
components/LocationPicker.module.css
lib/types.ts                Shared types — this is the integration contract
lib/id.ts                    UUID helper
```

## Setup

```bash
npm install leaflet react-leaflet
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
  category: "flood_landslide" | "garbage" | "crime" | "infrastructure";
  description: string;
  location: { lat: number; lng: number; accuracy?: number };
  photos: { fileName: string; mimeType: string; sizeBytes: number; dataUrl: string }[];
  reporterContact?: string;
  createdAt: string;          // ISO 8601
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
