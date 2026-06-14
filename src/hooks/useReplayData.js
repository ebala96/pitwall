import { getDrivers, getIntervals, getLaps, getPositions, getStints } from '../api/openf1.js'
import { resolveSession } from '../api/resolveSession.js'
import { useF1Query } from './useF1.js'

// Full-session series for the replay scrubber. position is small (~order changes
// only); intervals is larger but a single fetch. All immutable (past session).
export function useReplayData(season, round) {
  return useF1Query({
    key: ['replay', season, round],
    resource: 'session',
    flags: { isPast: true },
    enabled: Boolean(round) && Number(season) >= 2023,
    queryFn: async (signal) => {
      const resolved = await resolveSession(season, round, 'race', signal)
      if (!resolved) return { sessionKey: null }
      const key = resolved.sessionKey
      const s = resolved.session
      const start = new Date(s.date_start).getTime()
      const end = s.date_end ? new Date(s.date_end).getTime() : start + 2 * 3600_000
      const [drivers, positions, intervals, stints, laps] = await Promise.all([
        getDrivers(key, signal),
        getPositions(key, signal),
        getIntervals(key, signal),
        getStints(key, signal),
        getLaps({ sessionKey: key }, signal),
      ])
      return { sessionKey: key, start, end, drivers, positions, intervals, stints, laps }
    },
  })
}
