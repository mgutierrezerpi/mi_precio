import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../../hooks/useTheme'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { selectTenant } from '../../../store/slices/authSlice'
import { fetchLists, selectLists } from '../../../store/slices/menuSlice'
import type { PlanId } from '../../../types'
import { planById } from '../../../lib/plans'
import { useT } from '../../../lib/i18n'
import { Icon, type IconName } from './ui'
import { tone, gradient } from './theme'

// Plans cheapest → most expensive; the upsell card points to the next tier up.
// 'pro' is the top plan, so it has no upgrade and the card is hidden.
const NEXT_PLAN: Partial<Record<PlanId, PlanId>> = {
  free: 'micro',
  micro: 'plus',
  plus: 'pro',
}

// `id` is the stable (Spanish) key screens pass as CrmLayout `active`; `tKey` is the display label.
const navMain: {
  icon: IconName
  id: string
  tKey: string
  label: string
  to?: string
  badge?: string
}[] = [
  {
    icon: 'layout-dashboard',
    id: 'Overview',
    tKey: 'nav.home',
    label: 'Resumen',
    to: '/admin',
  },
  {
    icon: 'list-checks',
    id: 'Listas de precios',
    tKey: 'nav.lists',
    label: 'Listas',
    to: '/admin/lists',
  },
  {
    icon: 'book-open',
    id: 'Revistas',
    tKey: 'nav.magazines',
    label: 'Revistas',
    to: '/admin/magazines',
  },
  {
    icon: 'package',
    id: 'Productos',
    tKey: 'nav.products',
    label: 'Productos',
    to: '/admin/items',
  },
  {
    icon: 'qr-code',
    id: 'Códigos QR',
    tKey: 'nav.qr',
    label: 'Códigos QR',
    to: '/admin/qr',
  },
  {
    icon: 'users',
    id: 'Clientes',
    tKey: 'nav.customers',
    label: 'Clientes',
    to: '/admin/clientes',
  },
  {
    icon: 'bar-chart',
    id: 'Reportes',
    tKey: 'nav.reports',
    label: 'Reportes',
    to: '/admin/reportes',
  },
]
const navSettings: {
  icon: IconName
  id: string
  tKey: string
  label: string
  to?: string
}[] = [
  {
    icon: 'user-plus',
    id: 'Equipo',
    tKey: 'nav.team',
    label: 'Equipo',
    to: '/admin/equipo',
  },
  {
    icon: 'settings',
    id: 'Configuración',
    tKey: 'nav.settings',
    label: 'Configuración',
    to: '/admin/settings',
  },
  {
    icon: 'life-buoy',
    id: 'Soporte',
    tKey: 'nav.support',
    label: 'Soporte',
    to: '/admin/soporte',
  },
]

