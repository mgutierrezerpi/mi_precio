import { Toggle } from '../../components/appearance/ListAppearanceFields'
import type { TFn } from '../../lib/i18n'
import type { SettingsContext } from './SettingsCrmShared'

export function MarketplaceControl({
  canManage,
  enabled,
  save,
  saving,
  t,
}: {
  canManage: boolean
  enabled: boolean
  save: SettingsContext['save']
  saving: boolean
  t: TFn
}) {
  const toggle = () => {
    if (enabled) {
      void save({ marketplaceEnabled: false }, 'marketplace')
      return
    }
    if (!navigator.geolocation) {
      void save({ marketplaceEnabled: true }, 'marketplace')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void save(
          {
            marketplaceEnabled: true,
            marketplaceLatitude: position.coords.latitude,
            marketplaceLongitude: position.coords.longitude,
          },
          'marketplace'
        )
      },
      () => void save({ marketplaceEnabled: true }, 'marketplace'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 86400000 }
    )
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[var(--dash-link)]/30 bg-[var(--dash-soft)] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-bold text-[var(--dash-text)]">
          {t('set.marketplace.title')}
        </span>
        <span className="text-[11px] font-medium text-[var(--dash-muted)]">
          {t('set.marketplace.subtitle')}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`text-xs font-bold ${enabled ? 'text-[var(--tone-green-fg)]' : 'text-[var(--dash-muted)]'}`}
        >
          {saving
            ? t('common.saving')
            : enabled
              ? t('set.marketplace.listed')
              : t('set.marketplace.hidden')}
        </span>
        <Toggle on={enabled} onClick={toggle} disabled={!canManage || saving} />
      </div>
    </div>
  )
}
