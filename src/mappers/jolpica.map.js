// Transform validated Jolpica responses into flat domain shapes the UI uses.
import { isoOf } from '../lib/format.js'

function code(driver) {
  return driver.code ?? driver.familyName.slice(0, 3).toUpperCase()
}

export function mapDriverStandings(raw) {
  const list = raw.MRData.StandingsTable.StandingsLists[0]
  if (!list) return { season: null, round: null, rows: [] }
  return {
    season: list.season ? Number(list.season) : null,
    round: list.round ? Number(list.round) : null,
    rows: list.DriverStandings.map((s) => {
      const team = s.Constructors[s.Constructors.length - 1]
      return {
        position: s.position ? Number(s.position) : null,
        points: Number(s.points),
        wins: s.wins ? Number(s.wins) : 0,
        driverId: s.Driver.driverId,
        code: code(s.Driver),
        number: s.Driver.permanentNumber ?? null,
        name: `${s.Driver.givenName} ${s.Driver.familyName}`,
        nationality: s.Driver.nationality ?? null,
        constructorId: team?.constructorId ?? null,
        constructorName: team?.name ?? null,
      }
    }),
  }
}

export function mapConstructorStandings(raw) {
  const list = raw.MRData.StandingsTable.StandingsLists[0]
  if (!list) return { season: null, round: null, rows: [] }
  return {
    season: list.season ? Number(list.season) : null,
    round: list.round ? Number(list.round) : null,
    rows: list.ConstructorStandings.map((s) => ({
      position: s.position ? Number(s.position) : null,
      points: Number(s.points),
      wins: s.wins ? Number(s.wins) : 0,
      constructorId: s.Constructor.constructorId,
      constructorName: s.Constructor.name,
      nationality: s.Constructor.nationality ?? null,
    })),
  }
}

export function mapSeasons(raw) {
  return raw.MRData.SeasonTable.Seasons.map((s) => Number(s.season)).sort((a, b) => b - a)
}

const SESSION_LABELS = [
  ['FirstPractice', 'FP1'],
  ['SecondPractice', 'FP2'],
  ['ThirdPractice', 'FP3'],
  ['SprintQualifying', 'Sprint Quali'],
  ['Sprint', 'Sprint'],
  ['Qualifying', 'Quali'],
]

export function mapRaceResults(raw) {
  const race = raw.MRData.RaceTable.Races[0]
  if (!race) return { name: null, round: null, rows: [] }
  return {
    name: race.raceName,
    round: Number(race.round),
    rows: race.Results.map((r) => {
      const grid = Number(r.grid)
      const position = Number(r.position)
      return {
        position,
        driverId: r.Driver.driverId,
        code: code(r.Driver),
        name: `${r.Driver.givenName} ${r.Driver.familyName}`,
        number: r.Driver.permanentNumber ?? null,
        constructorId: r.Constructor.constructorId,
        constructorName: r.Constructor.name,
        grid,
        // grid→finish delta; null for pit-lane start (grid 0)
        delta: grid === 0 ? null : grid - position,
        laps: r.laps ? Number(r.laps) : null,
        status: r.status,
        time: r.Time?.time ?? null,
        points: Number(r.points),
        fastestLap: r.FastestLap
          ? { rank: r.FastestLap.rank ? Number(r.FastestLap.rank) : null, time: r.FastestLap.Time?.time ?? null }
          : null,
      }
    }),
  }
}

export function mapQualifying(raw) {
  const race = raw.MRData.RaceTable.Races[0]
  if (!race) return { name: null, round: null, rows: [] }
  return {
    name: race.raceName,
    round: Number(race.round),
    rows: race.QualifyingResults.map((q) => ({
      position: Number(q.position),
      driverId: q.Driver.driverId,
      code: code(q.Driver),
      name: `${q.Driver.givenName} ${q.Driver.familyName}`,
      constructorId: q.Constructor.constructorId,
      constructorName: q.Constructor.name,
      q1: q.Q1 || null,
      q2: q.Q2 || null,
      q3: q.Q3 || null,
      // which segment the driver reached (for dimming eliminated rows)
      segment: q.Q3 ? 3 : q.Q2 ? 2 : 1,
    })),
  }
}

export function mapSchedule(raw) {
  const races = raw.MRData.RaceTable.Races.map((r) => {
    const sessions = []
    for (const [key, label] of SESSION_LABELS) {
      const s = r[key]
      if (s?.date) sessions.push({ kind: key, label, start: isoOf(s.date, s.time) })
    }
    const raceStart = isoOf(r.date, r.time)
    sessions.push({ kind: 'Race', label: 'Race', start: raceStart })
    sessions.sort((a, b) => new Date(a.start) - new Date(b.start))
    const loc = r.Circuit.Location
    return {
      season: Number(r.season),
      round: Number(r.round),
      name: r.raceName,
      circuitId: r.Circuit.circuitId,
      circuitName: r.Circuit.circuitName,
      locality: loc?.locality ?? null,
      country: loc?.country ?? null,
      raceStart,
      isSprint: sessions.some((s) => s.kind === 'Sprint'),
      sessions,
    }
  })
  return { season: races[0]?.season ?? null, races }
}
