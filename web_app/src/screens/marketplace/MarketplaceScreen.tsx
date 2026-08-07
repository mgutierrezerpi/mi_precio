import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import type { MarketplaceBusiness } from '../../types'

export function MarketplaceScreen() {
  const [businesses, setBusinesses] = useState<MarketplaceBusiness[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(
    'Usá tu ubicación para descubrir negocios que eligieron aparecer cerca tuyo.'
  )

  const discover = () => {
    if (!navigator.geolocation) {
      setMessage('Este navegador no puede acceder a tu ubicación.')
      return
    }
    setLoading(true)
    setMessage('Buscando negocios cerca tuyo…')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const result = await api.getMarketplaceNearby(coords.latitude, coords.longitude)
        setLoading(false)
        if (result.error) {
          setMessage(result.error)
          return
        }
        const nearby = result.data ?? []
        setBusinesses(nearby)
        setMessage(
          nearby.length
            ? `${nearby.length} negocio${nearby.length === 1 ? '' : 's'} cerca tuyo`
            : 'Todavía no hay negocios adheridos cerca de tu ubicación.'
        )
      },
      () => {
        setLoading(false)
        setMessage('Necesitamos permiso de ubicación para mostrar negocios cercanos.')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7] px-5 py-10 text-[#181625] sm:px-8">
      <section className="mx-auto max-w-4xl">
        <Link to="/" className="text-sm font-bold text-[#6D28D9]">← Mi Precio</Link>
        <div className="mt-12 rounded-3xl bg-[#241A3D] px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C4B5FD]">Marketplace</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Descubrí negocios cerca tuyo</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#D7D3E8]">Encontrá catálogos y precios de comercios locales que eligieron ser parte del marketplace.</p>
          <button
            type="button"
            onClick={discover}
            disabled={loading}
            className="mt-7 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#4C1D95] transition hover:bg-[#EDE9FE] disabled:opacity-60"
          >
            {loading ? 'Buscando…' : 'Usar mi ubicación'}
          </button>
        </div>

        <p className="my-7 text-sm font-medium text-[#625E70]" aria-live="polite">{message}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {businesses.map((business) => <BusinessCard key={business.subdomain} business={business} />)}
        </div>
      </section>
    </main>
  )
}

function BusinessCard({ business }: { business: MarketplaceBusiness }) {
  return (
    <Link to={`/p/${business.subdomain}`} className="group rounded-2xl border border-[#E4E0EB] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#A78BFA] hover:shadow-md">
      <div className="flex items-center gap-3">
        {business.logoUrl ? (
          <img src={business.logoUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EDE9FE] text-lg font-extrabold text-[#6D28D9]">{business.name.slice(0, 1).toUpperCase()}</div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-extrabold">{business.name}</h2>
          <p className="text-sm font-semibold text-[#6D28D9]">{business.distanceKm < 1 ? `${Math.round(business.distanceKm * 1000)} m` : `${business.distanceKm.toFixed(1)} km`} de distancia</p>
        </div>
      </div>
      {business.description && <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#625E70]">{business.description}</p>}
      {business.address && <p className="mt-3 truncate text-xs font-semibold text-[#85808F]">{business.address}</p>}
      <span className="mt-4 inline-block text-sm font-extrabold text-[#6D28D9] group-hover:underline">Ver catálogo →</span>
    </Link>
  )
}
