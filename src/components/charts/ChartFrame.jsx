import { useEffect, useRef } from 'react'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'

// Imperative uPlot wrapped for React. Recreates on data/options change (telemetry
// data only changes on selection, not high-frequency) and resizes with the panel.
export function ChartFrame({ title, options, data, height = 220, empty }) {
  const elRef = useRef(null)

  useEffect(() => {
    const el = elRef.current
    if (!el || empty || !data) return
    const u = new uPlot({ ...options, width: el.clientWidth || 600, height }, data, el)
    const onResize = () => u.setSize({ width: el.clientWidth || 600, height })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      u.destroy()
    }
  }, [options, data, height, empty])

  return (
    <div style={card}>
      {title && <div style={titleStyle}>{title}</div>}
      {empty ? <div style={emptyStyle}>{empty}</div> : <div ref={elRef} />}
    </div>
  )
}

const card = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 12,
  marginBottom: 12,
}
const titleStyle = {
  color: 'var(--text-faint)',
  fontSize: 11,
  textTransform: 'uppercase',
  marginBottom: 8,
}
const emptyStyle = { color: 'var(--text-dim)', fontSize: 13, padding: '24px 0', textAlign: 'center' }
