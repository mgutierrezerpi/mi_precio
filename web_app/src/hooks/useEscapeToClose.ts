import { useEffect, useRef } from 'react'

/** Closes an open menu or dropdown on Escape.
 *
 *  The «⋯» menus and the toolbar dropdowns already closed on a click outside
 *  but ignored the keyboard, so a keyboard user had no way out (B14). */
export function useEscapeToClose(open: boolean, close: () => void) {
  const closeRef = useRef(close)
  closeRef.current = close
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])
}
