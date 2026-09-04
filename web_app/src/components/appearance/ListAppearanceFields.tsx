import { useRef, useState } from 'react'
import type { Item, ListDesign, Tenant } from '../../types'
import { getT, type TFn } from '../../lib/i18n'
import { fileToDataUrl } from '../../lib/image'
import {
  BRAND_SWATCHES,
  LIST_DESIGNS,
  type ListAppearance,
} from '../../lib/listAppearance'
import { Icon } from '../../screens/admin/crm/ui'
import { gradient } from '../../screens/admin/crm/theme'
import {
  ClassicList,
  FineDining,
  ImageCatalog,
  ModernBrand,
  NordicMenu,
  PhotoLookbook,
  ServiceCards,
  TechGrid,
  type DesignProps,
} from '../../screens/menu/designs'
import { PencilList } from '../../screens/menu/pencil'
import { isPencilVariant } from '../../screens/menu/pencil/variants'
import { PencilJournal } from '../../screens/menu/pencilJournal'

const SERIF = "'Playfair Display', Georgia, serif"

const inputCls =
  'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)] disabled:opacity-60'

const standardPreviewRenderers: Partial<
  Record<ListDesign, React.ComponentType<DesignProps>>
> = {
  classic: ClassicList,
  nordic: NordicMenu,
  fine: FineDining,
  modern: ModernBrand,
  photo: PhotoLookbook,
  cards: ServiceCards,
  catalog: ImageCatalog,
  tech: TechGrid,
}

/** A clipped, scaled instance of the same components used by the public list. */
export function DesignThumb({
  design,
  accent,
  size = 'thumb',
}: {
  design: ListDesign
  accent: string
  size?: 'thumb' | 'preview'
}) {
  const props = createDesignPreviewProps(accent)
  let preview: React.ReactNode

  if (isPencilVariant(design))
    preview = <PencilList variant={design} {...props} />
  else if (design === 'pencil-journal') preview = <PencilJournal {...props} />
  else {
    const Renderer = standardPreviewRenderers[design]
    if (Renderer) preview = <Renderer {...props} />
    else {
      // Store is the only public layout still embedded in MenuScreen. Keep its
      // current dedicated preview until that renderer is extracted.
      const Thumb = thumbs.store ?? PencilExtendedThumb
      return <Thumb accent={accent} />
    }
  }

  return (
    <div
      className={`relative w-full overflow-hidden bg-white ${size === 'preview' ? 'h-[min(64vh,38rem)]' : 'h-40'}`}
      aria-hidden="true"
    >
      <div
        className={`pointer-events-none absolute left-1/2 top-0 w-[960px] origin-top -translate-x-1/2 ${size === 'preview' ? 'scale-[0.62]' : 'scale-[0.27]'}`}
      >
        {preview}
      </div>
    </div>
  )
}

const previewItem = {
  id: 'preview-item',
  name: 'Producto destacado',
  price: '890',
  description: 'Una selección para conocer este estilo.',
  category: 'Destacados',
  imageUrl: '/mockup-img.webp',
} as Item

// eslint-disable-next-line react-refresh/only-export-components
export function createDesignPreviewProps(accent: string): DesignProps {
  const tenant = {
    id: 'preview',
    name: 'Casa MiPrecio',
    subdomain: 'preview',
    currency: 'UYU',
    description: 'Una selección para todos los días.',
    brandColor: accent,
    listHeroColor: accent,
    language: 'es',
    taxId: null,
  } as Tenant
  const C = {
    bg: '#FAFAF7',
    ink: '#0F0D1A',
    body: '#44424E',
    muted: '#84818E',
    accent,
    accent2: '#6D28D9',
    line: '#E5E2DC',
  }
  return {
    tenant,
    C,
    accent,
    heroColor: accent,
    brandGradient: `linear-gradient(135deg, ${accent}, #A855F7)`,
    t: getT('es'),
    money: (value) => `$ ${value}`,
    currency: 'UYU',
    updated: 'Hoy',
    monthYear: 'Junio 2026',
    sections: [
      {
        key: 'featured',
        name: 'Destacados',
        items: [previewItem],
        min: 890,
        max: 890,
      },
    ],
    base: [previewItem],
    allItems: [previewItem],
    cat: 'all',
    setCat: () => {},
    q: '',
    setQ: () => {},
    cart: {},
    cartCount: 0,
    addToCart: () => {},
    decFromCart: () => {},
    openCart: () => {},
    waHref: '#',
    isService: false,
    listName: 'Selección',
    edition: '001',
    taxId: null,
    hasBg: false,
  }
}

