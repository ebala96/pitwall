// Pure geometry for the track map. Location series are { t (s into window), x, y }.

// Group raw all-driver location rows into per-driver series, with t relative to
// the window start, dropping null/origin points; each series sorted by t.
export function groupLocation(rows, winStartMs) {
  const by = {}
  for (const p of rows ?? []) {
    if (p.x == null || p.y == null || (p.x === 0 && p.y === 0)) continue
    ;(by[p.driver_number] ||= []).push({
      t: (new Date(p.date).getTime() - winStartMs) / 1000,
      x: p.x,
      y: p.y,
    })
  }
  for (const k in by) by[k].sort((a, b) => a.t - b.t)
  return by
}

export function computeBounds(byDriver) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const arr of Object.values(byDriver ?? {})) {
    for (const p of arr) {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }
  }
  if (minX === Infinity) return null
  return { minX, maxX, minY, maxY }
}

// Project a track-space point into a square SVG viewBox (y flipped so north is up),
// preserving aspect ratio with padding.
export function project(p, bounds, size = 1000, pad = 40) {
  const w = bounds.maxX - bounds.minX || 1
  const h = bounds.maxY - bounds.minY || 1
  const scale = Math.min((size - 2 * pad) / w, (size - 2 * pad) / h)
  const offX = (size - w * scale) / 2
  const offY = (size - h * scale) / 2
  return {
    x: offX + (p.x - bounds.minX) * scale,
    y: offY + (bounds.maxY - p.y) * scale,
  }
}

// Interpolated (x,y) at time t within a sorted series. Clamps to ends.
export function sampleAt(series, t) {
  if (!series?.length) return null
  if (t <= series[0].t) return series[0]
  const last = series[series.length - 1]
  if (t >= last.t) return last
  let lo = 0
  let hi = series.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (series[mid].t < t) lo = mid + 1
    else hi = mid
  }
  const b = series[lo]
  const a = series[lo - 1] ?? b
  const span = b.t - a.t || 1
  const f = (t - a.t) / span
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }
}

// Trim a position path to a single lap: the first point that returns near the
// start after the car has moved away. Returns the whole path if it never closes.
export function oneLap(points) {
  if (points.length < 20) return points
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  const eps = Math.hypot(maxX - minX, maxY - minY) * 0.03
  const s = points[0]
  let movedAway = false
  for (let i = 5; i < points.length; i++) {
    const d = Math.hypot(points[i].x - s.x, points[i].y - s.y)
    if (!movedAway) {
      if (d > eps * 3) movedAway = true
      continue
    }
    if (d < eps) return points.slice(0, i + 1)
  }
  return points
}

// Pick the driver with the most samples as the track outline reference.
export function outlineDriver(byDriver) {
  let best = null
  let bestLen = 0
  for (const [num, arr] of Object.entries(byDriver ?? {})) {
    if (arr.length > bestLen) {
      bestLen = arr.length
      best = num
    }
  }
  return best
}
