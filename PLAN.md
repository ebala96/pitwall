# Pitwall — F1 Web App Build Plan

## Context

A personal **Formula 1 dashboard** that fetches live/internet data, run as a **React + Vite web app written in JavaScript/JSX**. You **develop and run it in WSL2** (`npm run dev`) and **view it in Chrome on Windows** at `http://localhost:5173`, side-by-side with the race video stream in another tab/window.

Decisions locked in (from our Q&A):
- **No desktop shell.** Dropped Electron/Tauri and the whole Windows-`.exe` packaging plan. It's a plain web app viewed in the browser.
- **Why:** it's the lightest and safest option. It reuses the Chrome that's already open for the video (near-zero extra footprint), and runs inside Chrome's sandbox — so it can't touch the Windows host. The original "security is #1 because Electron has Node + host + network" concern no longer exists.
- **Language:** **JavaScript + JSX** (not TypeScript). To recover the safety TS would have given on deeply nested API JSON, **zod validates every upstream response at the API boundary** (runtime contract instead of compile-time types).
- **Stack:** Vite + React + JS/JSX + TanStack Query + zod + uPlot.
- **Data:** v1 runs on **solid free, no-auth data** — schedule, standings, results, post-session telemetry. **True real-time live timing is Phase 2.**
- **Views:** all areas in scope — Live, Schedule, Standings, Results, Telemetry, Profile, Settings.

Greenfield — no existing code. Project root: **`/home/lenovo/pitwall`** (kept on ext4, **not** under `/mnt/c`, for dev-server speed and correct file watching).

---

## Data sources (free, no auth, verified live 2026-06-13)

| Source | Base URL | Provides |
|---|---|---|
| **Jolpica-F1** (maintained Ergast replacement) | `https://api.jolpi.ca/ergast/f1/` | schedule, driver/constructor standings, results, qualifying, drivers, constructors, circuits — 1950→today. Rate limit ~4 req/s, 500/hr. |
| **OpenF1** | `https://api.openf1.org/v1/` | sessions, laps, positions, intervals, stints (tyres), pit, weather, race_control, car_data (telemetry) — 2023→. Free for post-session/historical. |

No official public F1 API exists; personal/non-commercial use of the above is fine.

---

## Architecture

```
CHROME (Windows)                 VITE DEV SERVER (WSL, Node)            UPSTREAM
  React + JSX SPA                  http://localhost:5173                api.jolpi.ca
  TanStack Query    ──fetch──►     server.proxy:            ──https──►  api.openf1.org
  queryFn → fetch('/api/...')        /api/jolpi  → api.jolpi.ca
  uPlot charts      ◄─JSON───       /api/openf1 → api.openf1.org  ◄──    (only 2 targets)
```

- The React app **never calls the F1 hosts directly.** It calls relative paths (`/api/jolpi/...`, `/api/openf1/...`); the **Vite dev-server proxy** forwards them to the real hosts server-side.
- This **solves CORS** (the browser only ever talks to same-origin `localhost`) and keeps network egress limited to **exactly two hosts** — the proxy config is the only place that knows the real URLs (the spirit of the old allowlist, for free).
- WSL2 forwards `localhost`, so Chrome on Windows reaches the dev server with zero extra config.

---

## Tech stack & dependencies (pinned, verified live 2026-06-13)

Policy: **only well-known, actively maintained, well-written packages with no known security issues and minimal transitive dependencies.** Versions verified on npm; none deprecated; the runtime tree is almost entirely zero-/single-dependency packages (small supply-chain attack surface).

**Runtime dependencies:**
| Package | Version | Role | Transitive deps |
|---|---|---|---|
| `react` | `19.2.7` | UI | 0 |
| `react-dom` | `19.2.7` | DOM renderer | 1 (`scheduler`, Meta) |
| `react-router-dom` | `7.17.0` | routing | 1 (`react-router`) |
| `@tanstack/react-query` | `5.101.0` | data layer (cache/dedupe/retry) | 1 (`query-core`) |
| `@tanstack/react-query-persist-client` | `5.101.0` | offline persistence | 1 (sibling) |
| `idb-keyval` | `6.2.5` | IndexedDB store (persist backend) | 0 |
| `zod` | `4.4.3` | runtime API validation | 0 |
| `uplot` | `1.6.32` | canvas charts (telemetry) | 0 |

**Dev dependencies (not shipped to the browser):**
| Package | Version | Role |
|---|---|---|
| `vite` | `8.0.16` | build tool + dev server + proxy |
| `@vitejs/plugin-react` | `6.0.2` | JSX/Fast-Refresh transform |

