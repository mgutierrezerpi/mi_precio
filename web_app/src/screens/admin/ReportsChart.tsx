import { Icon } from './crm/ui'
import { tone } from './crm/theme'
import { dayLabel, type ReportSeries } from './reportsHelpers'
import type { ReportData } from '../../services/api'
import type { TFn } from '../../lib/i18n'

export function ReportsChart({
  data,
  loading,
  t,
  locale,
}: {
  data: ReportData | null
  loading: boolean
  t: TFn
  locale: string
}) {
  const series = data?.series ?? []
  const max = Math.max(1, ...series.map((day) => day.link + day.qr))
  const hasData = series.some((day) => day.link + day.qr > 0)
  if (loading) return <ChartMessage>{t('analytics.loading')}</ChartMessage>
  if (!hasData) return <EmptyChart t={t} />
  return <ChartBars series={series} max={max} t={t} locale={locale} />
}

function ChartMessage({ children }: { children: string }) {
  return (
    <div className="flex h-56 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">
      {children}
    </div>
  )
}

function EmptyChart({ t }: { t: TFn }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={tone('violet')}
      >
        <Icon name="bar-chart" size={22} />
      </span>
      <p className="text-sm font-semibold text-[var(--dash-text)]">
        {t('analytics.noVisitsPeriod')}
      </p>
      <p className="text-xs font-medium text-[var(--dash-muted)]">
        {t('analytics.shareListToMeasure')}
      </p>
    </div>
  )
}

function ChartBars({
  series,
  max,
  t,
  locale,
}: {
  series: ReportSeries
  max: number
  t: TFn
  locale: string
}) {
  const labelEvery = Math.ceil(series.length / 8)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-56 items-end gap-1">
        {series.map((day) => (
          <VisitBar day={day} key={day.date} max={max} t={t} locale={locale} />
        ))}
      </div>
      <div className="flex gap-1">
        {series.map((day, index) => (
          <span
            key={day.date}
            className="flex-1 truncate text-center text-[9px] font-medium text-[var(--dash-muted)]"
          >
            {index % labelEvery === 0 ? dayLabel(day.date, locale) : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

function VisitBar({
  day,
  max,
  t,
  locale,
}: {
  day: ReportSeries[number]
  max: number
  t: TFn
  locale: string
}) {
  const total = day.link + day.qr
  return (
    <div
      className="group relative flex flex-1 items-end"
      style={{ height: '100%' }}
      title={`${dayLabel(day.date, locale)}: ${total} ${t('analytics.visits')}`}
    >
      <div
        className="w-full rounded-t-md bg-[#7C3AED]"
        style={{ height: `${(total / max) * 100}%` }}
      />
      {total === 0 && (
        <div
          className="w-full rounded-t-md bg-[var(--dash-soft)]"
          style={{ height: '4%' }}
        />
      )}
      <span
        className={[
          'pointer-events-none absolute -top-6 left-1/2 z-10',
          '-translate-x-1/2 whitespace-nowrap rounded-md',
          'bg-[var(--dash-text)] px-2 py-1 text-[10px] font-bold',
          'text-[var(--dash-surface)] opacity-0 group-hover:opacity-100',
        ].join(' ')}
      >
        {total}
      </span>
    </div>
  )
}
