import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant, setTenant, selectUser, selectIsAdmin, logout } from '../../store/slices/authSlice'
import type { Tenant, Role, NotifPrefs } from '../../types'
import api from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { gradient, tone } from './crm/theme'

const sections: { key: string; label: string; icon: IconName; danger?: boolean }[] = [
  { key: 'info', label: 'Información de la empresa', icon: 'package' },
  { key: 'brand', label: 'Marca y apariencia', icon: 'paintbrush' },
  { key: 'notifications', label: 'Notificaciones', icon: 'bell' },
  { key: 'region', label: 'Idioma y región', icon: 'settings' },
  { key: 'security', label: 'Seguridad', icon: 'user' },
  { key: 'billing', label: 'Plan y facturación', icon: 'tags' },
  // Datos fiscales: oculta por ahora. Para reactivar, descomentá esta línea y el
  // bloque `{active === 'tax' && <TaxSection .../>}` más abajo.
  // { key: 'tax', label: 'Datos fiscales', icon: 'file-spreadsheet' },
  { key: 'delete', label: 'Eliminar cuenta', icon: 'circle-x', danger: true },
]

const inputCls = 'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)] disabled:opacity-60'

const ROLE_LABEL: Record<Role, string> = { owner: 'Dueño', admin: 'Admin', editor: 'Editor', viewer: 'Lector' }
const BRAND_SWATCHES = ['#7C3AED', '#2563EB', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#DB2777', '#475569']
const CURRENCIES = ['UYU', 'ARS', 'USD', 'BRL', 'CLP', 'PYG', 'PEN', 'MXN']
const LANGUAGES: { code: string; label: string }[] = [
  { code: 'es', label: 'Español' }, { code: 'en', label: 'English' }, { code: 'pt', label: 'Português' },
]
const TIMEZONES = [
  'America/Montevideo', 'America/Argentina/Buenos_Aires', 'America/Santiago', 'America/Sao_Paulo',
  'America/Asuncion', 'America/Lima', 'America/Mexico_City', 'America/Bogota', 'UTC',
]

/** Read an image file, downscale to `max` px on its longest side, return a compressed JPEG/PNG data URL. */
async function fileToDataUrl(file: File, max = 256): Promise<string> {
  const src = await new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src
  })
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale), h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/png')
}

export function SettingsCrmScreen() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const user = useAppSelector(selectUser)
  const canManage = useAppSelector(selectIsAdmin)
  const [active, setActive] = useState(sections[0].key)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const save = async (patch: Parameters<typeof api.updateTenant>[1], key: string) => {
    if (!tenant?.id) return
    setSavingKey(key); setError(null)
    const res = await api.updateTenant(tenant.id, patch)
    setSavingKey(null)
    if (res.error) setError(res.error)
    else if (res.data) { dispatch(setTenant(res.data)); setSavedKey(key); setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 2000) }
  }

  const ctx = { tenant, canManage, save, savingKey, savedKey }

  return (
    <CrmLayout active="Configuración" title="Configuración" subtitle="Administrá los datos y preferencias de tu cuenta." searchPlaceholder="Buscar…">
      <div className="flex min-w-[900px] gap-6 p-8">
        {/* Sub-nav */}
        <div className="flex w-[240px] shrink-0 flex-col gap-1 self-start rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 shadow-[0_18px_50px_-22px_rgba(30,27,75,0.18)]">
          {sections.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(s.key)}
              className={`flex h-10 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 text-left text-[13px] font-semibold ${s.key === active ? `text-white ${gradient}` : s.danger ? 'text-[#EF4444] hover:bg-[var(--dash-soft)]' : 'text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'}`}
            >
              <Icon name={s.icon} size={16} /> {s.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="flex flex-1 flex-col gap-5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-7 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#B91C1C]">
              <Icon name="alert-triangle" size={16} /> {error}
            </div>
          )}
          {!canManage && active !== 'security' && active !== 'delete' && active !== 'notifications' && (
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
              <Icon name="alert-triangle" size={15} /> Solo los administradores pueden editar la configuración de la cuenta.
            </div>
          )}

          {active === 'info' && <InfoSection {...ctx} />}
          {active === 'brand' && <BrandSection {...ctx} />}
          {active === 'notifications' && <NotificationsSection tenantId={tenant?.id} />}
          {active === 'region' && <RegionSection {...ctx} />}
          {active === 'security' && <SecuritySection user={user} onLogout={() => dispatch(logout())} />}
          {active === 'billing' && <BillingSection tenant={tenant} />}
          {/* Datos fiscales: oculta por ahora (ver array `sections`). Para reactivar, descomentá: */}
          {/* {active === 'tax' && <TaxSection {...ctx} />} */}
          {active === 'delete' && <DeleteSection tenant={tenant} isOwner={user?.role === 'owner'} />}
        </div>
      </div>
    </CrmLayout>
  )
}

