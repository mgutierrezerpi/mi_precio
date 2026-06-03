import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import { fetchProducts, selectProducts, selectProductsLoading } from '../../store/slices/productsSlice'
import { fetchLists, selectLists } from '../../store/slices/menuSlice'
import type { Product } from '../../types'
import api, { type VisitStats } from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { QrCode } from './crm/QrCode'
import { tone, gradient, type Tone } from './crm/theme'
import { catTone, catIcon, formatPrice, availKey, STOCK_LABEL, STOCK_TONE, displayCategory } from './crm/productFormat'

const FAVICON = '/miprecio-favicon.png'

const quickActions: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'plus', title: 'Nuevo producto', desc: 'Agregalo al catálogo' },
  { icon: 'list-plus', title: 'Crear lista', desc: 'Selecciona productos' },
  { icon: 'file-spreadsheet', title: 'Importar Excel', desc: 'Cargá un .xlsx' },
  { icon: 'qr-code', title: 'Compartir QR', desc: 'Generá y descargá' },
]

const activity: { icon: IconName; tone: Tone; text: string; time: string }[] = [
  { icon: 'alert-triangle', tone: 'amber', text: '‘Pintura látex 4L’ entró en bajo stock', time: 'hace 12 min' },
  { icon: 'share-2', tone: 'violet', text: 'María compartió la lista Mayoristas', time: 'hace 1 h' },
  { icon: 'user-plus', tone: 'blue', text: 'Nuevo cliente: Distrimax', time: 'hace 2 h' },
  { icon: 'upload', tone: 'green', text: '24 productos importados desde Excel', time: 'hace 3 h' },
]

/* ── Screen ──────────────────────────────────────────────────────── */
export function DashboardScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const tenant = useAppSelector(selectTenant)
  const products = useAppSelector(selectProducts)
  const loading = useAppSelector(selectProductsLoading)
  const lists = useAppSelector(selectLists)
  const [visits, setVisits] = useState<VisitStats | null>(null)
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

  const qrStats = visits?.qr
  const scans = qrStats?.total ?? 0
  const scanPct = qrStats?.changePct ?? 0
  const kpis: { icon: IconName; iconTone: Tone; value: string | number; label: string; tag: string; tagTone: Tone; note: string }[] = [
    { icon: 'package', iconTone: 'violet', value: total, label: 'Productos', tag: `${available} disp.`, tagTone: 'green', note: 'En tu catálogo' },
    { icon: 'list-checks', iconTone: 'violet', value: lists.length, label: 'Listas', tag: `${activeLists} activas`, tagTone: 'green', note: 'Compartibles por link y QR' },
    { icon: 'qr-code', iconTone: 'sky', value: new Intl.NumberFormat('es-AR').format(scans), label: 'Escaneos QR', tag: `${scanPct >= 0 ? '+' : ''}${scanPct}%`, tagTone: scanPct >= 0 ? 'green' : 'red', note: `${qrStats?.today ?? 0} hoy · ${qrStats?.yesterday ?? 0} ayer` },
    { icon: 'circle-x', iconTone: 'red', value: unavailable, label: 'No disponibles', tag: 'Revisar', tagTone: 'red', note: 'Ocultos en tus listas' },
  ]

  return (
    <CrmLayout
      active="Inicio"
      title="Inicio"
      subtitle={`Buenos días — ${unavailable > 0 ? `${unavailable} producto${unavailable === 1 ? '' : 's'} no disponible${unavailable === 1 ? '' : 's'}.` : 'tu catálogo está al día.'}`}
      searchPlaceholder="Buscar productos…"
      searchValue={search}
      onSearchChange={setSearch}
      onSearchSubmit={(q) => navigate(q.trim() ? `/admin/items?q=${encodeURIComponent(q.trim())}` : '/admin/items')}
    >
      <div className="flex min-w-[900px] flex-col gap-6 p-8">
        {/* Welcome row */}
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

          <div className="flex w-[320px] shrink-0 flex-col gap-3.5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_10px_24px_-8px_rgba(30,27,75,0.08)]">
            <p className="text-lg font-extrabold text-[var(--dash-text)]">Tu lista pública</p>
            <button type="button" onClick={copyUrl} title="Copiar enlace" className="flex h-[42px] items-center gap-2.5 rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] px-3 text-left text-[var(--dash-link)] hover:opacity-90">
              <Icon name="link-2" size={16} />
              <span className="flex-1 truncate text-[13px] font-semibold">{publicUrlDisplay}</span>
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
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="flex items-center gap-3.5 rounded-[18px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-[18px] shadow-[0_12px_30px_-12px_rgba(30,27,75,0.1)]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]" style={tone(k.iconTone)}>
                <Icon name={k.icon} size={22} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-end gap-2">
                  <span className="text-[26px] font-black leading-none text-[var(--dash-text)]">{k.value}</span>
                  <span className="truncate pb-0.5 text-xs font-semibold text-[var(--dash-text2)]">{k.label}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={tone(k.tagTone)}>{k.tag}</span>
                  <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">{k.note}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex gap-5">
          <RecentProducts products={products} total={total} loading={loading} search={search} onNew={goProducts} onViewAll={goProducts} />
          <div className="flex w-[380px] shrink-0 flex-col gap-5">
            <QuickActions onNew={goProducts} onCreateList={() => navigate('/admin/lists')} onQr={goQr} />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}

