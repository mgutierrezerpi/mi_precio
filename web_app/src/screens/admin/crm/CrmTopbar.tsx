import { useTheme } from '../../../hooks/useTheme'
import { Icon, UserMenu } from './ui'
import { NotificationsBell } from './NotificationsBell'

interface CrmTopbarProps {
  title: string
  subtitle: string
  searchPlaceholder?: string
  /** Controlled search value + handler. When omitted the input is decorative. */
  searchValue?: string
  onSearchChange?: (value: string) => void
  /** Called when the user presses Enter in the search box (e.g. global search). */
  onSearchSubmit?: (value: string) => void
  /** Optional action button(s) rendered before the theme toggle (e.g. "Compartir lista"). */
  actions?: React.ReactNode
}

/** Shared CRM topbar: title + search + theme toggle + notifications + user menu. */
export function CrmTopbar({ title, subtitle, searchPlaceholder = 'Buscar…', searchValue, onSearchChange, onSearchSubmit, actions }: CrmTopbarProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="flex h-[72px] shrink-0 items-center gap-4 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-8">
      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-xl font-extrabold text-[var(--dash-text)]">{title}</h1>
        <p className="truncate text-xs font-medium text-[var(--dash-muted)]">{subtitle}</p>
      </div>
      <div className="flex-1" />
      <label className="hidden h-10 w-[320px] items-center gap-2.5 rounded-xl bg-[var(--dash-soft)] px-3 lg:flex">
        <Icon name="search" size={16} className="text-[var(--dash-muted)]" />
        <input
          placeholder={searchPlaceholder}
          value={searchValue ?? ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && onSearchSubmit) { e.preventDefault(); onSearchSubmit(searchValue ?? '') } }}
          readOnly={!onSearchChange}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] font-medium text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)] focus:border-0 focus:outline-none focus:ring-0"
        />
      </label>
      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] hover:opacity-80"
        title={isDark ? 'Modo claro' : 'Modo oscuro'}
      >
        <Icon name={isDark ? 'sun' : 'moon'} className={isDark ? 'text-[#FBBF24]' : 'text-[var(--dash-text2)]'} />
      </button>
      <NotificationsBell />
      {actions}
      <UserMenu />
    </header>
  )
}