/* ── Shared shells ───────────────────────────────────────────────────── */
type Ctx = {
  tenant: Tenant | null
  canManage: boolean
  save: (patch: Parameters<typeof api.updateTenant>[1], key: string) => Promise<void>
  savingKey: string | null
  savedKey: string | null
}

function SectionHeader({ title, subtitle, onSave, saving, saved, canManage }: { title: string; subtitle: string; onSave?: () => void; saving?: boolean; saved?: boolean; canManage: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <h3 className="text-[20px] font-extrabold text-[var(--dash-text)]">{title}</h3>
        <p className="text-xs font-medium text-[var(--dash-muted)]">{subtitle}</p>
      </div>
      {onSave && canManage && (
        <button type="button" onClick={onSave} disabled={saving} className={`flex h-10 items-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}>
          {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar cambios'}
        </button>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">{label}</span>
      {children}
    </label>
  )
}

/* ── 0. Info ─────────────────────────────────────────────────────────── */
function InfoSection({ tenant, canManage, save, savingKey, savedKey }: Ctx) {
  const [name, setName] = useState(tenant?.name ?? '')
  const [subdomain, setSubdomain] = useState(tenant?.subdomain ?? '')
  const [taxId, setTaxId] = useState(tenant?.taxId ?? '')
  const [logo, setLogo] = useState<string | null>(tenant?.logoUrl ?? null)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const publicUrl = `${window.location.origin}/p/${tenant?.subdomain || ''}`

  const pickLogo = async (file?: File) => { if (file) setLogo(await fileToDataUrl(file)) }
  const copyUrl = () => { navigator.clipboard?.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <>
      <SectionHeader title="Información de la empresa" subtitle="El nombre, el logo y la dirección pública de tu catálogo." canManage={canManage}
        onSave={() => save({ name: name.trim(), subdomain: subdomain.trim(), taxId: taxId.trim() || null, logoUrl: logo }, 'info')} saving={savingKey === 'info'} saved={savedKey === 'info'} />

      <Field label="Logo">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--dash-border)]" style={logo ? undefined : tone('violet')}>
            {logo ? <img src={logo} alt="logo" className="h-full w-full object-contain" /> : <Icon name="package" size={28} />}
          </span>
          {canManage && (
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickLogo(e.target.files?.[0])} />
              <button type="button" onClick={() => fileRef.current?.click()} className="flex h-9 items-center gap-2 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"><Icon name="upload" size={15} /> {logo ? 'Cambiar logo' : 'Subir logo'}</button>
              {logo && <button type="button" onClick={() => setLogo(null)} className="text-[13px] font-bold text-[#EF4444] hover:underline">Quitar</button>}
            </div>
          )}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre del negocio"><input value={name} onChange={(e) => setName(e.target.value)} disabled={!canManage} className={inputCls} /></Field>
        <Field label="Subdominio"><input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} disabled={!canManage} className={inputCls} /></Field>
        <Field label="RUT / Identificación fiscal"><input value={taxId} onChange={(e) => setTaxId(e.target.value)} disabled={!canManage} placeholder="21 123456 0017" className={inputCls} /></Field>
      </div>

      <Field label="Dirección pública">
        <button type="button" onClick={copyUrl} title="Copiar enlace" className="flex items-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 py-2.5 text-left transition hover:border-[var(--dash-link)]">
          <Icon name="link-2" size={15} className="text-[var(--dash-link)]" />
          <span className="flex-1 truncate text-sm font-semibold text-[var(--dash-link)]">{publicUrl}</span>
          <Icon name={copied ? 'circle-check' : 'copy'} size={15} className="text-[var(--dash-link)]" />
        </button>
      </Field>
    </>
  )
}

/* ── 1. Brand ────────────────────────────────────────────────────────── */
function BrandSection({ tenant, canManage, save, savingKey, savedKey }: Ctx) {
  const [color, setColor] = useState(tenant?.brandColor ?? '#7C3AED')
  const [description, setDescription] = useState(tenant?.description ?? '')

  return (
    <>
      <SectionHeader title="Marca y apariencia" subtitle="Estos elementos aparecen en tu lista pública. El logo se configura en «Información de la empresa»." canManage={canManage}
        onSave={() => save({ brandColor: color, description: description.trim() || null }, 'brand')} saving={savingKey === 'brand'} saved={savedKey === 'brand'} />

      <Field label="Color de marca">
        <div className="flex items-center gap-2.5">
          {BRAND_SWATCHES.map((c) => (
            <button key={c} type="button" disabled={!canManage} onClick={() => setColor(c)} title={c}
              className={`h-8 w-8 shrink-0 rounded-full transition ${color.toUpperCase() === c ? 'ring-2 ring-offset-2 ring-offset-[var(--dash-surface)]' : ''}`}
              style={{ backgroundColor: c, boxShadow: color.toUpperCase() === c ? `0 0 0 2px ${c}` : undefined }} />
          ))}
          <span className="mx-1 h-6 w-px bg-[var(--dash-border)]" />
          <input type="color" value={color} disabled={!canManage} onChange={(e) => setColor(e.target.value.toUpperCase())} className="h-8 w-10 cursor-pointer rounded border border-[var(--dash-border)] bg-transparent disabled:opacity-60" />
          <input value={color} disabled={!canManage} onChange={(e) => setColor(e.target.value.toUpperCase())} className={`${inputCls} h-8 w-28 font-mono`} />
        </div>
      </Field>

      <Field label="Descripción del negocio"><textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={!canManage} rows={3} placeholder="Contale a tus clientes qué vendés…" className={`${inputCls} h-auto py-2.5`} /></Field>

      {/* Live preview */}
      <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">Vista previa</p>
        <div className="flex items-center gap-3">
          {tenant?.logoUrl ? <img src={tenant.logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain" /> : <span className="h-10 w-10 rounded-lg" style={{ backgroundColor: color }} />}
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-[var(--dash-text)]">{tenant?.name || 'Tu negocio'}</span>
            <span className="text-xs font-medium" style={{ color }}>{description || 'Catálogo público'}</span>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── 2. Notifications (in-app, per-user preferences) ─────────────────── */
const NOTIF_ROWS: { key: keyof NotifPrefs; label: string; desc: string }[] = [
  { key: 'sales', label: 'Ventas', desc: 'Cuando se registra una compra.' },
  { key: 'catalog', label: 'Catálogo', desc: 'Altas, bajas y publicaciones de productos y listas.' },
  { key: 'customers', label: 'Clientes', desc: 'Cuando se agrega un cliente nuevo.' },
  { key: 'team', label: 'Equipo', desc: 'Invitaciones y cambios de rol.' },
]

function NotificationsSection({ tenantId }: { tenantId?: string }) {
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null)

  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    api.getNotifications(tenantId).then((res) => { if (!cancelled && res.data) setPrefs(res.data.prefs) })
    return () => { cancelled = true }
  }, [tenantId])

  const toggle = (key: keyof NotifPrefs) => {
    if (!prefs || !tenantId) return
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    void api.updateNotifPrefs(tenantId, { [key]: next[key] })
  }

  return (
    <>
      <SectionHeader title="Notificaciones" subtitle="Elegí qué te avisa la campana de la barra superior." canManage={false} />
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
        <Icon name="bell" size={15} /> Las notificaciones aparecen dentro de la app (campana arriba a la derecha). El envío por email llegará más adelante.
      </div>
      <div className="flex flex-col divide-y divide-[var(--dash-divider)] rounded-2xl border border-[var(--dash-border)]">
        {NOTIF_ROWS.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="flex flex-col"><span className="text-[13px] font-bold text-[var(--dash-text)]">{r.label}</span><span className="text-[11px] font-medium text-[var(--dash-muted)]">{r.desc}</span></div>
            <Toggle on={prefs?.[r.key] ?? true} disabled={!prefs} onClick={() => toggle(r.key)} />
          </div>
        ))}
      </div>
    </>
  )
}

function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${on ? gradient : 'bg-[var(--dash-border)]'} ${disabled ? 'opacity-50' : ''}`}
    >
      <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  )
}

/* ── 3. Region ───────────────────────────────────────────────────────── */
function RegionSection({ tenant, canManage, save, savingKey, savedKey }: Ctx) {
  const [currency, setCurrency] = useState(tenant?.currency ?? 'UYU')
  const [language, setLanguage] = useState(tenant?.language ?? 'es')
  const [timezone, setTimezone] = useState(tenant?.timezone ?? 'America/Montevideo')

  return (
    <>
      <SectionHeader title="Idioma y región" subtitle="Moneda, idioma y zona horaria de tu cuenta." canManage={canManage}
        onSave={() => save({ currency, language, timezone }, 'region')} saving={savingKey === 'region'} saved={savedKey === 'region'} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Moneda">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={!canManage} className={inputCls}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Idioma">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={!canManage} className={inputCls}>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </Field>
        <Field label="Zona horaria">
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} disabled={!canManage} className={inputCls}>
            {TIMEZONES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </Field>
      </div>
    </>
  )
}

/* ── 4. Security ─────────────────────────────────────────────────────── */
function SecuritySection({ user, onLogout }: { user: { email: string; role: Role; name: string } | null; onLogout: () => void }) {
  return (
    <>
      <SectionHeader title="Seguridad" subtitle="Tu acceso a la cuenta." canManage={false} />
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
        <Icon name="circle-check" size={15} className="text-[var(--tone-green-fg)]" /> Tu cuenta usa acceso sin contraseña: ingresás con un código que enviamos a tu email.
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--dash-border)] p-4">
        <Row label="Email de acceso" value={user?.email ?? '—'} />
        <Row label="Rol" value={user ? ROLE_LABEL[user.role] : '—'} />
      </div>
      <div>
        <button type="button" onClick={onLogout} className="flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold" style={tone('red')}>
          <Icon name="log-out" size={16} /> Cerrar sesión
        </button>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">{label}</span>
      <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{value}</span>
    </div>
  )
}

