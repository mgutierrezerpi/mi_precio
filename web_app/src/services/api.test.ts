import { describe, expect, it } from 'vitest'
import { API_URL } from './api'

describe('API_URL', () => {
  it('defaults to the same-origin production API path', () => {
    expect(API_URL).toBe('/api/v1')
    expect(API_URL).not.toContain('localhost')
  })
})
