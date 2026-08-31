import type { PriceList } from '../../types'
import type { TFn } from '../../lib/i18n'
import { hasOwnAppearance, type ListAppearance } from '../../lib/listAppearance'
import { ListAppearanceFields } from '../../components/appearance/ListAppearanceFields'
import { Field, inputCls } from './SettingsCrmShared'

export function AppearanceFields({
  accent,
  appearance,
  canManage,
  changeAppearance,
  editingTenant,
  lists,
  pickTarget,
  t,
  targetId,
  tenantDefaults,
}: {
  accent: string
  appearance: ListAppearance
  canManage: boolean
  changeAppearance: (patch: Partial<ListAppearance>) => void
  editingTenant: boolean
  lists: PriceList[]
  pickTarget: (id: string) => void
  t: TFn
  targetId: string
  tenantDefaults: ListAppearance
}) {
  return (
    <>
      <Field label={t('list.appearance.applyTo')}>
        <select
          value={targetId}
          disabled={!canManage}
          onChange={(e) => pickTarget(e.target.value)}
          className={inputCls}
        >
          <option value="">{t('list.appearance.tenantDefault')}</option>
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
              {hasOwnAppearance(list)
                ? ` · ${t('list.appearance.custom')}`
                : ''}
            </option>
          ))}
        </select>
      </Field>
      <ListAppearanceFields
        t={t}
        value={appearance}
        onChange={changeAppearance}
        accent={accent}
        inherited={editingTenant ? undefined : tenantDefaults}
        disabled={!canManage}
      />
    </>
  )
}
