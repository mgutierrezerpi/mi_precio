import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import { fetchLists, selectLists } from '../../store/slices/menuSlice'
import { fetchProducts, selectProducts } from '../../store/slices/productsSlice'
import type {
  Product,
  CustomerStats,
  Activity,
  Tenant,
  PriceList,
} from '../../types'
import api, { type VisitStats } from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { FirstSteps } from './crm/FirstSteps'
import { Icon, type IconName } from './crm/ui'
import { QrCode } from './crm/QrCode'
import { QrModal } from './PriceListsScreen'
import { tone, gradient, type Tone } from './crm/theme'
import { DEFAULT_QR_COLOR, QR_COLOR_STORAGE_PREFIX } from '../../lib/qrRender'
import { localeOf, normalizeLang, useT, type TFn } from '../../lib/i18n'
import { markQrShared } from '../../lib/onboardingTour'
import { DICT_ANALYTICS } from '../../lib/i18nDictionaryAnalytics'
import { ActivityRow } from './crm/activity'
import {
  catTone,
  catIcon,
  formatPrice,
  availKey,
  STOCK_LABEL,
  STOCK_TONE,
  displayCategory,
} from './crm/productFormat'

const FAVICON = '/miprecio-favicon.png'

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

const quickActions = (t: TFn): { icon: IconName; title: string; desc: string }[] => [
  { icon: 'plus', title: t('analytics.newProduct'), desc: t('analytics.addToCatalog') },
  { icon: 'list-plus', title: t('analytics.createList'), desc: t('analytics.selectProducts') },
  { icon: 'user-plus', title: t('analytics.newCustomer'), desc: t('analytics.addContact') },
  { icon: 'qr-code', title: t('analytics.shareQr'), desc: t('analytics.generateAndDownload') },
]

/* ── Screen ──────────────────────────────────────────────────────── */
export function DashboardScreen() {
  const navigate = useNavigate()
  const { locale, t } = useAnalyticsI18n()
  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  const dashboard = useDashboardData(navigate)
  const {
    copied,
    copyUrl,
    goCreateList,
    goProducts,
    goQr,
    lists,
    principalList,
    products,
    publicUrlDisplay,
    qrColor,
    qrList,
    qrUrl,
    search,
    setSearch,
    tenant,
    visits,
  } = dashboard
  const { engagement, listViews, productClicks, qrScans } = dashboard.metrics
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const qrLinkUrl = qrList
    ? `${window.location.origin}/p/${tenant?.subdomain || 'mi-negocio'}/${qrList.slug || qrList.id}`
    : ''
  const openQrModal = () => {
    if (qrList) setQrModalOpen(true)
    else goQr()
  }

  return (
    <CrmLayout
      active={t('analytics.overview')}
      title={t('analytics.workspaceOverview')}
      subtitle={formattedDate}
      hideContext
      searchPlaceholder={t('analytics.searchWorkspace')}
      searchValue={search}
      onSearchChange={setSearch}
      onSearchSubmit={(q) =>
        navigate(
          q.trim()
            ? `/admin/items?q=${encodeURIComponent(q.trim())}`
            : '/admin/items'
        )
      }
    >
      <main className="flex min-h-full flex-col gap-4 px-4 py-6 md:px-10 md:py-8">
        <DashboardTitle t={t} />
        <FirstSteps lists={lists} productCount={products.length} />
        <DashboardHero
          copied={copied}
          goCreateList={goCreateList}
          goQr={openQrModal}
          onCopy={copyUrl}
          principalList={principalList}
          publicUrlDisplay={publicUrlDisplay}
          qrColor={qrColor}
          qrList={qrList}
          qrUrl={qrUrl}
          tenant={tenant}
          visits={visits}
          t={t}
        />
        <DashboardMetrics
          goProducts={goProducts}
          goQr={goQr}
          listViews={listViews}
          productClicks={productClicks}
          qrScans={qrScans}
          visits={visits}
          t={t}
          locale={locale}
        />

        <EngagementChart
          values={{ listViews, productClicks, qrScans, engagement }}
          t={t}
          locale={locale}
        />
      </main>
      {qrModalOpen && qrList && (
        <QrModal
          list={qrList}
          url={qrLinkUrl}
          linkUrl={qrLinkUrl}
          qrValue={qrUrl}
          fg={qrColor}
          logoUrl={tenant?.logoUrl || FAVICON}
          onClose={() => setQrModalOpen(false)}
        />
      )}
    </CrmLayout>
  )
}

