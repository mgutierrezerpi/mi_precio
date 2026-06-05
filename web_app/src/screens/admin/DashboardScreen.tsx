import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant, selectCanEdit } from '../../store/slices/authSlice'
import { fetchProducts, selectProducts, selectProductsLoading } from '../../store/slices/productsSlice'
import { fetchLists, selectLists } from '../../store/slices/menuSlice'
import { selectDensity } from '../../store/slices/uiSlice'
import type { Product, CustomerStats, Activity } from '../../types'
import api, { type VisitStats } from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { QrCode } from './crm/QrCode'
import { tone, gradient, type Tone } from './crm/theme'
import { ActivityRow } from './crm/activity'
import { catTone, catIcon, formatPrice, availKey, STOCK_LABEL, STOCK_TONE, displayCategory } from './crm/productFormat'

const FAVICON = '/miprecio-favicon.png'

const quickActions: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'plus', title: 'Nuevo producto', desc: 'Agregalo al catálogo' },
  { icon: 'list-plus', title: 'Crear lista', desc: 'Selecciona productos' },
  { icon: 'user-plus', title: 'Nuevo cliente', desc: 'Agregá un contacto' },
  { icon: 'qr-code', title: 'Compartir QR', desc: 'Generá y descargá' },
]

/* ── Screen ──────────────────────────────────────────────────────── */
export function DashboardScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const products = useAppSelector(selectProducts)
  const loading = useAppSelector(selectProductsLoading)
  const lists = useAppSelector(selectLists)
  const compact = useAppSelector(selectDensity) === 'compact'
  const [visits, setVisits] = useState<VisitStats | null>(null)
  const [custStats, setCustStats] = useState<CustomerStats | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (tenant?.id) {
      dispatch(fetchProducts(tenant.id))
      dispatch(fetchLists(tenant.id))
    }
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
    return () => { cancelled = true }
  }, [tenant?.id])

  const { total, available, unavailable } = useMemo(() => {
    const av = products.filter((p) => p.available).length
    return { total: products.length, available: av, unavailable: products.length - av }
  }, [products])

  const activeLists = useMemo(() => lists.filter((l) => l.published).length, [lists])

  // Public URL points to the list marked as principal (or the first published one).
  const principalList = useMemo(() => lists.find((l) => l.showOnIndex) || lists.find((l) => l.published) || null, [lists])
  const listPath = `/p/${tenant?.subdomain || 'mi-negocio'}${principalList ? `/${principalList.slug || principalList.id}` : ''}`
  const publicUrlDisplay = `miprecio.app${listPath}`
  const publicUrlFull = `${window.location.origin}${listPath}`
  const qrUrl = `${publicUrlFull}?src=qr` // tagged so scans are counted separately from link visits
  const [copied, setCopied] = useState(false)
  const copyUrl = () => { navigator.clipboard?.writeText(publicUrlFull); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  const goProducts = () => navigate('/admin/items')
  const goQr = () => navigate('/admin/qr')
  const goLists = () => navigate('/admin/lists')
  const goClientes = () => navigate('/admin/clientes')

  return (
    <CrmLayout
      active="Inicio"
      title="Inicio"
      subtitle={`Buenos días — ${unavailable > 0 ? `${unavailable} producto${unavailable === 1 ? '' : 's'} no disponible${unavailable === 1 ? '' : 's'}.` : 'tu catálogo está al día.'}`}
      searchPlaceholder="Buscar productos…"
      searchValue={search}
      onSearchChange={setSearch}
      onSearchSubmit={(q) => navigate(q.trim() ? `/admin/items?q=${encodeURIComponent(q.trim())}` : '/admin/items')}
      showDensityToggle
    >
      <div className={`flex min-w-[900px] flex-col ${compact ? 'gap-4 p-5' : 'gap-6 p-8'}`}>
        {/* Welcome row — promo hero + public list. Full view only; in compact the
            public list moves into the KPI row so everything sits on one line. */}
        {!compact && (
          <div className="flex gap-6">
            <div className={`flex flex-1 items-center gap-6 rounded-3xl p-7 text-white shadow-[0_16px_32px_-8px_rgba(124,58,237,0.4)] ${gradient}`}>
              <div className="flex flex-1 flex-col gap-3">
                <p className="text-xs font-bold tracking-[0.2em] text-white/70">NOVEDAD</p>
                <h2 className="text-3xl font-extrabold leading-tight">Compartí tu catálogo en un escaneo.</h2>
                <p className="text-sm font-medium leading-relaxed text-white/80">Generá códigos QR personalizados con tu logo y actualizalos sin reimprimir.</p>
                <button type="button" onClick={goQr} className="mt-1 flex h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#7C3AED] hover:bg-violet-50">
                  <Icon name="qr-code" size={16} /> Crear QR
                </button>
              </div>
              <button type="button" onClick={goQr} title="Ver códigos QR" className="flex h-[140px] w-[140px] shrink-0 items-center justify-center rounded-2xl bg-white p-3.5">
                <QrCode value={qrUrl} size={120} fg="#0F172A" logoUrl={FAVICON} className="h-full w-full object-contain" />
              </button>
            </div>
            <PublicListCard urlDisplay={publicUrlDisplay} onCopy={copyUrl} copied={copied} visits={visits} className="w-[320px] shrink-0" />
          </div>
        )}

        {/* KPI row — in compact the public list card joins this row (grid widens to 6 cols). */}
        <div className={compact ? 'grid grid-cols-6 gap-3' : 'grid grid-cols-4 gap-4'}>
          {compact && <PublicListCard urlDisplay={publicUrlDisplay} onCopy={copyUrl} copied={copied} visits={visits} compact className="col-span-2" />}
          <ProductsCard total={total} available={available} unavailable={unavailable} onClick={goProducts} compact={compact} />
          <KpiCard icon="list-checks" iconTone="violet" value={lists.length} label="Listas" tag={`${activeLists} activas`} tagTone="green" note="Compartibles por link y QR" onClick={goLists} compact={compact} />
          <KpiCard icon="users" iconTone="violet" value={custStats?.total ?? 0} label="Clientes" tag={`${custStats?.active ?? 0} activos`} tagTone="green" note="En tu cartera" onClick={goClientes} compact={compact} />
        </div>

        {/* Bottom row */}
        <div className={`flex ${compact ? 'gap-4' : 'gap-5'}`}>
          <RecentProducts products={products} total={total} loading={loading} search={search} onNew={canEdit ? () => navigate('/admin/items?new=1') : undefined} onViewAll={goProducts} compact={compact} />
          <div className={`flex w-[380px] shrink-0 flex-col ${compact ? 'gap-4' : 'gap-5'}`}>
            {canEdit && (
              <QuickActions
                onProduct={() => navigate('/admin/items?new=1')}
                onList={() => navigate('/admin/lists?new=1')}
                onCustomer={() => navigate('/admin/clientes?new=1')}
                onQr={goQr}
                compact={compact}
              />
            )}
            {!compact && <ActivityFeed tenantId={tenant?.id} onSeeAll={() => navigate('/admin/reportes')} />}
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}

/** Public list URL + today's visits. Shown in the welcome row (full) or inline with the KPIs (compact). */
function PublicListCard({ urlDisplay, onCopy, copied, visits, compact, className = '' }: { urlDisplay: string; onCopy: () => void; copied: boolean; visits: VisitStats | null; compact?: boolean; className?: string }) {
  return (
    <div className={`flex flex-col rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[0_10px_24px_-8px_rgba(30,27,75,0.08)] ${compact ? 'gap-2.5 p-4' : 'gap-3.5 p-6'} ${className}`}>
      {!compact && <p className="text-lg font-extrabold text-[var(--dash-text)]">Tu lista pública</p>}
      <button type="button" onClick={onCopy} title="Copiar enlace" className={`flex items-center gap-2.5 rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] px-3 text-left text-[var(--dash-link)] hover:opacity-90 ${compact ? 'h-9' : 'h-[42px]'}`}>
        <Icon name="link-2" size={16} />
        <span className="flex-1 truncate text-[13px] font-semibold">{urlDisplay}</span>
        <Icon name={copied ? 'circle-check' : 'copy'} size={16} />
      </button>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] px-3 py-2 text-[var(--dash-text2)]">
          <Icon name="eye" size={14} className="text-[var(--dash-link)]" />
          <span className="text-xs font-bold">Hoy: {visits?.today ?? 0}</span>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-[10px] px-3 py-2" style={tone((visits?.changePct ?? 0) >= 0 ? 'green' : 'red')}>
          <Icon name="trending-up" size={14} className={(visits?.changePct ?? 0) < 0 ? 'scale-y-[-1]' : ''} />
          <span className="text-xs font-bold">{(visits?.changePct ?? 0) >= 0 ? '+' : ''}{visits?.changePct ?? 0}% vs ayer</span>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, iconTone, value, label, tag, tagTone, note, onClick, compact }: { icon: IconName; iconTone: Tone; value: string | number; label: string; tag: string; tagTone: Tone; note: string; onClick?: () => void; compact?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center rounded-[18px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-left shadow-[0_12px_30px_-12px_rgba(30,27,75,0.1)] hover:bg-[var(--dash-soft)] ${compact ? 'gap-3 px-4 py-3' : 'gap-3.5 px-5 py-[18px]'}`}>
      <span className={`flex shrink-0 items-center justify-center rounded-[14px] ${compact ? 'h-10 w-10' : 'h-12 w-12'}`} style={tone(iconTone)}>
        <Icon name={icon} size={compact ? 18 : 22} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-end gap-2">
          <span className={`font-black leading-none text-[var(--dash-text)] ${compact ? 'text-[22px]' : 'text-[26px]'}`}>{value}</span>
          <span className="truncate pb-0.5 text-xs font-semibold text-[var(--dash-text2)]">{label}</span>
        </div>
        <div className={`flex items-center gap-2 ${compact ? 'mt-1' : 'mt-1.5'}`}>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={tone(tagTone)}>{tag}</span>
          <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">{note}</span>
        </div>
      </div>
    </button>
  )
}

/** Products KPI split in half: available vs unavailable. */
function ProductsCard({ total, available, unavailable, onClick, compact }: { total: number; available: number; unavailable: number; onClick?: () => void; compact?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`col-span-2 flex items-center rounded-[18px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-left shadow-[0_12px_30px_-12px_rgba(30,27,75,0.1)] hover:bg-[var(--dash-soft)] ${compact ? 'gap-3 px-4 py-3' : 'gap-4 px-5 py-[18px]'}`}>
      <span className={`flex shrink-0 items-center justify-center rounded-[14px] ${compact ? 'h-10 w-10' : 'h-12 w-12'}`} style={tone('violet')}>
        <Icon name="package" size={compact ? 18 : 22} />
      </span>
      <div className={`flex min-w-0 flex-1 flex-col ${compact ? 'gap-1.5' : 'gap-2'}`}>
        <div className="flex items-end gap-2">
          <span className={`font-black leading-none text-[var(--dash-text)] ${compact ? 'text-[22px]' : 'text-[26px]'}`}>{total}</span>
          <span className="truncate pb-0.5 text-xs font-semibold text-[var(--dash-text2)]">Productos</span>
        </div>
        <div className="flex items-stretch divide-x divide-[var(--dash-border)] overflow-hidden rounded-xl border border-[var(--dash-border)]">
          <div className={`flex flex-1 flex-col items-center gap-0.5 ${compact ? 'py-1' : 'py-1.5'}`}>
            <span className={`font-black leading-none ${compact ? 'text-[17px]' : 'text-[20px]'}`} style={{ color: 'var(--tone-green-fg)' }}>{available}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">Disponibles</span>
          </div>
          <div className={`flex flex-1 flex-col items-center gap-0.5 ${compact ? 'py-1' : 'py-1.5'}`}>
            <span className={`font-black leading-none ${compact ? 'text-[17px]' : 'text-[20px]'}`} style={{ color: 'var(--tone-red-fg)' }}>{unavailable}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">No disponibles</span>
          </div>
        </div>
      </div>
    </button>
  )
}

type Tab = 'all' | 'available' | 'unavailable'

function RecentProducts({ products, total, loading, search, onNew, onViewAll, compact }: { products: Product[]; total: number; loading: boolean; search: string; onNew?: () => void; onViewAll: () => void; compact?: boolean }) {
  const [tab, setTab] = useState<Tab>('all')
  const recent = useMemo(() => {
    const q = search.trim().toLowerCase()
    const sorted = [...products]
      .filter((p) => !q || [p.name, p.sku, p.category].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    const filtered = tab === 'all' ? sorted : sorted.filter((p) => (tab === 'available' ? p.available : !p.available))
    return filtered.slice(0, 5)
  }, [products, tab, search])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'available', label: 'Disponibles' },
    { key: 'unavailable', label: 'No disponibles' },
  ]

  return (
    <div className={`flex flex-1 flex-col rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[0_10px_24px_-8px_rgba(30,27,75,0.08)] ${compact ? 'gap-3 p-4' : 'gap-[18px] p-6'}`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className={`font-extrabold text-[var(--dash-text)] ${compact ? 'text-lg' : 'text-[22px]'}`}>Productos recientes</h3>
          {!compact && <p className="text-xs font-medium text-[var(--dash-muted)]">Actualizá precios y disponibilidad al instante.</p>}
        </div>
        <div className="flex items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex h-9 items-center rounded-[10px] px-3.5 text-[13px] font-bold ${tab === t.key ? `text-white ${gradient}` : 'bg-[var(--dash-soft)] text-[var(--dash-text2)]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--dash-border)]">
        <div className={`flex items-center gap-3 bg-[var(--dash-table-head)] px-[18px] text-[11px] font-bold tracking-wide text-[var(--dash-muted)] ${compact ? 'h-9' : 'h-[42px]'}`}>
          <span className="flex-1">PRODUCTO</span>
          {!compact && <span className="w-[110px]">SKU</span>}
          {!compact && <span className="w-[130px]">CATEGORÍA</span>}
          <span className="w-[90px]">PRECIO</span>
          <span className="w-[110px]">DISPONIBLE</span>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">Cargando…</div>
        ) : recent.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm font-semibold text-[var(--dash-text)]">{total > 0 ? 'Sin productos en este filtro' : 'Todavía no tenés productos'}</p>
            {total === 0 && onNew && (
              <button type="button" onClick={onNew} className={`flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white ${gradient}`}>
                <Icon name="plus" size={16} /> Crear el primero
              </button>
            )}
          </div>
        ) : (
          recent.map((p, i) => {
            const st = availKey(p)
            return (
              <div key={p.id} className={`flex items-center gap-3 bg-[var(--dash-surface)] px-[18px] ${compact ? 'h-[52px]' : 'h-[68px]'} ${i > 0 ? 'border-t border-[var(--dash-divider)]' : ''}`}>
                <div className="flex flex-1 items-center gap-3">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="h-9 w-9 shrink-0 rounded-[10px] object-cover" />
                    : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={tone(catTone(p.category))}><Icon name={catIcon(p.category)} /></span>}
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{p.name}</span>
                    {!compact && <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">{p.description || '—'}</span>}
                  </div>
                </div>
                {!compact && <span className="w-[110px] text-xs font-semibold text-[var(--dash-text2)]">{p.sku || '—'}</span>}
                {!compact && (
                  <span className="w-[130px]">
                    {p.category
                      ? <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(catTone(p.category))}>{displayCategory(p.category)}</span>
                      : <span className="text-[11px] font-medium text-[var(--dash-muted)]">—</span>}
                  </span>
                )}
                <span className="w-[90px] text-[13px] font-bold text-[var(--dash-text)]">{formatPrice(p.price)}</span>
                <span className="w-[110px]">
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(STOCK_TONE[st])}>{STOCK_LABEL[st]}</span>
                </span>
              </div>
            )
          })
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--dash-muted)]">Mostrando {recent.length} de {total} productos</span>
        <button type="button" onClick={onViewAll} className="flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-bold" style={tone('violet')}>
          Ver todos <Icon name="chevron-right" size={13} />
        </button>
      </div>
    </div>
  )
}

function QuickActions({ onProduct, onList, onCustomer, onQr, compact }: { onProduct: () => void; onList: () => void; onCustomer: () => void; onQr: () => void; compact?: boolean }) {
  const handlers: Record<string, () => void> = {
    'Nuevo producto': onProduct,
    'Crear lista': onList,
    'Nuevo cliente': onCustomer,
    'Compartir QR': onQr,
  }
  return (
    <div className={`flex flex-col rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[0_10px_24px_-8px_rgba(30,27,75,0.08)] ${compact ? 'gap-3 p-4' : 'gap-3.5 p-[22px]'}`}>
      <h3 className={`font-extrabold text-[var(--dash-text)] ${compact ? 'text-lg' : 'text-[22px]'}`}>Acciones rápidas</h3>
      <div className={compact ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-3'}>
        {quickActions.map((a) => (
          <button
            key={a.title}
            type="button"
            onClick={handlers[a.title]}
            className={`rounded-2xl border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] text-left hover:opacity-80 ${compact ? 'flex items-center gap-3 p-2.5' : 'flex flex-col gap-2.5 p-[18px]'}`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white ${gradient}`}><Icon name={a.icon} /></span>
            <span className="text-[13px] font-bold text-[var(--dash-text)]">{a.title}</span>
            {!compact && <span className="text-[11px] font-medium text-[var(--dash-muted)]">{a.desc}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

// Most recent items shown on the dashboard; the rest live in Reportes.
const ACTIVITY_PREVIEW = 5

function ActivityFeed({ tenantId, onSeeAll }: { tenantId?: string; onSeeAll: () => void }) {
  const [items, setItems] = useState<Activity[]>([])
  const [loaded, setLoaded] = useState(false)

  // Poll so a teammate's actions appear live (DB is the source of truth → multi-account ready).
  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    const load = () => api.getActivity(tenantId).then((res) => {
      if (!cancelled && res.data) { setItems(res.data); setLoaded(true) }
    })
    load()
    const id = setInterval(load, 7000)
    return () => { cancelled = true; clearInterval(id) }
  }, [tenantId])

  return (
    <div className="flex flex-col gap-3.5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-[22px] shadow-[0_10px_24px_-8px_rgba(30,27,75,0.08)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">Actividad reciente</h3>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--dash-muted)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" /> En vivo
        </span>
      </div>
      {loaded && items.length === 0 ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">Todavía no hay actividad.</p>
      ) : (
        items.slice(0, ACTIVITY_PREVIEW).map((a) => <ActivityRow key={a.id} activity={a} />)
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

export default DashboardScreen
