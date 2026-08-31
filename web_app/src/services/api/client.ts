import type { ApiResponse } from './types'

export type AuthErrorCallback = () => void
export type ConnectionErrorCallback = () => void
export type PlanRequiredCallback = () => void

let onAuthError: AuthErrorCallback | null = null
let onConnectionError: ConnectionErrorCallback | null = null
let onPlanRequired: PlanRequiredCallback | null = null

export function setAuthErrorHandler(callback: AuthErrorCallback | null) {
  onAuthError = callback
}

export function setConnectionErrorHandler(callback: ConnectionErrorCallback | null) {
  onConnectionError = callback
}

export function setPlanRequiredHandler(callback: PlanRequiredCallback | null) {
  onPlanRequired = callback
}

function transformKeys<T>(value: unknown): T {
  if (value === null || value === undefined) return value as T
  if (Array.isArray(value)) return value.map(transformKeys) as T
  if (typeof value !== 'object') return value as T
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
      transformKeys(item),
    ])
  ) as T
}

export interface ApiClient {
  request<T>(endpoint: string, options?: RequestInit, allowReconnect?: boolean): Promise<ApiResponse<T>>
}

export class ApiClientImpl implements ApiClient {
  private readonly baseUrl: string
  private token: string | null = null
  private authErrorHandled = false

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      this.authErrorHandled = false
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}, allowReconnect = true): Promise<ApiResponse<T>> {
    const headers: HeadersInit = options.body instanceof FormData
      ? { ...options.headers }
      : { 'Content-Type': 'application/json', ...options.headers }
    if (this.token) (headers as Record<string, string>).Authorization = `Bearer ${this.token}`
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: options.credentials ?? 'include',
      })
      if (!response.ok) return this.handleHttpError(response)
      return { data: transformKeys<T>(await response.json()) }
    } catch {
      const method = (options.method ?? 'GET').toUpperCase()
      if (allowReconnect && (method === 'GET' || method === 'HEAD')) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        return this.request<T>(endpoint, options, false)
      }
      onConnectionError?.()
      return { error: 'Error de conexión' }
    }
  }

  private async handleHttpError<T>(response: Response): Promise<ApiResponse<T>> {
    if (response.status === 401 && onAuthError && !this.authErrorHandled) {
      this.authErrorHandled = true
      onAuthError()
    }
    const errorData = await response.json().catch(() => ({}))
    const detail = errorData.detail
    if (response.status === 402 && detail?.code === 'plan_required') onPlanRequired?.()
    const message = typeof detail === 'string' ? detail : detail?.message
    return { error: message || `Error ${response.status}` }
  }
}
