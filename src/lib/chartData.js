// Pure builders that turn mapped API rows into uPlot data arrays: [xs, s1, s2, …].

const bucket = (t) => Math.round(t * 10) / 10 // 0.1s buckets to align trace samples

export function buildLapTimeData(lapsByDriver, drivers) {
  let maxLap = 0
  for (const n of drivers) {
    for (const l of lapsByDriver?.[n] ?? []) {
      if (l.lap_number != null && l.lap_number > maxLap) maxLap = l.lap_number
    }
  }
  const xs = []
  for (let i = 1; i <= maxLap; i++) xs.push(i)
  const series = drivers.map((n) => {
    const m = new Map(
      (lapsByDriver?.[n] ?? [])
        .filter((l) => l.lap_number != null)
        .map((l) => [l.lap_number, l.lap_duration ?? null]),
    )
    return xs.map((x) => m.get(x) ?? null)
  })
  return { data: [xs, ...series], maxLap }
}

export function buildGapData(lapsByDriver, drivers) {
  let maxLap = 0
  const cum = {}
  for (const n of drivers) {
    const laps = (lapsByDriver?.[n] ?? [])
      .filter((l) => l.lap_number != null)
      .sort((a, b) => a.lap_number - b.lap_number)
    let t = 0
    const arr = {}
    for (const l of laps) {
      if (l.lap_duration == null) {
        arr[l.lap_number] = null
        continue
      }
      t += l.lap_duration
      arr[l.lap_number] = t
      if (l.lap_number > maxLap) maxLap = l.lap_number
    }
    cum[n] = arr
  }
  const xs = []
  for (let i = 1; i <= maxLap; i++) xs.push(i)
  const series = drivers.map((n) =>
    xs.map((x) => {
      const v = cum[n]?.[x]
      if (v == null) return null
      let best = Infinity
      for (const m of drivers) {
        const w = cum[m]?.[x]
        if (w != null && w < best) best = w
      }
      return best === Infinity ? null : v - best
    }),
  )
  return [xs, ...series]
}

export function buildTraceData(byDriver, drivers, field) {
  const times = new Set()
  for (const n of drivers) {
    for (const p of byDriver?.[n] ?? []) times.add(bucket(p.t))
  }
  const xs = [...times].sort((a, b) => a - b)
  const idx = new Map(xs.map((t, i) => [t, i]))
  const series = drivers.map((n) => {
    const arr = new Array(xs.length).fill(null)
    for (const p of byDriver?.[n] ?? []) {
      const i = idx.get(bucket(p.t))
      if (i != null) arr[i] = p[field] ?? null
    }
    return arr
  })
  return [xs, ...series]
}

// Fastest (lowest duration) lap number for a driver's laps.
export function fastestLapNumber(laps) {
  let best = null
  for (const l of laps ?? []) {
    if (l.lap_duration == null || l.lap_number == null) continue
    if (!best || l.lap_duration < best.dur) best = { num: l.lap_number, dur: l.lap_duration }
  }
  return best?.num ?? null
}
