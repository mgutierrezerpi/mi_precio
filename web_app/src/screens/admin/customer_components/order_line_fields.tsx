import type { Product } from '../../../types'
import { Icon } from '../crm/ui'
import { useOperationsT } from '../customerUtils'
import { CUSTOM, type Line } from './parts/order_types'
import { inputCls } from './shared'

export function OrderLineFields({
  line,
  products,
  lineCount,
  onChange,
  onPickProduct,
  onRemove,
}: {
  line: Line
  products: Product[]
  lineCount: number
  onChange: (patch: Partial<Line>) => void
  onPickProduct: (value: string) => void
  onRemove: () => void
}) {
  const t = useOperationsT()
  return (
    <div className="flex items-center gap-2">
      {line.custom ? (
        <input
          value={line.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={t('orders.product')}
          autoFocus
          className={`${inputCls} flex-1`}
        />
      ) : (
        <select
          value={line.name}
          onChange={(e) => onPickProduct(e.target.value)}
          className={`${inputCls} flex-1 ${line.name ? '' : 'text-[var(--dash-muted)]'}`}
        >
          <option value="">{t('orders.productSelect')}</option>
          {products.map((product) => (
            <option
              key={product.id}
              value={product.name}
              className="text-[var(--dash-text)]"
            >
              {product.name}
            </option>
          ))}
          <option value={CUSTOM} className="text-[var(--dash-text)]">
            {t('orders.custom')}
          </option>
        </select>
      )}
      <input
        value={line.quantity}
        onChange={(e) =>
          onChange({ quantity: e.target.value.replace(/\D/g, '') })
        }
        className={`${inputCls} w-14 text-center`}
      />
      <input
        value={line.unitPrice}
        onChange={(e) =>
          onChange({ unitPrice: e.target.value.replace(/[^\d.]/g, '') })
        }
        placeholder={t('orders.price')}
        className={`${inputCls} w-24`}
      />
      {lineCount > 1 ? (
        <button
          type="button"
          onClick={onRemove}
          title={t('orders.removeLine')}
          className={[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            'text-[var(--dash-muted)] hover:bg-[var(--dash-surface)]',
          ].join(' ')}
        >
          <Icon name="circle-x" size={16} />
        </button>
      ) : (
        <span className="h-9 w-9 shrink-0" />
      )}
    </div>
  )
}
