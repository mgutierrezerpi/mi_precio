import { useEffect, useState } from 'react'
import type { Activity } from '../../types'
import api from '../../services/api'
import { ActivityRow } from './crm/activity'
import { useAnalyticsI18n } from './reportsHelpers'
import type { TFn } from '../../lib/i18n'
import { ActivityPagination } from './ReportsActivityPagination'

const AUDIT_PAGE_SIZE = 25

export function ActivityLog({
  tenantId,
  audit = false,
}: {
  tenantId?: string
  audit?: boolean
}) {
  const [items, setItems] = useState<Activity[]>([])
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    const pageSize = audit ? AUDIT_PAGE_SIZE : 20
    const load = () =>
      api
        .getActivity(
          tenantId,
          audit ? pageSize + 1 : pageSize,
          audit ? page * pageSize : 0
        )
        .then((res) => {
          if (!cancelled && res.data) {
            setItems(res.data.slice(0, pageSize))
            setHasNext(audit && res.data.length > pageSize)
            setLoaded(true)
          }
        })
    load()
    const id = setInterval(load, 7000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [audit, page, tenantId])
  const { t } = useAnalyticsI18n()
  return (
    <ActivityLogContent
      audit={audit}
      t={t}
      hasNext={hasNext}
      items={items}
      loaded={loaded}
      page={page}
      setPage={setPage}
    />
  )
}

function ActivityLogContent({
  audit,
  hasNext,
  items,
  loaded,
  page,
  setPage,
  t,
}: {
  audit: boolean
  hasNext: boolean
  items: Activity[]
  loaded: boolean
  page: number
  setPage: (page: number | ((page: number) => number)) => void
  t: TFn
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <ActivityLogHeader audit={audit} t={t} />
      <ActivityLogItems audit={audit} items={items} loaded={loaded} t={t} />
      {audit && (
        <ActivityPagination
          hasNext={hasNext}
          loaded={loaded}
          page={page}
          setPage={setPage}
        />
      )}
    </div>
  )
}

function ActivityLogHeader({ audit, t }: { audit: boolean; t: TFn }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <h3 className="text-[18px] font-extrabold text-[var(--dash-text)]">
          {audit ? t('analytics.auditLog') : t('analytics.recentActivity')}
        </h3>
        {audit && (
          <p className="text-[13px] font-medium text-[var(--dash-muted)]">
            {t('analytics.auditDescription')}
          </p>
        )}
      </div>
      <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--dash-muted)]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />{' '}
        {t('analytics.live')}
      </span>
    </div>
  )
}

function ActivityLogItems({
  audit,
  items,
  loaded,
  t,
}: {
  audit: boolean
  items: Activity[]
  loaded: boolean
  t: TFn
}) {
  if (loaded && items.length === 0)
    return (
      <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">
        {t('analytics.noRecordsYet')}
      </p>
    )
  return (
    <div
      className={`flex ${audit ? 'max-h-[600px]' : 'max-h-80'} flex-col gap-3.5 overflow-y-auto pr-1`}
    >
      {items.map((activity) => (
        <ActivityRow key={activity.id} activity={activity} />
      ))}
    </div>
  )
}
