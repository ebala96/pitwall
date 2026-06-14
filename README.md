# Pitwall

A personal Formula 1 dashboard — schedule, standings, results, and telemetry —
built as a lightweight React web app. Run it locally and keep it open next to a
race stream.

> Personal, non-commercial project. Not affiliated with or endorsed by Formula 1.

## Features

- **Standings** — drivers & constructors, team-colour bars, points-gap bars, wins
- **Schedule** — next-race card with live multi-session countdown + full calendar
- **Results** — race results (grid→finish delta, fastest lap, time/gap) and
  qualifying (Q1/Q2/Q3 with eliminated rows dimmed)
- **Live** — post-session leaderboard (real-time timing planned for a later phase)
- **Telemetry** — lap-time / gap / traces + tyre-strategy charts *(in progress)*
- **Profile & Settings** — favourites, reminders, data-source status *(in progress)*

## Tech stack

- **React 19** + **Vite** (JavaScript / JSX)
- **TanStack Query** for fetching, caching, retries; persisted to **IndexedDB**
  (`idb-keyval`) for offline / stale-if-error
- **zod** for runtime validation of all API responses
- **uPlot** for high-performance canvas charts
- **React Router** (`BrowserRouter`)

Dependencies are kept minimal, well-known, and pinned to exact versions.

## Data sources (free, no auth)

| Source | Provides |
|---|---|
| [Jolpica-F1](https://github.com/jolpica/jolpica-f1) (Ergast replacement) | schedule, standings, results, qualifying |
| [OpenF1](https://openf1.org) | sessions, laps, telemetry, weather, race control |

The browser never calls these hosts directly — a Vite dev-server proxy forwards
`/api/jolpi/*` and `/api/openf1/*` server-side. This avoids CORS and limits
network egress to exactly two hosts.

## Getting started

Requires **Node 20.19+** (Node 24 recommended).

```bash
npm install
npm run dev      # http://localhost:5173
```

Open `http://localhost:5173` in your browser. On WSL2, localhost is forwarded to
Windows automatically.

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server (with the API proxy) |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run audit:sec` | `npm audit` |

## Project structure

```
src/
  api/         http chokepoint, domain clients, zod schemas
  data/        query client, TTL/freshness logic, IndexedDB persistence
  mappers/     transform validated API responses → UI shapes
  hooks/       data hooks (useStandings, useSchedule, useResults, …)
  components/  shell + per-view components
  routes/      Live, Schedule, Standings, Results, Telemetry, Profile, Settings
  lib/         formatting, team colours
  theme/       dark broadcast theme tokens
```

## License

Personal use. No license granted for redistribution.
