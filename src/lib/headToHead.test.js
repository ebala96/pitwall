import { describe, expect, it } from 'vitest'
import { seasonH2H, weekendH2H } from './headToHead.js'

describe('weekendH2H', () => {
  it('marks the lower position / higher points as winner', () => {
    const raceA = { position: 1, grid: 2, points: 25 }
    const raceB = { position: 3, grid: 1, points: 15 }
    const qualiA = { position: 2 }
    const qualiB = { position: 1 }
    const m = weekendH2H(raceA, raceB, qualiA, qualiB)
    expect(m.find((x) => x.label === 'Qualifying').winner).toBe('b') // 1 < 2
    expect(m.find((x) => x.label === 'Grid').winner).toBe('b') // 1 < 2
    expect(m.find((x) => x.label === 'Finish').winner).toBe('a') // 1 < 3
    expect(m.find((x) => x.label === 'Points').winner).toBe('a') // 25 > 15
  })

  it('returns null winner when a value is missing, tie when equal', () => {
    const m = weekendH2H({ position: 1 }, {}, { position: 2 }, { position: 2 })
    expect(m.find((x) => x.label === 'Finish').winner).toBeNull()
    expect(m.find((x) => x.label === 'Qualifying').winner).toBe('tie')
  })
})

describe('seasonH2H', () => {
  it('compares season stats', () => {
    const m = seasonH2H({ stats: { points: 100, wins: 2, podiums: 4, bestFinish: 1 } }, {
      stats: { points: 80, wins: 1, podiums: 5, bestFinish: 2 },
    })
    expect(m.find((x) => x.label === 'Season points').winner).toBe('a')
    expect(m.find((x) => x.label === 'Podiums').winner).toBe('b')
    expect(m.find((x) => x.label === 'Best finish').winner).toBe('a')
  })
})
