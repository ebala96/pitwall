// Temporary scaffold view for routes not yet implemented.
export function PagePlaceholder({ title, note }) {
  return (
    <section>
      <h1 style={{ margin: '0 0 6px', fontSize: 20 }}>{title}</h1>
      <p style={{ color: 'var(--text-dim)', margin: 0 }}>{note ?? 'Coming in a later milestone.'}</p>
    </section>
  )
}
