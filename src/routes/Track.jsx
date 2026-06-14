import { useMemo, useState } from 'react'
import { RaceSegmentSelect } from '../components/RaceSegmentSelect.jsx'
import { TrackCanvas } from '../components/track/TrackCanvas.jsx'
import { SessionSelector } from '../components/telemetry/SessionSelector.jsx'
import { getLiveSessionState } from '../data/liveState.js'
import { computeBounds, sampleAt } from '../lib/trackMap.js'
import { segmentByValue } from '../lib/raceSegments.js'
import { useAnimatedCursor } from '../hooks/useAnimatedCursor.js'
import { useNow } from '../hooks/useNow.js'
import { useResolvedSession } from '../hooks/useResolvedSession.js'
import { useSchedule } from '../hooks/useSchedule.js'
import { useSeason } from '../hooks/useSeason.js'
import { useSessionDrivers } from '../hooks/useSessionDrivers.js'
import { useTrackOutline } from '../hooks/useTrackOutline.js'
import { useTrackWindow } from '../hooks/useTrackWindow.js'

const WIN = 60 // seconds of position data per fetched window
const SPEEDS = [4, 8, 16, 30]

function latestCompletedRound(races, now) {
  let last = null
  for (const r of races) if (new Date(r.raceStart).getTime() <= now) last = r.round
  return last ?? races[0]?.round ?? null
}

function mmss(sec) {
  const s = Math.max(0, Math.floor(sec))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const notice = (text) => (
  <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, color: 'var(--text-dim)' }}>
    {text}
  </div>
)

export default function Track() {
  const now = useNow(30000)
  const [season, setSeason] = useState(useSeason())
  const [pickedRound, setPickedRound] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(8)
  const [segment, setSegment] = useState('full')

  const sched = useSchedule(season)
  const races = sched.data?.races ?? []
  const round = pickedRound ?? latestCompletedRound(races, now)

  const state = getLiveSessionState(races, now)
  const isLive = state.phase === 'live' && state.race?.round === round

  const resolved = useResolvedSession(season, round)
  const sessionKey = resolved.data?.sessionKey ?? null
  const start = resolved.data?.start ?? null
  const end = resolved.data?.end ?? null
  const durationSec = start && end ? (end - start) / 1000 : 0
  const seg = segmentByValue(segment)
  const segStart = durationSec * seg.from
  const segEnd = durationSec * seg.to

  const driversQ = useSessionDrivers(sessionKey)
  const outline = useTrackOutline(sessionKey, start, end)
  const outlinePoints = outline.data?.points ?? []
  const bounds = useMemo(() => computeBounds({ o: outline.data?.points ?? [] }), [outline.data])

  // Replay: full-race cursor + lazily-loaded 60s windows (current + prefetch next).
  const [cursor, setCursor] = useAnimatedCursor(segStart, segEnd, { playing: playing && !isLive, speed })
  const replayEnabled = !isLive && Boolean(sessionKey) && durationSec > 0
  const winIndex = Math.floor(cursor / WIN)
  const winStartMs = start != null ? start + winIndex * WIN * 1000 : null
  const cur = useTrackWindow(sessionKey, winStartMs, WIN, { enabled: replayEnabled })
  useTrackWindow(sessionKey, winStartMs != null ? winStartMs + WIN * 1000 : null, WIN, {
    enabled: replayEnabled && winStartMs != null && winStartMs + WIN * 1000 < end,
  }) // prefetch next window

  // Live: most-recent 60s window (re-keyed every 12s -> polls) animated on a loop.
  const liveWinStart = Math.floor(now / 12000) * 12000 - WIN * 1000
  const liveWin = useTrackWindow(sessionKey, liveWinStart, WIN, { enabled: isLive, live: true })
  const [liveCursor] = useAnimatedCursor(0, WIN, { playing: isLive, speed: 1, loop: true })

  const activeByDriver = isLive ? liveWin.data : cur.data
  const sampleT = isLive ? liveCursor : cursor - winIndex * WIN
  const dots = useMemo(() => {
    if (!activeByDriver) return []
    const meta = driversQ.data ?? {}
    return Object.entries(activeByDriver)
      .map(([num, series]) => {
        const p = sampleAt(series, sampleT)
        if (!p) return null
        const d = meta[num]
        return { x: p.x, y: p.y, code: d?.code ?? num, colour: d?.colour ?? '#9aa3b2' }
      })
      .filter(Boolean)
  }, [activeByDriver, sampleT, driversQ.data])

  function changeSeason(y) {
    setSeason(y)
    setPickedRound(null)
    setSegment('full')
    setCursor(0)
    setPlaying(false)
  }
  function changeRound(r) {
    setPickedRound(r)
    setSegment('full')
    setCursor(0)
    setPlaying(false)
  }
  function changeSegment(v) {
    setSegment(v)
    setCursor(durationSec * segmentByValue(v).from)
  }

  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Track</h1>
        <SessionSelector season={season} onSeason={changeSeason} round={round} onRound={changeRound} races={races} />
      </header>

      {resolved.isLoading ? (
        notice('Resolving session…')
      ) : !sessionKey ? (
        notice('No track position data for this event (available from 2023 onward).')
      ) : isLive ? (
        <>
          <div style={liveBar}>
            <span className="live-dot" style={dot} /> LIVE · current car positions (OpenF1, ~12s refresh)
          </div>
          {bounds ? <TrackCanvas bounds={bounds} outline={outlinePoints} dots={dots} /> : notice('Loading circuit…')}
        </>
      ) : (
        <>
          <div style={controls}>
            <RaceSegmentSelect value={segment} onChange={changeSegment} />
            <button onClick={() => setPlaying((p) => !p)} style={btn} disabled={!durationSec}>
              {playing ? '❚❚ Pause' : '▶ Play'}
            </button>
            <input type="range" min={segStart} max={segEnd || 1} step={1} value={cursor} onChange={(e) => setCursor(Number(e.target.value))} style={{ flex: 1 }} disabled={!durationSec} />
            <span className="tnum" style={{ color: 'var(--text-dim)', fontSize: 12, width: 110, textAlign: 'right' }}>
              {mmss(cursor)} / {mmss(segEnd)}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {SPEEDS.map((s) => (
                <button key={s} onClick={() => setSpeed(s)} style={speedBtn(s === speed)}>
                  {s}×
                </button>
              ))}
            </div>
          </div>
          {!bounds ? (
            notice('Loading circuit…')
          ) : (
            <>
              <TrackCanvas bounds={bounds} outline={outlinePoints} dots={dots} />
              {cur.isLoading && dots.length === 0 && (
                <div style={{ color: 'var(--text-faint)', fontSize: 12, marginTop: 8 }}>Loading positions…</div>
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}

const controls = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }
const liveBar = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: 'var(--live)',
  fontWeight: 700,
  fontSize: 13,
  marginBottom: 12,
}
const dot = { width: 8, height: 8, borderRadius: 4, background: 'var(--live)', display: 'inline-block' }
const btn = {
  background: 'var(--panel-2)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '5px 12px',
  cursor: 'pointer',
  fontSize: 13,
}
const speedBtn = (on) => ({
  background: on ? 'var(--accent)' : 'transparent',
  color: on ? '#fff' : 'var(--text-dim)',
  border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
  borderRadius: 6,
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: 12,
})
