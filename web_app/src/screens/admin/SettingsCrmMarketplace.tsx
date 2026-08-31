import { useEffect, useRef, useState } from 'react'
import { Field, inputClass, SectionHeader, type SettingsContext } from './SettingsCrmShared'

export function MarketplaceProfileFields({
  tenant,
  canManage,
  save,
  savingKey,
  savedKey,
  t,
}: SettingsContext) {
  const [address, setAddress] = useState(tenant?.address ?? '')
  const [whatsappUrl, setWhatsappUrl] = useState(tenant?.whatsappUrl ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(tenant?.websiteUrl ?? '')
  const [instagramUrl, setInstagramUrl] = useState(tenant?.instagramUrl ?? '')
  const touched = useRef(false)

  useEffect(() => {
    if (!canManage || !touched.current) return
    const timer = setTimeout(() => {
      touched.current = false
      void save(
        {
          address: address.trim() || null,
          whatsappUrl: whatsappUrl.trim() || null,
          websiteUrl: websiteUrl.trim() || null,
          instagramUrl: instagramUrl.trim() || null,
        },
        'marketplace-profile'
      )
    }, 500)
    return () => clearTimeout(timer)
  }, [address, whatsappUrl, websiteUrl, instagramUrl, canManage, save])

  const onChange = (setter: (value: string) => void, value: string) => {
    touched.current = true
    setter(value)
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-5">
      <SectionHeader
        t={t}
        title={t('set.marketplace.profileTitle')}
        subtitle={t('set.marketplace.profileSubtitle')}
        canManage={canManage}
        autosave
        saving={savingKey === 'marketplace-profile'}
        saved={savedKey === 'marketplace-profile'}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('set.marketplace.address')}>
          <textarea
            value={address}
            onChange={(event) => onChange(setAddress, event.target.value)}
            disabled={!canManage}
            rows={2}
            placeholder={t('set.marketplace.addressPlaceholder')}
            className={`${inputClass} h-auto py-2.5`}
          />
        </Field>
        <Field label={t('set.marketplace.whatsapp')}>
          <input
            value={whatsappUrl}
            onChange={(event) => onChange(setWhatsappUrl, event.target.value)}
            disabled={!canManage}
            type="url"
            placeholder="https://wa.me/598..."
            className={inputClass}
          />
        </Field>
        <Field label={t('set.marketplace.website')}>
          <input
            value={websiteUrl}
            onChange={(event) => onChange(setWebsiteUrl, event.target.value)}
            disabled={!canManage}
            type="url"
            placeholder="https://tusitio.com"
            className={inputClass}
          />
        </Field>
        <Field label={t('set.marketplace.instagram')}>
          <input
            value={instagramUrl}
            onChange={(event) => onChange(setInstagramUrl, event.target.value)}
            disabled={!canManage}
            type="url"
            placeholder="https://instagram.com/tu-negocio"
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  )
}
