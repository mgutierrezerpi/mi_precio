import type { Customer, ListDesign, PriceList, PriceListVariantType, PublicViewer, PublicViewerStats } from '../../types'
import type { ApiClient } from './client'
import type { ListPatch } from './types'

export const listMethods = {
  getLists(this: ApiClient, tenantId: string) { return this.request<PriceList[]>(`/tenants/${tenantId}/lists`) },
  getList(this: ApiClient, listId: string) { return this.request<PriceList>(`/lists/${listId}`) },
  createList(this: ApiClient, tenantId: string, name: string, kind: 'product' | 'service' = 'product', variant?: {
    parentListId: string; variantType: PriceListVariantType; customerId?: string; startsAt?: string; endsAt?: string
  }) {
    const body = { name, kind, ...(variant ? {
      parent_list_id: variant.parentListId, variant_type: variant.variantType,
      customer_id: variant.customerId || undefined, starts_at: variant.startsAt || undefined, ends_at: variant.endsAt || undefined,
    } : {}) }
    return this.request<PriceList>(`/tenants/${tenantId}/lists`, { method: 'POST', body: JSON.stringify(body) })
  },
  updateList(this: ApiClient, listId: string, data: ListPatch) {
    const map: Record<string, string> = {
      showOnIndex: 'show_on_index', parentListId: 'parent_list_id', heroColor: 'hero_color',
      bgUrl: 'bg_url', bgOverlay: 'bg_overlay', captureViewerInfo: 'capture_viewer_info',
    }
    const body = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined).map(([key, value]) => [map[key] ?? key, value]))
    return this.request<PriceList>(`/lists/${listId}`, { method: 'PATCH', body: JSON.stringify(body) })
  },
  deleteList(this: ApiClient, listId: string) { return this.request<{ deleted: boolean }>(`/lists/${listId}`, { method: 'DELETE' }) },
  getPublicViewers(this: ApiClient, tenantId: string) { return this.request<PublicViewer[]>(`/tenants/${tenantId}/public-viewers`) },
  getPublicViewerStats(this: ApiClient, tenantId: string) { return this.request<PublicViewerStats>(`/tenants/${tenantId}/public-viewers/stats`) },
  promotePublicViewer(this: ApiClient, tenantId: string, viewerId: string) {
    return this.request<Customer>(`/tenants/${tenantId}/public-viewers/${viewerId}/promote`, { method: 'POST' })
  },
  recordPublicViewerDismissal(this: ApiClient, subdomain: string, listId: string) {
    return this.request<{ ok: boolean }>(`/public/${subdomain}/viewer-dismissed`, { method: 'POST', body: JSON.stringify({ list_id: listId }) })
  },
  submitPublicViewer(this: ApiClient, subdomain: string, data: { listId: string; name: string; email?: string; phone?: string }) {
    const body = { list_id: data.listId, name: data.name, email: data.email || null, phone: data.phone || null }
    return this.request<{ ok: boolean }>(`/public/${subdomain}/viewer`, {
      method: 'POST', body: JSON.stringify(body),
    })
  },
  getListDesigns(this: ApiClient) { return this.request<{ id: ListDesign; blocks: string[] }[]>('/list-designs') },
}
