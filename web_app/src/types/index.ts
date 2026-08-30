// Core domain types for Mi Precio

export type PlanId = 'free' | 'micro' | 'plus' | 'pro'

/** Lemon Squeezy subscription states we surface. `cancelled` still has access
 *  until `endsAt`; `expired` is when the plan actually drops back to free. */
export type BillingStatus =
  | 'on_trial'
  | 'active'
  | 'paid'
  | 'past_due'
  | 'unpaid'
  | 'cancelled'
  | 'expired'
  | 'paused'

export interface PlanInfo {
  plan: PlanId
  limits: {
    products: number | null
    lists: number | null
    members: number | null
  }
  usage: { products: number; lists: number; members: number }
  features?: string[]
  /** When false there is no payment gateway, so plan changes apply immediately. */
  billingEnabled?: boolean
  /** True while the tenant still has to pick a plan before the CRM opens up. */
  planRequired?: boolean
  /** camelCase: `api.request` camelizes every response key. Declaring these in
   *  snake_case used to silently break every read (the portal link never
   *  rendered) because the type lied and TS could not catch it. */
  billing?: {
    provider: string | null
    customerId: string | null
    subscriptionId: string | null
    variantId: string | null
    status: BillingStatus | null
    renewsAt: string | null
    endsAt: string | null
    trialEndsAt: string | null
    portalUrl: string | null
    updatePaymentUrl: string | null
    cardBrand: string | null
    cardLastFour: string | null
  }
}

export interface MarketplaceBusiness {
  name: string
  subdomain: string
  logoUrl: string | null
  description: string | null
  address: string | null
  businessCategory: string | null
  whatsappUrl: string | null
  websiteUrl: string | null
  instagramUrl: string | null
  tiktokUrl: string | null
  emailUrl: string | null
  distanceKm: number | null
}

export interface Tenant {
  id: string
  name: string
  subdomain: string
  currency: string
  plan: PlanId
  /** Signed up after paid onboarding shipped: no plan, no CRM. Absent on
   *  sessions stored before this field existed (treated as not gated). */
  planGate?: boolean
  logoUrl: string | null
  brandColor: string | null
  linktreeAccentColor?: string | null
  description: string | null
  listDesign: ListDesign | null
  listBgUrl: string | null
  listBgOverlay: boolean
  listHeroColor: string | null
  socialInstagram: string | null
  socialFacebook: string | null
  socialTiktok: string | null
  socialWebsite: string | null
  socialWhatsapp: string | null
  leadsEnabled: boolean
  language: string
  timezone: string
  deliveryEnabled: boolean
  marketplaceEnabled: boolean
  marketplaceLatitude: number | null
  marketplaceLongitude: number | null
  businessCategory: string | null
  whatsappUrl: string | null
  websiteUrl: string | null
  instagramUrl: string | null
  legalName: string | null
  taxId: string | null
  address: string | null
  features?: Record<string, boolean>
  createdAt: string
  updatedAt: string
}

export interface FeatureFlagTenant {
  id: string
  name: string
  subdomain: string
  enabled: boolean
  hasOverride: boolean
}

export interface FeatureFlag {
  key: string
  description: string | null
  defaultEnabled: boolean
  tenants: FeatureFlagTenant[]
}

/** Visual template for the public price list. */
export type ListDesign =
  | 'store'
  | 'classic'
  | 'nordic'
  | 'fine'
  | 'modern'
  | 'photo'
  | 'cards'
  | 'catalog'
  | 'tech'
  | 'pencil-bakery'
  | 'pencil-garden'
  | 'pencil-market'
  | 'pencil-evening'
  | 'pencil-workshop'
  | 'pencil-cheese'
  | 'pencil-flower'
  | 'pencil-flower-summer'
  | 'pencil-flower-winter'
  | 'pencil-flower-spring'
  | 'pencil-wine'
  | 'pencil-cheese-alternating'
  | 'pencil-hardware-alternating'
  | 'pencil-hardware-weekend'
  | 'pencil-hardware-shelf'
  | 'pencil-casa-ritual'
  | 'pencil-casa-bath'
  | 'pencil-casa-signature'
  | 'pencil-casa-services'
  | 'pencil-auto-detail'
  | 'pencil-blush-bloom'
  | 'pencil-nova'
  | 'pencil-beardy'
  | 'pencil-calm-spa'
  | 'pencil-union-barber'
  | 'pencil-studio-mono'
  | 'pencil-beauty-issue'
  | 'pencil-obsidian-quarterly'
  | 'pencil-cafecitos'
  | 'pencil-journal'

