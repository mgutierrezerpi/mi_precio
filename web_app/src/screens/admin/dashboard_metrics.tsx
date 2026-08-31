import type { VisitStats } from '../../services/api'
import type { TFn } from '../../lib/i18n'

export function DashboardMetrics({
  goProducts,
  goQr,
  listViews,
  productClicks,
  qrScans,
  visits,
  t,
  locale,
}: {
  goProducts: () => void
  goQr: () => void
  listViews: number
  productClicks: number
  qrScans: number
  visits: VisitStats | null
  t: TFn
  locale: string
}) {
  return (
    <section className="grid min-h-[80px] grid-cols-1 gap-4 md:grid-cols-3">
      <OverviewMetric label={t('analytics.listViews')} value={listViews.toLocaleString(locale)} detail={visits ? t('analytics.todayCount', { count: visits.today.toLocaleString(locale) }) : t('analytics.noData')} featured />
      <OverviewMetric label={t('analytics.productClicks')} value={productClicks.toLocaleString(locale)} detail={t('analytics.noDataYet')} onClick={goProducts} />
      <OverviewMetric label={t('analytics.qrScans')} value={qrScans.toLocaleString(locale)} detail={visits ? t('analytics.todayCount', { count: visits.qr.today.toLocaleString(locale) }) : t('analytics.noData')} onClick={goQr} />
    </section>
  )
}

function OverviewMetric({ label, value, detail, onClick = () => undefined, featured }: { label: string; value: string; detail: string; onClick?: () => void; featured?: boolean }) {
  return <button type="button" onClick={onClick} className={`card dash-card flex min-h-[80px] flex-col justify-center gap-1 rounded-[10px] p-5 text-left ${featured ? 'dash-featured' : ''}`}><span className="text-xs font-semibold text-[#9694A6]">{label}</span><span className="text-2xl font-bold leading-none text-[#F8F7FF]">{value}</span><span className="text-xs text-[#8E8B9C]">{detail}</span></button>
}
