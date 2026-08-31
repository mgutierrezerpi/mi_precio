import { fmtInt } from './reportsHelpers'
import { gradient } from './crm/theme'
import type { PriceList } from '../../types'
import type { TFn } from '../../lib/i18n'

export function PerformanceHeader({
  days,
  periodVisits,
  setDays,
  t,
  locale,
  lists,
  selectedListId,
  onSelectList,
}: {
  days: number
  periodVisits: number
  setDays: (days: number) => void
  t: TFn
  locale: string
  lists: PriceList[]
  selectedListId?: string
  onSelectList: (listId: string) => void
}) {
  const ranges = [
    [7, 'analytics.periodWeek'],
    [30, 'analytics.periodMonth'],
    [180, 'analytics.periodSixMonths'],
    [365, 'analytics.periodYear'],
  ] as const
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-[var(--dash-text)]">
          {t('analytics.totalVisitsByDay')}
        </h2>
        <p className="text-[13px] text-[var(--dash-muted)]">
          {t('analytics.visitsInPeriod', {
            count: fmtInt(periodVisits, locale),
            days,
          })}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <label className="flex w-full items-center gap-2 text-xs font-semibold text-[var(--dash-text2)] sm:w-auto">
          <span className="shrink-0">{t('analytics.list')}</span>
          <select
            value={selectedListId ?? ''}
            onChange={(event) => onSelectList(event.target.value)}
            className={[
              'min-w-0 flex-1 rounded-lg border border-[var(--dash-border)]',
              'bg-[var(--dash-surface)] px-2.5 py-1.5 text-xs font-semibold',
              'text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)] sm:w-52',
            ].join(' ')}
          >
            <option value="">{t('analytics.allLists')}</option>
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </label>
        <div
          className={[
            'flex w-full items-center gap-1 rounded-lg border border-[var(--dash-border)]',
            'bg-[var(--dash-surface)] p-1 sm:w-auto sm:shrink-0',
          ].join(' ')}
        >
          {ranges.map(([rangeDays, label]) => (
            <button
              key={rangeDays}
              type="button"
              onClick={() => setDays(rangeDays)}
              className={[
                'flex h-8 flex-1 items-center justify-center rounded-md px-3',
                'text-xs font-bold sm:flex-none',
                days === rangeDays
                  ? `text-white ${gradient}`
                  : 'text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]',
              ].join(' ')}
            >
              {t(label)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
