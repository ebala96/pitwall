import { useState } from 'react'
import { GapToLeaderChart } from '../components/charts/GapToLeaderChart.jsx'
import { LapTimeChart } from '../components/charts/LapTimeChart.jsx'
import { TelemetryTraces } from '../components/charts/TelemetryTraces.jsx'
import { TyreStrategyTimeline } from '../components/charts/TyreStrategyTimeline.jsx'
import { DriverMultiSelect } from '../components/telemetry/DriverMultiSelect.jsx'
import { LapSelector } from '../components/telemetry/LapSelector.jsx'
import { SessionSelector } from '../components/telemetry/SessionSelector.jsx'
import { fastestLapNumber } from '../lib/chartData.js'
import { useNow } from '../hooks/useNow.js'
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

export default function Telemetry() {
  const now = useNow(60000)
  const [season, setSeason] = useState(useSeason())
  const [pickedRound, setPickedRound] = useState(null)
  const [pickedDrivers, setPickedDrivers] = useState([])
  const [pickedLap, setPickedLap] = useState(null)

  const sched = useSchedule(season)
  const races = sched.data?.races ?? []
  const round = pickedRound ?? latestCompletedRound(races, now)

  const detail = useSessionDetail(season, round, Boolean(round))
  const sessionKey = detail.data?.sessionKey ?? null
  const driversMeta = detail.data?.drivers ?? {}
  const availableNums = Object.keys(driversMeta)
    .map(Number)
    .sort((a, b) => a - b)

  const drivers = pickedDrivers.length ? pickedDrivers : availableNums.slice(0, 2)

  const lapsQ = useTelemetryLaps(sessionKey, drivers)
  const lapsByDriver = lapsQ.data
  const focusLaps = lapsByDriver?.[drivers[0]] ?? []
  const lapNumber = pickedLap ?? fastestLapNumber(focusLaps)

  const teleQ = useLapTelemetry(sessionKey, drivers, lapNumber, lapsByDriver)

  function changeSeason(y) {
    setSeason(y)
    setPickedRound(null)
    setPickedDrivers([])
    setPickedLap(null)
  }
  function changeRound(r) {
    setPickedRound(r)
    setPickedDrivers([])
    setPickedLap(null)
  }

  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Telemetry</h1>
        <SessionSelector
          season={season}
          onSeason={changeSeason}
          round={round}
          onRound={changeRound}
          races={races}
        />
      </header>

      {detail.isLoading ? (
        notice('Resolving session…')
      ) : !sessionKey ? (
        notice('No OpenF1 telemetry for this event (available from 2023 onward).')
      ) : (
        <>
          <div style={{ marginBottom: 14 }}>
            <DriverMultiSelect drivers={driversMeta} selected={drivers} onChange={setPickedDrivers} />
          </div>

          <TyreStrategyTimeline stints={detail.data?.stints} meta={driversMeta} order={drivers} />

          {lapsQ.isError
            ? notice('Failed to load laps.')
            : lapsQ.isLoading
              ? notice('Loading laps…')
              : (
                <>
                  <LapTimeChart lapsByDriver={lapsByDriver} drivers={drivers} meta={driversMeta} />
                  <GapToLeaderChart lapsByDriver={lapsByDriver} drivers={drivers} meta={driversMeta} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 12px' }}>
                    <LapSelector laps={focusLaps} value={lapNumber} onChange={setPickedLap} />
                    <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>
                      traces for {driversMeta[drivers[0]]?.code ?? drivers[0]}
                      {drivers.length > 1 ? ` +${drivers.length - 1}` : ''}, lap {lapNumber ?? '—'}
                    </span>
                  </div>

                  {teleQ.isLoading
                    ? notice('Loading telemetry…')
                    : (
                      <TelemetryTraces byDriver={teleQ.data ?? {}} drivers={drivers} meta={driversMeta} />
                    )}
                </>
              )}
        </>
      )}
    </section>
  )
}
