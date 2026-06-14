import { z } from 'zod'

// Shared zod helpers. The F1 APIs return many numbers as strings ("25", "1:23.456"),
// so coercers live here and domain schemas (milestone 3+) build on them.
export const numish = z.coerce.number()
export const intish = z.coerce.number().int()

// Keep a raw string when a value is sometimes non-numeric (e.g. "DNF" status).
export const str = z.string()
