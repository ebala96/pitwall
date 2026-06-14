import { Link } from 'react-router-dom'
import { formatPoints, pct } from '../../lib/format.js'
import { getTeamColor } from '../../lib/teamColors.js'
import { useSettings } from '../../hooks/useSettings.js'

// `kind` = 'drivers' | 'constructors'. rows = mapped standings rows.
export function StandingsTable({ kind, rows }) {
  const settings = useSettings()
  const leaderPoints = rows[0]?.points ?? 0
  const isDrivers = kind === 'drivers'
  const favId = isDrivers ? settings.favoriteDriver : settings.favoriteConstructor

  return (
    <div style={panel}>
      {rows.map((r) => {
        const color = getTeamColor(r.constructorId)
        const id = isDrivers ? r.driverId : r.constructorId
        const isFav = favId && id === favId
        const profileTo = isDrivers
          ? `/profile/driver/${r.driverId}`
          : `/profile/constructor/${r.constructorId}`
        return (
          <Link
            key={id}
            to={profileTo}
            style={{ ...row, background: isFav ? 'rgba(225,6,0,0.10)' : undefined }}
          >
            <span style={star}>{isFav ? '★' : ''}</span>
            <span className="tnum" style={pos}>
              {r.position ?? '—'}
            </span>
            <span style={{ ...bar, background: color }} />
            {isDrivers ? (
              <>
                <span style={code}>{r.code}</span>
                <span style={name} title={r.name}>
                  {r.name}
                </span>
                <span style={team} title={r.constructorName ?? ''}>
                  {r.constructorName ?? ''}
                </span>
              </>
            ) : (
              <span style={teamName} title={r.constructorName}>
                {r.constructorName}
              </span>
            )}
            <span style={gapWrap}>
              <span
                style={{ ...gapBar, width: `${pct(r.points, leaderPoints)}%`, background: color }}
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

// Fixed-width columns so every gap bar starts at the same x regardless of name length.
const ellipsis = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '0 0 auto' }

const star = { width: 10, color: 'var(--yellow)', fontSize: 11, flex: '0 0 auto' }
const pos = { width: 24, textAlign: 'right', color: 'var(--text-dim)', flex: '0 0 auto' }
const bar = { width: 4, height: '60%', borderRadius: 2, flex: '0 0 auto' }
const code = { width: 40, fontWeight: 700, flex: '0 0 auto' }
const name = { ...ellipsis, width: 160, color: 'var(--text-dim)' }
const team = { ...ellipsis, width: 96, color: 'var(--text-faint)', fontSize: 12 }
const teamName = { ...ellipsis, width: 296, fontWeight: 700 }
const gapWrap = { flex: 1, height: 6, background: 'var(--panel-2)', borderRadius: 3, overflow: 'hidden' }
const gapBar = { display: 'block', height: '100%', borderRadius: 3, opacity: 0.7 }
const wins = { width: 36, textAlign: 'right', color: 'var(--text-faint)', fontSize: 12, flex: '0 0 auto' }
const points = { width: 56, textAlign: 'right', fontWeight: 700, flex: '0 0 auto' }