export type ListKind = 'product' | 'service'
export type PriceListVariantType =
  | 'customer'
  | 'promotion'
  | 'seasonal'
  | 'custom'

export interface PriceList {
  id: string
  tenantId: string
  publicSlug?: string
  name: string
  slug: string | null
  published: boolean
  showOnIndex: boolean
  kind: ListKind
  /** Null for a root list; variants are child lists with their own item snapshot. */
  parentListId?: string | null
  variantType?: PriceListVariantType | null
  customerId?: string | null
  startsAt?: string | null
  endsAt?: string | null
  /** Per-list appearance. `null` inherits the tenant's `list*` defaults. */
  design: ListDesign | null
  heroColor: string | null
  bgUrl: string | null
  bgOverlay: boolean | null
  captureViewerInfo?: boolean
  itemCount: number
  /** `published` is intent; `live` is what the plan actually serves. A published
   *  list goes `live: false` when the plan allows fewer lists than are published
   *  (downgrade) or the subscription expired. Nothing is unpublished: paying
   *  again brings it back on its own. */
  live: boolean
  createdAt: string
  updatedAt: string
  versions?: ListVersion[]
}

export interface MagazinePage {
  id: string
  magazineId: string
  position: number
  pageType: string
  title: string | null
  imageUrl: string | null
  content: Record<string, unknown> | null
}

export const MAGAZINE_DESIGNS = [
  'pencil-journal',
  'wild-stem',
  'aqua-objects',
  'editorial',
  'catalog',
] as const

export type MagazineDesign = (typeof MAGAZINE_DESIGNS)[number]

export interface Magazine {
  id: string
  tenantId?: string
  name: string
  slug: string | null
  issue: string | null
  description: string | null
  design: MagazineDesign | string
  coverImageUrl: string | null
  published?: boolean
  showOnIndex?: boolean
  pages: MagazinePage[]
  createdAt?: string
  updatedAt?: string
}

export interface PublicViewer {
  id: string
  tenantId: string
  listId: string
  listName: string
  name: string
  email: string | null
  phone: string | null
  customerId: string | null
  ipAddress: string | null
  viewCount: number
  createdAt: string
  lastSeenAt: string
}

export interface PublicViewerStats {
  anonymousDismissals: number
}

export interface ListVersion {
  id: string
  listId: string
  versionNumber: number
  name: string
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  /** Authored public-list copy and layout. Null keeps legacy category rendering. */
  content: ListContent | null
  contentRevision: number
  items?: Item[]
}

export interface ListContent {
  schemaVersion: 1
  hero?: {
    eyebrow?: string
    title?: string
    body?: string
    stats?: { value: string; label: string }[]
  }
  /** Copy and media that only templates with editorial regions consume. */
  template?: {
    font?: 'sans' | 'editorial' | 'serif' | 'mono' | 'code-pro'
    checkoutChannel?: 'whatsapp' | 'instagram'
    instagramHandle?: string
    priceFormat?: '$' | 'U$D' | 'USD'
    image?: string
    /** Optional identity and story media for the stories-style collaboration template. */
    logo?: string
    profileName?: string
    profileImage?: string
    storyVideos?: string[]
    storyMetrics?: { views: string; likes: string; comments: string }[]
    filmImages?: string[]
    collaborationHeading?: string
    storiesHeading?: string
    imageLabel?: string
    imageTitle?: string
    promoEyebrow?: string
    promoTitle?: string
    promoBody?: string
    promoPrice?: string
    promoNote?: string
    footerLeft?: string
    footerRight?: string
  }
  blocks: ListContentBlock[]
}

