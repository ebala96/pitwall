import { Link } from 'react-router-dom'
import { getTeamColor } from '../../lib/teamColors.js'
import { TyreBadge } from './TyreBadge.jsx'

// v1: rows come from the final classification (Jolpica). Tyre comes from OpenF1
// stints (by car number). Live-only signals (DRS, intervals, sector colours,
// real-time position arrows) are noted as Phase 2 rather than faked.
export function LiveLeaderboard({ rows, tyres }) {
  return (
    <div>
      <div style={legend}>
        Showing final classification. Live signals — DRS, gaps, sector colours,
        position changes — arrive with real-time timing in Phase 2.
      </div>
      <div style={panel}>
        {rows.map((r) => {
          const color = getTeamColor(r.constructorId)
          const tyre = r.number != null ? tyres?.[r.number] : null
          const isFastest = r.fastestLap?.rank === 1
          return (
            <Link key={r.driverId} to={`/profile/driver/${r.driverId}`} style={row}>
              <span style={arrow} title="position change (Phase 2)">
                ·
              </span>
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
              <TyreBadge compound={tyre?.compound} age={tyre?.age} />
              <span style={gap} title="gap to leader">
                {r.position === 1 ? 'Leader' : (r.time ?? r.status)}
              </span>
              <span className="tnum" style={best} title="best lap">
                {r.fastestLap?.time ?? '—'}
                {isFastest && <span style={flDot} />}
              </span>
              <span className="tnum" style={pts}>
                {r.points || ''}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

const legend = {
  background: 'var(--panel-2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--text-dim)',
  fontSize: 12,
  padding: '8px 12px',
  marginBottom: 10,
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
const arrow = { width: 8, color: 'var(--text-faint)', flex: '0 0 auto' }
const pos = { width: 22, textAlign: 'right', color: 'var(--text-dim)', flex: '0 0 auto' }
const bar = { width: 4, height: '60%', borderRadius: 2, flex: '0 0 auto' }
const code = { width: 40, fontWeight: 700, flex: '0 0 auto' }
const name = { ...ellipsis, width: 150, flex: '0 0 auto' }
const team = { ...ellipsis, width: 120, color: 'var(--text-dim)', fontSize: 12, flex: '0 0 auto' }
const gap = { ...ellipsis, flex: 1, color: 'var(--text-dim)', fontSize: 13 }
const best = { width: 90, textAlign: 'right', flex: '0 0 auto', display: 'inline-flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }
const pts = { width: 36, textAlign: 'right', fontWeight: 700, flex: '0 0 auto' }
const flDot = { width: 6, height: 6, borderRadius: 3, background: 'var(--purple)', display: 'inline-block' }
