import { describe, expect, it } from 'vitest'
import { ACTIVE_POST_MS, ACTIVE_PRE_MS, classify, isActiveWindow } from './ttl.js'

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe('isActiveWindow', () => {
  const session = { start: '2026-06-14T13:00:00Z', end: '2026-06-14T15:00:00Z' }
  const start = Date.parse(session.start)
  const end = Date.parse(session.end)

  it('is true during the session', () => {
    expect(isActiveWindow(session, start + 30 * MIN)).toBe(true)
  })

  it('is true within the pre-window', () => {
    expect(isActiveWindow(session, start - ACTIVE_PRE_MS + 1)).toBe(true)
  })

  it('is true within the post-window', () => {
    expect(isActiveWindow(session, end + ACTIVE_POST_MS - 1)).toBe(true)
  })

  it('is false before the pre-window', () => {
    expect(isActiveWindow(session, start - ACTIVE_PRE_MS - 1)).toBe(false)
  })

  it('is false after the post-window', () => {
    expect(isActiveWindow(session, end + ACTIVE_POST_MS + 1)).toBe(false)
  })

  it('is false for missing/garbage input', () => {
    expect(isActiveWindow(null, start)).toBe(false)
    expect(isActiveWindow({ start: 'nope', end: 'nope' }, start)).toBe(false)
  })
})

describe('classify', () => {
  it('reference data is long-lived and not live', () => {
    const r = classify('reference')
    expect(r.staleTime).toBe(7 * DAY)
    expect(r.refetchInterval).toBe(false)
  })

  it('current schedule uses 6h; past season is immutable', () => {
    expect(classify('schedule').staleTime).toBe(6 * HOUR)
    expect(classify('schedule', { isPast: true }).staleTime).toBe(30 * DAY)
  })

  it('standings: off-session 3h, active window 5m+poll, past immutable', () => {
    expect(classify('standings').staleTime).toBe(3 * HOUR)
    const live = classify('standings', { activeWindow: true })
    expect(live.staleTime).toBe(5 * MIN)
    expect(live.refetchInterval).toBe(5 * MIN)
    expect(classify('standings', { isPast: true }).staleTime).toBe(30 * DAY)
  })

  it('results: current 30m, past immutable', () => {
    expect(classify('results').staleTime).toBe(30 * MIN)
    expect(classify('results', { isPast: true }).staleTime).toBe(30 * DAY)
  })

  it('session data: immutable unless active window (then 30s poll)', () => {
    expect(classify('laps').staleTime).toBe(30 * DAY)
    const live = classify('laps', { activeWindow: true })
    expect(live.staleTime).toBe(30_000)
    expect(live.refetchInterval).toBe(30_000)
  })

  it('weather/raceControl poll only inside the active window', () => {
    expect(classify('weather').refetchInterval).toBe(false)
    expect(classify('weather', { activeWindow: true }).refetchInterval).toBe(5 * MIN)
    expect(classify('raceControl', { activeWindow: true }).refetchInterval).toBe(1 * MIN)
  })

  it('unknown resource falls back to immutable', () => {
    expect(classify('whatever').staleTime).toBe(30 * DAY)
  })
})
