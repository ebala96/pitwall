import { CHART } from '../../lib/chartTheme.js'

// Toggle up to `max` drivers. Selected order drives chart colours (palette index).
export function DriverMultiSelect({ drivers, selected, onChange, max = 3 }) {
  const nums = Object.keys(drivers)
    .map(Number)
    .sort((a, b) => a - b)

  function toggle(n) {
    if (selected.includes(n)) onChange(selected.filter((x) => x !== n))
    else if (selected.length < max) onChange([...selected, n])
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {nums.map((n) => {
        const i = selected.indexOf(n)
        const active = i !== -1
        const atMax = !active && selected.length >= max
        return (
          <button
            key={n}
            onClick={() => toggle(n)}
            disabled={atMax}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--panel-2)' : 'transparent',
              color: atMax ? 'var(--text-faint)' : 'var(--text)',
              borderRadius: 6,
              padding: '4px 9px',
              fontSize: 12,
              fontWeight: 700,
              cursor: atMax ? 'not-allowed' : 'pointer',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: active ? CHART.series[i % CHART.series.length] : 'var(--text-faint)',
              }}
            />
            {drivers[n]?.code ?? n}
          </button>
        )
      })}
    </div>
  )
}
