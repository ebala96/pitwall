export function EventPicker({ races, round, onChange }) {
  return (
    <select
      value={round ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={!races.length}
      style={{
        background: 'var(--panel-2)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '5px 10px',
        fontSize: 13,
        maxWidth: 280,
      }}
    >
      {!races.length && <option value="">Loading…</option>}
      {races.map((r) => (
        <option key={r.round} value={r.round}>
          R{r.round} · {r.name}
        </option>
      ))}
    </select>
  )
}
