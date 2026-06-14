export function LapSelector({ laps, value, onChange }) {
  const nums = [...new Set((laps ?? []).map((l) => l.lap_number).filter((x) => x != null))].sort(
    (a, b) => a - b,
  )
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      <span style={{ color: 'var(--text-dim)' }}>Lap</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={!nums.length}
        style={{
          background: 'var(--panel-2)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '5px 10px',
          fontSize: 13,
        }}
      >
        {!nums.length && <option value="">—</option>}
        {nums.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  )
}
