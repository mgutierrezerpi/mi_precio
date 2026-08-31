import { useCallback, useSyncExternalStore } from 'react'
import { DEFAULT_QR_COLOR } from '../lib/qrRender'

type Listener = () => void
const listeners = new Set<Listener>()

const notify = () => listeners.forEach((listener) => listener())
const subscribe = (listener: Listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function readColor(storageKey: string | null) {
  if (!storageKey || typeof window === 'undefined') return DEFAULT_QR_COLOR
  return window.localStorage.getItem(storageKey) ?? DEFAULT_QR_COLOR
}

/** Persisted QR colour backed by localStorage, an external browser store. */
export function useStoredQrColor(storageKey: string | null) {
  const color = useSyncExternalStore(
    subscribe,
    () => readColor(storageKey),
    () => DEFAULT_QR_COLOR
  )
  const setColor = useCallback(
    (value: string) => {
      if (storageKey) window.localStorage.setItem(storageKey, value)
      notify()
    },
    [storageKey]
  )
  return [color, setColor] as const
}
