import type { PriceList, Tenant } from '../../types'
import type { ListAppearance } from '../../lib/listAppearance'

export function tenantAppearance(tenant: Tenant | null): ListAppearance {
  return {
    design: tenant?.listDesign ?? 'store',
    heroColor: tenant?.listHeroColor ?? null,
    bgUrl: tenant?.listBgUrl ?? null,
    bgOverlay: tenant?.listBgOverlay ?? false,
  }
}

export function listAppearance(list?: PriceList): ListAppearance {
  return {
    design: list?.design ?? null,
    heroColor: list?.heroColor ?? null,
    bgUrl: list?.bgUrl ?? null,
    bgOverlay: list?.bgOverlay ?? null,
  }
}
