import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Tenant, User, LoadingState } from '../../types'
import { loadAuthState, saveAuthState } from './authPersistence'
import {
  logout,
  refreshCurrentUser,
  sendCode,
  verifyCode,
} from './authThunks'

export { logout, refreshCurrentUser, sendCode, verifyCode } from './authThunks'
export {
  selectAuthError,
  selectAuthLoading,
  selectCanEdit,
  selectCodeSent,
  selectIsAdmin,
  selectIsAuthenticated,
  selectIsOwner,
  selectIsSuperAdmin,
  selectNeedsPlan,
  selectPendingEmail,
  selectTenant,
  selectUser,
  tenantNeedsPlan,
} from './authSelectors'

export interface AuthState extends LoadingState {
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean
  pendingEmail: string | null
  codeSent: boolean
}

const persistedState = loadAuthState()

const initialState: AuthState = {
  user: persistedState.user ?? null,
  tenant: persistedState.tenant ?? null,
  isAuthenticated: persistedState.isAuthenticated ?? false,
  isLoading: false,
  error: null,
  pendingEmail: null,
  codeSent: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      saveAuthState(state.user, state.tenant)
    },
    setTenant: (state, action: PayloadAction<Tenant | null>) => {
      state.tenant = action.payload
      saveAuthState(state.user, action.payload)
    },
    clearAuthError: (state) => {
      state.error = null
    },
    resetCodeFlow: (state) => {
      state.pendingEmail = null
      state.codeSent = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // sendCode
      .addCase(sendCode.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendCode.fulfilled, (state, action) => {
        state.isLoading = false
        state.pendingEmail = action.payload.email
        state.codeSent = true
      })
      .addCase(sendCode.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Error al enviar código'
      })
      // verifyCode
      .addCase(verifyCode.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyCode.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.tenant = action.payload.tenant
        state.isAuthenticated = true
        state.pendingEmail = null
        state.codeSent = false
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Código inválido'
      })
      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.tenant = null
        state.isAuthenticated = false
        state.pendingEmail = null
        state.codeSent = false
      })

      .addCase(refreshCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        saveAuthState(state.user, state.tenant)
      })
  },
})

export const { setUser, setTenant, clearAuthError, resetCodeFlow } =
  authSlice.actions
export default authSlice.reducer
