import { DEFAULT_SEASON } from '../config.js'

// Placeholder strip — season selector, live dot, data-source health and
// next-session countdown get wired to real data in later milestones.
export function StatusStrip() {
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
        Season <strong style={{ color: 'var(--text)' }}>{DEFAULT_SEASON}</strong>
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>jolpica · openf1</span>
    </header>
  )
}
