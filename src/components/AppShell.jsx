import { TabBar } from './TabBar.jsx'
import { StatusStrip } from './StatusStrip.jsx'

export function AppShell({ children }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'var(--tab-w) 1fr',
        gridTemplateRows: '100%',
        height: '100%',
      }}
    >
      <TabBar />
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'var(--strip-h) 1fr',
          minWidth: 0,
        }}
      >
        <StatusStrip />
        <main style={{ overflow: 'auto', padding: '16px 20px' }}>{children}</main>
      </div>
    </div>
  )
}
