import { setSettings, useSettings } from '../../hooks/useSettings.js'
import { getTeamColor } from '../../lib/teamColors.js'

export function ProfileView({ data }) {
  const settings = useSettings()
  const isDriver = data.type === 'driver'
  const teamId = isDriver ? data.constructorId : data.id
  const color = getTeamColor(teamId)
  const isFav = isDriver
    ? settings.favoriteDriver === data.id
    : settings.favoriteConstructor === data.id

  function toggleFav() {
    setSettings(
      isDriver
        ? { favoriteDriver: isFav ? null : data.id }
        : { favoriteConstructor: isFav ? null : data.id },
    )
  }

  const s = data.stats
  const cards = isDriver
    ? [
        ['Points', s.points],
        ['Wins', s.wins],
        ['Podiums', s.podiums],
        ['Poles', s.poles],
        ['Best', s.bestFinish ? `P${s.bestFinish}` : '—'],
        ['Starts', s.starts],
      ]
    : [
        ['Points', s.points],
        ['Wins', s.wins],
        ['Podiums', s.podiums],
        ['Best', s.bestFinish ? `P${s.bestFinish}` : '—'],
        ['Rounds', s.starts],
      ]

  return (
    <div>
      <div style={{ ...header, borderLeft: `5px solid ${color}` }}>
        <div>
          <div style={{ color: 'var(--text-faint)', fontSize: 12 }} className="tnum">
            {data.season}
            {isDriver && data.number ? ` · #${data.number}` : ''}
            {isDriver && data.code ? ` · ${data.code}` : ''}
          </div>
          <h1 style={{ margin: '2px 0 2px', fontSize: 24 }}>{data.name}</h1>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            {isDriver ? data.constructorName : data.nationality}
          </div>
        </div>
        <button onClick={toggleFav} style={{ ...favBtn, color: isFav ? 'var(--yellow)' : 'var(--text-dim)' }}>
          {isFav ? '★ Favorite' : '☆ Set favorite'}
        </button>
      </div>

      <div style={cardGrid}>
        {cards.map(([label, val]) => (
          <div key={label} style={statCard}>
            <div className="tnum" style={{ fontSize: 22, fontWeight: 700 }}>
              {val}
            </div>
            <div style={{ color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase', margin: '4px 0 8px' }}>
        Season by round
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {data.rounds.map((r) => (
          <div key={r.round} title={`R${r.round} ${r.raceName}: ${posLabel(r)}`} style={roundBlock(r)}>
            <span className="tnum" style={{ fontSize: 9, opacity: 0.7 }}>
              {r.round}
            </span>
            <span className="tnum" style={{ fontWeight: 700 }}>
              {r.position ?? '–'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function posLabel(r) {
  return r.position ? `P${r.position}` : (r.status ?? 'DNF')
}

function roundBlock(r) {
  let bg = 'var(--panel-2)'
  let fg = 'var(--text-faint)'
  if (r.position === 1) {
    bg = 'var(--yellow)'
    fg = '#000'
  } else if (r.position != null && r.position <= 3) {
    bg = 'var(--green)'
    fg = '#000'
  } else if (r.points > 0) {
    bg = 'var(--panel-2)'
    fg = 'var(--text)'
  }
  return {
    width: 34,
    height: 38,
    borderRadius: 5,
    background: bg,
    color: fg,
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }
}

const header = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '14px 16px',
  marginBottom: 14,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}
const favBtn = {
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: 13,
}
const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
  gap: 8,
  marginBottom: 18,
}
const statCard = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '12px 14px',
}
