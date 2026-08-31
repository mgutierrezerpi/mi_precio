import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import * as amplitude from '@amplitude/unified'
import './index.css'
import App from './App'

// Install/refresh the service worker so the app is installable (PWA) and can
// receive Web Push notifications. `autoUpdate` keeps it current in the background.
registerSW({ immediate: true })

const amplitudeApiKey = import.meta.env.VITE_AMPLITUDE_API_KEY
if (!amplitudeApiKey) {
  console.warn('Amplitude API key missing — analytics disabled')
} else {
  amplitude.initAll(amplitudeApiKey, {
    analytics: { autocapture: true },
    sessionReplay: { sampleRate: 1 },
  })
  if (window.location.pathname === '/login') {
    amplitude.track('Viewed Login Page', { prompt_version: 'BA400.4' })
    // Keeps the login experiment attributable while that setup is evaluated.
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
