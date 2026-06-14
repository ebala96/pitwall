// Web Notification reminder scheduler. Runs while the page is open: arms a timer
// for each upcoming session at each reminder lead time. setTimeout caps at ~24.8
// days, so callers reschedule periodically (every 6h) to re-arm later sessions.

const MAX_TIMEOUT = 2 ** 31 - 1
let timers = []

export function clearReminders() {
  timers.forEach(clearTimeout)
  timers = []
}

export function canNotify() {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted'
}

export function scheduleReminders(races, leads, now = Date.now()) {
  clearReminders()
  if (!canNotify() || !races?.length || !leads?.length) return 0

  let count = 0
  for (const race of races) {
    for (const s of race.sessions) {
      const start = new Date(s.start).getTime()
      for (const lead of leads) {
        const fireAt = start - lead * 60000
        const delay = fireAt - now
        if (delay > 0 && delay < MAX_TIMEOUT) {
          timers.push(setTimeout(() => fire(race, s, lead), delay))
          count++
        }
      }
    }
  }
  return count
}

function fire(race, session, lead) {
  if (!canNotify()) return
  const n = new Notification(`${race.name} — ${session.label} in ${lead} min`, {
    body: `${race.circuitName ?? ''}${race.country ? ` · ${race.country}` : ''}`,
    tag: `${race.round}-${session.kind}`,
  })
  n.onclick = () => {
    window.focus()
    window.location.assign('/live')
  }
}