**Dependency guardrails (enforce on every change):**
1. **Pin exact versions** — `.npmrc` `save-exact=true` (no surprise `^`/`~` upgrades).
2. **Commit `package-lock.json`** — reproducible, audited tree.
3. **`npm audit` as a gate** (`audit:sec` script) before adding deps and periodically.
4. **Minimal-deps rule** — justify every new dependency; prefer zero/few-dependency, well-known packages over convenience wrappers.
5. **Stay current deliberately** — patching is itself a security control; bump intentionally rather than drifting, re-verifying the package is still maintained.

---

## Security & hygiene (now simple — it's a sandboxed webpage)

Because the app is just a page in Chrome, the OS-level attack surface is Chrome's problem, not ours. What remains is ordinary web-app hygiene:

1. **Bind the dev server to localhost only** (`server.host` left default / `127.0.0.1`) so nothing on the network can reach it. Use `--host` only if you ever need to open it from another device, and understand the implication.
2. **Egress is limited to two hosts** by the proxy config — there is no path for the app to reach an arbitrary URL.
3. **Defensive rendering:** API JSON is untrusted input. Rely on React's auto-escaping; **never** `dangerouslySetInnerHTML` / `innerHTML` with API strings. Validate/normalize shapes in the mappers before they reach components.
4. **zod validation at the api-client boundary (required, not optional in JS):** every upstream response is parsed through a schema in `src/api/schemas.js`, so malformed/changed responses fail loudly in one place instead of corrupting the UI — and zod coerces the APIs' stringified numbers to real numbers there.
5. **Supply-chain hygiene:** see the dependency guardrails above (pin, lockfile, audit, minimal deps).
6. **Optional CSP `<meta>`** (`default-src 'self'; img-src 'self' data:; connect-src 'self'`) — modest defense-in-depth; not load-bearing here.

**Residual risks:** the Node dev server runs your project's dependencies on your WSL filesystem (supply-chain matters — hence audit + lockfile + minimal deps); upstream API shape changes can break the UI (mitigated by zod + defensive mappers). No Windows-host exposure.

---

## Data layer (client-side, in the React app)

TanStack Query is the whole data layer — it replaces the old main-process cache/dedupe/rate-limit machinery:

- **Single fetch helper** `lib/http.js`: builds the relative `/api/...` URL from typed params → `fetch` with an 8s `AbortController` timeout → require `application/json` → `JSON.parse` → **zod-validate** → return clean data. Clients build URLs from params; never accept a full URL from a component.
- **Dedupe:** automatic (TanStack Query coalesces identical in-flight query keys).
- **Caching / freshness:** `staleTime` + `gcTime` per query, mirroring the TTL table below.
- **Stale-if-error across reloads:** `persistQueryClient` → **IndexedDB** (via `@tanstack/react-query-persist-client` + an `idb-keyval` persister). Serves last-good data when offline/rate-limited instead of failing.
- **Retries/backoff:** TanStack Query `retry` with exponential backoff; honor `Retry-After` on 429 where present.
- **Rate limiting:** for personal single-user use, `staleTime` + dedupe already keep request volume far under Jolpica's 4/s · 500/hr. Add a tiny client-side throttle only if a view ever fans out many calls at once.

**TTL table** (`data/ttl.js`, `classify(resource, params, now)` → `{ staleTime, gcTime }`):

| Class | staleTime |
|---|---|
| Season list / reference data (drivers, constructors, circuits) | 7 d |
| Current-season schedule | 6 h |
| Standings (off-session) / current results | 3 h / 30 min |
| Standings / session data **during active race window** | 5 min / 30 s |
| Any **past/closed** session, results, qualifying, telemetry | 30 d (immutable) |
| Weather / race_control (active) | 5 min / 1 min |

"Active window" = now ∈ `[session.start − 15m, session.end + 30m]`. Drives both `staleTime` and TanStack Query `refetchInterval`.

**Critical join:** `resolveSession(season, round, kind)` maps a Jolpica race → an OpenF1 `session_key` by date+circuit. Powers Live and Telemetry.

---

## Views / tabs (React Router — `BrowserRouter`)

Now served over real `http://` by Vite (with SPA history fallback in dev and `vite preview`), so **`BrowserRouter`** works — the old `HashRouter` (needed only for `file://`) is no longer required.

Shell: left `TabBar` + top `StatusStrip` (season selector, live dot, data-source health, next-session countdown). Every view uses a `<QueryBoundary>` with 4 states: loading skeleton / error+retry / empty(reason) / data. Refresh cadence driven by TanStack Query `refetchInterval` mirroring the TTLs.

