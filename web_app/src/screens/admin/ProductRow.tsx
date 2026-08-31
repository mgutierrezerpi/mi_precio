import type { Product } from '../../types'
import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import { tone } from './crm/theme'
import { catIcon, catTone, displayCategory } from './crm/productFormat'
import { Icon } from './crm/ui'
import { parseUtcDate } from './productScreenUtils'
import { AvailabilitySwitch } from './ProductAvailability'
import { Checkbox } from './ProductTableParts'
import { RowMenu } from './ProductRowMenu'

export function ProductRow({
  product,
  index,
  selected,
  canEdit,
  locale,
  formatPrice,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
}: {
  product: Product
  index: number
  selected: boolean
  canEdit: boolean
  locale: string
  formatPrice: (price: string) => string
  onSelect: () => void
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const t = useCatalogT()
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
    parseUtcDate(product.updatedAt)
  )
  const availability = canEdit ? (
    <AvailabilitySwitch value={product.available} onToggle={onToggle} />
  ) : (
    <span
      className="rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={tone(product.available ? 'green' : 'red')}
    >
      {product.available ? t('products.available') : t('products.unavailable')}
    </span>
  )
  return (
    <div
      className={`flex min-w-0 flex-col gap-3 px-4 py-4 lg:min-w-[720px] lg:flex-row lg:items-center lg:gap-2 lg:px-5 ${selected ? 'bg-[var(--dash-soft)]' : 'bg-[var(--dash-surface)]'} ${index > 0 ? 'border-t border-[var(--dash-divider)]' : ''}`}
    >
      <div className="flex min-w-0 items-start gap-3 lg:contents">
        <span className="w-9 shrink-0">
          <Checkbox checked={selected} onChange={onSelect} />
        </span>
        <div className="flex min-w-0 flex-1 items-start gap-3 lg:items-center">
          {product.imageUrl ? (
            <img
              src={product.imageThumbUrl || product.imageUrl}
              alt={product.name}
              className="h-10 w-10 shrink-0 rounded-[10px] object-cover"
            />
          ) : (
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
              style={tone(catTone(product.category))}
            >
              <Icon name={catIcon(product.category)} size={20} />
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <span
              title={product.name}
              className="line-clamp-2 break-words text-sm font-bold leading-5 text-[var(--dash-text)]"
            >
              {product.name}
            </span>
            <span className="line-clamp-2 text-xs font-medium text-[var(--dash-muted)] lg:truncate">
              {product.description || '—'}
            </span>
          </div>
          {canEdit && (
            <div className="shrink-0 lg:hidden">
              <RowMenu onEdit={onEdit} onDelete={onDelete} />
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-9 text-xs sm:grid-cols-3 lg:hidden">
        <Info label="SKU">
          <span className="truncate font-semibold text-[var(--dash-text2)]">
            {product.sku || '—'}
          </span>
        </Info>
        <Info label={t('products.category')}>
          {product.category ? (
            <span
              className="inline-flex max-w-full w-fit truncate rounded-full px-2 py-1 text-[11px] font-bold"
              style={tone(catTone(product.category))}
            >
              {displayCategory(product.category)}
            </span>
          ) : (
            <span className="font-medium text-[var(--dash-muted)]">
              {t('products.noCategory')}
            </span>
          )}
        </Info>
        <Info label={t('products.price')}>
          <span className="font-extrabold text-[var(--dash-text)]">
            {formatPrice(product.price)}
          </span>
        </Info>
        <Info label={t('products.availability')}>{availability}</Info>
        <Info label={t('products.updated')}>
          <span className="truncate font-medium text-[var(--dash-muted)]">
            {date}
          </span>
        </Info>
      </div>
      <span className="hidden w-[90px] text-xs font-semibold text-[var(--dash-text2)] lg:block">
        {product.sku || '—'}
      </span>
      <span className="hidden w-[115px] lg:block">
        {product.category ? (
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={tone(catTone(product.category))}
          >
            {displayCategory(product.category)}
          </span>
        ) : (
          <span className="text-[11px] font-medium text-[var(--dash-muted)]">
            {t('products.noCategory')}
          </span>
        )}
      </span>
      <span className="hidden w-[100px] text-sm font-extrabold text-[var(--dash-text)] lg:block">
        {formatPrice(product.price)}
      </span>
      <span className="hidden w-[145px] lg:block">{availability}</span>
      <span className="hidden w-[105px] text-xs font-medium text-[var(--dash-muted)] lg:block">
        {date}
      </span>
      {canEdit ? (
        <span className="hidden shrink-0 lg:block">
          <RowMenu onEdit={onEdit} onDelete={onDelete} />
        </span>
      ) : (
        <span className="hidden w-8 shrink-0 lg:block" />
      )}
    </div>
  )
}

function Info({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
        {label}
      </span>
      {children}
    </span>
  )
}
