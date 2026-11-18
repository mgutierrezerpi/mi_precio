import { useEffect } from 'react'
import { AuthCard } from './AuthCard'
import type { AuthIntent } from './AuthCardChrome'

interface AuthModalProps {
  open: boolean
  intent?: AuthIntent
  onClose: () => void
}

const overlayClass = [
  'fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto',
  'bg-[#1E1B4B]/70 p-4 font-sans backdrop-blur-sm animate-fade-in',
].join(' ')

/** Login card shown as an overlay on top of the landing page. */
export function AuthModal({ open, intent, onClose }: AuthModalProps) {
  // Lock background scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={overlayClass}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[440px] animate-scale-in">
        <AuthCard intent={intent} onClose={onClose} />
      </div>
    </div>
  )
}

export default AuthModal
