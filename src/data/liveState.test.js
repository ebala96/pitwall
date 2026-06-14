import { describe, expect, it } from 'vitest'
import { getLiveSessionState } from './liveState.js'

const mkRace = (round, raceStart, sessions) => ({ round, raceStart, sessions, name: `R${round}` })

describe('getLiveSessionState', () => {
  it('offseason when no races', () => {
    expect(getLiveSessionState([], 0).phase).toBe('offseason')
  })

  it('upcoming before the season starts', () => {
    const races = [
      mkRace(1, '2026-03-01T13:00:00Z', [{ kind: 'Race', start: '2026-03-01T13:00:00Z' }]),
    ]
    const now = Date.parse('2026-02-01T00:00:00Z')
    const s = getLiveSessionState(races, now)
    expect(s.phase).toBe('upcoming')
    expect(s.race.round).toBe(1)
    expect(s.nextSession.start).toBe('2026-03-01T13:00:00Z')
  })

  it('live during a session active window', () => {
    const races = [
      mkRace(1, '2026-03-01T13:00:00Z', [{ kind: 'Race', start: '2026-03-01T13:00:00Z' }]),
    ]
    const now = Date.parse('2026-03-01T13:30:00Z')
    const s = getLiveSessionState(races, now)
    expect(s.phase).toBe('live')
    expect(s.activeSession.kind).toBe('Race')
  })

  it('recent shows the last completed race between rounds', () => {
    const races = [
      mkRace(1, '2026-03-01T13:00:00Z', [{ kind: 'Race', start: '2026-03-01T13:00:00Z' }]),
      mkRace(2, '2026-03-15T13:00:00Z', [{ kind: 'Race', start: '2026-03-15T13:00:00Z' }]),
    ]
    const now = Date.parse('2026-03-08T00:00:00Z')
    const s = getLiveSessionState(races, now)
    expect(s.phase).toBe('recent')
    expect(s.race.round).toBe(1)
    expect(s.nextSession.start).toBe('2026-03-15T13:00:00Z')
  })
})
