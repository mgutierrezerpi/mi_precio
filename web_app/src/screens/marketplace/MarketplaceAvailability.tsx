import { Icon } from '../admin/crm/ui'
import { gradient, tone } from '../admin/crm/theme'

const LOCATION_BUTTON_CLASS = [
  'flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-bold text-white',
  'transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60',
].join(' ')
const STATUS_CLASS = [
  'flex items-center gap-2 border-t border-[var(--dash-divider)] bg-[var(--dash-soft)] px-5 py-3',
  'text-xs font-semibold text-[var(--dash-text2)]',
].join(' ')

export function MarketplaceAvailability({
  loading,
  message,
  onLocation,
}: {
  loading: boolean
  message: string
  onLocation: () => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <AvailabilityHeading />
        <button
          type="button"
          onClick={onLocation}
          disabled={loading}
          className={`${LOCATION_BUTTON_CLASS} ${gradient}`}
        >
          <Icon name="search" size={16} />
          {loading ? 'Actualizando…' : 'Ordenar por distancia'}
        </button>
      </div>
      <div className={STATUS_CLASS}>
        <span className="h-2 w-2 rounded-full bg-[var(--tone-green-fg)]" />
        <span aria-live="polite">{message}</span>
      </div>
    </div>
  )
}

function AvailabilityHeading() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
        style={tone('violet')}
      >
        <Icon name="search" size={20} />
      </div>
      <div>
        <h2 className="text-[15px] font-bold text-[var(--dash-text)]">
          Negocios disponibles
        </h2>
        <p className="mt-0.5 text-[13px] font-medium text-[var(--dash-text2)]">
          Ordenalos por distancia cuando compartís tu ubicación.
        </p>
      </div>
    </div>
  )
}