export type ListContentBlock =
  | {
      id: string
      type: 'catalog'
      sections: {
        id: string
        title: string
        body?: string
        source: { kind: 'category'; value: string }
      }[]
    }
  | { id: string; type: 'promotion_strip'; items: string[] }
  | {
      id: string
      type: 'contact'
      showWhatsapp?: boolean
      hours?: { days: string; hours: string }[]
    }

export interface Item {
  id: string
  listVersionId: string
  name: string
  price: string
  currency: string
  description: string | null
  position: number
  imageUrl: string | null
  imageThumbUrl: string | null
  category: string | null
  /** The catalog product this item came from, when applicable (null for manual/imported items). */
  productId: string | null
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  tenantId: string
  name: string
  sku: string | null
  price: string
  currency: string
  available: boolean
  description: string | null
  imageUrl: string | null
  imageThumbUrl: string | null
  category: string | null
  position: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  tenantId: string
  name: string
  description: string | null
  color: string | null
  position: number
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  tenantId: string
  name: string
  rut: string | null
  email: string | null
  phone: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  ordersCount: number
  totalSpent: string
  lastOrderAt: string | null
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: string
}

export interface Order {
  id: string
  tenantId: string
  customerId: string
  reference: string | null
  total: string
  currency: string
  status: string
  note: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'discarded'
export type LeadSource = 'form' | 'cart'

export interface Lead {
  id: string
  tenantId: string
  name: string
  phone: string | null
  email: string | null
  message: string | null
  listId: string | null
  listName: string | null
  source: LeadSource
  status: LeadStatus
  createdAt: string
  updatedAt: string
}

export interface CustomerStats {
  total: number
  active: number
  new: number
  recurring: number
}

export interface CustomerDetail {
  customer: Customer
  orders: Order[]
}

export interface Activity {
  id: string
  action: string
  summary: string
  /** Dynamic values (name, email, amount…) for per-locale rendering; null for pre-i18n rows. */
  meta: Record<string, string> | null
  actor: string | null
  entityType: string | null
  entityId: string | null
  createdAt: string
}

export interface NotifPrefs {
  sales: boolean
  catalog: boolean
  customers: boolean
  leads: boolean
  team: boolean
}

export interface NotificationsData {
  items: Activity[]
  unread: number
  prefs: NotifPrefs
}

// Team types
export type Role = 'owner' | 'admin' | 'editor' | 'viewer'

export interface TeamMember {
  id: string
  email: string
  tenantId: string
  role: Role
  name: string
  createdAt: string
  updatedAt: string
  lastSeenAt: string | null
}

export interface Invitation {
  id: string
  email: string
  role: Role
  status: string
  createdAt: string
}

export interface MemberStats {
  members: number
  active: number
  pending: number
  roles: number
}

// Auth types
export interface User {
  id: string
  email: string
  tenantId: string
  role: Role
  /** Optional for sessions persisted before platform-level access existed. */
  isSuperAdmin?: boolean
  name: string
  createdAt: string
  updatedAt: string
}

export interface AuthToken {
  token: string
  user: User
  tenant: Tenant
}

export type LinkTreeLinkStyle = 'featured' | 'dark' | 'light'
export type LinkTreeTemplate = 'botanical' | 'editorial' | 'atelier'
export type LinkTreeFont = 'sans' | 'editorial' | 'mono' | 'code-pro'

export interface LinkTreeLink {
  id: string | null
  title: string
  description: string | null
  url: string
  icon: string
  style: LinkTreeLinkStyle
  enabled: boolean
}

export interface LinkTree {
  id: string
  tenantId: string
  publicSlug: string
  displayName: string
  handle: string | null
  bio: string | null
  avatarUrl: string | null
  accentColor: string
  backgroundColor: string
  template: LinkTreeTemplate
  font: LinkTreeFont
  tags: string[]
  links: LinkTreeLink[]
  instagramUrl: string | null
  tiktokUrl: string | null
  emailUrl: string | null
  whatsappUrl: string | null
  websiteUrl: string | null
  locationUrl: string | null
  published: boolean
  createdAt: string
  updatedAt: string
}

// UI State types
export interface LoadingState {
  isLoading: boolean
  error: string | null
}
