import { useEffect, useRef, useState } from 'react'
import { Icon } from './crm/ui'
import { displayCategory } from './crm/productFormat'
import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import { MenuRow } from './ProductMenu'

export function ProductCategoryDropdown({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const t = useCatalogT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const label =
    value === 'all' ? t('products.allCategories') : displayCategory(value)
  const select = (next: string) => {
    onChange(next)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-text2)]"
      >
        <Icon name="tags" size={14} className="text-[var(--dash-link)]" />{' '}
        {label}
        <Icon
          name="chevron-down"
          size={14}
          className={`text-[var(--dash-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`absolute right-0 top-[calc(100%+6px)] z-40 max-h-64 w-52 origin-top-right overflow-y-auto rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1.5 shadow-[0_16px_44px_-12px_rgba(15,23,42,0.3)] transition-all duration-150 ${open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
      >
        <MenuRow active={value === 'all'} onClick={() => select('all')}>
          {t('products.allCategories')}
        </MenuRow>
        {options.map((option) => (
          <MenuRow
            key={option}
            active={value === option}
            onClick={() => select(option)}
          >
            {displayCategory(option)}
          </MenuRow>
        ))}
      </div>
    </div>
  )
}
