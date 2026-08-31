import { Link } from 'react-router-dom'
import { tone } from '../admin/crm/theme'

export function MarketplaceHeader() {
  return (
    <header className="h-14 border-b border-[var(--dash-border)] bg-[var(--dash-bg)]">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-bold text-[var(--dash-text2)] transition hover:text-[var(--dash-link)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--dash-soft)] text-[var(--dash-link)]">
            ←
          </span>
          Mi Precio
        </Link>
        <span
          className="rounded-full px-3 py-1 text-[11px] font-bold"
          style={tone('violet')}
        >
          MARKETPLACE
        </span>
      </div>
    </header>
  )
}
