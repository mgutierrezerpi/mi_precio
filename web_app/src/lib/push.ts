// Web Push (PWA notifications) client helpers.
//
// Wraps the browser Notification + PushManager APIs and syncs the subscription
// with the backend. All functions are safe to call on unsupported browsers
// (they report `unsupported` rather than throwing).
import api from '../services/api'

export type PushStatus = 'unsupported' | 'denied' | 'default' | 'subscribed' | 'unsubscribed'

/** True when this browser can show push notifications (PWA-capable). */
export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

// VAPID public keys travel as URL-safe base64; PushManager wants a Uint8Array.
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(normalized)
  // Allocate over a concrete ArrayBuffer so the result is a valid BufferSource.
  const out = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

async function readyRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null
  try {
    return await navigator.serviceWorker.ready
  } catch {
    return null
  }
}

/** Current status without prompting the user. */
export async function getPushStatus(): Promise<PushStatus> {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  const reg = await readyRegistration()
  if (!reg) return 'unsupported'
  const sub = await reg.pushManager.getSubscription()
  if (sub) return 'subscribed'
  return Notification.permission === 'granted' ? 'unsubscribed' : 'default'
}

/**
 * Ask for permission (if needed), subscribe this device, and register it with
 * the backend. Returns the resulting status.
 */
export async function enablePush(tenantId: string): Promise<PushStatus> {
  if (!pushSupported()) return 'unsupported'

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'default'

  const reg = await readyRegistration()
  if (!reg) return 'unsupported'

  const keyRes = await api.getPushPublicKey()
  if (!keyRes.data?.enabled || !keyRes.data.key) {
    // Server has no VAPID keys configured; nothing to subscribe to.
    return 'unsubscribed'
  }

  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyRes.data.key),
    })
  }

  const res = await api.subscribePush(tenantId, sub.toJSON())
  return res.data?.ok ? 'subscribed' : 'unsubscribed'
}

/** Unsubscribe this device and tell the backend to drop it. */
export async function disablePush(tenantId: string): Promise<PushStatus> {
  const reg = await readyRegistration()
  if (!reg) return 'unsupported'
  const sub = await reg.pushManager.getSubscription()
  if (sub) {
    const endpoint = sub.endpoint
    await sub.unsubscribe().catch(() => {})
    await api.unsubscribePush(tenantId, endpoint)
  }
  return Notification.permission === 'granted' ? 'unsubscribed' : 'default'
}
