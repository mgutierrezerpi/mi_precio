import type { PriceList } from '../../types'
import type { TFn } from '../../lib/i18n'

export function ProductPriceLists({
  lists,
  selected,
  onToggle,
  onSelectAll,
  onClear,
  t,
}: {
  lists: PriceList[]
  selected: Set<string>
  onToggle: (id: string) => void
  onSelectAll: () => void
  onClear: () => void
  t: TFn
}) {
  return (
    <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--dash-text2)]">
            {t('products.applyPrice')}
          </p>
          <p className="mt-1 text-[12px] font-medium text-[var(--dash-muted)]">
            {t('products.priceListsHelp')}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-[12px] font-bold text-[var(--dash-link)]"
          >
            {t('products.allFemale')}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-[12px] font-bold text-[var(--dash-muted)]"
          >
            {t('products.none')}
          </button>
        </div>
      </div>
      <div className="mt-3 flex max-h-32 flex-col gap-2 overflow-auto pr-1">
        {lists.length === 0 ? (
          <p className="text-[12px] font-semibold text-[var(--dash-muted)]">
            {t('products.noLists')}
          </p>
        ) : (
          lists.map((list) => (
            <label
              key={list.id}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2"
            >
              <span className="text-[13px] font-bold text-[var(--dash-text)]">
                {list.name}
              </span>
              <input
                type="checkbox"
                checked={selected.has(list.id)}
                onChange={() => onToggle(list.id)}
                className="h-4 w-4 accent-[#7C3AED]"
              />
            </label>
          ))
        )}
      </div>
    </div>
  )
}
