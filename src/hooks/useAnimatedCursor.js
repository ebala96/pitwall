import { useEffect, useRef, useState } from 'react'

// rAF-driven cursor in seconds over [0, duration]. Advances by `speed` while
// `playing`; wraps to 0 when `loop`, otherwise clamps at the end.
export function useAnimatedCursor(duration, { playing, speed = 1, loop = false }) {
  const [cursor, setCursor] = useState(0)
  const lastRef = useRef(null)

  useEffect(() => {
    if (!playing || !duration) return
    let id
    const step = (ts) => {
      if (lastRef.current != null) {
        const dt = ((ts - lastRef.current) / 1000) * speed
        setCursor((c) => {
          const n = c + dt
          return n >= duration ? (loop ? 0 : duration) : n
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
  }, [playing, speed, duration, loop])

  return [cursor, setCursor]
}
