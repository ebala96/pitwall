import { getConstructorSeason, getDriverSeason } from '../api/jolpica.js'
import { DEFAULT_SEASON } from '../config.js'
import { useF1Query } from './useF1.js'

export function useDriverProfile(season, driverId) {
  return useF1Query({
    key: ['profile', 'driver', season, driverId],
    resource: 'results',
    flags: { isPast: season < DEFAULT_SEASON },
    enabled: Boolean(driverId),
    queryFn: (signal) => getDriverSeason(season, driverId, signal),
  })
}

export function useConstructorProfile(season, constructorId) {
  return useF1Query({
    key: ['profile', 'constructor', season, constructorId],
    resource: 'results',
    flags: { isPast: season < DEFAULT_SEASON },
    enabled: Boolean(constructorId),
    queryFn: (signal) => getConstructorSeason(season, constructorId, signal),
  })
}
