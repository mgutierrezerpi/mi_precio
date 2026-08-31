import { useEffect, useRef, useState } from 'react'
import type { Tenant } from '../../types'
import type { SettingsContext } from './SettingsCrmShared'
import { markTouched } from './SettingsCrmShared'

export function useBrandIdentity(
  tenant: Tenant | null,
  canManage: boolean,
  save: SettingsContext['save']
) {
  const [color, setColor] = useState(tenant?.brandColor ?? '#7C3AED')
  const [description, setDescription] = useState(tenant?.description ?? '')
  const touched = useRef(false)

  useEffect(() => {
    if (!canManage || !touched.current) return
    const timer = setTimeout(() => {
      touched.current = false
      void save(
        { brandColor: color, description: description.trim() || null },
        'brand'
      )
    }, 500)
    return () => clearTimeout(timer)
  }, [color, description, canManage, save])

  const changeColor = (value: string) => {
    markTouched(touched)
    setColor(value)
  }
  const changeDescription = (value: string) => {
    markTouched(touched)
    setDescription(value)
  }
  return { color, description, changeColor, changeDescription }
}
