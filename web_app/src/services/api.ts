import { ApiClientImpl } from './api/client'
import { authMethods } from './api/auth'
import { billingMethods } from './api/billing'
import { catalogMethods } from './api/catalog'
import { crmMethods } from './api/crm'
import { insightMethods } from './api/insights'
import { listMethods } from './api/lists'
import { magazineMethods } from './api/magazines'
import { publicMethods } from './api/public'
import { teamMethods } from './api/team'
import { tenantMethods } from './api/tenants'
import { versionMethods } from './api/versions'

export const API_URL = import.meta.env.VITE_API_URL || '/api/v1'
export * from './api/client'
export * from './api/types'

export type ApiService = ApiClientImpl &
  typeof authMethods & typeof tenantMethods & typeof billingMethods &
  typeof listMethods & typeof magazineMethods & typeof versionMethods &
  typeof insightMethods & typeof teamMethods & typeof catalogMethods &
  typeof crmMethods & typeof publicMethods

export const api: ApiService = Object.assign(
  new ApiClientImpl(API_URL),
  authMethods,
  tenantMethods,
  billingMethods,
  listMethods,
  magazineMethods,
  versionMethods,
  insightMethods,
  teamMethods,
  catalogMethods,
  crmMethods,
  publicMethods,
)

export default api
