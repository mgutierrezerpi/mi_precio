import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import { tone } from './crm/theme'
import { Icon } from './crm/ui'

export function AvailabilitySwitch({
  value,
  onToggle,
}: {
  value: boolean
  onToggle: () => void
}) {
  const t = useCatalogT()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-[#10B981]' : 'bg-[var(--dash-border)]'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${value ? 'left-[22px]' : 'left-0.5'}`}
        />
      </span>
      <span
        className={`text-[11px] font-bold ${value ? 'text-[#10B981]' : 'text-[var(--dash-muted)]'}`}
      >
        {value ? t('products.available') : t('products.unavailable')}
      </span>
    </button>
  )
}

export function EmptyProductState({ hasProducts }: { hasProducts: boolean }) {
  const t = useCatalogT()
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={tone('violet')}
      >
        <Icon name="package" size={24} />
      </span>
      <p className="text-sm font-semibold text-[var(--dash-text)]">
        {hasProducts ? t('products.emptyFiltered') : t('products.empty')}
      </p>
    </div>
  )
}