1. **Live** (`/live`, default) — the centerpiece. `getLiveSessionState()` composite computes phase: `live` / `recent` / `upcoming` / `offseason`. `LiveLeaderboard` rows: position(+▲▼), driver code w/ team-color bar, gap-to-leader & interval, `TyreBadge` (compound color + age), `SectorLights` (purple=session best / green=personal best / yellow / white), DRS pip, pit flag, last/best lap. **v1 graceful degradation:** usually `recent` phase → renders **final classification** from post-session data; live-only signals (DRS, live counter, real-time arrows) shown dimmed with "Live timing in Phase 2"; banner "Showing final data". No layout shift between live and post-session. Right rail: session header + lap counter, weather card, race-control feed.
2. **Schedule** (`/schedule`) — `NextRaceCard` hero w/ multi-session countdown + `RaceList`; client-side countdown ticks on already-fetched data.
3. **Standings** (`/standings`) — Drivers | Constructors segmented; `StandingsTable` w/ team-color bars, points-gap bars, movement, favorite highlight; subtle pulse when refetched in race window.
4. **Results** (`/results`) — `EventPicker` (season+round) → Race | Qualifying tabs; grid→finish delta, time/gap, status, fastest-lap badge; Q1/Q2/Q3 with eliminated rows dimmed.
5. **Telemetry** (`/telemetry`) — `SessionSelector` + up-to-3 `DriverMultiSelect` + `LapSelector`; charts: `LapTimeChart`, `GapToLeaderChart`, `TyreStrategyTimeline` (flex bars, no chart lib), `TelemetryTraces` (speed/throttle/brake/gear). Load on demand, windowed/lap-bounded fetches.
6. **Profile** (`/profile/:type/:id`) — driver/constructor header (team-themed), stat cards, per-round result strip; set-as-favorite.
7. **Settings** (`/settings`) — favorite driver/team, reminder lead times, reminders on/off, theme, **data-source status pills** (jolpica/openf1 green/red + latency), **clear cache** (clears IndexedDB; shows freed entries), default season.

**UI system:** dark broadcast theme (base `#0B0E14`, panels `#121620`, accent F1 red `#E10600`); `lib/teamColors.js` (`getTeamColor(constructorId)` w/ neutral fallback); **tabular-nums** for all timing numerals (no jitter); tight 28–32px rows; CSS variables + `ThemeProvider`.

**Notifications:** **Web Notifications API** (request permission in Settings). A `lib/reminders.js` scheduler runs while the page is open: on load + every 6h it reads the schedule and sets timers to fire a `Notification` at each reminder lead time; click focuses the tab → `/live`. (Background/while-closed reminders would need a Service Worker + PWA — deferred to Phase 2.)

**Charting:** **uPlot** (canvas) for telemetry traces / lap-time / gap charts — `car_data` is thousands of points/lap and would choke SVG/Recharts. Tyre timeline = plain flex divs. Wrap in `ChartFrame` for consistent theming.

---

## Project structure

```
pitwall/
  package.json  vite.config.js  jsconfig.json  .npmrc  .nvmrc(24)
  index.html
  src/
    main.jsx  App.jsx
    api/         http.js  jolpica.js  openf1.js  schemas.js(zod)  resolveSession.js
    data/        queryClient.js  ttl.js  persist.js(IndexedDB via idb-keyval)
    routes/      Live Schedule Standings Results Telemetry Profile Settings (.jsx)
    components/  {,live/,standings/,results/,profile/,charts/}  QueryBoundary  TabBar  StatusStrip (.jsx)
    hooks/       useF1.js
    lib/         teamColors.js  format.js  sectorColor.js  reminders.js
    mappers/     jolpica.map.js  openf1.map.js
    theme/       tokens.css  ThemeProvider.jsx
```

(`jsconfig.json` is optional — it just gives VS Code better path resolution/intellisense for JS.)

**Critical files:** `vite.config.js` (the two-host proxy), `src/api/http.js` (fetch chokepoint), `src/api/schemas.js` (zod contracts), `src/data/ttl.js` (TTL/active-window logic), `src/api/openf1.js` + `resolveSession.js`, `src/data/persist.js` (stale-if-error), `src/components/live/LiveLeaderboard.jsx`.

**`vite.config.js` proxy (the chokepoint):**
```js
server: {
  proxy: {
    '/api/jolpi':  { target: 'https://api.jolpi.ca',   changeOrigin: true,
                     rewrite: p => p.replace(/^\/api\/jolpi/,  '/ergast/f1') },
    '/api/openf1': { target: 'https://api.openf1.org', changeOrigin: true,
                     rewrite: p => p.replace(/^\/api\/openf1/, '/v1') },
  },
}
```

