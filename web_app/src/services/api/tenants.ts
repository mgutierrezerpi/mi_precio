import type { AuthToken, LinkTree, MarketplaceBusiness, Tenant } from '../../types'
import type { ApiClient } from './client'
import { linkTreeBody } from './bodies'
import type { TenantPatch } from './types'

const tenantMap: Record<string, string> = {
  logoUrl: 'logo_url', brandColor: 'brand_color', listDesign: 'list_design', listBgUrl: 'list_bg_url',
  listBgOverlay: 'list_bg_overlay', listHeroColor: 'list_hero_color', legalName: 'legal_name', taxId: 'tax_id',
  deliveryEnabled: 'delivery_enabled', marketplaceEnabled: 'marketplace_enabled', marketplaceLatitude: 'marketplace_latitude',
  marketplaceLongitude: 'marketplace_longitude', businessCategory: 'business_category', whatsappUrl: 'whatsapp_url',
  websiteUrl: 'website_url', instagramUrl: 'instagram_url',
}

const upload = (field: string, filename: string) => (client: ApiClient, path: string, file: Blob) => {
  const body = new FormData(); body.append(field, file, filename)
  return client.request<{ url: string }>(path, { method: 'POST', body })
}

export const tenantMethods = {
  getTenants(this: ApiClient) { return this.request<Tenant[]>('/tenants') },
  createTenant(this: ApiClient, name: string, subdomain?: string) {
    return this.request<Tenant>('/tenants', { method: 'POST', body: JSON.stringify({ name, subdomain }) })
  },
  switchTenant(this: ApiClient, tenantId: string) { return this.request<AuthToken>(`/tenants/${tenantId}/switch`, { method: 'POST' }) },
  getTenant(this: ApiClient, id: string) { return this.request<Tenant>(`/tenants/${id}`) },
  updateTenant(this: ApiClient, id: string, data: TenantPatch) {
    const body = Object.fromEntries(Object.entries(data).map(([key, value]) => [tenantMap[key] ?? key, value]))
    return this.request<Tenant>(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
  },
  deleteTenant(this: ApiClient, id: string) { return this.request<{ deleted: boolean }>(`/tenants/${id}`, { method: 'DELETE' }) },
  uploadTenantLogo(this: ApiClient, id: string, file: Blob) { return upload('image', 'business-logo')(this, `/tenants/${id}/logo`, file) },
  getLinkTree(this: ApiClient, id: string) { return this.request<LinkTree>(`/tenants/${id}/linktree`) },
  updateLinkTree(this: ApiClient, id: string, data: Partial<LinkTree>) {
    return this.request<LinkTree>(`/tenants/${id}/linktree`, { method: 'PATCH', body: JSON.stringify(linkTreeBody(data)) })
  },
  uploadLinkTreeAvatar(this: ApiClient, id: string, file: Blob) {
    return upload('image', 'linktree-avatar')(this, `/tenants/${id}/linktree/avatar`, file)
  },
  uploadListTemplateImage(this: ApiClient, id: string, file: Blob) {
    return upload('image', 'list-template-image')(this, `/tenants/${id}/list-template/image`, file)
  },
  uploadListTemplateVideo(this: ApiClient, id: string, file: Blob) {
    return upload('video', 'list-story.mp4')(this, `/tenants/${id}/list-template/video`, file)
  },
  getMarketplaceNearby(this: ApiClient, latitude?: number, longitude?: number, category?: string) {
    const params = new URLSearchParams()
    if (latitude != null && longitude != null) { params.set('latitude', String(latitude)); params.set('longitude', String(longitude)) }
    if (category) params.set('category', category)
    return this.request<MarketplaceBusiness[]>(`/public/marketplace/nearby${params.size ? `?${params}` : ''}`)
  },
}
