import type { Item, ListDesign, ListVersion, Tenant } from '../../types'

export interface PublicList {
  id: string
  name: string
  slug: string | null
  kind?: 'product' | 'service'
  showOnIndex?: boolean
  design?: ListDesign | null
  heroColor?: string | null
  bgUrl?: string | null
  bgOverlay?: boolean | null
  captureViewerInfo?: boolean
  version: ListVersion & { items: Item[] }
}

export interface PublicMenuData {
  tenant: Tenant
  lists: PublicList[]
  magazines?: import('../../types').Magazine[]
  viewerIdentified?: boolean
}

export const BASE = {
  bg: '#FAFAF7',
  ink: '#0F0D1A',
  body: '#44424E',
  muted: '#84818E',
  accent: '#7C3AED',
  accent2: '#6D28D9',
  line: '#E5E2DC',
}

export const MIPRECIO_LOGO_WHITE = '/miprecio-logo-white-pencil.webp'

export const recentViews = new Map<string, number>()

export function normalizeCategory(value?: string | null) {
  return (value?.trim() || 'Otros').toLowerCase()
}

export function displayCategory(value?: string | null) {
  const category = value?.trim() || 'Otros'
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export function formatPrice(price: string | number) {
  return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(
    typeof price === 'number' ? price : parseFloat(price)
  )
}

export function moneyFor(currency: string, price: string | number) {
  return `${currency}\u00a0${formatPrice(price)}`
}
