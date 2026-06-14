import { fmtDay } from '../../lib/format.js'

const PHASE_TAG = {
  live: { label: 'LIVE', color: 'var(--live)' },
  recent: { label: 'FINAL', color: 'var(--text-dim)' },
  upcoming: { label: 'UPCOMING', color: 'var(--accent)' },
  offseason: { label: 'OFF-SEASON', color: 'var(--text-faint)' },
}

export function SessionHeader({ race, phase, laps }) {
  const tag = PHASE_TAG[phase] ?? PHASE_TAG.recent
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ ...tagStyle, color: tag.color, borderColor: tag.color }}>
          {phase === 'live' && <span style={dot} />}
          {tag.label}
        </span>
        {race?.round != null && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>R{race.round}</span>}
      </div>
      <h2 style={{ margin: '8px 0 2px', fontSize: 18 }}>{race?.name ?? '—'}</h2>
      <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
        {race?.circuitName}
        {race?.country ? ` · ${race.country}` : ''}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 8, color: 'var(--text-faint)', fontSize: 12 }}>
        {race?.raceStart && <span>{fmtDay(race.raceStart)}</span>}
        {laps != null && <span className="tnum">{laps} laps</span>}
      </div>
    </div>
  )
}

const card = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 14,
  marginBottom: 12,
}
const tagStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  fontSize: 11,
  fontWeight: 700,
  border: '1px solid',
  borderRadius: 4,
  padding: '1px 6px',
}
const dot = { width: 6, height: 6, borderRadius: 3, background: 'var(--live)' }
