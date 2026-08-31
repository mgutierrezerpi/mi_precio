import { useRef, useState } from 'react'
import api from '../../services/api'
import type { SettingsContext } from './SettingsCrmShared'
import { SectionHeader } from './SettingsCrmShared'
import { useInfoFields } from './SettingsCrmInfoState'
import { InfoDetailsFields } from './SettingsCrmInfoDetails'
import { InfoLogoField } from './SettingsCrmInfoLogo'
import { PublicUrlField } from './SettingsCrmInfoPublicUrl'

export function InfoSection({
  t,
  tenant,
  canManage,
  save,
  savingKey,
  savedKey,
}: SettingsContext) {
  const { fields, setLogo, touch } = useInfoFields(tenant, canManage, save)
  const { name, subdomain, taxId, logo } = fields
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const publicUrl = `${window.location.origin}/p/${subdomain || ''}`

  const pickLogo = async (file?: File) => {
    if (!file || !tenant) return
    const response = await api.uploadTenantLogo(tenant.id, file)
    if (!response.data) return
    touch()
    setLogo(response.data.url)
  }
  const copyUrl = () => {
    navigator.clipboard?.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <SectionHeader
        t={t}
        title={t('set.sec.info')}
        subtitle={t('set.info.subtitle')}
        canManage={canManage}
        autosave
        saving={savingKey === 'info'}
        saved={savedKey === 'info'}
      />
      <InfoLogoField
        canManage={canManage}
        fileRef={fileRef}
        logo={logo}
        onPick={pickLogo}
        onRemove={() => {
          touch()
          setLogo(null)
        }}
        t={t}
      />
      <InfoDetailsFields
        canManage={canManage}
        name={name}
        onChange={touch}
        setName={fields.setName}
        setSubdomain={fields.setSubdomain}
        setTaxId={fields.setTaxId}
        subdomain={subdomain}
        t={t}
        taxId={taxId}
      />
      <PublicUrlField copied={copied} onCopy={copyUrl} t={t} url={publicUrl} />
    </>
  )
}
