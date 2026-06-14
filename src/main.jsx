import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import { queryClient } from './data/queryClient.js'
import { setupPersist } from './data/persist.js'
import App from './App.jsx'

setupPersist(queryClient)
// Installable PWA + offline app shell (active only in production builds).
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
