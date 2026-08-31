import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon, type IconName } from './crm/ui'
import { gradient } from './crm/theme'

export const outlineBtn =
  'flex h-[38px] items-center gap-2 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'

export function MenuRow({
  children,
  active,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-[13px] font-semibold hover:bg-[var(--dash-soft)] ${active ? 'text-[var(--dash-link)]' : 'text-[var(--dash-text2)]'}`}
    >
      {children}
    </button>
  )
}

export function Menu({
  icon,
  label,
  width = 'w-56',
  children,
}: {
  icon: IconName
  label: string
  width?: string
  children: (close: () => void) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={ref} className="relative w-full lg:w-auto">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`${outlineBtn} w-full justify-between lg:w-auto lg:justify-start`}
      >
        <span className="flex items-center gap-2">
          <Icon name={icon} size={16} /> {label}
        </span>
        <Icon
          name="chevron-down"
          size={14}
          className={`text-[var(--dash-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`absolute right-0 top-[calc(100%+6px)] z-40 ${width} origin-top-right rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-2 shadow-[0_16px_44px_-12px_rgba(15,23,42,0.3)] transition-all duration-150 ${open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
      >
        {children(() => setOpen(false))}
      </div>
    </div>
  )
}

export function ActiveOption({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <MenuRow active={active} onClick={onClick}>
      {children}
    </MenuRow>
  )
}

export { gradient }
