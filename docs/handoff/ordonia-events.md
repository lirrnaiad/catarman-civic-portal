# Handoff — Ordonia (Events Calendar track)

**Your branch:** `feature/events`
**Your stories:** 4.1 Shared Authentication · 4.2 Manage and View Civic Events

## What changed with your code

`feature/events` was merged into `integration` as-is. After that, one integration commit restyled it to the PRD palette. Your layout, cards, sidebar popover and animations are unchanged, and they now set the look for the whole portal.

| Before | Now | Why |
|---|---|---|
| Emerald/teal gradients (header, sidebar) | Solid civic navy `bg-civic-strong` | PRD §3: civic blue palette. Matches the evacuation page header |
| `text-emerald-*`, `bg-emerald-*`, `blue-600` | `text-civic`, `bg-civic-muted`, `bg-civic`, … | Shared tokens in `app/globals.css` |
| "Community" category emerald | Violet (`bg-violet-600`) | Stays distinct from brand blue (Safety) and from green, which means "open" on evacuation capacity |
| Emoji/glyphs: 🌿 ✕ 🏠 📅 ▦ 🔔 ⓘ ☰ 🔍 ‹ › → ↗ 🛡️ 🍃 👥 🕐 📍 | `<Icon name="…" />` SVGs | No emoji in button UI. Icon-only buttons got `aria-label`s |
| `text-slate-400` labels | `text-slate-500` | slate-400 on white fails WCAG AA |
| Sidebar gradient in `globals.css` | `var(--civic-strong)` | Same |

## Start working (once)

`feature/events` doesn't have the restyle yet, so merge integration in before you touch the page. Otherwise you'll get conflicts on nearly every line of `app/events/page.tsx`.

```bash
git fetch origin
git switch feature/events
git pull
git merge origin/integration
```


> **The app now needs MySQL.** Reports are stored in MySQL (`lib/store.ts`). Before `npm run dev`, set up the database once by following `backend/README.md` (XAMPP works). Without it, `/admindashboard` and report submission will error.

> ✅ **Already done on `integration`:** offline queue (report form saves offline, shows "Saved on this device"), reconnect sync + online/offline banner (`components/OfflineSync.tsx`, mounted in the layout), and the portal nav bar (`components/SiteNav.tsx`; the events page's own header/sidebar was removed). Shared admin login (`ADMIN_PASSWORD` in `.env.local`; `lib/auth.ts`, `proxy.ts`, `/login`, `/admin`) guards the dashboard and the report list/status APIs; citizen submits stay public. Nav is Centers | Report (raised center, the home page `/`) | Events, with no Admin link. Don't rebuild these.

## Your to-do list (priority order)

> 🔁 **The Events module was rebuilt on `integration`** (Stories 4.1 + 4.2 done). Your old `app/events/page.tsx` with hardcoded dates is replaced. Everything below is yours to own and polish from here.
>
> - **Citizen tab** `/events`: `components/events/EventsView.tsx` ("Up next" hero with live countdown, date strip, type filters, Saved, agenda grouped by day), `EventCard.tsx`, detail page `EventDetail.tsx` (Add to calendar `.ics`, Google Maps, Share, Save).
> - **Office manager** `/agency`: `components/events/AgencyEvents.tsx` (list, New/Edit sheet with live preview, Delete).
> - **Data/API:** `lib/events.ts` (MySQL), `lib/eventInput.ts` (validation), `lib/eventFormat.ts` (Catarman-time formatting, `.ics`), `app/api/events/*`.
> - **Logins:** each office has its own password (`AGENCY_PASSWORDS` in `.env.local`, e.g. `MHO:…`); an office can only post/edit/delete its own events. MDRRMO uses `ADMIN_PASSWORD`.

1. **Real content.** Replace the demo events in `backend/seed.sql` (via Fabia) with real or very plausible upcoming Catarman schedules; check agency names and venues with someone local.
2. **Try the office flow on a phone:** sign in at `/admin` with an agency password, publish an event, and confirm it shows on `/events`. Note anything confusing in the form.
3. **Pitch closing beat:** demo "MHO posts → citizen sees it instantly with a Verified badge", the answer to scattered agency Facebook pages.

## Rules for your branch

- **You own:** `app/events/`, `app/agency/`, `components/events/`, `lib/events.ts`, `lib/eventInput.ts`, `lib/eventFormat.ts`, `app/api/events/`.
- **Shared (ask Fabia first):** `app/globals.css` (you created the sidebar and animation CSS; it now also holds the palette), `layout.tsx`, `components/Icon.tsx`, `package.json`.
- **Colors:** use tokens, not raw Tailwind blues or greens: `bg-civic`, `hover:bg-civic-hover`, `bg-civic-strong`, `bg-civic-soft`, `bg-civic-muted`, `text-civic`, `border-civic-line`, `text-hazard`, `text-danger`. Neutral text stays `slate-500`/`700`/`900`.
- **Icons:** `import Icon from "@/components/Icon"`, then `<Icon name="calendar" />`. Available names are in `components/Icon.tsx`. If you need a new one, ask Fabia.
- **Done with a chunk?** Push `feature/events`, then tell Fabia and it gets merged into `integration`.
