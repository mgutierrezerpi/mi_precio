import { useMemo, useState } from 'react'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { tone, gradient, type Tone } from './crm/theme'

type Status = 'Activo' | 'Inactivo' | 'Nuevo'
type Customer = { name: string; email: string; phone: string; last: string; total: string; status: Status; avatarTone: Tone }

const customers: Customer[] = [
  { name: 'Lucía Fernández', email: 'lucia@almacennorte.com', phone: '+598 99 123 456', last: 'Hace 2 días', total: '$ 48.200', status: 'Activo', avatarTone: 'violet' },
  { name: 'Martín Sosa', email: 'martin@distrimax.com', phone: '+598 98 654 321', last: 'Hace 1 semana', total: '$ 132.900', status: 'Activo', avatarTone: 'sky' },
  { name: 'Carla Pérez', email: 'carla@aceroplus.com', phone: '+598 91 222 333', last: 'Ayer', total: '$ 86.400', status: 'Activo', avatarTone: 'green' },
  { name: 'José Romero', email: 'jose@ferrosur.com', phone: '+598 99 777 888', last: 'Hace 1 mes', total: '$ 12.300', status: 'Inactivo', avatarTone: 'amber' },
  { name: 'Valeria Méndez', email: 'valeria@pinturasvm.com', phone: '+598 92 444 555', last: 'Hoy', total: '$ 4.900', status: 'Nuevo', avatarTone: 'rose' },
  { name: 'Andrés Castro', email: 'andres@construcastro.com', phone: '+598 97 666 111', last: 'Hace 3 días', total: '$ 73.500', status: 'Activo', avatarTone: 'purple' },
  { name: 'Marta López', email: 'marta@hogarml.com', phone: '+598 95 888 222', last: 'Hace 2 semanas', total: '$ 21.700', status: 'Inactivo', avatarTone: 'blue' },
  { name: 'Diego Ramos', email: 'diego@electroramos.com', phone: '+598 94 333 999', last: 'Hoy', total: '$ 9.800', status: 'Nuevo', avatarTone: 'sky' },
]

const statusTone: Record<Status, Tone> = { Activo: 'green', Inactivo: 'slate', Nuevo: 'violet' }

const kpis: { icon: IconName; iconTone: Tone; value: string; label: string; note: string }[] = [
  { icon: 'users', iconTone: 'violet', value: '248', label: 'Total clientes', note: 'En tu cartera' },
  { icon: 'circle-check', iconTone: 'green', value: '186', label: 'Activos', note: 'Compraron este mes' },
  { icon: 'user-plus', iconTone: 'sky', value: '12', label: 'Nuevos', note: 'Últimos 30 días' },
  { icon: 'trending-up', iconTone: 'rose', value: '34', label: 'Recurrentes', note: '3+ compras' },
]

export function CustomersScreen() {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? customers.filter((c) => [c.name, c.email, c.phone].some((v) => v.toLowerCase().includes(q))) : customers
  }, [search])
  const initials = (n: string) => n.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  return (
    <CrmLayout active="Clientes" title="Clientes" subtitle="Gestioná tu cartera de clientes." searchPlaceholder="Buscar clientes…" searchValue={search} onSearchChange={setSearch}>
      <div className="flex min-w-[980px] flex-col gap-5 p-8">
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="flex items-center gap-3.5 rounded-[18px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-[18px] shadow-[0_12px_30px_-12px_rgba(30,27,75,0.1)]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]" style={tone(k.iconTone)}><Icon name={k.icon} size={22} /></span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-end gap-2"><span className="text-[26px] font-black leading-none text-[var(--dash-text)]">{k.value}</span><span className="truncate pb-0.5 text-xs font-semibold text-[var(--dash-text2)]">{k.label}</span></div>
                <span className="mt-1 truncate text-[11px] font-medium text-[var(--dash-muted)]">{k.note}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-[18px] rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">Clientes</h3>
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={tone('violet')}>248 totales</span>
            </div>
            <button type="button" className={`flex h-[38px] items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-4px_rgba(124,58,237,0.4)] ${gradient}`}><Icon name="plus" size={16} /> Nuevo cliente</button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--dash-border)]">
            <div className="flex items-center gap-3 bg-[var(--dash-table-head)] px-[18px] py-3.5 text-[11px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              <span className="flex-1">Cliente</span>
              <span className="w-[150px]">Teléfono</span>
              <span className="w-[120px]">Última compra</span>
              <span className="w-[110px]">Total</span>
              <span className="w-[90px]">Estado</span>
            </div>
            {filtered.map((c, i) => (
              <div key={c.email} className={`flex items-center gap-3 bg-[var(--dash-surface)] px-[18px] py-3 ${i > 0 ? 'border-t border-[var(--dash-divider)]' : ''}`}>
                <div className="flex flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={tone(c.avatarTone)}>{initials(c.name)}</span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{c.name}</span>
                    <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">{c.email}</span>
                  </div>
                </div>
                <span className="w-[150px] text-xs font-medium text-[var(--dash-text2)]">{c.phone}</span>
                <span className="w-[120px] text-xs font-medium text-[var(--dash-muted)]">{c.last}</span>
                <span className="w-[110px] text-[13px] font-extrabold text-[var(--dash-text)]">{c.total}</span>
                <span className="w-[90px]"><span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(statusTone[c.status])}>{c.status}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}

export default CustomersScreen
