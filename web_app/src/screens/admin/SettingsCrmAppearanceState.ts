import { useEffect, useState } from 'react'
import type { PriceList, Tenant } from '../../types'
import api from '../../services/api'
import type { ListAppearance } from '../../lib/listAppearance'
import type { SettingsContext } from './SettingsCrmShared'
import { listAppearance, tenantAppearance } from './SettingsCrmAppearanceUtils'

export function useAppearanceEditor(
  tenant: Tenant | null,
  canManage: boolean,
  save: SettingsContext['save']
) {
  const [targetId, setTargetId] = useState('')
  const [lists, setLists] = useState<PriceList[]>([])
  const [appearance, setAppearance] = useState<ListAppearance>(() =>
    tenantAppearance(tenant)
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [touched, setTouched] = useState(false)
  const editingTenant = targetId === ''
  const tenantDefaults = tenantAppearance(tenant)

  useEffect(() => {
    if (!tenant?.id) return
    let cancelled = false
    api.getLists(tenant.id).then((res) => {
      if (!cancelled && res.data) setLists(res.data)
    })
    return () => {
      cancelled = true
    }
  }, [tenant?.id])

  useEffect(() => {
    if (!canManage || !touched) return
    const timer = setTimeout(async () => {
      setTouched(false)
      if (editingTenant) {
        await save(
          {
            listDesign: appearance.design,
            listHeroColor: appearance.heroColor,
            listBgUrl: appearance.bgUrl,
            listBgOverlay: appearance.bgOverlay ?? false,
          },
          'brand'
        )
        return
      }
      setSaving(true)
      const res = await api.updateList(targetId, appearance)
      setSaving(false)
      if (res.data) {
        setLists((previous) =>
          previous.map((list) => (list.id === res.data!.id ? res.data! : list))
        )
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [appearance, canManage, editingTenant, targetId, save, touched])

  const pickTarget = (id: string) => {
    setTouched(false)
    setTargetId(id)
    setAppearance(
      id === ''
        ? tenantAppearance(tenant)
        : listAppearance(lists.find((list) => list.id === id))
    )
  }
  const changeAppearance = (patch: Partial<ListAppearance>) => {
    setTouched(true)
    setAppearance((current) => ({ ...current, ...patch }))
  }
  return {
    appearance,
    changeAppearance,
    editingTenant,
    lists,
    pickTarget,
    saved,
    saving,
    targetId,
    tenantDefaults,
  }
}
