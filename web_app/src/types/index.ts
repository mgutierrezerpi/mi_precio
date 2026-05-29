// Core domain types for Mi Precio

export interface Tenant {
  id: string
  name: string
  subdomain: string
  currency: string
  createdAt: string
  updatedAt: string
}

export interface PriceList {
  id: string
  tenantId: string
  name: string
  published: boolean
  showOnIndex: boolean
  createdAt: string
  updatedAt: string
  versions?: ListVersion[]
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
  category: string | null
  createdAt: string
  updatedAt: string
}

// Auth types
export interface User {
  id: string
  email: string
  tenantId: string
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
