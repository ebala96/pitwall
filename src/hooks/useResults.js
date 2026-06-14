import { getQualifying, getRaceResults } from '../api/jolpica.js'
import { DEFAULT_SEASON } from '../config.js'
import { useF1Query } from './useF1.js'

export function useRaceResults(season, round) {
  return useF1Query({
    key: ['results', 'race', season, round],
    resource: 'results',
    flags: { isPast: season < DEFAULT_SEASON },
    queryFn: (signal) => getRaceResults(season, round, signal),
    enabled: Boolean(round),
  })
}

export function useQualifying(season, round) {
  return useF1Query({
    key: ['results', 'qualifying', season, round],
    resource: 'qualifying',
    flags: { isPast: season < DEFAULT_SEASON },
    queryFn: (signal) => getQualifying(season, round, signal),
    enabled: Boolean(round),
  })
}
