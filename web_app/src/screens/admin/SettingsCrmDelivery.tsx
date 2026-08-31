import { Toggle } from '../../components/appearance/ListAppearanceFields'
import type { TFn } from '../../lib/i18n'

export function DeliveryControl({
  canManage,
  onToggle,
  t,
  value,
}: {
  canManage: boolean
  onToggle: () => void
  t: TFn
  value: boolean
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[var(--dash-border)] p-4">
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-bold text-[var(--dash-text)]">
          {t('set.region.delivery')}
        </span>
        <span className="text-[11px] font-medium text-[var(--dash-muted)]">
          {t('set.region.deliverySub')}
        </span>
      </div>
      <Toggle on={value} disabled={!canManage} onClick={onToggle} />
    </div>
  )
}
