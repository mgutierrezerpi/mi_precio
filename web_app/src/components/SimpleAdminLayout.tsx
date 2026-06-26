import { useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { refreshCurrentUser, selectAdminUiMode, selectIsAuthenticated, selectTenant, updateCurrentUser } from '../store/slices/authSlice'

export function AdminExperienceLayout() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const mode = useAppSelector(selectAdminUiMode)

  useEffect(() => {
    if (isAuthenticated) dispatch(refreshCurrentUser())
  }, [dispatch, isAuthenticated])

  if (mode === 'full') return <Outlet />
  return <SimpleAdminLayout mode={mode} />
}

function SimpleAdminLayout({ mode }: { mode: 'simple' | 'medium' | 'full' }) {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)

  return (
    <div className="dash min-h-screen bg-[var(--dash-bg)] font-sans text-[var(--dash-text)] transition-colors [--color-accent-hover:#6D28D9] [--color-accent-rgb:124,58,237] [--color-accent-soft:var(--tone-violet-bg)] [--color-accent:var(--dash-link)] [--color-bg-card:var(--dash-surface)] [--color-bg-elevated:var(--dash-soft)] [--color-bg-primary:var(--dash-bg)] [--color-bg-secondary:var(--dash-soft)] [--color-border-accent:var(--dash-link)] [--color-border-light:var(--simple-border-soft)] [--color-border:var(--simple-border)] [--color-text-muted:var(--dash-muted)] [--color-text-primary:var(--dash-text)] [--color-text-secondary:var(--dash-text2)] [--color-text-subtle:var(--dash-muted)] [--simple-border-soft:#C4B5FD] [--simple-border:#C7BFF4] [--simple-shadow:0_18px_48px_-20px_rgba(76,29,149,0.28)] [--simple-surface:#FFFFFF] dark:[--simple-border-soft:#3B1F77] dark:[--simple-border:#3B1F77] dark:[--simple-shadow:0_18px_50px_-18px_rgba(0,0,0,0.38)] dark:[--simple-surface:var(--dash-surface)]">
      <header className="sticky top-0 z-20 border-b-2 border-[var(--simple-border)] bg-[var(--simple-surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/admin" className="text-sm font-semibold text-[var(--dash-muted)] hover:text-[var(--dash-text)]">
            {tenant?.name || 'Mi Precio'}
          </Link>
          <div className="flex-1" />
          <ModeButton label="Simple" active={mode === 'simple'} onClick={() => dispatch(updateCurrentUser({ adminUiMode: 'simple' }))} />
          <ModeButton label="Medio" active={mode === 'medium'} onClick={() => dispatch(updateCurrentUser({ adminUiMode: 'medium' }))} />
          <ModeButton label="Completo" active={mode === 'full'} onClick={() => dispatch(updateCurrentUser({ adminUiMode: 'full' }))} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

function ModeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm font-semibold ${active ? 'text-[var(--dash-link)]' : 'text-[var(--dash-muted)] hover:text-[var(--dash-link)]'}`}
    >
      {label}
    </button>
  )
}

export default AdminExperienceLayout
