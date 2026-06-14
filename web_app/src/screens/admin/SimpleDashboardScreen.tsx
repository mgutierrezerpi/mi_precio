import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useTheme } from '../../hooks/useTheme'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout, selectTenant } from '../../store/slices/authSlice'
import { fetchLists, selectIsLoading, selectLists } from '../../store/slices/menuSlice'

export function SimpleDashboardScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const tenant = useAppSelector(selectTenant)
  const lists = useAppSelector(selectLists)
  const isLoading = useAppSelector(selectIsLoading)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useTheme()

  useEffect(() => {
    if (tenant?.id) dispatch(fetchLists(tenant.id))
  }, [dispatch, tenant?.id])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await dispatch(logout())
    navigate('/')
  }

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[var(--dash-bg)] text-[var(--dash-text)]">
      <div className="flex items-center justify-between pb-6">
        <Link
          to="/"
          className="text-sm text-[var(--dash-muted)] transition-all hover:-translate-x-1 hover:text-[var(--dash-text)]"
        >
          ← Inicio
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-sm text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)] disabled:opacity-50"
          >
            {isLoggingOut ? 'Saliendo...' : 'Salir'}
          </button>
        </div>
      </div>

      <main className="flex min-h-[calc(100vh-190px)] flex-col items-center justify-center px-2 pb-12">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-[var(--dash-muted)]">
            Bienvenido a
          </p>
          <h1 className="text-4xl font-light tracking-wide text-[var(--dash-text)] md:text-6xl">
            {tenant?.name || 'Mi Precio'}
          </h1>
        </div>

        <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-12">
          <BubbleLink
            to="/admin/lists"
            label="Listas"
            icon={<ListIcon className="h-7 w-7" />}
          />

          <BubbleLink
            to={`/p/${tenant?.subdomain || ''}`}
            label="Ver Lista"
            sublabel="Vista pública"
            featured
            icon={<MenuIcon className="h-8 w-8" />}
          />

          <BubbleLink
            to="/admin/settings"
            label="Ajustes"
            icon={<SettingsIcon className="h-7 w-7" />}
          />
        </div>

        {isLoading ? (
          <div className="mt-16 w-full max-w-md">
            <p className="mb-4 text-center text-xs uppercase tracking-[0.25em] text-[var(--dash-muted)]">
              Cargando listas
            </p>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-[58px] rounded-xl border-2 border-[var(--simple-border)] bg-[var(--simple-surface)] opacity-60" />
              ))}
            </div>
          </div>
        ) : lists.length > 0 ? (
          <div className="mt-16 w-full max-w-md">
            <p className="mb-4 text-center text-xs uppercase tracking-[0.25em] text-[var(--dash-muted)]">
              Tus listas
            </p>
            <div className="space-y-3">
              {lists.map((list) => (
                <Link
                  key={list.id}
                  to={`/p/${tenant?.subdomain}/${list.slug || list.id}`}
                  className="group flex items-center justify-between rounded-xl border-2 border-[var(--simple-border)] bg-gradient-to-r from-[var(--dash-surface)] to-[var(--dash-soft)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--dash-link)] hover:shadow-[var(--simple-shadow)]"
                >
                  <span className="min-w-0 truncate font-medium text-[var(--dash-text)] group-hover:text-[var(--dash-link)]">
                    {list.name}
                  </span>
                  <span className="ml-3 shrink-0 text-xs text-[var(--dash-muted)]">
                    {list.published ? 'Publicada' : 'Borrador'} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

function BubbleLink({ to, label, sublabel, icon, featured = false }: { to: string; label: string; sublabel?: string; icon: ReactNode; featured?: boolean }) {
  return (
    <Link to={to} className={`group relative ${featured ? 'order-first md:order-none' : ''}`}>
      <div
        className={[
          'flex flex-col items-center justify-center rounded-full border-2 bg-gradient-to-br shadow-[var(--simple-shadow)] transition-all duration-500 group-active:scale-100',
          featured
            ? 'h-44 w-44 gap-3 border-[var(--dash-link)] from-[var(--dash-surface)] via-[var(--dash-soft)] to-[var(--tone-violet-bg)] hover:scale-105 hover:border-[var(--dash-link)] hover:shadow-[0_18px_50px_-18px_rgba(124,58,237,0.22)] md:h-52 md:w-52'
            : 'h-36 w-36 gap-3 border-[var(--simple-border)] from-[var(--dash-surface)] to-[var(--dash-soft)] hover:scale-105 hover:border-[var(--dash-link)] hover:shadow-[var(--simple-shadow)] md:h-44 md:w-44',
        ].join(' ')}
      >
        <div
          className={[
            'flex items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110',
            featured
              ? 'h-16 w-16 bg-[var(--tone-violet-bg)] text-[var(--dash-link)]'
              : 'h-14 w-14 bg-[var(--dash-soft)] text-[var(--dash-muted)] group-hover:bg-[var(--tone-violet-bg)] group-hover:text-[var(--dash-link)]',
          ].join(' ')}
        >
          {icon}
        </div>
        <span className={`${featured ? 'text-lg text-[var(--dash-text)]' : 'text-base text-[var(--dash-text2)] group-hover:text-[var(--dash-text)]'} font-medium transition-colors`}>
          {label}
        </span>
        {sublabel && <span className="text-xs text-[var(--dash-muted)]">{sublabel}</span>}
      </div>
      <div className="pointer-events-none absolute inset-0 scale-110 rounded-full border-2 border-[var(--simple-border)] opacity-0 transition-all duration-500 group-hover:opacity-40" />
    </Link>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" />
    </svg>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25A8.966 8.966 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87l.22.127c.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124l-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87l-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124l.22-.128c.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export default SimpleDashboardScreen
