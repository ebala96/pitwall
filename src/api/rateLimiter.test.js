import { describe, expect, it } from 'vitest'
import { rateLimited } from './rateLimiter.js'

describe('rateLimited', () => {
  it('spaces concurrent calls by the minimum gap', async () => {
    const starts = []
    await Promise.all([0, 1, 2].map(() => rateLimited(async () => starts.push(Date.now()))))
    starts.sort((a, b) => a - b)
    expect(starts[1] - starts[0]).toBeGreaterThanOrEqual(280)
    expect(starts[2] - starts[1]).toBeGreaterThanOrEqual(280)
  })

  it('retries on 429 then succeeds', async () => {
    let calls = 0
    const result = await rateLimited(async () => {
      if (calls++ === 0) {
        const e = new Error('429')
        e.status = 429
        e.retryAfter = 0
        throw e
      }
      return 'ok'
    })
    expect(result).toBe('ok')
    expect(calls).toBe(2)
  })

  it('propagates non-429 errors without retry', async () => {
    let calls = 0
    await expect(
      rateLimited(async () => {
        calls++
        const e = new Error('boom')
        e.status = 500
        throw e
      }),
    ).rejects.toThrow('boom')
    expect(calls).toBe(1)
  })
})
