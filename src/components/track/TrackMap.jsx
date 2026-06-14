import { useEffect, useMemo, useRef, useState } from 'react'
import { computeBounds, outlineDriver, project, sampleAt } from '../../lib/trackMap.js'

const SIZE = 1000
const SPEEDS = [1, 2, 4, 8]

export function TrackMap({ byDriver, drivers, duration }) {
  const bounds = useMemo(() => computeBounds(byDriver), [byDriver])
  const outlineNum = useMemo(() => outlineDriver(byDriver), [byDriver])
  const [cursor, setCursor] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(2)
  const lastRef = useRef(null)

  useEffect(() => {
    if (!playing) return
    let id
    const step = (ts) => {
      if (lastRef.current != null) {
        const dt = ((ts - lastRef.current) / 1000) * speed
        setCursor((c) => (c + dt >= duration ? 0 : c + dt))
      }
      lastRef.current = ts
      id = requestAnimationFrame(step)
    }
    id = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(id)
      lastRef.current = null
    }
  }, [playing, speed, duration])

  const outlinePath = useMemo(() => {
    if (!bounds || !outlineNum) return ''
    const pts = byDriver[outlineNum].map((p) => project(p, bounds, SIZE))
    return pts.length ? 'M' + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L') : ''
  }, [bounds, outlineNum, byDriver])

  if (!bounds) {
    return <div style={notice}>No track position data in this window.</div>
  }

  const dots = Object.entries(byDriver)
    .map(([num, series]) => {
      const p = sampleAt(series, cursor)
      if (!p) return null
      const proj = project(p, bounds, SIZE)
      const d = drivers?.[num]
      return { num, x: proj.x, y: proj.y, code: d?.code ?? num, colour: d?.colour ?? '#9aa3b2' }
    })
    .filter(Boolean)

  return (
    <div>
      <div style={controls}>
        <button onClick={() => setPlaying((p) => !p)} style={btn}>
          {playing ? '❚❚ Pause' : '▶ Play'}
        </button>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={cursor}
          onChange={(e) => setCursor(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="tnum" style={{ color: 'var(--text-dim)', fontSize: 12, width: 56, textAlign: 'right' }}>
          {cursor.toFixed(1)}s
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {SPEEDS.map((s) => (
            <button key={s} onClick={() => setSpeed(s)} style={speedBtn(s === speed)}>
              {s}×
            </button>
          ))}
        </div>
      </div>

      <div style={frame}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: '100%', maxHeight: 560 }}>
          <path d={outlinePath} fill="none" stroke="var(--border)" strokeWidth={14} strokeLinejoin="round" />
          {dots.map((d) => (
            <g key={d.num}>
              <circle cx={d.x} cy={d.y} r={13} fill={d.colour} stroke="#0b0e14" strokeWidth={3} />
              <text x={d.x} y={d.y - 18} fill="var(--text)" fontSize={20} fontWeight={700} textAnchor="middle">
                {d.code}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

const controls = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }
const frame = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 12,
}
const notice = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 16,
  color: 'var(--text-dim)',
}
const btn = {
  background: 'var(--panel-2)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '5px 12px',
  cursor: 'pointer',
  fontSize: 13,
}
const speedBtn = (on) => ({
  background: on ? 'var(--accent)' : 'transparent',
  color: on ? '#fff' : 'var(--text-dim)',
  border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
  borderRadius: 6,
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: 12,
})
