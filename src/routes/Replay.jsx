import { useEffect, useMemo, useRef, useState } from 'react'
import { LiveTimingBoard } from '../components/live/LiveTimingBoard.jsx'
import { SessionSelector } from '../components/telemetry/SessionSelector.jsx'
import { buildReplayRows, currentLapAsOf, leaderLap, totalLaps } from '../lib/replay.js'
import { useNow } from '../hooks/useNow.js'
import { useReplayData } from '../hooks/useReplayData.js'
import { useSchedule } from '../hooks/useSchedule.js'
import { useSeason } from '../hooks/useSeason.js'

const SPEEDS = [10, 30, 60, 120]

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

export default function Replay() {
  const now = useNow(60000)
  const [season, setSeason] = useState(useSeason())
  const [pickedRound, setPickedRound] = useState(null)
  const [cursor, setCursor] = useState(0) // seconds from session start
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(30)
  const lastRef = useRef(null)

  const sched = useSchedule(season)
  const races = sched.data?.races ?? []
  const round = pickedRound ?? latestCompletedRound(races, now)
  const replay = useReplayData(season, round)

  const data = replay.data
  const durationSec = data?.sessionKey ? Math.max(1, (data.end - data.start) / 1000) : 0

  useEffect(() => {
    if (!playing || !durationSec) return
    let id
    const step = (ts) => {
      if (lastRef.current != null) {
        const dt = ((ts - lastRef.current) / 1000) * speed
        setCursor((c) => (c + dt >= durationSec ? durationSec : c + dt))
      }
      lastRef.current = ts
      id = requestAnimationFrame(step)
    }
    id = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(id)
      lastRef.current = null
    }
  }, [playing, speed, durationSec])

  const asOf = data?.sessionKey ? data.start + cursor * 1000 : 0
  const rows = useMemo(
    () => (data?.sessionKey ? buildReplayRows(asOf, data) : []),
    [data, asOf],
  )
  const total = useMemo(() => (data?.sessionKey ? totalLaps(data.laps) : 0), [data])
  const lap = useMemo(
    () => (data?.sessionKey ? leaderLap(currentLapAsOf(data.laps, asOf)) : 0),
    [data, asOf],
  )

  function changeSeason(y) {
    setSeason(y)
    setPickedRound(null)
    setCursor(0)
    setPlaying(false)
  }
  function changeRound(r) {
    setPickedRound(r)
    setCursor(0)
    setPlaying(false)
  }

  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Replay</h1>
        <SessionSelector season={season} onSeason={changeSeason} round={round} onRound={changeRound} races={races} />
      </header>

      {replay.isLoading ? (
        notice('Loading race…')
      ) : !data?.sessionKey ? (
        notice('No replay data for this event (available from 2023 onward).')
      ) : (
        <>
          <div style={controls}>
            <button onClick={() => setPlaying((p) => !p)} style={btn}>
              {playing ? '❚❚ Pause' : '▶ Play'}
            </button>
            <input
              type="range"
              min={0}
              max={durationSec}
              step={1}
              value={cursor}
              onChange={(e) => setCursor(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span className="tnum" style={{ color: 'var(--text-dim)', fontSize: 12, width: 64, textAlign: 'right' }}>
              {mmss(cursor)}
            </span>
            <span className="tnum" style={{ fontWeight: 700, width: 96, textAlign: 'right' }}>
              Lap {lap}/{total}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {SPEEDS.map((s) => (
                <button key={s} onClick={() => setSpeed(s)} style={speedBtn(s === speed)}>
                  {s}×
                </button>
              ))}
            </div>
          </div>

          <LiveTimingBoard rows={rows} legend={null} />
        </>
      )}
    </section>
  )
}

const controls = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }
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
