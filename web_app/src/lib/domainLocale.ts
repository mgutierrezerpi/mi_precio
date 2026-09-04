export type DomainLocale = 'en' | 'es'

export type AppDomain = 'miprecio.app' | 'pricepanel.app'

declare global {
  interface Window {
    /** A local-development brand override. Set it from DevTools to switch brands. */
    domain?: string
  }
}

const DOMAIN_CHANGE_EVENT = 'miprecio:domain-change'

function normalizeDomain(value?: string): AppDomain {
  return value?.toLowerCase().replace(/^www\./, '') === 'pricepanel.app'
    ? 'pricepanel.app'
    : 'miprecio.app'
}

function defaultDomain(): AppDomain {
  if (typeof window === 'undefined') return 'miprecio.app'
  return normalizeDomain(window.location.hostname)
}

/**
 * Makes `window.domain` a reactive local-development override. It deliberately
 * defaults localhost (and any non-PricePanel host) to MiPrecio, while the real
 * PricePanel host continues to select PricePanel without any override.
 */
function installDomainListener() {
  if (typeof window === 'undefined') return

  const descriptor = Object.getOwnPropertyDescriptor(window, 'domain')
  if (descriptor && !descriptor.configurable) return

  let domain = normalizeDomain(
    typeof descriptor?.value === 'string' ? descriptor.value : defaultDomain()
  )
  Object.defineProperty(window, 'domain', {
    configurable: true,
    enumerable: true,
    get: () => domain,
    set: (value: string) => {
      const next = normalizeDomain(value)
      if (next === domain) return
      domain = next
      window.dispatchEvent(new Event(DOMAIN_CHANGE_EVENT))
    },
  })
}

installDomainListener()

/** The active marketing domain, including a local `window.domain` override. */
export function activeDomain(): AppDomain {
  return typeof window === 'undefined' ? 'miprecio.app' : normalizeDomain(window.domain)
}

/** Subscribe to changes made with `window.domain = 'pricepanel.app'`. */
export function subscribeToDomain(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined
  window.addEventListener(DOMAIN_CHANGE_EVENT, listener)
  return () => window.removeEventListener(DOMAIN_CHANGE_EVENT, listener)
}

/** The marketing domain determines the default language before a tenant exists. */
export function localeForHostname(hostname?: string): DomainLocale {
  return normalizeDomain(hostname ?? activeDomain()) === 'pricepanel.app'
    ? 'en'
    : 'es'
}
