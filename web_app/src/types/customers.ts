

export interface Customer {
  id: string
  tenantId: string
  name: string
  rut: string | null
  email: string | null
  phone: string | null
  notes: string | null
  accessCodeEnabled: boolean
  accessListIds: string[]
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
export type LeadSource = 'form' | 'cart' | 'media_kit'

export interface Lead {
  id: string
  tenantId: string
  name: string
  phone: string | null
  email: string | null
  message: string | null
  customerId: string | null
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
  submissions: Lead[]
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
