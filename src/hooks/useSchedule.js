import { getSchedule } from '../api/jolpica.js'
import { DEFAULT_SEASON } from '../config.js'
import { useF1Query } from './useF1.js'

export function useSchedule(season) {
  return useF1Query({
    key: ['schedule', season],
    resource: 'schedule',
    flags: { isPast: season < DEFAULT_SEASON },
    queryFn: (signal) => getSchedule(season, signal),
  })
}
