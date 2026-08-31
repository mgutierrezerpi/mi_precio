import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { type ReportData } from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { QrModal } from './PriceListsScreen'
import { useAnalyticsI18n, useDashboardData } from './dashboard_data'
import { DashboardHero } from './dashboard_hero'
import { DashboardMetrics } from './dashboard_metrics'
import { DailyVisitsChart } from './daily_visits_chart'

export function DashboardScreen() {
  const navigate = useNavigate()
  const { locale, t } = useAnalyticsI18n()
  const dashboard = useDashboardData(navigate)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [trend, setTrend] = useState<ReportData | null>(null)
  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  useEffect(() => {
    if (!dashboard.tenant?.id) return
    let cancelled = false
    api.getReports(dashboard.tenant.id, 30).then((res) => {
      if (!cancelled && res.data) setTrend(res.data)
    })
    return () => {
      cancelled = true
    }
  }, [dashboard.tenant?.id])

  const openQrModal = () => {
    if (dashboard.qrList) setQrModalOpen(true)
    else dashboard.goQr()
  }
  const qrLinkUrl = dashboard.qrList
    ? `${window.location.origin}/p/${dashboard.tenant?.subdomain || 'mi-negocio'}/${dashboard.qrList.slug || dashboard.qrList.id}`
    : ''

  return (
    <CrmLayout
      active="Overview"
      title={t('analytics.workspaceOverview')}
      subtitle={formattedDate}
      hideContext
      searchPlaceholder={t('analytics.searchWorkspace')}
      searchValue={dashboard.search}
      onSearchChange={dashboard.setSearch}
      onSearchSubmit={(q) =>
        navigate(
          q.trim()
            ? `/admin/items?q=${encodeURIComponent(q.trim())}`
            : '/admin/items'
        )
      }
    >
      <main className="flex min-h-full flex-col gap-4 px-4 py-6 md:px-10 md:py-8">
        <DashboardHero {...dashboard} goQr={openQrModal} onCopy={dashboard.copyUrl} t={t} />
        <DashboardMetrics
          {...dashboard.metrics}
          goProducts={dashboard.goProducts}
          goQr={dashboard.goQr}
          visits={dashboard.visits}
          t={t}
          locale={locale}
        />
        <DailyVisitsChart data={trend} t={t} locale={locale} />
      </main>
      {qrModalOpen && dashboard.qrList && (
        <QrModal
          list={dashboard.qrList}
          url={qrLinkUrl}
          linkUrl={qrLinkUrl}
          qrValue={dashboard.qrUrl}
          fg={dashboard.qrColor}
          logoUrl={dashboard.tenant?.logoUrl || '/miprecio-favicon.png'}
          onClose={() => setQrModalOpen(false)}
        />
      )}
    </CrmLayout>
  )
}

export default DashboardScreen
