/// <reference lib="webworker" />
// Custom service worker for MiPrecio (vite-plugin-pwa `injectManifest`).
//
// Responsibilities:
//   1. Precache the app shell (Workbox manifest injected at build time).
//   2. Receive Web Push messages and show desktop/mobile notifications.
//   3. Focus (or open) the admin app when a notification is clicked.
import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

// `self.__WB_MANIFEST` is replaced by the build with the list of assets to
// precache. The reference must exist even if push is the main feature.
precacheAndRoute(self.__WB_MANIFEST)

// Activate a new SW immediately so push handling updates without a manual reload.
self.addEventListener('install', () => {
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

type PushData = {
  title?: string
  body?: string
  url?: string
  tag?: string
}

self.addEventListener('push', (event) => {
  let data: PushData = {}
  if (event.data) {
    try {
      data = event.data.json() as PushData
    } catch {
      data = { body: event.data.text() }
    }
  }

  const title = data.title || 'MiPrecio'
  const options: NotificationOptions = {
    body: data.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: data.tag,
    data: { url: data.url || '/admin' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data as { url?: string })?.url || '/admin'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus an existing app window if one is already open.
      for (const client of clients) {
        if ('focus' in client) {
          void client.focus()
          if ('navigate' in client) void client.navigate(target)
          return
        }
      }
      return self.clients.openWindow(target)
    }),
  )
})
