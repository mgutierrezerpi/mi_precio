import type { AuthToken, User } from '../../types'
import type { ApiClient } from './client'
import type { ApiResponse } from './types'

export const authMethods = {
  sendCode(this: ApiClient, email: string): Promise<ApiResponse<{ email: string }>> {
    return this.request('/auth/codes', { method: 'POST', body: JSON.stringify({ email }) })
  },
  verifyCode(this: ApiClient, email: string, code: string): Promise<ApiResponse<AuthToken>> {
    return this.request('/auth/tokens', { method: 'POST', body: JSON.stringify({ email, code }) })
  },
  getCurrentUser(this: ApiClient) { return this.request<User>('/users/me') },
}
