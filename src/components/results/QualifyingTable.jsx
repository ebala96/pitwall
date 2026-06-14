import { Link } from 'react-router-dom'
import { getTeamColor } from '../../lib/teamColors.js'

// Eliminated rows are dimmed by which segment the driver reached.
const SEGMENT_OPACITY = { 3: 1, 2: 0.78, 1: 0.52 }

export function QualifyingTable({ rows }) {
  return (
    <div style={panel}>
      <div style={{ ...row, color: 'var(--text-faint)', fontSize: 11, height: 24 }}>
        <span style={pos} />
        <span style={bar} />
        <span style={code} />
        <span style={name} />
        <span style={team} />
        <span style={qCol}>Q1</span>
        <span style={qCol}>Q2</span>
        <span style={qCol}>Q3</span>
      </div>
      {rows.map((r) => {
        const color = getTeamColor(r.constructorId)
        return (
          <Link
            key={r.driverId}
            to={`/profile/driver/${r.driverId}`}
            style={{ ...row, opacity: SEGMENT_OPACITY[r.segment] ?? 1 }}
          >
            <span className="tnum" style={pos}>
              {r.position}
            </span>
            <span style={{ ...bar, background: color }} />
            <span style={code}>{r.code}</span>
            <span style={name} title={r.name}>
              {r.name}
            </span>
            <span style={team} title={r.constructorName}>
              {r.constructorName}
            </span>
            <span className="tnum" style={{ ...qCol, color: r.segment === 1 ? 'var(--text)' : 'var(--text-dim)' }}>
              {r.q1 ?? '—'}
            </span>
            <span className="tnum" style={{ ...qCol, color: r.segment === 2 ? 'var(--text)' : 'var(--text-dim)' }}>
              {r.q2 ?? '—'}
            </span>
            <span className="tnum" style={{ ...qCol, fontWeight: r.q3 ? 700 : 400 }}>
              {r.q3 ?? '—'}
            </span>
          </Link>
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
  gap: 10,
  height: 'var(--row-h)',
  padding: '0 12px',
  borderBottom: '1px solid var(--border)',
  color: 'var(--text)',
}
const ellipsis = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
const pos = { width: 24, textAlign: 'right', color: 'var(--text-dim)', flex: '0 0 auto' }
const bar = { width: 4, height: '60%', borderRadius: 2, flex: '0 0 auto' }
const code = { width: 40, fontWeight: 700, flex: '0 0 auto' }
const name = { ...ellipsis, flex: 1 }
const team = { ...ellipsis, width: 110, color: 'var(--text-dim)', fontSize: 12, flex: '0 0 auto' }
const qCol = { width: 84, textAlign: 'right', flex: '0 0 auto' }
