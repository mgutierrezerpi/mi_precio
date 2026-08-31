import { useOperationsT } from '../../customerUtils'
import { gradient } from '../../crm/theme'

export function OrderFormFooter({
  total,
  money,
  saving,
  isEdit,
  valid,
  onCancel,
  onSave,
}: {
  total: number
  money: (value: string | number) => string
  saving: boolean
  isEdit: boolean
  valid: boolean
  onCancel?: () => void
  onSave: () => void
}) {
  const t = useOperationsT()
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold text-[var(--dash-text)]">
        {t('orders.total', { total: money(total) })}
      </span>
      <div className="flex items-center gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-xl px-3 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-surface)]"
          >
            {t('common.cancel')}
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={!valid || saving}
          className={`h-9 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-50 ${gradient}`}
        >
          {saving
            ? t('common.saving')
            : isEdit
              ? t('common.saveChanges')
              : t('orders.record')}
        </button>
      </div>
    </div>
  )
}
