import type { Tenant, User } from '../../types'

const AUTH_STORAGE_KEY = 'auth_state'

export type PersistedAuthState = {
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean
}

export function loadAuthState(): PersistedAuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const { user, tenant } = JSON.parse(stored)
      const token = localStorage.getItem('auth_token')
      if (token && user && tenant) return { user, tenant, isAuthenticated: true }
    }
  } catch {
    // Invalid stored state is treated as a signed-out session.
  }
  return { user: null, tenant: null, isAuthenticated: false }
}

export function saveAuthState(user: User | null, tenant: Tenant | null) {
  if (user && tenant) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, tenant }))
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}
