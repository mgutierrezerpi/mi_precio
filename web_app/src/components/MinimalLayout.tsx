import { Link, Outlet } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '../hooks/useTheme'

export function MinimalLayout() {
  useTheme()

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] transition-colors">
      {/* Minimal header */}
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 md:p-6 bg-[var(--color-bg-primary)]/80 backdrop-blur-sm border-b border-[var(--color-border)]">
        <Link
          to="/admin"
          className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors text-sm"
        >
          <BackIcon className="w-4 h-4" />
          <span>Panel</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Page content */}
      <main className="p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  )
}

export default MinimalLayout
