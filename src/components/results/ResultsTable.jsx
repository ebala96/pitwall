import { Link } from 'react-router-dom'
import { getTeamColor } from '../../lib/teamColors.js'

export function ResultsTable({ rows }) {
  return (
    <div style={panel}>
      {rows.map((r) => {
        const color = getTeamColor(r.constructorId)
        const isFastest = r.fastestLap?.rank === 1
        return (
          <Link key={r.driverId} to={`/profile/driver/${r.driverId}`} style={row}>
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
            <span style={gridCol} title={`Started P${r.grid || 'pit'}`}>
              <Delta delta={r.delta} />
            </span>
            <span style={timeCol} title={r.status}>
              {r.time ?? r.status}
            </span>
            <span style={flCol}>
              {isFastest && (
                <span style={flBadge} title={`Fastest lap ${r.fastestLap.time ?? ''}`}>
                  FL
                </span>
              )}
            </span>
            <span className="tnum" style={points}>
              {r.points || ''}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

function Delta({ delta }) {
  if (delta == null) return <span style={{ color: 'var(--text-faint)' }}>PIT</span>
  if (delta === 0) return <span style={{ color: 'var(--text-faint)' }}>±0</span>
  const up = delta > 0
  return (
    <span className="tnum" style={{ color: up ? 'var(--green)' : 'var(--bad)' }}>
      {up ? '▲' : '▼'}
      {Math.abs(delta)}
    </span>
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
const name = { ...ellipsis, width: 150, flex: '0 0 auto' }
const team = { ...ellipsis, width: 110, color: 'var(--text-dim)', fontSize: 12, flex: '0 0 auto' }
const gridCol = { width: 48, flex: '0 0 auto' }
const timeCol = { ...ellipsis, flex: 1, color: 'var(--text-dim)' }
const flCol = { width: 28, flex: '0 0 auto' }
const flBadge = {
  fontSize: 10,
  fontWeight: 700,
  color: '#fff',
  background: 'var(--purple)',
  borderRadius: 3,
  padding: '1px 4px',
}
const points = { width: 36, textAlign: 'right', fontWeight: 700, flex: '0 0 auto' }
