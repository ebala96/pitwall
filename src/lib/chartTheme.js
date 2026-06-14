// Shared uPlot theming for the dark broadcast look.
export const CHART = {
  axis: '#5e6677',
  grid: 'rgba(255,255,255,0.06)',
  // distinct palette by selection order (so teammates stay distinguishable)
  series: ['#27F4D2', '#FF8000', '#B455FF'],
}

export function axes(xLabel, yLabel) {
  const common = {
    stroke: CHART.axis,
    grid: { stroke: CHART.grid, width: 1 },
    ticks: { stroke: CHART.grid, width: 1 },
    font: '11px ui-monospace, monospace',
    labelFont: '11px system-ui, sans-serif',
  }
  return [
    { ...common, label: xLabel, labelSize: 24 },
    { ...common, label: yLabel, labelSize: 36, size: 52 },
  ]
}

// uPlot series config: index 0 is the x series ({}), then one per driver.
export function lineSeries(labels, colors) {
  return [
    {},
    ...labels.map((label, i) => ({
      label,
      stroke: colors[i] ?? CHART.series[i % CHART.series.length],
      width: 1.5,
      points: { show: false },
      spanGaps: true,
    })),
  ]
}
