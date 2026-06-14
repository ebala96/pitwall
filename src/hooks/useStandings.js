import { getConstructorStandings, getDriverStandings } from '../api/jolpica.js'
import { DEFAULT_SEASON } from '../config.js'
import { useF1Query } from './useF1.js'

function flagsFor(season) {
  return { isPast: season < DEFAULT_SEASON }
}

export function useDriverStandings(season) {
  return useF1Query({
    key: ['standings', 'drivers', season],
    resource: 'standings',
    flags: flagsFor(season),
    queryFn: (signal) => getDriverStandings(season, signal),
  })
}

export function useConstructorStandings(season) {
  return useF1Query({
    key: ['standings', 'constructors', season],
    resource: 'standings',
    flags: flagsFor(season),
    queryFn: (signal) => getConstructorStandings(season, signal),
  })
}
