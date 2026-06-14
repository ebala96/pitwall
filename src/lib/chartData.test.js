import { describe, expect, it } from 'vitest'
import { buildGapData, buildLapTimeData, buildTraceData, fastestLapNumber } from './chartData.js'

const laps = {
  44: [
    { lap_number: 1, lap_duration: 90 },
    { lap_number: 2, lap_duration: 88 },
    { lap_number: 3, lap_duration: 89 },
  ],
  16: [
    { lap_number: 1, lap_duration: 91 },
    { lap_number: 2, lap_duration: 87 },
    { lap_number: 3, lap_duration: 90 },
  ],
}

describe('buildLapTimeData', () => {
  it('aligns lap durations onto a 1..maxLap x axis', () => {
    const { data, maxLap } = buildLapTimeData(laps, [44, 16])
    expect(maxLap).toBe(3)
    expect(data[0]).toEqual([1, 2, 3])
    expect(data[1]).toEqual([90, 88, 89])
    expect(data[2]).toEqual([91, 87, 90])
  })

  it('fills missing laps with null', () => {
    const { data } = buildLapTimeData({ 44: [{ lap_number: 2, lap_duration: 88 }] }, [44])
    expect(data[1]).toEqual([null, 88])
  })
})

describe('buildGapData', () => {
  it('computes gap to the best cumulative time per lap', () => {
    const [xs, d44, d16] = buildGapData(laps, [44, 16])
    expect(xs).toEqual([1, 2, 3])
    // lap1 cum: 44=90,16=91 -> best 90 -> gaps 0, 1
    expect(d44[0]).toBe(0)
    expect(d16[0]).toBe(1)
    // lap2 cum: 44=178,16=178 -> tie -> both 0
    expect(d44[1]).toBe(0)
    expect(d16[1]).toBe(0)
  })
})

describe('buildTraceData', () => {
  it('merges driver samples onto a shared bucketed x axis', () => {
    const byDriver = {
      44: [
        { t: 0.0, speed: 100 },
        { t: 0.2, speed: 150 },
      ],
      16: [
        { t: 0.0, speed: 110 },
        { t: 0.2, speed: 160 },
      ],
    }
    const [xs, s44, s16] = buildTraceData(byDriver, [44, 16], 'speed')
    expect(xs).toEqual([0, 0.2])
    expect(s44).toEqual([100, 150])
    expect(s16).toEqual([110, 160])
  })
})

describe('fastestLapNumber', () => {
  it('returns the lowest-duration lap number', () => {
    expect(fastestLapNumber(laps[44])).toBe(2)
    expect(fastestLapNumber([])).toBeNull()
  })
})
