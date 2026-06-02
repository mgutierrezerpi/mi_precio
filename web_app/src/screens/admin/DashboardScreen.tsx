import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { selectTenant, selectUser, logout } from '../../store/slices/authSlice'
import { useTheme } from '../../hooks/useTheme'

/* ── Inline icon set (lucide-style, hardcoded for the CRM dashboard) ── */
type IconName =
  | 'layout-dashboard' | 'package' | 'tags' | 'list-checks' | 'qr-code' | 'users'
  | 'boxes' | 'bar-chart' | 'user-plus' | 'plug' | 'settings' | 'search' | 'moon' | 'sun'
  | 'share-2' | 'bell' | 'chevron-down' | 'plus' | 'link-2' | 'copy' | 'eye'
  | 'trending-up' | 'alert-triangle' | 'wrench' | 'zap' | 'paintbrush' | 'list-plus'
  | 'file-spreadsheet' | 'upload' | 'log-out' | 'user'

const ICONS: Record<IconName, React.ReactNode> = {
  'layout-dashboard': <><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></>,
  package: <><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /><path d="M12 22V12" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="m7.5 4.27 9 5.15" /></>,
  tags: <><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></>,
  'list-checks': <><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /><path d="M13 6h8" /><path d="M13 12h8" /><path d="M13 18h8" /></>,
  'qr-code': <><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  boxes: <><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></>,
  'bar-chart': <><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></>,
  'user-plus': <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></>,
  plug: <><path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" /><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" /></>,
  settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>,
  'share-2': <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
  'link-2': <><path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><line x1="8" x2="16" y1="12" y2="12" /></>,
  copy: <><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></>,
  eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
  'trending-up': <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>,
  'alert-triangle': <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
  wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  paintbrush: <><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" /><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" /><path d="M14.5 17.5 4.5 15" /></>,
  'list-plus': <><path d="M11 12H3" /><path d="M16 6H3" /><path d="M16 18H3" /><path d="M18 9v6" /><path d="M21 12h-6" /></>,
  'file-spreadsheet': <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M8 13h2" /><path d="M14 13h2" /><path d="M8 17h2" /><path d="M14 17h2" /></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></>,
  'log-out': <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></>,
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
}

function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

/* Theme-aware tinted surface (background + matching foreground). */
type Tone = 'violet' | 'sky' | 'blue' | 'green' | 'amber' | 'orange' | 'red' | 'pink'
const tone = (t: Tone) => ({ backgroundColor: `var(--tone-${t}-bg)`, color: `var(--tone-${t}-fg)` })

/* ── Hardcoded data (functionality comes later) ──────────────────── */
const navMain: { icon: IconName; label: string; to?: string; badge?: string; active?: boolean }[] = [
  { icon: 'layout-dashboard', label: 'Inicio', to: '/admin', active: true },
  { icon: 'package', label: 'Productos', to: '/admin/items' },
  { icon: 'tags', label: 'Categorías' },
  { icon: 'list-checks', label: 'Listas de precios', to: '/admin/lists', badge: '3' },
  { icon: 'qr-code', label: 'Códigos QR' },
  { icon: 'users', label: 'Clientes' },
  { icon: 'boxes', label: 'Stock' },
  { icon: 'bar-chart', label: 'Reportes' },
]
const navSettings: { icon: IconName; label: string; to?: string }[] = [
  { icon: 'user-plus', label: 'Equipo' },
  { icon: 'plug', label: 'Integraciones' },
  { icon: 'settings', label: 'Configuración', to: '/admin/settings' },
]

const kpis: { icon: IconName; iconTone: Tone; value: string; label: string; tag: string; tagTone: Tone; note: string }[] = [
  { icon: 'package', iconTone: 'violet', value: '142', label: 'Productos activos', tag: '+4%', tagTone: 'green', note: '+6 esta semana' },
  { icon: 'list-checks', iconTone: 'violet', value: '18', label: 'Listas compartidas', tag: 'Nuevas 3', tagTone: 'violet', note: '3 activas hoy' },
  { icon: 'qr-code', iconTone: 'sky', value: '1.284', label: 'Escaneos QR', tag: '+19%', tagTone: 'green', note: '+212 vs semana pasada' },
  { icon: 'alert-triangle', iconTone: 'amber', value: '7', label: 'Bajo stock', tag: 'Revisar', tagTone: 'red', note: 'Requiere atención' },
]

