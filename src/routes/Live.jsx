import { Countdown } from '../components/Countdown.jsx'
import { QueryBoundary } from '../components/QueryBoundary.jsx'
import { LiveLeaderboard } from '../components/live/LiveLeaderboard.jsx'
import { RaceControlFeed } from '../components/live/RaceControlFeed.jsx'
import { SessionHeader } from '../components/live/SessionHeader.jsx'
import { WeatherCard } from '../components/live/WeatherCard.jsx'
import { getLiveSessionState } from '../data/liveState.js'
import { useNow } from '../hooks/useNow.js'
import { useRaceResults } from '../hooks/useResults.js'
import { useSchedule } from '../hooks/useSchedule.js'
import { useSeason } from '../hooks/useSeason.js'
import { useSessionDetail } from '../hooks/useSessionDetail.js'
import { latestTyreByDriver } from '../lib/tyres.js'

export default function Live() {
  const season = useSeason()
  const now = useNow(30000)
  const sched = useSchedule(season)
  const races = sched.data?.races ?? []
  const state = getLiveSessionState(races, now)
  const round = state.race?.round ?? null

  const results = useRaceResults(season, round)
  const detail = useSessionDetail(season, round, Boolean(round))

  const tyres = detail.data?.stints ? latestTyreByDriver(detail.data.stints) : {}
  const laps = results.data?.rows?.reduce((m, r) => Math.max(m, r.laps ?? 0), 0) || null

  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Live</h1>
        {state.nextSession && state.phase !== 'live' && (
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            Next: {state.nextSession.label} in{' '}
            <Countdown target={state.nextSession.start} />
          </span>
        )}
      </header>

      {sched.isError ? (
        <QueryBoundary query={sched}>{() => null}</QueryBoundary>
      ) : !round ? (
        <QueryBoundary query={{ isLoading: true }}>{() => null}</QueryBoundary>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, alignItems: 'start' }}>
          <QueryBoundary
            query={results}
            isEmpty={(d) => !d?.rows?.length}
            emptyReason={
              state.phase === 'upcoming' ? 'Season not started — no race run yet.' : 'No classification available.'
            }
          >
            {(data) => <LiveLeaderboard rows={data.rows} tyres={tyres} />}
          </QueryBoundary>

          <aside>
            <SessionHeader race={state.race} phase={state.phase} laps={laps} />
            <WeatherCard weather={detail.data?.weather} />
            <RaceControlFeed messages={detail.data?.raceControl} />
          </aside>
        </div>
      )}
    </section>
  )
}
