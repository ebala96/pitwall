import { useQuery } from '@tanstack/react-query'
import { classify } from '../data/ttl.js'

// Thin wrapper over useQuery that applies a TTL profile (staleTime / gcTime /
// refetchInterval) from data/ttl.js based on the resource kind + flags.
// Domain hooks (useF1.js consumers in milestone 3) call this with a queryFn.
//
//   useF1Query({
//     key: ['standings', 'drivers', season],
//     resource: 'standings',
//     flags: { isPast, activeWindow },
//     queryFn: (signal) => getDriverStandings(season, signal),
//   })
export function useF1Query({ key, resource, flags, queryFn, enabled = true, select, refetchInterval }) {
  const classified = classify(resource, flags)
  return useQuery({
    queryKey: key,
    queryFn: ({ signal }) => queryFn(signal),
    staleTime: classified.staleTime,
    gcTime: classified.gcTime,
    refetchInterval: refetchInterval ?? classified.refetchInterval,
    enabled,
    select,
  })
}
