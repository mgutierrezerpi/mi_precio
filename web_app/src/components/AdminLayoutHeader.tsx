import { ThemeToggle } from './ThemeToggle'
import { MenuIcon } from './AdminLayoutIcons'

export function AdminHeader({
  onMobileToggle,
  onDesktopToggle,
}: {
  onMobileToggle: () => void
  onDesktopToggle: () => void
}) {
  return (
    <header
      className={[
        'sticky top-0 z-20 flex h-16 items-center gap-4',
        'border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 sm:px-6',
      ].join(' ')}
    >
      <button
        onClick={onMobileToggle}
        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] lg:hidden"
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      <button
        onClick={onDesktopToggle}
        className="hidden lg:block p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      <div className="flex-1" />
      <ThemeToggle />
    </header>
  )
}
