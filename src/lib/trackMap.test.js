import { describe, expect, it } from 'vitest'
import { computeBounds, groupLocation, outlineDriver, project, sampleAt } from './trackMap.js'

describe('groupLocation', () => {
  it('groups by driver with t relative to window start, dropping origin/null', () => {
    const win = Date.parse('2024-01-01T00:00:00Z')
    const rows = [
      { driver_number: 1, date: '2024-01-01T00:00:02Z', x: 5, y: 6 },
      { driver_number: 1, date: '2024-01-01T00:00:00Z', x: 1, y: 2 },
      { driver_number: 1, date: '2024-01-01T00:00:01Z', x: 0, y: 0 }, // dropped
      { driver_number: 16, date: '2024-01-01T00:00:00Z', x: 9, y: 9 },
    ]
    const by = groupLocation(rows, win)
    expect(by[1].map((p) => p.t)).toEqual([0, 2]) // sorted, origin dropped
    expect(by[16]).toHaveLength(1)
  })
})

describe('computeBounds', () => {
  it('finds min/max across all drivers', () => {
    const b = computeBounds({ 1: [{ t: 0, x: -10, y: 5 }], 2: [{ t: 0, x: 20, y: -8 }] })
    expect(b).toEqual({ minX: -10, maxX: 20, minY: -8, maxY: 5 })
  })
  it('returns null when empty', () => {
    expect(computeBounds({})).toBeNull()
  })
})

describe('sampleAt', () => {
  const series = [
    { t: 0, x: 0, y: 0 },
    { t: 2, x: 10, y: 20 },
  ]
  it('interpolates between samples', () => {
    expect(sampleAt(series, 1)).toEqual({ x: 5, y: 10 })
  })
  it('clamps to ends', () => {
    expect(sampleAt(series, -5)).toEqual(series[0])
    expect(sampleAt(series, 99)).toEqual(series[1])
  })
})

describe('project', () => {
  it('flips y (north up) and stays within the viewBox', () => {
    const bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 }
    const top = project({ x: 0, y: 100 }, bounds, 1000, 0)
    const bottom = project({ x: 0, y: 0 }, bounds, 1000, 0)
    expect(top.y).toBeLessThan(bottom.y)
  })
})

describe('outlineDriver', () => {
  it('picks the driver with most samples', () => {
    expect(outlineDriver({ 1: [{}, {}], 7: [{}, {}, {}] })).toBe('7')
  })
})
