import { Icon } from '../admin/crm/ui'
import { tone } from '../admin/crm/theme'

export function MarketplaceLoadingCards() {
  return (
    <div
      className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Cargando negocios"
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-52 animate-pulse rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4"
        >
          <div className="h-12 w-12 rounded-xl bg-[var(--dash-soft)]" />
          <div className="mt-5 h-4 w-2/3 rounded bg-[var(--dash-soft)]" />
          <div className="mt-3 h-3 w-full rounded bg-[var(--dash-soft)]" />
          <div className="mt-2 h-3 w-4/5 rounded bg-[var(--dash-soft)]" />
        </div>
      ))}
    </div>
  )
}

export function MarketplaceEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--dash-border)] bg-[var(--dash-surface)] px-6 py-14 text-center">
      <div
        className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl"
        style={tone('slate')}
      >
        <Icon name="search" size={20} />
      </div>
      <h2 className="mt-4 text-base font-extrabold">Todavía no hay negocios</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-[var(--dash-text2)]">
        Volvé más tarde para descubrir catálogos y precios de negocios locales.
      </p>
    </div>
  )
}
