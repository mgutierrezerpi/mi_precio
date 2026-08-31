import { useEffect, useState } from 'react'
import type { NotifPrefs } from '../../types'
import api from '../../services/api'
import { useT } from '../../lib/i18n'
import { Toggle } from '../../components/appearance/ListAppearanceFields'
import { Icon } from './crm/ui'
import { SectionHeader } from './SettingsCrmShared'
import { DeviceNotifications } from './SettingsCrmDeviceNotifications'

const NOTIFICATION_ROWS: {
  key: keyof NotifPrefs
  tKey: string
  descKey: string
}[] = [
  { key: 'sales', tKey: 'set.notif.sales', descKey: 'set.notif.salesDesc' },
  {
    key: 'catalog',
    tKey: 'set.notif.catalog',
    descKey: 'set.notif.catalogDesc',
  },
  {
    key: 'customers',
    tKey: 'set.notif.customers',
    descKey: 'set.notif.customersDesc',
  },
  { key: 'team', tKey: 'set.notif.team', descKey: 'set.notif.teamDesc' },
]

export function NotificationsSection({ tenantId }: { tenantId?: string }) {
  const t = useT()
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null)

  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    api.getNotifications(tenantId).then((res) => {
      if (!cancelled && res.data) setPrefs(res.data.prefs)
    })
    return () => {
      cancelled = true
    }
  }, [tenantId])

  const toggle = (key: keyof NotifPrefs) => {
    if (!prefs || !tenantId) return
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    void api.updateNotifPrefs(tenantId, { [key]: next[key] })
  }

  return (
    <>
      <SectionHeader
        t={t}
        title={t('set.sec.notifications')}
        subtitle={t('set.notif.subtitle')}
        canManage={false}
      />
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
        <Icon name="bell" size={15} /> {t('set.notif.banner')}
      </div>
      <DeviceNotifications t={t} tenantId={tenantId} />
      <div className="flex flex-col divide-y divide-[var(--dash-divider)] rounded-2xl border border-[var(--dash-border)]">
        {NOTIFICATION_ROWS.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-4 px-4 py-3.5"
          >
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[var(--dash-text)]">
                {t(row.tKey)}
              </span>
              <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                {t(row.descKey)}
              </span>
            </div>
            <Toggle
              on={prefs?.[row.key] ?? true}
              disabled={!prefs}
              onClick={() => toggle(row.key)}
            />
          </div>
        ))}
      </div>
    </>
  )
}
