import { Icon } from '../../crm/ui'
import { tone } from '../../crm/theme'
import { useOperationsT } from '../../customerUtils'

export function DrawerFooter({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  const t = useOperationsT()
  return (
    <div className="flex gap-2 border-t border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <button
        type="button"
        onClick={onEdit}
        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold"
        style={tone('violet')}
      >
        <Icon name="pencil" size={16} /> {t('customers.edit')}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold"
        style={tone('red')}
      >
        <Icon name="circle-x" size={16} /> {t('customers.delete')}
      </button>
    </div>
  )
}
