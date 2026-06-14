import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSchedule } from './jolpica.js'
import { getSessions } from './openf1.js'
import { resolveSession } from './resolveSession.js'

vi.mock('./jolpica.js', () => ({ getSchedule: vi.fn() }))
vi.mock('./openf1.js', () => ({ getSessions: vi.fn() }))

const schedule = {
  races: [
    {
      round: 7,
      country: 'Italy',
      raceStart: '2024-05-19T13:00:00Z',
      sessions: [
        { kind: 'Qualifying', start: '2024-05-18T14:00:00Z' },
        { kind: 'Race', start: '2024-05-19T13:00:00Z' },
      ],
    },
  ],
}

beforeEach(() => vi.clearAllMocks())

describe('resolveSession', () => {
  it('matches the race session by date', async () => {
    getSchedule.mockResolvedValue(schedule)
    getSessions.mockResolvedValue([
      { session_key: 9515, session_name: 'Race', date_start: '2024-05-19T13:00:00+00:00', country_name: 'Italy' },
      { session_key: 9999, session_name: 'Race', date_start: '2024-06-02T13:00:00+00:00', country_name: 'Spain' },
    ])
    const r = await resolveSession(2024, 7, 'race')
    expect(r.sessionKey).toBe(9515)
    expect(getSessions).toHaveBeenCalledWith({ year: 2024, session_name: 'Race' }, undefined)
  })

  it('resolves the qualifying session to its own date', async () => {
    getSchedule.mockResolvedValue(schedule)
    getSessions.mockResolvedValue([
      { session_key: 9514, session_name: 'Qualifying', date_start: '2024-05-18T14:00:00+00:00', country_name: 'Italy' },
    ])
    const r = await resolveSession(2024, 7, 'qualifying')
    expect(r.sessionKey).toBe(9514)
  })

  it('falls back to country match when no date matches', async () => {
    getSchedule.mockResolvedValue(schedule)
    getSessions.mockResolvedValue([
      { session_key: 4242, session_name: 'Race', date_start: '2024-05-20T13:00:00+00:00', country_name: 'Italy' },
    ])
    const r = await resolveSession(2024, 7, 'race')
    expect(r.sessionKey).toBe(4242)
  })

  it('returns null for pre-2023 seasons without hitting the API', async () => {
    const r = await resolveSession(2021, 1, 'race')
    expect(r).toBeNull()
    expect(getSchedule).not.toHaveBeenCalled()
  })

  it('returns null for an unknown round', async () => {
    getSchedule.mockResolvedValue(schedule)
    const r = await resolveSession(2024, 99, 'race')
    expect(r).toBeNull()
  })

  it('returns null when no session matches', async () => {
    getSchedule.mockResolvedValue(schedule)
    getSessions.mockResolvedValue([
      { session_key: 1, session_name: 'Race', date_start: '2024-09-09T13:00:00+00:00', country_name: 'Japan' },
    ])
    const r = await resolveSession(2024, 7, 'race')
    expect(r).toBeNull()
  })
})
