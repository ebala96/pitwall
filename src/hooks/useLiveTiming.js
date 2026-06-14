import { getDrivers, getIntervals, getPositions, getStints } from '../api/openf1.js'
import { resolveSession } from '../api/resolveSession.js'
import { useF1Query } from './useF1.js'

// Live timing for an active session: resolves the session then polls position +
// intervals + stints (+ static drivers) every 15s. Only enabled while live.
export function useLiveTiming(season, round, kind, active) {
  return useF1Query({
    key: ['liveTiming', season, round, kind],
    resource: 'session',
    flags: { activeWindow: active, isPast: !active },
    refetchInterval: active ? 15000 : false,
    enabled: Boolean(active) && Boolean(round) && Number(season) >= 2023,
    queryFn: async (signal) => {
      const resolved = await resolveSession(season, round, kind, signal)
      if (!resolved) return { sessionKey: null }
      const key = resolved.sessionKey
      const [drivers, positions, intervals, stints] = await Promise.all([
        getDrivers(key, signal),
        getPositions(key, signal),
        getIntervals(key, signal),
        getStints(key, signal),
      ])
      return { sessionKey: key, drivers, positions, intervals, stints }
    },
  })
}
