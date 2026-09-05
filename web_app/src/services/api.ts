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
  CustomerStats,
  CustomerDetail,
  Lead,
  LeadStatus,
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
  PublicViewer,
  PublicViewerStats,
  Magazine,
  MagazinePage,
  LinkTree,
  FeatureFlag,
} from '../types'
import { localeForHostname } from '../lib/domainLocale'

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
  customerId?: string | null
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

function listContentBody(content: NonNullable<ListVersion['content']>) {
  return {
    schema_version: content.schemaVersion,
    ...(content.hero ? { hero: content.hero } : {}),
    ...(content.template
      ? {
          template: {
            ...(content.template.font !== undefined
              ? { font: content.template.font }
              : {}),
            ...(content.template.checkoutChannel !== undefined
              ? { checkout_channel: content.template.checkoutChannel }
              : {}),
            ...(content.template.instagramHandle !== undefined
              ? { instagram_handle: content.template.instagramHandle }
              : {}),
            ...(content.template.priceFormat !== undefined
              ? { price_format: content.template.priceFormat }
              : {}),
            ...(content.template.image !== undefined
              ? { image: content.template.image }
              : {}),
            ...(content.template.logo !== undefined
              ? { logo: content.template.logo }
              : {}),
            ...(content.template.profileName !== undefined
              ? { profile_name: content.template.profileName }
              : {}),
            ...(content.template.profileImage !== undefined
              ? { profile_image: content.template.profileImage }
              : {}),
            ...(content.template.storyVideos !== undefined
              ? { story_videos: content.template.storyVideos }
              : {}),
            ...(content.template.storyMetrics !== undefined
              ? { story_metrics: content.template.storyMetrics }
              : {}),
            ...(content.template.filmImages !== undefined
              ? { film_images: content.template.filmImages }
              : {}),
            ...(content.template.collaborationHeading !== undefined
              ? { collaboration_heading: content.template.collaborationHeading }
              : {}),
            ...(content.template.storiesHeading !== undefined
              ? { stories_heading: content.template.storiesHeading }
              : {}),
            ...(content.template.imageLabel !== undefined
              ? { image_label: content.template.imageLabel }
              : {}),
            ...(content.template.imageTitle !== undefined
              ? { image_title: content.template.imageTitle }
              : {}),
            ...(content.template.promoEyebrow !== undefined
              ? { promo_eyebrow: content.template.promoEyebrow }
              : {}),
            ...(content.template.promoTitle !== undefined
              ? { promo_title: content.template.promoTitle }
              : {}),
            ...(content.template.promoBody !== undefined
              ? { promo_body: content.template.promoBody }
              : {}),
            ...(content.template.promoPrice !== undefined
              ? { promo_price: content.template.promoPrice }
              : {}),
            ...(content.template.promoNote !== undefined
              ? { promo_note: content.template.promoNote }
              : {}),
            ...(content.template.footerLeft !== undefined
              ? { footer_left: content.template.footerLeft }
              : {}),
            ...(content.template.footerRight !== undefined
              ? { footer_right: content.template.footerRight }
              : {}),
          },
        }
      : {}),
    blocks: content.blocks.map((block) => {
      if (block.type === 'contact') {
        const { showWhatsapp, ...rest } = block
        return {
          ...rest,
          ...(showWhatsapp === undefined
            ? {}
            : { show_whatsapp: showWhatsapp }),
        }
      }
      return block
    }),
  }
}

function magazinePageBody(data: {
  position?: number
  pageType?: string
  title?: string | null
  imageUrl?: string | null
  content?: Record<string, unknown> | null
}) {
  const { pageType, imageUrl, ...rest } = data
  return {
    ...rest,
    ...(pageType === undefined ? {} : { page_type: pageType }),
    ...(imageUrl === undefined ? {} : { image_url: imageUrl }),
  }
}

