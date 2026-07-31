import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant, setTenant, selectUser, selectIsAdmin, selectIsOwner, logout, updateCurrentUser } from '../../store/slices/authSlice'
import type { AdminUiMode, Tenant, Role, NotifPrefs, PlanId, PlanInfo, PriceList } from '../../types'
import api from '../../services/api'
import { useT, localeOf, type TFn } from '../../lib/i18n'
import { PLANS, planById } from '../../lib/plans'
import { getPushStatus, enablePush, disablePush, type PushStatus } from '../../lib/push'
import { fileToDataUrl } from '../../lib/image'
import { ListAppearanceFields, Toggle, hasOwnAppearance, BRAND_SWATCHES, type ListAppearance } from '../../components/appearance/ListAppearanceFields'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { gradient, tone } from './crm/theme'

const sections: { key: string; tKey: string; icon: IconName; danger?: boolean }[] = [
  { key: 'info', tKey: 'set.sec.info', icon: 'package' },
  { key: 'brand', tKey: 'set.sec.brand', icon: 'paintbrush' },
  { key: 'notifications', tKey: 'set.sec.notifications', icon: 'bell' },
  { key: 'region', tKey: 'set.sec.region', icon: 'settings' },
  { key: 'security', tKey: 'set.sec.security', icon: 'user' },
  { key: 'billing', tKey: 'set.sec.billing', icon: 'tags' },
  // Datos fiscales: oculta por ahora. Para reactivar, descomentá esta línea y el
  // bloque `{active === 'tax' && <TaxSection .../>}` más abajo.
  // { key: 'tax', tKey: 'set.sec.tax', icon: 'file-spreadsheet' },
  { key: 'delete', tKey: 'set.sec.delete', icon: 'circle-x', danger: true },
]

const inputCls = 'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)] disabled:opacity-60'

const CURRENCIES = ['UYU', 'ARS', 'USD', 'BRL', 'CLP', 'PYG', 'PEN', 'MXN']
const LANGUAGES: { code: string; label: string }[] = [
  { code: 'es', label: 'Español' }, { code: 'en', label: 'English' }, { code: 'pt', label: 'Português' },
]
const TIMEZONES = [
  'America/Montevideo', 'America/Argentina/Buenos_Aires', 'America/Santiago', 'America/Sao_Paulo',
  'America/Asuncion', 'America/Lima', 'America/Mexico_City', 'America/Bogota', 'UTC',
]

export function SettingsCrmScreen() {
  const t = useT()

  return (
    <CrmLayout active="Configuración" title={t('nav.settings')} subtitle={t('set.subtitle')} searchPlaceholder={t('common.search')}>
      <SettingsCrmContent />
    </CrmLayout>
  )
}

export function SettingsCrmContent({ simple = false }: { simple?: boolean }) {
  const dispatch = useAppDispatch()
  const t = useT()
  const tenant = useAppSelector(selectTenant)
  const user = useAppSelector(selectUser)
  const canManage = useAppSelector(selectIsAdmin)
  const isOwner = useAppSelector(selectIsOwner)
  const [searchParams] = useSearchParams()
  // Allow deep-linking a section, e.g. the sidebar upsell opens billing (?section=billing).
  const [active, setActive] = useState(() => {
    const s = searchParams.get('section')
    return sections.some((x) => x.key === s) ? s! : sections[0].key
  })
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

  const ctx = { tenant, canManage, save, savingKey, savedKey, t }

  return (
      <div className={simple ? 'flex w-full flex-col gap-4 md:flex-row md:gap-6' : 'flex flex-col gap-6 p-4 md:p-8 xl:min-w-[900px] lg:flex-row'}>
        {/* Sub-nav */}
        <div className={simple ? 'flex w-full shrink-0 flex-col gap-1 self-start rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 shadow-[0_18px_50px_-22px_rgba(30,27,75,0.18)] md:w-[240px]' : 'flex w-full shrink-0 lg:w-[240px] flex-col gap-1 self-start rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 shadow-[0_18px_50px_-22px_rgba(30,27,75,0.18)]'}>
          {sections.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(s.key)}
              className={`flex h-10 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 text-left text-[13px] font-semibold ${s.key === active ? `text-white ${gradient}` : s.danger ? 'text-[#EF4444] hover:bg-[var(--dash-soft)]' : 'text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'}`}
            >
              <Icon name={s.icon} size={16} /> {t(s.tKey)}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className={simple ? 'flex min-w-0 flex-1 flex-col gap-5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)] sm:p-7' : 'flex flex-1 flex-col gap-5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-7 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]'}>
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--tone-red-fg)]/40 bg-[var(--tone-red-bg)] px-4 py-3 text-sm font-semibold text-[var(--tone-red-fg)]">
              <Icon name="alert-triangle" size={16} /> {error}
            </div>
          )}
          {!canManage && active !== 'security' && active !== 'delete' && active !== 'notifications' && (
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
              <Icon name="alert-triangle" size={15} /> {t('set.onlyAdmins')}
            </div>
          )}

          {active === 'info' && <InfoSection {...ctx} />}
          {active === 'brand' && <BrandSection {...ctx} />}
          {active === 'notifications' && <NotificationsSection t={t} tenantId={tenant?.id} />}
          {active === 'region' && <RegionSection {...ctx} />}
          {active === 'security' && <SecuritySection t={t} user={user} onUiModeChange={(adminUiMode) => dispatch(updateCurrentUser({ adminUiMode }))} onLogout={() => dispatch(logout())} />}
          {active === 'billing' && <BillingSection t={t} tenant={tenant} isOwner={isOwner} />}
          {/* Datos fiscales: oculta por ahora (ver array `sections`). Para reactivar, descomentá: */}
          {/* {active === 'tax' && <TaxSection {...ctx} />} */}
          {active === 'delete' && <DeleteSection t={t} tenant={tenant} isOwner={isOwner} />}
        </div>
      </div>
  )
}

