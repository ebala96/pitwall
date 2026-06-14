import { getLocation } from '../api/openf1.js'
import { groupLocation, oneLap, outlineDriver } from '../lib/trackMap.js'
import { useF1Query } from './useF1.js'

const WIN_MS = 110_000

// Circuit outline: scan a few ~110s windows around mid-session (robust to sparse
// data / 404-empty windows), pick the driver with the most points, trim to one
// lap. One all-driver request per tried window; cached (immutable).
export function useTrackOutline(sessionKey, start, end, enabled = true) {
  return useF1Query({
    key: ['trackOutline', sessionKey],
    resource: 'telemetry',
    flags: { isPast: true },
    enabled: Boolean(sessionKey) && enabled && start != null,
    queryFn: async (signal) => {
      const mid = end ? start + (end - start) / 2 : start + 20 * 60000
      for (const off of [0, -10 * 60000, 10 * 60000, -20 * 60000]) {
        const ws = mid + off
        const rows = await getLocation(
          {
            sessionKey,
            dateStart: new Date(ws).toISOString(),
            dateEnd: new Date(ws + WIN_MS).toISOString(),
          },
          signal,
        )
        if (rows.length) {
          const by = groupLocation(rows, ws)
          const num = outlineDriver(by)
          if (num && by[num]?.length) {
            return { points: oneLap(by[num].map((p) => ({ x: p.x, y: p.y }))) }
          }
        }
      }
      return { points: [] }
    },
  })
}
