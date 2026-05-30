import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { selectTenant, logout } from '../../store/slices/authSlice'
import { fetchLists, selectLists, selectIsLoading } from '../../store/slices/menuSlice'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useTheme } from '../../hooks/useTheme'

export function DashboardScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const tenant = useAppSelector(selectTenant)
  const lists = useAppSelector(selectLists)
  const isLoading = useAppSelector(selectIsLoading)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useTheme()

  useEffect(() => {
    if (tenant?.id) {
      dispatch(fetchLists(tenant.id))
    }
  }, [dispatch, tenant?.id])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await dispatch(logout())
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col">
      {/* Minimal top bar */}
      <header className="flex items-center justify-between p-6 relative z-50 animate-fade-in-down">
        <Link
          to="/"
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all text-sm hover:-translate-x-1"
        >
          ← Inicio
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors text-sm disabled:opacity-50"
          >
            {isLoggingOut ? 'Saliendo...' : 'Salir'}
          </button>
        </div>
      </header>

      {/* Main content - centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-16 relative z-0">
        {/* Greeting */}
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-[var(--color-text-muted)] text-sm tracking-widest uppercase mb-3">
            Bienvenido a
          </p>
          <h1 className="text-4xl md:text-6xl font-light text-[var(--color-text-primary)] tracking-wide">
            {tenant?.name || 'Mi Precio'}
          </h1>
        </div>

        {/* Navigation bubbles */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Lists bubble */}
          <Link
            to="/admin/lists"
            className="group relative animate-fade-in-up stagger-2"
          >
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-secondary)] flex flex-col items-center justify-center gap-3 transition-all duration-500 group-hover:border-[var(--color-border-accent)] group-hover:scale-105 group-hover:shadow-[var(--shadow-elevated)] group-active:scale-100">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[var(--color-bg-elevated)] flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--color-accent-soft)] group-hover:scale-110">
                <ListIcon className="w-6 h-6 md:w-7 md:h-7 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
              </div>
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors text-sm md:text-base font-medium">
                Listas
              </span>
            </div>
            {/* Decorative ring */}
            <div className="absolute inset-0 rounded-full border border-[var(--color-border-light)] opacity-0 group-hover:opacity-40 scale-115 transition-all duration-500 pointer-events-none" />
          </Link>

          {/* Menu bubble - center, larger */}
          <Link
            to={`/p/${tenant?.subdomain || ''}`}
            className="group relative order-first md:order-none animate-fade-in-up stagger-1"
          >
            <div className="w-44 h-44 md:w-52 md:h-52 rounded-full border border-[var(--color-border-accent)] bg-gradient-to-br from-[var(--color-bg-card)] via-[var(--color-bg-elevated)] to-[var(--color-accent-soft)] flex flex-col items-center justify-center gap-3 transition-all duration-500 group-hover:border-[var(--color-accent)] group-hover:scale-105 group-hover:shadow-[var(--shadow-glow)_rgba(var(--color-accent-rgb),0.2)] group-active:scale-100">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--color-accent)]/20 group-hover:scale-110">
                <MenuIcon className="w-7 h-7 md:w-8 md:h-8 text-[var(--color-accent)] transition-colors" />
              </div>
              <span className="text-[var(--color-text-primary)] transition-colors text-base md:text-lg font-medium">
                Ver Lista
              </span>
              <span className="text-[var(--color-text-subtle)] text-xs">
                Vista pública
              </span>
            </div>
            {/* Decorative rings */}
            <div className="absolute inset-0 rounded-full border border-[var(--color-accent)]/15 opacity-0 group-hover:opacity-100 scale-110 transition-all duration-500 pointer-events-none" />
            <div className="absolute inset-0 rounded-full border border-[var(--color-accent)]/8 opacity-0 group-hover:opacity-100 scale-125 transition-all duration-700 pointer-events-none" />
          </Link>

          {/* Settings bubble */}
          <Link
            to="/admin/settings"
            className="group relative animate-fade-in-up stagger-3"
          >
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-secondary)] flex flex-col items-center justify-center gap-3 transition-all duration-500 group-hover:border-[var(--color-border-accent)] group-hover:scale-105 group-hover:shadow-[var(--shadow-elevated)] group-active:scale-100">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[var(--color-bg-elevated)] flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--color-accent-soft)] group-hover:scale-110 group-hover:rotate-45">
                <SettingsIcon className="w-6 h-6 md:w-7 md:h-7 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
              </div>
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors text-sm md:text-base font-medium">
                Ajustes
              </span>
            </div>
            {/* Decorative ring */}
            <div className="absolute inset-0 rounded-full border border-[var(--color-border-light)] opacity-0 group-hover:opacity-40 scale-115 transition-all duration-500 pointer-events-none" />
          </Link>
        </div>

        {/* Lists section */}
        {isLoading ? (
          <div className="mt-16 w-full max-w-md animate-fade-in">
            <div className="skeleton skeleton-text w-20 mx-auto mb-4" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
                  <div className="flex items-center justify-between">
                    <div className="skeleton skeleton-text w-32" />
                    <div className="skeleton skeleton-text w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : lists.length > 0 ? (
          <div className="mt-16 w-full max-w-md animate-fade-in-up stagger-4">
            <p className="text-[var(--color-text-subtle)] text-xs tracking-widest uppercase mb-4 text-center">
              Tus listas
            </p>
            <div className="space-y-3">
              {lists.map((list, index) => (
                <Link
                  key={list.id}
                  to={`/p/${tenant?.subdomain}/${list.slug || list.id}`}
                  className={`flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-bg-card)] to-[var(--color-bg-secondary)] hover:border-[var(--color-border-accent)] hover:shadow-[var(--shadow-soft)] transition-all duration-300 group hover:-translate-y-0.5 animate-fade-in-up`}
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center group-hover:bg-[var(--color-accent-soft)] transition-colors">
                      <MenuIcon className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors font-medium">
                        {list.name}
                      </span>
                      {list.showOnIndex && (
                        <span className="soft-badge text-[10px]">
                          Principal
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {list.published ? (
                      <span className="soft-badge-success text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                        Publicada
                      </span>
                    ) : (
                      <span className="soft-badge-warning text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)]" />
                        Borrador
                      </span>
                    )}
                    <svg className="w-4 h-4 text-[var(--color-text-subtle)] group-hover:text-[var(--color-accent)] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

      </main>

      {/* Bottom decoration */}
      <footer className="p-6 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--color-border)]" />
          <span className="text-[var(--color-accent-muted)] text-xs">✦</span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--color-border)]" />
        </div>
      </footer>
    </div>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export default DashboardScreen
