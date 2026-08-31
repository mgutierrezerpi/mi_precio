import type { TFn } from '../../lib/i18n'
import { gradient, tone } from '../../screens/admin/crm/theme'
import { Icon } from '../../screens/admin/crm/ui'
import type { Magazine } from '../../types'
import { MagazineListEmptyState } from './MagazineListEmptyState'
import { MagazineGrid } from './MagazineGrid'

export function MagazineList({
  canEdit,
  error,
  magazines,
  rows,
  subdomain,
  t,
  onCreate,
  onDelete,
  onEdit,
  onRetry,
  onToggleIndex,
  onTogglePublished,
}: {
  canEdit: boolean
  error: string | null
  magazines: Magazine[]
  rows: Magazine[] | null
  subdomain?: string
  t: TFn
  onCreate: () => void
  onDelete: (magazine: Magazine) => void
  onEdit: (magazine: Magazine) => void
  onRetry: () => void
  onToggleIndex: (magazine: Magazine) => void
  onTogglePublished: (magazine: Magazine) => void
}) {
  return (
    <main className="flex min-h-full flex-col gap-5 px-4 py-6 md:px-10 md:py-8">
      <MagazineListHeader canEdit={canEdit} t={t} onCreate={onCreate} />
      {error && <MagazineListError error={error} t={t} onRetry={onRetry} />}
      {rows === null ? (
        <Loading t={t} />
      ) : rows.length === 0 ? (
        <MagazineListEmptyState
          hasRows={magazines.length > 0}
          onCreate={canEdit ? onCreate : undefined}
          t={t}
        />
      ) : (
        <MagazineGrid
          rows={rows}
          subdomain={subdomain}
          canEdit={canEdit}
          t={t}
          onDelete={onDelete}
          onEdit={onEdit}
          onToggleIndex={onToggleIndex}
          onTogglePublished={onTogglePublished}
        />
      )}
    </main>
  )
}

function MagazineListHeader({
  canEdit,
  t,
  onCreate,
}: {
  canEdit: boolean
  t: TFn
  onCreate: () => void
}) {
  return (
    <section className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--dash-muted)]">
          {t('magazines.eyebrow')}
        </p>
        <h1 className="mt-2 text-[28px] font-bold leading-none text-[var(--dash-text)]">
          {t('nav.magazines')}
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] text-[var(--dash-muted)]">
          {t('magazines.description')}
        </p>
      </div>
      {canEdit && (
        <button
          type="button"
          onClick={onCreate}
          className={`flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px] font-bold text-white ${gradient}`}
        >
          <Icon name="plus" size={15} /> {t('magazines.new')}
        </button>
      )}
    </section>
  )
}

function MagazineListError({
  error,
  t,
  onRetry,
}: {
  error: string
  t: TFn
  onRetry: () => void
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--tone-red-fg)]/25 p-4 text-sm"
      style={tone('red')}
    >
      <span>{error}</span>
      <button type="button" onClick={onRetry} className="font-bold underline">
        {t('common.retry')}
      </button>
    </div>
  )
}

function Loading({ t }: { t: TFn }) {
  return (
    <div className="flex h-40 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">
      {t('magazines.loading')}
    </div>
  )
}
