import { ChartFrame } from './ChartFrame.jsx'
import { buildTraceData } from '../../lib/chartData.js'
import { axes, CHART, lineSeries } from '../../lib/chartTheme.js'

const TRACES = [
  ['speed', 'Speed (km/h)'],
  ['throttle', 'Throttle (%)'],
  ['brake', 'Brake'],
  ['gear', 'Gear'],
]

export function TelemetryTraces({ byDriver, drivers, meta }) {
  const labels = drivers.map((n) => meta?.[n]?.code ?? String(n))
  const colors = drivers.map((_, i) => CHART.series[i])
  return (
    <>
      {TRACES.map(([field, title]) => {
        const data = buildTraceData(byDriver, drivers, field)
        return (
          <ChartFrame
            key={field}
            title={title}
            height={150}
            options={{
              scales: { x: { time: false } },
              axes: axes('s into lap', title),
              series: lineSeries(labels, colors),
              legend: { show: false },
            }}
            data={data}
            empty={data[0].length ? null : 'No telemetry for this lap'}
          />
        )
      })}
    </>
  )
}
