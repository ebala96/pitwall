import { DEFAULT_SEASON, TELEMETRY_FIRST_SEASON } from '../../config.js'

export function SessionSelector({ season, onSeason, round, onRound, races }) {
  const seasons = []
  for (let y = DEFAULT_SEASON; y >= TELEMETRY_FIRST_SEASON; y--) seasons.push(y)

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <select value={season} onChange={(e) => onSeason(Number(e.target.value))} style={select}>
        {seasons.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <select
        value={round ?? ''}
        onChange={(e) => onRound(Number(e.target.value))}
        disabled={!races.length}
        style={{ ...select, maxWidth: 260 }}
      >
        {!races.length && <option value="">Loading…</option>}
        {races.map((r) => (
          <option key={r.round} value={r.round}>
            R{r.round} · {r.name}
          </option>
        ))}
      </select>
    </div>
  )
}

const select = {
  background: 'var(--panel-2)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '5px 10px',
  fontSize: 13,
}
