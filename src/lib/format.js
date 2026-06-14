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
