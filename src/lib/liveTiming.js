import { latestTyreByDriver } from './tyres.js'

// OpenF1 intervals are a time series; the live value is the latest row per driver.
function latestByDriver(rows) {
  const m = {}
  for (const r of rows ?? []) {
    const cur = m[r.driver_number]
    if (!cur || new Date(r.date) > new Date(cur.date)) m[r.driver_number] = r
  }
  return m
}

// Position is also a time series. Group per driver, ascending by date.
function positionSeries(rows) {
  const m = {}
  for (const r of rows ?? []) (m[r.driver_number] ||= []).push(r)
  for (const k in m) m[k].sort((a, b) => new Date(a.date) - new Date(b.date))
  return m
}

// Build the current-order live leaderboard. The movement arrow (delta) is derived
// from the position series itself — each driver's most recent position change —
// so it needs no React state or cross-poll comparison.
export function buildLiveTimingRows({ positions, intervals, stints, drivers }) {
  const series = positionSeries(positions)
  const intv = latestByDriver(intervals)
  const tyres = latestTyreByDriver(stints ?? [])

  const rows = []
  for (const [num, arr] of Object.entries(series)) {
    const cur = arr[arr.length - 1]
    if (cur.position == null) continue
    let prevPos = null
    for (let i = arr.length - 2; i >= 0; i--) {
      if (arr[i].position != null && arr[i].position !== cur.position) {
        prevPos = arr[i].position
        break
      }
    }
    const n = Number(num)
    const d = drivers?.[n]
    const iv = intv[n]
    const ty = tyres[n]
    rows.push({
      number: n,
      position: cur.position,
      delta: prevPos != null ? prevPos - cur.position : 0,
      code: d?.code ?? String(n),
      name: d?.name ?? String(n),
      team: d?.team ?? null,
      colour: d?.colour ?? '#6b7280',
      gap: iv?.gap_to_leader ?? null,
      interval: iv?.interval ?? null,
      compound: ty?.compound ?? null,
      age: ty?.age ?? null,
    })
  }
  return rows.sort((a, b) => a.position - b.position)
}

// gap/interval may be a number (seconds) or a string ("+1 LAP").
export function fmtGap(v) {
  if (v == null) return ''
  if (typeof v === 'string') return v
  return `+${v.toFixed(3)}`
}

// Map a Jolpica schedule session kind → resolveSession kind.
export function resolveKind(jolpicaKind) {
  return (
    {
      Race: 'race',
      Qualifying: 'qualifying',
      Sprint: 'sprint',
      SprintQualifying: 'sprint',
      FirstPractice: 'fp1',
      SecondPractice: 'fp2',
      ThirdPractice: 'fp3',
    }[jolpicaKind] ?? 'race'
  )
}
