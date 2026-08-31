import { useState } from 'react'
import type { LinkTreeLink } from '../../../types'
import { Icon } from '../crm/ui'
import { LinkEditorFields } from './LinkEditorFields'

export function LinkEditor({
  link,
  index,
  total,
  onChange,
  onRemove,
  onMove,
  disabled,
}: {
  link: LinkTreeLink
  index: number
  total: number
  onChange: (link: LinkTreeLink) => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
  disabled: boolean
}) {
  const [isOpen, setIsOpen] = useState(!link.url)
  return (
    <article
      className={`overflow-hidden rounded-xl border bg-[var(--dash-bg)] transition-colors ${isOpen ? 'border-[var(--dash-link)]/45 shadow-sm' : 'border-[var(--dash-border)]'}`}
    >
      <div className="flex items-center gap-3 p-3.5">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="min-w-0 flex flex-1 items-center gap-3 text-left"
          aria-expanded={isOpen}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--dash-soft)] text-xs font-bold text-[var(--dash-link)]">
            {index + 1}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold text-[var(--dash-text)]">
              {link.title || 'Link sin título'}
            </span>
            <span className="block truncate text-xs text-[var(--dash-muted)]">
              {link.url || 'Agregá un destino'}
            </span>
          </span>
          {!link.enabled && (
            <span className="rounded-full bg-[var(--dash-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--dash-muted)]">
              Oculto
            </span>
          )}
          <Icon
            name={isOpen ? 'chevron-down' : 'chevron-right'}
            size={16}
            className="ml-auto shrink-0 text-[var(--dash-muted)]"
          />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled || index === 0}
            onClick={() => onMove(-1)}
            className="rounded-md p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] disabled:opacity-30"
            aria-label="Mover arriba"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={disabled || index === total - 1}
            onClick={() => onMove(1)}
            className="rounded-md p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] disabled:opacity-30"
            aria-label="Mover abajo"
          >
            ↓
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-30"
            aria-label="Eliminar link"
          >
            <Icon name="circle-x" size={15} />
          </button>
        </div>
      </div>
      {isOpen && (
        <LinkEditorFields link={link} onChange={onChange} disabled={disabled} />
      )}
    </article>
  )
}
