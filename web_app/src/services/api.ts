import type { Tenant, PriceList, ListVersion, Item, Product, Category, AuthToken, Customer, CustomerStats, CustomerDetail, Order, Activity, TeamMember, Invitation, MemberStats, Role, NotificationsData, NotifPrefs } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

type ApiResponse<T> = { data: T; error?: never } | { data?: never; error: string }

type VisitBucket = { today: number; yesterday: number; total: number; changePct: number }
export type VisitStats = VisitBucket & { qr: VisitBucket }

export type ReportData = {
  days: number
  kpis: { visits: number; qrScans: number; customers: number; revenue: string }
  series: { date: string; link: number; qr: number }[]
  channels: { link: number; qr: number }
  topProducts: { name: string; units: number; revenue: string }[]
}

type AuthErrorCallback = () => void
let onAuthError: AuthErrorCallback | null = null

export function setAuthErrorHandler(callback: AuthErrorCallback | null) {
  onAuthError = callback
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function transformKeys<T>(obj: unknown): T {
  if (obj === null || obj === undefined) return obj as T
  if (Array.isArray(obj)) return obj.map(transformKeys) as T
  if (typeof obj !== 'object') return obj as T

  const transformed: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    transformed[snakeToCamel(key)] = transformKeys(value)
  }
  return transformed as T
}

/** Map a product payload's camelCase `imageUrl` to the API's snake_case `image_url`. */
function productBody<T extends { imageUrl?: string | null }>(data: T) {
  const { imageUrl, ...rest } = data
  return imageUrl !== undefined ? { ...rest, image_url: imageUrl } : rest
}

