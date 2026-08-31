import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  logout,
  selectIsAdmin,
  selectIsOwner,
  selectTenant,
  selectUser,
  setTenant,
} from '../../store/slices/authSlice'
import api from '../../services/api'
import { useT } from '../../lib/i18n'
import { CrmLayout } from './crm/CrmLayout'
import { Icon } from './crm/ui'
import { InfoSection, BrandSection } from './SettingsCrmInfoBrand'
import { NotificationsSection } from './SettingsCrmNotifications'
import { RegionSection } from './SettingsCrmRegion'
import { SecuritySection } from './SettingsCrmSecurity'
import { DeleteSection } from './SettingsCrmDelete'
import { BillingSection } from './SettingsCrmBilling'
import { SettingsNav, settingsSections } from './SettingsCrmNav'

export function SettingsCrmScreen() {
  const t = useT()
  return (
    <CrmLayout
      active="Configuración"
      title={t('nav.settings')}
      subtitle={t('set.subtitle')}
      hideContext
      searchPlaceholder={t('common.search')}
    >
      <main className="flex min-h-full flex-col gap-4 px-4 py-6 md:px-10 md:py-8">
        <section className="flex min-h-[60px] flex-col justify-center gap-1">
          <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">
            {t('nav.settings')}
          </h1>
          <p className="text-[13px] text-[#9694A6]">{t('set.subtitle')}</p>
        </section>
        <SettingsCrmContent />
      </main>
    </CrmLayout>
  )
}

export function SettingsCrmContent({ simple = false }: { simple?: boolean }) {
  const dispatch = useAppDispatch()
  const t = useT()
  const tenant = useAppSelector(selectTenant)
  const user = useAppSelector(selectUser)
  const canManage = useAppSelector(selectIsAdmin)
  const isOwner = useAppSelector(selectIsOwner)
  const [searchParams] = useSearchParams()
  const sections = settingsSections()
  const [active, setActive] = useState(() => {
    const selected = searchParams.get('section')
    return sections.some((section) => section.key === selected)
      ? selected!
      : sections[0].key
  })
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const save = async (
    patch: Parameters<typeof api.updateTenant>[1],
    key: string
  ) => {
    if (!tenant?.id) return
    setSavingKey(key)
    setError(null)
    const res = await api.updateTenant(tenant.id, patch)
    setSavingKey(null)
    if (res.error) setError(res.error)
    else if (res.data) {
      dispatch(setTenant(res.data))
      setSavedKey(key)
      setTimeout(() => setSavedKey((value) => (value === key ? null : value)), 2000)
    }
  }

  const context = { tenant, canManage, save, savingKey, savedKey, t }
  const panelClass = simple
    ? 'flex min-w-0 flex-1 flex-col gap-5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 sm:p-5'
    : 'flex min-w-0 flex-1 flex-col gap-5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5'

  return (
    <div
      className={
        simple
          ? 'flex w-full flex-col gap-4 md:flex-row md:gap-6'
          : 'flex w-full flex-col gap-4 xl:min-w-[900px] lg:flex-row'
      }
    >
      <SettingsNav active={active} onSelect={setActive} simple={simple} t={t} />
      <div className={panelClass}>
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--tone-red-fg)]/40 bg-[var(--tone-red-bg)] px-4 py-3 text-sm font-semibold text-[var(--tone-red-fg)]">
            <Icon name="alert-triangle" size={16} /> {error}
          </div>
        )}
        {!canManage && !['security', 'delete', 'notifications'].includes(active) && (
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
            <Icon name="alert-triangle" size={15} /> {t('set.onlyAdmins')}
          </div>
        )}
        {active === 'info' && <InfoSection {...context} />}
        {active === 'brand' && <BrandSection {...context} />}
        {active === 'notifications' && <NotificationsSection tenantId={tenant?.id} />}
        {active === 'region' && <RegionSection {...context} />}
        {active === 'security' && (
          <SecuritySection
            t={t}
            user={user}
            onLogout={() => dispatch(logout())}
          />
        )}
        {active === 'billing' && (
          <BillingSection
            key={tenant?.id ?? 'no_tenant'}
            t={t}
            tenant={tenant}
            isOwner={isOwner}
          />
        )}
        {active === 'delete' && (
          <DeleteSection t={t} tenant={tenant} isOwner={isOwner} />
        )}
      </div>
    </div>
  )
}

export default SettingsCrmScreen
