export function H2HTable({ title, metrics, codeA, codeB }) {
  return (
    <div style={card}>
      <div style={head}>
        <span style={{ ...sideHead, textAlign: 'right', color: 'var(--text)' }}>{codeA}</span>
        <span style={{ color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase' }}>
          {title}
        </span>
        <span style={{ ...sideHead, color: 'var(--text)' }}>{codeB}</span>
      </div>
      {metrics.map((m) => (
        <div key={m.label} style={row}>
          <span className="tnum" style={{ ...val, textAlign: 'right', ...win(m.winner === 'a') }}>
            {fmt(m.a)}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: 12, textAlign: 'center' }}>{m.label}</span>
          <span className="tnum" style={{ ...val, ...win(m.winner === 'b') }}>
            {fmt(m.b)}
          </span>
        </div>
      ))}
    </div>
  )
}

const fmt = (v) => (v == null ? '—' : v)
const win = (on) => (on ? { color: 'var(--green)', fontWeight: 700 } : { color: 'var(--text)' })

const card = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 12,
  marginBottom: 12,
}
const head = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.4fr 1fr',
  alignItems: 'center',
  paddingBottom: 8,
  borderBottom: '1px solid var(--border)',
  marginBottom: 6,
}
const sideHead = { fontWeight: 700 }
const row = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.4fr 1fr',
  alignItems: 'center',
  padding: '5px 0',
}
const val = { fontSize: 15 }
