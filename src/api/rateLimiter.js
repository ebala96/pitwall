// Client-side rate limiter for a single upstream host. Serializes calls with a
// minimum gap between starts (≈ a few req/s) so we never trip OpenF1's 429 limit,
// and retries a 429 by honoring Retry-After (or a backoff).

const MIN_GAP_MS = 300 // ~3 requests/second
const MAX_429_RETRIES = 3

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let chain = Promise.resolve()
let lastStart = 0

// Queue fn behind all prior calls, ensuring >= MIN_GAP_MS between starts.
function gated(fn) {
  const run = chain.then(async () => {
    const wait = MIN_GAP_MS - (Date.now() - lastStart)
    if (wait > 0) await sleep(wait)
    lastStart = Date.now()
    return fn()
  })
  chain = run.then(
    () => {},
    () => {},
  )
  return run
}

// Run a request through the limiter, retrying on HTTP 429.
export async function rateLimited(fn) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await gated(fn)
    } catch (e) {
      if (e?.status === 429 && attempt < MAX_429_RETRIES) {
        const backoff = (e.retryAfter != null ? e.retryAfter : 1) * 1000 * (attempt + 1)
        await sleep(backoff)
        continue
      }
      throw e
    }
  }
}
