import { afterEach, describe, expect, it, vi } from 'vitest'
import api, { API_URL } from '../../src/services/api'

afterEach(() => vi.unstubAllGlobals())

describe('API_URL', () => {
  it('defaults to the same-origin production API path', () => {
    expect(API_URL).toBe('/api/v1')
    expect(API_URL).not.toContain('localhost')
  })
})

describe('API errors', () => {
  it('keeps the raw detail as a machine-readable error code', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Access code required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )

    const response = await api.getPublicMenu('cafecitos', 'colaboraciones')

    expect(response).toEqual({
      error: 'Esta lista pide un código de acceso.',
      errorCode: 'Access code required',
    })
  })

  it('passes on the language a private list asks for its code in', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            detail: {
              code: 'Access code required',
              message: 'Access code required',
              shop: { name: 'Cafecitos', language: 'pt' },
            },
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )

    const response = await api.getPublicMenu('cafecitos', 'colaboraciones')

    expect(response).toMatchObject({
      errorCode: 'Access code required',
      errorShop: { name: 'Cafecitos', language: 'pt' },
    })
  })
})
