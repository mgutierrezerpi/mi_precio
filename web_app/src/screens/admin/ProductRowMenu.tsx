import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import { Icon } from './crm/ui'

const MENU_WIDTH = 160
const MENU_HEIGHT = 96

export function RowMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  const t = useCatalogT()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggle = () => {
    if (open) return setOpen(false)
    const rect = buttonRef.current!.getBoundingClientRect()
    const top =
      rect.bottom + 6 + MENU_HEIGHT > window.innerHeight
        ? rect.top - MENU_HEIGHT - 6
        : rect.bottom + 6
    setPosition({ top, left: Math.max(8, rect.right - MENU_WIDTH) })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      if (
        !buttonRef.current?.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      )
        setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const close = () => setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const action = (handler: () => void) => {
    setOpen(false)
    handler()
  }
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80"
      >
        <Icon name="ellipsis" size={14} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: position.top,
              left: position.left,
              width: MENU_WIDTH,
            }}
            className="dash fixed z-[120] rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1.5 font-sans shadow-[0_16px_44px_-12px_rgba(15,23,42,0.35)] animate-scale-in"
          >
            <button
              type="button"
              onClick={() => action(onEdit)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
            >
              <Icon name="settings" size={15} /> {t('products.edit')}
            </button>
            <button
              type="button"
              onClick={() => action(onDelete)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[#EF4444] hover:bg-[var(--dash-soft)]"
            >
              <Icon name="circle-x" size={15} /> {t('products.delete')}
            </button>
          </div>,
          document.body
        )}
    </>
  )
}