type Tab = 'all' | 'available' | 'unavailable'

function RecentProducts({ products, total, loading, search, onNew, onViewAll }: { products: Product[]; total: number; loading: boolean; search: string; onNew: () => void; onViewAll: () => void }) {
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
    <div className="flex flex-1 flex-col gap-[18px] rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_10px_24px_-8px_rgba(30,27,75,0.08)]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">Productos recientes</h3>
          <p className="text-xs font-medium text-[var(--dash-muted)]">Actualizá precios y disponibilidad al instante.</p>
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
        <div className="flex h-[42px] items-center gap-3 bg-[var(--dash-table-head)] px-[18px] text-[11px] font-bold tracking-wide text-[var(--dash-muted)]">
          <span className="flex-1">PRODUCTO</span>
          <span className="w-[110px]">SKU</span>
          <span className="w-[130px]">CATEGORÍA</span>
          <span className="w-[90px]">PRECIO</span>
          <span className="w-[110px]">DISPONIBLE</span>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">Cargando…</div>
        ) : recent.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm font-semibold text-[var(--dash-text)]">{total > 0 ? 'Sin productos en este filtro' : 'Todavía no tenés productos'}</p>
            {total === 0 && (
              <button type="button" onClick={onNew} className={`flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white ${gradient}`}>
                <Icon name="plus" size={16} /> Crear el primero
              </button>
            )}
          </div>
        ) : (
          recent.map((p, i) => {
            const st = availKey(p)
            return (
              <div key={p.id} className={`flex h-[68px] items-center gap-3 bg-[var(--dash-surface)] px-[18px] ${i > 0 ? 'border-t border-[var(--dash-divider)]' : ''}`}>
                <div className="flex flex-1 items-center gap-3">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="h-9 w-9 shrink-0 rounded-[10px] object-cover" />
                    : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={tone(catTone(p.category))}><Icon name={catIcon(p.category)} /></span>}
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{p.name}</span>
                    <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">{p.description || '—'}</span>
                  </div>
                </div>
                <span className="w-[110px] text-xs font-semibold text-[var(--dash-text2)]">{p.sku || '—'}</span>
                <span className="w-[130px]">
                  {p.category
                    ? <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(catTone(p.category))}>{displayCategory(p.category)}</span>
                    : <span className="text-[11px] font-medium text-[var(--dash-muted)]">—</span>}
                </span>
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

function QuickActions({ onNew, onCreateList, onQr }: { onNew: () => void; onCreateList: () => void; onQr: () => void }) {
  const handlers: Record<string, () => void> = {
    'Nuevo producto': onNew,
    'Crear lista': onCreateList,
    'Compartir QR': onQr,
  }
  return (
    <div className="flex flex-col gap-3.5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-[22px] shadow-[0_10px_24px_-8px_rgba(30,27,75,0.08)]">
      <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">Acciones rápidas</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((a) => (
          <button key={a.title} type="button" onClick={handlers[a.title]} className="flex flex-col gap-2.5 rounded-2xl border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] p-[18px] text-left hover:opacity-80">
            <span className={`flex h-9 w-9 items-center justify-center rounded-[10px] text-white ${gradient}`}><Icon name={a.icon} /></span>
            <span className="text-[13px] font-bold text-[var(--dash-text)]">{a.title}</span>
            <span className="text-[11px] font-medium text-[var(--dash-muted)]">{a.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ActivityFeed() {
  return (
    <div className="flex flex-col gap-3.5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-[22px] shadow-[0_10px_24px_-8px_rgba(30,27,75,0.08)]">
      <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">Actividad reciente</h3>
      {activity.map((a, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={tone(a.tone)}><Icon name={a.icon} /></span>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-[var(--dash-text)]">{a.text}</span>
            <span className="text-[11px] font-medium text-[var(--dash-muted)]">{a.time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardScreen
