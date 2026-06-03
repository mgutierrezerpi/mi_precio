import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { tone, gradient, type Tone } from './crm/theme'

const kpis: { icon: IconName; iconTone: Tone; value: string; label: string; note: string }[] = [
  { icon: 'users', iconTone: 'violet', value: '8', label: 'Miembros', note: 'En tu equipo' },
  { icon: 'circle-check', iconTone: 'green', value: '6', label: 'Activos', note: 'Con acceso' },
  { icon: 'user-plus', iconTone: 'amber', value: '2', label: 'Invitaciones', note: 'Pendientes' },
  { icon: 'settings', iconTone: 'sky', value: '4', label: 'Roles', note: 'Configurados' },
]

type Role = 'Owner' | 'Admin' | 'Editor' | 'Lector'
type Member = { name: string; email: string; role: Role; last: string; active: boolean; t: Tone }
const members: Member[] = [
  { name: 'María Gómez', email: 'maria@minegocio.com', role: 'Owner', last: 'Hace 5 min', active: true, t: 'violet' },
  { name: 'Axel Núñez', email: 'axel@minegocio.com', role: 'Admin', last: 'Hace 1 h', active: true, t: 'sky' },
  { name: 'Sol Ruiz', email: 'sol@minegocio.com', role: 'Editor', last: 'Hace 3 h', active: true, t: 'rose' },
  { name: 'Bruno Díaz', email: 'bruno@minegocio.com', role: 'Editor', last: 'Ayer', active: true, t: 'green' },
  { name: 'Lara Vega', email: 'lara@minegocio.com', role: 'Lector', last: 'Hace 2 días', active: false, t: 'amber' },
  { name: 'Nico Ferro', email: 'nico@minegocio.com', role: 'Lector', last: 'Hace 1 semana', active: true, t: 'purple' },
]
const roleTone: Record<Role, Tone> = { Owner: 'violet', Admin: 'sky', Editor: 'green', Lector: 'slate' }

const rolePerms: { role: string; desc: string }[] = [
  { role: 'Owner', desc: 'Control total, facturación y eliminación de cuenta.' },
  { role: 'Admin', desc: 'Gestiona productos, listas, clientes y equipo.' },
  { role: 'Editor', desc: 'Crea y edita productos y listas.' },
  { role: 'Lector', desc: 'Solo lectura del catálogo y reportes.' },
]
const pending = [
  { email: 'juan@proveedor.com', role: 'Editor' },
  { email: 'ventas@mayorista.com', role: 'Lector' },
]

const initials = (n: string) => n.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export function TeamScreen() {
  return (
    <CrmLayout active="Equipo" title="Equipo" subtitle="Gestioná quién accede a tu cuenta." searchPlaceholder="Buscar miembros…">
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

        {/* Members */}
        <div className="flex flex-col gap-[18px] rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
          <div className="flex items-center justify-between">
            <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">Miembros del equipo</h3>
            <button type="button" className={`flex h-[38px] items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-4px_rgba(124,58,237,0.4)] ${gradient}`}><Icon name="plus" size={16} /> Invitar miembro</button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[var(--dash-border)]">
            <div className="flex items-center gap-3 bg-[var(--dash-table-head)] px-[18px] py-3.5 text-[11px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              <span className="flex-1">Miembro</span>
              <span className="w-[110px]">Rol</span>
              <span className="w-[130px]">Último acceso</span>
              <span className="w-[90px]">Estado</span>
            </div>
            {members.map((m, i) => (
              <div key={m.email} className={`flex items-center gap-3 bg-[var(--dash-surface)] px-[18px] py-3 ${i > 0 ? 'border-t border-[var(--dash-divider)]' : ''}`}>
                <div className="flex flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={tone(m.t)}>{initials(m.name)}</span>
                  <div className="flex min-w-0 flex-col"><span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{m.name}</span><span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">{m.email}</span></div>
                </div>
                <span className="w-[110px]"><span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(roleTone[m.role])}>{m.role}</span></span>
                <span className="w-[130px] text-xs font-medium text-[var(--dash-muted)]">{m.last}</span>
                <span className="w-[90px]"><span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(m.active ? 'green' : 'slate')}>{m.active ? 'Activo' : 'Inactivo'}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex gap-5">
          <div className="flex flex-1 flex-col gap-3.5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
            <h3 className="text-[18px] font-extrabold text-[var(--dash-text)]">Permisos por rol</h3>
            {rolePerms.map((r) => (
              <div key={r.role} className="flex items-center gap-3">
                <span className="w-[70px] shrink-0 rounded-full px-2.5 py-1 text-center text-[11px] font-bold" style={tone(roleTone[r.role as Role] ?? 'slate')}>{r.role}</span>
                <span className="text-[12px] font-medium text-[var(--dash-text2)]">{r.desc}</span>
              </div>
            ))}
          </div>
          <div className="flex w-[360px] shrink-0 flex-col gap-3.5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
            <h3 className="text-[18px] font-extrabold text-[var(--dash-text)]">Invitaciones pendientes</h3>
            {pending.map((p) => (
              <div key={p.email} className="flex items-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={tone('amber')}><Icon name="user-plus" size={16} /></span>
                <div className="flex min-w-0 flex-1 flex-col"><span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{p.email}</span><span className="text-[11px] font-medium text-[var(--dash-muted)]">Rol: {p.role}</span></div>
                <button type="button" className="text-[12px] font-bold text-[var(--dash-link)] hover:underline">Reenviar</button>
                <button type="button" className="text-[12px] font-bold text-[#EF4444] hover:underline">Cancelar</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CrmLayout>
  )
}

export default TeamScreen
