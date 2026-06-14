import { useState } from 'react'
import { H2HTable } from '../components/compare/H2HTable.jsx'
import { LapTimeChart } from '../components/charts/LapTimeChart.jsx'
import { TelemetryTraces } from '../components/charts/TelemetryTraces.jsx'
import { LapSelector } from '../components/telemetry/LapSelector.jsx'
import { SessionSelector } from '../components/telemetry/SessionSelector.jsx'
import { fastestLapNumber } from '../lib/chartData.js'
import { seasonH2H, weekendH2H } from '../lib/headToHead.js'
import { useNow } from '../hooks/useNow.js'
import { useDriverProfile } from '../hooks/useProfile.js'
import { useQualifying, useRaceResults } from '../hooks/useResults.js'
import { useSchedule } from '../hooks/useSchedule.js'
import { useSeason } from '../hooks/useSeason.js'
import { useSessionDetail } from '../hooks/useSessionDetail.js'
import { useLapTelemetry, useTelemetryLaps } from '../hooks/useTelemetry.js'

function latestCompletedRound(races, now) {
  let last = null
  for (const r of races) if (new Date(r.raceStart).getTime() <= now) last = r.round
  return last ?? races[0]?.round ?? null
}

const notice = (text) => (
  <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, color: 'var(--text-dim)' }}>
    {text}
  </div>
)

export default function Compare() {
  const now = useNow(60000)
  const [season, setSeason] = useState(useSeason())
  const [pickedRound, setPickedRound] = useState(null)
  const [pickA, setPickA] = useState(null)
  const [pickB, setPickB] = useState(null)
  const [pickedLap, setPickedLap] = useState(null)

  const sched = useSchedule(season)
  const races = sched.data?.races ?? []
  const round = pickedRound ?? latestCompletedRound(races, now)

  const raceQ = useRaceResults(season, round)
  const qualiQ = useQualifying(season, round)
  const detail = useSessionDetail(season, round, Boolean(round))
  const rows = raceQ.data?.rows ?? []

  const idA = pickA ?? rows[0]?.driverId ?? null
  const idB = pickB ?? rows[1]?.driverId ?? null

  const raceA = rows.find((r) => r.driverId === idA)
  const raceB = rows.find((r) => r.driverId === idB)
  const qRows = qualiQ.data?.rows ?? []
  const qualiA = qRows.find((r) => r.driverId === idA)
  const qualiB = qRows.find((r) => r.driverId === idB)

  const profA = useDriverProfile(season, idA)
  const profB = useDriverProfile(season, idB)

  const numbers = [raceA, raceB]
    .map((r) => (r?.number != null ? Number(r.number) : null))
    .filter((n) => n != null)
  const meta = {}
  if (raceA?.number != null) meta[Number(raceA.number)] = { code: raceA.code }
  if (raceB?.number != null) meta[Number(raceB.number)] = { code: raceB.code }

  const sessionKey = detail.data?.sessionKey ?? null
  const lapsQ = useTelemetryLaps(sessionKey, numbers)
  const focusLaps = lapsQ.data?.[numbers[0]] ?? []
  const lapNumber = pickedLap ?? fastestLapNumber(focusLaps)
  const teleQ = useLapTelemetry(sessionKey, numbers, lapNumber, lapsQ.data)

  function changeSeason(y) {
    setSeason(y)
    setPickedRound(null)
    setPickA(null)
    setPickB(null)
    setPickedLap(null)
  }
  function changeRound(r) {
    setPickedRound(r)
    setPickA(null)
    setPickB(null)
    setPickedLap(null)
  }

  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Compare</h1>
        <SessionSelector season={season} onSeason={changeSeason} round={round} onRound={changeRound} races={races} />
      </header>

      {raceQ.isLoading ? (
        notice('Loading event…')
      ) : !rows.length ? (
        notice('No results for this event yet.')
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <DriverSelect rows={rows} value={idA} onChange={(v) => setPickA(v)} />
            <span style={{ color: 'var(--text-faint)', alignSelf: 'center' }}>vs</span>
            <DriverSelect rows={rows} value={idB} onChange={(v) => setPickB(v)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            <H2HTable title="Weekend" metrics={weekendH2H(raceA, raceB, qualiA, qualiB)} codeA={raceA?.code} codeB={raceB?.code} />
            <H2HTable title="Season" metrics={seasonH2H(profA.data, profB.data)} codeA={raceA?.code} codeB={raceB?.code} />
          </div>

          {sessionKey ? (
            lapsQ.isLoading ? (
              notice('Loading laps…')
            ) : (
              <>
                <LapTimeChart lapsByDriver={lapsQ.data} drivers={numbers} meta={meta} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 12px' }}>
                  <LapSelector laps={focusLaps} value={lapNumber} onChange={setPickedLap} />
                  <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>
                    telemetry overlay · lap {lapNumber ?? '—'}
                  </span>
                </div>
                {teleQ.isLoading ? notice('Loading telemetry…') : (
                  <TelemetryTraces byDriver={teleQ.data ?? {}} drivers={numbers} meta={meta} />
                )}
              </>
            )
          ) : (
            <div style={{ marginTop: 12 }}>{notice('No telemetry for this event (2023+ only).')}</div>
          )}
        </>
      )}
    </section>
  )
}

function DriverSelect({ rows, value, onChange }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: 'var(--panel-2)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '6px 10px',
        fontSize: 13,
        minWidth: 200,
      }}
    >
      {rows.map((r) => (
        <option key={r.driverId} value={r.driverId}>
          {r.code} · {r.name}
        </option>
      ))}
    </select>
  )
}
