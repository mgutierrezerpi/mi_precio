import { useTheme } from '../../../hooks/useTheme'
import { useDensity } from '../../../hooks/useDensity'
import { useT } from '../../../lib/i18n'
import { Icon, UserMenu } from './ui'
import { NotificationsBell } from './NotificationsBell'
import { useAppDispatch } from '../../../store/hooks'
import { updateCurrentUser } from '../../../store/slices/authSlice'

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
  /** Show the compact/full density toggle. Enabled per-screen while we roll it out. */
  showDensityToggle?: boolean
  /** Opens the mobile navigation drawer (hamburger). */
  onMenu?: () => void
}

/** Shared CRM topbar: title + search + density/theme toggles + notifications + user menu. */
export function CrmTopbar({ title, subtitle, searchPlaceholder = 'Buscar…', searchValue, onSearchChange, onSearchSubmit, actions, showDensityToggle, onMenu }: CrmTopbarProps) {
  const dispatch = useAppDispatch()
  const { isDark, toggleTheme } = useTheme()
  const { compact, toggleDensity } = useDensity()
  const t = useT()

  return (
    <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 md:gap-4 md:px-8">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Abrir menú"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80 lg:hidden"
      >
        <Icon name="menu" />
      </button>
      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-lg font-extrabold text-[var(--dash-text)] md:text-xl">{title}</h1>
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
        title={isDark ? t('top.lightMode') : t('top.darkMode')}
      >
        <Icon name={isDark ? 'sun' : 'moon'} className={isDark ? 'text-[#FBBF24]' : 'text-[var(--dash-text2)]'} />
      </button>
      {showDensityToggle && (
        <button
          type="button"
          onClick={toggleDensity}
          className="hidden h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] hover:opacity-80 lg:flex"
          title={compact ? t('top.fullView') : t('top.compactView')}
        >
          <Icon name={compact ? 'layout-dashboard' : 'rows-2'} className={compact ? 'text-[var(--dash-link)]' : 'text-[var(--dash-text2)]'} />
        </button>
      )}
      <NotificationsBell />
      {actions}
      <div className="hidden items-center overflow-hidden rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] xl:flex">
        <button type="button" onClick={() => dispatch(updateCurrentUser({ adminUiMode: 'medium' }))} className="h-10 px-3 text-[13px] font-bold text-[var(--dash-text2)] hover:text-[var(--dash-link)]">
          {t('mode.medium')}
        </button>
        <button type="button" onClick={() => dispatch(updateCurrentUser({ adminUiMode: 'simple' }))} className="h-10 border-l border-[var(--dash-soft-border)] px-3 text-[13px] font-bold text-[var(--dash-text2)] hover:text-[var(--dash-link)]">
          {t('mode.simple')}
        </button>
      </div>
      <UserMenu />
    </header>
  )
}