function useDashboardData(navigate: ReturnType<typeof useNavigate>) {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const lists = useAppSelector(selectLists)
  const products = useAppSelector(selectProducts)
  const [visits, setVisits] = useState<VisitStats | null>(null)
  const [custStats, setCustStats] = useState<CustomerStats | null>(null)
  const [search, setSearch] = useState('')
  const { copied, copyUrl, qrColor } = usePublicListUrls(tenant)
  useEffect(() => {
    if (tenant?.id) dispatch(fetchLists(tenant.id))
  }, [dispatch, tenant?.id])
  // The first-steps checklist asks "does the catalog have anything in it?",
  // which no list-shaped data can answer before the first list exists.
  useEffect(() => {
    if (tenant?.id) dispatch(fetchProducts(tenant.id))
  }, [dispatch, tenant?.id])
  useEffect(() => {
    if (!tenant?.id) return
    let cancelled = false
    api.getVisitStats(tenant.id).then((res) => {
      if (!cancelled && res.data) setVisits(res.data)
    })
    api.getCustomerStats(tenant.id).then((res) => {
      if (!cancelled && res.data) setCustStats(res.data)
    })
    return () => {
      cancelled = true
    }
  }, [tenant?.id])
  const principalList = useMemo(
    () => lists.find((list) => list.showOnIndex) || null,
    [lists]
  )
  const qrList =
    principalList || lists.find((list) => list.published) || lists[0] || null
  const listPath = principalList
    ? `/p/${tenant?.subdomain || 'mi-negocio'}/${principalList.slug || principalList.id}`
    : ''
  const publicUrlDisplay = principalList ? `miprecio.app${listPath}` : ''
  const qrUrl = qrList
    ? `${window.location.origin}/p/${tenant?.subdomain || 'mi-negocio'}/${qrList.slug || qrList.id}?src=qr`
    : window.location.origin
  const metrics = dashboardMetrics(visits)
  void custStats
  return {
    copied,
    copyUrl: () =>
      copyUrl(principalList ? `${window.location.origin}${listPath}` : ''),
    goCreateList: () => navigate('/admin/lists?new=1'),
    goProducts: () => navigate('/admin/items'),
    goQr: () => navigate('/admin/qr'),
    lists,
    metrics,
    principalList,
    products,
    publicUrlDisplay,
    qrColor,
    qrList,
    qrUrl,
    search,
    setSearch,
    tenant,
    visits,
  }
}

