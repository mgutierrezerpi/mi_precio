import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AdminUiMode, Tenant, User, LoadingState } from '../../types'
import api from '../../services/api'

const AUTH_STORAGE_KEY = 'auth_state'

interface AuthState extends LoadingState {
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean
  pendingEmail: string | null
  codeSent: boolean
}

function loadAuthState(): Partial<AuthState> {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const { user, tenant } = JSON.parse(stored)
      const token = localStorage.getItem('auth_token')
      if (token && user && tenant) {
        return { user, tenant, isAuthenticated: true }
      }
    }
  } catch {
    // Invalid stored state
  }
  return { user: null, tenant: null, isAuthenticated: false }
}

function saveAuthState(user: User | null, tenant: Tenant | null) {
  if (user && tenant) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, tenant }))
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
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

export const sendCode = createAsyncThunk(
  'auth/sendCode',
  async ({ email }: { email: string }, { rejectWithValue }) => {
    const response = await api.sendCode(email)
    if (response.error) return rejectWithValue(response.error)
    return { email }
  }
)

export const verifyCode = createAsyncThunk(
  'auth/verifyCode',
  async ({ email, code }: { email: string; code: string }, { rejectWithValue }) => {
    const response = await api.verifyCode(email, code)
    if (response.error || !response.data) return rejectWithValue(response.error || 'Error')
    api.setToken(response.data.token)
    saveAuthState(response.data.user, response.data.tenant)
    return {
      user: response.data.user,
      tenant: response.data.tenant,
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  api.setToken(null)
  saveAuthState(null, null)
  return null
})

export const updateCurrentUser = createAsyncThunk(
  'auth/updateCurrentUser',
  async ({ simpleAdminUi, adminUiMode }: { simpleAdminUi?: boolean; adminUiMode?: AdminUiMode }, { rejectWithValue }) => {
    const response = await api.updateCurrentUser({ simpleAdminUi, adminUiMode })
    if (response.error || !response.data) return rejectWithValue(response.error || 'Error')
    return response.data
  }
)

export const refreshCurrentUser = createAsyncThunk(
  'auth/refreshCurrentUser',
  async (_, { rejectWithValue }) => {
    const response = await api.getCurrentUser()
    if (response.error || !response.data) return rejectWithValue(response.error || 'Error')
    return response.data
  }
)

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
      // Persist to localStorage
      if (state.user && action.payload) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: state.user, tenant: action.payload }))
      }
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
      .addCase(updateCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        saveAuthState(state.user, state.tenant)
      })
      .addCase(refreshCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        saveAuthState(state.user, state.tenant)
      })
  },
})

export const { setUser, setTenant, clearAuthError, resetCodeFlow } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectTenant = (state: { auth: AuthState }) => state.auth.tenant
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error
export const selectCodeSent = (state: { auth: AuthState }) => state.auth.codeSent
export const selectPendingEmail = (state: { auth: AuthState }) => state.auth.pendingEmail
export const selectAdminUiMode = (state: { auth: AuthState }): AdminUiMode => state.auth.user?.adminUiMode ?? (state.auth.user?.simpleAdminUi ? 'simple' : 'full')
export const selectSimpleAdminUi = (state: { auth: AuthState }) => selectAdminUiMode(state) === 'simple'
export const selectMediumAdminUi = (state: { auth: AuthState }) => selectAdminUiMode(state) === 'medium'
export const selectFullAdminUi = (state: { auth: AuthState }) => selectAdminUiMode(state) === 'full'

// Role-based permissions. Sessions stored before roles existed default to "owner".
const roleOf = (state: { auth: AuthState }) => state.auth.user?.role ?? 'owner'
// Can create/edit/delete catalog & CRM data (owners, admins, editors). Viewers are read-only.
export const selectCanEdit = (state: { auth: AuthState }) => ['owner', 'admin', 'editor'].includes(roleOf(state))
// Can manage the team and tenant settings (owners, admins).
export const selectIsAdmin = (state: { auth: AuthState }) => ['owner', 'admin'].includes(roleOf(state))
// Owner-only actions (change plan, delete account).
export const selectIsOwner = (state: { auth: AuthState }) => roleOf(state) === 'owner'
