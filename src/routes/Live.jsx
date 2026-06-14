import { useMemo } from 'react'
import { Countdown } from '../components/Countdown.jsx'
import { QueryBoundary } from '../components/QueryBoundary.jsx'
import { LiveLeaderboard } from '../components/live/LiveLeaderboard.jsx'
import { LiveTimingBoard } from '../components/live/LiveTimingBoard.jsx'
import { RaceControlFeed } from '../components/live/RaceControlFeed.jsx'
import { SessionHeader } from '../components/live/SessionHeader.jsx'
import { WeatherCard } from '../components/live/WeatherCard.jsx'
import { getLiveSessionState } from '../data/liveState.js'
import { useNow } from '../hooks/useNow.js'
import { useLiveTiming } from '../hooks/useLiveTiming.js'
import { useRaceResults } from '../hooks/useResults.js'
import { useSchedule } from '../hooks/useSchedule.js'
import { useSeason } from '../hooks/useSeason.js'
import { useSessionDetail } from '../hooks/useSessionDetail.js'
import { buildLiveTimingRows, resolveKind } from '../lib/liveTiming.js'
import { latestTyreByDriver } from '../lib/tyres.js'

function LiveNotice({ text }) {
  return (
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
}

export default function Live() {
  const season = useSeason()
  const now = useNow(30000)
  const sched = useSchedule(season)
  const races = sched.data?.races ?? []
  const state = getLiveSessionState(races, now)
  const round = state.race?.round ?? null
  const isLive = state.phase === 'live'

  const results = useRaceResults(season, round)
  const detail = useSessionDetail(season, round, Boolean(round))
  const live = useLiveTiming(season, round, resolveKind(state.activeSession?.kind), isLive)

  const tyres = detail.data?.stints ? latestTyreByDriver(detail.data.stints) : {}
  const laps = results.data?.rows?.reduce((m, r) => Math.max(m, r.laps ?? 0), 0) || null
  const liveRows = useMemo(
    () => (live.data?.sessionKey ? buildLiveTimingRows(live.data) : []),
    [live.data],
  )

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
          {isLive ? (
            live.isLoading ? (
              <LiveNotice text="Connecting to live timing…" />
            ) : !live.data?.sessionKey ? (
              <LiveNotice text="No live timing available for this session yet." />
            ) : liveRows.length ? (
              <LiveTimingBoard rows={liveRows} />
            ) : (
              <LiveNotice text="Session live — waiting for timing data…" />
            )
          ) : (
            <QueryBoundary
              query={results}
              isEmpty={(d) => !d?.rows?.length}
              emptyReason={
                state.phase === 'upcoming'
                  ? 'Season not started — no race run yet.'
                  : 'No classification available.'
              }
            >
              {(data) => <LiveLeaderboard rows={data.rows} tyres={tyres} />}
            </QueryBoundary>
          )}

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
