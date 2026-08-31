import { Icon } from './crm/ui'
import { gradient } from './crm/theme'
import { ProductCategoryDropdown } from './ProductCategoryDropdown'
import { ProductExportMenu } from './ProductExportMenu'
import { ProductFilterMenu } from './ProductFilterMenu'
import { ProductSortMenu } from './ProductSortMenu'
import type { Status, SortKey } from './productScreenTypes'
import { useCatalogT } from '../../lib/i18nDictionaryCatalog'

export function ProductToolbar({
  status,
  category,
  categories,
  sort,
  priceMin,
  priceMax,
  canEdit,
  count,
  scoped,
  onStatus,
  onCategory,
  onSort,
  onPriceMin,
  onPriceMax,
  onClear,
  onExcel,
  onPdf,
  onNew,
  reset,
}: {
  status: Status
  category: string
  categories: string[]
  sort: SortKey
  priceMin: string
  priceMax: string
  canEdit: boolean
  count: number
  scoped: boolean
  onStatus: (value: Status) => void
  onCategory: (value: string) => void
  onSort: (value: SortKey) => void
  onPriceMin: (value: string) => void
  onPriceMax: (value: string) => void
  onClear: () => void
  onExcel: () => void
  onPdf: () => void
  onNew: () => void
  reset: (action: () => void) => void
}) {
  const t = useCatalogT()
  return (
    <section className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ProductFilterMenu
          status={status}
          onStatus={(value) => reset(() => onStatus(value))}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceMin={(value) => reset(() => onPriceMin(value))}
          onPriceMax={(value) => reset(() => onPriceMax(value))}
          onClear={onClear}
        />
        <ProductCategoryDropdown
          value={category}
          options={categories}
          onChange={(value) => reset(() => onCategory(value))}
        />
        <ProductSortMenu sort={sort} onSort={onSort} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ProductExportMenu
          count={count}
          scoped={scoped}
          onExcel={onExcel}
          onPdf={onPdf}
        />
        {canEdit && (
          <button
            type="button"
            onClick={onNew}
            className={`flex h-[38px] w-full items-center justify-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white lg:w-auto lg:justify-start ${gradient}`}
          >
            <Icon name="plus" size={16} /> {t('products.new')}
          </button>
        )}
      </div>
    </section>
  )
}
