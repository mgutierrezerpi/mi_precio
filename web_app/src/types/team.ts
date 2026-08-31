import type { Tenant } from './billing'

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