type Stock = { label: string; units?: string; tone: Tone }
const products: { icon: IconName; name: string; detail: string; sku: string; cat: string; catTone: Tone; price: string; stock: Stock }[] = [
  { icon: 'wrench', name: 'Tornillo hex. 8mm', detail: 'Acero galvanizado', sku: 'TOR-001', cat: 'Ferretería', catTone: 'violet', price: '$85', stock: { label: 'Disponible', units: '148 u.', tone: 'green' } },
  { icon: 'zap', name: 'Cable eléctrico 2.5', detail: 'Rollo x 100m', sku: 'ELE-220', cat: 'Eléctricos', catTone: 'blue', price: '$1.250', stock: { label: 'Disponible', units: '62 u.', tone: 'green' } },
  { icon: 'paintbrush', name: 'Pintura látex 4L', detail: 'Blanco mate', sku: 'PIN-104', cat: 'Pinturas', catTone: 'pink', price: '$9.800', stock: { label: 'Bajo stock', units: '5 u.', tone: 'amber' } },
  { icon: 'package', name: 'Cemento 50kg', detail: 'Uso general', sku: 'CON-050', cat: 'Construcción', catTone: 'orange', price: '$6.300', stock: { label: 'Sin stock', tone: 'red' } },
  { icon: 'wrench', name: 'Bisagra inoxidable', detail: 'Tipo libro 3in', sku: 'BIS-330', cat: 'Ferretería', catTone: 'violet', price: '$420', stock: { label: 'Disponible', units: '84 u.', tone: 'green' } },
]

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

const gradient = 'bg-[linear-gradient(45deg,#7C3AED_0%,#A855F7_100%)]'

/* ── QR placeholder (deterministic checker pattern) ──────────────── */
function QrGraphic({ className = '' }: { className?: string }) {
  const cells = Array.from({ length: 13 * 13 }, (_, i) => {
    const r = Math.floor(i / 13)
    const c = i % 13
    const finder = (r < 4 && c < 4) || (r < 4 && c > 8) || (r > 8 && c < 4)
    return finder || (r * 7 + c * 13 + r * c) % 3 === 0
  })
  return (
    <div className={`grid grid-cols-[repeat(13,minmax(0,1fr))] gap-px ${className}`}>
      {cells.map((on, i) => (
        <span key={i} className={on ? 'bg-[#0F172A]' : 'bg-white'} style={{ aspectRatio: '1' }} />
      ))}
    </div>
  )
}

