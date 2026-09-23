# Handoff — De Guia (Reporter track)

**Your branch:** `feature/reports`, shared with the admin dashboard work (replaces `feature/reporter` and `feature/report-form-admin-dashboard`)
**Your stories:** 3.1 Citizen Hazard Report Form · 3.2 Offline Queue (*enqueue on submit + "Queued" state*)

## What changed with your code

Your combined branch was split in two so each track has its own branch. You're still credited as the author of both halves.

| Before | Now | Why |
|---|---|---|
| `app/reportform/*` | `app/reportform/*` (unchanged path) | — |
| `app/lib/types.ts`, `id.ts`, `store.ts`, `offlineQueue.ts` | `lib/…` (repo-level `frontend/lib/`) | One `lib/` folder for the whole app. These are now **shared** files owned by integration |
| `app/api/reports/route.ts` | same path | Now shared (integration-owned) |
| Imports `@/app/lib/…` | `@/lib/…` | Follows the move |
| Category `garbage_segregation` | `garbage` | Matches `backend/schema.sql`. The label still reads "Garbage / Segregation" |
| `data/reports.json` committed | **MySQL** (`reports` + `report_photos` tables) | See the privacy note below. Setup: `backend/README.md` |
| Colors hardcoded in the CSS modules | `var(--civic)`, `var(--hazard)`, etc. | Shared PRD palette. **Submit** is now orange-700: the old `#e8763a` failed AA contrast |
| `×` / `+` text glyphs | `<Icon name="close" />` / `<Icon name="plus" />` | No emoji or glyph icons in buttons |

> ⚠️ **Privacy:** the `data/reports.json` pushed on `origin/feature/report-form-admin-dashboard` contains a test "photo" that is actually a base64 directory listing of your home folder (file names, documents). It was **not** carried over. Please delete that old branch once you've switched: `git push origin --delete feature/report-form-admin-dashboard`.

## Start working (once)

```bash
git fetch origin
git switch feature/reports          # tracks origin/feature/reports
git merge origin/integration         # pulls in the palette/icon restyle
```

After that, stay on `feature/reports`. Whenever integration changes, run `git merge origin/integration` again.


> **The app now needs MySQL.** Reports are stored in MySQL (`lib/store.ts`). Before `npm run dev`, set up the database once by following `backend/README.md` (XAMPP works). Without it, `/admindashboard` and report submission will error.

## Your to-do list (priority order)

1. **Connect the offline queue, Story 3.2 AC1. This is the pitch demo.** In `app/reportform/ReportForm.tsx:183`, when the POST fails because the device is offline (`!navigator.onLine` or a network `TypeError`), call `enqueueReport(payload)` from `@/lib/offlineQueue` and show a distinct **"Queued — will send when you're back online"** state instead of `"error"`. Queued payloads must be JSON with photos as base64 `dataUrl`s, which is what the flush in `lib/offlineSync.ts` re-POSTs.
2. **Touch targets:** the remove-photo button is 22px (`ReportForm.module.css:118`). The PRD requires at least 44×44px.
3. **Client-side photo compression** (from `reporter.md`). The limit is currently 8MB per photo (`ReportForm.tsx:24`), which is heavy on mobile data. Resize to about 1280px on a canvas at JPEG quality 0.7 before attaching.
4. **Barangay field:** the admin filter uses `barangay`. If you add a dropdown, the canonical 55-barangay list is in `backend/seed.sql` (`barangays` table).

## Rules for your branch

- **You own:** `app/reportform/`.
- **Shared (ask Fabia first):** `lib/types.ts`, `lib/store.ts`, `lib/offlineQueue.ts`, `app/api/reports/route.ts`, `globals.css`, `layout.tsx`, `package.json`. If the contract needs a new field, say so and it will be added on `integration`. Then you run `git merge origin/integration`.
- **Colors:** use tokens, not hex. In CSS modules: `var(--civic)`, `var(--civic-soft)`, `var(--hazard)`, `var(--danger)`, `var(--ink)`, `var(--ink-subtle)`, `var(--line)`. In Tailwind: `bg-civic`, `text-hazard`, and so on. The full list is at the top of `app/globals.css`.
- **Icons:** `import Icon from "@/components/Icon"`, then `<Icon name="…" />`. No emoji in buttons. If you need a new icon, add it to `components/Icon.tsx` via integration.
- **Done with a chunk?** Push `feature/reports`, then tell Fabia and it gets merged into `integration`.
