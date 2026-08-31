import type { Magazine, MagazinePage } from '../../types'
import type { ApiClient } from './client'
import { magazinePageBody } from './bodies'
import type { MagazineInput, MagazinePageInput, MagazinePatch } from './types'

export const magazineMethods = {
  getMagazines(this: ApiClient, tenantId: string) { return this.request<Magazine[]>(`/tenants/${tenantId}/magazines`) },
  createMagazine(this: ApiClient, tenantId: string, data: MagazineInput) {
    const { showOnIndex, coverImageUrl, ...rest } = data
    const body = {
      ...rest,
      ...(coverImageUrl === undefined ? {} : { cover_image_url: coverImageUrl }),
      ...(showOnIndex === undefined ? {} : { show_on_index: showOnIndex }),
    }
    return this.request<Magazine>(`/tenants/${tenantId}/magazines`, { method: 'POST', body: JSON.stringify(body) })
  },
  updateMagazine(this: ApiClient, magazineId: string, data: MagazinePatch) {
    const map: Record<string, string> = { showOnIndex: 'show_on_index', coverImageUrl: 'cover_image_url' }
    const body = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined).map(([key, value]) => [map[key] ?? key, value]))
    return this.request<Magazine>(`/magazines/${magazineId}`, { method: 'PATCH', body: JSON.stringify(body) })
  },
  deleteMagazine(this: ApiClient, magazineId: string) { return this.request<{ deleted: boolean }>(`/magazines/${magazineId}`, { method: 'DELETE' }) },
  createMagazinePage(this: ApiClient, magazineId: string, data: Required<Pick<MagazinePageInput, 'position'>> & MagazinePageInput) {
    return this.request<MagazinePage>(`/magazines/${magazineId}/pages`, { method: 'POST', body: JSON.stringify(magazinePageBody(data)) })
  },
  updateMagazinePage(this: ApiClient, pageId: string, data: MagazinePageInput) {
    return this.request<MagazinePage>(`/magazine-pages/${pageId}`, { method: 'PATCH', body: JSON.stringify(magazinePageBody(data)) })
  },
  deleteMagazinePage(this: ApiClient, pageId: string) {
    return this.request<{ deleted: boolean }>(`/magazine-pages/${pageId}`, { method: 'DELETE' })
  },
}
