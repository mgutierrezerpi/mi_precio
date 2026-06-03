import { Link } from 'react-router-dom'
import { Icon, type IconName } from './ui'
import { tone, gradient } from './theme'

const navMain: { icon: IconName; label: string; to?: string; badge?: string }[] = [
  { icon: 'layout-dashboard', label: 'Inicio', to: '/admin' },
  { icon: 'package', label: 'Productos', to: '/admin/items' },
  { icon: 'list-checks', label: 'Listas de precios', to: '/admin/lists', badge: '3' },
  { icon: 'qr-code', label: 'Códigos QR' },
  { icon: 'users', label: 'Clientes' },
  { icon: 'bar-chart', label: 'Reportes' },
]
const navSettings: { icon: IconName; label: string; to?: string }[] = [
  { icon: 'user-plus', label: 'Equipo' },
  { icon: 'settings', label: 'Configuración', to: '/admin/settings' },
]

function NavItem({ icon, label, to, badge, active }: { icon: IconName; label: string; to?: string; badge?: string; active: boolean }) {
  const inner = (
    <>
      <Icon name={icon} className={active ? 'text-white' : 'text-[var(--dash-muted)]'} />
      <span className={`flex-1 text-sm ${active ? 'font-bold text-white' : 'font-semibold text-[var(--dash-text2)]'}`}>{label}</span>
      {badge && (
        active
          ? <span className="rounded-[10px] bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white">{badge}</span>
          : <span className="rounded-[10px] px-2 py-0.5 text-[11px] font-bold" style={tone('violet')}>{badge}</span>
      )}
    </>
  )
  const cls = `flex h-11 items-center gap-3 rounded-xl px-3.5 ${active ? `text-white shadow-[0_6px_14px_-4px_rgba(124,58,237,0.4)] ${gradient}` : 'hover:bg-[var(--dash-soft)]'}`
  return to ? <Link to={to} className={cls}>{inner}</Link> : <button type="button" className={`${cls} w-full text-left`}>{inner}</button>
}

/** Shared CRM sidebar. `active` matches a nav item label. */
export function CrmSidebar({ active }: { active: string }) {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
      <Link to="/" className="flex items-center">
        <img src="/miprecio-logo-pencil.png" alt="MiPrecio" className="h-12 w-auto" />
      </Link>
      <p className="mt-5 text-xs font-medium text-[var(--dash-muted)]">CRM · Comercial</p>

      <p className="mt-5 mb-1 text-[11px] font-bold tracking-[0.15em] text-[var(--dash-muted)]">PRINCIPAL</p>
      {navMain.map((item) => <NavItem key={item.label} {...item} active={item.label === active} />)}

      <p className="mb-1 mt-3 text-[11px] font-bold tracking-[0.15em] text-[var(--dash-muted)]">AJUSTES</p>
      {navSettings.map((item) => <NavItem key={item.label} {...item} active={item.label === active} />)}

      <div className="flex-1" />

      <div className={`flex flex-col gap-2 rounded-2xl p-4 text-white shadow-[0_10px_24px_-6px_rgba(124,58,237,0.5)] ${gradient}`}>
        <p className="text-[10px] font-bold tracking-[0.2em] text-white/80">PLAN INICIAL</p>
        <p className="text-base font-extrabold">Subí a Pyme</p>
        <p className="text-xs font-medium leading-snug text-[#E0E7FF]">Productos ilimitados y multiusuario.</p>
        <button type="button" className="mt-1 flex h-9 items-center justify-center rounded-[10px] bg-white text-[13px] font-bold text-[#7C3AED] hover:bg-violet-50">
          Ver planes
        </button>
      </div>
    </aside>
  )
}
