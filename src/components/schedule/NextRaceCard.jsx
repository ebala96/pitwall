import { Countdown } from '../Countdown.jsx'
import { fmtDay, fmtTime } from '../../lib/format.js'

export function NextRaceCard({ race, now }) {
  if (!race) return null
  const next = race.sessions.find((s) => new Date(s.start).getTime() > now) ?? race.sessions.at(-1)

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>R{race.round}</span>
        <h2 style={{ margin: 0, fontSize: 22 }}>{race.name}</h2>
        {race.isSprint && <span style={sprintTag}>SPRINT</span>}
      </div>
      <div style={{ color: 'var(--text-dim)', marginTop: 4 }}>
        {race.circuitName}
        {race.country ? ` · ${race.country}` : ''}
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>
          {next?.label ?? 'Next'} in
        </span>
        <span style={{ fontSize: 26, fontWeight: 700 }}>
          <Countdown target={next?.start} />
        </span>
      </div>

      <div style={sessionGrid}>
        {race.sessions.map((s) => {
          const past = new Date(s.start).getTime() <= now
          const isNext = s === next
          return (
            <div
              key={s.kind}
              style={{
                ...sessionRow,
                opacity: past ? 0.45 : 1,
                borderLeft: `3px solid ${isNext ? 'var(--accent)' : 'transparent'}`,
              }}
            >
              <span style={{ fontWeight: isNext ? 700 : 500 }}>{s.label}</span>
              <span style={{ color: 'var(--text-dim)' }}>{fmtDay(s.start)}</span>
              <span className="tnum" style={{ color: 'var(--text-dim)' }}>
                {fmtTime(s.start)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const card = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 18,
  marginBottom: 18,
}

const sprintTag = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--yellow)',
  border: '1px solid var(--yellow)',
  borderRadius: 4,
  padding: '1px 6px',
}

const sessionGrid = {
  marginTop: 16,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: 6,
}

const sessionRow = {
  display: 'grid',
  gridTemplateColumns: '1fr auto auto',
  gap: 10,
  alignItems: 'baseline',
  padding: '6px 10px',
  background: 'var(--panel-2)',
  borderRadius: 6,
}
