import { ChartFrame } from './ChartFrame.jsx'
import { buildLapTimeData } from '../../lib/chartData.js'
import { axes, CHART, lineSeries } from '../../lib/chartTheme.js'

export function LapTimeChart({ lapsByDriver, drivers, meta }) {
  const { data, maxLap } = buildLapTimeData(lapsByDriver, drivers)
  const labels = drivers.map((n) => meta?.[n]?.code ?? String(n))
  const colors = drivers.map((_, i) => CHART.series[i])
  const options = {
    scales: { x: { time: false } },
    axes: axes('Lap', 'Lap time (s)'),
    series: lineSeries(labels, colors),
    legend: { show: true },
  }
  return (
    <ChartFrame
      title="Lap times"
      options={options}
      data={data}
      empty={maxLap ? null : 'No lap data'}
    />
  )
}
