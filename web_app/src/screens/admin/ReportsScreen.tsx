import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import { fetchLists, selectLists } from '../../store/slices/menuSlice'
import type { Activity, PriceList } from '../../types'
import api, { type ReportData } from '../../services/api'
import { formatPrice } from './crm/productFormat'
import { CrmLayout } from './crm/CrmLayout'
import { Icon } from './crm/ui'
import { ActivityRow } from './crm/activity'
import { tone, gradient, type Tone } from './crm/theme'
import { localeOf, normalizeLang, useT, type TFn } from '../../lib/i18n'
import { DICT_ANALYTICS } from '../../lib/i18nDictionaryAnalytics'

function useAnalyticsI18n() {
  const baseT = useT()
  const tenant = useAppSelector(selectTenant)
  const lang = normalizeLang(tenant?.language)
  const t: TFn = (key, vars) => {
    let value = DICT_ANALYTICS[key]?.[lang] ?? baseT(key)
    if (vars)
      for (const [name, replacement] of Object.entries(vars))
        value = value.replaceAll(`{${name}}`, String(replacement))
    return value
  }
  return { locale: localeOf(tenant?.language), t }
}

const fmtInt = (n: number, locale: string) =>
  new Intl.NumberFormat(locale).format(n)

function dayLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
    .format(new Date(`${iso}T00:00:00`))
    .replace('.', '')
}

const channelMeta = (t: TFn): { key: 'link' | 'qr'; name: string; color: string }[] => [
  { key: 'link', name: t('analytics.directLink'), color: '#7C3AED' },
  { key: 'qr', name: t('analytics.qrCode'), color: '#0EA5E9' },
]
const PRODUCT_TONES: Tone[] = ['violet', 'sky', 'rose', 'amber', 'purple']

export function ReportsScreen() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const lists = useAppSelector(selectLists)
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useAnalyticsI18n()
  const [days, setDays] = useState(30)
  const [tab, setTab] = useState<'rendimiento' | 'auditoria'>('rendimiento')
  const [data, setData] = useState<ReportData | null>(null)
  const selectedList = lists.find((list) => list.id === searchParams.get('list'))
  const selectedListId = selectedList?.id

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

  // Derived: we're loading until the data we hold matches the requested range
  // (avoids a synchronous setState in the effect, and shows the spinner on range switch).
  const loading = data?.days !== days || data?.listId !== (selectedListId ?? null)

  const selectList = (listId: string) => {
    setSearchParams((current) => {
      if (listId) current.set('list', listId)
      else current.delete('list')
      return current
    })
  }

  const periodVisits = useMemo(
    () => (data?.series ?? []).reduce((acc, d) => acc + d.link + d.qr, 0),
    [data]
  )

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

function ReportTabs({
  tab,
  setTab,
  t,
}: {
  tab: 'rendimiento' | 'auditoria'
  setTab: (tab: 'rendimiento' | 'auditoria') => void
  t: TFn
}) {
  return (
    <nav
      className="flex w-full items-center gap-1 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1 sm:w-fit"
      aria-label={t('analytics.reportSections')}
    >
      <ReportTab
        active={tab === 'rendimiento'}
        onClick={() => setTab('rendimiento')}
      >
        {t('analytics.performance')}
      </ReportTab>
      <ReportTab
        active={tab === 'auditoria'}
        onClick={() => setTab('auditoria')}
      >
        {t('analytics.auditLog')}
      </ReportTab>
    </nav>
  )
}

