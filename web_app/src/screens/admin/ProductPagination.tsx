import { PAGE_SIZE_OPTIONS, type PageSize } from './productScreenUtils'
import { Icon, type IconName } from './crm/ui'
import type { TFn } from '../../lib/i18n'

export function ProductPagination({
  page,
  totalPages,
  pageSize,
  shown,
  total,
  onPage,
  onPageSize,
  t,
}: {
  page: number
  totalPages: number
  pageSize: PageSize
  shown: number
  total: number
  onPage: (page: number | ((current: number) => number)) => void
  onPageSize: (size: PageSize) => void
  t: TFn
}) {
  return (
    <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-between gap-4 sm:justify-start">
        <span className="text-xs font-medium text-[var(--dash-muted)]">
          {t('products.showing', { shown, total })}
        </span>
        <label className="flex items-center gap-2 text-xs font-medium text-[var(--dash-muted)]">
          <span>{t('products.perPage')}</span>
          <select
            value={pageSize}
            onChange={(event) => {
              onPageSize(Number(event.target.value) as PageSize)
              onPage(1)
            }}
            className="h-8 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 text-xs font-bold text-[var(--dash-text2)] outline-none focus:border-[var(--dash-link)]"
            aria-label={t('products.perPage')}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center justify-end gap-1">
        <PagerButton
          icon="chevrons-left"
          disabled={page === 1}
          onClick={() => onPage(1)}
        />
        <PagerButton
          icon="chevron-left"
          disabled={page === 1}
          onClick={() => onPage((current) => Math.max(1, current - 1))}
        />
        {pageList(page, totalPages).map((item, index) =>
          item === '…' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-xs font-bold text-[var(--dash-muted)]"
            >
              …
            </span>
          ) : (
            <PagerNumber
              key={item}
              value={item}
              active={item === page}
              onClick={() => onPage(item)}
            />
          )
        )}
        <PagerButton
          icon="chevron-right"
          disabled={page === totalPages}
          onClick={() => onPage((current) => Math.min(totalPages, current + 1))}
        />
        <PagerButton
          icon="chevrons-right"
          disabled={page === totalPages}
          onClick={() => onPage(totalPages)}
        />
      </div>
    </div>
  )
}

function PagerButton({
  icon,
  disabled,
  onClick,
}: {
  icon: IconName
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="dash-pagination flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon name={icon} size={13} />
    </button>
  )
}

function PagerNumber({
  value,
  active,
  onClick,
}: {
  value: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dash-pagination flex h-[30px] w-[30px] items-center justify-center rounded-lg text-xs font-bold ${active ? 'bg-[#7C3AED] text-white' : 'border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'}`}
    >
      {value}
    </button>
  )
}

function pageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const result: (number | '…')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) result.push('…')
  for (let index = start; index <= end; index++) result.push(index)
  if (end < total - 1) result.push('…')
  result.push(total)
  return result
}
