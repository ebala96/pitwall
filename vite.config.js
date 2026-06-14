import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Two-host proxy = the only egress path. Browser talks same-origin to localhost;
// Vite forwards /api/* to the real F1 hosts server-side (also kills CORS).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api/jolpi': {
        target: 'https://api.jolpi.ca',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/jolpi/, '/ergast/f1'),
      },
      '/api/openf1': {
        target: 'https://api.openf1.org',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/openf1/, '/v1'),
      },
    },
  },
})