function linkTreeBody(data: Partial<LinkTree>) {
  const body = { ...data }
  delete body.tenantId
  delete body.id
  delete body.createdAt
  delete body.updatedAt
  return {
    ...(body.publicSlug === undefined ? {} : { public_slug: body.publicSlug }),
    ...(body.displayName === undefined
      ? {}
      : { display_name: body.displayName }),
    ...(body.handle === undefined ? {} : { handle: body.handle }),
    ...(body.bio === undefined ? {} : { bio: body.bio }),
    ...(body.avatarUrl === undefined ? {} : { avatar_url: body.avatarUrl }),
    ...(body.accentColor === undefined
      ? {}
      : { accent_color: body.accentColor }),
    ...(body.backgroundColor === undefined
      ? {}
      : { background_color: body.backgroundColor }),
    ...(body.template === undefined ? {} : { template: body.template }),
    ...(body.font === undefined ? {} : { font: body.font }),
    ...(body.tags === undefined ? {} : { tags: body.tags }),
    ...(body.links === undefined ? {} : { links: body.links }),
    ...(body.instagramUrl === undefined
      ? {}
      : { instagram_url: body.instagramUrl }),
    ...(body.tiktokUrl === undefined ? {} : { tiktok_url: body.tiktokUrl }),
    ...(body.emailUrl === undefined ? {} : { email_url: body.emailUrl }),
    ...(body.whatsappUrl === undefined
      ? {}
      : { whatsapp_url: body.whatsappUrl }),
    ...(body.websiteUrl === undefined ? {} : { website_url: body.websiteUrl }),
    ...(body.locationUrl === undefined
      ? {}
      : { location_url: body.locationUrl }),
    ...(body.published === undefined ? {} : { published: body.published }),
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
        // Public viewer cookies must work when the local frontend and API run
        // on different ports, while the production proxy remains same-origin.
        credentials: options.credentials ?? 'include',
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

  async getLinkTree(tenantId: string): Promise<ApiResponse<LinkTree>> {
    return this.request(`/tenants/${tenantId}/linktree`)
  }

  async updateLinkTree(
    tenantId: string,
    data: Partial<LinkTree>
  ): Promise<ApiResponse<LinkTree>> {
    return this.request(`/tenants/${tenantId}/linktree`, {
      method: 'PATCH',
      body: JSON.stringify(linkTreeBody(data)),
    })
  }

  async uploadLinkTreeAvatar(
    tenantId: string,
    file: Blob
  ): Promise<ApiResponse<{ url: string }>> {
    const body = new FormData()
    body.append('image', file, 'linktree-avatar')
    return this.request(`/tenants/${tenantId}/linktree/avatar`, {
      method: 'POST',
      body,
    })
  }

  async uploadListTemplateImage(
    tenantId: string,
    file: Blob
  ): Promise<ApiResponse<{ url: string }>> {
    const body = new FormData()
    body.append('image', file, 'list-template-image')
    return this.request(`/tenants/${tenantId}/list-template/image`, {
      method: 'POST',
      body,
    })
  }

  async uploadListTemplateVideo(
    tenantId: string,
    file: Blob
  ): Promise<ApiResponse<{ url: string }>> {
    const body = new FormData()
    body.append('video', file, 'list-story.mp4')
    return this.request(`/tenants/${tenantId}/list-template/video`, {
      method: 'POST',
      body,
    })
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
      language?: string
      timezone?: string
      deliveryEnabled?: boolean
      marketplaceEnabled?: boolean
      marketplaceLatitude?: number | null
      marketplaceLongitude?: number | null
      businessCategory?: string | null
      whatsappUrl?: string | null
      websiteUrl?: string | null
      instagramUrl?: string | null
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
      legalName: 'legal_name',
      taxId: 'tax_id',
      deliveryEnabled: 'delivery_enabled',
      marketplaceEnabled: 'marketplace_enabled',
      marketplaceLatitude: 'marketplace_latitude',
      marketplaceLongitude: 'marketplace_longitude',
      businessCategory: 'business_category',
      whatsappUrl: 'whatsapp_url',
      websiteUrl: 'website_url',
      instagramUrl: 'instagram_url',
    }
    const body: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) body[map[k] ?? k] = v
    return this.request(`/tenants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  async uploadTenantLogo(
    tenantId: string,
    file: Blob
  ): Promise<ApiResponse<{ url: string }>> {
    const body = new FormData()
    body.append('image', file, 'business-logo')
    return this.request(`/tenants/${tenantId}/logo`, {
      method: 'POST',
      body,
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
        locale: localeForHostname(),
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
    return this.request('/billing/cancellations', {
      method: 'POST',
      body: JSON.stringify({ tenant_id: tenantId }),
    })
  }

  /** Undo a cancellation that has not lapsed yet. */
  async resumeSubscription(tenantId: string): Promise<ApiResponse<Tenant>> {
    return this.request('/billing/resumptions', {
      method: 'POST',
      body: JSON.stringify({ tenant_id: tenantId }),
    })
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
      captureViewerInfo?: boolean
      isPrivate?: boolean
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
      captureViewerInfo: 'capture_viewer_info',
      isPrivate: 'is_private',
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

  async getPublicViewers(
    tenantId: string
  ): Promise<ApiResponse<PublicViewer[]>> {
    return this.request(`/tenants/${tenantId}/public-viewers`)
  }

  async getPublicViewerStats(
    tenantId: string
  ): Promise<ApiResponse<PublicViewerStats>> {
    return this.request(`/tenants/${tenantId}/public-viewers/stats`)
  }

  async promotePublicViewer(
    tenantId: string,
    viewerId: string
  ): Promise<ApiResponse<Customer>> {
    return this.request(
      `/tenants/${tenantId}/public-viewers/${viewerId}/promote`,
      {
        method: 'POST',
      }
    )
  }

  async deletePublicViewer(
    tenantId: string,
    viewerId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/tenants/${tenantId}/public-viewers/${viewerId}`, {
      method: 'DELETE',
    })
  }

  async recordPublicViewerDismissal(
    subdomain: string,
    listId: string
  ): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/public/${subdomain}/viewer-dismissed`, {
      method: 'POST',
      body: JSON.stringify({ list_id: listId }),
    })
  }

  async submitPublicViewer(
    subdomain: string,
    data: {
      listId: string
      name: string
      email?: string
      phone?: string
    }
  ): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/public/${subdomain}/viewer`, {
      method: 'POST',
      body: JSON.stringify({
        list_id: data.listId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
      }),
    })
  }

  async deleteList(listId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/lists/${listId}`, { method: 'DELETE' })
  }

  // Magazine endpoints
  async getMagazines(tenantId: string): Promise<ApiResponse<Magazine[]>> {
    return this.request(`/tenants/${tenantId}/magazines`)
  }

  async createMagazine(
    tenantId: string,
    data: {
      name: string
      issue?: string | null
      description?: string | null
      design?: string
      coverImageUrl?: string | null
      published?: boolean
      showOnIndex?: boolean
    }
  ): Promise<ApiResponse<Magazine>> {
    const { showOnIndex, coverImageUrl, ...rest } = data
    return this.request(`/tenants/${tenantId}/magazines`, {
      method: 'POST',
      body: JSON.stringify({
        ...rest,
        ...(coverImageUrl === undefined
          ? {}
          : { cover_image_url: coverImageUrl }),
        ...(showOnIndex === undefined ? {} : { show_on_index: showOnIndex }),
      }),
    })
  }

  async updateMagazine(
    magazineId: string,
    data: {
      name?: string
      slug?: string
      issue?: string | null
      description?: string | null
      design?: string
      coverImageUrl?: string | null
      published?: boolean
      showOnIndex?: boolean
    }
  ): Promise<ApiResponse<Magazine>> {
    const body: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue
      const apiKey =
        key === 'showOnIndex'
          ? 'show_on_index'
          : key === 'coverImageUrl'
            ? 'cover_image_url'
            : key
      body[apiKey] = value
    }
    return this.request(`/magazines/${magazineId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  async deleteMagazine(
    magazineId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/magazines/${magazineId}`, { method: 'DELETE' })
  }

  async createMagazinePage(
    magazineId: string,
    data: {
      position: number
      pageType?: string
      title?: string | null
      imageUrl?: string | null
      content?: Record<string, unknown> | null
    }
  ): Promise<ApiResponse<MagazinePage>> {
    return this.request(`/magazines/${magazineId}/pages`, {
      method: 'POST',
      body: JSON.stringify(magazinePageBody(data)),
    })
  }

  async updateMagazinePage(
    pageId: string,
    data: {
      position?: number
      pageType?: string
      title?: string | null
      imageUrl?: string | null
      content?: Record<string, unknown> | null
    }
  ): Promise<ApiResponse<MagazinePage>> {
    return this.request(`/magazine-pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify(magazinePageBody(data)),
    })
  }

  async deleteMagazinePage(
    pageId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/magazine-pages/${pageId}`, { method: 'DELETE' })
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

  async updateVersionContent(
    versionId: string,
    content: NonNullable<ListVersion['content']>,
    contentRevision: number
  ): Promise<ApiResponse<ListVersion>> {
    return this.request(`/versions/${versionId}/content`, {
      method: 'PATCH',
      body: JSON.stringify({
        content: listContentBody(content),
        content_revision: contentRevision,
      }),
    })
  }

  async getListDesigns(): Promise<
    ApiResponse<{ id: ListDesign; blocks: string[] }[]>
  > {
    return this.request('/list-designs')
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
    listId?: string,
    customerId?: string
  ): Promise<ApiResponse<ReportData>> {
    const listFilter = listId ? `&list_id=${encodeURIComponent(listId)}` : ''
    const customerFilter = customerId
      ? `&customer_id=${encodeURIComponent(customerId)}`
      : ''
    return this.request(
      `/tenants/${tenantId}/stats/reports?days=${days}${listFilter}${customerFilter}`
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

  async getPublicLinkTree(
    subdomain: string
  ): Promise<
    ApiResponse<{
      tenant: { name: string; subdomain: string }
      linktree: LinkTree
    }>
  > {
    return this.request(`/public/${encodeURIComponent(subdomain)}/linktree`)
  }

  async getDeveloperAccess(): Promise<
    ApiResponse<{ enabled: boolean; userId: string }>
  > {
    return this.request('/developer/access')
  }

  async getDeveloperFeatureFlags(): Promise<ApiResponse<FeatureFlag[]>> {
    return this.request('/developer/feature-flags')
  }

  async setDeveloperFeatureFlag(
    key: string,
    tenantId: string,
    enabled: boolean
  ): Promise<ApiResponse<{ key: string; tenantId: string; enabled: boolean }>> {
    return this.request(
      `/developer/feature-flags/${encodeURIComponent(key)}/tenants/${encodeURIComponent(tenantId)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
      }
    )
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
  async getLeads(
    tenantId: string,
    status?: LeadStatus
  ): Promise<ApiResponse<Lead[]>> {
    const query = status ? `?status=${status}` : ''
    return this.request(`/tenants/${tenantId}/leads${query}`)
  }

  async getFormSubmissions(tenantId: string): Promise<ApiResponse<Lead[]>> {
    return this.request(`/tenants/${tenantId}/media-kit-submissions`)
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

  async convertLead(
    tenantId: string,
    leadId: string
  ): Promise<ApiResponse<Customer>> {
    return this.request(`/tenants/${tenantId}/leads/${leadId}/convert`, {
      method: 'POST',
    })
  }

  async linkLeadCustomer(
    tenantId: string,
    leadId: string,
    customerId: string | null
  ): Promise<ApiResponse<Lead>> {
    return this.request(`/tenants/${tenantId}/leads/${leadId}/customer`, {
      method: 'PATCH',
      body: JSON.stringify({ customer_id: customerId }),
    })
  }

  async deleteFormSubmission(
    tenantId: string,
    leadId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/tenants/${tenantId}/leads/${leadId}`, {
      method: 'DELETE',
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
      accessCode?: string | null
      accessListIds?: string[]
    }
  ): Promise<ApiResponse<Customer>> {
    const { accessCode, accessListIds, ...customer } = data
    return this.request(`/tenants/${tenantId}/customers`, {
      method: 'POST',
      body: JSON.stringify({
        ...customer,
        ...(accessCode !== undefined ? { access_code: accessCode } : {}),
        ...(accessListIds !== undefined
          ? { access_list_ids: accessListIds }
          : {}),
      }),
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
      accessCode?: string | null
      accessListIds?: string[]
    }
  ): Promise<ApiResponse<Customer>> {
    const body: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      body[key === 'accessCode' ? 'access_code' : key === 'accessListIds' ? 'access_list_ids' : key] = value
    }
    return this.request(`/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
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
  ): Promise<
    ApiResponse<{
      tenant: Tenant
      lists: PriceList[]
      magazines: Magazine[]
      viewerIdentified?: boolean
    }>
  > {
    const listFilter = listId ? `?list=${encodeURIComponent(listId)}` : ''
    return this.request(`/public/${subdomain}${listFilter}`)
  }

  async unlockPublicList(
    subdomain: string,
    listId: string,
    code: string
  ): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/public/${subdomain}/lists/${encodeURIComponent(listId)}/access`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async getPublicMagazine(
    subdomain: string,
    magazineId: string
  ): Promise<ApiResponse<{ tenant: Tenant; magazine: Magazine }>> {
    return this.request(
      `/public/${subdomain}/magazines/${encodeURIComponent(magazineId)}`
    )
  }

  async createLead(
    subdomain: string,
    data: {
      name: string
      phone?: string
      email?: string
      message?: string
      listId?: string | null
      listName?: string | null
      source?: 'form' | 'cart' | 'media_kit'
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
