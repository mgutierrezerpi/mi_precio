import type { Order } from '../../../types'
import { Icon } from '../crm/ui'
import { tone, type Tone } from '../crm/theme'
import { useOperationsT, fullDate } from '../customerUtils'
import { OrderItems } from './parts/order_items'

export function OrderCard({
  order,
  money,
  canEdit,
  onEdit,
  onDelete,
}: {
  order: Order
  money: (v: string | number) => string
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const t = useOperationsT()
  const labels: Record<string, { label: string; tone: Tone }> = {
    paid: { label: t('orders.paid'), tone: 'green' },
    pending: { label: t('orders.pending'), tone: 'amber' },
    cancelled: { label: t('orders.cancelled'), tone: 'slate' },
  }
  const status = labels[order.status] || labels.paid
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <div className="flex items-start justify-between">
        {order.reference ? (
          <div className="flex items-center gap-1.5 text-[var(--dash-link)]">
            <Icon name="file-spreadsheet" size={15} />
            <span className="text-[17px] font-black leading-none">
              #{order.reference}
            </span>
          </div>
        ) : (
          <span />
        )}
        {canEdit && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              title={t('orders.edit')}
              className={[
                'flex h-7 w-7 items-center justify-center rounded-lg',
                'text-[var(--dash-muted)] hover:bg-[var(--dash-soft)]',
                'hover:text-[var(--dash-link)]',
              ].join(' ')}
            >
              <Icon name="pencil" size={14} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title={t('orders.delete')}
              className={[
                'flex h-7 w-7 items-center justify-center rounded-lg',
                'text-[var(--dash-muted)] hover:bg-[var(--dash-soft)]',
                'hover:text-[var(--tone-red-fg)]',
              ].join(' ')}
            >
              <Icon name="circle-x" size={15} />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-[13px] font-bold text-[var(--dash-text)]">
            {fullDate(order.createdAt)}
          </span>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={tone(status.tone)}
          >
            {status.label}
          </span>
        </div>
        <span className="text-[15px] font-extrabold text-[var(--dash-text)]">
          {money(order.total)}
        </span>
      </div>
      {order.items.length > 0 && (
        <OrderItems items={order.items} money={money} />
      )}
      {order.note && (
        <p className="text-xs font-medium text-[var(--dash-muted)]">
          {order.note}
        </p>
      )}
    </div>
  )
}
