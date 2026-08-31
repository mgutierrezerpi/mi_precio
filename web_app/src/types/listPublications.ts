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