function usePublicListUrls(tenant: Tenant | null) {
  const [qrColor, setQrColor] = useState(DEFAULT_QR_COLOR)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!tenant?.id) return
    const saved = localStorage.getItem(`${QR_COLOR_STORAGE_PREFIX}${tenant.id}`)
    if (saved) setQrColor(saved)
  }, [tenant?.id])
  const copyUrl = (url: string) => {
    if (!url) return
    navigator.clipboard?.writeText(url)
    markQrShared(tenant?.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return { copied, copyUrl, qrColor }
}

function dashboardMetrics(visits: VisitStats | null) {
  const listViews = visits?.total ?? 0
  const productClicks = 0
  const qrScans = visits?.qr.total ?? 0
  return {
    engagement:
      listViews > 0 ? `${((qrScans / listViews) * 100).toFixed(1)}%` : '0.0%',
    listViews,
    productClicks,
    qrScans,
  }
}

function DashboardTitle({ t }: { t: TFn }) {
  return (
    <section className="flex h-[60px] flex-col justify-center gap-1">
      <h2 className="text-[28px] font-bold leading-none text-[#F8F7FF]">
        {t('analytics.overview')}
      </h2>
      <p className="text-[13px] text-[#9694A6]">
        {t('analytics.dashboardSubtitle')}
      </p>
    </section>
  )
}

function DashboardHero({
  copied,
  goCreateList,
  goQr,
  onCopy,
  principalList,
  publicUrlDisplay,
  qrColor,
  qrList,
  qrUrl,
  tenant,
  visits,
  t,
}: {
  copied: boolean
  goCreateList: () => void
  goQr: () => void
  onCopy: () => void
  principalList: PriceList | null
  publicUrlDisplay: string
  qrColor: string
  qrList: PriceList | null
  qrUrl: string
  tenant: Tenant | null
  visits: VisitStats | null
  t: TFn
}) {
  return (
    <section className="flex flex-col gap-4 xl:flex-row">
      <QrHeroCard
        goQr={goQr}
        qrColor={qrColor}
        qrList={qrList}
        qrUrl={qrUrl}
        tenant={tenant}
        t={t}
      />
      {principalList ? (
        <PublicListCard
          urlDisplay={publicUrlDisplay}
          onCopy={onCopy}
          copied={copied}
          visits={visits}
          className="w-full shrink-0 xl:w-[292px]"
        />
      ) : (
        <CreateListCard
          onCreate={goCreateList}
          className="w-full shrink-0 xl:w-[292px]"
        />
      )}
    </section>
  )
}

function QrHeroCard({
  goQr,
  qrColor,
  qrList,
  qrUrl,
  tenant,
  t,
}: {
  goQr: () => void
  qrColor: string
  qrList: PriceList | null
  qrUrl: string
  tenant: Tenant | null
  t: TFn
}) {
  return (
    <div
      className={`flex min-h-[208px] flex-1 flex-col justify-center gap-4 rounded-xl p-5 text-white sm:flex-row sm:items-center sm:justify-between ${gradient}`}
    >
      <div className="flex max-w-[420px] flex-col gap-2">
        <p className="text-[13px] font-semibold text-[#E9D5FF]">
          {t('analytics.shareCatalog')}
        </p>
        <h3 className="text-[26px] font-bold leading-tight">
          {t('analytics.shareCatalogTitle')}
        </h3>
        <p className="text-sm leading-relaxed text-[#E9D5FF]">
          {qrList
            ? t('analytics.qrReady')
            : t('analytics.createQrDescription')}
        </p>
        <button
          type="button"
          onClick={goQr}
          className="btn btn-sm mt-1 flex h-10 w-fit items-center gap-2 rounded-full bg-white px-5 text-[13px] font-bold text-[#7C3AED]"
        >
          <Icon name="qr-code" size={16} />{' '}
          {qrList ? t('analytics.downloadQrCode') : t('analytics.createQr')}
        </button>
      </div>
      <button
        type="button"
        onClick={goQr}
        title={t('analytics.viewQrs')}
        className="flex h-[180px] w-[180px] shrink-0 items-center justify-center self-center rounded-[14px] bg-white p-1"
      >
        <QrCode
          value={qrUrl}
          size={176}
          margin={1}
          fg={qrColor}
          logoUrl={tenant?.logoUrl || FAVICON}
          className="h-full w-full object-contain"
        />
      </button>
    </div>
  )
}

function DashboardMetrics({
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
      <OverviewMetric
        label={t('analytics.listViews')}
        value={listViews.toLocaleString(locale)}
        detail={visits ? t('analytics.todayCount', { count: visits.today.toLocaleString(locale) }) : t('analytics.noData')}
        featured
      />
      <OverviewMetric
        label={t('analytics.productClicks')}
        value={productClicks.toLocaleString(locale)}
        detail={t('analytics.noDataYet')}
        onClick={goProducts}
      />
      <OverviewMetric
        label={t('analytics.qrScans')}
        value={qrScans.toLocaleString(locale)}
        detail={visits ? t('analytics.todayCount', { count: visits.qr.today.toLocaleString(locale) }) : t('analytics.noData')}
        onClick={goQr}
      />
    </section>
  )
}

function OverviewMetric({
  label,
  value,
  detail,
  onClick = () => undefined,
  featured,
}: {
  label: string
  value: string
  detail: string
  onClick?: () => void
  featured?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card dash-card flex min-h-[80px] flex-col justify-center gap-1 rounded-[10px] p-5 text-left ${featured ? 'dash-featured' : ''}`}
    >
      <span className="text-xs font-semibold text-[#9694A6]">{label}</span>
      <span className="text-2xl font-bold leading-none text-[#F8F7FF]">
        {value}
      </span>
      <span className="text-xs text-[#8E8B9C]">{detail}</span>
    </button>
  )
}

function EngagementChart({
  values,
  t,
  locale,
}: {
  values: {
    listViews: number
    productClicks: number
    qrScans: number
    engagement: string
  }
  t: TFn
  locale: string
}) {
  const max = Math.max(
    1,
    values.listViews,
    values.productClicks,
    values.qrScans
  )
  const rows = [
    [t('analytics.listViews'), values.listViews.toLocaleString(locale), values.listViews],
    [
      t('analytics.productClicks'),
      values.productClicks.toLocaleString(locale),
      values.productClicks,
    ],
    [t('analytics.qrScans'), values.qrScans.toLocaleString(locale), values.qrScans],
    [
      t('analytics.scanRate'),
      values.engagement,
      Number.parseFloat(values.engagement) || 0,
    ],
  ] as const
  return (
    <section className="card dash-card flex min-h-[300px] flex-1 flex-col gap-4 rounded-[10px] p-5">
      <div className="flex h-[38px] items-start justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-[#F8F7FF]">
            {t('analytics.engagementOverTime')}
          </h3>
          <p className="text-[13px] text-[#9694A6]">
            {t('analytics.engagementDescription')}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm h-8 rounded-md bg-[#1C1730] px-3 text-xs font-semibold text-[#C4B5FD]"
        >
          {t('analytics.cumulativeData')}
        </button>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 px-0 sm:px-2">
        {rows.map(([label, value, amount]) => (
          <div key={label} className="flex h-9 items-center gap-3">
            <span className="w-[120px] shrink-0 text-[13px] text-[#B7B3C5]">
              {label}
            </span>
            <div className="h-2.5 flex-1 rounded-full bg-[#1C1B2A]">
              <div
                className="h-full rounded-full bg-[#6C43E8]"
                style={{ width: `${Math.min(100, (amount / max) * 100)}%` }}
              />
            </div>
            <span className="w-12 text-right text-[13px] font-semibold text-[#F8F7FF]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Public list URL + today's visits. Shown in the welcome row (full) or inline with the KPIs (compact). */
function PublicListCard({
  urlDisplay,
  onCopy,
  copied,
  visits,
  compact,
  className = '',
}: {
  urlDisplay: string
  onCopy: () => void
  copied: boolean
  visits: VisitStats | null
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={`flex flex-col justify-evenly rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] gap-3 p-5 xl:gap-0 ${className}`}
    >
      {!compact && (
        <p className="text-xl font-extrabold text-[var(--dash-text)]">
          Tu lista pública
        </p>
      )}
      <button
        type="button"
        onClick={onCopy}
        title="Copiar enlace"
        className="flex h-10 items-center gap-2 rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] px-3 text-left text-[var(--dash-link)] hover:opacity-90"
      >
        <Icon name="link-2" size={16} />
        <span className="flex-1 truncate text-sm font-semibold">
          {urlDisplay}
        </span>
        <Icon name={copied ? 'circle-check' : 'copy'} size={16} />
      </button>
      <div className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] px-3 text-[var(--dash-text2)]">
        <Icon name="eye" size={14} className="text-[var(--dash-link)]" />
        <span className="text-[13px] font-bold">Hoy: {visits?.today ?? 0}</span>
      </div>
      <div
        className="flex h-10 w-full items-center gap-2 rounded-[10px] px-3"
        style={tone((visits?.changePct ?? 0) >= 0 ? 'green' : 'red')}
      >
        <Icon
          name="trending-up"
          size={14}
          className={(visits?.changePct ?? 0) < 0 ? 'scale-y-[-1]' : ''}
        />
        <span className="text-[13px] font-bold">
          {(visits?.changePct ?? 0) >= 0 ? '+' : ''}
          {visits?.changePct ?? 0}% vs ayer
        </span>
      </div>
    </div>
  )
}

function CreateListCard({
  onCreate,
  className = '',
}: {
  onCreate: () => void
  className?: string
}) {
  return (
    <div
      className={`flex min-h-[208px] flex-col justify-center gap-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-white ${gradient}`}
        >
          <Icon name="list-plus" size={19} />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-lg font-bold text-[var(--dash-text)]">
            Tu lista pública
          </p>
          <p className="text-[13px] leading-relaxed text-[var(--dash-muted)]">
            Creá una lista principal para compartir tu catálogo.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className={`flex h-10 w-full items-center justify-center gap-2 rounded-[10px] px-4 text-[13px] font-bold text-white ${gradient}`}
      >
        <Icon name="plus" size={16} /> Crear lista
      </button>
    </div>
  )
}

function KpiCard({
  icon,
  iconTone,
  value,
  label,
  tag,
  tagTone,
  note,
  onClick,
  compact,
}: {
  icon: IconName
  iconTone: Tone
  value: string | number
  label: string
  tag: string
  tagTone: Tone
  note: string
  onClick?: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-left hover:bg-[var(--dash-soft)] ${compact ? 'gap-3 px-4 py-3' : 'gap-3.5 px-5 py-[18px]'}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-[14px] ${compact ? 'h-10 w-10' : 'h-12 w-12'}`}
        style={tone(iconTone)}
      >
        <Icon name={icon} size={compact ? 18 : 22} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-end gap-2">
          <span
            className={`font-black leading-none text-[var(--dash-text)] ${compact ? 'text-[22px]' : 'text-[26px]'}`}
          >
            {value}
          </span>
          <span className="truncate pb-0.5 text-xs font-semibold text-[var(--dash-text2)]">
            {label}
          </span>
        </div>
        <div
          className={`flex items-center gap-2 ${compact ? 'mt-1' : 'mt-1.5'}`}
        >
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={tone(tagTone)}
          >
            {tag}
          </span>
          <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">
            {note}
          </span>
        </div>
      </div>
    </button>
  )
}

