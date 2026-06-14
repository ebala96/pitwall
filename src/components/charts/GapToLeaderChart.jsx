import { ChartFrame } from './ChartFrame.jsx'
import { buildGapData } from '../../lib/chartData.js'
import { axes, CHART, lineSeries } from '../../lib/chartTheme.js'

export function GapToLeaderChart({ lapsByDriver, drivers, meta }) {
  const data = buildGapData(lapsByDriver, drivers)
  const labels = drivers.map((n) => meta?.[n]?.code ?? String(n))
  const colors = drivers.map((_, i) => CHART.series[i])
  const options = {
    scales: { x: { time: false }, y: { dir: -1 } }, // smaller gap = higher
    axes: axes('Lap', 'Gap (s)'),
    series: lineSeries(labels, colors),
    legend: { show: true },
  }
  return (
    <ChartFrame
      title="Gap to best (selected)"
      options={options}
      data={data}
      empty={data[0].length ? null : 'No lap data'}
    />
  )
}
