// Jolpica constructorId → broadcast team color. Approximate; neutral fallback
// keeps unknown / new / historical teams rendering cleanly.
const COLORS = {
  red_bull: '#3671C6',
  ferrari: '#E8002D',
  mercedes: '#27F4D2',
  mclaren: '#FF8000',
  aston_martin: '#229971',
  alpine: '#0093CC',
  williams: '#64C4FF',
  rb: '#6692FF',
  sauber: '#52E252',
  haas: '#B6BABD',
  // 2026 entrants (provisional)
  audi: '#009597',
  cadillac: '#B0883B',
}

const NEUTRAL = '#6b7280'

export function getTeamColor(constructorId) {
  return COLORS[constructorId] ?? NEUTRAL
}
