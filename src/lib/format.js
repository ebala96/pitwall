// Small formatting helpers. Timing-sensitive numerals should also use the
// `.tnum` class (tabular-nums) where rendered.

export function formatPoints(n) {
  const v = Number(n)
  return Number.isFinite(v) ? v.toLocaleString() : '—'
}

export function ordinal(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '—'
  const s = ['th', 'st', 'nd', 'rd']
  const k = v % 100
  return v + (s[(k - 20) % 10] || s[k] || s[0])
}

export function pct(part, whole) {
  if (!whole) return 0
  return Math.max(0, Math.min(100, (part / whole) * 100))
}

// Jolpica gives date "2026-03-15" + optional time "15:00:00Z". Combine to ISO.
export function isoOf(date, time) {
  if (!date) return null
  return time ? `${date}T${time}` : `${date}T00:00:00Z`
}

// All display in the browser's local timezone (per plan default).
export function fmtDay(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

// Break a positive millisecond span into d/h/m/s parts for countdowns.
export function countdownParts(ms) {
  const clamped = Math.max(0, ms)
  const s = Math.floor(clamped / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: clamped === 0,
  }
}
