import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import { Icon } from './crm/ui'
import { Menu, MenuRow } from './ProductMenu'
import type { Status } from './productScreenTypes'

const filterInput =
  'h-9 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-soft)] px-2.5 text-[13px] font-medium text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]'

export function ProductFilterMenu({
  status,
  onStatus,
  priceMin,
  priceMax,
  onPriceMin,
  onPriceMax,
  onClear,
}: {
  status: Status
  onStatus: (value: Status) => void
  priceMin: string
  priceMax: string
  onPriceMin: (value: string) => void
  onPriceMax: (value: string) => void
  onClear: () => void
}) {
  const t = useCatalogT()
  const options: { key: Status; label: string }[] = [
    { key: 'all', label: t('products.all') },
    { key: 'available', label: t('products.availablePlural') },
    { key: 'unavailable', label: t('products.unavailablePlural') },
  ]
  const onlyDigits = (value: string) => value.replace(/[^\d]/g, '')
  return (
    <Menu icon="sliders-horizontal" label={t('products.filters')} width="w-64">
      {() => (
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 px-1 text-[11px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              {t('products.availability')}
            </p>
            {options.map((option) => (
              <MenuRow
                key={option.key}
                active={status === option.key}
                onClick={() => onStatus(option.key)}
              >
                {option.label}
              </MenuRow>
            ))}
          </div>
          <div>
            <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              {t('products.price')}
            </p>
            <div className="flex items-center gap-2 px-1">
              <input
                value={priceMin}
                onChange={(event) => onPriceMin(onlyDigits(event.target.value))}
                inputMode="numeric"
                placeholder={t('products.min')}
                className={filterInput}
              />
              <span className="text-[var(--dash-muted)]">–</span>
              <input
                value={priceMax}
                onChange={(event) => onPriceMax(onlyDigits(event.target.value))}
                inputMode="numeric"
                placeholder={t('products.max')}
                className={filterInput}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--dash-border)] text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
          >
            <Icon name="circle-x" size={15} /> {t('products.clearFilters')}
          </button>
        </div>
      )}
    </Menu>
  )
}
