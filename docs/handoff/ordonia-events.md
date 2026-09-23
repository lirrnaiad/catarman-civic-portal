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

## Your to-do list (priority order)

1. **List and detail pages disagree.** `app/events/page.tsx` has id 1 on Sept **22**, id 2 on the **24th** and id 3 on the **26th**. `app/events/[id]/page.tsx` has id 1 on the **25th**, id 2 on the **27th** and id 3 on the **29th**, and the times and locations differ too. Clicking an event shows a different date. Move the seed events into one shared file, for example `lib/events.ts` (yours), and import it in both pages. Later, `GET /events` replaces it.
2. **Events API, Story 4.2:** `GET/POST /api/events` and `PATCH/DELETE /api/events/[id]`, with fields `title`, `agency`, `event_datetime`, `location`, `description` (see `backend/schema.sql`). `lib/store.ts` shows the JSON-file store pattern if the PHP backend isn't ready.
3. **Shared auth, Story 4.1.** Build it once and coordinate with Inovero, who needs it to gate the admin dashboard (FR6).
4. **Calendar month buttons** (the chevrons) don't do anything yet. Either make them work or hide them for the demo.
5. The sidebar's **Services / Alerts / About** buttons and the "CivicConnect" name will be replaced when Fabia builds the portal-wide nav shell. Don't spend time on them.

## Rules for your branch

- **You own:** `app/events/` and any `lib/events.ts` or `app/api/events/` you add.
- **Shared (ask Fabia first):** `app/globals.css` (you created the sidebar and animation CSS; it now also holds the palette), `layout.tsx`, `components/Icon.tsx`, `package.json`.
- **Colors:** use tokens, not raw Tailwind blues or greens: `bg-civic`, `hover:bg-civic-hover`, `bg-civic-strong`, `bg-civic-soft`, `bg-civic-muted`, `text-civic`, `border-civic-line`, `text-hazard`, `text-danger`. Neutral text stays `slate-500`/`700`/`900`.
- **Icons:** `import Icon from "@/components/Icon"`, then `<Icon name="calendar" />`. Available names are in `components/Icon.tsx`. If you need a new one, ask Fabia.
- **Done with a chunk?** Push `feature/events`, then tell Fabia and it gets merged into `integration`.