---

## Build & run (WSL → Chrome, dev-server workflow)

Primary workflow is just the dev server:

```bash
cd /home/lenovo/pitwall
npm install
npm run dev          # Vite at http://localhost:5173
```

Then open **`http://localhost:5173` in Chrome on Windows** (WSL2 localhost forwarding makes this work out of the box). Keep it in a window/tab next to the race video.

- **Optional production-ish run:** `npm run build` → `npm run preview`. Note: `server.proxy` is **dev-only**; if you use `vite preview` you must replicate the proxy under `preview.proxy`. A fully static deploy (no Node) would lose the proxy and re-introduce CORS — out of scope for the local-dev workflow.
- **Git (optional):** `git init`, `.gitignore` (`node_modules`, `dist`, `.cache`), commit lockfile. Push if you want history/backup.

`package.json` scripts: `dev` (vite), `build` (vite build), `preview` (vite preview), `audit:sec` (npm audit).

---

## Implementation milestones (build top-to-bottom)

1. **Scaffold** — `npm create vite@latest pitwall -- --template react`; prune to the structure above; set `.npmrc` `save-exact=true`; install the pinned deps; `vite.config.js` proxy to both hosts; `BrowserRouter` + AppShell + empty routes; theme tokens; TanStack `QueryClientProvider` + IndexedDB persister.
2. **Data-layer core** — `http.js` (fetch + timeout + json guard + zod), `schemas.js`, `ttl.js` (classify/active-window), `queryClient.js` + `persist.js`, `useF1` hook factory. (+ unit tests for `classify`.) Verify a proxied call returns validated JSON in the browser.
3. **Vertical slice: Standings** — `jolpica.js` + mapper + zod schema, `getDriverStandings`/`getConstructorStandings`/`listSeasons`, `useF1` hooks, `StandingsTable`, `teamColors`, `format`, `QueryBoundary`. Proves the full pipe through the proxy.
4. **Schedule + Results** — remaining Jolpica endpoints, `NextRaceCard`/`RaceList`/countdown, `ResultsTable`/`QualifyingTable`/`EventPicker`.
5. **OpenF1 service + `resolveSession`** — sessions/positions/intervals/laps/stints/pit/weather/race_control.
6. **Live view** — `getLiveSessionState` composite, `LiveLeaderboard` + all cells, post-session graceful degradation, race-control feed, weather.
7. **Telemetry + charts** — windowed `getCarData`, uPlot `ChartFrame` + lap-time/gap/traces, tyre-strategy timeline.
8. **Profile** + **Settings/notifications** — composite profile endpoints; settings store (localStorage), favorites, Web Notification reminder scheduler, data-source status, clear-cache.
9. **Polish** — skeletons, error/empty states everywhere, density + tabular-numeral pass, notification deep-links.

---

## Verification

**Functional (`npm run dev`, in Chrome):**
- Each view loads real data: Standings/Schedule/Results from Jolpica; Live/Telemetry from OpenF1 (use a known 2024 `session_key`).
- Network tab shows requests going to same-origin `/api/...` (no CORS errors) and resolving via the proxy.
- zod rejects a deliberately malformed response with a clear boundary error (not a deep component crash).
- `resolveSession` correctly joins a Jolpica race to an OpenF1 session.
- Offline (DevTools → Offline) → `persistQueryClient` serves cached data; rate-limit retries back off.
- Telemetry charts render thousands of `car_data` points smoothly (uPlot).
- Web Notification fires at a reminder lead time; clicking focuses the tab.

**Hygiene:**
- `npm run audit:sec` reviewed; `package-lock.json` committed; versions pinned exact.
- No `dangerouslySetInnerHTML` with API data.

---

## MVP cut line

**v1 ships:** Vite/React (JS/JSX) app run in WSL + viewed in Chrome; full TanStack Query data layer (cache, dedupe, persist, retries) with zod-validated responses; Schedule, Standings (live-updating in race window), Results (race+quali), Live (post-session leaderboard w/ graceful degradation), Telemetry (lap-time/gap/traces/tyre-strategy), Profile, Settings; team colors, dark theme, web-notification reminders, data-source status, cache clear.

**Phase 2:** true real-time live timing (live DRS/lap-counter/position arrows, sub-second updates); head-to-head compare; track-dominance heatmap (`/location`); historical replays; **PWA + Service Worker** (installable window, background/while-closed reminders, offline-first) and/or static deploy with a small hosted proxy.
