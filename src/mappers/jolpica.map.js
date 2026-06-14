// Transform validated Jolpica responses into flat domain shapes the UI uses.

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
