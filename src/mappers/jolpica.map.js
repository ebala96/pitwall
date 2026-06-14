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
