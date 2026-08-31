import type { Tenant } from '../../types'
import type { AuthState } from './authSlice'

type RootAuthState = { auth: AuthState }

export const selectUser = (state: RootAuthState) => state.auth.user
export const selectTenant = (state: RootAuthState) => state.auth.tenant
export const selectIsAuthenticated = (state: RootAuthState) =>
  state.auth.isAuthenticated
export const selectAuthLoading = (state: RootAuthState) => state.auth.isLoading
export const selectAuthError = (state: RootAuthState) => state.auth.error
export const selectCodeSent = (state: RootAuthState) => state.auth.codeSent
export const selectPendingEmail = (state: RootAuthState) => state.auth.pendingEmail

export const tenantNeedsPlan = (tenant: Tenant | null | undefined) =>
  !!tenant?.planGate && (tenant.plan ?? 'free') === 'free'

export const selectNeedsPlan = (state: RootAuthState) =>
  tenantNeedsPlan(state.auth.tenant)

const roleOf = (state: RootAuthState) => state.auth.user?.role ?? 'owner'

export const selectCanEdit = (state: RootAuthState) =>
  ['owner', 'admin', 'editor'].includes(roleOf(state))
export const selectIsAdmin = (state: RootAuthState) =>
  ['owner', 'admin'].includes(roleOf(state))
export const selectIsOwner = (state: RootAuthState) => roleOf(state) === 'owner'
export const selectIsSuperAdmin = (state: RootAuthState) =>
  state.auth.user?.isSuperAdmin === true
