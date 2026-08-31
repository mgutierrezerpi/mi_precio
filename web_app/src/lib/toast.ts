export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: string
  message: string
  type: ToastType
}

type ToastListener = (toasts: Toast[]) => void

type ToastNotifier = ((message: string, type?: ToastType) => void) & {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

let toasts: Toast[] = []
const listeners = new Set<ToastListener>()

function notifyListeners() {
  listeners.forEach((listener) => listener([...toasts]))
}

function addToast(message: string, type: ToastType = 'info') {
  const id = Math.random().toString(36).substring(2, 9)
  toasts = [...toasts, { id, message, type }]
  notifyListeners()
}

export const toast: ToastNotifier = Object.assign(addToast, {
  success: (message: string) => addToast(message, 'success'),
  error: (message: string) => addToast(message, 'error'),
  warning: (message: string) => addToast(message, 'warning'),
  info: (message: string) => addToast(message, 'info'),
})

export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener)
  listener([...toasts])
  return () => {
    listeners.delete(listener)
  }
}

export function removeToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id)
  notifyListeners()
}
