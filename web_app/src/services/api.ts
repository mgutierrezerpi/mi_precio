import type {
  Tenant,
  MarketplaceBusiness,
  PriceList,
  PriceListVariantType,
  ListDesign,
  ListVersion,
  Item,
  Product,
  Category,
  AuthToken,
  Customer,
  Lead,
  LeadStatus,
  CustomerStats,
  CustomerDetail,
  Order,
  Activity,
  TeamMember,
  Invitation,
  MemberStats,
  Role,
  NotificationsData,
  NotifPrefs,
  PlanInfo,
  PlanId,
  User,
} from '../types'

export const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

type ApiResponse<T> =
  | { data: T; error?: never }
  | { data?: never; error: string }

type VisitBucket = {
  today: number
  yesterday: number
  total: number
  changePct: number
}
export type VisitStats = VisitBucket & { qr: VisitBucket }

export type ReportData = {
  days: number
  listId: string | null
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

type ConnectionErrorCallback = () => void
let onConnectionError: ConnectionErrorCallback | null = null

export function setConnectionErrorHandler(
  callback: ConnectionErrorCallback | null
) {
  onConnectionError = callback
}

/** Fired when the API refuses a request because the tenant still owes us a plan
 *  (HTTP 402 + `plan_required`). Safety net for sessions that slipped past the
 *  route guard — e.g. a tab left open when the subscription expired. */
type PlanRequiredCallback = () => void
let onPlanRequired: PlanRequiredCallback | null = null

export function setPlanRequiredHandler(callback: PlanRequiredCallback | null) {
  onPlanRequired = callback
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

/** Map a product payload's camelCase image fields to the API's snake_case keys. */
function productBody<
  T extends {
    imageUrl?: string | null
    imageThumbUrl?: string | null
    priceListIds?: string[]
  },
>(data: T) {
  const { imageUrl, imageThumbUrl, priceListIds, ...rest } = data
  return {
    ...rest,
    ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
    ...(imageThumbUrl !== undefined ? { image_thumb_url: imageThumbUrl } : {}),
    ...(priceListIds !== undefined ? { price_list_ids: priceListIds } : {}),
  }
}

class ApiService {
  private baseUrl: string
  private token: string | null = null
  private authErrorHandled = false

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token: string | null) {
    this.token = token
    // A fresh login starts a new auth-error cycle. Keep the expired-session
    // handler one-shot while all requests from the old session drain.
    if (token) this.authErrorHandled = false
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    allowReconnect = true
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit =
      options.body instanceof FormData
        ? { ...options.headers }
        : { 'Content-Type': 'application/json', ...options.headers }

    if (this.token) {
      ;(headers as Record<string, string>)['Authorization'] =
        `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        if (response.status === 401 && onAuthError && !this.authErrorHandled) {
          this.authErrorHandled = true
          onAuthError()
        }
        const errorData = await response.json().catch(() => ({}))
        // `detail` is a plain string everywhere except the plan gate, which
        // sends { code, message } so it can be told apart from plan-limit 402s.
        const detail = errorData.detail
        if (response.status === 402 && detail?.code === 'plan_required')
          onPlanRequired?.()
        const message = typeof detail === 'string' ? detail : detail?.message
        return { error: message || `Error ${response.status}` }
      }

      const data = await response.json()
      return { data: transformKeys<T>(data) }
    } catch {
      // GETs are safe to retry when the local API is restarting or briefly
      // unavailable. Mutating requests are not retried to avoid duplicate work.
      const method = (options.method ?? 'GET').toUpperCase()
      if (allowReconnect && (method === 'GET' || method === 'HEAD')) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        return this.request(endpoint, options, false)
      }
      onConnectionError?.()
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

  async verifyCode(
    email: string,
    code: string
  ): Promise<ApiResponse<AuthToken>> {
    return this.request('/auth/tokens', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    })
  }

  // Tenant endpoints
  async getTenants(): Promise<ApiResponse<Tenant[]>> {
    return this.request('/tenants')
  }

  async createTenant(
    name: string,
    subdomain?: string
  ): Promise<ApiResponse<Tenant>> {
    return this.request('/tenants', {
      method: 'POST',
      body: JSON.stringify({ name, subdomain }),
    })
  }

  async switchTenant(tenantId: string): Promise<ApiResponse<AuthToken>> {
    return this.request(`/tenants/${tenantId}/switch`, { method: 'POST' })
  }

  async getMarketplaceNearby(
    latitude?: number,
    longitude?: number,
    category?: string
  ): Promise<ApiResponse<MarketplaceBusiness[]>> {
    const params = new URLSearchParams()
    if (latitude != null && longitude != null) {
      params.set('latitude', String(latitude))
      params.set('longitude', String(longitude))
    }
    if (category) params.set('category', category)
    const query = params.size ? `?${params}` : ''
    return this.request(`/public/marketplace/nearby${query}`)
  }

  async getTenant(id: string): Promise<ApiResponse<Tenant>> {
    return this.request(`/tenants/${id}`)
  }

  async updateTenant(
    id: string,
    data: {
      name?: string
      subdomain?: string
      currency?: string
      logoUrl?: string | null
      brandColor?: string | null
      description?: string | null
      listDesign?: string | null
      listBgUrl?: string | null
      listBgOverlay?: boolean
      listHeroColor?: string | null
      socialInstagram?: string | null
      socialFacebook?: string | null
      socialTiktok?: string | null
      socialWebsite?: string | null
      socialWhatsapp?: string | null
      leadsEnabled?: boolean
      language?: string
      timezone?: string
      deliveryEnabled?: boolean
      marketplaceEnabled?: boolean
      marketplaceLatitude?: number | null
      marketplaceLongitude?: number | null
      businessCategory?: string | null
      legalName?: string | null
      taxId?: string | null
      address?: string | null
    }
  ): Promise<ApiResponse<Tenant>> {
    // Map the camelCase brand/tax fields to the API's snake_case keys.
    const map: Record<string, string> = {
      logoUrl: 'logo_url',
      brandColor: 'brand_color',
      listDesign: 'list_design',
      listBgUrl: 'list_bg_url',
      listBgOverlay: 'list_bg_overlay',
      listHeroColor: 'list_hero_color',
      socialInstagram: 'social_instagram',
      socialFacebook: 'social_facebook',
      socialTiktok: 'social_tiktok',
      socialWebsite: 'social_website',
      socialWhatsapp: 'social_whatsapp',
      leadsEnabled: 'leads_enabled',
      legalName: 'legal_name',
      taxId: 'tax_id',
      deliveryEnabled: 'delivery_enabled',
      marketplaceEnabled: 'marketplace_enabled',
      marketplaceLatitude: 'marketplace_latitude',
      marketplaceLongitude: 'marketplace_longitude',
      businessCategory: 'business_category',
    }
    const body: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) body[map[k] ?? k] = v
    return this.request(`/tenants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  async deleteTenant(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/tenants/${id}`, { method: 'DELETE' })
  }

  // Plan & billing
  async getPlan(tenantId: string): Promise<ApiResponse<PlanInfo>> {
    return this.request(`/tenants/${tenantId}/plan`)
  }

  async updatePlan(
    tenantId: string,
    plan: PlanId
  ): Promise<ApiResponse<Tenant>> {
    return this.request(`/tenants/${tenantId}/plan`, {
      method: 'PATCH',
      body: JSON.stringify({ plan }),
    })
  }

  async createCheckout(
    tenantId: string,
    plan: PlanId,
    redirectUrl?: string
  ): Promise<ApiResponse<{ url: string }>> {
    return this.request('/billing/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        tenant_id: tenantId,
        plan,
        redirect_url: redirectUrl,
      }),
    })
  }

  async reconcileCheckout(
    tenantId: string,
    orderId: string
  ): Promise<ApiResponse<{ status: string; subscriptionId?: string }>> {
    return this.request('/billing/reconcile-checkout', {
      method: 'POST',
      body: JSON.stringify({ tenant_id: tenantId, order_id: orderId }),
    })
  }

  /** Cancel at the end of the paid period: access stays until `billing.endsAt`. */
  async cancelSubscription(tenantId: string): Promise<ApiResponse<Tenant>> {
    return this.request('/billing/cancellations', { method: 'POST', body: JSON.stringify({ tenant_id: tenantId }) })
  }

  /** Undo a cancellation that has not lapsed yet. */
  async resumeSubscription(tenantId: string): Promise<ApiResponse<Tenant>> {
    return this.request('/billing/resumptions', { method: 'POST', body: JSON.stringify({ tenant_id: tenantId }) })
  }

  // Support (Zoho Desk ticket). Requester identity comes from the JWT server-side.
  async createSupportTicket(
    subject: string,
    description: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<ApiResponse<{ id: number | string; status: string }>> {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify({ subject, description, priority }),
    })
  }

  // Lists endpoints
  async getLists(tenantId: string): Promise<ApiResponse<PriceList[]>> {
    return this.request(`/tenants/${tenantId}/lists`)
  }

  async getList(listId: string): Promise<ApiResponse<PriceList>> {
    return this.request(`/lists/${listId}`)
  }

  async createList(
    tenantId: string,
    name: string,
    kind: 'product' | 'service' = 'product',
    variant?: {
      parentListId: string
      variantType: PriceListVariantType
      customerId?: string
      startsAt?: string
      endsAt?: string
    }
  ): Promise<ApiResponse<PriceList>> {
    return this.request(`/tenants/${tenantId}/lists`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        kind,
        ...(variant
          ? {
              parent_list_id: variant.parentListId,
              variant_type: variant.variantType,
              customer_id: variant.customerId || undefined,
              starts_at: variant.startsAt || undefined,
              ends_at: variant.endsAt || undefined,
            }
          : {}),
      }),
    })
  }

  async updateList(
    listId: string,
    data: {
      name?: string
      slug?: string
      published?: boolean
      showOnIndex?: boolean
      kind?: 'product' | 'service'
      parentListId?: string | null
      // Appearance overrides: `null` clears one and falls back to the tenant's.
      design?: ListDesign | null
      heroColor?: string | null
      bgUrl?: string | null
      bgOverlay?: boolean | null
    }
  ): Promise<ApiResponse<PriceList>> {
    // Only send the keys actually provided — the API distinguishes "absent"
    // (leave as is) from an explicit null (clear the override).
    const map: Record<string, string> = {
      showOnIndex: 'show_on_index',
      parentListId: 'parent_list_id',
      heroColor: 'hero_color',
      bgUrl: 'bg_url',
      bgOverlay: 'bg_overlay',
    }
    const body: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) body[map[k] ?? k] = v
    }
    return this.request(`/lists/${listId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
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

  async createVersion(
    listId: string,
    name: string
  ): Promise<ApiResponse<ListVersion>> {
    return this.request(`/lists/${listId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  async updateVersion(
    versionId: string,
    data: { name?: string; published?: boolean }
  ): Promise<ApiResponse<ListVersion>> {
    return this.request(`/versions/${versionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async duplicateVersion(
    versionId: string,
    name?: string
  ): Promise<ApiResponse<ListVersion>> {
    const params = name ? `?name=${encodeURIComponent(name)}` : ''
    return this.request(`/versions/${versionId}/duplicate${params}`, {
      method: 'POST',
    })
  }

  // Items endpoints
  async getItems(versionId: string): Promise<ApiResponse<Item[]>> {
    return this.request(`/versions/${versionId}/items`)
  }

  async getItem(itemId: string): Promise<ApiResponse<Item>> {
    return this.request(`/items/${itemId}`)
  }

  async createItem(
    versionId: string,
    data: {
      name: string
      price: number
      description?: string
      currency?: string
      category?: string
      imageUrl?: string
      imageThumbUrl?: string
      productId?: string
    }
  ): Promise<ApiResponse<Item>> {
    const { imageUrl, imageThumbUrl, productId, ...rest } = data
    return this.request(`/versions/${versionId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        ...rest,
        image_url: imageUrl,
        image_thumb_url: imageThumbUrl,
        product_id: productId,
      }),
    })
  }

  async updateItem(
    itemId: string,
    data: {
      name?: string
      price?: number
      description?: string
      category?: string
    }
  ): Promise<ApiResponse<Item>> {
    return this.request(`/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteItem(itemId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/items/${itemId}`, { method: 'DELETE' })
  }

  async reorderItems(
    versionId: string,
    itemIds: string[]
  ): Promise<ApiResponse<{ reordered: boolean }>> {
    return this.request(`/versions/${versionId}/items/order`, {
      method: 'PUT',
      body: JSON.stringify({ item_ids: itemIds }),
    })
  }

  // Stats
  async getVisitStats(tenantId: string): Promise<ApiResponse<VisitStats>> {
    return this.request(`/tenants/${tenantId}/stats/visits`)
  }

  async getActivity(
    tenantId: string,
    limit = 20,
    offset = 0
  ): Promise<ApiResponse<Activity[]>> {
    return this.request(
      `/tenants/${tenantId}/activity?limit=${limit}&offset=${offset}`
    )
  }

  async getReports(
    tenantId: string,
    days = 30,
    listId?: string
  ): Promise<ApiResponse<ReportData>> {
    const listFilter = listId ? `&list_id=${encodeURIComponent(listId)}` : ''
    return this.request(
      `/tenants/${tenantId}/stats/reports?days=${days}${listFilter}`
    )
  }

  // Notifications (in-app)
  async getNotifications(
    tenantId: string
  ): Promise<ApiResponse<NotificationsData>> {
    return this.request(`/tenants/${tenantId}/notifications`)
  }

  async updateNotifPrefs(
    tenantId: string,
    prefs: Partial<NotifPrefs>
  ): Promise<ApiResponse<{ prefs: NotifPrefs }>> {
    return this.request(`/tenants/${tenantId}/notifications/prefs`, {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    })
  }

  async markNotificationsSeen(
    tenantId: string
  ): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/tenants/${tenantId}/notifications/seen`, {
      method: 'POST',
    })
  }

  // Web Push (PWA desktop/mobile notifications)
  async getPushPublicKey(): Promise<
    ApiResponse<{ key: string; enabled: boolean }>
  > {
    return this.request('/push/public-key')
  }

  async subscribePush(
    tenantId: string,
    subscription: PushSubscriptionJSON
  ): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/tenants/${tenantId}/push/subscribe`, {
      method: 'POST',
      body: JSON.stringify(subscription),
    })
  }

  async unsubscribePush(
    tenantId: string,
    endpoint: string
  ): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/tenants/${tenantId}/push/unsubscribe`, {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
    })
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

  async inviteMember(
    tenantId: string,
    email: string,
    role: Role
  ): Promise<ApiResponse<Invitation>> {
    return this.request(`/tenants/${tenantId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    })
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/users/me')
  }

  async updateMember(
    tenantId: string,
    userId: string,
    data: { role?: Role; name?: string; email?: string }
  ): Promise<ApiResponse<TeamMember>> {
    return this.request(`/tenants/${tenantId}/members/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async updateMemberRole(
    tenantId: string,
    userId: string,
    role: Role
  ): Promise<ApiResponse<TeamMember>> {
    return this.updateMember(tenantId, userId, { role })
  }

  async removeMember(
    tenantId: string,
    userId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/tenants/${tenantId}/members/${userId}`, {
      method: 'DELETE',
    })
  }

  async cancelInvitation(
    tenantId: string,
    invitationId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/tenants/${tenantId}/invitations/${invitationId}`, {
      method: 'DELETE',
    })
  }

  // Product endpoints (tenant-level catalog)
  async getProducts(tenantId: string): Promise<ApiResponse<Product[]>> {
    return this.request(`/tenants/${tenantId}/products`)
  }

  async createProduct(
    tenantId: string,
    data: {
      name: string
      price: number
      sku?: string | null
      currency?: string
      available?: boolean
      description?: string | null
      category?: string | null
      imageUrl?: string | null
      imageThumbUrl?: string | null
    }
  ): Promise<ApiResponse<Product>> {
    return this.request(`/tenants/${tenantId}/products`, {
      method: 'POST',
      body: JSON.stringify(productBody(data)),
    })
  }

  async updateProduct(
    productId: string,
    data: {
      name?: string
      price?: number
      sku?: string | null
      currency?: string
      available?: boolean
      description?: string | null
      category?: string | null
      imageUrl?: string | null
      imageThumbUrl?: string | null
      priceListIds?: string[]
    }
  ): Promise<ApiResponse<Product>> {
    return this.request(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(productBody(data)),
    })
  }

  async deleteProduct(
    productId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/products/${productId}`, { method: 'DELETE' })
  }

  async uploadProductImage(
    tenantId: string,
    file: Blob
  ): Promise<ApiResponse<{ url: string; thumbnailUrl: string }>> {
    const body = new FormData()
    body.append('image', file, 'product.webp')
    return this.request(`/tenants/${tenantId}/product_images`, {
      method: 'POST',
      body,
    })
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

  async deleteCategory(
    categoryId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/categories/${categoryId}`, { method: 'DELETE' })
  }

  // Customer endpoints (CRM)
  // Leads: the inbox of people who left their details on a public list.
  async getLeads(
    tenantId: string,
    status?: LeadStatus
  ): Promise<ApiResponse<Lead[]>> {
    const query = status ? `?status=${status}` : ''
    return this.request(`/tenants/${tenantId}/leads${query}`)
  }

  async setLeadStatus(
    tenantId: string,
    leadId: string,
    status: LeadStatus
  ): Promise<ApiResponse<Lead>> {
    return this.request(`/tenants/${tenantId}/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  /** Promotes a lead into the customers book. Answers 409 if it already is one. */
  async convertLead(
    tenantId: string,
    leadId: string
  ): Promise<ApiResponse<Customer>> {
    return this.request(`/tenants/${tenantId}/leads/${leadId}/convert`, {
      method: 'POST',
    })
  }

  async getCustomers(tenantId: string): Promise<ApiResponse<Customer[]>> {
    return this.request(`/tenants/${tenantId}/customers`)
  }

  async getCustomerStats(
    tenantId: string
  ): Promise<ApiResponse<CustomerStats>> {
    return this.request(`/tenants/${tenantId}/customers/stats`)
  }

  async createCustomer(
    tenantId: string,
    data: {
      name: string
      rut?: string | null
      email?: string | null
      phone?: string | null
      notes?: string | null
    }
  ): Promise<ApiResponse<Customer>> {
    return this.request(`/tenants/${tenantId}/customers`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getCustomerDetail(
    customerId: string
  ): Promise<ApiResponse<CustomerDetail>> {
    return this.request(`/customers/${customerId}`)
  }

  async updateCustomer(
    customerId: string,
    data: {
      name?: string
      rut?: string | null
      email?: string | null
      phone?: string | null
      notes?: string | null
    }
  ): Promise<ApiResponse<Customer>> {
    return this.request(`/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteCustomer(
    customerId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/customers/${customerId}`, { method: 'DELETE' })
  }

  async createOrder(
    customerId: string,
    data: {
      items: { name: string; quantity: number; unit_price: number }[]
      status?: string
      note?: string | null
      currency?: string | null
      reference?: string | null
    }
  ): Promise<ApiResponse<Order>> {
    return this.request(`/customers/${customerId}/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateOrder(
    orderId: string,
    data: {
      items?: { name: string; quantity: number; unit_price: number }[]
      status?: string
      note?: string | null
      reference?: string | null
    }
  ): Promise<ApiResponse<Order>> {
    return this.request(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteOrder(
    orderId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/orders/${orderId}`, { method: 'DELETE' })
  }

  // Public endpoints
  async getPublicMenu(
    subdomain: string,
    listId?: string
  ): Promise<ApiResponse<{ tenant: Tenant; lists: PriceList[] }>> {
    const listFilter = listId ? `?list=${encodeURIComponent(listId)}` : ''
    return this.request(`/public/${subdomain}${listFilter}`)
  }

  /** Someone left their details on a shop's public list. Answers ok even when
   *  the shop is not taking leads — the server never tells a visitor about the
   *  business's plan. */
  async createLead(
    subdomain: string,
    data: {
      name: string
      phone?: string
      email?: string
      message?: string
      listId?: string | null
      listName?: string | null
      source?: 'form' | 'cart'
      /** Honeypot: kept hidden and empty on the real form. */
      website?: string
    }
  ): Promise<ApiResponse<{ ok: boolean }>> {
    const { listId, listName, ...rest } = data
    return this.request(`/public/${subdomain}/leads`, {
      method: 'POST',
      body: JSON.stringify({ ...rest, list_id: listId, list_name: listName }),
    })
  }

  async recordPublicView(
    subdomain: string,
    listId?: string,
    source?: string
  ): Promise<ApiResponse<{ ok: boolean }>> {
    const params = new URLSearchParams()
    if (listId) params.set('list', listId)
    if (source) params.set('source', source)
    const q = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/public/${subdomain}/view${q}`, { method: 'POST' })
  }

  // Import endpoints
  async importFromUrl(url: string): Promise<
    ApiResponse<{
      items: { name: string; price: number; description: string | null }[]
      count: number
    }>
  > {
    return this.request('/import/from-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
  }

  async importFromImages(imageUrls: string[]): Promise<
    ApiResponse<{
      items: { name: string; price: number; description: string | null }[]
      count: number
    }>
  > {
    return this.request('/import/from-images', {
      method: 'POST',
      body: JSON.stringify({ image_urls: imageUrls }),
    })
  }
}

export const api = new ApiService(API_URL)
export default api
