import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import type { MarketplaceBusiness } from '../../types'
import { Icon } from '../admin/crm/ui'
import { gradient, tone } from '../admin/crm/theme'

const BUSINESS_CATEGORIES = [
  ['restaurant', 'Restaurantes'], ['bakery', 'Panaderías'], ['cafe', 'Cafeterías'],
  ['grocery', 'Almacenes'], ['drugstore', 'Farmacias'], ['hardware', 'Ferreterías'],
  ['beauty', 'Belleza'], ['clothing', 'Indumentaria'], ['home', 'Hogar'],
  ['pets', 'Mascotas'], ['services', 'Servicios'], ['other', 'Otros'],
] as const

export function MarketplaceScreen() {
  const [businesses, setBusinesses] = useState<MarketplaceBusiness[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Cargando negocios…')
  const [category, setCategory] = useState('')

  const loadBusinesses = useCallback(async (latitude?: number, longitude?: number) => {
    const result = await api.getMarketplaceNearby(latitude, longitude, category)
    setLoading(false)
    if (result.error) {
      setMessage(result.error)
      return
    }
    const marketplaceBusinesses = result.data ?? []
    setBusinesses(marketplaceBusinesses)
    setMessage(
      marketplaceBusinesses.length
        ? `${marketplaceBusinesses.length} negocio${marketplaceBusinesses.length === 1 ? '' : 's'} disponible${marketplaceBusinesses.length === 1 ? '' : 's'}`
        : 'Todavía no hay negocios adheridos al marketplace.'
    )
  }, [category])

  useEffect(() => {
    const requestId = window.setTimeout(() => void loadBusinesses(), 0)
    return () => window.clearTimeout(requestId)
  }, [loadBusinesses])

  const sortByLocation = () => {
    setLoading(true)
    if (!navigator.geolocation) {
      void loadBusinesses()
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => void loadBusinesses(coords.latitude, coords.longitude),
      () => void loadBusinesses(),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }

  return (
    <div data-theme="dark">
      <main className="dash min-h-screen bg-[var(--dash-bg)] font-sans text-[var(--dash-text)]">
        <header className="h-14 border-b border-[var(--dash-border)] bg-[var(--dash-bg)]">
          <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold text-[var(--dash-text2)] transition hover:text-[var(--dash-link)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--dash-soft)] text-[var(--dash-link)]">←</span>
            Mi Precio
          </Link>
          <span className="rounded-full px-3 py-1 text-[11px] font-bold" style={tone('violet')}>
            MARKETPLACE
          </span>
          </div>
        </header>

        <section className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-6 md:py-8">
        <div className="flex min-h-[60px] flex-col justify-center gap-1">
          <h1 className="text-[28px] font-bold leading-none text-[var(--dash-text)]">Marketplace</h1>
          <p className="text-[13px] text-[var(--dash-muted)]">Descubrí catálogos y precios de negocios locales.</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]" style={tone('violet')}>
                <Icon name="search" size={20} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-[var(--dash-text)]">Negocios disponibles</h2>
                <p className="mt-0.5 text-[13px] font-medium text-[var(--dash-text2)]">
                  Ordenalos por distancia cuando compartís tu ubicación.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={sortByLocation}
              disabled={loading}
              className={`flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60 ${gradient}`}
            >
              <Icon name="search" size={16} />
              {loading ? 'Actualizando…' : 'Ordenar por distancia'}
            </button>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--dash-divider)] bg-[var(--dash-soft)] px-5 py-3 text-xs font-semibold text-[var(--dash-text2)]">
            <span className="h-2 w-2 rounded-full bg-[var(--tone-green-fg)]" />
            <span aria-live="polite">{message}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={tone('slate')}>
              <Icon name="sliders-horizontal" size={17} />
            </span>
            <div>
              <h2 className="text-[13px] font-bold text-[var(--dash-text)]">Filtrar negocios</h2>
              <p className="text-[11px] font-medium text-[var(--dash-muted)]">Elegí una categoría para refinar los resultados.</p>
            </div>
          </div>
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3 sm:w-64">
            <Icon name="search" size={15} className="shrink-0 text-[var(--dash-muted)]" />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-w-0 flex-1 !border-0 !bg-transparent p-0 text-[13px] font-bold text-[var(--dash-text)] !outline-none !ring-0 focus:!border-0 focus:!outline-none focus:!ring-0"
              aria-label="Filtrar por categoría"
            >
              <option value="">Todas las categorías</option>
              {BUSINESS_CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

          </label>
        </div>

        {loading && businesses.length === 0 ? (
          <LoadingCards />
        ) : businesses.length ? (
          <div className="grid max-w-[1180px] gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {businesses.map((business) => (
              <BusinessCard key={business.subdomain} business={business} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
        </section>
      </main>
    </div>
  )
}

function BusinessCard({ business }: { business: MarketplaceBusiness }) {
  const distance = formatDistance(business.distanceKm)

  return (
    <Link
      to={`/p/${business.subdomain}`}
      className="group flex min-h-52 flex-col rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 transition hover:border-[var(--dash-link)] hover:shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {business.logoUrl ? (
            <img src={business.logoUrl} alt="" className="h-12 w-12 rounded-xl border border-[var(--dash-border)] object-cover" />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold" style={tone('violet')}>
              {business.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-extrabold text-[var(--dash-text)]">{business.name}</h2>
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--dash-muted)]">
              <Icon name="link-2" size={12} /> @{business.subdomain}
            </span>
          </div>
        </div>
        <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(distance ? 'green' : 'slate')}>
          {distance ?? 'Sin ubicación'}
        </span>
      </div>

      <p className="mt-5 line-clamp-3 text-[13px] font-medium leading-5 text-[var(--dash-text2)]">
        {business.description || 'Consultá su catálogo y precios actualizados.'}
      </p>

      {business.address && (
        <p className="mt-3 truncate text-xs font-semibold text-[var(--dash-muted)]">{business.address}</p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-[var(--dash-divider)] pt-4 text-[13px] font-bold text-[var(--dash-link)]">
        Ver catálogo
        <Icon name="external-link" size={15} className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function LoadingCards() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cargando negocios">
      {[0, 1, 2].map((index) => (
        <div key={index} className="h-52 animate-pulse rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
          <div className="h-12 w-12 rounded-xl bg-[var(--dash-soft)]" />
          <div className="mt-5 h-4 w-2/3 rounded bg-[var(--dash-soft)]" />
          <div className="mt-3 h-3 w-full rounded bg-[var(--dash-soft)]" />
          <div className="mt-2 h-3 w-4/5 rounded bg-[var(--dash-soft)]" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--dash-border)] bg-[var(--dash-surface)] px-6 py-14 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl" style={tone('slate')}>
        <Icon name="search" size={20} />
      </div>
      <h2 className="mt-4 text-base font-extrabold">Todavía no hay negocios</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-[var(--dash-text2)]">
        Volvé más tarde para descubrir catálogos y precios de negocios locales.
      </p>
    </div>
  )
}

function formatDistance(distanceKm: number | null) {
  if (distanceKm == null) return null
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`
  return `${distanceKm.toFixed(1)} km`
}
