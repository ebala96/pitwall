import { Link } from 'react-router-dom'
import { formatPoints, pct } from '../../lib/format.js'
import { getTeamColor } from '../../lib/teamColors.js'

// `kind` = 'drivers' | 'constructors'. rows = mapped standings rows.
export function StandingsTable({ kind, rows }) {
  const leaderPoints = rows[0]?.points ?? 0
  const isDrivers = kind === 'drivers'

  return (
    <div style={panel}>
      {rows.map((r) => {
        const color = getTeamColor(r.constructorId)
        const profileTo = isDrivers
          ? `/profile/driver/${r.driverId}`
          : `/profile/constructor/${r.constructorId}`
        return (
          <Link key={isDrivers ? r.driverId : r.constructorId} to={profileTo} style={row}>
            <span className="tnum" style={pos}>
              {r.position ?? '—'}
            </span>
            <span style={{ ...bar, background: color }} />
            <span style={primary}>
              {isDrivers ? (
                <>
                  <strong>{r.code}</strong>
                  <span style={{ color: 'var(--text-dim)' }}>{r.name}</span>
                </>
              ) : (
                <strong>{r.constructorName}</strong>
              )}
            </span>
            {isDrivers && (
              <span style={{ color: 'var(--text-faint)', fontSize: 12, minWidth: 90 }}>
                {r.constructorName ?? ''}
              </span>
            )}
            <span style={gapWrap}>
              <span
                style={{
                  ...gapBar,
                  width: `${pct(r.points, leaderPoints)}%`,
                  background: color,
                }}
              />
            </span>
            <span className="tnum" style={wins} title="wins">
              {r.wins ? `${r.wins}W` : ''}
            </span>
            <span className="tnum" style={points}>
              {formatPoints(r.points)}
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

const pos = { width: 24, textAlign: 'right', color: 'var(--text-dim)' }
const bar = { width: 4, height: '60%', borderRadius: 2, flex: '0 0 auto' }
const primary = { display: 'flex', gap: 8, alignItems: 'baseline', minWidth: 150 }
const gapWrap = { flex: 1, height: 6, background: 'var(--panel-2)', borderRadius: 3, overflow: 'hidden' }
const gapBar = { display: 'block', height: '100%', borderRadius: 3, opacity: 0.7 }
const wins = { width: 36, textAlign: 'right', color: 'var(--text-faint)', fontSize: 12 }
const points = { width: 56, textAlign: 'right', fontWeight: 700 }
