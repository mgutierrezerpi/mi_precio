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
  slug: string | null
  published: boolean
  showOnIndex: boolean
  itemCount: number
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
