import type { SettingsContext } from './SettingsCrmShared'
import { SectionHeader } from './SettingsCrmShared'
import { useBrandIdentity } from './SettingsCrmBrandState'
import { useAppearanceEditor } from './SettingsCrmAppearanceState'
import { BrandIdentityFields } from './SettingsCrmBrandIdentity'
import { BrandPreview } from './SettingsCrmBrandPreview'
import { AppearanceFields } from './SettingsCrmAppearanceFields'

export function BrandSection({
  t,
  tenant,
  canManage,
  save,
  savingKey,
  savedKey,
}: SettingsContext) {
  const identity = useBrandIdentity(tenant, canManage, save)
  const editor = useAppearanceEditor(tenant, canManage, save)

  return (
    <>
      <SectionHeader
        t={t}
        title={t('set.sec.brand')}
        subtitle={t('set.brand.subtitle')}
        canManage={canManage}
        autosave
        saving={savingKey === 'brand' || editor.saving}
        saved={savedKey === 'brand' || editor.saved}
      />
      <BrandIdentityFields {...identity} canManage={canManage} t={t} />
      <BrandPreview
        color={identity.color}
        description={identity.description}
        tenant={tenant}
        t={t}
      />
      <AppearanceFields
        {...editor}
        accent={identity.color}
        canManage={canManage}
        t={t}
      />
    </>
  )
}