/* ── 5. Billing (honest shell) ───────────────────────────────────────── */
function BillingSection({ tenant }: { tenant: Tenant | null }) {
  const features = ['Productos y listas ilimitadas', 'Códigos QR y links públicos', 'Clientes y reportes', 'Equipo con roles y permisos']
  return (
    <>
      <SectionHeader title="Plan y facturación" subtitle="Tu plan actual y facturación." canManage={false} />
      <div className={`flex items-center justify-between gap-4 rounded-2xl p-5 text-white ${gradient}`}>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Plan actual</span>
          <span className="text-2xl font-extrabold">Gratis</span>
          <span className="text-sm font-medium text-white/80">{tenant?.name || 'Tu cuenta'}</span>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">Activo</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {features.map((f) => (
          <div key={f} className="flex items-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--dash-text2)]">
            <Icon name="circle-check" size={15} className="text-[var(--tone-green-fg)]" /> {f}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
        <Icon name="tags" size={15} /> Los planes pagos y la facturación llegarán pronto.
      </div>
    </>
  )
}

/* ── 6. Tax data (OCULTA) ────────────────────────────────────────────────
   Pestaña «Datos fiscales» deshabilitada. Para reactivarla:
   1) descomentá su entrada en el array `sections`,
   2) descomentá el bloque `{active === 'tax' && <TaxSection {...ctx} />}`,
   3) descomentá esta función.
   Los campos legalName/taxId/address ya existen en el backend (Tenant).

function TaxSection({ tenant, canManage, save, savingKey, savedKey }: Ctx) {
  const [legalName, setLegalName] = useState(tenant?.legalName ?? '')
  const [taxId, setTaxId] = useState(tenant?.taxId ?? '')
  const [address, setAddress] = useState(tenant?.address ?? '')

  return (
    <>
      <SectionHeader title="Datos fiscales" subtitle="Para tus comprobantes y documentos." canManage={canManage}
        onSave={() => save({ legalName: legalName.trim() || null, taxId: taxId.trim() || null, address: address.trim() || null }, 'tax')} saving={savingKey === 'tax'} saved={savedKey === 'tax'} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Razón social"><input value={legalName} onChange={(e) => setLegalName(e.target.value)} disabled={!canManage} placeholder="Mi Negocio S.R.L." className={inputCls} /></Field>
        <Field label="RUT / Identificación fiscal"><input value={taxId} onChange={(e) => setTaxId(e.target.value)} disabled={!canManage} placeholder="21 123456 0017" className={inputCls} /></Field>
      </div>
      <Field label="Dirección fiscal"><textarea value={address} onChange={(e) => setAddress(e.target.value)} disabled={!canManage} rows={2} placeholder="Calle, número, ciudad…" className={`${inputCls} h-auto py-2.5`} /></Field>
    </>
  )
}
*/

