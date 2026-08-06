import { useRef } from 'react'
import type { ListDesign } from '../../types'
import type { TFn } from '../../lib/i18n'
import { fileToDataUrl } from '../../lib/image'
import { Icon } from '../../screens/admin/crm/ui'
import { gradient } from '../../screens/admin/crm/theme'

/** Visual templates for the public list. Mirrors LIST_DESIGNS in
 *  api/controllers/input_types/appearance.py — keep both in sync. */
export const LIST_DESIGNS: ListDesign[] = [
  'store',
  'classic',
  'nordic',
  'fine',
  'modern',
  'photo',
  'cards',
  'catalog',
  'tech',
]

export const BRAND_SWATCHES = [
  '#7C3AED',
  '#2563EB',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#DB2777',
  '#475569',
]

const SERIF = "'Playfair Display', Georgia, serif"

/** The look of one public list: the tenant sets the defaults, each list may
 *  override any subset of them. `null` on a list means "inherit the tenant's". */
export type ListAppearance = {
  design: ListDesign | null
  heroColor: string | null
  bgUrl: string | null
  bgOverlay: boolean | null
}

/** True when this list overrides at least one thing instead of inheriting everything. */
export function hasOwnAppearance(
  a: Pick<ListAppearance, 'design' | 'heroColor' | 'bgUrl'>
): boolean {
  return !!(a.design || a.heroColor || a.bgUrl)
}

const inputCls =
  'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)] disabled:opacity-60'

/** Lightweight stylized mini-preview of each public-list design (not real data). */
export function DesignThumb({
  design,
  accent,
}: {
  design: ListDesign
  accent: string
}) {
  const Thumb = thumbs[design]
  return <Thumb accent={accent} />
}

type ThumbProps = { accent: string }

const thumbs: Record<ListDesign, (props: ThumbProps) => React.ReactNode> = {
  store: StoreThumb,
  classic: ClassicThumb,
  nordic: NordicThumb,
  fine: FineThumb,
  modern: ModernThumb,
  photo: PhotoThumb,
  cards: CardsThumb,
  catalog: CatalogThumb,
  tech: TechThumb,
}

function StoreThumb({ accent }: ThumbProps) {
  return (
    <div className="h-24 w-full p-2" style={{ background: '#FAFAF7' }}>
      <div className="grid h-full grid-cols-2 gap-1.5">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="flex flex-col justify-end rounded-md p-1.5"
            style={{ background: `${accent}22` }}
          >
            <span
              className="h-1 w-2/3 rounded-full"
              style={{ background: accent }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function ClassicThumb({ accent }: ThumbProps) {
  return (
    <div className="flex h-24 w-full flex-col gap-1.5 bg-white p-2.5">
      <span
        className="mb-0.5 block h-1 w-8 rounded-full"
        style={{ background: accent }}
      />
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex items-center justify-between gap-2">
          <span
            className="h-1 rounded-full bg-[#D8D5CE]"
            style={{ width: `${55 - index * 8}%` }}
          />
          <span
            className="h-1 w-6 rounded-full"
            style={{ background: accent }}
          />
        </div>
      ))}
    </div>
  )
}

function NordicThumb({ accent }: ThumbProps) {
  return (
    <div
      className="flex h-24 w-full flex-col items-center justify-center gap-1"
      style={{ background: '#F3EBE2' }}
    >
      <span
        style={{
          fontFamily: SERIF,
          color: '#2B2620',
          fontSize: 17,
          lineHeight: 1,
        }}
      >
        Aa
      </span>
      <span className="h-px w-6" style={{ background: accent }} />
      {[0, 1].map((index) => (
        <span
          key={index}
          className="h-1 rounded-full"
          style={{ width: 64 - index * 16, background: '#C9C0B4' }}
        />
      ))}
    </div>
  )
}

