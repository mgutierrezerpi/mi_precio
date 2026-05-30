import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { LoadingSpinner } from '../../components'
import api from '../../services/api'
import type { Tenant, ListVersion, Item } from '../../types'

interface PublicList {
  id: string
  name: string
  slug: string | null
  version: ListVersion & { items: Item[] }
}

interface PublicMenuData {
  tenant: Tenant
  lists: PublicList[]
}

export function MenuScreen() {
  const { subdomain, listId } = useParams<{ subdomain: string; listId?: string }>()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [lists, setLists] = useState<PublicList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [menuTheme, setMenuTheme] = useState<string>(() => {
    return localStorage.getItem('menu-theme') || 'classic'
  })

  // Filter to specific list if listId is provided
  const displayLists = listId ? lists.filter(l => l.id === listId || l.slug === listId) : lists

  // Apply menu theme
  useEffect(() => {
    if (menuTheme === 'classic') {
      document.documentElement.removeAttribute('data-menu-theme')
    } else {
      document.documentElement.setAttribute('data-menu-theme', menuTheme)
    }
    localStorage.setItem('menu-theme', menuTheme)
    return () => {
      document.documentElement.removeAttribute('data-menu-theme')
    }
  }, [menuTheme])

  const menuThemes = [
    { id: 'classic', name: 'Clásico', icon: '✦' },
    { id: 'bistro', name: 'Bistro', icon: '☕' },
    { id: 'modern', name: 'Moderno', icon: '◯' },
    { id: 'noir', name: 'Noir', icon: '◆' },
    { id: 'sage', name: 'Sage', icon: '🌿' },
  ]

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    async function fetchPublicData() {
      if (!subdomain) return

      setIsLoading(true)
      setError(null)

      const response = await api.getPublicMenu(subdomain) as { data?: PublicMenuData; error?: string }

      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setTenant(response.data.tenant)
        setLists(response.data.lists)
      }

      setIsLoading(false)
    }

    fetchPublicData()
  }, [subdomain])

  const formatPrice = (price: string) => {
    const value = parseFloat(price)
    return new Intl.NumberFormat('es-AR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      ARS: '$',
      UYU: '$',
      USD: '$',
      EUR: '€',
      BRL: 'R$',
      CLP: '$',
      MXN: '$',
      COP: '$',
      PEN: 'S/',
    }
    return symbols[currency] || '$'
  }

  const groupItemsByCategory = (items: Item[]) => {
    const groups: { category: string | null; items: Item[] }[] = []
    const categoryMap = new Map<string | null, Item[]>()

    // Preserve order: first occurrence of each category determines order
    items.forEach(item => {
      const cat = item.category || null
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, [])
      }
      categoryMap.get(cat)!.push(item)
    })

    // Convert to array, putting uncategorized items first if they exist
    const uncategorized = categoryMap.get(null)
    if (uncategorized) {
      groups.push({ category: null, items: uncategorized })
      categoryMap.delete(null)
    }

    categoryMap.forEach((items, category) => {
      groups.push({ category, items })
    })

    return groups
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-primary)]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg-primary)] px-6">
        <p className="text-[var(--color-text-muted)] mb-4">
          {error || 'Lista no encontrada'}
        </p>
        <Link to="/" className="text-[var(--color-accent)] hover:underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] transition-colors">
      {/* Top bar */}
      <div className={`absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10 transition-opacity duration-300 ${isFullscreen ? 'opacity-0 hover:opacity-100' : ''}`}>
        <button
          onClick={() => navigate(-1)}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          ← Volver
        </button>
        <div className="flex items-center gap-2">
          {/* Theme selector */}
          <div className="relative group">
            <button
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
              title="Cambiar tema"
            >
              <PaletteIcon />
            </button>
            <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg shadow-xl p-2 min-w-[140px]">
                {menuThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setMenuTheme(theme.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                      menuTheme === theme.id
                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'
                    }`}
                  >
                    <span>{theme.icon}</span>
                    <span>{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="pt-20 pb-12 px-6 text-center border-b border-[var(--color-border)]">
        <h1 className="text-5xl md:text-7xl font-light text-[var(--color-text-primary)] tracking-wide">
          {tenant.name}
        </h1>
        <div className="mt-6 flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-[var(--color-accent-muted)]" />
          <span className="text-[var(--color-accent)] text-xl">✦</span>
          <span className="h-px w-12 bg-[var(--color-accent-muted)]" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        {displayLists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-muted)]">
              {listId ? 'Lista no encontrada' : 'No hay listas publicadas'}
            </p>
          </div>
        ) : (
          displayLists.map((list) => (
            <section key={list.id} className="mb-16">
              {/* List header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-[var(--color-text-primary)] italic">
                  {list.name}
                </h2>
              </div>

              {/* Items grouped by category */}
              {list.version?.items && list.version.items.length > 0 ? (
                <div className="space-y-8">
                  {groupItemsByCategory(list.version.items).map(({ category, items }) => (
                    <div key={category || 'uncategorized'}>
                      {category && <CategoryDivider name={category} />}
                      <div className="space-y-6">
                        {items.map((item) => (
                          <article key={item.id} className="group">
                            <div className="flex items-baseline gap-4">
                              <h3 className="text-xl md:text-2xl text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                                {item.name}
                              </h3>
                              <span className="flex-1 border-b border-dotted border-[var(--color-border-light)] min-w-[40px] translate-y-[-4px]" />
                              <span className="text-xl text-[var(--color-accent)] whitespace-nowrap">
                                {getCurrencySymbol(tenant.currency)}{formatPrice(item.price)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="mt-2 text-[var(--color-text-muted)] text-sm leading-relaxed max-w-xl">
                                {item.description}
                              </p>
                            )}
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[var(--color-text-muted)]">
                  Sin productos
                </p>
              )}
            </section>
          ))
        )}

        {/* Ornamental Divider */}
        <OrnamentalDivider />

        <div className="text-center my-8">
          <span className="text-[var(--color-accent-muted)] text-sm tracking-[0.2em] uppercase">
            {tenant.name}
          </span>
        </div>

        <OrnamentalDivider />

        {/* Footer note */}
        <footer className="text-center">
          <p className="text-[var(--color-text-muted)] text-xs tracking-wide">
            Precios en {tenant.currency || 'UYU'}
          </p>
        </footer>
      </main>
    </div>
  )
}

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-8">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--color-accent-muted)]" />
      <svg className="w-6 h-6 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--color-accent-muted)]" />
    </div>
  )
}

function CategoryDivider({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center gap-4 my-12">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
      <div className="flex items-center gap-3">
        <svg className="w-4 h-4 text-[var(--color-accent-muted)]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
        </svg>
        <span className="text-[var(--color-accent)] text-sm tracking-[0.15em] uppercase font-medium">
          {name}
        </span>
        <svg className="w-4 h-4 text-[var(--color-accent-muted)]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
        </svg>
      </div>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
    </div>
  )
}

function FullscreenIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  )
}

function ExitFullscreenIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
    </svg>
  )
}

function PaletteIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
    </svg>
  )
}

export default MenuScreen
