import { resolveSession } from '../api/resolveSession.js'
import { useF1Query } from './useF1.js'

// Resolve a Jolpica race → OpenF1 session_key + start/end times (cheap, cached).
export function useResolvedSession(season, round, kind = 'race') {
  return useF1Query({
    key: ['resolvedSession', season, round, kind],
    resource: 'reference',
    flags: { isPast: true },
    enabled: Boolean(round) && Number(season) >= 2023,
    queryFn: async (signal) => {
      const r = await resolveSession(season, round, kind, signal)
      if (!r) return { sessionKey: null }
      const s = r.session
      return {
        sessionKey: r.sessionKey,
        start: new Date(s.date_start).getTime(),
        end: s.date_end ? new Date(s.date_end).getTime() : null,
        session: s,
      }
    },
  })
}