/* ── Shared shells ───────────────────────────────────────────────────── */
type Ctx = {
  tenant: Tenant | null
  canManage: boolean
  save: (patch: Parameters<typeof api.updateTenant>[1], key: string) => Promise<void>
  savingKey: string | null
  savedKey: string | null
  t: TFn
}

function SectionHeader({ t, title, subtitle, onSave, saving, saved, canManage, autosave }: { t: TFn; title: string; subtitle: string; onSave?: () => void; saving?: boolean; saved?: boolean; canManage: boolean; autosave?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <h3 className="text-[20px] font-extrabold text-[var(--dash-text)]">{title}</h3>
        <p className="text-xs font-medium text-[var(--dash-muted)]">{subtitle}</p>
      </div>
      {/* Autosaved sections show status instead of a save button. */}
      {autosave && canManage && (saving || saved) && (
        <span className={`shrink-0 text-xs font-bold ${saving ? 'text-[var(--dash-muted)]' : 'text-[var(--tone-green-fg)]'}`}>
          {saving ? t('common.saving') : t('common.saved')}
        </span>
      )}
      {onSave && canManage && (
        <button type="button" onClick={onSave} disabled={saving} className={`flex h-10 items-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}>
          {saving ? t('common.saving') : saved ? t('common.saved') : t('common.save')}
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
function InfoSection({ t, tenant, canManage, save, savingKey, savedKey }: Ctx) {
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
      <SectionHeader t={t} title={t('set.sec.info')} subtitle={t('set.info.subtitle')} canManage={canManage}
        onSave={() => save({ name: name.trim(), subdomain: subdomain.trim(), taxId: taxId.trim() || null, logoUrl: logo }, 'info')} saving={savingKey === 'info'} saved={savedKey === 'info'} />

      <Field label={t('set.info.logo')}>
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--dash-border)]" style={logo ? undefined : tone('violet')}>
            {logo ? <img src={logo} alt="logo" className="h-full w-full object-contain" /> : <Icon name="package" size={28} />}
          </span>
          {canManage && (
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickLogo(e.target.files?.[0])} />
              <button type="button" onClick={() => fileRef.current?.click()} className="flex h-9 items-center gap-2 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"><Icon name="upload" size={15} /> {logo ? t('set.info.changeLogo') : t('set.info.uploadLogo')}</button>
              {logo && <button type="button" onClick={() => setLogo(null)} className="text-[13px] font-bold text-[#EF4444] hover:underline">{t('common.remove')}</button>}
            </div>
          )}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('set.info.name')}><input value={name} onChange={(e) => setName(e.target.value)} disabled={!canManage} className={inputCls} /></Field>
        <Field label={t('set.info.subdomain')}><input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} disabled={!canManage} className={inputCls} /></Field>
        <Field label={t('set.info.taxId')}><input value={taxId} onChange={(e) => setTaxId(e.target.value)} disabled={!canManage} placeholder="21 123456 0017" className={inputCls} /></Field>
      </div>

      <Field label={t('set.info.publicUrl')}>
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
function BrandSection({ t, tenant, canManage, save, savingKey, savedKey }: Ctx) {
  const [color, setColor] = useState(tenant?.brandColor ?? '#7C3AED')
  const [description, setDescription] = useState(tenant?.description ?? '')

  // Which list the appearance controls below are editing. '' = the tenant-wide
  // defaults, any other value = that list's own overrides.
  const [targetId, setTargetId] = useState('')
  const [lists, setLists] = useState<PriceList[]>([])
  const [appearance, setAppearance] = useState<ListAppearance>(() => tenantAppearance(tenant))
  const [listSaving, setListSaving] = useState(false)
  const [listSaved, setListSaved] = useState(false)
  // Only persist appearance the user actually touched — switching target also
  // replaces `appearance`, and that must not write anything back.
  const touched = useRef(false)

  const tenantDefaults = tenantAppearance(tenant)
  const editingTenant = targetId === ''

  useEffect(() => {
    if (!tenant?.id) return
    let cancelled = false
    api.getLists(tenant.id).then((res) => { if (!cancelled && res.data) setLists(res.data) })
    return () => { cancelled = true }
  }, [tenant?.id])

  // Autosave brand colour + description (tenant-level, always). Gated on an
  // explicit "the user touched this" flag rather than a first-render skip: in
  // dev, StrictMode remounts the effect and a skip flag would let a save
  // through that nobody asked for.
  const saveRef = useRef(save)
  saveRef.current = save
  const touchedBrand = useRef(false)
  useEffect(() => {
    if (!canManage || !touchedBrand.current) return
    const id = setTimeout(() => {
      touchedBrand.current = false
      void saveRef.current({ brandColor: color, description: description.trim() || null }, 'brand')
    }, 500)
    return () => clearTimeout(id)
  }, [color, description, canManage])

  const changeColor = (c: string) => { touchedBrand.current = true; setColor(c) }
  const changeDescription = (d: string) => { touchedBrand.current = true; setDescription(d) }

  // Autosave the appearance block, to the tenant or to the selected list.
  useEffect(() => {
    if (!canManage || !touched.current) return
    const timer = setTimeout(async () => {
      touched.current = false
      if (editingTenant) {
        await saveRef.current({
          listDesign: appearance.design,
          listHeroColor: appearance.heroColor,
          listBgUrl: appearance.bgUrl,
          listBgOverlay: appearance.bgOverlay ?? false,
        }, 'brand')
        return
      }
      setListSaving(true)
      const res = await api.updateList(targetId, appearance)
      setListSaving(false)
      if (res.data) {
        setLists((prev) => prev.map((l) => (l.id === res.data.id ? res.data : l)))
        setListSaved(true)
        setTimeout(() => setListSaved(false), 2000)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [appearance, canManage, editingTenant, targetId])

  const pickTarget = (id: string) => {
    touched.current = false
    setTargetId(id)
    const list = lists.find((l) => l.id === id)
    setAppearance(id === '' ? tenantAppearance(tenant) : listAppearance(list))
  }

  const changeAppearance = (patch: Partial<ListAppearance>) => {
    touched.current = true
    setAppearance((a) => ({ ...a, ...patch }))
  }

  return (
    <>
      <SectionHeader t={t} title={t('set.sec.brand')} subtitle={t('set.brand.subtitle')} canManage={canManage}
        autosave saving={savingKey === 'brand' || listSaving} saved={savedKey === 'brand' || listSaved} />

      <Field label={t('set.brand.color')}>
        <span className="-mt-1 block text-[11px] font-medium leading-snug text-[var(--dash-muted)]">{t('set.brand.colorSub')}</span>
        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
          {BRAND_SWATCHES.map((c) => (
            <button key={c} type="button" disabled={!canManage} onClick={() => changeColor(c)} title={c}
              className={`h-8 w-8 shrink-0 rounded-full transition ${color.toUpperCase() === c ? 'ring-2 ring-offset-2 ring-offset-[var(--dash-surface)]' : ''}`}
              style={{ backgroundColor: c, boxShadow: color.toUpperCase() === c ? `0 0 0 2px ${c}` : undefined }} />
          ))}
          <span className="mx-1 h-6 w-px bg-[var(--dash-border)]" />
          <input type="color" value={color} disabled={!canManage} onChange={(e) => changeColor(e.target.value.toUpperCase())} className="h-8 w-10 cursor-pointer rounded border border-[var(--dash-border)] bg-transparent disabled:opacity-60" />
          <input value={color} disabled={!canManage} onChange={(e) => changeColor(e.target.value.toUpperCase())} className={`${inputCls} h-8 w-28 font-mono`} />
        </div>
      </Field>

      <Field label={t('set.brand.desc')}><textarea value={description} onChange={(e) => changeDescription(e.target.value)} disabled={!canManage} rows={3} placeholder={t('set.brand.descPlaceholder')} className={`${inputCls} h-auto py-2.5`} /></Field>

      {/* Live preview */}
      <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">{t('set.brand.preview')}</p>
        <div className="flex items-center gap-3">
          {tenant?.logoUrl ? <img src={tenant.logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain" /> : <span className="h-10 w-10 rounded-lg" style={{ backgroundColor: color }} />}
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-[var(--dash-text)]">{tenant?.name || t('set.brand.previewBiz')}</span>
            <span className="text-xs font-medium" style={{ color }}>{description || t('set.brand.previewCat')}</span>
          </div>
        </div>
      </div>

      {/* Which list the appearance below applies to. */}
      <Field label={t('list.appearance.applyTo')}>
        <select value={targetId} disabled={!canManage} onChange={(e) => pickTarget(e.target.value)} className={inputCls}>
          <option value="">{t('list.appearance.tenantDefault')}</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}{hasOwnAppearance(l) ? ` · ${t('list.appearance.custom')}` : ''}
            </option>
          ))}
        </select>
      </Field>

      <ListAppearanceFields
        t={t}
        value={appearance}
        onChange={changeAppearance}
        accent={color}
        inherited={editingTenant ? undefined : tenantDefaults}
        disabled={!canManage}
      />
    </>
  )
}

/** The tenant-wide defaults, in the shape the shared appearance editor uses. */
function tenantAppearance(tenant: Tenant | null): ListAppearance {
  return {
    design: tenant?.listDesign ?? 'store',
    heroColor: tenant?.listHeroColor ?? null,
    bgUrl: tenant?.listBgUrl ?? null,
    bgOverlay: tenant?.listBgOverlay ?? false,
  }
}

function listAppearance(list?: PriceList): ListAppearance {
  return {
    design: list?.design ?? null,
    heroColor: list?.heroColor ?? null,
    bgUrl: list?.bgUrl ?? null,
    bgOverlay: list?.bgOverlay ?? null,
  }
}

/* ── 2. Notifications (in-app, per-user preferences) ─────────────────── */
const NOTIF_ROWS: { key: keyof NotifPrefs; tKey: string; descKey: string }[] = [
  { key: 'sales', tKey: 'set.notif.sales', descKey: 'set.notif.salesDesc' },
  { key: 'catalog', tKey: 'set.notif.catalog', descKey: 'set.notif.catalogDesc' },
  { key: 'customers', tKey: 'set.notif.customers', descKey: 'set.notif.customersDesc' },
  { key: 'team', tKey: 'set.notif.team', descKey: 'set.notif.teamDesc' },
]

function NotificationsSection({ t, tenantId }: { t: TFn; tenantId?: string }) {
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
      <SectionHeader t={t} title={t('set.sec.notifications')} subtitle={t('set.notif.subtitle')} canManage={false} />
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
        <Icon name="bell" size={15} /> {t('set.notif.banner')}
      </div>
      <DeviceNotifications t={t} tenantId={tenantId} />
      <div className="flex flex-col divide-y divide-[var(--dash-divider)] rounded-2xl border border-[var(--dash-border)]">
        {NOTIF_ROWS.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="flex flex-col"><span className="text-[13px] font-bold text-[var(--dash-text)]">{t(r.tKey)}</span><span className="text-[11px] font-medium text-[var(--dash-muted)]">{t(r.descKey)}</span></div>
            <Toggle on={prefs?.[r.key] ?? true} disabled={!prefs} onClick={() => toggle(r.key)} />
          </div>
        ))}
      </div>
    </>
  )
}

/** Per-device Web Push opt-in: enables desktop + mobile (installed PWA) alerts. */
function DeviceNotifications({ t, tenantId }: { t: TFn; tenantId?: string }) {
  const [status, setStatus] = useState<PushStatus>('default')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    getPushStatus().then((s) => { if (!cancelled) setStatus(s) })
    return () => { cancelled = true }
  }, [])

  const toggle = async () => {
    if (!tenantId || busy) return
    setBusy(true)
    try {
      setStatus(status === 'subscribed' ? await disablePush(tenantId) : await enablePush(tenantId))
    } finally {
      setBusy(false)
    }
  }

  const isOn = status === 'subscribed'
  const note =
    status === 'unsupported' ? t('set.notif.unsupported')
      : status === 'denied' ? t('set.notif.denied')
        : isOn ? t('set.notif.active')
          : t('set.notif.deviceDesc')
  const disabled = busy || status === 'unsupported' || status === 'denied'

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--dash-border)] px-4 py-3.5">
      <div className="flex min-w-0 flex-col">
        <span className="text-[13px] font-bold text-[var(--dash-text)]">{t('set.notif.deviceTitle')}</span>
        <span className="text-[11px] font-medium text-[var(--dash-muted)]">{note}</span>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={`shrink-0 rounded-xl px-3.5 py-2 text-[12px] font-bold text-white transition ${isOn ? 'bg-[var(--dash-border)] text-[var(--dash-text2)]' : gradient} ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90'}`}
      >
        {busy ? t('set.notif.enabling') : isOn ? t('set.notif.disable') : t('set.notif.enable')}
      </button>
    </div>
  )
}


/* ── 3. Region ───────────────────────────────────────────────────────── */
function RegionSection({ t, tenant, canManage, save, savingKey, savedKey }: Ctx) {
  const [currency, setCurrency] = useState(tenant?.currency ?? 'UYU')
  const [language, setLanguage] = useState(tenant?.language ?? 'es')
  const [timezone, setTimezone] = useState(tenant?.timezone ?? 'America/Montevideo')
  const [deliveryEnabled, setDeliveryEnabled] = useState(tenant?.deliveryEnabled ?? false)

  return (
    <>
      <SectionHeader t={t} title={t('set.sec.region')} subtitle={t('set.region.subtitle')} canManage={canManage}
        onSave={() => save({ currency, language, timezone, deliveryEnabled }, 'region')} saving={savingKey === 'region'} saved={savedKey === 'region'} />
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('set.region.currency')}>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={!canManage} className={inputCls}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label={t('set.region.language')}>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={!canManage} className={inputCls}>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </Field>
        <Field label={t('set.region.timezone')}>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} disabled={!canManage} className={inputCls}>
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
          </select>
        </Field>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[var(--dash-border)] p-4">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-bold text-[var(--dash-text)]">{t('set.region.delivery')}</span>
          <span className="text-[11px] font-medium text-[var(--dash-muted)]">{t('set.region.deliverySub')}</span>
        </div>
        <Toggle on={deliveryEnabled} disabled={!canManage} onClick={() => setDeliveryEnabled((v) => !v)} />
      </div>
    </>
  )
}

/* ── 4. Security ─────────────────────────────────────────────────────── */
function SecuritySection({ t, user, onUiModeChange, onLogout }: { t: TFn; user: { email: string; role: Role; name: string; simpleAdminUi?: boolean; adminUiMode?: AdminUiMode } | null; onUiModeChange: (adminUiMode: AdminUiMode) => void; onLogout: () => void }) {
  const mode = user?.adminUiMode ?? (user?.simpleAdminUi ? 'simple' : 'full')
  return (
    <>
      <SectionHeader t={t} title={t('set.sec.security')} subtitle={t('set.security.subtitle')} canManage={false} />
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
        <Icon name="circle-check" size={15} className="text-[var(--tone-green-fg)]" /> {t('set.security.passwordless')}
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--dash-border)] p-4">
        <Row label={t('set.security.email')} value={user?.email ?? '—'} />
        <Row label={t('set.security.role')} value={user ? t(`role.${user.role}`) : '—'} />
      </div>
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--dash-border)] p-4">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-bold text-[var(--dash-text)]">Modo de administración</span>
          <span className="text-[11px] font-medium text-[var(--dash-muted)]">Simple, medio o completo según el nivel de detalle que quieras ver.</span>
        </div>
        <select value={mode} disabled={!user} onChange={(e) => onUiModeChange(e.target.value as AdminUiMode)} className="h-10 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-[13px] font-bold text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]">
          <option value="simple">Simple</option>
          <option value="medium">Medio</option>
          <option value="full">Completo</option>
        </select>
      </div>
      <div>
        <button type="button" onClick={onLogout} className="flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold" style={tone('red')}>
          <Icon name="log-out" size={16} /> {t('set.security.logout')}
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

