import { z } from 'zod'
import { fetchJson as rawFetchJson } from './http.js'
import { rateLimited } from './rateLimiter.js'

// All OpenF1 requests go through the rate limiter (serialized, 429-aware) so the
// app never trips OpenF1's Too Many Requests limit. OpenF1 returns 404
// ("No results found.") for a query window with zero rows — treat that as an
// empty result, not an error (otherwise empty windows flood the console + retry).
const fetchJson = (path, opts) =>
  rateLimited(() => rawFetchJson(path, opts)).catch((e) => {
    if (e?.status === 404) return []
    throw e
  })
import { mapDrivers, mapRaceControl, mapStints, mapWeather } from '../mappers/openf1.map.js'

// OpenF1 returns JSON numbers (not stringified like Jolpica). Schemas are lenient
// (most fields optional/nullable) because the API often returns null mid-session.

const numOrStr = z.union([z.number(), z.string()]).nullable().optional()

const sessionSchema = z.object({
  session_key: z.number(),
  session_name: z.string(),
  session_type: z.string().optional(),
  date_start: z.string().optional(),
  date_end: z.string().optional(),
  year: z.number().optional(),
  country_name: z.string().optional(),
  circuit_short_name: z.string().optional(),
  location: z.string().optional(),
  meeting_key: z.number().optional(),
})

const driverSchema = z.object({
  driver_number: z.number(),
  name_acronym: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  team_name: z.string().nullable().optional(),
  team_colour: z.string().nullable().optional(),
})

const positionSchema = z.object({
  driver_number: z.number(),
  position: z.number().nullable().optional(),
  date: z.string().optional(),
})

const intervalSchema = z.object({
  driver_number: z.number(),
  gap_to_leader: numOrStr,
  interval: numOrStr,
  date: z.string().optional(),
})

const lapSchema = z.object({
  driver_number: z.number(),
  lap_number: z.number().nullable().optional(),
  lap_duration: z.number().nullable().optional(),
  duration_sector_1: z.number().nullable().optional(),
  duration_sector_2: z.number().nullable().optional(),
  duration_sector_3: z.number().nullable().optional(),
  is_pit_out_lap: z.boolean().nullable().optional(),
  date_start: z.string().nullable().optional(),
})

const stintSchema = z.object({
  driver_number: z.number(),
  stint_number: z.number().nullable().optional(),
  compound: z.string().nullable().optional(),
  tyre_age_at_start: z.number().nullable().optional(),
  lap_start: z.number().nullable().optional(),
  lap_end: z.number().nullable().optional(),
})

const pitSchema = z.object({
  driver_number: z.number(),
  pit_duration: z.number().nullable().optional(),
  lap_number: z.number().nullable().optional(),
  date: z.string().optional(),
})

const weatherSchema = z.object({
  air_temperature: z.number().nullable().optional(),
  track_temperature: z.number().nullable().optional(),
  humidity: z.number().nullable().optional(),
  rainfall: z.number().nullable().optional(),
  wind_speed: z.number().nullable().optional(),
  wind_direction: z.number().nullable().optional(),
  pressure: z.number().nullable().optional(),
  date: z.string().optional(),
})

const carDataSchema = z.object({
  driver_number: z.number(),
  date: z.string(),
  speed: z.number().nullable().optional(),
  throttle: z.number().nullable().optional(),
  brake: z.number().nullable().optional(),
  n_gear: z.number().nullable().optional(),
  rpm: z.number().nullable().optional(),
  drs: z.number().nullable().optional(),
})

const locationSchema = z.object({
  driver_number: z.number(),
  date: z.string(),
  x: z.number().nullable().optional(),
  y: z.number().nullable().optional(),
})

const raceControlSchema = z.object({
  date: z.string().optional(),
  category: z.string().nullable().optional(),
  flag: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  driver_number: z.number().nullable().optional(),
  lap_number: z.number().nullable().optional(),
  scope: z.string().nullable().optional(),
  sector: z.number().nullable().optional(),
})

function qs(params) {
  const u = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== '') u.set(k, String(v))
  }
  return u.toString()
}

export async function getSessions(params, signal) {
  return fetchJson(`/api/openf1/sessions?${qs(params)}`, { schema: z.array(sessionSchema), signal })
}

export async function getDrivers(sessionKey, signal) {
  const raw = await fetchJson(`/api/openf1/drivers?${qs({ session_key: sessionKey })}`, {
    schema: z.array(driverSchema),
    signal,
  })
  return mapDrivers(raw)
}

export async function getPositions(sessionKey, signal) {
  return fetchJson(`/api/openf1/position?${qs({ session_key: sessionKey })}`, {
    schema: z.array(positionSchema),
    signal,
  })
}

export async function getIntervals(sessionKey, signal) {
  return fetchJson(`/api/openf1/intervals?${qs({ session_key: sessionKey })}`, {
    schema: z.array(intervalSchema),
    signal,
  })
}

export async function getLaps({ sessionKey, driverNumber, lapNumber }, signal) {
  const params = { session_key: sessionKey, driver_number: driverNumber, lap_number: lapNumber }
  return fetchJson(`/api/openf1/laps?${qs(params)}`, { schema: z.array(lapSchema), signal })
}

export async function getStints(sessionKey, signal) {
  const raw = await fetchJson(`/api/openf1/stints?${qs({ session_key: sessionKey })}`, {
    schema: z.array(stintSchema),
    signal,
  })
  return mapStints(raw)
}

export async function getPit(sessionKey, signal) {
  return fetchJson(`/api/openf1/pit?${qs({ session_key: sessionKey })}`, {
    schema: z.array(pitSchema),
    signal,
  })
}

export async function getWeather(sessionKey, signal) {
  const raw = await fetchJson(`/api/openf1/weather?${qs({ session_key: sessionKey })}`, {
    schema: z.array(weatherSchema),
    signal,
  })
  return mapWeather(raw)
}

export async function getRaceControl(sessionKey, signal) {
  const raw = await fetchJson(`/api/openf1/race_control?${qs({ session_key: sessionKey })}`, {
    schema: z.array(raceControlSchema),
    signal,
  })
  return mapRaceControl(raw)
}

// car_data is thousands of points/lap, so always fetch a bounded date window
// (one lap). OpenF1 uses comparison operators in the query (date>=, date<=).
export async function getCarData({ sessionKey, driverNumber, dateStart, dateEnd }, signal) {
  let path = `/api/openf1/car_data?session_key=${sessionKey}&driver_number=${driverNumber}`
  if (dateStart) path += `&date>=${encodeURIComponent(dateStart)}`
  if (dateEnd) path += `&date<=${encodeURIComponent(dateEnd)}`
  return fetchJson(path, { schema: z.array(carDataSchema), signal })
}

// Track position (x,y) time series, windowed by date. Omit driverNumber to fetch
// all drivers in one request (preferred for the track map — no per-driver fan-out).
export async function getLocation({ sessionKey, driverNumber, dateStart, dateEnd }, signal) {
  let path = `/api/openf1/location?session_key=${sessionKey}`
  if (driverNumber != null) path += `&driver_number=${driverNumber}`
  if (dateStart) path += `&date>=${encodeURIComponent(dateStart)}`
  if (dateEnd) path += `&date<=${encodeURIComponent(dateEnd)}`
  return fetchJson(path, { schema: z.array(locationSchema), signal })
}
