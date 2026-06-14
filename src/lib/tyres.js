// Tyre compound styling + helpers.
const COMPOUNDS = {
  SOFT: { label: 'S', color: '#e8002d', text: '#fff' },
  MEDIUM: { label: 'M', color: '#ffd23f', text: '#000' },
  HARD: { label: 'H', color: '#e6e9f0', text: '#000' },
  INTERMEDIATE: { label: 'I', color: '#43b02a', text: '#fff' },
  WET: { label: 'W', color: '#3671c6', text: '#fff' },
}

export function compoundStyle(compound) {
  return COMPOUNDS[String(compound ?? '').toUpperCase()] ?? { label: '?', color: '#6b7280', text: '#fff' }
}

// From mapped stints → { [driverNumber]: { compound, age } } for the latest stint.
export function latestTyreByDriver(stints) {
  const latest = {}
  for (const s of stints) {
    const cur = latest[s.driverNumber]
    if (!cur || (s.lapStart ?? 0) > (cur.lapStart ?? 0)) latest[s.driverNumber] = s
  }
  const out = {}
  for (const [num, s] of Object.entries(latest)) {
    const lapsRun = Math.max(0, (s.lapEnd ?? s.lapStart ?? 0) - (s.lapStart ?? 0))
    out[num] = { compound: s.compound, age: (s.ageAtStart ?? 0) + lapsRun }
  }
  return out
}