/** Current subscription: state, dates, card, and the cancel / resume actions.
 *  Hidden for accounts that never subscribed — there is nothing to manage. */
function SubscriptionPanel({ t, info, isOwner, tenantId, onChanged }: {
  t: TFn; info: PlanInfo | null; isOwner: boolean; tenantId?: string; onChanged: () => Promise<void>
}) {
  const dispatch = useAppDispatch()
  const lang = useAppSelector(selectTenant)?.language
  const [busy, setBusy] = useState<'cancel' | 'resume' | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const billing = info?.billing
  const status = billing?.status ?? null
  // Nothing was ever subscribed: the plan cards below are the whole story.
  if (!status || info?.plan === 'free') return null

  const cancelled = status === 'cancelled'
  const endsAt = billing?.endsAt
  const renewsAt = billing?.renewsAt
  const trialEndsAt = billing?.trialEndsAt
  const planName = planById(info!.plan).name

  const fmtDate = (iso?: string | null) => {
    if (!iso) return null
    const d = new Date(iso)
    return isNaN(d.getTime()) ? null : d.toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const act = async (kind: 'cancel' | 'resume') => {
    if (!tenantId) return
    setBusy(kind); setError(null)
    const res = kind === 'cancel' ? await api.cancelSubscription(tenantId) : await api.resumeSubscription(tenantId)
    setBusy(null)
    if (res.error) { setError(res.error); return }
    setConfirming(false)
    if (res.data) dispatch(setTenant(res.data))
    await onChanged()
  }

  const toneOf = (): 'green' | 'amber' | 'red' | 'violet' => {
    if (status === 'active' || status === 'paid') return 'green'
    if (status === 'on_trial') return 'violet'
    if (status === 'cancelled' || status === 'paused') return 'amber'
    return 'red'
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--dash-border)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-extrabold text-[var(--dash-text)]">{t('bill.sub.title')}</span>
          <span className="text-[12px] font-medium text-[var(--dash-muted)]">{t('bill.sub.plan', { plan: planName })}</span>
        </div>
        <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide" style={tone(toneOf())}>
          {t(`billingStatus.${status}`)}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-[var(--dash-divider)] pt-3 text-[12px]">
        {status === 'on_trial' && fmtDate(trialEndsAt) && (
          <SubRow label={t('bill.sub.trialEnds')} value={fmtDate(trialEndsAt)!} />
        )}
        {cancelled && fmtDate(endsAt) && (
          <SubRow label={t('bill.sub.accessUntil')} value={fmtDate(endsAt)!} highlight />
        )}
        {!cancelled && fmtDate(renewsAt) && (
          <SubRow label={t('bill.sub.renews')} value={fmtDate(renewsAt)!} />
        )}
        {billing?.cardBrand && billing?.cardLastFour && (
          <SubRow label={t('bill.sub.card')} value={`${billing.cardBrand.toUpperCase()} ···· ${billing.cardLastFour}`} />
        )}
      </div>

      {cancelled && (
        <p className="rounded-xl bg-[var(--tone-amber-bg)] px-3.5 py-2.5 text-[12px] font-semibold text-[var(--tone-amber-fg)]">
          {t('bill.sub.cancelledNote')}
        </p>
      )}

      {error && (
        <p className="rounded-xl bg-[var(--tone-red-bg)] px-3.5 py-2.5 text-[12px] font-semibold text-[var(--tone-red-fg)]">{error}</p>
      )}

      {isOwner ? (
        <div className="flex flex-wrap items-center gap-2">
          {billing?.portalUrl && (
            <a href={billing.portalUrl} target="_blank" rel="noreferrer"
              className="flex h-10 items-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">
              <Icon name="tags" size={15} /> {t('bill.managePortal')}
            </a>
          )}
          {billing?.updatePaymentUrl && !cancelled && (
            <a href={billing.updatePaymentUrl} target="_blank" rel="noreferrer"
              className="flex h-10 items-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">
              <Icon name="tags" size={15} /> {t('bill.sub.updateCard')}
            </a>
          )}
          {cancelled ? (
            <button type="button" disabled={busy !== null} onClick={() => act('resume')}
              className={`flex h-10 items-center rounded-xl px-4 text-[13px] font-bold text-white disabled:opacity-60 ${gradient}`}>
              {busy === 'resume' ? t('bill.sub.resuming') : t('bill.sub.resume')}
            </button>
          ) : !confirming ? (
            <button type="button" onClick={() => { setConfirming(true); setError(null) }}
              className="flex h-10 items-center rounded-xl px-4 text-[13px] font-bold text-[#EF4444] hover:bg-[var(--tone-red-bg)]">
              {t('bill.sub.cancel')}
            </button>
          ) : (
            <div className="flex w-full flex-col gap-2 rounded-xl border border-[#EF4444]/40 bg-[var(--tone-red-bg)] p-3.5">
              <span className="text-[12px] font-semibold text-[var(--tone-red-fg)]">
                {t('bill.sub.confirm', { date: fmtDate(renewsAt) ?? fmtDate(endsAt) ?? '' })}
              </span>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={busy !== null} onClick={() => act('cancel')}
                  className="flex h-9 items-center rounded-xl bg-[#EF4444] px-4 text-[13px] font-bold text-white disabled:opacity-60">
                  {busy === 'cancel' ? t('bill.sub.cancelling') : t('bill.sub.confirmYes')}
                </button>
                <button type="button" disabled={busy !== null} onClick={() => setConfirming(false)}
                  className="flex h-9 items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 text-[13px] font-bold text-[var(--dash-text2)]">
                  {t('bill.sub.confirmNo')}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-[12px] font-semibold text-[var(--dash-muted)]">{t('bill.ownerOnly')}</p>
      )}
    </div>
  )
}

function SubRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-semibold text-[var(--dash-text2)]">{label}</span>
      <span className={`font-bold ${highlight ? 'text-[var(--tone-amber-fg)]' : 'text-[var(--dash-text)]'}`}>{value}</span>
    </div>
  )
}

