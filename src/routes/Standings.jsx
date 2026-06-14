import { useState } from 'react'
import { QueryBoundary } from '../components/QueryBoundary.jsx'
import { StandingsTable } from '../components/standings/StandingsTable.jsx'
import { DEFAULT_SEASON } from '../config.js'
import { useConstructorStandings, useDriverStandings } from '../hooks/useStandings.js'

export default function Standings() {
  const [kind, setKind] = useState('drivers')
  const season = DEFAULT_SEASON

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

function Segmented({ value, onChange, options }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'var(--panel-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 2,
      }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            border: 'none',
            cursor: 'pointer',
            padding: '5px 12px',
            borderRadius: 6,
            fontSize: 13,
            background: value === o.value ? 'var(--accent)' : 'transparent',
            color: value === o.value ? '#fff' : 'var(--text-dim)',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