type ThumbProps = { accent: string }

const thumbs: Partial<
  Record<ListDesign, (props: ThumbProps) => React.ReactNode>
> = {
  store: StoreThumb,
  classic: ClassicThumb,
  nordic: NordicThumb,
  fine: FineThumb,
  modern: ModernThumb,
  photo: PhotoThumb,
  cards: CardsThumb,
  catalog: CatalogThumb,
  tech: TechThumb,
  'pencil-bakery': PencilBakeryThumb,
  'pencil-garden': PencilGardenThumb,
  'pencil-market': PencilMarketThumb,
  'pencil-evening': PencilEveningThumb,
  'pencil-workshop': PencilWorkshopThumb,
  'pencil-journal': PencilJournalThumb,
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

function PencilThumb({
  accent,
  background,
  image,
  darkPanel,
  imageFirst = false,
}: {
  accent: string
  background: string
  image: string
  darkPanel: string
  imageFirst?: boolean
}) {
  const imageBlock = (
    <div
      className="h-7 w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${image})` }}
    />
  )
  const promo = <div className="h-7 w-2/3" style={{ background: darkPanel }} />
  return (
    <div
      className="flex h-24 w-full flex-col gap-1.5 p-2"
      style={{ background }}
    >
      {imageFirst ? imageBlock : promo}
      <div className="flex flex-col items-center gap-1">
        <span
          className="h-1 w-14 rounded-full"
          style={{ background: accent }}
        />
        <span
          className="h-1 w-24 rounded-full"
          style={{ background: '#6D6A63' }}
        />
      </div>
      {imageFirst ? promo : imageBlock}
      <div className="grid grid-cols-2 gap-1">
        <span className="h-1 rounded-full" style={{ background: '#9B988F' }} />
        <span className="h-1 rounded-full" style={{ background: accent }} />
      </div>
    </div>
  )
}

function PencilBakeryThumb({ accent }: ThumbProps) {
  return (
    <PencilThumb
      accent={accent}
      background="#F4F2EF"
      darkPanel="#1B1B1B"
      image="https://images.unsplash.com/photo-1753826366896-170e04691b1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=480"
    />
  )
}

function PencilGardenThumb({ accent }: ThumbProps) {
  return (
    <PencilThumb
      accent={accent}
      background="#FBF7EF"
      darkPanel="#1B1B1B"
      imageFirst
      image="https://images.unsplash.com/photo-1726950189914-8fe1016eb9c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=480"
    />
  )
}

function PencilMarketThumb({ accent }: ThumbProps) {
  return (
    <PencilThumb
      accent={accent}
      background="#F8F1E7"
      darkPanel="#1B1B1B"
      image="https://images.unsplash.com/photo-1693140539040-aa567b436278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=480"
    />
  )
}

function PencilEveningThumb({ accent }: ThumbProps) {
  return (
    <PencilThumb
      accent={accent}
      background="#F2EFE9"
      darkPanel="#1B1B1B"
      imageFirst
      image="https://images.unsplash.com/photo-1779282620211-810663eac20e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=480"
    />
  )
}

function PencilWorkshopThumb({ accent }: ThumbProps) {
  return (
    <PencilThumb
      accent={accent}
      background="#E7ECE7"
      darkPanel="#20322C"
      image="https://images.unsplash.com/photo-1695728130932-7b5967d59f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=480"
    />
  )
}

function PencilExtendedThumb({ accent }: ThumbProps) {
  return (
    <div
      className="flex h-24 w-full flex-col gap-2 p-3"
      style={{ background: '#F4F0E8' }}
    >
      <div className="h-3 w-2/3 rounded-sm" style={{ background: '#252525' }} />
      <div className="grid flex-1 grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex items-end justify-between border-b pb-1"
            style={{ borderColor: '#D5CEC2' }}
          >
            <span
              className="h-1 w-2/3 rounded-full"
              style={{ background: '#8C857A' }}
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

function PencilJournalThumb({ accent }: ThumbProps) {
  return (
    <div
      className="flex h-24 w-full flex-col gap-1 p-2"
      style={{ background: '#EEE5D7' }}
    >
      <div
        className="h-8 w-full bg-cover bg-center"
        style={{ backgroundImage: 'url(/pencil/cheese-factory/zLZId.png)' }}
      />
      <div className="flex items-center gap-1">
        <span
          className="h-1 w-1/3 rounded-full"
          style={{ background: '#A76D3E' }}
        />
        <span
          className="h-1 w-1/2 rounded-full"
          style={{ background: '#6D5B4A' }}
        />
      </div>
      <div className="grid flex-1 grid-cols-3 gap-1">
        <span style={{ background: '#3A2A1D' }} />
        <span style={{ background: '#E75B39' }} />
        <span style={{ background: accent }} />
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
  const designGalleryRef = useRef<HTMLDivElement>(null)
  const [previewDesign, setPreviewDesign] = useState<ListDesign | null>(null)
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

  const scrollDesignGallery = (direction: -1 | 1) => {
    const gallery = designGalleryRef.current
    if (!gallery) return
    gallery.scrollBy({
      left: direction * gallery.clientWidth * 0.82,
      behavior: 'smooth',
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
      <button
        type="button"
        onClick={() => setPreviewDesign(effectiveDesign)}
        className="-mt-2 flex w-fit items-center gap-1.5 text-xs font-bold text-[var(--dash-link)] hover:underline"
      >
        <Icon name="eye" size={15} />
        Vista previa de este tema
      </button>
      <div className="relative">
        <div
          ref={designGalleryRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 pr-2 [scrollbar-width:thin]"
          aria-label={t('set.design.title')}
        >
          {canInherit && (
            <div
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled}
              onClick={() => !disabled && onChange({ design: null })}
              onKeyDown={(event) => {
                if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault()
                  onChange({ design: null })
                }
              }}
              className={`flex w-[min(18rem,calc(100vw-4rem))] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border text-left transition disabled:opacity-60 ${value.design === null ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20' : 'border-[var(--dash-border)] hover:border-[var(--dash-link)]'}`}
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
            </div>
          )}
          {LIST_DESIGNS.map((d) => {
            const on = canInherit ? value.design === d : effectiveDesign === d
            return (
              <div
                key={d}
                className={`flex w-[min(18rem,calc(100vw-4rem))] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border text-left transition disabled:opacity-60 ${on ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20' : 'border-[var(--dash-border)] hover:border-[var(--dash-link)]'}`}
              >
                <div
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-disabled={disabled}
                  onClick={() => !disabled && onChange({ design: d })}
                  onKeyDown={(event) => {
                    if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault()
                      onChange({ design: d })
                    }
                  }}
                  className="text-left"
                  aria-label={`Elegir ${t(`set.design.${d}.name`)}`}
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
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDesign(d)}
                  className="flex items-center justify-center gap-1.5 border-t border-[var(--dash-divider)] bg-[var(--dash-soft)] px-3 py-2 text-xs font-bold text-[var(--dash-link)] transition hover:bg-[var(--dash-border)]"
                  aria-label={`Vista previa de ${t(`set.design.${d}.name`)}`}
                >
                  <Icon name="eye" size={14} />
                  Vista previa
                </button>
              </div>
            )
          })}
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollDesignGallery(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
            aria-label="Tema anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollDesignGallery(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
            aria-label="Tema siguiente"
          >
            →
          </button>
        </div>
      </div>

      {previewDesign && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171521]/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa del tema"
          onMouseDown={() => setPreviewDesign(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-[var(--dash-surface)] shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-[var(--dash-divider)] px-4 py-3">
              <div>
                <p className="text-sm font-extrabold text-[var(--dash-text)]">
                  {t(`set.design.${previewDesign}.name`)}
                </p>
                <p className="text-xs font-medium text-[var(--dash-muted)]">
                  Vista previa con el color de tu marca
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDesign(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] hover:text-[var(--dash-text)]"
                aria-label="Cerrar vista previa"
                title="Cerrar"
              >
                <Icon name="circle-x" size={18} />
              </button>
            </div>
            <DesignThumb design={previewDesign} accent={accent} size="preview" />
            <div className="flex justify-end border-t border-[var(--dash-divider)] p-3">
              <button
                type="button"
                onClick={() => setPreviewDesign(null)}
                className="rounded-lg bg-[var(--dash-soft)] px-3 py-2 text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-border)]"
              >
                Volver a los temas
              </button>
            </div>
          </div>
        </div>
      )}

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
