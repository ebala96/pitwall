import { isActiveWindow } from './ttl.js'

// Sessions only carry a start; approximate end by kind to detect the active window.
const DURATION_MIN = {
  Race: 130,
  Sprint: 75,
  SprintQualifying: 60,
  Qualifying: 75,
  FirstPractice: 75,
  SecondPractice: 75,
  ThirdPractice: 75,
}

function sessionEnd(s) {
  const dur = (DURATION_MIN[s.kind] ?? 90) * 60000
  return new Date(new Date(s.start).getTime() + dur).toISOString()
}

// Compute the Live phase + which race to display, from the schedule and now.
//   live      — a session is in its active window now
//   recent    — between/after races; show the last completed race's final data
//   upcoming  — season hasn't started; show the first race + countdown
//   offseason — no schedule
export function getLiveSessionState(races, now) {
  if (!races?.length) return { phase: 'offseason', race: null, nextSession: null }

  for (const r of races) {
    for (const s of r.sessions) {
      if (isActiveWindow({ start: s.start, end: sessionEnd(s) }, now)) {
        return { phase: 'live', race: r, activeSession: s, nextSession: s }
      }
    }
  }

  let nextSession = null
  for (const r of races) {
    for (const s of r.sessions) {
      const t = new Date(s.start).getTime()
      if (t > now && (!nextSession || t < new Date(nextSession.start).getTime())) nextSession = s
    }
  }

  let lastCompleted = null
  for (const r of races) {
    if (new Date(r.raceStart).getTime() <= now) lastCompleted = r
  }
  if (lastCompleted) return { phase: 'recent', race: lastCompleted, nextSession }

  return { phase: 'upcoming', race: races[0], nextSession }
}
