import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Two-host proxy = the only egress path. Browser talks same-origin to localhost;
// Vite forwards /api/* to the real F1 hosts server-side (also kills CORS).
// Shared between the dev server and `vite preview` so a built PWA still works.
const proxy = {
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
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // registered manually in main.jsx (keeps CSP script-src 'self')
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Pitwall',
        short_name: 'Pitwall',
        description: 'Personal Formula 1 dashboard',
        theme_color: '#0B0E14',
        background_color: '#0B0E14',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'f1-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 300, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false }, // SW only in production builds; dev stays clean
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { host: '127.0.0.1', port: 5173, proxy },
  preview: { host: '127.0.0.1', port: 4173, proxy },
})