/** Products KPI split in half: available vs unavailable. */
function ProductsCard({
  total,
  available,
  unavailable,
  onClick,
  compact,
}: {
  total: number
  available: number
  unavailable: number
  onClick?: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-left hover:bg-[var(--dash-soft)] lg:col-span-2 ${compact ? 'gap-3 px-4 py-3' : 'gap-4 px-5 py-[18px]'}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-[14px] ${compact ? 'h-10 w-10' : 'h-12 w-12'}`}
        style={tone('violet')}
      >
        <Icon name="package" size={compact ? 18 : 22} />
      </span>
      <div
        className={`flex min-w-0 flex-1 flex-col ${compact ? 'gap-1.5' : 'gap-2'}`}
      >
        <div className="flex items-end gap-2">
          <span
            className={`font-black leading-none text-[var(--dash-text)] ${compact ? 'text-[22px]' : 'text-[26px]'}`}
          >
            {total}
          </span>
          <span className="truncate pb-0.5 text-xs font-semibold text-[var(--dash-text2)]">
            Productos
          </span>
        </div>
        <div className="flex items-stretch divide-x divide-[var(--dash-border)] overflow-hidden rounded-xl border border-[var(--dash-border)]">
          <div
            className={`flex flex-1 flex-col items-center gap-0.5 ${compact ? 'py-1' : 'py-1.5'}`}
          >
            <span
              className={`font-black leading-none ${compact ? 'text-[17px]' : 'text-[20px]'}`}
              style={{ color: 'var(--tone-green-fg)' }}
            >
              {available}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              Disponibles
            </span>
          </div>
          <div
            className={`flex flex-1 flex-col items-center gap-0.5 ${compact ? 'py-1' : 'py-1.5'}`}
          >
            <span
              className={`font-black leading-none ${compact ? 'text-[17px]' : 'text-[20px]'}`}
              style={{ color: 'var(--tone-red-fg)' }}
            >
              {unavailable}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              No disponibles
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

type Tab = 'all' | 'available' | 'unavailable'

function RecentProducts({
  products,
  total,
  loading,
  search,
  onNew,
  onViewAll,
  compact,
}: {
  products: Product[]
  total: number
  loading: boolean
  search: string
  onNew?: () => void
  onViewAll: () => void
  compact?: boolean
}) {
  const { recent, setTab, tab } = useRecentProducts(products, search)

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] ${compact ? 'gap-3 p-4' : 'gap-4 p-4'}`}
    >
      <RecentProductsHeader compact={compact} onTabChange={setTab} tab={tab} />
      <RecentProductsTable
        compact={compact}
        loading={loading}
        onNew={onNew}
        products={recent}
        total={total}
      />
      <RecentProductsFooter
        count={recent.length}
        onViewAll={onViewAll}
        total={total}
      />
    </div>
  )
}