/* ── Screen ──────────────────────────────────────────────────────── */
export function DashboardScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const tenant = useAppSelector(selectTenant)
  const user = useAppSelector(selectUser)
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/')
  }

  const emailName = user?.email
    ? user.email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : ''
  const displayName = tenant?.name?.trim() || emailName || 'Mi cuenta'
  const plan = 'Negocio Pro' // TODO: traer el plan real del backend
  const initials = displayName.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'U'

  return (
    <div className="dash flex h-screen overflow-hidden bg-[var(--dash-bg)] font-sans text-[var(--dash-text)]">
      {/* ── Sidebar ── */}
      <aside className="flex w-[260px] shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
        <Link to="/" className="flex items-center">
          <img src="/miprecio-logo-pencil.png" alt="MiPrecio" className="h-12 w-auto" />
        </Link>
        <p className="mt-5 text-xs font-medium text-[var(--dash-muted)]">CRM · Comercial</p>

        <p className="mt-5 mb-1 text-[11px] font-bold tracking-[0.15em] text-[var(--dash-muted)]">PRINCIPAL</p>
        {navMain.map((item) => <NavItem key={item.label} {...item} />)}

        <p className="mb-1 mt-3 text-[11px] font-bold tracking-[0.15em] text-[var(--dash-muted)]">AJUSTES</p>
        {navSettings.map((item) => <NavItem key={item.label} {...item} />)}

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

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-[72px] shrink-0 items-center gap-4 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-8">
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-[var(--dash-text)]">Inicio</h1>
            <p className="text-xs font-medium text-[var(--dash-muted)]">
              Buenos días{tenant?.name ? `, ${tenant.name}` : ''} — hoy hay 3 productos con bajo stock.
            </p>
          </div>
          <div className="flex-1" />
          <label className="flex h-10 w-[320px] items-center gap-2.5 rounded-xl border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] px-3">
            <Icon name="search" size={16} className="text-[var(--dash-muted)]" />
            <input
              placeholder="Buscar productos, listas, clientes…"
              className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)]"
            />
          </label>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] hover:opacity-80"
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            <Icon name={isDark ? 'sun' : 'moon'} className={isDark ? 'text-[#FBBF24]' : 'text-[var(--dash-text2)]'} />
          </button>
          <button type="button" className={`flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-bold text-white shadow-[0_8px_20px_-4px_rgba(124,58,237,0.4)] ${gradient}`}>
            <Icon name="share-2" size={16} /> Compartir lista
          </button>
          <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80" title="Notificaciones">
            <Icon name="bell" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-[var(--dash-surface)] bg-[#EF4444]" />
          </button>
          <UserMenu name={displayName} plan={plan} initials={initials} onLogout={handleLogout} />
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex min-w-[900px] flex-col gap-6 p-8">
            {/* Welcome row */}
            <div className="flex gap-6">
              <div className={`flex flex-1 items-center gap-6 rounded-3xl p-7 text-white shadow-[0_16px_32px_-8px_rgba(124,58,237,0.4)] ${gradient}`}>
                <div className="flex flex-1 flex-col gap-3">
                  <p className="text-xs font-bold tracking-[0.2em] text-white/70">NOVEDAD</p>
                  <h2 className="text-3xl font-extrabold leading-tight">Compartí tu catálogo en un escaneo.</h2>
                  <p className="text-sm font-medium leading-relaxed text-white/80">Generá códigos QR personalizados con tu logo y actualizalos sin reimprimir.</p>
                  <button type="button" className="mt-1 flex h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#7C3AED] hover:bg-violet-50">
                    <Icon name="plus" size={16} /> Crear QR
                  </button>
                </div>
                <div className="flex h-[140px] w-[140px] shrink-0 items-center justify-center rounded-2xl bg-white p-3.5">
                  <QrGraphic className="h-full w-full" />
                </div>
              </div>

              <div className="flex w-[320px] shrink-0 flex-col gap-3.5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_10px_24px_-8px_rgba(30,27,75,0.08)]">
                <p className="text-lg font-extrabold text-[var(--dash-text)]">Tu lista pública</p>
                <div className="flex h-[42px] items-center gap-2.5 rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] px-3 text-[var(--dash-link)]">
                  <Icon name="link-2" size={16} />
                  <span className="flex-1 truncate text-[13px] font-semibold">miprecio.app/p/mi-negocio</span>
                  <Icon name="copy" size={16} className="cursor-pointer" />
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] px-3 py-2 text-[var(--dash-text2)]">
                    <Icon name="eye" size={14} className="text-[var(--dash-link)]" />
                    <span className="text-xs font-bold">Hoy: 248</span>
                  </div>
                  <div className="flex flex-1 items-center gap-2 rounded-[10px] px-3 py-2" style={tone('green')}>
                    <Icon name="trending-up" size={14} />
                    <span className="text-xs font-bold">+18% vs ayer</span>
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
              <ProductsTable />
              <div className="flex w-[380px] shrink-0 flex-col gap-5">
                <QuickActions />
                <ActivityFeed />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserMenu({ name, plan, initials, onLogout }: { name: string; plan: string; initials: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 items-center gap-2.5 rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] py-1 pl-1 pr-3 transition hover:opacity-80"
      >
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white ${gradient}`}>{initials}</span>
        <span className="flex max-w-[160px] flex-col items-start leading-tight">
          <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{name}</span>
          <span className="truncate text-[11px] font-semibold text-[var(--dash-link)]">{plan}</span>
        </span>
        <Icon name="chevron-down" size={14} className={`text-[var(--dash-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-[calc(100%+8px)] z-50 w-60 origin-top-right rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1.5 shadow-[0_16px_44px_-12px_rgba(15,23,42,0.3)] transition-all duration-200 ease-out ${open ? 'scale-100 opacity-100 translate-y-0' : 'pointer-events-none -translate-y-1 scale-95 opacity-0'}`}
      >
        <div className="flex items-center gap-3 px-3 py-2.5">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white ${gradient}`}>{initials}</span>
          <div className="flex min-w-0 flex-col items-start gap-1 leading-tight">
            <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{name}</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={tone('violet')}>{plan}</span>
          </div>
        </div>
        <div className="my-1 h-px bg-[var(--dash-divider)]" />
        <button
          type="button"
          role="menuitem"
          onClick={() => { setOpen(false); onLogout() }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-[#EF4444] transition-colors hover:bg-[var(--dash-soft)]"
        >
          <Icon name="log-out" size={16} /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function NavItem({ icon, label, to, badge, active }: { icon: IconName; label: string; to?: string; badge?: string; active?: boolean }) {
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

function ProductsTable() {
  return (
    <div className="flex flex-1 flex-col gap-[18px] rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_10px_24px_-8px_rgba(30,27,75,0.08)]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">Productos recientes</h3>
          <p className="text-xs font-medium text-[var(--dash-muted)]">Actualizá precios y stock al instante.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className={`flex h-9 items-center rounded-[10px] px-3.5 text-[13px] font-bold text-white ${gradient}`}>Todos</button>
          <button type="button" className="flex h-9 items-center rounded-[10px] bg-[var(--dash-soft)] px-3.5 text-[13px] font-bold text-[var(--dash-text2)]">Bajo stock</button>
          <button type="button" className="flex h-9 items-center rounded-[10px] bg-[var(--dash-soft)] px-3.5 text-[13px] font-bold text-[var(--dash-text2)]">Sin foto</button>
          <button type="button" className={`flex h-9 w-9 items-center justify-center rounded-[10px] text-white ${gradient}`}><Icon name="plus" /></button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--dash-border)]">
        <div className="flex h-[42px] items-center gap-3 bg-[var(--dash-table-head)] px-[18px] text-[11px] font-bold tracking-wide text-[var(--dash-muted)]">
          <span className="flex-1">PRODUCTO</span>
          <span className="w-[110px]">SKU</span>
          <span className="w-[130px]">CATEGORÍA</span>
          <span className="w-[90px]">PRECIO</span>
          <span className="w-[90px]">STOCK</span>
        </div>
        {products.map((p, i) => (
          <div key={p.sku} className={`flex h-[68px] items-center gap-3 bg-[var(--dash-surface)] px-[18px] ${i > 0 ? 'border-t border-[var(--dash-divider)]' : ''}`}>
            <div className="flex flex-1 items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={tone('violet')}><Icon name={p.icon} /></span>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[var(--dash-text)]">{p.name}</span>
                <span className="text-[11px] font-medium text-[var(--dash-muted)]">{p.detail}</span>
              </div>
            </div>
            <span className="w-[110px] text-xs font-semibold text-[var(--dash-text2)]">{p.sku}</span>
            <span className="w-[130px]">
              <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(p.catTone)}>{p.cat}</span>
            </span>
            <span className="w-[90px] text-[13px] font-bold text-[var(--dash-text)]">{p.price}</span>
            <span className="w-[90px]">
              <span className="inline-flex flex-col rounded-lg px-2 py-1 leading-tight" style={tone(p.stock.tone)}>
                <span className="text-[11px] font-bold">{p.stock.label}</span>
                {p.stock.units && <span className="text-[10px] font-semibold opacity-90">{p.stock.units}</span>}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--dash-muted)]">Mostrando 5 de 142 productos</span>
        <div className="flex gap-2">
          <button type="button" className="flex h-8 items-center rounded-lg bg-[var(--dash-soft)] px-3 text-xs font-bold text-[var(--dash-muted)]">Anterior</button>
          <button type="button" className="flex h-8 items-center rounded-lg px-3 text-xs font-bold" style={tone('violet')}>Siguiente</button>
        </div>
      </div>
    </div>
  )
}

function QuickActions() {
  return (
    <div className="flex flex-col gap-3.5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-[22px] shadow-[0_10px_24px_-8px_rgba(30,27,75,0.08)]">
      <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">Acciones rápidas</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((a) => (
          <button key={a.title} type="button" className="flex flex-col gap-2.5 rounded-2xl border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] p-[18px] text-left hover:opacity-80">
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
