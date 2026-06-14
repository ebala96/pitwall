import { getSchedule } from './jolpica.js'
import { getSessions } from './openf1.js'

// kind → { jolpica session kind, OpenF1 session_name }
const KIND = {
  race: { jolpica: 'Race', openf1: 'Race' },
  qualifying: { jolpica: 'Qualifying', openf1: 'Qualifying' },
  sprint: { jolpica: 'Sprint', openf1: 'Sprint' },
  fp1: { jolpica: 'FirstPractice', openf1: 'Practice 1' },
  fp2: { jolpica: 'SecondPractice', openf1: 'Practice 2' },
  fp3: { jolpica: 'ThirdPractice', openf1: 'Practice 3' },
}

const dayOf = (iso) => (iso ? iso.slice(0, 10) : null)

function sameCountry(a, b) {
  if (!a || !b) return false
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

// Map a Jolpica race (season, round, kind) → an OpenF1 session_key, joining on
// date first then country. Returns { sessionKey, session } or null. OpenF1 only
// covers 2023+, so older seasons resolve to null (callers degrade gracefully).
export async function resolveSession(season, round, kind = 'race', signal) {
  if (Number(season) < 2023) return null
  const target = KIND[String(kind).toLowerCase()] ?? KIND.race

  const sched = await getSchedule(season, signal)
  const race = sched.races.find((r) => r.round === Number(round))
  if (!race) return null

  const jSession = race.sessions.find((s) => s.kind === target.jolpica)
  const day = dayOf(jSession?.start ?? race.raceStart)

  const sessions = await getSessions({ year: season, session_name: target.openf1 }, signal)
  if (!sessions.length) return null

  let match = day && sessions.find((s) => dayOf(s.date_start) === day)
  if (!match) match = sessions.find((s) => sameCountry(s.country_name, race.country))
  if (!match) return null

  return { sessionKey: match.session_key, session: match }
}
