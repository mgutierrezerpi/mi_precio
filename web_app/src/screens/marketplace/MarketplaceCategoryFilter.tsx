import { Icon } from '../admin/crm/ui'
import { tone } from '../admin/crm/theme'

const CATEGORIES = [
  ['restaurant', 'Restaurantes'],
  ['bakery', 'Panaderías'],
  ['cafe', 'Cafeterías'],
  ['grocery', 'Almacenes'],
  ['drugstore', 'Farmacias'],
  ['hardware', 'Ferreterías'],
  ['beauty', 'Belleza'],
  ['clothing', 'Indumentaria'],
  ['home', 'Hogar'],
  ['pets', 'Mascotas'],
  ['services', 'Servicios'],
  ['other', 'Otros'],
] as const
const FILTER_CLASS = [
  'flex flex-col gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4',
  'sm:flex-row sm:items-center sm:justify-between',
].join(' ')
const SELECT_CLASS = [
  'min-w-0 flex-1 !border-0 !bg-transparent p-0 text-[13px] font-bold text-[var(--dash-text)]',
  '!outline-none !ring-0 focus:!border-0 focus:!outline-none focus:!ring-0',
].join(' ')

export function MarketplaceCategoryFilter({
  category,
  onChange,
}: {
  category: string
  onChange: (category: string) => void
}) {
  return (
    <div className={FILTER_CLASS}>
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-[10px]"
          style={tone('slate')}
        >
          <Icon name="sliders-horizontal" size={17} />
        </span>
        <div>
          <h2 className="text-[13px] font-bold text-[var(--dash-text)]">
            Filtrar negocios
          </h2>
          <p className="text-[11px] font-medium text-[var(--dash-muted)]">
            Elegí una categoría para refinar los resultados.
          </p>
        </div>
      </div>
      <label className="flex h-10 min-w-0 items-center gap-2 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3 sm:w-64">
        <Icon
          name="search"
          size={15}
          className="shrink-0 text-[var(--dash-muted)]"
        />
        <select
          value={category}
          onChange={(event) => onChange(event.target.value)}
          className={SELECT_CLASS}
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
