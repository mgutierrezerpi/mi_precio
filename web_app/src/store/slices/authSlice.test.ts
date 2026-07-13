import { describe, it, expect } from 'vitest'
import authReducer, {
  setUser,
  setTenant,
  clearAuthError,
} from './authSlice'
import type { User, Tenant } from '../../types'

describe('authSlice', () => {
  const initialState = {
    user: null,
    tenant: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    pendingEmail: null,
    codeSent: false,
  }

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setUser', () => {
    const user: User = {
      id: '1',
      email: 'test@test.com',
      tenantId: '1',
      role: 'owner',
      name: 'test',
      simpleAdminUi: false,
      adminUiMode: 'full',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }
    const actual = authReducer(initialState, setUser(user))
    expect(actual.user).toEqual(user)
    expect(actual.isAuthenticated).toBe(true)
  })

  it('should handle setUser with null', () => {
    const user: User = {
      id: '1',
      email: 'test@test.com',
      tenantId: '1',
      role: 'owner',
      name: 'test',
      simpleAdminUi: false,
      adminUiMode: 'full',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }
    const stateWithUser = {
      ...initialState,
      user,
      isAuthenticated: true,
    }
    const actual = authReducer(stateWithUser, setUser(null))
    expect(actual.user).toBeNull()
    expect(actual.isAuthenticated).toBe(false)
  })

  it('should handle setTenant', () => {
    const tenant: Tenant = {
      id: '1',
      name: 'Test Restaurant',
      subdomain: 'test',
      currency: 'ARS',
      plan: 'free',
      logoUrl: null,
      brandColor: null,
      description: null,
      listDesign: null,
      listBgUrl: null,
      listBgOverlay: false,
      listHeroColor: null,
      language: 'es',
      timezone: 'America/Montevideo',
      deliveryEnabled: false,
      legalName: null,
      taxId: null,
      address: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }
    const actual = authReducer(initialState, setTenant(tenant))
    expect(actual.tenant).toEqual(tenant)
  })

  it('should handle clearAuthError', () => {
    const stateWithError = { ...initialState, error: 'Login failed' }
    const actual = authReducer(stateWithError, clearAuthError())
    expect(actual.error).toBeNull()
  })
})
