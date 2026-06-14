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

export function mapDriverSeason(raw, season) {
  const races = raw.MRData.RaceTable.Races
  const first = races[0]?.Results[0]
  const rounds = races.map((r) => {
    const res = r.Results[0]
    return {
      round: Number(r.round),
      raceName: r.raceName,
      position: res.position ? Number(res.position) : null,
      points: Number(res.points),
      grid: res.grid ? Number(res.grid) : null,
      status: res.status ?? null,
      constructorId: res.Constructor.constructorId,
      constructorName: res.Constructor.name,
    }
  })
  return {
    type: 'driver',
    id: first?.Driver.driverId ?? null,
    season: Number(season),
    name: first ? `${first.Driver.givenName} ${first.Driver.familyName}` : null,
    code: first ? code(first.Driver) : null,
    number: first?.Driver.permanentNumber ?? null,
    nationality: first?.Driver.nationality ?? null,
    constructorId: rounds.at(-1)?.constructorId ?? null,
    constructorName: rounds.at(-1)?.constructorName ?? null,
    rounds,
    stats: driverStats(rounds),
  }
}

function driverStats(rounds) {
  const finishes = rounds.filter((r) => r.position != null)
  return {
    starts: rounds.length,
    wins: finishes.filter((r) => r.position === 1).length,
    podiums: finishes.filter((r) => r.position <= 3).length,
    poles: rounds.filter((r) => r.grid === 1).length,
    points: rounds.reduce((s, r) => s + r.points, 0),
    bestFinish: finishes.length ? Math.min(...finishes.map((r) => r.position)) : null,
  }
}

export function mapConstructorSeason(raw, season) {
  const races = raw.MRData.RaceTable.Races
  const first = races[0]?.Results[0]?.Constructor
  const rounds = races.map((r) => {
    const positions = r.Results.map((x) => (x.position ? Number(x.position) : null)).filter(
      (x) => x != null,
    )
    return {
      round: Number(r.round),
      raceName: r.raceName,
      points: r.Results.reduce((s, x) => s + Number(x.points), 0),
      position: positions.length ? Math.min(...positions) : null,
      drivers: r.Results.map((x) => code(x.Driver)),
    }
  })
  return {
    type: 'constructor',
    id: first?.constructorId ?? null,
    season: Number(season),
    name: first?.name ?? null,
    constructorId: first?.constructorId ?? null,
    constructorName: first?.name ?? null,
    nationality: first?.nationality ?? null,
    rounds,
    stats: {
      starts: rounds.length,
      wins: rounds.filter((r) => r.position === 1).length,
      podiums: rounds.filter((r) => r.position != null && r.position <= 3).length,
      points: rounds.reduce((s, r) => s + r.points, 0),
      bestFinish: rounds.some((r) => r.position != null)
        ? Math.min(...rounds.filter((r) => r.position != null).map((r) => r.position))
        : null,
    },
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
