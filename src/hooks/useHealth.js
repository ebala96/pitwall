import { useEffect, useState } from 'react'

// Ping both APIs through the proxy and measure latency for the Settings status pills.
async function ping(url) {
  const t = performance.now()
  try {
    const r = await fetch(url)
    return { status: r.ok ? 'up' : 'down', ms: Math.round(performance.now() - t) }
  } catch {
    return { status: 'down', ms: null }
  }
}

export function useDataSourceHealth() {
  const [health, setHealth] = useState({
    jolpica: { status: 'checking', ms: null },
    openf1: { status: 'checking', ms: null },
  })

  useEffect(() => {
    let alive = true
    Promise.all([
      ping('/api/jolpi/seasons.json?limit=1'),
      ping('/api/openf1/sessions?year=2024&country_name=Italy&session_name=Race'),
    ]).then(([jolpica, openf1]) => {
      if (alive) setHealth({ jolpica, openf1 })
    })
    return () => {
      alive = false
    }
  }, [])

  return health
}
