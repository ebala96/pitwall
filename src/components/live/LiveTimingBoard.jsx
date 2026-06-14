import { Link } from 'react-router-dom'
import { fmtGap } from '../../lib/liveTiming.js'
import { TyreBadge } from './TyreBadge.jsx'

// Real-time order from OpenF1. Rows reorder as positions change; each row's
// `delta` (most recent position change) is computed in buildLiveTimingRows.
export function LiveTimingBoard({ rows, driverIdByNumber }) {
  return (
    <div>
      <div style={legend}>
        <span className="live-dot" style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--live)', display: 'inline-block' }} />
        LIVE · updates every 15s · OpenF1 data (slight delay vs broadcast)
      </div>
      <div style={panel}>
        {rows.map((r) => {
          const driverId = driverIdByNumber?.[r.number]
          const inner = (
            <>
              <span style={arrow}>
                <Arrow delta={r.delta} />
              </span>
              <span className="tnum" style={pos}>
                {r.position}
              </span>
              <span style={{ ...bar, background: r.colour }} />
              <span style={code}>{r.code}</span>
              <span style={name} title={r.name}>
                {r.name}
              </span>
              <span style={team} title={r.team ?? ''}>
                {r.team ?? ''}
              </span>
              <TyreBadge compound={r.compound} age={r.age} />
              <span className="tnum" style={gap}>
                {r.position === 1 ? 'Leader' : fmtGap(r.gap)}
              </span>
              <span className="tnum" style={interval}>
                {r.position === 1 ? '' : fmtGap(r.interval)}
              </span>
            </>
          )
          return driverId ? (
            <Link key={r.number} to={`/profile/driver/${driverId}`} style={row}>
              {inner}
            </Link>
          ) : (
            <div key={r.number} style={row}>
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Arrow({ delta }) {
  if (!delta) return <span style={{ color: 'var(--text-faint)' }}>·</span>
  const up = delta > 0
  return (
    <span className="tnum" style={{ color: up ? 'var(--green)' : 'var(--bad)', fontSize: 11 }}>
      {up ? '▲' : '▼'}
      {Math.abs(delta)}
    </span>
  )
}

const legend = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
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
const arrow = { width: 28, flex: '0 0 auto', fontSize: 11 }
const pos = { width: 22, textAlign: 'right', color: 'var(--text-dim)', flex: '0 0 auto' }
const bar = { width: 4, height: '60%', borderRadius: 2, flex: '0 0 auto' }
const code = { width: 40, fontWeight: 700, flex: '0 0 auto' }
const name = { ...ellipsis, width: 150, flex: '0 0 auto' }
const team = { ...ellipsis, flex: 1, color: 'var(--text-dim)', fontSize: 12 }
const gap = { width: 84, textAlign: 'right', flex: '0 0 auto' }
const interval = { width: 84, textAlign: 'right', flex: '0 0 auto', color: 'var(--text-dim)' }
