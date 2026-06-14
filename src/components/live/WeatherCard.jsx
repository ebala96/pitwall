export function WeatherCard({ weather }) {
  const w = weather?.latest
  if (!w) return null
  const items = [
    ['Air', w.air != null ? `${w.air.toFixed(1)}°` : '—'],
    ['Track', w.track != null ? `${w.track.toFixed(1)}°` : '—'],
    ['Humidity', w.humidity != null ? `${w.humidity}%` : '—'],
    ['Wind', w.windSpeed != null ? `${w.windSpeed} m/s` : '—'],
    ['Rain', w.rainfall ? 'Yes' : 'Dry'],
  ]
  return (
    <div style={card}>
      <div style={title}>Weather</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
        {items.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)' }}>{k}</span>
            <span className="tnum">{v}</span>
          </div>
        ))}
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
