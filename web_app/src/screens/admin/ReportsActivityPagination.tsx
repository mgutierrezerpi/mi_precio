import { useAnalyticsI18n } from './reportsHelpers'

export function ActivityPagination({
  hasNext,
  loaded,
  page,
  setPage,
}: {
  hasNext: boolean
  loaded: boolean
  page: number
  setPage: (page: number | ((page: number) => number)) => void
}) {
  const { t } = useAnalyticsI18n()
  const buttonClass = [
    'rounded-md px-3 py-1.5 text-xs font-bold',
    'text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]',
    'disabled:cursor-not-allowed disabled:opacity-40',
  ].join(' ')
  return (
    <div className="flex items-center justify-between border-t border-[var(--dash-border)] pt-3">
      <button
        type="button"
        onClick={() => setPage((current) => Math.max(0, current - 1))}
        disabled={page === 0 || !loaded}
        className={buttonClass}
      >
        {t('analytics.previous')}
      </button>
      <span className="text-[11px] font-semibold text-[var(--dash-muted)]">
        {t('analytics.page', { page: page + 1 })}
      </span>
      <button
        type="button"
        onClick={() => setPage((current) => current + 1)}
        disabled={!loaded || !hasNext}
        className={buttonClass}
      >
        {t('analytics.next')}
      </button>
    </div>
  )
}
