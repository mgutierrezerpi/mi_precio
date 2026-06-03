import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { tone, type Tone } from './crm/theme'

const kpis: { icon: IconName; iconTone: Tone; value: string; label: string; note: string }[] = [
  { icon: 'eye', iconTone: 'violet', value: '12.480', label: 'Visitas', note: 'Últimos 30 días' },
  { icon: 'qr-code', iconTone: 'sky', value: '3.860', label: 'Escaneos QR', note: 'Últimos 30 días' },
  { icon: 'users', iconTone: 'green', value: '248', label: 'Clientes', note: 'Total' },
  { icon: 'trending-up', iconTone: 'rose', value: 'Tornillo 8mm', label: 'Más visto', note: 'Top del mes' },
]

// Deterministic 14-day series.
const bars = Array.from({ length: 14 }, (_, i) => 30 + ((i * 37 + 17) % 70))

const topProducts: { name: string; views: number; pct: number; t: Tone }[] = [
  { name: 'Tornillo hex. 8mm', views: 482, pct: 100, t: 'violet' },
  { name: 'Cable eléctrico 2.5', views: 344, pct: 71, t: 'sky' },
  { name: 'Pintura látex 4L', views: 298, pct: 62, t: 'rose' },
  { name: 'Cemento 50kg', views: 251, pct: 52, t: 'amber' },
  { name: 'Llave inglesa 12"', views: 188, pct: 39, t: 'purple' },
]

const channels: { name: string; pct: number; color: string }[] = [
  { name: 'Link directo', pct: 52, color: '#7C3AED' },
  { name: 'Código QR', pct: 26, color: '#0EA5E9' },
  { name: 'WhatsApp', pct: 15, color: '#10B981' },
  { name: 'Email', pct: 7, color: '#F59E0B' },
]

function donutGradient() {
  let acc = 0
  const stops = channels.map((c) => { const from = acc; acc += c.pct; return `${c.color} ${from}% ${acc}%` })
  return `conic-gradient(${stops.join(', ')})`
}

export function ReportsScreen() {
  return (
    <CrmLayout active="Reportes" title="Reportes" subtitle="Medí el rendimiento de tu catálogo." searchPlaceholder="Buscar…">
      <div className="flex min-w-[980px] flex-col gap-5 p-8">
        <div className="grid grid-cols-4 gap-4">
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

        <div className="flex gap-5">
          {/* Bar chart */}
          <div className="flex flex-1 flex-col gap-5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
            <div className="flex flex-col gap-1">
              <h3 className="text-[18px] font-extrabold text-[var(--dash-text)]">Visitas y escaneos · Últimos 30 días</h3>
              <p className="text-xs font-medium text-[var(--dash-muted)]">Tendencia de aperturas de tus listas públicas.</p>
            </div>
            <div className="flex h-56 items-end gap-2">
              {bars.map((h, i) => (
                <div key={i} className="flex flex-1 items-end justify-center rounded-t-md bg-gradient-to-t from-[#7C3AED] to-[#A855F7]" style={{ height: `${h}%`, opacity: 0.55 + (i / bars.length) * 0.45 }} />
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex w-[320px] shrink-0 flex-col gap-5">
            <div className="flex flex-col gap-4 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
              <h3 className="text-[16px] font-extrabold text-[var(--dash-text)]">Productos más vistos</h3>
              <div className="flex flex-col gap-3">
                {topProducts.map((p) => (
                  <div key={p.name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[12px]"><span className="font-semibold text-[var(--dash-text2)]">{p.name}</span><span className="font-bold text-[var(--dash-muted)]">{p.views}</span></div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--dash-soft)]"><div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: `var(--tone-${p.t}-fg)` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
              <h3 className="text-[16px] font-extrabold text-[var(--dash-text)]">Por canal</h3>
              <div className="flex items-center gap-4">
                <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: donutGradient() }}>
                  <div className="absolute inset-[14px] rounded-full bg-[var(--dash-surface)]" />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  {channels.map((c) => (
                    <div key={c.name} className="flex items-center gap-2 text-[12px]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="flex-1 font-semibold text-[var(--dash-text2)]">{c.name}</span>
                      <span className="font-bold text-[var(--dash-muted)]">{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}

export default ReportsScreen
