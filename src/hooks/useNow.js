import { useEffect, useState } from 'react'

// Current epoch ms as React state, refreshed on an interval. Keeps render pure
// (no Date.now() during render) while letting time-dependent UI update.
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
