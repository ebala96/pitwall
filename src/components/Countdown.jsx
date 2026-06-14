import { useEffect, useState } from 'react'
import { countdownParts } from '../lib/format.js'

// Client-side ticking countdown to an ISO target. Works on already-fetched data
// (no refetch needed for the tick).
export function Countdown({ target, doneLabel = 'In progress' }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!target) return <span>—</span>
  const p = countdownParts(new Date(target).getTime() - now)
  if (p.done) return <span style={{ color: 'var(--live)' }}>{doneLabel}</span>

  const parts = []
  if (p.days) parts.push(`${p.days}d`)
  if (p.days || p.hours) parts.push(`${p.hours}h`)
  parts.push(`${p.minutes}m`)
  if (!p.days) parts.push(`${String(p.seconds).padStart(2, '0')}s`)

  return <span className="tnum">{parts.join(' ')}</span>
}
