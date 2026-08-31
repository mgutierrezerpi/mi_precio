export type DomainLocale = 'en' | 'es'

/** The marketing domain determines the default language before a tenant exists. */
export function localeForHostname(hostname?: string): DomainLocale {
  const host = (hostname ?? (typeof window === 'undefined' ? 'miprecio.app' : window.location.hostname))
    .toLowerCase()
    .replace(/^www\./, '')
  return host === 'pricepanel.app' ? 'en' : 'es'
}
