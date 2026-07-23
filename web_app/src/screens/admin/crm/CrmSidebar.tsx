import { Link } from 'react-router-dom'
import { useTheme } from '../../../hooks/useTheme'
import { useAppSelector } from '../../../store/hooks'
import { selectTenant } from '../../../store/slices/authSlice'
import type { PlanId } from '../../../types'
import { planById } from '../../../lib/plans'
import { useT } from '../../../lib/i18n'
import { Icon, type IconName } from './ui'
import { tone, gradient } from './theme'

// Plans cheapest → most expensive; the upsell card points to the next tier up.
// 'pro' is the top plan, so it has no upgrade and the card is hidden.
const NEXT_PLAN: Partial<Record<PlanId, PlanId>> = { free: 'micro', micro: 'plus', plus: 'pro' }

// `id` is the stable (Spanish) key screens pass as CrmLayout `active`; `tKey` is the display label.
const navMain: { icon: IconName; id: string; tKey: string; to?: string; badge?: string }[] = [
  { icon: 'layout-dashboard', id: 'Inicio', tKey: 'nav.home', to: '/admin' },
  { icon: 'package', id: 'Productos', tKey: 'nav.products', to: '/admin/items' },
  { icon: 'list-checks', id: 'Listas de precios', tKey: 'nav.lists', to: '/admin/lists' },
  { icon: 'qr-code', id: 'Códigos QR', tKey: 'nav.qr', to: '/admin/qr' },
  { icon: 'users', id: 'Clientes', tKey: 'nav.customers', to: '/admin/clientes' },
  { icon: 'bar-chart', id: 'Reportes', tKey: 'nav.reports', to: '/admin/reportes' },
]
const navSettings: { icon: IconName; id: string; tKey: string; to?: string }[] = [
  { icon: 'user-plus', id: 'Equipo', tKey: 'nav.team', to: '/admin/equipo' },
  { icon: 'settings', id: 'Configuración', tKey: 'nav.settings', to: '/admin/settings' },
  { icon: 'life-buoy', id: 'Soporte', tKey: 'nav.support', to: '/admin/soporte' },
]

function NavItem({ icon, label, to, badge, active, onNavigate }: { icon: IconName; label: string; to?: string; badge?: string; active: boolean; onNavigate?: () => void }) {
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
  return to ? <Link to={to} onClick={onNavigate} className={cls}>{inner}</Link> : <button type="button" className={`${cls} w-full text-left`}>{inner}</button>
}

/** Shared CRM sidebar. `active` matches a nav item's stable id.
 *  Static column on desktop; slide-in drawer (controlled by `open`) below lg. */
export function CrmSidebar({ active, open = false, onClose }: { active: string; open?: boolean; onClose?: () => void }) {
  const { isDark } = useTheme()
  const t = useT()
  const tenant = useAppSelector(selectTenant)
  const nextPlan = tenant ? NEXT_PLAN[tenant.plan] : undefined
  return (
    <>
      {/* Drawer backdrop (mobile only) — always mounted so it can fade in/out. */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-out lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Link to="/" onClick={onClose} className="flex items-center">
          <img src={isDark ? '/miprecio-logo-white-pencil.webp' : '/miprecio-logo-pencil.webp'} alt="MiPrecio" className="h-12 w-auto" />
        </Link>
        <p className="mt-5 text-xs font-medium text-[var(--dash-muted)]">{t('side.crm')}</p>

        <p className="mt-5 mb-1 text-[11px] font-bold tracking-[0.15em] text-[var(--dash-muted)]">{t('side.main')}</p>
        {navMain.map((item) => <NavItem key={item.id} icon={item.icon} to={item.to} badge={item.badge} label={t(item.tKey)} active={item.id === active} onNavigate={onClose} />)}

        <p className="mb-1 mt-3 text-[11px] font-bold tracking-[0.15em] text-[var(--dash-muted)]">{t('side.settings')}</p>
        {navSettings.map((item) => <NavItem key={item.id} icon={item.icon} to={item.to} label={t(item.tKey)} active={item.id === active} onNavigate={onClose} />)}

        <div className="flex-1" />

        {/* Upsell to the next plan up; hidden once the tenant is on the top plan (pro). */}
        {nextPlan && tenant && (
          <div className={`flex flex-col gap-2 rounded-2xl p-4 text-white shadow-[0_10px_24px_-6px_rgba(124,58,237,0.5)] ${gradient}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">{t('side.planTag', { plan: planById(tenant.plan).name })}</p>
            <p className="text-base font-extrabold">{t('side.upgradeTitle', { plan: planById(nextPlan).name })}</p>
            <p className="text-xs font-medium leading-snug text-[#E0E7FF]">{t(`side.upgradeDesc.${nextPlan}`)}</p>
            <Link to="/admin/settings?section=billing" onClick={onClose} className="mt-1 flex h-9 items-center justify-center rounded-[10px] bg-white text-[13px] font-bold text-[#7C3AED] hover:bg-violet-50">
              {t('side.viewPlans')}
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
