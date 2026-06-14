import { z } from 'zod'
import { fetchJson } from './http.js'
import {
  mapConstructorStandings,
  mapDriverStandings,
  mapSchedule,
  mapSeasons,
} from '../mappers/jolpica.map.js'

// --- response schemas (validate shape; mappers transform/coerce) -------------

const Driver = z.object({
  driverId: z.string(),
  code: z.string().optional(),
  permanentNumber: z.string().optional(),
  givenName: z.string(),
  familyName: z.string(),
  nationality: z.string().optional(),
})

const Constructor = z.object({
  constructorId: z.string(),
  name: z.string(),
  nationality: z.string().optional(),
})

const driverStandingsResponse = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      StandingsLists: z.array(
        z.object({
          season: z.string().optional(),
          round: z.string().optional(),
          DriverStandings: z.array(
            z.object({
              position: z.string().optional(),
              points: z.string(),
              wins: z.string().optional(),
              Driver,
              Constructors: z.array(Constructor),
            }),
          ),
        }),
      ),
    }),
  }),
})

const constructorStandingsResponse = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      StandingsLists: z.array(
        z.object({
          season: z.string().optional(),
          round: z.string().optional(),
          ConstructorStandings: z.array(
            z.object({
              position: z.string().optional(),
              points: z.string(),
              wins: z.string().optional(),
              Constructor,
            }),
          ),
        }),
      ),
    }),
  }),
})

const seasonsResponse = z.object({
  MRData: z.object({
    SeasonTable: z.object({
      Seasons: z.array(z.object({ season: z.string() })),
    }),
  }),
})

const Session = z.object({ date: z.string(), time: z.string().optional() }).optional()

const scheduleResponse = z.object({
  MRData: z.object({
    RaceTable: z.object({
      season: z.string().optional(),
      Races: z.array(
        z.object({
          season: z.string(),
          round: z.string(),
          raceName: z.string(),
          url: z.string().optional(),
          date: z.string(),
          time: z.string().optional(),
          Circuit: z.object({
            circuitId: z.string(),
            circuitName: z.string(),
            Location: z
              .object({ locality: z.string().optional(), country: z.string().optional() })
              .optional(),
          }),
          FirstPractice: Session,
          SecondPractice: Session,
          ThirdPractice: Session,
          SprintQualifying: Session,
          Sprint: Session,
          Qualifying: Session,
        }),
      ),
    }),
  }),
})

// --- client functions (build /api/jolpi paths from typed params) -------------

export async function getDriverStandings(season, signal) {
  const raw = await fetchJson(`/api/jolpi/${season}/driverStandings.json`, {
    schema: driverStandingsResponse,
    signal,
  })
  return mapDriverStandings(raw)
}

export async function getConstructorStandings(season, signal) {
  const raw = await fetchJson(`/api/jolpi/${season}/constructorStandings.json`, {
    schema: constructorStandingsResponse,
    signal,
  })
  return mapConstructorStandings(raw)
}

export async function listSeasons(signal) {
  const raw = await fetchJson(`/api/jolpi/seasons.json?limit=100`, {
    schema: seasonsResponse,
    signal,
  })
  return mapSeasons(raw)
}

export async function getSchedule(season, signal) {
  const raw = await fetchJson(`/api/jolpi/${season}.json`, { schema: scheduleResponse, signal })
  return mapSchedule(raw)
}
