import { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import type { Activity } from '../../types'
import api, { type ReportData } from '../../services/api'
import { formatPrice } from './crm/productFormat'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { ActivityRow } from './crm/activity'
import { tone, gradient, type Tone } from './crm/theme'

const RANGES: { days: number; label: string }[] = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
]

const fmtInt = (n: number) => new Intl.NumberFormat('es-AR').format(n)

// Short axis label for a YYYY-MM-DD bucket, e.g. "5 jun".
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
function dayLabel(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]}`
}

const CHANNEL_META: { key: 'link' | 'qr'; name: string; color: string }[] = [
  { key: 'link', name: 'Link directo', color: '#7C3AED' },
  { key: 'qr', name: 'Código QR', color: '#0EA5E9' },
]
const PRODUCT_TONES: Tone[] = ['violet', 'sky', 'rose', 'amber', 'purple']

export function ReportsScreen() {
  const tenant = useAppSelector(selectTenant)
  const [days, setDays] = useState(30)
  const [data, setData] = useState<ReportData | null>(null)

  useEffect(() => {
    if (!tenant?.id) return
    let cancelled = false
    api.getReports(tenant.id, days).then((res) => {
      if (!cancelled && res.data) setData(res.data)
    })
    return () => { cancelled = true }
  }, [tenant?.id, days])

  // Derived: we're loading until the data we hold matches the requested range
  // (avoids a synchronous setState in the effect, and shows the spinner on range switch).
  const loading = data?.days !== days

  const kpis = useMemo(() => {
    const k = data?.kpis
    return [
      { icon: 'eye' as IconName, iconTone: 'violet' as Tone, value: fmtInt(k?.visits ?? 0), label: 'Visitas', note: 'Total acumulado' },
      { icon: 'qr-code' as IconName, iconTone: 'sky' as Tone, value: fmtInt(k?.qrScans ?? 0), label: 'Escaneos QR', note: 'Total acumulado' },
      { icon: 'users' as IconName, iconTone: 'green' as Tone, value: fmtInt(k?.customers ?? 0), label: 'Clientes', note: 'En tu cartera' },
      { icon: 'trending-up' as IconName, iconTone: 'rose' as Tone, value: k ? formatPrice(k.revenue) : '$ 0', label: 'Ingresos', note: 'Ventas cobradas' },
    ]
  }, [data])

  const periodVisits = useMemo(
    () => (data?.series ?? []).reduce((acc, d) => acc + d.link + d.qr, 0),
    [data],
  )

  return (
    <CrmLayout active="Reportes" title="Reportes" subtitle="Medí el rendimiento de tu catálogo." searchPlaceholder="Buscar…">
      <div className="flex flex-col gap-5 p-4 md:p-8 lg:min-w-[980px]">
        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="flex items-center gap-3.5 rounded-[18px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-[18px] shadow-[0_12px_30px_-12px_rgba(30,27,75,0.1)]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]" style={tone(k.iconTone)}><Icon name={k.icon} size={22} /></span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-end gap-2"><span className="truncate text-[22px] font-black leading-none text-[var(--dash-text)]">{k.value}</span><span className="truncate pb-0.5 text-xs font-semibold text-[var(--dash-text2)]">{k.label}</span></div>
                <span className="mt-1 truncate text-[11px] font-medium text-[var(--dash-muted)]">{k.note}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Bar chart */}
          <div className="flex flex-1 flex-col gap-5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] font-extrabold text-[var(--dash-text)]">Visitas y escaneos · Últimos {days} días</h3>
                <p className="text-xs font-medium text-[var(--dash-muted)]">{fmtInt(periodVisits)} aperturas de tus listas públicas en el período.</p>
              </div>
              <div className="flex w-full items-center gap-1.5 rounded-xl bg-[var(--dash-soft)] p-1 sm:w-auto sm:shrink-0">
                {RANGES.map((r) => (
                  <button
                    key={r.days}
                    type="button"
                    onClick={() => setDays(r.days)}
                    className={`flex h-8 flex-1 items-center justify-center rounded-lg px-3 text-xs font-bold sm:flex-none ${days === r.days ? `text-white ${gradient}` : 'text-[var(--dash-text2)]'}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <VisitChart data={data} loading={loading} />

            <div className="flex items-center gap-5 text-[11px] font-semibold text-[var(--dash-text2)]">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#7C3AED]" /> Link directo</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" /> Código QR</span>
            </div>
          </div>

          {/* Right column */}
          <div className="flex w-full shrink-0 flex-col gap-5 lg:w-[320px]">
            <TopProducts data={data} loading={loading} />
            <Channels data={data} loading={loading} />
          </div>
        </div>

        <ActivityLog tenantId={tenant?.id} />
      </div>
    </CrmLayout>
  )
}

