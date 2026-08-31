import { useEffect, useRef, useState } from 'react'
import { useT } from '../../lib/i18n'
import { MarketplaceProfileFields } from './SettingsCrmMarketplace'
import { MarketplaceControl } from './SettingsCrmMarketplaceControl'
import { DeliveryControl } from './SettingsCrmDelivery'
import { RegionFields } from './SettingsCrmRegionFields'
import { SectionHeader, type SettingsContext } from './SettingsCrmShared'

export function RegionSection({
  tenant,
  canManage,
  save,
  savingKey,
  savedKey,
}: SettingsContext) {
  const t = useT()
  const [currency, setCurrency] = useState(tenant?.currency ?? 'UYU')
  const [language, setLanguage] = useState(tenant?.language ?? 'es')
  const [timezone, setTimezone] = useState(
    tenant?.timezone ?? 'America/Montevideo'
  )
  const [deliveryEnabled, setDeliveryEnabled] = useState(
    tenant?.deliveryEnabled ?? false
  )
  const [businessCategory, setBusinessCategory] = useState(
    tenant?.businessCategory ?? ''
  )
  const touched = useRef(false)

  useEffect(() => {
    if (!canManage || !touched.current) return
    const timer = setTimeout(() => {
      touched.current = false
      void save(
        {
          currency,
          language,
          timezone,
          deliveryEnabled,
          businessCategory: businessCategory || null,
        },
        'region'
      )
    }, 500)
    return () => clearTimeout(timer)
  }, [
    currency,
    language,
    timezone,
    deliveryEnabled,
    businessCategory,
    canManage,
    save,
  ])

  const markChanged = () => {
    touched.current = true
  }

  return (
    <>
      <SectionHeader
        t={t}
        title={t('set.sec.region')}
        subtitle={t('set.region.subtitle')}
        canManage={canManage}
        autosave
        saving={savingKey === 'region'}
        saved={savedKey === 'region'}
      />
      <RegionFields
        businessCategory={businessCategory}
        canManage={canManage}
        currency={currency}
        language={language}
        onChange={markChanged}
        setBusinessCategory={setBusinessCategory}
        setCurrency={setCurrency}
        setLanguage={setLanguage}
        setTimezone={setTimezone}
        t={t}
        timezone={timezone}
      />
      <DeliveryControl
        canManage={canManage}
        onToggle={() => {
          markChanged()
          setDeliveryEnabled((value) => !value)
        }}
        t={t}
        value={deliveryEnabled}
      />
      <MarketplaceProfileFields
        tenant={tenant}
        canManage={canManage}
        save={save}
        savingKey={savingKey}
        savedKey={savedKey}
        t={t}
      />
      <MarketplaceControl
        canManage={canManage}
        enabled={tenant?.marketplaceEnabled ?? false}
        save={save}
        saving={savingKey === 'marketplace'}
        t={t}
      />
    </>
  )
}
