import type { ListDesign } from '../../types'

export type ApiResponse<T> =
  | { data: T; error?: never }
  | { data?: never; error: string }

export type VisitBucket = {
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

export type ProductInput = {
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

export type ProductPatch = Partial<ProductInput> & { priceListIds?: string[] }
export type CustomerInput = {
  name: string
  rut?: string | null
  email?: string | null
  phone?: string | null
  notes?: string | null
}
export type OrderItem = { name: string; quantity: number; unit_price: number }
export type OrderInput = {
  items: OrderItem[]
  status?: string
  note?: string | null
  currency?: string | null
  reference?: string | null
}
export type OrderPatch = Partial<Omit<OrderInput, 'currency'>>

export type TenantPatch = {
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

export type ListPatch = {
  name?: string
  slug?: string
  published?: boolean
  showOnIndex?: boolean
  kind?: 'product' | 'service'
  parentListId?: string | null
  design?: ListDesign | null
  heroColor?: string | null
  bgUrl?: string | null
  bgOverlay?: boolean | null
  captureViewerInfo?: boolean
}

export type MagazineInput = {
  name: string
  issue?: string | null
  description?: string | null
  design?: string
  coverImageUrl?: string | null
  published?: boolean
  showOnIndex?: boolean
}
export type MagazinePatch = Partial<MagazineInput>
export type MagazinePageInput = {
  position?: number
  pageType?: string
  title?: string | null
  imageUrl?: string | null
  content?: Record<string, unknown> | null
}
