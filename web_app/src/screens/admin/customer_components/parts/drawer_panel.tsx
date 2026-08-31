import type { Customer, Order, Product } from '../../../../types'
import { useOperationsT } from '../../customerUtils'
import { CustomerModal } from '../customer_modal'
import { DrawerContent } from '../drawer_content'
import { DrawerFooter } from './drawer_footer'
import { DrawerHeader } from './drawer_header'

export function DrawerPanel({
  customer,
  loading,
  products,
  money,
  orders,
  canEdit,
  adding,
  editingId,
  customerId,
  editingCustomer,
  onClose,
  onDeleteCustomer,
  onToggleAdd,
  onEditOrder,
  onDeleteOrder,
  onSaved,
  onCancelEdit,
  onEditCustomer,
  onCloseEditCustomer,
}: {
  customer: Customer | null
  loading: boolean
  products: Product[]
  money: (value: string | number) => string
  orders: Order[]
  canEdit: boolean
  adding: boolean
  editingId: string | null
  customerId: string
  editingCustomer: boolean
  onClose: () => void
  onDeleteCustomer: () => void
  onToggleAdd: () => void
  onEditOrder: (id: string) => void
  onDeleteOrder: (id: string) => void
  onSaved: () => Promise<void>
  onCancelEdit: () => void
  onEditCustomer: () => void
  onCloseEditCustomer: () => void
}) {
  const t = useOperationsT()
  const reloadCustomer = async () => {
    onCloseEditCustomer()
    await onSaved()
  }
  return (
    <>
      <aside
        className={[
          'flex h-full w-[480px] max-w-full flex-col border-l',
          'border-[var(--dash-border)] bg-[var(--dash-bg)] shadow-2xl',
        ].join(' ')}
        onClick={(event) => event.stopPropagation()}
      >
        {loading || !customer ? (
          <div className="flex flex-1 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">
            {t('customers.profileLoading')}
          </div>
        ) : (
          <>
            <DrawerHeader customer={customer} onClose={onClose} />
            <DrawerContent
              customer={customer}
              products={products}
              money={money}
              orders={orders}
              canEdit={canEdit}
              adding={adding}
              editingId={editingId}
              customerId={customerId}
              onToggleAdd={onToggleAdd}
              onEditOrder={onEditOrder}
              onDeleteOrder={onDeleteOrder}
              onSaved={onSaved}
              onCancelEdit={onCancelEdit}
            />
            {canEdit && (
              <DrawerFooter
                onEdit={onEditCustomer}
                onDelete={onDeleteCustomer}
              />
            )}
          </>
        )}
      </aside>
      {editingCustomer && customer && (
        <CustomerModal
          customer={customer}
          onClose={onCloseEditCustomer}
          onSaved={reloadCustomer}
        />
      )}
    </>
  )
}
