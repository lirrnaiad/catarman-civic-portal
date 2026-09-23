# Handoff — Fabia (Evacuation track + Integration owner)

**Your branches:** `feature/evacuation` (track) and `integration` (you're the only one who commits here)
**Your stories:** 2.1 Map and Capacity Display · 2.2 Nearest Open Center Locator · build health on `main`

## How the branches fit together

```
main  ← one PR from integration when demo-ready
 └─ integration        merges + shared code only ("integration:" commits)
     ├─ feature/evacuation       Fabia
     ├─ feature/events           Ordonia
     └─ feature/reports          De Guia + Inovero (report form + admin dashboard)
```

- **Merging a track:** `git merge --no-ff origin/feature/x`. Each track stays one merge commit, and you can back it out with `git revert -m 1 <sha>`.
- **Fixes go on the owner's branch,** then you merge again. Don't patch track code directly on `integration`.
- **Shared-file changes** (contract, theme, layout, deps) are `integration:` commits. Afterwards, tell everyone to run `git merge origin/integration`.

## What's on `integration` now

| Commit | What |
|---|---|
| Merge `feature/evacuation`, `feature/events` | Clean merges |
| `integration: add shared reports contract` | `lib/types.ts`, `id.ts`, `store.ts`, `POST/GET /api/reports`. `garbage_segregation` → `garbage`. `/data/` gitignored. `@types/leaflet` → devDeps |
| `integration: add shared offline queue store` | `lib/offlineQueue.ts`, the handoff point between reporter (enqueue) and admin (flush) |
| Merge `feature/reporter`, `feature/admin-dashboard` | The split halves. Includes the PATCH route move and its Next 16 `await params` fix |
| `integration: add PRD civic palette tokens and SVG icon set` | `globals.css` tokens and `components/Icon.tsx`. The page-wide dark background override was removed: only evacuation had dark styles, so report and admin rendered dark text on a dark background |
| `integration: apply civic palette …` (×2) | Events, report, admin and evacuation restyled |

Verified: `npm run build` passes, all routes return 200, and POST → PATCH status works end to end.

## Your integration to-do list

1. **Tell each track to merge integration first** (their handoff docs say this too). The restyle touched most of their files, so merging now avoids conflicts later.
2. **`next.config.ts` for the PWA,** as Inovero specifies (Serwist or a manual `sw.js`, not `next-pwa`).
3. **MySQL is the database; the API is Next.js.** `lib/db.ts` (pool) + `lib/store.ts` (queries) talk to the tables in `backend/schema.sql`. Everyone needs MySQL set up per `backend/README.md`. The demo laptop needs the DB loaded before the pitch.
4. **When everything is stable,** open a PR from `integration` to `main`.

## Your evacuation to-do list

- `lib/evacuation-centers.ts` is static. That's fine for the demo, and it's also what makes it work offline. Only wire `GET /evacuation_centers` if there's time.
- Confirm whether PAGCOR counts among the "ten designated centers" before quoting a number to the DRRMO judge (`.docs/evacuation.md`).

## Palette cheat sheet (share when asked)

| Token | Tailwind | Use |
|---|---|---|
| `--civic` `#1d4ed8` | `bg-civic` / `text-civic` | Primary buttons, links, selected state |
| `--civic-hover` `#1e40af` | `hover:bg-civic-hover` | Hover on primary |
| `--civic-strong` `#172554` | `bg-civic-strong` | Headers, sidebar |
| `--civic-soft` / `--civic-muted` | `bg-civic-soft` / `bg-civic-muted` | Tinted panels, icon wells, chips |
| `--hazard` `#c2410c` | `bg-hazard` | Report / hazard actions |
| `--danger` `#b91c1c` | `text-danger` | Errors, destructive actions |
| Capacity green/amber/red | `lib/evacuation-utils.ts` | **Only** for evacuation status, never for brand |
