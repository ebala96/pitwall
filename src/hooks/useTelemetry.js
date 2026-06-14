import { getCarData, getLaps } from '../api/openf1.js'
import { useF1Query } from './useF1.js'

// Per-driver laps for the selected drivers (one getLaps each, in parallel).
export function useTelemetryLaps(sessionKey, driverNumbers) {
  const nums = [...driverNumbers].sort((a, b) => a - b)
  return useF1Query({
    key: ['laps', sessionKey, nums],
    resource: 'laps',
    flags: { isPast: true },
    enabled: Boolean(sessionKey) && nums.length > 0,
    queryFn: async (signal) => {
      const entries = await Promise.all(
        nums.map(async (n) => [n, await getLaps({ sessionKey, driverNumber: n }, signal)]),
      )
      return Object.fromEntries(entries)
    },
  })
}

// Windowed car_data for one lap per selected driver, mapped to { t (s into lap),
// speed, throttle, brake, gear }.
export function useLapTelemetry(sessionKey, driverNumbers, lapNumber, lapsByDriver) {
  const nums = [...driverNumbers].sort((a, b) => a - b)
  return useF1Query({
    key: ['carData', sessionKey, nums, lapNumber],
    resource: 'telemetry',
    flags: { isPast: true },
    enabled: Boolean(sessionKey) && nums.length > 0 && Boolean(lapNumber) && Boolean(lapsByDriver),
    queryFn: async (signal) => {
      const byDriver = {}
      await Promise.all(
        nums.map(async (n) => {
          const lap = (lapsByDriver?.[n] ?? []).find((l) => l.lap_number === lapNumber)
          if (!lap?.date_start) {
            byDriver[n] = []
            return
          }
          const start = new Date(lap.date_start).getTime()
          const endIso = new Date(start + (lap.lap_duration ?? 120) * 1000 + 1500).toISOString()
          const cd = await getCarData(
            { sessionKey, driverNumber: n, dateStart: lap.date_start, dateEnd: endIso },
            signal,
          )
          byDriver[n] = cd.map((p) => ({
            t: (new Date(p.date).getTime() - start) / 1000,
            speed: p.speed,
            throttle: p.throttle,
            brake: p.brake,
            gear: p.n_gear,
          }))
        }),
      )
      return byDriver
    },
  })
}
