import { compoundStyle } from '../../lib/tyres.js'

export function TyreBadge({ compound, age }) {
  if (!compound) return <span style={{ color: 'var(--text-faint)', width: 44, display: 'inline-block' }}>—</span>
  const c = compoundStyle(compound)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, width: 44 }} title={compound}>
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: c.color,
          color: c.text,
          fontSize: 10,
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
        }}
      >
        {c.label}
      </span>
      {age != null && (
        <span className="tnum" style={{ color: 'var(--text-faint)', fontSize: 11 }}>
          {age}
        </span>
      )}
    </span>
  )
}
