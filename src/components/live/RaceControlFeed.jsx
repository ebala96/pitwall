import { fmtTime } from '../../lib/format.js'

const FLAG_COLOR = {
  GREEN: 'var(--green)',
  YELLOW: 'var(--yellow)',
  'DOUBLE YELLOW': 'var(--yellow)',
  RED: 'var(--bad)',
  BLUE: '#3671c6',
  'CHEQUERED': 'var(--text)',
  CLEAR: 'var(--green)',
}

export function RaceControlFeed({ messages, limit = 40 }) {
  if (!messages?.length) return null
  return (
    <div style={card}>
      <div style={title}>Race Control</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.slice(0, limit).map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                flex: '0 0 auto',
                marginTop: 5,
                background: FLAG_COLOR[String(m.flag ?? '').toUpperCase()] ?? 'var(--text-faint)',
              }}
            />
            <span className="tnum" style={{ color: 'var(--text-faint)', fontSize: 11, flex: '0 0 auto' }}>
              {fmtTime(m.date)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{m.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const card = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 12,
}
const title = { color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase', marginBottom: 8 }
