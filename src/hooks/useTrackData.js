import { getDrivers, getLocation } from '../api/openf1.js'
import { resolveSession } from '../api/resolveSession.js'
import { groupLocation } from '../lib/trackMap.js'
import { useF1Query } from './useF1.js'

const WINDOW_SEC = 60

// Resolve the session, then fetch a bounded location window for every driver and
// normalise to { t (s into window), x, y }. `offsetFrac` (0..1) slides the window
// across the session so you can watch start / mid / late running.
export function useTrackData(season, round, kind, offsetFrac) {
  return useF1Query({
    key: ['trackData', season, round, kind, offsetFrac],
    resource: 'telemetry',
    flags: { isPast: true },
    enabled: Boolean(round) && Number(season) >= 2023,
    queryFn: async (signal) => {
      const resolved = await resolveSession(season, round, kind, signal)
      if (!resolved) return { sessionKey: null }
      const key = resolved.sessionKey
      const s = resolved.session
      const start = new Date(s.date_start).getTime()
      const end = s.date_end ? new Date(s.date_end).getTime() : start + 3600_000
      const winMs = WINDOW_SEC * 1000
      const span = Math.max(0, end - start - winMs)
      const winStart = start + Math.round(span * offsetFrac)
      const winEnd = winStart + winMs

      const dateStart = new Date(winStart).toISOString()
      const dateEnd = new Date(winEnd).toISOString()
      // One request for all drivers in the window, plus driver metadata.
      const [drivers, rows] = await Promise.all([
        getDrivers(key, signal),
        getLocation({ sessionKey: key, dateStart, dateEnd }, signal),
      ])
      const byDriver = groupLocation(rows, winStart)
      return { sessionKey: key, drivers, byDriver, duration: WINDOW_SEC }
    },
  })
}
