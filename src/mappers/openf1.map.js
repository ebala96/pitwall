// Transform validated OpenF1 responses into shapes the UI uses.

// driver_number → { code, name, team, colour } lookup (used by Live/Telemetry).
export function mapDrivers(raw) {
  const byNumber = {}
  for (const d of raw) {
    byNumber[d.driver_number] = {
      number: d.driver_number,
      code: d.name_acronym ?? String(d.driver_number),
      name: d.full_name ?? d.name_acronym ?? String(d.driver_number),
      team: d.team_name ?? null,
      // OpenF1 gives team_colour without the leading '#'
      colour: d.team_colour ? `#${d.team_colour.replace(/^#/, '')}` : null,
    }
  }
  return byNumber
}

// One stint row per driver tyre run.
export function mapStints(raw) {
  return raw
    .map((s) => ({
      driverNumber: s.driver_number,
      stint: s.stint_number ?? null,
      compound: s.compound ?? null,
      ageAtStart: s.tyre_age_at_start ?? 0,
      lapStart: s.lap_start ?? null,
      lapEnd: s.lap_end ?? null,
    }))
    .sort((a, b) => (a.lapStart ?? 0) - (b.lapStart ?? 0))
}

// Latest weather sample + the full series (for a small trend if needed).
export function mapWeather(raw) {
  const series = raw.map((w) => ({
    date: w.date ?? null,
    air: w.air_temperature ?? null,
    track: w.track_temperature ?? null,
    humidity: w.humidity ?? null,
    rainfall: w.rainfall ?? null,
    windSpeed: w.wind_speed ?? null,
  }))
  return { latest: series.at(-1) ?? null, series }
}

// Race-control feed, newest first.
export function mapRaceControl(raw) {
  return raw
    .map((m) => ({
      date: m.date ?? null,
      category: m.category ?? null,
      flag: m.flag ?? null,
      message: m.message ?? '',
      driverNumber: m.driver_number ?? null,
      lap: m.lap_number ?? null,
    }))
    .sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0))
}
