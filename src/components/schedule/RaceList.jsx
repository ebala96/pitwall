import { fmtDay } from '../../lib/format.js'

export function RaceList({ races, nextRound, now }) {
  return (
    <div style={panel}>
      {races.map((r) => {
        const past = new Date(r.raceStart).getTime() <= now
        const isNext = r.round === nextRound
        return (
          <div
            key={r.round}
            style={{
              ...row,
              opacity: past && !isNext ? 0.5 : 1,
              borderLeft: `3px solid ${isNext ? 'var(--accent)' : 'transparent'}`,
            }}
          >
            <span className="tnum" style={round}>
              {r.round}
            </span>
            <span style={name}>
              {r.name}
              {r.isSprint && <span style={sprintDot} title="Sprint weekend" />}
            </span>
            <span style={loc}>{r.country ?? r.locality ?? ''}</span>
            <span style={{ color: 'var(--text-dim)' }}>{fmtDay(r.raceStart)}</span>
          </div>
        )
      })}
    </div>
  )
}

const panel = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  overflow: 'hidden',
}
const row = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  height: 'var(--row-h)',
  padding: '0 12px',
  borderBottom: '1px solid var(--border)',
}
const round = { width: 24, textAlign: 'right', color: 'var(--text-dim)' }
const name = { flex: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }
const loc = { width: 160, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
const sprintDot = {
  width: 6,
  height: 6,
  borderRadius: 3,
  background: 'var(--yellow)',
  display: 'inline-block',
}
