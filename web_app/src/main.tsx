import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App'
import { initAnalytics, trackEvent } from './lib/analytics'

// Install/refresh the service worker so the app is installable (PWA) and can
// receive Web Push notifications. `autoUpdate` keeps it current in the background.
registerSW({ immediate: true })

initAnalytics()
if (window.location.pathname === '/login') {
  trackEvent('Viewed Login Page', { prompt_version: 'BA400.4' })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
