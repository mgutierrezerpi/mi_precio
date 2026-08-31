import type { Order, Product } from '../../../types'
import { Icon } from '../crm/ui'
import { useOperationsT } from '../customerUtils'
import { OrderLineFields } from './order_line_fields'
import { OrderFormFooter } from './parts/order_form_footer'
import { OrderReferenceField, OrderStatusFields } from './parts/order_form_meta'
import { useOrderForm } from './parts/use_order_form'

export function OrderForm({
  customerId,
  products,
  money,
  order,
  onSaved,
  onCancel,
}: {
  customerId: string
  products: Product[]
  money: (value: string | number) => string
  order?: Order
  onSaved: () => Promise<void>
  onCancel?: () => void
}) {
  const t = useOperationsT()
  const form = useOrderForm({ customerId, products, order, onSaved })
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-4">
      <OrderReferenceField
        value={form.reference}
        onChange={form.setReference}
      />
      <div className="flex flex-col gap-2">
        {form.lines.map((line, index) => (
          <OrderLineFields
            key={index}
            line={line}
            products={products}
            lineCount={form.lines.length}
            onChange={(patch) => form.setLine(index, patch)}
            onPickProduct={(value) => form.pickProduct(index, value)}
            onRemove={() => form.removeLine(index)}
          />
        ))}
        <button
          type="button"
          onClick={form.addLine}
          className="flex w-fit items-center gap-1.5 text-xs font-bold text-[var(--dash-link)]"
        >
          <Icon name="plus" size={14} /> {t('orders.addLine')}
        </button>
      </div>
      <OrderStatusFields
        status={form.status}
        note={form.note}
        onStatusChange={form.setStatus}
        onNoteChange={form.setNote}
      />
      <OrderFormFooter
        total={form.total}
        money={money}
        saving={form.saving}
        isEdit={form.isEdit}
        valid={form.valid}
        onCancel={onCancel}
        onSave={() => void form.save()}
      />
    </div>
  )
}
