import { useCallback, useEffect, useState } from 'react'
import api from '../../services/api'
import type { MarketplaceBusiness } from '../../types'
import { MarketplaceAvailability } from './MarketplaceAvailability'
import { MarketplaceBusinessCard } from './MarketplaceBusinessCard'
import { MarketplaceCategoryFilter } from './MarketplaceCategoryFilter'
import { MarketplaceHeader } from './MarketplaceControls'
import { requestMarketplaceLocation } from './marketplaceLocation'
import {
  MarketplaceEmptyState,
  MarketplaceLoadingCards,
} from './MarketplaceResultsState'

function marketplaceMessage(count: number) {
  if (!count) return 'Todavía no hay negocios adheridos al marketplace.'
  const suffix = count === 1 ? '' : 's'
  return `${count} negocio${suffix} disponible${suffix}`
}

export function MarketplaceScreen() {
  const [businesses, setBusinesses] = useState<MarketplaceBusiness[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Cargando negocios…')
  const [category, setCategory] = useState('')

  const loadBusinesses = useCallback(
    async (latitude?: number, longitude?: number) => {
      const result = await api.getMarketplaceNearby(
        latitude,
        longitude,
        category
      )
      setLoading(false)
      if (result.error) {
        setMessage(result.error)
        return
      }
      const marketplaceBusinesses = result.data ?? []
      setBusinesses(marketplaceBusinesses)
      setMessage(marketplaceMessage(marketplaceBusinesses.length))
    },
    [category]
  )

  useEffect(() => {
    const requestId = window.setTimeout(() => void loadBusinesses(), 0)
    return () => window.clearTimeout(requestId)
  }, [loadBusinesses])

  const loadByLocation = () => {
    setLoading(true)
    requestMarketplaceLocation(
      (latitude, longitude) => void loadBusinesses(latitude, longitude),
      () => void loadBusinesses()
    )
  }

  return (
    <div data-theme="dark">
      <main className="dash min-h-screen bg-[var(--dash-bg)] font-sans text-[var(--dash-text)]">
        <MarketplaceHeader />

        <section className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-6 md:py-8">
          <div className="flex min-h-[60px] flex-col justify-center gap-1">
            <h1 className="text-[28px] font-bold leading-none text-[var(--dash-text)]">
              Marketplace
            </h1>
            <p className="text-[13px] text-[var(--dash-muted)]">
              Descubrí catálogos y precios de negocios locales.
            </p>
          </div>
          <MarketplaceAvailability
            loading={loading}
            message={message}
            onLocation={loadByLocation}
          />
          <MarketplaceCategoryFilter
            category={category}
            onChange={setCategory}
          />

          {loading && businesses.length === 0 ? (
            <MarketplaceLoadingCards />
          ) : businesses.length ? (
            <div className="grid max-w-[1180px] gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {businesses.map((business) => (
                <MarketplaceBusinessCard
                  key={business.subdomain}
                  business={business}
                />
              ))}
            </div>
          ) : (
            <MarketplaceEmptyState />
          )}
        </section>
      </main>
    </div>
  )
}
