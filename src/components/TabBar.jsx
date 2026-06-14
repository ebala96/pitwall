import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/live', label: 'Live' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/standings', label: 'Standings' },
  { to: '/results', label: 'Results' },
  { to: '/telemetry', label: 'Telemetry' },
  { to: '/track', label: 'Track' },
  { to: '/compare', label: 'Compare' },
  { to: '/settings', label: 'Settings' },
]

export function TabBar() {
  return (
    <nav
      style={{
        background: 'var(--panel)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '14px 0',
      }}
    >
      <div
        style={{
          padding: '0 16px 16px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          color: 'var(--text)',
        }}
      >
        <span style={{ color: 'var(--accent)' }}>●</span> Pitwall
      </div>
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          style={({ isActive }) => ({
            padding: '9px 16px',
            color: isActive ? 'var(--text)' : 'var(--text-dim)',
            borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
            background: isActive ? 'var(--panel-2)' : 'transparent',
            fontWeight: isActive ? 600 : 400,
          })}
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
