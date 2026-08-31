import { Link } from 'react-router-dom'
import { DashboardIcon, ItemIcon, ListIcon } from './AdminLayoutIcons'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: DashboardIcon },
  { name: 'Listas', href: '/admin/lists', icon: ListIcon },
  { name: 'Ítems', href: '/admin/items', icon: ItemIcon },
]

export function NavigationLinks({
  pathname,
  onNavigate,
  className = '',
}: {
  pathname: string
  onNavigate?: () => void
  className?: string
}) {
  return (
    <nav className={`${className} p-4 space-y-1`}>
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          onClick={onNavigate}
          className={[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
            pathname === item.href
              ? 'bg-[var(--color-bg-elevated)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]',
          ].join(' ')}
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </Link>
      ))}
    </nav>
  )
}
