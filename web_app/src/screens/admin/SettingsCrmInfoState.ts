import { useEffect, useRef, useState } from 'react'
import type { Tenant } from '../../types'
import type { SettingsContext } from './SettingsCrmShared'
import { markTouched } from './SettingsCrmShared'

export function useInfoFields(
  tenant: Tenant | null,
  canManage: boolean,
  save: SettingsContext['save']
) {
  const [name, setName] = useState(tenant?.name ?? '')
  const [subdomain, setSubdomain] = useState(tenant?.subdomain ?? '')
  const [taxId, setTaxId] = useState(tenant?.taxId ?? '')
  const [logo, setLogo] = useState<string | null>(tenant?.logoUrl ?? null)
  const touched = useRef(false)
  const touch = () => markTouched(touched)

  useEffect(() => {
    if (!canManage || !touched.current) return
    const timer = setTimeout(() => {
      touched.current = false
      void save(
        {
          name: name.trim(),
          subdomain: subdomain.trim(),
          taxId: taxId.trim() || null,
          logoUrl: logo,
        },
        'info'
      )
    }, 500)
    return () => clearTimeout(timer)
  }, [name, subdomain, taxId, logo, canManage, save])

  return {
    fields: { name, subdomain, taxId, logo, setName, setSubdomain, setTaxId },
    setLogo,
    touch,
  }
}
