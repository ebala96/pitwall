import { compoundStyle } from '../../lib/tyres.js'

// Pure flex bars (no chart lib): one row per driver, segments per stint coloured
// by compound, width proportional to laps run.
export function TyreStrategyTimeline({ stints, meta, order }) {
  const byDriver = {}
  let maxLap = 0
  for (const s of stints ?? []) {
    ;(byDriver[s.driverNumber] ||= []).push(s)
    if ((s.lapEnd ?? 0) > maxLap) maxLap = s.lapEnd ?? 0
  }
  if (!maxLap) return null

  const drivers = order?.length
    ? order.filter((n) => byDriver[n])
    : Object.keys(byDriver).map(Number)

  return (
    <div style={card}>
      <div style={title}>Tyre strategy</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {drivers.map((n) => {
          const runs = [...byDriver[n]].sort((a, b) => (a.lapStart ?? 0) - (b.lapStart ?? 0))
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 40, fontWeight: 700, fontSize: 12 }}>
                {meta?.[n]?.code ?? n}
              </span>
              <div style={{ display: 'flex', flex: 1, height: 16, borderRadius: 3, overflow: 'hidden' }}>
                {runs.map((s, i) => {
                  const laps = Math.max(1, (s.lapEnd ?? s.lapStart ?? 0) - (s.lapStart ?? 0) + 1)
                  const c = compoundStyle(s.compound)
                  return (
                    <div
                      key={i}
                      title={`${s.compound ?? '?'} · laps ${s.lapStart ?? '?'}–${s.lapEnd ?? '?'}`}
                      style={{
                        width: `${(laps / maxLap) * 100}%`,
                        background: c.color,
                        color: c.text,
                        fontSize: 9,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid var(--panel)',
                      }}
                    >
                      {laps > 2 ? c.label : ''}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const card = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 12,
  marginBottom: 12,
}
const title = { color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase', marginBottom: 8 }
