import { describe, expect, it } from 'vitest'
import { buildLiveTimingRows, fmtGap, resolveKind } from './liveTiming.js'

describe('buildLiveTimingRows', () => {
  const positions = [
    { driver_number: 1, position: 1, date: '2024-01-01T13:00:00Z' },
    { driver_number: 1, position: 2, date: '2024-01-01T13:05:00Z' }, // newer -> P2
    { driver_number: 16, position: 2, date: '2024-01-01T13:00:00Z' },
    { driver_number: 16, position: 1, date: '2024-01-01T13:05:00Z' }, // newer -> P1
  ]
  const intervals = [
    { driver_number: 16, gap_to_leader: 0, interval: 0, date: '2024-01-01T13:05:00Z' },
    { driver_number: 1, gap_to_leader: 1.234, interval: 1.234, date: '2024-01-01T13:05:00Z' },
  ]
  // mapped stint shape (as getStints returns)
  const stints = [{ driverNumber: 16, compound: 'SOFT', lapStart: 1, lapEnd: 10, ageAtStart: 0 }]
  const drivers = { 1: { code: 'VER', team: 'RB' }, 16: { code: 'LEC', team: 'Ferrari' } }

  it('orders by the latest position per driver', () => {
    const rows = buildLiveTimingRows({ positions, intervals, stints, drivers })
    expect(rows.map((r) => r.code)).toEqual(['LEC', 'VER'])
    expect(rows[0].position).toBe(1)
  })

  it('derives the movement arrow from the last position change', () => {
    const rows = buildLiveTimingRows({ positions, intervals, stints, drivers })
    expect(rows.find((r) => r.code === 'LEC').delta).toBe(1) // 2 -> 1, gained
    expect(rows.find((r) => r.code === 'VER').delta).toBe(-1) // 1 -> 2, lost
  })

  it('attaches gap, interval and tyre', () => {
    const rows = buildLiveTimingRows({ positions, intervals, stints, drivers })
    expect(rows[0].gap).toBe(0)
    expect(rows[1].gap).toBe(1.234)
    expect(rows[0].compound).toBe('SOFT')
  })
})

describe('fmtGap', () => {
  it('formats numbers, passes strings, blanks null', () => {
    expect(fmtGap(1.2)).toBe('+1.200')
    expect(fmtGap('+1 LAP')).toBe('+1 LAP')
    expect(fmtGap(null)).toBe('')
  })
})

describe('resolveKind', () => {
  it('maps schedule kinds to resolve kinds', () => {
    expect(resolveKind('Race')).toBe('race')
    expect(resolveKind('ThirdPractice')).toBe('fp3')
    expect(resolveKind('SprintQualifying')).toBe('sprint')
    expect(resolveKind('???')).toBe('race')
  })
})
