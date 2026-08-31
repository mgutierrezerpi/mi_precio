import type { ReactNode } from 'react'
import type { ListContent, PriceList } from '../../types'
import { Icon } from './crm/ui'
import { pencilTemplateDefaults } from '../menu/pencil'

export const inputClass =
  'mt-1 h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-sm text-[var(--dash-text)] outline-none transition focus:border-[var(--dash-link)] focus:ring-2 focus:ring-[var(--dash-link)]/20 disabled:opacity-50'
export const textareaClass = `${inputClass} h-auto min-h-20 py-2.5`

export const starterContent = (name: string): ListContent => ({
  schemaVersion: 1,
  hero: { title: name },
  blocks: [],
})

export const contentWithTemplateDefaults = (
  content: ListContent,
  list: PriceList,
  tenantDesign?: PriceList['design']
): ListContent => {
  const defaults = pencilTemplateDefaults(
    list.design || tenantDesign || 'store'
  )
  if (!defaults) return content
  return { ...content, template: { ...defaults, ...content.template } }
}

export function Field({
  label,
  wide = false,
  children,
}: {
  label: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <label
      className={`block text-xs font-bold text-[var(--dash-text2)] ${wide ? 'sm:col-span-2' : ''}`}
    >
      {label}
      {children}
    </label>
  )
}

export function PreviewToggle({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed right-6 top-1/2 z-30 hidden h-[112px] w-10 -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] py-3 text-xs font-bold text-[var(--dash-text)] shadow-[0_8px_22px_rgba(0,0,0,.12)] hover:bg-[var(--dash-soft)] xl:inline-flex"
      aria-label={open ? 'Ocultar vista previa' : 'Abrir vista previa'}
    >
      <Icon name={open ? 'chevron-right' : 'eye'} size={15} />
      <span className="[writing-mode:vertical-rl]">
        {open ? 'Ocultar preview' : 'Abrir preview'}
      </span>
    </button>
  )
}