function FineThumb() {
  return (
    <div
      className="flex h-24 w-full items-stretch justify-center p-2"
      style={{ background: '#10100F' }}
    >
      <div
        className="flex w-3/4 flex-col items-center justify-center gap-1.5 border"
        style={{ background: '#F7F2E8', borderColor: '#B69A62' }}
      >
        <span
          style={{
            fontFamily: SERIF,
            color: '#211D16',
            fontSize: 13,
            lineHeight: 1,
          }}
        >
          Aa
        </span>
        <span className="h-px w-7" style={{ background: '#B69A62' }} />
        <span
          className="h-1 w-10 rounded-full"
          style={{ background: '#CDBF9F' }}
        />
      </div>
    </div>
  )
}

function ModernThumb({ accent }: ThumbProps) {
  return (
    <div className="flex h-24 w-full flex-col gap-1.5 bg-white p-2.5">
      <span className="block h-1.5 w-3/4 rounded-full bg-[#0F0F0F]" />
      <span
        className="block h-3 w-full rounded"
        style={{ background: accent }}
      />
      {[0, 1].map((index) => (
        <div key={index} className="flex items-center justify-between gap-2">
          <span
            className="h-1 rounded-full bg-[#D8D5CE]"
            style={{ width: `${50 - index * 8}%` }}
          />
          <span className="h-1 w-5 rounded-full bg-[#0F0F0F]" />
        </div>
      ))}
    </div>
  )
}

