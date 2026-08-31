import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { saveAuthState } from './authPersistence'

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
  async (
    { email, code }: { email: string; code: string },
    { rejectWithValue }
  ) => {
    const response = await api.verifyCode(email, code)
    if (response.error || !response.data) {
      return rejectWithValue(response.error || 'Error')
    }
    api.setToken(response.data.token)
    saveAuthState(response.data.user, response.data.tenant)
    return { user: response.data.user, tenant: response.data.tenant }
  }
)

export const logout = createAsyncThunk('auth/logout', () => {
  api.setToken(null)
  saveAuthState(null, null)
  return null
})

export const refreshCurrentUser = createAsyncThunk(
  'auth/refreshCurrentUser',
  async (_, { rejectWithValue }) => {
    const response = await api.getCurrentUser()
    if (response.error || !response.data) {
      return rejectWithValue(response.error || 'Error')
    }
    return response.data
  }
)
