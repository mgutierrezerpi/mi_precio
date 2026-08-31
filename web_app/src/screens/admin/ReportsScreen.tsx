import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import { fetchLists, selectLists } from '../../store/slices/menuSlice'
import api, { type ReportData } from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { useAnalyticsI18n } from './reportsHelpers'
import { ReportTabs } from './ReportsTabs'
import { PerformanceReport } from './ReportsPerformance'
import { ActivityLog } from './ReportsActivity'

export function ReportsScreen() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const lists = useAppSelector(selectLists)
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useAnalyticsI18n()
  const [days, setDays] = useState(30)
  const [tab, setTab] = useState<'rendimiento' | 'auditoria'>('rendimiento')
  const [data, setData] = useState<ReportData | null>(null)
  const selectedListId = lists.find(
    (list) => list.id === searchParams.get('list')
  )?.id

  useEffect(() => {
    if (tenant?.id) dispatch(fetchLists(tenant.id))
  }, [dispatch, tenant?.id])

  useEffect(() => {
    if (!tenant?.id) return
    let cancelled = false
    api.getReports(tenant.id, days, selectedListId).then((res) => {
      if (!cancelled && res.data) setData(res.data)
    })
    return () => {
      cancelled = true
    }
  }, [tenant?.id, days, selectedListId])

  const loading =
    data?.days !== days || data?.listId !== (selectedListId ?? null)
  const periodVisits = useMemo(
    () =>
      (data?.series ?? []).reduce((total, day) => total + day.link + day.qr, 0),
    [data]
  )
  const selectList = (listId: string) => {
    setSearchParams((current) => {
      if (listId) current.set('list', listId)
      else current.delete('list')
      return current
    })
  }

  return (
    <CrmLayout
      active={t('analytics.reports')}
      title={t('analytics.reports')}
      subtitle={t('analytics.reportsSubtitle')}
      hideContext
      searchPlaceholder={t('analytics.search')}
    >
      <main className="flex min-h-full flex-col gap-4 px-4 py-6 md:px-10 md:py-8 xl:min-w-[980px]">
        <section className="flex min-h-[60px] flex-col justify-center gap-1">
          <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">
            {t('analytics.reports')}
          </h1>
          <p className="text-[13px] text-[#9694A6]">
            {t('analytics.reportsSubtitle')}
          </p>
        </section>
        <ReportTabs tab={tab} setTab={setTab} t={t} />
        {tab === 'rendimiento' ? (
          <PerformanceReport
            data={data}
            days={days}
            loading={loading}
            periodVisits={periodVisits}
            setDays={setDays}
            lists={lists}
            selectedListId={selectedListId}
            onSelectList={selectList}
          />
        ) : (
          <ActivityLog tenantId={tenant?.id} audit />
        )}
      </main>
    </CrmLayout>
  )
}

export default ReportsScreen
