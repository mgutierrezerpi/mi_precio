import type { Customer, Order, Product } from '../../../types'
import { useOperationsT, fullDate } from '../customerUtils'
import { ContactRow, Stat } from './shared'
import { PurchaseHistory } from './purchase_history'

export function DrawerContent({
  customer,
  products,
  money,
  orders,
  canEdit,
  adding,
  editingId,
  customerId,
  onToggleAdd,
  onEditOrder,
  onDeleteOrder,
  onSaved,
  onCancelEdit,
}: {
  customer: Customer
  products: Product[]
  money: (value: string | number) => string
  orders: Order[]
  canEdit: boolean
  adding: boolean
  editingId: string | null
  customerId: string
  onToggleAdd: () => void
  onEditOrder: (id: string) => void
  onDeleteOrder: (id: string) => void
  onSaved: () => Promise<void>
  onCancelEdit: () => void
}) {
  const t = useOperationsT()
  const average =
    customer.ordersCount > 0
      ? parseFloat(customer.totalSpent) / customer.ordersCount
      : 0
  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
      <div
        className={[
          'flex flex-col gap-2.5 rounded-2xl border border-[var(--dash-border)]',
          'bg-[var(--dash-surface)] p-4',
        ].join(' ')}
      >
        {customer.rut && (
          <ContactRow icon="file-spreadsheet" value={`RUT ${customer.rut}`} />
        )}
        <ContactRow
          icon="user"
          value={customer.email || t('customers.noEmail')}
        />
        <ContactRow
          icon="user-plus"
          value={customer.phone || t('customers.noPhone')}
        />
        {customer.notes && (
          <p className="rounded-xl bg-[var(--dash-soft)] p-3 text-xs font-medium text-[var(--dash-text2)]">
            {customer.notes}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat
          label={t('customers.purchases')}
          value={String(customer.ordersCount)}
        />
        <Stat
          label={t('customers.totalSpent')}
          value={money(customer.totalSpent)}
        />
        <Stat
          label={t('customers.lastPurchase')}
          value={fullDate(customer.lastOrderAt)}
        />
        <Stat label={t('customers.averageTicket')} value={money(average)} />
      </div>
      <PurchaseHistory
        customerId={customerId}
        products={products}
        money={money}
        orders={orders}
        canEdit={canEdit}
        adding={adding}
        editingId={editingId}
        onToggleAdd={onToggleAdd}
        onEdit={onEditOrder}
        onDelete={onDeleteOrder}
        onSaved={onSaved}
        onCancelEdit={onCancelEdit}
      />
    </div>
  )
}
