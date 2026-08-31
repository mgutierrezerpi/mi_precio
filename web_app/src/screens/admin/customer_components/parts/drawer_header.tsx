import type { Customer } from '../../../../types'
import { Icon } from '../../crm/ui'
import { tone } from '../../crm/theme'
import {
  avatarTone,
  initials,
  statusLabel,
  statusOf,
  statusTone,
  useOperationsT,
} from '../../customerUtils'

export function DrawerHeader({
  customer,
  onClose,
}: {
  customer: Customer
  onClose: () => void
}) {
  const t = useOperationsT()
  const status = statusOf(customer)
  return (
    <div className="flex items-start gap-3 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold"
        style={tone(avatarTone(customer.name))}
      >
        {initials(customer.name)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="truncate text-xl font-extrabold text-[var(--dash-text)]">
          {customer.name}
        </h3>
        <span
          className="w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold"
          style={tone(statusTone[status])}
        >
          {statusLabel(status, t)}
        </span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className={[
          'flex h-9 w-9 items-center justify-center rounded-lg',
          'text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]',
        ].join(' ')}
      >
        <Icon name="circle-x" size={20} />
      </button>
    </div>
  )
}
