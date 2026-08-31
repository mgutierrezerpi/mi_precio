import type { Product } from '../../types'
import type { TFn } from '../../lib/i18n'
import { ProductRow } from './ProductRow'
import { ProductTableHeader } from './ProductTableHeader'
import { EmptyProductState } from './ProductAvailability'

export function ProductTable({
  products,
  loading,
  hasProducts,
  selected,
  allSelected,
  someSelected,
  canEdit,
  locale,
  formatPrice,
  onSelectAll,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
  t,
}: {
  products: Product[]
  loading: boolean
  hasProducts: boolean
  selected: Set<string>
  allSelected: boolean
  someSelected: boolean
  canEdit: boolean
  locale: string
  formatPrice: (value: string) => string
  onSelectAll: () => void
  onSelect: (id: string) => void
  onToggle: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  t: TFn
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
      <ProductTableHeader
        checked={allSelected}
        indeterminate={someSelected && !allSelected}
        onChange={onSelectAll}
      />
      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">
          {t('products.loading')}
        </div>
      ) : products.length === 0 ? (
        <EmptyProductState hasProducts={hasProducts} />
      ) : (
        products.map((product, index) => (
          <ProductRow
            key={product.id}
            product={product}
            index={index}
            selected={selected.has(product.id)}
            canEdit={canEdit}
            locale={locale}
            formatPrice={formatPrice}
            onSelect={() => onSelect(product.id)}
            onToggle={() => onToggle(product)}
            onEdit={() => onEdit(product)}
            onDelete={() => onDelete(product)}
          />
        ))
      )}
    </div>
  )
}
