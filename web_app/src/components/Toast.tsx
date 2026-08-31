import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  removeToast,
  subscribeToasts,
  type Toast,
  type ToastType,
} from '../lib/toast'
import { toastIcons } from './toastIcons'

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const colors: Record<ToastType, string> = {
  success:
    'bg-[var(--color-success-soft)] border-[var(--color-success)]/30 text-[var(--color-success)]',
  error:
    'bg-[var(--color-error-soft)] border-[var(--color-error)]/30 text-[var(--color-error)]',
  warning:
    'bg-[var(--color-warning-soft)] border-[var(--color-warning)]/30 text-[var(--color-warning)]',
  info: 'bg-[var(--color-info-soft)] border-[var(--color-info)]/30 text-[var(--color-info)]',
}

function ToastItem({ toast, onRemove }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div
      className={[
        'flex items-center gap-3 rounded-xl border px-4 py-3 font-sans backdrop-blur-sm shadow-lg',
        colors[toast.type],
        isExiting ? 'toast-exit' : 'toast-enter',
      ].join(' ')}
    >
      <span className="flex-shrink-0">{toastIcons[toast.type]}</span>
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(() => onRemove(toast.id), 300)
        }}
        className="flex-shrink-0 ml-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])
  useEffect(() => subscribeToasts(setCurrentToasts), [])
  if (currentToasts.length === 0) return null
  return createPortal(
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {currentToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>,
    document.body
  )
}