function useRecentProducts(products: Product[], search: string) {
  const [tab, setTab] = useState<Tab>('all')
  const recent = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matches = products.filter(
      (product) =>
        !query ||
        [product.name, product.sku, product.category].some((value) =>
          value?.toLowerCase().includes(query)
        )
    )
    const sorted = matches.sort(
      (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
    )
    return (
      tab === 'all'
        ? sorted
        : sorted.filter((product) =>
            tab === 'available' ? product.available : !product.available
          )
    ).slice(0, 5)
  }, [products, search, tab])
  return { recent, setTab, tab }
}

const PRODUCT_TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'available', label: 'Disponibles' },
  { key: 'unavailable', label: 'No disponibles' },
]

function RecentProductsHeader({
  compact,
  onTabChange,
  tab,
}: {
  compact?: boolean
  onTabChange: (tab: Tab) => void
  tab: Tab
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h3
          className={`font-extrabold text-[var(--dash-text)] ${compact ? 'text-lg' : 'text-[22px]'}`}
        >
          Productos recientes
        </h3>
        {!compact && (
          <p className="text-xs font-medium text-[var(--dash-muted)]">
            Actualizá precios y disponibilidad al instante.
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {PRODUCT_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            className={`flex h-9 items-center rounded-[10px] px-3.5 text-[13px] font-bold ${tab === key ? `text-white ${gradient}` : 'bg-[var(--dash-soft)] text-[var(--dash-text2)]'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function RecentProductsTable({
  compact,
  loading,
  onNew,
  products,
  total,
}: {
  compact?: boolean
  loading: boolean
  onNew?: () => void
  products: Product[]
  total: number
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--dash-border)]">
      <ProductTableHeader compact={compact} />
      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">
          Cargando…
        </div>
      ) : products.length ? (
        <RecentProductRows compact={compact} products={products} />
      ) : (
        <EmptyRecentProducts onNew={onNew} total={total} />
      )}
    </div>
  )
}

function ProductTableHeader({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 bg-[var(--dash-table-head)] px-[18px] text-[11px] font-bold tracking-wide text-[var(--dash-muted)] ${compact ? 'h-9' : 'h-[42px]'}`}
    >
      <span className="flex-1">PRODUCTO</span>
      {!compact && (
        <>
          <span className="hidden w-[110px] lg:block">SKU</span>
          <span className="hidden w-[130px] lg:block">CATEGORÍA</span>
        </>
      )}
      <span className="w-[70px] sm:w-[90px]">PRECIO</span>
      <span className="w-[90px] text-right sm:w-[110px] sm:text-left">
        DISPONIBLE
      </span>
    </div>
  )
}

function EmptyRecentProducts({
  onNew,
  total,
}: {
  onNew?: () => void
  total: number
}) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm font-semibold text-[var(--dash-text)]">
        {total > 0
          ? 'Sin productos en este filtro'
          : 'Todavía no tenés productos'}
      </p>
      {total === 0 && onNew && (
        <button
          type="button"
          onClick={onNew}
          className={`flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white ${gradient}`}
        >
          <Icon name="plus" size={16} /> Crear el primero
        </button>
      )}
    </div>
  )
}

function RecentProductRows({
  compact,
  products,
}: {
  compact?: boolean
  products: Product[]
}) {
  return (
    <>
      {products.map((product, index) => (
        <RecentProductRow
          key={product.id}
          compact={compact}
          first={index === 0}
          product={product}
        />
      ))}
    </>
  )
}

function RecentProductRow({
  compact,
  first,
  product,
}: {
  compact?: boolean
  first: boolean
  product: Product
}) {
  const status = availKey(product)
  return (
    <div
      className={`flex items-center gap-3 bg-[var(--dash-surface)] px-[18px] ${compact ? 'h-[52px]' : 'h-[68px]'} ${first ? '' : 'border-t border-[var(--dash-divider)]'}`}
    >
      <ProductIdentity compact={compact} product={product} />
      {!compact && (
        <>
          <span className="hidden w-[110px] text-xs font-semibold text-[var(--dash-text2)] lg:block">
            {product.sku || '—'}
          </span>
          <ProductCategory category={product.category} />
        </>
      )}
      <span className="w-[70px] text-[13px] font-bold text-[var(--dash-text)] sm:w-[90px]">
        {formatPrice(product.price)}
      </span>
      <span className="w-[90px] text-right sm:w-[110px] sm:text-left">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={tone(STOCK_TONE[status])}
        >
          {STOCK_LABEL[status]}
        </span>
      </span>
    </div>
  )
}

function ProductIdentity({
  compact,
  product,
}: {
  compact?: boolean
  product: Product
}) {
  return (
    <div className="flex flex-1 items-center gap-3">
      {product.imageUrl ? (
        <img
          src={product.imageThumbUrl || product.imageUrl}
          alt={product.name}
          className="h-9 w-9 shrink-0 rounded-[10px] object-cover"
        />
      ) : (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
          style={tone(catTone(product.category))}
        >
          <Icon name={catIcon(product.category)} />
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">
          {product.name}
        </span>
        {!compact && (
          <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">
            {product.description || '—'}
          </span>
        )}
      </div>
    </div>
  )
}

function ProductCategory({ category }: { category?: string | null }) {
  return (
    <span className="hidden w-[130px] lg:block">
      {category ? (
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={tone(catTone(category))}
        >
          {displayCategory(category)}
        </span>
      ) : (
        <span className="text-[11px] font-medium text-[var(--dash-muted)]">
          —
        </span>
      )}
    </span>
  )
}

function RecentProductsFooter({
  count,
  onViewAll,
  total,
}: {
  count: number
  onViewAll: () => void
  total: number
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-[var(--dash-muted)]">
        Mostrando {count} de {total} productos
      </span>
      <button
        type="button"
        onClick={onViewAll}
        className="flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-bold"
        style={tone('violet')}
      >
        Ver todos <Icon name="chevron-right" size={13} />
      </button>
    </div>
  )
}

function QuickActions({
  onProduct,
  onList,
  onCustomer,
  onQr,
  compact,
}: {
  onProduct: () => void
  onList: () => void
  onCustomer: () => void
  onQr: () => void
  compact?: boolean
}) {
  const { t } = useAnalyticsI18n()
  const handlers = [onProduct, onList, onCustomer, onQr]
  return (
    <div
      className={`flex flex-col rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] ${compact ? 'gap-3 p-4' : 'gap-3.5 p-4'}`}
    >
      <h3
        className={`font-extrabold text-[var(--dash-text)] ${compact ? 'text-lg' : 'text-[22px]'}`}
      >
        Acciones rápidas
      </h3>
      <div
        className={compact ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-3'}
      >
        {quickActions(t).map((a, index) => (
          <button
            key={a.title}
            type="button"
            onClick={handlers[index]}
            className={`rounded-2xl border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] text-left hover:opacity-80 ${compact ? 'flex items-center gap-3 p-2.5' : 'flex flex-col gap-2.5 p-[18px]'}`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white ${gradient}`}
            >
              <Icon name={a.icon} />
            </span>
            <span className="text-[13px] font-bold text-[var(--dash-text)]">
              {a.title}
            </span>
            {!compact && (
              <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                {a.desc}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Most recent items shown on the dashboard; the rest live in Reportes.
const ACTIVITY_PREVIEW = 5

function ActivityFeed({
  tenantId,
  onSeeAll,
}: {
  tenantId?: string
  onSeeAll: () => void
}) {
  const [items, setItems] = useState<Activity[]>([])
  const [loaded, setLoaded] = useState(false)

  // Poll so a teammate's actions appear live (DB is the source of truth → multi-account ready).
  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    const load = () =>
      api.getActivity(tenantId).then((res) => {
        if (!cancelled && res.data) {
          setItems(res.data)
          setLoaded(true)
        }
      })
    load()
    const id = setInterval(load, 7000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [tenantId])

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">
          Actividad reciente
        </h3>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--dash-muted)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />{' '}
          En vivo
        </span>
      </div>
      {loaded && items.length === 0 ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">
          Todavía no hay actividad.
        </p>
      ) : (
        items
          .slice(0, ACTIVITY_PREVIEW)
          .map((a) => <ActivityRow key={a.id} activity={a} />)
      )}
      {items.length > ACTIVITY_PREVIEW && (
        <button
          type="button"
          onClick={onSeeAll}
          className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-[var(--dash-border)] py-2.5 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
        >
          Ver todas <Icon name="chevron-right" size={16} />
        </button>
      )}
    </div>
  )
}

void KpiCard
void ProductsCard
void RecentProducts
void QuickActions
void ActivityFeed

export default DashboardScreen
