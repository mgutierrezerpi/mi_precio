import type { Order, Product } from '../../../types'
import { Icon } from '../crm/ui'
import { tone } from '../crm/theme'
import { useOperationsT } from '../customerUtils'
import { OrderCard } from './order_card'
import { OrderForm } from './order_form'

export function PurchaseHistory({
  customerId,
  products,
  money,
  orders,
  canEdit,
  adding,
  editingId,
  onToggleAdd,
  onEdit,
  onDelete,
  onSaved,
  onCancelEdit,
}: {
  customerId: string
  products: Product[]
  money: (value: string | number) => string
  orders: Order[]
  canEdit: boolean
  adding: boolean
  editingId: string | null
  onToggleAdd: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onSaved: () => Promise<void>
  onCancelEdit: () => void
}) {
  const t = useOperationsT()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-extrabold text-[var(--dash-text)]">
          {t('customers.purchaseHistory')}
        </h4>
        {canEdit && (
          <button
            type="button"
            onClick={onToggleAdd}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold"
            style={tone('violet')}
          >
            <Icon name={adding ? 'circle-x' : 'plus'} size={14} />{' '}
            {adding ? t('common.cancel') : t('customers.recordPurchase')}
          </button>
        )}
      </div>
      {adding && canEdit && (
        <OrderForm
          customerId={customerId}
          products={products}
          money={money}
          onSaved={onSaved}
        />
      )}
      {orders.length === 0 && !adding ? (
        <EmptyHistory />
      ) : (
        orders.map((order) =>
          editingId === order.id ? (
            <OrderForm
              key={order.id}
              customerId={customerId}
              products={products}
              money={money}
              order={order}
              onCancel={onCancelEdit}
              onSaved={onSaved}
            />
          ) : (
            <OrderCard
              key={order.id}
              order={order}
              money={money}
              canEdit={canEdit}
              onEdit={() => onEdit(order.id)}
              onDelete={() => onDelete(order.id)}
            />
          )
        )
      )}
    </div>
  )
}

function EmptyHistory() {
  const t = useOperationsT()
  return (
    <div
      className={[
        'flex flex-col items-center gap-1 rounded-2xl border border-dashed',
        'border-[var(--dash-border)] py-10 text-center',
      ].join(' ')}
    >
      <Icon
        name="file-spreadsheet"
        size={22}
        className="text-[var(--dash-muted)]"
      />
      <p className="text-sm font-semibold text-[var(--dash-text)]">
        {t('customers.noPurchases')}
      </p>
      <p className="text-xs font-medium text-[var(--dash-muted)]">
        {t('customers.firstPurchase')}
      </p>
    </div>
  )
}
