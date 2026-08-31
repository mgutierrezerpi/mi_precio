import { Link } from 'react-router-dom'
import { CloseIcon, ExternalIcon } from './AdminLayoutIcons'
import { NavigationLinks } from './AdminLayoutNavigation'

export function MobileSidebar({
  open,
  name,
  pathname,
  onClose,
}: {
  open: boolean
  name?: string
  pathname: string
  onClose: () => void
}) {
  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-50 w-64 transform bg-[var(--color-bg-secondary)]',
        'border-r border-[var(--color-border)] transition-transform duration-300 lg:hidden',
        open ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--color-border)]">
        <span className="text-xl text-[var(--color-text-primary)] font-serif">
          {name || 'Mi Precio'}
        </span>
        <button
          onClick={onClose}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      <NavigationLinks pathname={pathname} onNavigate={onClose} />
    </aside>
  )
}

export function DesktopSidebar({
  name,
  subdomain,
  pathname,
}: {
  name?: string
  subdomain?: string
  pathname: string
}) {
  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[var(--color-border)]',
        'bg-[var(--color-bg-secondary)] lg:flex lg:flex-col',
      ].join(' ')}
    >
      <div className="flex h-16 items-center px-6 border-b border-[var(--color-border)]">
        <Link
          to="/"
          className="text-xl text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors font-serif"
        >
          {name || 'Mi Precio'}
        </Link>
      </div>
      <NavigationLinks pathname={pathname} className="flex-1" />
      <div className="p-4 border-t border-[var(--color-border)]">
        <Link
          to={`/p/${subdomain || ''}`}
          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
        >
          <ExternalIcon className="h-4 w-4" />
          Ver vista pública
        </Link>
      </div>
    </aside>
  )
}
