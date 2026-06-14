import { Countdown } from './Countdown.jsx'
import { getLiveSessionState } from '../data/liveState.js'
import { DEFAULT_SEASON } from '../config.js'
import { useNow } from '../hooks/useNow.js'
import { useSchedule } from '../hooks/useSchedule.js'
import { useSettings } from '../hooks/useSettings.js'
import { useDataSourceHealth } from '../hooks/useHealth.js'

// Top strip: season, live/next-session indicator, and data-source health.
export function StatusStrip() {
  const settings = useSettings()
  const season = settings.defaultSeason ?? DEFAULT_SEASON
  const now = useNow(30000)
  const sched = useSchedule(season)
  const state = getLiveSessionState(sched.data?.races ?? [], now)
  const health = useDataSourceHealth()

  return (
    <header
      style={{
        background: 'var(--panel)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 20px',
      }}
    >
      <span style={{ color: 'var(--text-dim)' }}>
        Season <strong className="tnum" style={{ color: 'var(--text)' }}>{season}</strong>
      </span>

      {state.phase === 'live' ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--live)', fontWeight: 700 }}>
          <span className="live-dot" style={dot('var(--live)')} />
          LIVE · {state.activeSession?.label}
        </span>
      ) : (
        state.nextSession && (
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            Next: {state.nextSession.label} in <Countdown target={state.nextSession.start} />
          </span>
        )
      )}

      <span style={{ flex: 1 }} />

      <HealthDot name="jolpica" info={health.jolpica} />
      <HealthDot name="openf1" info={health.openf1} />
    </header>
  )
}

function HealthDot({ name, info }) {
  const color =
    info.status === 'up' ? 'var(--ok)' : info.status === 'checking' ? 'var(--warn)' : 'var(--bad)'
  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-faint)', fontSize: 12 }}
      title={info.ms != null ? `${name}: ${info.ms} ms` : `${name}: ${info.status}`}
    >
      <span style={dot(color)} />
      {name}
    </span>
  )
}

const dot = (color) => ({ width: 8, height: 8, borderRadius: 4, background: color, display: 'inline-block' })