/* ── 5. Billing — plans, usage and limit enforcement ── */
function BillingSection({ t, tenant, isOwner }: { t: TFn; tenant: Tenant | null; isOwner: boolean }) {
  const dispatch = useAppDispatch()
  const [info, setInfo] = useState<PlanInfo | null>(null)
  const [changing, setChanging] = useState<PlanId | null>(null)
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const tenantId = tenant?.id
  const pendingKey = tenantId ? `billing_pending_plan_${tenantId}` : null

  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    api.getPlan(tenantId).then((res) => { if (!cancelled && res.data) setInfo(res.data) })
    return () => { cancelled = true }
  }, [tenantId])

  useEffect(() => {
    if (!pendingKey) return
    const params = new URLSearchParams(window.location.search)
    const returnedPlan = params.get('checkout_plan') as PlanId | null
    if (returnedPlan && PLANS.some((plan) => plan.id === returnedPlan)) {
      sessionStorage.setItem(pendingKey, returnedPlan)
      setPendingPlan(returnedPlan)
      params.delete('checkout_plan')
      const qs = params.toString()
      window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
      return
    }
    const storedPlan = sessionStorage.getItem(pendingKey) as PlanId | null
    setPendingPlan(storedPlan && PLANS.some((plan) => plan.id === storedPlan) ? storedPlan : null)
  }, [pendingKey])

  const current = info?.plan ?? tenant?.plan ?? 'free'
  const visiblePlan = pendingPlan ?? current

  useEffect(() => {
    if (!pendingKey || !pendingPlan || current !== pendingPlan) return
    sessionStorage.removeItem(pendingKey)
    setPendingPlan(null)
  }, [current, pendingKey, pendingPlan])

  const choosePlan = async (plan: PlanId) => {
    if (!tenant?.id || plan === current) return
    setChanging(plan); setError(null)

    // No payment gateway: switch the plan immediately.
    if (!info?.billingEnabled) {
      const res = await api.updatePlan(tenant.id, plan)
      setChanging(null)
      if (res.data) {
        const refreshed = await api.getPlan(tenant.id)
        if (refreshed.data) setInfo(refreshed.data)
        // Keep the auth store's tenant in sync so the header plan badge (and any
        // other consumer) reflects the new plan without needing a re-login.
        dispatch(setTenant({ ...tenant, plan: refreshed.data?.plan ?? plan }))
      } else {
        setError(res.error || 'No se pudo cambiar el plan.')
      }
      return
    }

    // Billing enabled: open the Lemon Squeezy checkout.
    const redirectUrl = `${window.location.origin}/admin/settings?section=billing&checkout_plan=${plan}`
    const res = await api.createCheckout(tenant.id, plan, redirectUrl)
    setChanging(null)
    if (res.data?.url) {
      if (pendingKey) sessionStorage.setItem(pendingKey, plan)
      window.location.assign(res.data.url)
    }
    else setError(res.error || 'No se pudo abrir el checkout.')
  }

  const refresh = async () => {
    if (!tenantId) return
    const res = await api.getPlan(tenantId)
    if (res.data) setInfo(res.data)
  }

  const limitLabel = (n: number | null) => (n === null ? t('bill.unlimited') : String(n))

  return (
    <>
      <SectionHeader t={t} title={t('set.sec.billing')} subtitle={t('set.billing.subtitle')} canManage={false} />

      <SubscriptionPanel t={t} info={info} isOwner={isOwner} tenantId={tenantId} onChanged={refresh} />

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--tone-red-fg)]/40 bg-[var(--tone-red-bg)] px-4 py-3 text-sm font-semibold text-[var(--tone-red-fg)]">
          <Icon name="alert-triangle" size={16} /> {error}
        </div>
      )}

      {pendingPlan && current !== pendingPlan && (
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-sm font-semibold text-[var(--dash-text2)]">
          <Icon name="tags" size={16} /> {t('bill.pending', { plan: planById(pendingPlan).name })}
        </div>
      )}

      {/* Usage of the current plan */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--dash-border)] p-4">
        <span className="text-[13px] font-extrabold text-[var(--dash-text)]">{t('bill.usageTitle')}</span>
        {info && ([['products', 'bill.products'], ['lists', 'bill.lists'], ['members', 'bill.members']] as const).map(([key, lbl]) => {
          const used = info.usage[key]
          // Limit comes from the advertised plan content so the bars match the cards.
          const limit = planById(visiblePlan).limits[key]
          const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0
          const full = limit !== null && used >= limit
          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[var(--dash-text2)]">{t(lbl)}</span>
                <span className={`font-bold ${full ? 'text-[#EF4444]' : 'text-[var(--dash-muted)]'}`}>{used} / {limitLabel(limit)}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--dash-soft)]">
                <div className="h-full rounded-full" style={{ width: limit ? `${pct}%` : '100%', background: full ? '#EF4444' : 'var(--tone-violet-fg)', opacity: limit ? 1 : 0.35 }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Plan cards — same copy as the public landing (lib/plans). */}
      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === current
          const isPending = plan.id === pendingPlan && plan.id !== current
          return (
            <div key={plan.id} className={`flex flex-col gap-2.5 rounded-2xl border p-4 ${isCurrent || isPending ? 'border-[var(--dash-link)] bg-[var(--dash-soft)]' : 'border-[var(--dash-border)]'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-extrabold text-[var(--dash-text)]">{plan.name}</span>
                {plan.popular && <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={tone('violet')}>{t('bill.recommended')}</span>}
              </div>
              <p className="text-[11px] font-medium text-[var(--dash-muted)]">{plan.description}</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-[var(--dash-text)]">{plan.price}</span>
                <span className="pb-1 text-[11px] font-semibold text-[var(--dash-muted)]">{plan.cadence}</span>
              </div>
              <ul className="flex flex-col gap-1.5 border-t border-[var(--dash-divider)] pt-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[12px]">
                    <Icon name="circle-check" size={13} className="shrink-0 text-[var(--tone-green-fg)]" />
                    <span className="font-medium text-[var(--dash-text2)]">{f}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <span className="mt-auto flex h-9 items-center justify-center gap-1.5 rounded-xl text-[13px] font-bold" style={tone('violet')}><Icon name="circle-check" size={15} /> {t('bill.current')}</span>
              ) : isPending ? (
                <span className="mt-auto flex h-9 items-center justify-center gap-1.5 rounded-xl text-[13px] font-bold" style={tone('violet')}><Icon name="tags" size={15} /> {t('bill.pendingShort')}</span>
              ) : (
                <button type="button" disabled={!isOwner || changing !== null} onClick={() => choosePlan(plan.id)}
                  className={`mt-auto flex h-9 items-center justify-center rounded-xl text-[13px] font-bold text-white disabled:opacity-50 ${gradient}`}>
                  {changing === plan.id ? t('bill.changing') : t('bill.choose')}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {!isOwner && (
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
          <Icon name="alert-triangle" size={15} /> {t('bill.ownerOnly')}
        </div>
      )}
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
        <Icon name="tags" size={15} /> {t('bill.paymentNote')}
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
function DeleteSection({ t, tenant, isOwner }: { t: TFn; tenant: Tenant | null; isOwner: boolean }) {
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
        <SectionHeader t={t} title={t('set.sec.delete')} subtitle={t('set.delete.subtitle')} canManage={false} />
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
          <Icon name="alert-triangle" size={15} /> {t('set.delete.ownerOnly')}
        </div>
      </>
    )
  }

  return (
    <>
      <SectionHeader t={t} title={t('set.sec.delete')} subtitle={t('set.delete.subtitle')} canManage={false} />
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--tone-red-fg)]/40 bg-[var(--tone-red-bg)] p-5">
        <div className="flex items-start gap-3">
          <Icon name="alert-triangle" size={20} className="mt-0.5 shrink-0 text-[var(--tone-red-fg)]" />
          <p className="text-sm font-semibold text-[var(--tone-red-fg)]">{t('set.delete.warning', { name: tenant?.name || '' })}</p>
        </div>
        {error && <p className="text-xs font-bold text-[var(--tone-red-fg)]">{error}</p>}
        <Field label={t('set.delete.confirm', { keyword })}>
          <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className={inputCls} placeholder={keyword} />
        </Field>
        <button
          type="button"
          onClick={remove}
          disabled={deleting || confirmText.trim().toLowerCase() !== keyword.toLowerCase()}
          className="flex h-11 w-fit items-center gap-2 rounded-xl bg-[#EF4444] px-5 text-sm font-bold text-white hover:bg-[#DC2626] disabled:opacity-50"
        >
          <Icon name="circle-x" size={16} /> {deleting ? t('set.delete.deleting') : t('set.delete.button')}
        </button>
      </div>
    </>
  )
}

export default SettingsCrmScreen
