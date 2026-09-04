import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('domainLocale', () => {
  beforeEach(() => {
    vi.resetModules()
    delete window.domain
  })

  it('defaults local development to MiPrecio', async () => {
    const { activeDomain, localeForHostname } = await import('./domainLocale')

    expect(window.domain).toBe('miprecio.app')
    expect(activeDomain()).toBe('miprecio.app')
    expect(localeForHostname()).toBe('es')
  })

  it('notifies listeners and switches to PricePanel when window.domain changes', async () => {
    const { activeDomain, localeForHostname, subscribeToDomain } =
      await import('./domainLocale')
    const listener = vi.fn()
    const unsubscribe = subscribeToDomain(listener)

    window.domain = 'pricepanel.app'

    expect(activeDomain()).toBe('pricepanel.app')
    expect(localeForHostname()).toBe('en')
    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
  })

  it('continues to support explicit hostnames', async () => {
    const { localeForHostname } = await import('./domainLocale')

    expect(localeForHostname('www.pricepanel.app')).toBe('en')
    expect(localeForHostname('miprecio.app')).toBe('es')
  })
})
