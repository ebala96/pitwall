const TIMEOUT_MS = 8000

export class HttpError extends Error {
  constructor(message, { status, url, cause } = {}) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.url = url
    if (cause) this.cause = cause
  }
}

// Single fetch chokepoint. `path` MUST be a relative /api/... path built by a
// domain client — never a full URL from a component. Validates JSON content-type
// and (when given) a zod schema, so bad/changed upstream data fails here in one
// place instead of corrupting the UI downstream.
export async function fetchJson(path, { schema, signal } = {}) {
  if (typeof path !== 'string' || !path.startsWith('/api/')) {
    throw new HttpError(`Refusing non-proxy path: ${path}`, { url: path })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  let res
  try {
    res = await fetch(path, {
      signal: controller.signal,
      redirect: 'error',
      headers: { accept: 'application/json' },
    })
  } catch (cause) {
    throw new HttpError(`Network error for ${path}`, { url: path, cause })
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    const err = new HttpError(`HTTP ${res.status} for ${path}`, { status: res.status, url: path })
    if (res.status === 429) {
      const ra = res.headers.get('retry-after')
      err.retryAfter = ra != null && ra !== '' ? Number(ra) : null
    }
    throw err
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new HttpError(`Expected JSON, got "${contentType}" for ${path}`, { url: path })
  }

  const json = await res.json()
  if (!schema) return json

  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    const first = parsed.error?.issues?.[0]
    const where = first ? `${first.path?.join('.') || '<root>'}: ${first.message}` : 'invalid shape'
    throw new HttpError(`Response validation failed for ${path} (${where})`, {
      url: path,
      cause: parsed.error,
    })
  }
  return parsed.data
}
