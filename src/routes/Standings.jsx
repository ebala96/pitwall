import { useState } from 'react'
import { QueryBoundary } from '../components/QueryBoundary.jsx'
import { Segmented } from '../components/Segmented.jsx'
import { StandingsTable } from '../components/standings/StandingsTable.jsx'
import { useSeason } from '../hooks/useSeason.js'
import { useConstructorStandings, useDriverStandings } from '../hooks/useStandings.js'

export default function Standings() {
  const [kind, setKind] = useState('drivers')
  const season = useSeason()

  const drivers = useDriverStandings(season)
  const constructors = useConstructorStandings(season)
  const query = kind === 'drivers' ? drivers : constructors

  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Standings</h1>
        <span style={{ color: 'var(--text-dim)' }} className="tnum">
          {season}
        </span>
        <span style={{ flex: 1 }} />
        <Segmented
          value={kind}
          onChange={setKind}
          options={[
            { value: 'drivers', label: 'Drivers' },
            { value: 'constructors', label: 'Constructors' },
          ]}
        />
      </header>

      <QueryBoundary
        query={query}
        isEmpty={(d) => !d?.rows?.length}
        emptyReason={`No standings for ${season} yet.`}
      >
        {(data) => <StandingsTable kind={kind} rows={data.rows} />}
      </QueryBoundary>
    </section>
  )
}
