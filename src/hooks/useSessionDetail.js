import { getDrivers, getRaceControl, getStints, getWeather } from '../api/openf1.js'
import { resolveSession } from '../api/resolveSession.js'
import { useF1Query } from './useF1.js'

// Resolve a Jolpica race → OpenF1 session, then fetch the per-session extras
// (drivers, stints, weather, race control) in one composite query. Returns
// { sessionKey: null } when OpenF1 has no matching session (pre-2023 / unavailable).
export function useSessionDetail(season, round, enabled = true) {
  return useF1Query({
    key: ['sessionDetail', season, round],
    resource: 'session',
    flags: { isPast: true },
    enabled: enabled && Boolean(round) && Number(season) >= 2023,
    queryFn: async (signal) => {
      const resolved = await resolveSession(season, round, 'race', signal)
      if (!resolved) return { sessionKey: null }
      const key = resolved.sessionKey
      const [drivers, stints, weather, raceControl] = await Promise.all([
        getDrivers(key, signal),
        getStints(key, signal),
        getWeather(key, signal),
        getRaceControl(key, signal),
      ])
      return { sessionKey: key, session: resolved.session, drivers, stints, weather, raceControl }
    },
  })
}
