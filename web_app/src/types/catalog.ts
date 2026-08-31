

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