/* ── 7. Delete account ───────────────────────────────────────────────── */
function DeleteSection({ tenant, isOwner }: { tenant: Tenant | null; isOwner: boolean }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const keyword = tenant?.subdomain || 'eliminar'

  const remove = async () => {
    if (!tenant?.id || confirmText.trim().toLowerCase() !== keyword.toLowerCase()) return
    setDeleting(true); setError(null)
    const res = await api.deleteTenant(tenant.id)
    if (res.error) { setError(res.error); setDeleting(false); return }
    await dispatch(logout())
    navigate('/', { replace: true })
  }

  if (!isOwner) {
    return (
      <>
        <SectionHeader title="Eliminar cuenta" subtitle="Acción permanente." canManage={false} />
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
          <Icon name="alert-triangle" size={15} /> Solo el dueño de la cuenta puede eliminarla.
        </div>
      </>
    )
  }

  return (
    <>
      <SectionHeader title="Eliminar cuenta" subtitle="Acción permanente e irreversible." canManage={false} />
      <div className="flex flex-col gap-4 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-5">
        <div className="flex items-start gap-3">
          <Icon name="alert-triangle" size={20} className="mt-0.5 shrink-0 text-[#B91C1C]" />
          <p className="text-sm font-semibold text-[#B91C1C]">Se eliminará tu cuenta «{tenant?.name}» con todos sus productos, listas, clientes, ventas y miembros del equipo. Esta acción no se puede deshacer.</p>
        </div>
        {error && <p className="text-xs font-bold text-[#B91C1C]">{error}</p>}
        <Field label={`Escribí «${keyword}» para confirmar`}>
          <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className={inputCls} placeholder={keyword} />
        </Field>
        <button
          type="button"
          onClick={remove}
          disabled={deleting || confirmText.trim().toLowerCase() !== keyword.toLowerCase()}
          className="flex h-11 w-fit items-center gap-2 rounded-xl bg-[#EF4444] px-5 text-sm font-bold text-white hover:bg-[#DC2626] disabled:opacity-50"
        >
          <Icon name="circle-x" size={16} /> {deleting ? 'Eliminando…' : 'Eliminar mi cuenta'}
        </button>
      </div>
    </>
  )
}

export default SettingsCrmScreen
