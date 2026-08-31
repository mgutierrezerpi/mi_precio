import { useEffect, useRef, useState } from 'react'
import type { Tenant, PriceList } from '../../types'
import api from '../../services/api'
import { type TFn } from '../../lib/i18n'
import { ListAppearanceFields } from '../../components/appearance/ListAppearanceFields'
import {
  BRAND_SWATCHES,
  hasOwnAppearance,
  type ListAppearance,
} from '../../lib/listAppearance'
import { Icon } from './crm/ui'
import { gradient, tone } from './crm/theme'

const inputCls =
  'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)] disabled:opacity-60'

type Ctx = {
  tenant: Tenant | null
  canManage: boolean
  save: (
    patch: Parameters<typeof api.updateTenant>[1],
    key: string
  ) => Promise<void>
  savingKey: string | null
  savedKey: string | null
  t: TFn
}

function SectionHeader({
  t,
  title,
  subtitle,
  onSave,
  saving,
  saved,
  canManage,
  autosave,
}: {
  t: TFn
  title: string
  subtitle: string
  onSave?: () => void
  saving?: boolean
  saved?: boolean
  canManage: boolean
  autosave?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <h3 className="text-[20px] font-extrabold text-[var(--dash-text)]">
          {title}
        </h3>
        <p className="text-xs font-medium text-[var(--dash-muted)]">
          {subtitle}
        </p>
      </div>
      {autosave && canManage && (saving || saved) && (
        <span
          className={`shrink-0 text-xs font-bold ${saving ? 'text-[var(--dash-muted)]' : 'text-[var(--tone-green-fg)]'}`}
        >
          {saving ? t('common.saving') : t('common.saved')}
        </span>
      )}
      {onSave && canManage && (
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={`flex h-10 items-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}
        >
          {saving
            ? t('common.saving')
            : saved
              ? t('common.saved')
              : t('common.save')}
        </button>
      )}
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">
        {label}
      </span>
      {children}
    </label>
  )
}

function markTouched(ref: { current: boolean }) {
  ref.current = true
}

export function InfoSection({
  t,
  tenant,
  canManage,
  save,
  savingKey,
  savedKey,
}: Ctx) {
  const { fields, setLogo, touch } = useInfoFields(tenant, canManage, save)
  const { name, subdomain, taxId, logo } = fields
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const publicUrl = `${window.location.origin}/p/${subdomain || ''}`

  const pickLogo = async (file?: File) => {
    if (!file || !tenant) return
    const response = await api.uploadTenantLogo(tenant.id, file)
    if (!response.data) return
    touch()
    setLogo(response.data.url)
  }
  const copyUrl = () => {
    navigator.clipboard?.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <SectionHeader
        t={t}
        title={t('set.sec.info')}
        subtitle={t('set.info.subtitle')}
        canManage={canManage}
        autosave
        saving={savingKey === 'info'}
        saved={savedKey === 'info'}
      />

      <InfoLogoField
        canManage={canManage}
        fileRef={fileRef}
        logo={logo}
        onPick={pickLogo}
        onRemove={() => {
          touch()
          setLogo(null)
        }}
        t={t}
      />
      <InfoDetailsFields
        canManage={canManage}
        name={name}
        onChange={touch}
        setName={(value) => fields.setName(value)}
        setSubdomain={(value) => fields.setSubdomain(value)}
        setTaxId={(value) => fields.setTaxId(value)}
        subdomain={subdomain}
        t={t}
        taxId={taxId}
      />
      <PublicUrlField copied={copied} onCopy={copyUrl} t={t} url={publicUrl} />
    </>
  )
}

function useInfoFields(
  tenant: Tenant | null,
  canManage: boolean,
  save: Ctx['save']
) {
  const [name, setName] = useState(tenant?.name ?? '')
  const [subdomain, setSubdomain] = useState(tenant?.subdomain ?? '')
  const [taxId, setTaxId] = useState(tenant?.taxId ?? '')
  const [logo, setLogo] = useState<string | null>(tenant?.logoUrl ?? null)
  const touched = useRef(false)
  const touch = () => markTouched(touched)

  useEffect(() => {
    if (!canManage || !touched.current) return
    const timer = setTimeout(() => {
      touched.current = false
      void save(
        {
          name: name.trim(),
          subdomain: subdomain.trim(),
          taxId: taxId.trim() || null,
          logoUrl: logo,
        },
        'info'
      )
    }, 500)
    return () => clearTimeout(timer)
  }, [name, subdomain, taxId, logo, canManage, save])

  return {
    fields: { name, subdomain, taxId, logo, setName, setSubdomain, setTaxId },
    setLogo,
    touch,
  }
}

function InfoLogoField({
  canManage,
  fileRef,
  logo,
  onPick,
  onRemove,
  t,
}: {
  canManage: boolean
  fileRef: React.RefObject<HTMLInputElement | null>
  logo: string | null
  onPick: (file?: File) => void
  onRemove: () => void
  t: TFn
}) {
  return (
    <Field label={t('set.info.logo')}>
      <div className="flex items-center gap-4">
        <LogoPreview logo={logo} />
        {canManage && (
          <LogoControls
            fileRef={fileRef}
            logo={logo}
            onPick={onPick}
            onRemove={onRemove}
            t={t}
          />
        )}
      </div>
    </Field>
  )
}

function LogoPreview({ logo }: { logo: string | null }) {
  return (
    <span
      className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--dash-border)]"
      style={logo ? undefined : tone('violet')}
    >
      {logo ? (
        <img src={logo} alt="logo" className="h-full w-full object-contain" />
      ) : (
        <Icon name="package" size={28} />
      )}
    </span>
  )
}

function LogoControls({
  fileRef,
  logo,
  onPick,
  onRemove,
  t,
}: {
  fileRef: React.RefObject<HTMLInputElement | null>
  logo: string | null
  onPick: (file?: File) => void
  onRemove: () => void
  t: TFn
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex h-9 items-center gap-2 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
      >
        <Icon name="upload" size={15} />{' '}
        {logo ? t('set.info.changeLogo') : t('set.info.uploadLogo')}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="text-[13px] font-bold text-[#EF4444] hover:underline"
      >
        {t('common.remove')}
      </button>
    </div>
  )
}

function InfoDetailsFields({
  canManage,
  name,
  onChange,
  setName,
  setSubdomain,
  setTaxId,
  subdomain,
  t,
  taxId,
}: {
  canManage: boolean
  name: string
  onChange: () => void
  setName: (value: string) => void
  setSubdomain: (value: string) => void
  setTaxId: (value: string) => void
  subdomain: string
  t: TFn
  taxId: string
}) {
  const fields = [
    [t('set.info.name'), name, setName, undefined],
    [t('set.info.subdomain'), subdomain, setSubdomain, undefined],
    [t('set.info.taxId'), taxId, setTaxId, '21 123456 0017'],
  ] as const
  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map(([label, value, setValue, placeholder]) => (
        <Field key={label} label={label}>
          <input
            value={value}
            onChange={(e) => {
              onChange()
              setValue(e.target.value)
            }}
            disabled={!canManage}
            placeholder={placeholder}
            className={inputCls}
          />
        </Field>
      ))}
    </div>
  )
}

function PublicUrlField({
  copied,
  onCopy,
  t,
  url,
}: {
  copied: boolean
  onCopy: () => void
  t: TFn
  url: string
}) {
  return (
    <Field label={t('set.info.publicUrl')}>
      <button
        type="button"
        onClick={onCopy}
        title="Copiar enlace"
        className="flex items-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 py-2.5 text-left transition hover:border-[var(--dash-link)]"
      >
        <Icon name="link-2" size={15} className="text-[var(--dash-link)]" />
        <span className="flex-1 truncate text-sm font-semibold text-[var(--dash-link)]">
          {url}
        </span>
        <Icon
          name={copied ? 'circle-check' : 'copy'}
          size={15}
          className="text-[var(--dash-link)]"
        />
      </button>
    </Field>
  )
}

/* ── 1. Brand ────────────────────────────────────────────────────────── */
export function BrandSection({
  t,
  tenant,
  canManage,
  save,
  savingKey,
  savedKey,
}: Ctx) {
  const identity = useBrandIdentity(tenant, canManage, save)
  const editor = useAppearanceEditor(tenant, canManage, save)

  return (
    <>
      <SectionHeader
        t={t}
        title={t('set.sec.brand')}
        subtitle={t('set.brand.subtitle')}
        canManage={canManage}
        autosave
        saving={savingKey === 'brand' || editor.saving}
        saved={savedKey === 'brand' || editor.saved}
      />
      <BrandIdentityFields {...identity} canManage={canManage} t={t} />
      <BrandPreview
        color={identity.color}
        description={identity.description}
        tenant={tenant}
        t={t}
      />
      <AppearanceFields
        {...editor}
        accent={identity.color}
        canManage={canManage}
        t={t}
      />
    </>
  )
}

function useBrandIdentity(
  tenant: Tenant | null,
  canManage: boolean,
  save: Ctx['save']
) {
  const [color, setColor] = useState(tenant?.brandColor ?? '#7C3AED')
  const [description, setDescription] = useState(tenant?.description ?? '')
  const touched = useRef(false)
  useEffect(() => {
    if (!canManage || !touched.current) return
    const timer = setTimeout(() => {
      touched.current = false
      void save(
        { brandColor: color, description: description.trim() || null },
        'brand'
      )
    }, 500)
    return () => clearTimeout(timer)
  }, [color, description, canManage, save])
  const changeColor = (value: string) => {
    markTouched(touched)
    setColor(value)
  }
  const changeDescription = (value: string) => {
    markTouched(touched)
    setDescription(value)
  }
  return { color, description, changeColor, changeDescription }
}

function useAppearanceEditor(
  tenant: Tenant | null,
  canManage: boolean,
  save: Ctx['save']
) {
  const [targetId, setTargetId] = useState('')
  const [lists, setLists] = useState<PriceList[]>([])
  const [appearance, setAppearance] = useState<ListAppearance>(() =>
    tenantAppearance(tenant)
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const touched = useRef(false)
  const editingTenant = targetId === ''
  const tenantDefaults = tenantAppearance(tenant)

  useEffect(() => {
    if (!tenant?.id) return
    let cancelled = false
    api.getLists(tenant.id).then((res) => {
      if (!cancelled && res.data) setLists(res.data)
    })
    return () => {
      cancelled = true
    }
  }, [tenant?.id])

  useEffect(() => {
    if (!canManage || !touched.current) return
    const timer = setTimeout(async () => {
      touched.current = false
      if (editingTenant) {
        await save(
          {
            listDesign: appearance.design,
            listHeroColor: appearance.heroColor,
            listBgUrl: appearance.bgUrl,
            listBgOverlay: appearance.bgOverlay ?? false,
          },
          'brand'
        )
        return
      }
      setSaving(true)
      const res = await api.updateList(targetId, appearance)
      setSaving(false)
      if (res.data) {
        setLists((previous) =>
          previous.map((list) => (list.id === res.data!.id ? res.data! : list))
        )
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [appearance, canManage, editingTenant, targetId, save])

  const pickTarget = (id: string) => {
    touched.current = false
    setTargetId(id)
    setAppearance(
      id === ''
        ? tenantAppearance(tenant)
        : listAppearance(lists.find((list) => list.id === id))
    )
  }
  const changeAppearance = (patch: Partial<ListAppearance>) => {
    markTouched(touched)
    setAppearance((current) => ({ ...current, ...patch }))
  }
  return {
    appearance,
    changeAppearance,
    editingTenant,
    lists,
    pickTarget,
    saved,
    saving,
    targetId,
    tenantDefaults,
  }
}

function BrandIdentityFields({
  canManage,
  changeColor,
  changeDescription,
  color,
  description,
  t,
}: {
  canManage: boolean
  changeColor: (value: string) => void
  changeDescription: (value: string) => void
  color: string
  description: string
  t: TFn
}) {
  return (
    <>
      <BrandColorField
        canManage={canManage}
        color={color}
        onChange={changeColor}
        t={t}
      />
      <Field label={t('set.brand.desc')}>
        <textarea
          value={description}
          onChange={(e) => changeDescription(e.target.value)}
          disabled={!canManage}
          rows={3}
          placeholder={t('set.brand.descPlaceholder')}
          className={`${inputCls} h-auto py-2.5`}
        />
      </Field>
    </>
  )
}

function BrandColorField({
  canManage,
  color,
  onChange,
  t,
}: {
  canManage: boolean
  color: string
  onChange: (value: string) => void
  t: TFn
}) {
  const selected = color.toUpperCase()
  return (
    <Field label={t('set.brand.color')}>
      <span className="-mt-1 block text-[11px] font-medium leading-snug text-[var(--dash-muted)]">
        {t('set.brand.colorSub')}
      </span>
      <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
        {BRAND_SWATCHES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            disabled={!canManage}
            onClick={() => onChange(swatch)}
            title={swatch}
            className={`h-8 w-8 shrink-0 rounded-full transition ${selected === swatch ? 'ring-2 ring-offset-2 ring-offset-[var(--dash-surface)]' : ''}`}
            style={{
              backgroundColor: swatch,
              boxShadow:
                selected === swatch ? `0 0 0 2px ${swatch}` : undefined,
            }}
          />
        ))}
        <span className="mx-1 h-6 w-px bg-[var(--dash-border)]" />
        <input
          type="color"
          value={color}
          disabled={!canManage}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-8 w-10 cursor-pointer rounded border border-[var(--dash-border)] bg-transparent disabled:opacity-60"
        />
        <input
          value={color}
          disabled={!canManage}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className={`${inputCls} h-8 w-28 font-mono`}
        />
      </div>
    </Field>
  )
}

function BrandPreview({
  color,
  description,
  tenant,
  t,
}: {
  color: string
  description: string
  tenant: Tenant | null
  t: TFn
}) {
  return (
    <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
        {t('set.brand.preview')}
      </p>
      <div className="flex items-center gap-3">
        {tenant?.logoUrl ? (
          <img
            src={tenant.logoUrl}
            alt=""
            className="h-10 w-10 rounded-lg object-contain"
          />
        ) : (
          <span
            className="h-10 w-10 rounded-lg"
            style={{ backgroundColor: color }}
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-extrabold text-[var(--dash-text)]">
            {tenant?.name || t('set.brand.previewBiz')}
          </span>
          <span className="text-xs font-medium" style={{ color }}>
            {description || t('set.brand.previewCat')}
          </span>
        </div>
      </div>
    </div>
  )
}

function AppearanceFields({
  accent,
  appearance,
  canManage,
  changeAppearance,
  editingTenant,
  lists,
  pickTarget,
  t,
  targetId,
  tenantDefaults,
}: ReturnType<typeof useAppearanceEditor> & {
  accent: string
  canManage: boolean
  t: TFn
}) {
  return (
    <>
      <Field label={t('list.appearance.applyTo')}>
        <select
          value={targetId}
          disabled={!canManage}
          onChange={(e) => pickTarget(e.target.value)}
          className={inputCls}
        >
          <option value="">{t('list.appearance.tenantDefault')}</option>
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
              {hasOwnAppearance(list)
                ? ` · ${t('list.appearance.custom')}`
                : ''}
            </option>
          ))}
        </select>
      </Field>
      <ListAppearanceFields
        t={t}
        value={appearance}
        onChange={changeAppearance}
        accent={accent}
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