function CardsThumb({ accent }: ThumbProps) {
  return (
    <div className="h-24 w-full p-2" style={{ background: '#F4F7FB' }}>
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-1.5">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex flex-col justify-between rounded-md border border-[#E2E8F0] bg-white p-1.5"
          >
            <span className="h-2 w-2 rounded" style={{ background: accent }} />
            <span
              className="h-1 w-2/3 rounded-full"
              style={{ background: accent }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function CatalogThumb({ accent }: ThumbProps) {
  return (
    <div className="h-24 w-full bg-white">
      <div
        className="flex h-9 items-center gap-1.5 px-2"
        style={{ background: '#0B1F30' }}
      >
        <span className="h-2.5 w-2.5 rounded" style={{ background: accent }} />
        <span className="h-1 w-12 rounded-full bg-white/70" />
      </div>
      <div className="grid grid-cols-3 gap-1.5 p-2">
        {[0, 1, 2].map((index) => (
          <span key={index} className="h-10 rounded bg-[#E2E8F0]" />
        ))}
      </div>
    </div>
  )
}

function TechThumb({ accent }: ThumbProps) {
  return (
    <div
      className="relative h-24 w-full overflow-hidden p-2"
      style={{ background: '#0A0E16' }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />
      <div
        className="absolute -right-3 -top-3 h-14 w-14 rounded-full"
        style={{ background: accent, filter: 'blur(16px)', opacity: 0.5 }}
      />
      <div className="relative flex h-full flex-col justify-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 rounded border px-1.5 py-1"
            style={{
              borderColor: 'rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <span
              className="h-1 rounded-full"
              style={{ width: 58 - index * 8, background: '#3A465C' }}
            />
            <span
              className="h-1 w-5 rounded-full"
              style={{ background: accent }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function PhotoThumb({ accent }: ThumbProps) {
  return (
    <div className="h-24 w-full p-2" style={{ background: '#0A0A0A' }}>
      <div className="grid h-full grid-cols-3 grid-rows-2 gap-1">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="rounded"
            style={{ background: '#1E1E1E' }}
          />
        ))}
        {[0, 1].map((index) => (
          <div
            key={`r${index}`}
            className="col-span-3 flex items-center justify-between gap-2 px-0.5"
          >
            <span className="h-1 w-1/2 rounded-full bg-[#2A2A2A]" />
            <span
              className="h-1 w-6 rounded-full"
              style={{ background: accent }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function Toggle({
  on,
  onClick,
  disabled,
}: {
  on: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${on ? gradient : 'bg-[var(--dash-border)]'} ${disabled ? 'opacity-50' : ''}`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`}
      />
    </button>
  )
}

type Props = {
  t: TFn
  value: ListAppearance
  onChange: (patch: Partial<ListAppearance>) => void
  /** Brand colour: tints the thumbnails and previews the background filter. */
  accent: string
  /** Tenant-wide defaults. When given, `null` in `value` means "inherit these"
   *  and every control gets an explicit inherit option. Omit for the tenant's
   *  own settings, which are the thing being inherited. */
  inherited?: ListAppearance
  disabled?: boolean
  /** "Guardado ✓" markers, shown per block by the settings screen. */
  savedDesign?: boolean
  savedBg?: boolean
}

/**
 * Design + hero colour + background controls for one public list, shared by the
 * tenant defaults (Configuración → Marca y apariencia) and the per-list
 * overrides (Listas de precios → editar lista).
 */
export function ListAppearanceFields({
  t,
  value,
  onChange,
  accent,
  inherited,
  disabled,
  savedDesign,
  savedBg,
}: Props) {
  const bgFileRef = useRef<HTMLInputElement>(null)
  const canInherit = !!inherited
  const effectiveDesign = value.design ?? inherited?.design ?? 'store'
  const effectiveHero =
    value.heroColor ?? (canInherit ? (inherited?.heroColor ?? null) : null)
  const bgUrl = value.bgUrl ?? (canInherit ? (inherited?.bgUrl ?? null) : null)
  const bgIsInherited = canInherit && value.bgUrl === null
  const bgOverlay = bgIsInherited ? !!inherited?.bgOverlay : !!value.bgOverlay

  const pickBg = async (file?: File) => {
    if (!file || disabled) return
    onChange({
      bgUrl: await fileToDataUrl(file, 1600),
      bgOverlay: value.bgOverlay ?? false,
    })
  }

  return (
    <>
      {/* Hero colour */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-[var(--dash-text2)]">
          {t('set.hero.title')}
        </span>
        <span className="text-[11px] font-medium leading-snug text-[var(--dash-muted)]">
          {t('set.hero.subtitle')}
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          {BRAND_SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ heroColor: c })}
              title={c}
              className={`h-8 w-8 shrink-0 rounded-full transition ${(value.heroColor ?? '').toUpperCase() === c ? 'ring-2 ring-offset-2 ring-offset-[var(--dash-surface)]' : ''}`}
              style={{
                backgroundColor: c,
                boxShadow:
                  (value.heroColor ?? '').toUpperCase() === c
                    ? `0 0 0 2px ${c}`
                    : undefined,
              }}
            />
          ))}
          <span className="mx-1 h-6 w-px bg-[var(--dash-border)]" />
          <input
            type="color"
            value={effectiveHero ?? accent}
            disabled={disabled}
            onChange={(e) =>
              onChange({ heroColor: e.target.value.toUpperCase() })
            }
            className="h-8 w-10 cursor-pointer rounded border border-[var(--dash-border)] bg-transparent disabled:opacity-60"
          />
          <input
            value={effectiveHero ?? accent}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                heroColor: e.target.value ? e.target.value.toUpperCase() : null,
              })
            }
            className={`${inputCls} h-8 w-28 font-mono`}
          />
          {value.heroColor && !disabled && (
            <button
              type="button"
              onClick={() => onChange({ heroColor: null })}
              className="text-[12px] font-bold text-[var(--dash-link)] hover:underline"
            >
              {canInherit
                ? t('list.appearance.useTenant')
                : t('set.hero.useBrand')}
            </button>
          )}
        </div>
      </div>

      {/* Design picker */}
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-[15px] font-extrabold text-[var(--dash-text)]">
            {t('set.design.title')}
          </h4>
          <p className="text-xs font-medium text-[var(--dash-muted)]">
            {canInherit
              ? t('list.appearance.designSub')
              : t('set.design.subtitle')}
          </p>
        </div>
        {savedDesign && (
          <span className="shrink-0 text-xs font-bold text-[var(--tone-green-fg)]">
            {t('common.saved')}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {canInherit && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ design: null })}
            className={`flex flex-col overflow-hidden rounded-2xl border text-left transition disabled:opacity-60 ${value.design === null ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20' : 'border-[var(--dash-border)] hover:border-[var(--dash-link)]'}`}
          >
            <DesignThumb
              design={inherited?.design ?? 'store'}
              accent={accent}
            />
            <div className="flex items-start justify-between gap-2 border-t border-[var(--dash-border)] bg-[var(--dash-surface)] p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-[var(--dash-text)]">
                  {t('list.appearance.inherit')}
                </span>
                <span className="text-[11px] font-medium leading-tight text-[var(--dash-muted)]">
                  {t('list.appearance.inheritDesc')}
                </span>
              </div>
              {value.design === null && (
                <Icon
                  name="circle-check"
                  size={16}
                  className="mt-0.5 shrink-0 text-[#7C3AED]"
                />
              )}
            </div>
          </button>
        )}
        {LIST_DESIGNS.map((d) => {
          const on = canInherit ? value.design === d : effectiveDesign === d
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ design: d })}
              className={`flex flex-col overflow-hidden rounded-2xl border text-left transition disabled:opacity-60 ${on ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20' : 'border-[var(--dash-border)] hover:border-[var(--dash-link)]'}`}
            >
              <DesignThumb design={d} accent={accent} />
              <div className="flex items-start justify-between gap-2 border-t border-[var(--dash-border)] bg-[var(--dash-surface)] p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-[var(--dash-text)]">
                    {t(`set.design.${d}.name`)}
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-[var(--dash-muted)]">
                    {t(`set.design.${d}.desc`)}
                  </span>
                </div>
                {on && (
                  <Icon
                    name="circle-check"
                    size={16}
                    className="mt-0.5 shrink-0 text-[#7C3AED]"
                  />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Background image + brand-colour filter */}
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-[15px] font-extrabold text-[var(--dash-text)]">
            {t('set.bg.title')}
          </h4>
          <p className="text-xs font-medium text-[var(--dash-muted)]">
            {t('set.bg.subtitle')}
          </p>
        </div>
        {savedBg && (
          <span className="shrink-0 text-xs font-bold text-[var(--tone-green-fg)]">
            {t('common.saved')}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--dash-border)] p-4">
        <div className="flex items-center gap-4">
          <span className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)]">
            {bgUrl ? (
              <img src={bgUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Icon
                name="paintbrush"
                size={18}
                className="text-[var(--dash-muted)]"
              />
            )}
            {bgUrl && bgOverlay && (
              <span
                className="absolute inset-0"
                style={{
                  background: accent,
                  opacity: 0.5,
                  mixBlendMode: 'multiply',
                }}
              />
            )}
          </span>
          {!disabled && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <input
                  ref={bgFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => pickBg(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => bgFileRef.current?.click()}
                  className="flex h-9 items-center gap-2 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
                >
                  <Icon name="upload" size={15} />{' '}
                  {bgUrl ? t('set.bg.change') : t('set.bg.upload')}
                </button>
                {value.bgUrl && (
                  <button
                    type="button"
                    onClick={() => onChange({ bgUrl: null, bgOverlay: null })}
                    className="text-[13px] font-bold text-[#EF4444] hover:underline"
                  >
                    {canInherit
                      ? t('list.appearance.useTenant')
                      : t('common.remove')}
                  </button>
                )}
              </div>
              {bgIsInherited && bgUrl && (
                <span className="text-[11px] font-semibold text-[var(--dash-muted)]">
                  {t('list.appearance.bgInherited')}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--dash-border)] p-3.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-[var(--dash-text)]">
              {t('set.bg.overlay')}
            </span>
            <span className="text-[11px] font-medium text-[var(--dash-muted)]">
              {t('set.bg.overlayDesc')}
            </span>
          </div>
          <Toggle
            on={bgOverlay}
            disabled={disabled || !bgUrl || bgIsInherited}
            onClick={() => onChange({ bgOverlay: !bgOverlay })}
          />
        </div>
      </div>
    </>
  )
}
