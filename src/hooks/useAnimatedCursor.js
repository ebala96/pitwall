import { useEffect, useRef, useState } from 'react'

// rAF-driven cursor in seconds, playing within [from, to]. Advances by `speed`
// while `playing`; wraps to `from` when `loop`, otherwise clamps at `to`.
// Cursor reset on range change is the caller's responsibility (segment/round
// handlers) to keep render pure (no setState-in-effect).
export function useAnimatedCursor(from, to, { playing, speed = 1, loop = false }) {
  const [cursor, setCursor] = useState(from || 0)
  const lastRef = useRef(null)

  useEffect(() => {
    if (!playing || !(to > from)) return
    let id
    const step = (ts) => {
      if (lastRef.current != null) {
        const dt = ((ts - lastRef.current) / 1000) * speed
        setCursor((c) => {
          const n = c + dt
          if (n >= to) return loop ? from : to
          return n
        })
      }
      lastRef.current = ts
      id = requestAnimationFrame(step)
    }
    id = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(id)
      lastRef.current = null
    }
  }, [playing, speed, from, to, loop])

  return [cursor, setCursor]
}