function NavItem({
  icon,
  label,
  to,
  badge,
  active,
  onNavigate,
  collapsed,
}: {
  icon: IconName
  label: string
  to?: string
  badge?: string
  active: boolean
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const inner = (
    <>
      <Icon
        name={icon}
        className={active ? 'text-[var(--dash-sidebar-active-text)]' : 'text-[var(--dash-muted)]'}
      />
      {!collapsed && (
        <span
          className={`flex-1 text-sm ${active ? 'font-bold text-[var(--dash-sidebar-active-text)]' : 'font-semibold text-[var(--dash-text2)]'}`}
        >
          {label}
        </span>
      )}
      {badge &&
        !collapsed &&
        (active ? (
          <span className="rounded-[10px] bg-[var(--dash-sidebar-badge)] px-2 py-0.5 text-[11px] font-bold text-[var(--dash-sidebar-active-text)]">
            {badge}
          </span>
        ) : (
          <span
            className="rounded-[10px] px-2 py-0.5 text-[11px] font-bold"
            style={tone('violet')}
          >
            {badge}
          </span>
        ))}
    </>
  )
  const cls = `flex h-9 items-center gap-2 rounded-[8px] ${collapsed ? 'justify-center px-0' : 'px-3'} ${active ? 'bg-[var(--dash-sidebar-active)] text-[var(--dash-sidebar-active-text)]' : 'text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'}`
  return to ? (
    <Link to={to} onClick={onNavigate} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" className={`${cls} w-full text-left`}>
      {inner}
    </button>
  )
}

function SidebarHeader({
  collapsed,
  isDark,
  onClose,
  onToggle,
  t,
}: {
  collapsed: boolean
  isDark: boolean
  onClose?: () => void
  onToggle?: () => void
  t: ReturnType<typeof useT>
}) {
  const toggleLabel = collapsed
    ? t('side.expandSidebar')
    : t('side.collapseSidebar')
  return (
    <div className="relative flex h-10 items-center justify-center px-2">
      {!collapsed && (
        <Link
          to="/"
          onClick={onClose}
          className="relative flex min-w-0 items-center gap-2.5"
        >
          <img
            src={
              isDark
                ? '/miprecio-logo-white-pencil.webp'
                : '/miprecio-logo-pencil.webp'
            }
            alt="MiPrecio"
            className="h-[34px] w-auto max-w-[155px] object-contain object-left"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-[30%] right-0 h-[25%] bg-[var(--dash-sidebar)]"
          />
        </Link>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-label={toggleLabel}
        title={toggleLabel}
        className={`absolute hidden h-7 w-7 items-center justify-center rounded-md text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] hover:text-[var(--dash-text)] lg:flex ${collapsed ? 'left-1/2 -translate-x-1/2' : 'right-0'}`}
      >
        <Icon name={collapsed ? 'chevrons-right' : 'chevrons-left'} size={16} />
      </button>
    </div>
  )
}

function PublicListAction({
  collapsed,
  hasMainList,
  linkCopied,
  onClose,
  onCopy,
  t,
}: {
  collapsed: boolean
  hasMainList: boolean
  linkCopied: boolean
  onClose?: () => void
  onCopy: () => void
  t: ReturnType<typeof useT>
}) {
  const label = linkCopied ? t('side.linkCopied') : t('side.copyPublicLink')
  const className = `btn btn-sm mt-2 flex h-9 items-center rounded-lg bg-[var(--dash-soft)] text-xs font-bold text-[var(--dash-link)] hover:opacity-90 ${collapsed ? 'justify-center px-0' : 'justify-center gap-2'}`
  if (hasMainList)
    return (
      <button
        type="button"
        onClick={onCopy}
        title={label}
        aria-label={label}
        className={className}
      >
        <Icon name={linkCopied ? 'circle-check' : 'link-2'} size={15} />
        {!collapsed && label}
      </button>
    )
  return (
    <Link
      to="/admin/lists?new=1"
      onClick={onClose}
      title={t('side.createMainList')}
      aria-label={t('side.createMainList')}
      className={className}
    >
      <Icon name="list-plus" size={15} />
      {!collapsed && t('side.createMainList')}
    </Link>
  )
}

function SidebarNav({
  active,
  collapsed,
  items,
  onClose,
  title,
  t,
}: {
  active: string
  collapsed: boolean
  items: {
    icon: IconName
    id: string
    tKey: string
    to?: string
    badge?: string
  }[]
  onClose?: () => void
  title: string
  t: ReturnType<typeof useT>
}) {
  return (
    <>
      {!collapsed && (
        <p className="mb-1 mt-5 px-3 text-[10px] font-bold tracking-[0.15em] text-[var(--dash-muted)]">
          {title}
        </p>
      )}
      {items.map((item) => (
        <NavItem
          key={item.id}
          icon={item.icon}
          to={item.to}
          badge={item.badge}
          label={t(item.tKey)}
          active={item.id === active}
          onNavigate={onClose}
          collapsed={collapsed}
        />
      ))}
    </>
  )
}

/** Shared CRM sidebar. `active` matches a nav item's stable id.
 *  Static column on desktop; slide-in drawer (controlled by `open`) below lg. */
export function CrmSidebar({
  active,
  open = false,
  collapsed = false,
  onToggle,
  onClose,
}: {
  active: string
  open?: boolean
  collapsed?: boolean
  onToggle?: () => void
  onClose?: () => void
}) {
  const { isDark } = useTheme()
  const t = useT()
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const lists = useAppSelector(selectLists)
  const mainList = lists.find((list) => list.showOnIndex)
  const nextPlan = tenant ? NEXT_PLAN[tenant.plan] : undefined
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    if (tenant?.id) dispatch(fetchLists(tenant.id))
  }, [dispatch, tenant?.id])

  const copyPublicLink = () => {
    if (!tenant || !mainList) return
    const publicUrl = `${window.location.origin}/p/${tenant.subdomain || 'mi-negocio'}/${mainList.slug || mainList.id}`
    navigator.clipboard?.writeText(publicUrl)
    setLinkCopied(true)
    window.setTimeout(() => setLinkCopied(false), 1800)
  }
  return (
    <>
      {/* Drawer backdrop (mobile only) — always mounted so it can fade in/out. */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-out lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex min-h-[720px] w-[248px] shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-[var(--dash-border)] bg-[var(--dash-sidebar)] p-3 transition-[width,transform] duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 ${collapsed ? 'lg:w-[72px]' : ''} ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarHeader
          collapsed={collapsed}
          isDark={isDark}
          onClose={onClose}
          onToggle={onToggle}
          t={t}
        />
        {tenant && (
          <PublicListAction
            collapsed={collapsed}
            hasMainList={!!mainList}
            linkCopied={linkCopied}
            onClose={onClose}
            onCopy={copyPublicLink}
            t={t}
          />
        )}
        {/* Business switcher intentionally stays hidden until memberships are
            supported. A User currently belongs to exactly one tenant. */}

        <SidebarNav
          active={active}
          collapsed={collapsed}
          items={navMain}
          onClose={onClose}
          title={t('side.main')}
          t={t}
        />
        <SidebarNav
          active={active}
          collapsed={collapsed}
          items={navSettings}
          onClose={onClose}
          title={t('side.settings')}
          t={t}
        />

        <div className="flex-1" />

        {/* Upsell to the next plan up; hidden once the tenant is on the top plan (pro). */}
        {nextPlan && tenant && !collapsed && (
          <div
            className={`flex flex-col gap-3 rounded-lg p-4 text-white shadow-[0_12px_28px_-8px_rgba(124,58,237,0.6)] ${gradient}`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                {t('side.planTag', { plan: planById(tenant.plan).name })}
              </p>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                Micro
              </span>
            </div>
            <p className="text-base font-extrabold">
              {t('side.upgradeTitle', { plan: planById(nextPlan).name })}
            </p>
            <p className="text-xs font-medium leading-snug text-[#E0E7FF]">
              {t(`side.upgradeDesc.${nextPlan}`)}
            </p>
            <Link
              to="/admin/settings?section=billing"
              onClick={onClose}
              className="mt-0 flex h-9 items-center justify-center rounded-lg bg-white text-[13px] font-bold text-[#7C3AED] hover:bg-violet-50"
            >
              {t('side.viewPlans')}
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
