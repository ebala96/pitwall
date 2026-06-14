import { QueryClient } from '@tanstack/react-query'

// Defaults are conservative; per-query staleTime/gcTime come from data/ttl.js
// (wired in milestone 2). Retry with exponential backoff for transient 429/5xx.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15000),
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst',
    },
  },
})
