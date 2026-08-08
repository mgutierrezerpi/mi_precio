// Core domain types for Mi Precio

export type PlanId = 'free' | 'micro' | 'plus' | 'pro'

export interface PlanInfo {
  plan: PlanId
  limits: {
    products: number | null
    lists: number | null
    members: number | null
  }
  usage: { products: number; lists: number; members: number }
  /** When false there is no payment gateway, so plan changes apply immediately. */
  billingEnabled?: boolean
  /** True while the tenant still has to pick a plan before the CRM opens up. */
  planRequired?: boolean
  billing?: {
    provider: string | null
    customer_id: string | null
    subscription_id: string | null
    variant_id: string | null
    status: string | null
    renews_at: string | null
    ends_at: string | null
    trial_ends_at: string | null
    portal_url: string | null
    update_payment_url: string | null
    card_brand: string | null
    card_last_four: string | null
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
  description: string | null
  listDesign: ListDesign | null
  listBgUrl: string | null
  listBgOverlay: boolean
  listHeroColor: string | null
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
  createdAt: string
  updatedAt: string
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

export type ListKind = 'product' | 'service'
export type PriceListVariantType =
  | 'customer'
  | 'promotion'
  | 'seasonal'
  | 'custom'

export interface PriceList {
  id: string
  tenantId: string
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
  createdAt: string
  updatedAt: string
  versions?: ListVersion[]
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
  items?: Item[]
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
  name: string
  createdAt: string
  updatedAt: string
}

export interface AuthToken {
  token: string
  user: User
  tenant: Tenant
}

// UI State types
export interface LoadingState {
  isLoading: boolean
  error: string | null
}
