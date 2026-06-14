import { QueryBoundary } from '../components/QueryBoundary.jsx'
import { NextRaceCard } from '../components/schedule/NextRaceCard.jsx'
import { RaceList } from '../components/schedule/RaceList.jsx'
import { DEFAULT_SEASON } from '../config.js'
import { useSchedule } from '../hooks/useSchedule.js'
import { useNow } from '../hooks/useNow.js'

function pickNextRace(races, now) {
  return races.find((r) => new Date(r.raceStart).getTime() > now) ?? races.at(-1) ?? null
}

export default function Schedule() {
  const season = DEFAULT_SEASON
  const query = useSchedule(season)
  const now = useNow(30000)

  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Schedule</h1>
        <span className="tnum" style={{ color: 'var(--text-dim)' }}>
          {season}
        </span>
      </header>

      <QueryBoundary
        query={query}
        isEmpty={(d) => !d?.races?.length}
        emptyReason={`No schedule for ${season} yet.`}
      >
        {(data) => {
          const next = pickNextRace(data.races, now)
          return (
            <>
              <NextRaceCard race={next} now={now} />
              <RaceList races={data.races} nextRound={next?.round} now={now} />
            </>
          )
        }}
      </QueryBoundary>
    </section>
  )
}
