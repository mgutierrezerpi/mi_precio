import type { ReactNode } from 'react'
import { Icon, type IconName } from '../crm/ui'

export const inputCls = [
  'rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]',
  'px-3 py-2 text-sm font-medium text-[var(--dash-text)] outline-none',
  'placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-link)] focus:ring-0',
].join(' ')

export function Overlay({
  children,
  onClose,
  align = 'center',
}: {
  children: ReactNode
  onClose: () => void
  align?: 'center' | 'right'
}) {
  return (
    <div
      onClick={(event) => {
        event.stopPropagation()
        onClose()
      }}
      className={[
        'fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm',
        align === 'right' ? 'justify-end' : 'items-center justify-center p-4',
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">
        {label}
      </span>
      {children}
    </label>
  )
}

export function ContactRow({ icon, value }: { icon: IconName; value: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--dash-text2)]">
      <Icon name={icon} size={15} className="text-[var(--dash-muted)]" />{' '}
      {value}
    </div>
  )
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
        {label}
      </span>
      <span className="text-[15px] font-extrabold text-[var(--dash-text)]">
        {value}
      </span>
    </div>
  )
}
