import type { Magazine, PriceList, Tenant } from '../../types'
import type { ApiClient } from './client'

type PublicMenu = { tenant: Tenant; lists: PriceList[]; magazines: Magazine[]; viewerIdentified?: boolean }
type LeadInput = {
  name: string; phone?: string; email?: string; message?: string; listId?: string | null; listName?: string | null
  source?: 'form' | 'cart'; website?: string
}
type ImportedItems = { items: { name: string; price: number; description: string | null }[]; count: number }

export const publicMethods = {
  getPublicMenu(this: ApiClient, subdomain: string, listId?: string) {
    const filter = listId ? `?list=${encodeURIComponent(listId)}` : ''
    return this.request<PublicMenu>(`/public/${subdomain}${filter}`)
  },
  getPublicMagazine(this: ApiClient, subdomain: string, magazineId: string) {
    return this.request<{ tenant: Tenant; magazine: Magazine }>(`/public/${subdomain}/magazines/${encodeURIComponent(magazineId)}`)
  },
  createLead(this: ApiClient, subdomain: string, data: LeadInput) {
    const { listId, listName, ...rest } = data
    return this.request<{ ok: boolean }>(`/public/${subdomain}/leads`, {
      method: 'POST', body: JSON.stringify({ ...rest, list_id: listId, list_name: listName }),
    })
  },
  recordPublicView(this: ApiClient, subdomain: string, listId?: string, source?: string) {
    const params = new URLSearchParams()
    if (listId) params.set('list', listId)
    if (source) params.set('source', source)
    const query = params.toString() ? `?${params}` : ''
    return this.request<{ ok: boolean }>(`/public/${subdomain}/view${query}`, { method: 'POST' })
  },
  importFromUrl(this: ApiClient, url: string) {
    return this.request<ImportedItems>('/import/from-url', { method: 'POST', body: JSON.stringify({ url }) })
  },
  importFromImages(this: ApiClient, imageUrls: string[]) {
    return this.request<ImportedItems>('/import/from-images', { method: 'POST', body: JSON.stringify({ image_urls: imageUrls }) })
  },
}
