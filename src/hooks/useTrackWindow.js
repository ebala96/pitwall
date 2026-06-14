import { getLocation } from '../api/openf1.js'
import { groupLocation } from '../lib/trackMap.js'
import { useF1Query } from './useF1.js'

// One windowed all-driver location fetch → byDriver series (t relative to window
// start). Cached per windowStart so scrubbing back is instant. `live` enables
// short polling so the most-recent window keeps refreshing.
export function useTrackWindow(sessionKey, windowStartMs, durationSec, { enabled = true, live = false } = {}) {
  return useF1Query({
    key: ['trackWindow', sessionKey, windowStartMs, durationSec],
    resource: 'telemetry',
    flags: { isPast: !live },
    refetchInterval: live ? 12000 : false,
    enabled: Boolean(sessionKey) && enabled && windowStartMs != null,
    queryFn: async (signal) => {
      const dateStart = new Date(windowStartMs).toISOString()
      const dateEnd = new Date(windowStartMs + durationSec * 1000).toISOString()
      const rows = await getLocation({ sessionKey, dateStart, dateEnd }, signal)
      return groupLocation(rows, windowStartMs)
    },
  })
}
