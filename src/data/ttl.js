const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

export const ACTIVE_PRE_MS = 15 * MIN
export const ACTIVE_POST_MS = 30 * MIN

// Active race window: now ∈ [session.start − 15m, session.end + 30m].
// `session` = { start, end } as ISO strings (or anything Date can parse).
export function isActiveWindow(session, now = Date.now()) {
  if (!session?.start || !session?.end) return false
  const start = new Date(session.start).getTime()
  const end = new Date(session.end).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return false
  return now >= start - ACTIVE_PRE_MS && now <= end + ACTIVE_POST_MS
}

// Freshness profiles (mirrors the PLAN.md TTL table). `live` → poll via refetchInterval.
const PROFILE = {
  reference: { staleTime: 7 * DAY, gcTime: 30 * DAY, live: false },
  schedule: { staleTime: 6 * HOUR, gcTime: 30 * DAY, live: false },
  standings: { staleTime: 3 * HOUR, gcTime: 30 * DAY, live: false },
  standingsLive: { staleTime: 5 * MIN, gcTime: 30 * DAY, live: true },
  resultsCurrent: { staleTime: 30 * MIN, gcTime: 30 * DAY, live: false },
  sessionLive: { staleTime: 30_000, gcTime: 7 * DAY, live: true },
  weatherLive: { staleTime: 5 * MIN, gcTime: 7 * DAY, live: true },
  raceControlLive: { staleTime: 1 * MIN, gcTime: 7 * DAY, live: true },
  immutable: { staleTime: 30 * DAY, gcTime: 30 * DAY, live: false },
}

// classify(resource, { isPast, activeWindow }) → { staleTime, gcTime, refetchInterval }
export function classify(resource, flags = {}) {
  const p = resolve(resource, flags)
  return {
    staleTime: p.staleTime,
    gcTime: p.gcTime,
    refetchInterval: p.live ? p.staleTime : false,
  }
}

function resolve(resource, { isPast = false, activeWindow = false } = {}) {
  switch (resource) {
    case 'reference':
      return PROFILE.reference
    case 'schedule':
      return isPast ? PROFILE.immutable : PROFILE.schedule
    case 'standings':
      if (isPast) return PROFILE.immutable
      return activeWindow ? PROFILE.standingsLive : PROFILE.standings
    case 'results':
    case 'qualifying':
      return isPast ? PROFILE.immutable : PROFILE.resultsCurrent
    case 'session':
    case 'laps':
    case 'positions':
    case 'intervals':
    case 'stints':
    case 'pit':
    case 'telemetry':
      if (isPast) return PROFILE.immutable
      return activeWindow ? PROFILE.sessionLive : PROFILE.immutable
    case 'weather':
      return activeWindow ? PROFILE.weatherLive : PROFILE.immutable
    case 'raceControl':
      return activeWindow ? PROFILE.raceControlLive : PROFILE.immutable
    default:
      return PROFILE.immutable
  }
}
