import { describe, expect, it } from 'vitest'
import { buildReplayRows, currentLapAsOf, leaderLap, totalLaps } from './replay.js'

const positions = [
  { driver_number: 1, position: 1, date: '2024-01-01T00:00:00Z' },
  { driver_number: 16, position: 2, date: '2024-01-01T00:00:00Z' },
  { driver_number: 1, position: 2, date: '2024-01-01T00:10:00Z' }, // overtaken at +10m
  { driver_number: 16, position: 1, date: '2024-01-01T00:10:00Z' },
]
const intervals = [
  { driver_number: 1, gap_to_leader: 0, interval: 0, date: '2024-01-01T00:00:00Z' },
  { driver_number: 16, gap_to_leader: 1.5, interval: 1.5, date: '2024-01-01T00:00:00Z' },
]
const stints = [{ driverNumber: 1, compound: 'MEDIUM', lapStart: 1, lapEnd: 30, ageAtStart: 2 }]
const laps = [
  { driver_number: 1, lap_number: 1, date_start: '2024-01-01T00:00:00Z' },
  { driver_number: 1, lap_number: 5, date_start: '2024-01-01T00:08:00Z' },
  { driver_number: 16, lap_number: 6, date_start: '2024-01-01T00:09:00Z' },
]
const drivers = { 1: { code: 'VER' }, 16: { code: 'LEC' } }

describe('buildReplayRows', () => {
  it('reflects order at an early moment', () => {
    const rows = buildReplayRows(Date.parse('2024-01-01T00:05:00Z'), { positions, intervals, stints, laps, drivers })
    expect(rows.map((r) => r.code)).toEqual(['VER', 'LEC'])
    expect(rows[0].gap).toBe(0)
  })

  it('reflects the order after the overtake, with movement delta', () => {
    const rows = buildReplayRows(Date.parse('2024-01-01T00:12:00Z'), { positions, intervals, stints, laps, drivers })
    expect(rows.map((r) => r.code)).toEqual(['LEC', 'VER'])
    expect(rows.find((r) => r.code === 'VER').delta).toBe(-1) // 1 -> 2
  })

  it('derives tyre from the stint covering the current lap', () => {
    const rows = buildReplayRows(Date.parse('2024-01-01T00:08:30Z'), { positions, intervals, stints, laps, drivers })
    const ver = rows.find((r) => r.code === 'VER')
    expect(ver.compound).toBe('MEDIUM')
    expect(ver.age).toBe(6) // ageAtStart 2 + (lap 5 - lapStart 1)
  })
})

describe('currentLapAsOf / totals', () => {
  it('tracks current lap per driver and leader/total', () => {
    const cl = currentLapAsOf(laps, Date.parse('2024-01-01T00:09:30Z'))
    expect(cl[1]).toBe(5)
    expect(cl[16]).toBe(6)
    expect(leaderLap(cl)).toBe(6)
    expect(totalLaps(laps)).toBe(6)
  })
})
