// Small segmented toggle used by Standings (Drivers|Constructors), Results
// (Race|Qualifying), etc.
export function Segmented({ value, onChange, options }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'var(--panel-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 2,
      }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            border: 'none',
            cursor: 'pointer',
            padding: '5px 12px',
            borderRadius: 6,
            fontSize: 13,
            background: value === o.value ? 'var(--accent)' : 'transparent',
            color: value === o.value ? '#fff' : 'var(--text-dim)',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
