import type { Category, Product } from '../../types'
import type { ApiClient } from './client'
import { productBody } from './bodies'
import type { ProductInput, ProductPatch } from './types'

const upload = (client: ApiClient, path: string, file: Blob) => {
  const body = new FormData(); body.append('image', file, 'product.webp')
  return client.request<{ url: string; thumbnailUrl: string }>(path, { method: 'POST', body })
}

export const catalogMethods = {
  getProducts(this: ApiClient, tenantId: string) { return this.request<Product[]>(`/tenants/${tenantId}/products`) },
  createProduct(this: ApiClient, tenantId: string, data: ProductInput) {
    return this.request<Product>(`/tenants/${tenantId}/products`, { method: 'POST', body: JSON.stringify(productBody(data)) })
  },
  updateProduct(this: ApiClient, productId: string, data: ProductPatch) {
    return this.request<Product>(`/products/${productId}`, { method: 'PATCH', body: JSON.stringify(productBody(data)) })
  },
  deleteProduct(this: ApiClient, productId: string) { return this.request<{ deleted: boolean }>(`/products/${productId}`, { method: 'DELETE' }) },
  uploadProductImage(this: ApiClient, tenantId: string, file: Blob) { return upload(this, `/tenants/${tenantId}/product_images`, file) },
  getCategories(this: ApiClient, tenantId: string) { return this.request<Category[]>(`/tenants/${tenantId}/categories`) },
  createCategory(this: ApiClient, tenantId: string, data: { name: string; description?: string | null; color?: string | null }) {
    return this.request<Category>(`/tenants/${tenantId}/categories`, { method: 'POST', body: JSON.stringify(data) })
  },
  updateCategory(this: ApiClient, categoryId: string, data: { name?: string; description?: string | null; color?: string | null }) {
    return this.request<Category>(`/categories/${categoryId}`, { method: 'PATCH', body: JSON.stringify(data) })
  },
  deleteCategory(this: ApiClient, categoryId: string) {
    return this.request<{ deleted: boolean }>(`/categories/${categoryId}`, { method: 'DELETE' })
  },
}
