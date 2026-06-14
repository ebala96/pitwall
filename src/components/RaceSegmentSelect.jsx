import { RACE_SEGMENTS } from '../lib/raceSegments.js'

// Dropdown to replay only part of a race (Full race default).
export function RaceSegmentSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: 'var(--panel-2)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '5px 10px',
        fontSize: 13,
      }}
    >
      {RACE_SEGMENTS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  )
}
