import type { Product } from '../../types'
import { localeOf, type TFn } from '../../lib/i18n'
import { Icon } from './crm/ui'
import { tone, gradient } from './crm/theme'
import { catTone, catIcon } from './crm/productFormat'
import { formatListPrice } from './PriceListEditorFields'

type ProductStepProps = {
  products: Product[]
  filteredProducts: Product[]
  selected: Set<string>
  allShown: boolean
  prodSearch: string
  setProdSearch: (value: string) => void
  tenantLanguage?: string
  t: TFn
  toggleAll: () => void
  toggleSel: (id: string) => void
  onCreateProduct: () => void
  changeStep: (next: 1 | 2) => void
  finalize: () => void
  saving: boolean
  editing: boolean
}

export function PriceListProductStep({
  products,
  filteredProducts,
  selected,
  allShown,
  prodSearch,
  setProdSearch,
  tenantLanguage,
  t,
  toggleAll,
  toggleSel,
  onCreateProduct,
  changeStep,
  finalize,
  saving,
  editing,
}: ProductStepProps) {
  return (
<div>
  <div className="mb-3 flex items-center gap-2">
    <label className="flex h-10 flex-1 items-center gap-2.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/15">
      <Icon
        name="search"
        size={16}
        className="text-[var(--dash-muted)]"
      />
      <input
        value={prodSearch}
        onChange={(e) => setProdSearch(e.target.value)}
        placeholder={t('pl.searchProducts')}
        className="min-w-0 flex-1 border-0 bg-transparent text-[13px] font-medium text-[var(--dash-text)] outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 placeholder:text-[var(--dash-muted)]"
      />
    </label>
    <button
      type="button"
                  onClick={onCreateProduct}
      className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-link)] hover:bg-[var(--dash-soft)]"
    >
      <Icon name="plus" size={14} /> {t('pl.newProduct')}
    </button>
    {filteredProducts.length > 0 && (
      <button
        type="button"
        onClick={toggleAll}
        className="h-10 shrink-0 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
      >
        {allShown ? t('pl.removeAll') : t('pl.selectAll')}
      </button>
    )}
  </div>

  <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
    {filteredProducts.length === 0 ? (
      <div className="flex h-32 items-center justify-center px-4 text-center text-sm font-medium text-[var(--dash-muted)]">
        {products.length === 0
          ? t('pl.noProducts')
          : t('pl.noProductResults')}
      </div>
    ) : (
      filteredProducts.map((p) => {
        const on = selected.has(p.id)
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => toggleSel(p.id)}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${on ? 'border-[#7C3AED] bg-[var(--dash-soft)]' : 'border-[var(--dash-border)] bg-[var(--dash-surface)] hover:bg-[var(--dash-soft)]'}`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${on ? `border-transparent text-white ${gradient}` : 'border-[#CBD5E1]'}`}
            >
              {on && <Icon name="circle-check" size={13} />}
            </span>
            {p.imageUrl ? (
              <img
                src={p.imageThumbUrl || p.imageUrl}
                alt=""
                className="h-9 w-9 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={tone(catTone(p.category))}
              >
                <Icon name={catIcon(p.category)} size={18} />
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">
                {p.name}
              </span>
              <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">
                {p.category || t('pl.noCategory')}
              </span>
            </div>
            <span className="shrink-0 text-[13px] font-extrabold text-[var(--dash-text)]">
              {formatListPrice(
                p.price,
                p.currency,
                          localeOf(tenantLanguage)
              )}
            </span>
          </button>
        )
      })
    )}
  </div>

  <div className="mt-5 flex items-center justify-between gap-3">
    <span className="text-xs font-semibold text-[var(--dash-muted)]">
      {selected.size === 1
        ? t('pl.selected', { count: selected.size })
        : t('pl.selectedPlural', { count: selected.size })}
    </span>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => changeStep(1)}
        className="flex h-11 items-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
      >
        <Icon name="chevron-left" size={16} /> {t('pl.back')}
      </button>
      <button
        type="button"
        onClick={finalize}
        disabled={saving}
        className={`flex h-11 items-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}
      >
        {saving
          ? t('pl.saving')
          : editing
            ? t('pl.saveChanges')
            : t('pl.create')}
      </button>
    </div>
  </div>
</div>
  )
}
