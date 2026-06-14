import { getDrivers } from '../api/openf1.js'
import { useF1Query } from './useF1.js'

// driver_number → { code, name, team, colour } for a session (static, cached).
export function useSessionDrivers(sessionKey, enabled = true) {
  return useF1Query({
    key: ['drivers', sessionKey],
    resource: 'reference',
    flags: { isPast: true },
    enabled: Boolean(sessionKey) && enabled,
    queryFn: (signal) => getDrivers(sessionKey, signal),
  })
}
