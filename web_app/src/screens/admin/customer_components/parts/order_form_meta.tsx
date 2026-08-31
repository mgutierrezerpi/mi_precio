import { Icon } from '../../crm/ui'
import { useOperationsT } from '../../customerUtils'
import { inputCls } from '../shared'

export function OrderReferenceField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const t = useOperationsT()
  return (
    <div className="flex items-center gap-2">
      <Icon
        name="file-spreadsheet"
        size={15}
        className="shrink-0 text-[var(--dash-muted)]"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('orders.reference')}
        className={`${inputCls} flex-1`}
      />
    </div>
  )
}

export function OrderStatusFields({
  status,
  note,
  onStatusChange,
  onNoteChange,
}: {
  status: string
  note: string
  onStatusChange: (value: string) => void
  onNoteChange: (value: string) => void
}) {
  const t = useOperationsT()
  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className={`${inputCls} w-32`}
      >
        <option value="paid">{t('orders.paid')}</option>
        <option value="pending">{t('orders.pending')}</option>
        <option value="cancelled">{t('orders.cancelled')}</option>
      </select>
      <input
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        placeholder={t('orders.note')}
        className={`${inputCls} flex-1`}
      />
    </div>
  )
}
