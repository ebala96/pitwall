// Reconstruct the race state "as of" an arbitrary moment from full-session
// time series. Pure — drives the replay scrubber.

function seriesAsOf(rows, asOf) {
  const by = {}
  for (const r of rows ?? []) {
    const t = new Date(r.date).getTime()
    if (t <= asOf) (by[r.driver_number] ||= []).push({ p: r.position, t })
  }
  for (const k in by) by[k].sort((a, b) => a.t - b.t)
  return by
}

function latestIntervalAsOf(rows, asOf) {
  const m = {}
  for (const r of rows ?? []) {
    const t = new Date(r.date).getTime()
    if (t <= asOf && (!m[r.driver_number] || t > m[r.driver_number].t)) {
      m[r.driver_number] = { t, gap: r.gap_to_leader, interval: r.interval }
    }
  }
  return m
}

export function currentLapAsOf(laps, asOf) {
  const m = {}
  for (const l of laps ?? []) {
    if (!l.date_start || l.lap_number == null) continue
    const t = new Date(l.date_start).getTime()
    if (t <= asOf && (m[l.driver_number] == null || l.lap_number > m[l.driver_number])) {
      m[l.driver_number] = l.lap_number
    }
  }
  return m
}

function tyreAsOf(stints, driver, lap) {
  if (lap == null) return null
  let found = null
  for (const s of stints ?? []) {
    if (s.driverNumber !== driver) continue
    if ((s.lapStart ?? 0) <= lap && lap <= (s.lapEnd ?? Infinity)) {
      found = { compound: s.compound, age: (s.ageAtStart ?? 0) + (lap - (s.lapStart ?? lap)) }
    }
  }
  return found
}

export function buildReplayRows(asOf, { positions, intervals, stints, laps, drivers }) {
  const series = seriesAsOf(positions, asOf)
  const intv = latestIntervalAsOf(intervals, asOf)
  const curLap = currentLapAsOf(laps, asOf)
  const rows = []
  for (const [num, arr] of Object.entries(series)) {
    const cur = arr[arr.length - 1]?.p
    if (cur == null) continue
    let prev = null
    for (let i = arr.length - 2; i >= 0; i--) {
      if (arr[i].p != null && arr[i].p !== cur) {
        prev = arr[i].p
        break
      }
    }
    const n = Number(num)
    const d = drivers?.[n]
    const iv = intv[n]
    const ty = tyreAsOf(stints, n, curLap[n])
    rows.push({
      number: n,
      position: cur,
      delta: prev != null ? prev - cur : 0,
      code: d?.code ?? String(n),
      name: d?.name ?? String(n),
      team: d?.team ?? null,
      colour: d?.colour ?? '#6b7280',
      gap: iv?.gap ?? null,
      interval: iv?.interval ?? null,
      compound: ty?.compound ?? null,
      age: ty?.age ?? null,
    })
  }
  return rows.sort((a, b) => a.position - b.position)
}

export function totalLaps(laps) {
  let m = 0
  for (const l of laps ?? []) if (l.lap_number > m) m = l.lap_number
  return m
}

export function leaderLap(curLapMap) {
  let m = 0
  for (const v of Object.values(curLapMap)) if (v > m) m = v
  return m
}
