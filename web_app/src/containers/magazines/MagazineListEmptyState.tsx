import type { TFn } from '../../lib/i18n'
import { gradient } from '../../screens/admin/crm/theme'
import { Icon } from '../../screens/admin/crm/ui'

const EMPTY_STATE_CLASS = [
  'flex min-h-[250px] flex-col items-center justify-center gap-3 rounded-2xl border',
  'border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 text-center',
].join(' ')

export function MagazineListEmptyState({
  hasRows,
  onCreate,
  t,
}: {
  hasRows: boolean
  onCreate?: () => void
  t: TFn
}) {
  return (
    <div className={EMPTY_STATE_CLASS}>
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${gradient}`}
      >
        <Icon name="book-open" size={22} />
      </span>
      <div>
        <p className="text-lg font-bold text-[var(--dash-text)]">
          {hasRows ? t('magazines.noResults') : t('magazines.emptyTitle')}
        </p>
        {!hasRows && (
          <p className="mt-1 text-[13px] text-[var(--dash-muted)]">
            {t('magazines.emptyDescription')}
          </p>
        )}
      </div>
      {!hasRows && onCreate && (
        <button
          type="button"
          onClick={onCreate}
          className={`mt-2 flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold text-white ${gradient}`}
        >
          <Icon name="plus" size={16} /> {t('magazines.new')}
        </button>
      )}
    </div>
  )
}