function ReportTab({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-xs font-bold ${active ? `text-white ${gradient}` : 'text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'}`}
    >
      {children}
    </button>
  )
}

function PerformanceReport({
  data,
  days,
  loading,
  periodVisits,
  setDays,
  lists,
  selectedListId,
  onSelectList,
}: {
  data: ReportData | null
  days: number
  loading: boolean
  periodVisits: number
  setDays: (days: number) => void
  lists: PriceList[]
  selectedListId?: string
  onSelectList: (listId: string) => void
}) {
  const { locale, t } = useAnalyticsI18n()
  return (
    <div className="flex flex-col gap-4">
      <section className="flex min-h-[390px] flex-col gap-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 md:p-5">
        <PerformanceHeader
          days={days}
          periodVisits={periodVisits}
          setDays={setDays}
          t={t}
          locale={locale}
          lists={lists}
          selectedListId={selectedListId}
          onSelectList={onSelectList}
        />
        <VisitChart data={data} loading={loading} t={t} locale={locale} />
      </section>
      <div className={`grid grid-cols-1 gap-4 ${selectedListId ? '' : 'xl:grid-cols-2'}`}>
        {!selectedListId && <TopProducts data={data} loading={loading} />}
        <Channels data={data} loading={loading} />
      </div>
    </div>
  )
}

function PerformanceHeader({
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
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-[var(--dash-text)]">
          {t('analytics.totalVisitsByDay')}
        </h2>
        <p className="text-[13px] text-[var(--dash-muted)]">
          {t('analytics.visitsInPeriod', { count: fmtInt(periodVisits, locale), days })}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <label className="flex w-full items-center gap-2 text-xs font-semibold text-[var(--dash-text2)] sm:w-auto">
          <span className="shrink-0">{t('analytics.list')}</span>
          <select
            value={selectedListId ?? ''}
            onChange={(event) => onSelectList(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)] sm:w-52"
          >
            <option value="">{t('analytics.allLists')}</option>
            {lists.map((list) => (
              <option key={list.id} value={list.id}>{list.name}</option>
            ))}
          </select>
        </label>
        <div className="flex w-full items-center gap-1 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1 sm:w-auto sm:shrink-0">
          {[
            [7, 'analytics.periodWeek'],
            [30, 'analytics.periodMonth'],
            [180, 'analytics.periodSixMonths'],
            [365, 'analytics.periodYear'],
          ].map(([rangeDays, label]) => (
          <button
            key={rangeDays as number}
            type="button"
            onClick={() => setDays(rangeDays as number)}
            className={`flex h-8 flex-1 items-center justify-center rounded-md px-3 text-xs font-bold sm:flex-none ${days === rangeDays ? `text-white ${gradient}` : 'text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'}`}
          >
            {t(label as string)}
          </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Full activity feed for the tenant, in a fixed-height scrollable panel. */
const AUDIT_PAGE_SIZE = 25

function ActivityLog({
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

  // Poll so a teammate's actions appear live, same cadence as the dashboard feed.
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
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" /> {t('analytics.live')}
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

function ActivityPagination({
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
  return (
    <div className="flex items-center justify-between border-t border-[var(--dash-border)] pt-3">
      <button
        type="button"
        onClick={() => setPage((current) => Math.max(0, current - 1))}
        disabled={page === 0 || !loaded}
        className="rounded-md px-3 py-1.5 text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:cursor-not-allowed disabled:opacity-40"
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
        className="rounded-md px-3 py-1.5 text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t('analytics.next')}
      </button>
    </div>
  )
}

/** Total visits per day, heights relative to the busiest day. */
function VisitChart({
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
  const max = Math.max(1, ...series.map((d) => d.link + d.qr))
  const hasData = series.some((d) => d.link + d.qr > 0)
  // With long ranges, only label a handful of evenly spaced days to avoid clutter.
  const labelEvery = Math.ceil(series.length / 8)

  if (loading) {
    return (
      <div className="flex h-56 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">
        {t('analytics.loading')}
      </div>
    )
  }
  if (!hasData) {
    return <EmptyVisitChart t={t} />
  }
  return <VisitChartContent labelEvery={labelEvery} max={max} series={series} t={t} locale={locale} />
}

function EmptyVisitChart({ t }: { t: TFn }) {
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

type ReportSeries = NonNullable<ReportData['series']>

function VisitChartContent({
  labelEvery,
  max,
  series,
  t,
  locale,
}: {
  labelEvery: number
  max: number
  series: ReportSeries
  t: TFn
  locale: string
}) {
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

function VisitBar({ day, max, t, locale }: { day: ReportSeries[number]; max: number; t: TFn; locale: string }) {
  const total = day.link + day.qr
  return (
    <div
      className="group relative flex flex-1 items-end"
      style={{ height: '100%' }}
      title={`${dayLabel(day.date, locale)}: ${total} ${t('analytics.visits')}`}
    >
      <div className="w-full rounded-t-md bg-[#7C3AED]" style={{ height: `${(total / max) * 100}%` }} />
      {total === 0 && (
        <div
          className="w-full rounded-t-md bg-[var(--dash-soft)]"
          style={{ height: '4%' }}
        />
      )}
      <span className="pointer-events-none absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--dash-text)] px-2 py-1 text-[10px] font-bold text-[var(--dash-surface)] opacity-0 group-hover:opacity-100">
        {total}
      </span>
    </div>
  )
}

/** Best-selling products from paid orders. */
function TopProducts({
  data,
  loading,
}: {
  data: ReportData | null
  loading: boolean
}) {
  const { locale, t } = useAnalyticsI18n()
  const items = data?.topProducts ?? []
  const max = Math.max(1, ...items.map((p) => p.units))

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <h3 className="text-[16px] font-extrabold text-[var(--dash-text)]">
        {t('analytics.topProducts')}
      </h3>
      {loading ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">
          {t('analytics.loading')}
        </p>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">
          {t('analytics.noSalesYet')}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((p, i) => (
            <div key={p.name} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate font-semibold text-[var(--dash-text2)]">
                  {p.name}
                </span>
                <span className="shrink-0 font-bold text-[var(--dash-muted)]">
                  {fmtInt(p.units, locale)} {t('analytics.units')} · {formatPrice(p.revenue)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--dash-soft)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(p.units / max) * 100}%`,
                    backgroundColor: `var(--tone-${PRODUCT_TONES[i % PRODUCT_TONES.length]}-fg)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** QR vs link traffic split over the selected period. */
function Channels({
  data,
  loading,
}: {
  data: ReportData | null
  loading: boolean
}) {
  const { locale, t } = useAnalyticsI18n()
  const channels = data?.channels ?? { link: 0, qr: 0 }
  const total = channels.link + channels.qr
  const rows = channelMeta(t).map((c) => ({
    ...c,
    count: channels[c.key],
    pct: total ? Math.round((channels[c.key] / total) * 100) : 0,
  }))

  const gradientCss = useMemo(() => {
    if (!total) return 'var(--dash-soft)'
    let acc = 0
    const stops = rows.map((c) => {
      const from = acc
      acc += (c.count / total) * 100
      return `${c.color} ${from}% ${acc}%`
    })
    return `conic-gradient(${stops.join(', ')})`
  }, [rows, total])

  return (
    <ChannelsContent
      gradientCss={gradientCss}
      loading={loading}
      rows={rows}
      total={total}
      t={t}
      locale={locale}
    />
  )
}

type ChannelRow = { name: string; color: string; count: number; pct: number }

function ChannelsContent({
  gradientCss,
  loading,
  rows,
  total,
  t,
  locale,
}: {
  gradientCss: string
  loading: boolean
  rows: ChannelRow[]
  total: number
  t: TFn
  locale: string
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <h3 className="text-[16px] font-extrabold text-[var(--dash-text)]">
        {t('analytics.byChannel')}
      </h3>
      {loading ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">
          {t('analytics.loading')}
        </p>
      ) : total === 0 ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">
          {t('analytics.noTrafficPeriod')}
        </p>
      ) : (
        <ChannelBreakdown gradientCss={gradientCss} rows={rows} total={total} t={t} locale={locale} />
      )}
    </div>
  )
}

function ChannelBreakdown({
  gradientCss,
  rows,
  total,
  t,
  locale,
}: {
  gradientCss: string
  rows: ChannelRow[]
  total: number
  t: TFn
  locale: string
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative h-28 w-28 shrink-0 rounded-full"
        style={{ background: gradientCss }}
      >
        <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-[var(--dash-surface)]">
          <span className="text-[18px] font-black leading-none text-[var(--dash-text)]">
            {fmtInt(total, locale)}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
            {t('analytics.visits')}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {rows.map((channel) => (
          <ChannelRowItem channel={channel} key={channel.name} />
        ))}
      </div>
    </div>
  )
}

function ChannelRowItem({ channel }: { channel: ChannelRow }) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: channel.color }}
      />
      <span className="flex-1 font-semibold text-[var(--dash-text2)]">
        {channel.name}
      </span>
      <span className="font-bold text-[var(--dash-muted)]">{channel.pct}%</span>
    </div>
  )
}

export default ReportsScreen
