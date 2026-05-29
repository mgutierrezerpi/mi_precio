import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { toggleSidebar, toggleMobileMenu, selectMobileMenuOpen } from '../store/slices/uiSlice'
import { selectTenant } from '../store/slices/authSlice'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '../hooks/useTheme'

export function AdminLayout() {
  const dispatch = useAppDispatch()
  const mobileMenuOpen = useAppSelector(selectMobileMenuOpen)
  const tenant = useAppSelector(selectTenant)
  const location = useLocation()

  useTheme() // Initialize theme

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: DashboardIcon },
    { name: 'Listas', href: '/admin/lists', icon: ListIcon },
    { name: 'Ítems', href: '/admin/items', icon: ItemIcon },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] transition-colors font-sans">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => dispatch(toggleMobileMenu())}
        />
      )}

      {/* Sidebar for mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--color-border)]">
          <span className="text-xl text-[var(--color-text-primary)] font-serif">
            {tenant?.name || 'Mi Precio'}
          </span>
          <button
            onClick={() => dispatch(toggleMobileMenu())}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === item.href
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]'
              }`}
              onClick={() => dispatch(toggleMobileMenu())}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden lg:flex lg:flex-col w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)]">
        <div className="flex h-16 items-center px-6 border-b border-[var(--color-border)]">
          <Link to="/" className="text-xl text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors font-serif">
            {tenant?.name || 'Mi Precio'}
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === item.href
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--color-border)]">
          <Link
            to={`/p/${tenant?.subdomain || ''}`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            <ExternalIcon className="h-4 w-4" />
            Ver vista pública
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] px-4 sm:px-6">
          <button
            onClick={() => dispatch(toggleMobileMenu())}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] lg:hidden"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="hidden lg:block p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function ItemIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  )
}

export default AdminLayout
