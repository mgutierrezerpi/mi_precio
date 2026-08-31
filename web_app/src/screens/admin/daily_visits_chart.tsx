import { useNavigate } from 'react-router-dom'
import type { ReportData } from '../../services/api'
import type { TFn } from '../../lib/i18n'
import { Icon } from './crm/ui'

export function DailyVisitsChart({ data, t, locale }: { data: ReportData | null; t: TFn; locale: string }) {
  const navigate = useNavigate()
  const totals = (data?.series ?? []).map((day) => day.link + day.qr)
  const max = Math.max(1, ...totals)
  const recent = totals.slice(-7).reduce((sum, value) => sum + value, 0)
  const previous = totals.slice(-14, -7).reduce((sum, value) => sum + value, 0)
  const change = previous ? Math.round(((recent - previous) / previous) * 100) : recent ? 100 : 0
  const points = totals.map((value, index) => `${(index / Math.max(1, totals.length - 1)) * 100},${100 - (value / max) * 82 - 9}`).join(' ')
  const hasVisits = totals.some(Boolean)

  return <section className={`card dash-card flex flex-col gap-4 rounded-[10px] p-5 ${hasVisits ? 'min-h-[300px] flex-1' : ''}`}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="text-lg font-bold text-[#F8F7FF]">{t('analytics.visitGrowth')}</h3><p className="text-[13px] text-[#9694A6]">{t('analytics.last30Days')}</p></div><button type="button" onClick={() => navigate('/reports')} className="btn btn-sm h-8 w-fit rounded-md bg-[#1C1730] px-3 text-xs font-semibold text-[#C4B5FD]">{t('analytics.cumulativeData')}</button></div>
    {hasVisits ? <ChartData points={points} recent={recent} change={change} t={t} locale={locale} /> : <EmptyChart data={data} t={t} />}
  </section>
}

function ChartData({ points, recent, change, t, locale }: { points: string; recent: number; change: number; t: TFn; locale: string }) {
  return <><div className="flex items-end justify-between rounded-xl bg-[#1C1730] px-4 py-3"><div><p className="text-[11px] font-semibold text-[#9694A6]">{t('analytics.last7Days')}</p><p className="text-2xl font-bold text-[#F8F7FF]">{recent.toLocaleString(locale)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${change >= 0 ? 'bg-[#14532D] text-[#86EFAC]' : 'bg-[#7F1D1D] text-[#FCA5A5]'}`}>{change >= 0 ? '+' : ''}{change}%</span></div><div className="flex min-h-40 flex-1 flex-col justify-end gap-2"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-36 w-full overflow-visible"><polyline points={points} fill="none" stroke="#A78BFA" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg><div className="flex justify-between text-[10px] text-[#9694A6]"><span>{t('analytics.thirtyDaysAgo')}</span><span>{t('analytics.today')}</span></div></div></>
}

function EmptyChart({ data, t }: { data: ReportData | null; t: TFn }) {
  return <div className="flex items-center gap-3 rounded-xl bg-[#1C1730] px-4 py-4 text-[13px] text-[#9694A6]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2B1A4B] text-[#C4B5FD]"><Icon name="trending-up" size={17} /></span><span>{data ? t('analytics.shareListToMeasure') : t('analytics.loading')}</span></div>
}
