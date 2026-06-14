import { useState } from 'react'
import { QueryBoundary } from '../components/QueryBoundary.jsx'
import { Segmented } from '../components/Segmented.jsx'
import { EventPicker } from '../components/results/EventPicker.jsx'
import { QualifyingTable } from '../components/results/QualifyingTable.jsx'
import { ResultsTable } from '../components/results/ResultsTable.jsx'
import { useNow } from '../hooks/useNow.js'
import { useSchedule } from '../hooks/useSchedule.js'
import { useSeason } from '../hooks/useSeason.js'
import { useQualifying, useRaceResults } from '../hooks/useResults.js'

function latestCompletedRound(races, now) {
  let last = null
  for (const r of races) {
    if (new Date(r.raceStart).getTime() <= now) last = r.round
  }
  return last ?? races[0]?.round ?? null
}

export default function Results() {
  const season = useSeason()
  const now = useNow(60000)
  const sched = useSchedule(season)
  const races = sched.data?.races ?? []

  const [tab, setTab] = useState('race')
  const [picked, setPicked] = useState(null)
  const round = picked ?? latestCompletedRound(races, now)

  const race = useRaceResults(season, round)
  const quali = useQualifying(season, round)
  const query = tab === 'race' ? race : quali

  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Results</h1>
        <EventPicker races={races} round={round} onChange={setPicked} />
        <span style={{ flex: 1 }} />
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'race', label: 'Race' },
            { value: 'qualifying', label: 'Qualifying' },
          ]}
        />
      </header>

      <QueryBoundary
        query={query}
        isEmpty={(d) => !d?.rows?.length}
        emptyReason="No results for this event yet."
      >
        {(data) =>
          tab === 'race' ? <ResultsTable rows={data.rows} /> : <QualifyingTable rows={data.rows} />
        }
      </QueryBoundary>
    </section>
  )
}
