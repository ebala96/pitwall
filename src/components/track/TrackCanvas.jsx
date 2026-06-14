import { project } from '../../lib/trackMap.js'

const SIZE = 1000

// Pure render: circuit outline + car dots, projected with the given bounds.
export function TrackCanvas({ bounds, outline, dots }) {
  if (!bounds) return null
  const path = outline?.length
    ? 'M' +
      outline
        .map((p) => {
          const q = project(p, bounds, SIZE)
          return `${q.x.toFixed(1)},${q.y.toFixed(1)}`
        })
        .join(' L')
    : ''

  return (
    <div style={frame}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: '100%', maxHeight: 600 }}>
        {path && (
          <path
            d={path}
            fill="none"
            stroke="rgba(160,180,210,0.30)"
            strokeWidth={18}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {dots.map((d) => {
          const q = project(d, bounds, SIZE)
          return (
            <g key={d.code}>
              <circle cx={q.x} cy={q.y} r={13} fill={d.colour} stroke="#0b0e14" strokeWidth={3} />
              <text x={q.x} y={q.y - 18} fill="var(--text)" fontSize={19} fontWeight={700} textAnchor="middle">
                {d.code}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

const frame = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 12,
}
