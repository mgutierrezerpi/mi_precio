import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LoadingSpinner } from '../../components'
import api from '../../services/api'
import { getT } from '../../lib/i18n'
import type { Magazine, Tenant } from '../../types'
import type { DesignProps, StoreColors } from './designs'
import { MagazineDesign } from './MagazineDesign'

const BASE: StoreColors = {
  bg: '#FAFAF7',
  ink: '#0F0D1A',
  body: '#44424E',
  muted: '#84818E',
  accent: '#7C3AED',
  accent2: '#6D28D9',
  line: '#E5E2DC',
}

export function MagazineScreen() {
  const { subdomain, magazineId } = useParams<{
    subdomain: string
    magazineId: string
  }>()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [magazine, setMagazine] = useState<Magazine | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!subdomain || !magazineId) return
    void api.getPublicMagazine(subdomain, magazineId).then((response) => {
      if (response.data) {
        setTenant(response.data.tenant)
        setMagazine(response.data.magazine)
      } else setError(true)
    })
  }, [subdomain, magazineId])

  const t = getT(tenant?.language)
  const accent = tenant?.brandColor || BASE.accent

  useEffect(() => {
    if (!tenant || !magazine) return

    const previousTitle = document.title
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    const previousHref = favicon?.getAttribute('href') ?? null
    const previousType = favicon?.getAttribute('type') ?? null
    const icon = favicon ?? document.createElement('link')

    if (!favicon) {
      icon.rel = 'icon'
      document.head.appendChild(icon)
    }

    const surface =
      magazine.design === 'cafecitos-media-kit' ? 'Media kit' : magazine.name
    document.title = `${surface} · ${tenant.name}`
    icon.href = tenant.logoUrl || '/miprecio-favicon.png'
    icon.removeAttribute('type')

    return () => {
      document.title = previousTitle
      if (previousHref) icon.href = previousHref
      else icon.removeAttribute('href')
      if (previousType) icon.type = previousType
      else icon.removeAttribute('type')
      if (!favicon) icon.remove()
    }
  }, [magazine, tenant])

  const designProps = useMemo<DesignProps>(() => {
    const C = { ...BASE, accent, accent2: accent }
    const currency = tenant?.currency || 'UYU'
    const money = (price: string | number) => `${currency} ${price}`
    return {
      tenant: tenant as Tenant,
      C,
      accent,
      brandGradient: `linear-gradient(135deg, ${accent}, ${accent})`,
      heroColor: accent,
      t,
      money,
      currency,
      updated: '',
      monthYear: '',
      sections: [],
      base: [],
      allItems: [],
      cat: 'all',
      setCat: () => undefined,
      q: '',
      setQ: () => undefined,
      cart: {},
      cartCount: 0,
      addToCart: () => undefined,
      decFromCart: () => undefined,
      openCart: () => undefined,
      waHref: '#',
      isService: true,
      listName: magazine?.name ?? null,
      edition: '001',
      taxId: tenant?.taxId ?? null,
      hasBg: false,
      content: null,
    }
  }, [accent, magazine?.name, t, tenant])

  if (!tenant && !error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#241B15]">
        <LoadingSpinner size="lg" />
      </div>
    )
  if (error || !tenant || !magazine)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#241B15] px-6 text-center text-[#F3EDE2]">
        <h1 className="text-3xl" style={{ fontFamily: 'Georgia, serif' }}>
          Magazine not found
        </h1>
        <Link
          className="text-sm underline"
          to={subdomain ? `/p/${subdomain}` : '/'}
        >
          Back to price lists
        </Link>
      </div>
    )

  return <MagazineDesign designProps={designProps} magazine={magazine} />
}