class ApiService {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        if (response.status === 401 && onAuthError) {
          onAuthError()
        }
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.detail || `Error ${response.status}` }
      }

      const data = await response.json()
      return { data: transformKeys<T>(data) }
    } catch {
      return { error: 'Error de conexión' }
    }
  }

  // Auth endpoints
  async sendCode(email: string): Promise<ApiResponse<{ email: string }>> {
    return this.request('/auth/codes', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async verifyCode(email: string, code: string): Promise<ApiResponse<AuthToken>> {
    return this.request('/auth/tokens', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    })
  }

  // Tenant endpoints
  async getTenants(): Promise<ApiResponse<Tenant[]>> {
    return this.request('/tenants')
  }

  async getTenant(id: string): Promise<ApiResponse<Tenant>> {
    return this.request(`/tenants/${id}`)
  }

  async updateTenant(
    id: string,
    data: {
      name?: string; subdomain?: string; currency?: string
      logoUrl?: string | null; brandColor?: string | null; description?: string | null
      language?: string; timezone?: string
      legalName?: string | null; taxId?: string | null; address?: string | null
    }
  ): Promise<ApiResponse<Tenant>> {
    // Map the camelCase brand/tax fields to the API's snake_case keys.
    const map: Record<string, string> = { logoUrl: 'logo_url', brandColor: 'brand_color', legalName: 'legal_name', taxId: 'tax_id' }
    const body: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) body[map[k] ?? k] = v
    return this.request(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
  }

  async deleteTenant(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/tenants/${id}`, { method: 'DELETE' })
  }

  // Lists endpoints
  async getLists(tenantId: string): Promise<ApiResponse<PriceList[]>> {
    return this.request(`/tenants/${tenantId}/lists`)
  }

  async getList(listId: string): Promise<ApiResponse<PriceList>> {
    return this.request(`/lists/${listId}`)
  }

  async createList(tenantId: string, name: string): Promise<ApiResponse<PriceList>> {
    return this.request(`/tenants/${tenantId}/lists`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  async updateList(listId: string, data: { name?: string; slug?: string; published?: boolean; showOnIndex?: boolean }): Promise<ApiResponse<PriceList>> {
    return this.request(`/lists/${listId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: data.name,
        slug: data.slug,
        published: data.published,
        show_on_index: data.showOnIndex,
      }),
    })
  }

  async deleteList(listId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/lists/${listId}`, { method: 'DELETE' })
  }

  // Version endpoints
  async getVersions(listId: string): Promise<ApiResponse<ListVersion[]>> {
    return this.request(`/lists/${listId}/versions`)
  }

  async getVersion(versionId: string): Promise<ApiResponse<ListVersion>> {
    return this.request(`/versions/${versionId}`)
  }

  async createVersion(listId: string, name: string): Promise<ApiResponse<ListVersion>> {
    return this.request(`/lists/${listId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  async updateVersion(versionId: string, data: { name?: string; published?: boolean }): Promise<ApiResponse<ListVersion>> {
    return this.request(`/versions/${versionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async duplicateVersion(versionId: string, name?: string): Promise<ApiResponse<ListVersion>> {
    const params = name ? `?name=${encodeURIComponent(name)}` : ''
    return this.request(`/versions/${versionId}/duplicate${params}`, { method: 'POST' })
  }

  // Items endpoints
  async getItems(versionId: string): Promise<ApiResponse<Item[]>> {
    return this.request(`/versions/${versionId}/items`)
  }

  async getItem(itemId: string): Promise<ApiResponse<Item>> {
    return this.request(`/items/${itemId}`)
  }

  async createItem(versionId: string, data: { name: string; price: number; description?: string; currency?: string; category?: string }): Promise<ApiResponse<Item>> {
    return this.request(`/versions/${versionId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateItem(itemId: string, data: { name?: string; price?: number; description?: string; category?: string }): Promise<ApiResponse<Item>> {
    return this.request(`/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteItem(itemId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/items/${itemId}`, { method: 'DELETE' })
  }

  async reorderItems(versionId: string, itemIds: string[]): Promise<ApiResponse<{ reordered: boolean }>> {
    return this.request(`/versions/${versionId}/items/order`, {
      method: 'PUT',
      body: JSON.stringify({ item_ids: itemIds }),
    })
  }

  // Stats
  async getVisitStats(tenantId: string): Promise<ApiResponse<VisitStats>> {
    return this.request(`/tenants/${tenantId}/stats/visits`)
  }

  async getActivity(tenantId: string): Promise<ApiResponse<Activity[]>> {
    return this.request(`/tenants/${tenantId}/activity`)
  }

  async getReports(tenantId: string, days = 30): Promise<ApiResponse<ReportData>> {
    return this.request(`/tenants/${tenantId}/stats/reports?days=${days}`)
  }

  // Notifications (in-app)
  async getNotifications(tenantId: string): Promise<ApiResponse<NotificationsData>> {
    return this.request(`/tenants/${tenantId}/notifications`)
  }

  async updateNotifPrefs(tenantId: string, prefs: Partial<NotifPrefs>): Promise<ApiResponse<{ prefs: NotifPrefs }>> {
    return this.request(`/tenants/${tenantId}/notifications/prefs`, {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    })
  }

  async markNotificationsSeen(tenantId: string): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/tenants/${tenantId}/notifications/seen`, { method: 'POST' })
  }

  // Team endpoints
  async getMembers(tenantId: string): Promise<ApiResponse<TeamMember[]>> {
    return this.request(`/tenants/${tenantId}/members`)
  }

  async getMemberStats(tenantId: string): Promise<ApiResponse<MemberStats>> {
    return this.request(`/tenants/${tenantId}/members/stats`)
  }

  async getInvitations(tenantId: string): Promise<ApiResponse<Invitation[]>> {
    return this.request(`/tenants/${tenantId}/invitations`)
  }

  async inviteMember(tenantId: string, email: string, role: Role): Promise<ApiResponse<Invitation>> {
    return this.request(`/tenants/${tenantId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    })
  }

  async updateMemberRole(tenantId: string, userId: string, role: Role): Promise<ApiResponse<TeamMember>> {
    return this.request(`/tenants/${tenantId}/members/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  }

  async removeMember(tenantId: string, userId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/tenants/${tenantId}/members/${userId}`, { method: 'DELETE' })
  }

  async cancelInvitation(tenantId: string, invitationId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/tenants/${tenantId}/invitations/${invitationId}`, { method: 'DELETE' })
  }

  // Product endpoints (tenant-level catalog)
  async getProducts(tenantId: string): Promise<ApiResponse<Product[]>> {
    return this.request(`/tenants/${tenantId}/products`)
  }

  async createProduct(
    tenantId: string,
    data: { name: string; price: number; sku?: string | null; currency?: string; available?: boolean; description?: string | null; category?: string | null; imageUrl?: string | null }
  ): Promise<ApiResponse<Product>> {
    return this.request(`/tenants/${tenantId}/products`, {
      method: 'POST',
      body: JSON.stringify(productBody(data)),
    })
  }

  async updateProduct(
    productId: string,
    data: { name?: string; price?: number; sku?: string | null; currency?: string; available?: boolean; description?: string | null; category?: string | null; imageUrl?: string | null }
  ): Promise<ApiResponse<Product>> {
    return this.request(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(productBody(data)),
    })
  }

  async deleteProduct(productId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/products/${productId}`, { method: 'DELETE' })
  }

  // Category endpoints (tenant-level)
  async getCategories(tenantId: string): Promise<ApiResponse<Category[]>> {
    return this.request(`/tenants/${tenantId}/categories`)
  }

  async createCategory(
    tenantId: string,
    data: { name: string; description?: string | null; color?: string | null }
  ): Promise<ApiResponse<Category>> {
    return this.request(`/tenants/${tenantId}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCategory(
    categoryId: string,
    data: { name?: string; description?: string | null; color?: string | null }
  ): Promise<ApiResponse<Category>> {
    return this.request(`/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteCategory(categoryId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/categories/${categoryId}`, { method: 'DELETE' })
  }

  // Customer endpoints (CRM)
  async getCustomers(tenantId: string): Promise<ApiResponse<Customer[]>> {
    return this.request(`/tenants/${tenantId}/customers`)
  }

  async getCustomerStats(tenantId: string): Promise<ApiResponse<CustomerStats>> {
    return this.request(`/tenants/${tenantId}/customers/stats`)
  }

  async createCustomer(
    tenantId: string,
    data: { name: string; rut?: string | null; email?: string | null; phone?: string | null; notes?: string | null }
  ): Promise<ApiResponse<Customer>> {
    return this.request(`/tenants/${tenantId}/customers`, { method: 'POST', body: JSON.stringify(data) })
  }

  async getCustomerDetail(customerId: string): Promise<ApiResponse<CustomerDetail>> {
    return this.request(`/customers/${customerId}`)
  }

  async updateCustomer(
    customerId: string,
    data: { name?: string; rut?: string | null; email?: string | null; phone?: string | null; notes?: string | null }
  ): Promise<ApiResponse<Customer>> {
    return this.request(`/customers/${customerId}`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async deleteCustomer(customerId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/customers/${customerId}`, { method: 'DELETE' })
  }

  async createOrder(
    customerId: string,
    data: { items: { name: string; quantity: number; unit_price: number }[]; status?: string; note?: string | null; currency?: string | null; reference?: string | null }
  ): Promise<ApiResponse<Order>> {
    return this.request(`/customers/${customerId}/orders`, { method: 'POST', body: JSON.stringify(data) })
  }

  async updateOrder(
    orderId: string,
    data: { items?: { name: string; quantity: number; unit_price: number }[]; status?: string; note?: string | null; reference?: string | null }
  ): Promise<ApiResponse<Order>> {
    return this.request(`/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async deleteOrder(orderId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/orders/${orderId}`, { method: 'DELETE' })
  }

  // Public endpoints
  async getPublicMenu(subdomain: string): Promise<ApiResponse<{ tenant: Tenant; lists: PriceList[] }>> {
    return this.request(`/public/${subdomain}`)
  }

  async recordPublicView(subdomain: string, listId?: string, source?: string): Promise<ApiResponse<{ ok: boolean }>> {
    const params = new URLSearchParams()
    if (listId) params.set('list', listId)
    if (source) params.set('source', source)
    const q = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/public/${subdomain}/view${q}`, { method: 'POST' })
  }

  // Import endpoints
  async importFromUrl(url: string): Promise<ApiResponse<{ items: { name: string; price: number; description: string | null }[]; count: number }>> {
    return this.request('/import/from-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
  }

  async importFromImages(imageUrls: string[]): Promise<ApiResponse<{ items: { name: string; price: number; description: string | null }[]; count: number }>> {
    return this.request('/import/from-images', {
      method: 'POST',
      body: JSON.stringify({ image_urls: imageUrls }),
    })
  }
}

export const api = new ApiService(API_URL)
export default api
