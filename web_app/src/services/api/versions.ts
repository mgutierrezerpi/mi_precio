import type { Item, ListVersion } from '../../types'
import type { ApiClient } from './client'
import { listContentBody } from './bodies'

export const versionMethods = {
  getVersions(this: ApiClient, listId: string) { return this.request<ListVersion[]>(`/lists/${listId}/versions`) },
  getVersion(this: ApiClient, versionId: string) { return this.request<ListVersion>(`/versions/${versionId}`) },
  createVersion(this: ApiClient, listId: string, name: string) {
    return this.request<ListVersion>(`/lists/${listId}/versions`, { method: 'POST', body: JSON.stringify({ name }) })
  },
  updateVersion(this: ApiClient, versionId: string, data: { name?: string; published?: boolean }) {
    return this.request<ListVersion>(`/versions/${versionId}`, { method: 'PATCH', body: JSON.stringify(data) })
  },
  updateVersionContent(this: ApiClient, versionId: string, content: NonNullable<ListVersion['content']>, contentRevision: number) {
    return this.request<ListVersion>(`/versions/${versionId}/content`, {
      method: 'PATCH', body: JSON.stringify({ content: listContentBody(content), content_revision: contentRevision }),
    })
  },
  duplicateVersion(this: ApiClient, versionId: string, name?: string) {
    const query = name ? `?name=${encodeURIComponent(name)}` : ''
    return this.request<ListVersion>(`/versions/${versionId}/duplicate${query}`, { method: 'POST' })
  },
  getItems(this: ApiClient, versionId: string) { return this.request<Item[]>(`/versions/${versionId}/items`) },
  getItem(this: ApiClient, itemId: string) { return this.request<Item>(`/items/${itemId}`) },
  createItem(this: ApiClient, versionId: string, data: {
    name: string; price: number; description?: string; currency?: string
    category?: string; imageUrl?: string; imageThumbUrl?: string; productId?: string
  }) {
    const { imageUrl, imageThumbUrl, productId, ...rest } = data
    const body = { ...rest, image_url: imageUrl, image_thumb_url: imageThumbUrl, product_id: productId }
    return this.request<Item>(`/versions/${versionId}/items`, {
      method: 'POST', body: JSON.stringify(body),
    })
  },
  updateItem(this: ApiClient, itemId: string, data: { name?: string; price?: number; description?: string; category?: string }) {
    return this.request<Item>(`/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) })
  },
  deleteItem(this: ApiClient, itemId: string) { return this.request<{ deleted: boolean }>(`/items/${itemId}`, { method: 'DELETE' }) },
  reorderItems(this: ApiClient, versionId: string, itemIds: string[]) {
    return this.request<{ reordered: boolean }>(`/versions/${versionId}/items/order`, { method: 'PUT', body: JSON.stringify({ item_ids: itemIds }) })
  },
}
