import { getDrivers, getLaps, getLocation } from '../api/openf1.js'
import { fastestLapNumber } from '../lib/chartData.js'
import { useF1Query } from './useF1.js'

// Circuit outline = one driver's single fastest lap (a clean, complete loop).
// Falls back to a 100s mid-session window if no lap data. Cached (immutable).
export function useTrackOutline(sessionKey, start, end, enabled = true) {
  return useF1Query({
    key: ['trackOutline', sessionKey],
    resource: 'telemetry',
    flags: { isPast: true },
    enabled: Boolean(sessionKey) && enabled,
    queryFn: async (signal) => {
      const drivers = await getDrivers(sessionKey, signal)
      const num = Object.keys(drivers).map(Number)[0]
      if (num == null) return { points: [] }

      const laps = await getLaps({ sessionKey, driverNumber: num }, signal)
      const lapNo = fastestLapNumber(laps)
      const lap = laps.find((l) => l.lap_number === lapNo)

      let dateStart
      let dateEnd
      if (lap?.date_start) {
        const s = new Date(lap.date_start).getTime()
        dateStart = lap.date_start
        dateEnd = new Date(s + (lap.lap_duration ?? 100) * 1000 + 500).toISOString()
      } else if (start) {
        const mid = end ? start + (end - start) / 2 : start + 30 * 60000
        dateStart = new Date(mid).toISOString()
        dateEnd = new Date(mid + 100000).toISOString()
      } else {
        return { points: [] }
      }

      const loc = await getLocation({ sessionKey, driverNumber: num, dateStart, dateEnd }, signal)
      return {
        points: loc
          .filter((p) => p.x != null && p.y != null && (p.x !== 0 || p.y !== 0))
          .map((p) => ({ x: p.x, y: p.y })),
      }
    },
  })
}
