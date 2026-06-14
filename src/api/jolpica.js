import { z } from 'zod'
import { fetchJson } from './http.js'
import {
  mapConstructorSeason,
  mapConstructorStandings,
  mapDriverSeason,
  mapDriverStandings,
  mapQualifying,
  mapRaceResults,
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

const Time = z.object({ millis: z.string().optional(), time: z.string().optional() }).optional()

const resultsResponse = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(
        z.object({
          season: z.string(),
          round: z.string(),
          raceName: z.string(),
          Results: z.array(
            z.object({
              position: z.string(),
              points: z.string(),
              grid: z.string(),
              laps: z.string().optional(),
              status: z.string(),
              Driver,
              Constructor,
              Time,
              FastestLap: z
                .object({
                  rank: z.string().optional(),
                  lap: z.string().optional(),
                  Time: z.object({ time: z.string().optional() }).optional(),
                })
                .optional(),
            }),
          ),
        }),
      ),
    }),
  }),
})

const qualifyingResponse = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(
        z.object({
          season: z.string(),
          round: z.string(),
          raceName: z.string(),
          QualifyingResults: z.array(
            z.object({
              position: z.string(),
              Driver,
              Constructor,
              Q1: z.string().optional(),
              Q2: z.string().optional(),
              Q3: z.string().optional(),
            }),
          ),
        }),
      ),
    }),
  }),
})

export async function getRaceResults(season, round, signal) {
  const raw = await fetchJson(`/api/jolpi/${season}/${round}/results.json`, {
    schema: resultsResponse,
    signal,
  })
  return mapRaceResults(raw)
}

export async function getQualifying(season, round, signal) {
  const raw = await fetchJson(`/api/jolpi/${season}/${round}/qualifying.json`, {
    schema: qualifyingResponse,
    signal,
  })
  return mapQualifying(raw)
}

const seasonResultsResponse = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(
        z.object({
          round: z.string(),
          raceName: z.string(),
          date: z.string().optional(),
          Circuit: z
            .object({
              circuitName: z.string().optional(),
              Location: z.object({ country: z.string().optional() }).optional(),
            })
            .optional(),
          Results: z.array(
            z.object({
              position: z.string().optional(),
              points: z.string(),
              grid: z.string().optional(),
              status: z.string().optional(),
              Driver,
              Constructor,
              FastestLap: z.object({ rank: z.string().optional() }).optional(),
            }),
          ),
        }),
      ),
    }),
  }),
})

export async function getDriverSeason(season, driverId, signal) {
  const raw = await fetchJson(`/api/jolpi/${season}/drivers/${driverId}/results.json?limit=100`, {
    schema: seasonResultsResponse,
    signal,
  })
  return mapDriverSeason(raw, season)
}

export async function getConstructorSeason(season, constructorId, signal) {
  const raw = await fetchJson(
    `/api/jolpi/${season}/constructors/${constructorId}/results.json?limit=100`,
    { schema: seasonResultsResponse, signal },
  )
  return mapConstructorSeason(raw, season)
}
