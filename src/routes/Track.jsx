import { useState } from 'react'
import { Segmented } from '../components/Segmented.jsx'
import { SessionSelector } from '../components/telemetry/SessionSelector.jsx'
import { TrackMap } from '../components/track/TrackMap.jsx'
import { useNow } from '../hooks/useNow.js'
import { useSchedule } from '../hooks/useSchedule.js'
import { useSeason } from '../hooks/useSeason.js'
import { useTrackData } from '../hooks/useTrackData.js'

function latestCompletedRound(races, now) {
  let last = null
  for (const r of races) if (new Date(r.raceStart).getTime() <= now) last = r.round
  return last ?? races[0]?.round ?? null
}

const notice = (text) => (
  <div
    style={{
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: 16,
      color: 'var(--text-dim)',
    }}
  >
    {text}
  </div>
)

export default function Track() {
  const now = useNow(60000)
  const [season, setSeason] = useState(useSeason())
  const [pickedRound, setPickedRound] = useState(null)
  const [offset, setOffset] = useState(0.5)

  const sched = useSchedule(season)
  const races = sched.data?.races ?? []
  const round = pickedRound ?? latestCompletedRound(races, now)
  const track = useTrackData(season, round, 'race', offset)

  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Track</h1>
        <SessionSelector
          season={season}
          onSeason={(y) => {
            setSeason(y)
            setPickedRound(null)
          }}
          round={round}
          onRound={setPickedRound}
          races={races}
        />
        <Segmented
          value={offset}
          onChange={setOffset}
          options={[
            { value: 0, label: 'Start' },
            { value: 0.25, label: 'Quarter' },
            { value: 0.5, label: 'Half' },
            { value: 0.8, label: 'Late' },
          ]}
        />
      </header>

      {track.isLoading
        ? notice('Loading track positions…')
        : !track.data?.sessionKey
          ? notice('No track position data for this event (available from 2023 onward).')
          : (
            <>
              <div style={{ color: 'var(--text-faint)', fontSize: 12, marginBottom: 10 }}>
                90-second window · cars animate at their real on-track positions
              </div>
              <TrackMap
                byDriver={track.data.byDriver}
                drivers={track.data.drivers}
                duration={track.data.duration}
              />
            </>
          )}
    </section>
  )
}
