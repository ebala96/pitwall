// Wraps a TanStack Query result into the 4 canonical states:
// loading skeleton / error+retry / empty(reason) / data.
export function QueryBoundary({ query, isEmpty, emptyReason = 'Nothing here yet.', children }) {
  if (query.isLoading) {
    return <Skeleton />
  }
  if (query.isError) {
    return (
      <div style={panel}>
        <div style={{ color: 'var(--bad)', marginBottom: 8 }}>Failed to load.</div>
        <div style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 12 }}>
          {String(query.error?.message ?? query.error)}
        </div>
        <button style={btn} onClick={() => query.refetch()}>
          Retry
        </button>
      </div>
    )
  }
  if (isEmpty?.(query.data)) {
    return <div style={{ ...panel, color: 'var(--text-dim)' }}>{emptyReason}</div>
  }
  return children(query.data)
}

function Skeleton() {
  return (
    <div style={panel}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            height: 'var(--row-h)',
            background: 'var(--panel-2)',
            borderRadius: 4,
            marginBottom: 6,
            opacity: 1 - i * 0.15,
          }}
        />
      ))}
    </div>
  )
}

const panel = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 16,
}

const btn = {
  background: 'var(--accent)',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '6px 14px',
  cursor: 'pointer',
}
