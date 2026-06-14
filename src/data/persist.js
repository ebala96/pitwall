import { get, set, del } from 'idb-keyval'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

const CACHE_KEY = 'pitwall-query-cache'

// IndexedDB-backed persister → stale-if-error survives reloads (serve last-good
// data when offline / rate-limited instead of failing).
const idbPersister = {
  persistClient: (client) => set(CACHE_KEY, client),
  restoreClient: () => get(CACHE_KEY),
  removeClient: () => del(CACHE_KEY),
}

export function setupPersist(queryClient) {
  const [unsubscribe] = persistQueryClient({
    queryClient,
    persister: idbPersister,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30d ceiling; per-query gcTime still applies
    buster: 'v1',
  })
  return unsubscribe
}

export async function clearPersistedCache() {
  await del(CACHE_KEY)
}