/** Full activity feed for the tenant, in a fixed-height scrollable panel. */
function ActivityLog({ tenantId }: { tenantId?: string }) {
  const [items, setItems] = useState<Activity[]>([])
  const [loaded, setLoaded] = useState(false)

  // Poll so a teammate's actions appear live, same cadence as the dashboard feed.
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
    <div className="flex flex-col gap-4 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-extrabold text-[var(--dash-text)]">Actividad reciente</h3>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--dash-muted)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" /> En vivo
        </span>
      </div>
      {loaded && items.length === 0 ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">Todavía no hay actividad.</p>
      ) : (
        <div className="flex max-h-80 flex-col gap-3.5 overflow-y-auto pr-1">
          {items.map((a) => <ActivityRow key={a.id} activity={a} />)}
        </div>
      )}
    </div>
  )
}

/** Stacked daily bars (link + qr), heights relative to the busiest day. */
function VisitChart({ data, loading }: { data: ReportData | null; loading: boolean }) {
  const series = data?.series ?? []
  const max = Math.max(1, ...series.map((d) => d.link + d.qr))
  const hasData = series.some((d) => d.link + d.qr > 0)
  // With long ranges, only label a handful of evenly spaced days to avoid clutter.
  const labelEvery = Math.ceil(series.length / 8)

  if (loading) {
    return <div className="flex h-56 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">Cargando…</div>
  }
  if (!hasData) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={tone('violet')}><Icon name="bar-chart" size={22} /></span>
        <p className="text-sm font-semibold text-[var(--dash-text)]">Todavía no hay visitas en este período</p>
        <p className="text-xs font-medium text-[var(--dash-muted)]">Compartí tu lista por link o QR para empezar a medir.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-56 items-end gap-1">
        {series.map((d) => {
          const total = d.link + d.qr
          const h = (total / max) * 100
          return (
            <div key={d.date} className="group relative flex flex-1 items-end" style={{ height: '100%' }} title={`${dayLabel(d.date)}: ${total} (link ${d.link} · qr ${d.qr})`}>
              <div className="flex w-full flex-col justify-end overflow-hidden rounded-t-md" style={{ height: `${h}%` }}>
                {d.qr > 0 && <div className="w-full bg-[#0EA5E9]" style={{ height: `${(d.qr / total) * 100}%` }} />}
                {d.link > 0 && <div className="w-full bg-[#7C3AED]" style={{ height: `${(d.link / total) * 100}%` }} />}
              </div>
              {total === 0 && <div className="w-full rounded-t-md bg-[var(--dash-soft)]" style={{ height: '4%' }} />}
              <span className="pointer-events-none absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--dash-text)] px-2 py-1 text-[10px] font-bold text-[var(--dash-surface)] opacity-0 group-hover:opacity-100">{total}</span>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1">
        {series.map((d, i) => (
          <span key={d.date} className="flex-1 truncate text-center text-[9px] font-medium text-[var(--dash-muted)]">
            {i % labelEvery === 0 ? dayLabel(d.date) : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Best-selling products from paid orders. */
function TopProducts({ data, loading }: { data: ReportData | null; loading: boolean }) {
  const items = data?.topProducts ?? []
  const max = Math.max(1, ...items.map((p) => p.units))

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
      <h3 className="text-[16px] font-extrabold text-[var(--dash-text)]">Productos más vendidos</h3>
      {loading ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">Todavía no registraste ventas.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((p, i) => (
            <div key={p.name} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate font-semibold text-[var(--dash-text2)]">{p.name}</span>
                <span className="shrink-0 font-bold text-[var(--dash-muted)]">{fmtInt(p.units)} u · {formatPrice(p.revenue)}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--dash-soft)]"><div className="h-full rounded-full" style={{ width: `${(p.units / max) * 100}%`, backgroundColor: `var(--tone-${PRODUCT_TONES[i % PRODUCT_TONES.length]}-fg)` }} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** QR vs link traffic split over the selected period. */
function Channels({ data, loading }: { data: ReportData | null; loading: boolean }) {
  const channels = data?.channels ?? { link: 0, qr: 0 }
  const total = channels.link + channels.qr
  const rows = CHANNEL_META.map((c) => ({ ...c, count: channels[c.key], pct: total ? Math.round((channels[c.key] / total) * 100) : 0 }))

  const gradientCss = useMemo(() => {
    if (!total) return 'var(--dash-soft)'
    let acc = 0
    const stops = rows.map((c) => { const from = acc; acc += (c.count / total) * 100; return `${c.color} ${from}% ${acc}%` })
    return `conic-gradient(${stops.join(', ')})`
  }, [rows, total])

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
      <h3 className="text-[16px] font-extrabold text-[var(--dash-text)]">Por canal</h3>
      {loading ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">Cargando…</p>
      ) : total === 0 ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">Sin tráfico en este período.</p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: gradientCss }}>
            <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-[var(--dash-surface)]">
              <span className="text-[18px] font-black leading-none text-[var(--dash-text)]">{fmtInt(total)}</span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">visitas</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {rows.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-[12px]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="flex-1 font-semibold text-[var(--dash-text2)]">{c.name}</span>
                <span className="font-bold text-[var(--dash-muted)]">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsScreen
