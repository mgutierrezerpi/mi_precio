import { useEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { CartControl, type DesignProps, type Section } from '../designs'
import type { ListContent, ListDesign } from '../../../types'
import { SpecialPencilList } from '../pencilSpecialDesigns'
import { PENCIL_TEMPLATE_CONFIG } from './templates'
import { isPencilVariant, type PencilVariant } from './variants'

/** The authored copy/media a Pencil layout starts with. Exposed to the admin
 * editor so an untouched template is editable rather than looking blank. */
// eslint-disable-next-line react-refresh/only-export-components
export function pencilTemplateDefaults(
  design: ListDesign
): ListContent['template'] | undefined {
  if (!isPencilVariant(design)) return undefined
  const config = PENCIL_TEMPLATE_CONFIG[design]
  return {
    image: config.image,
    imageLabel: config.imageLabel,
    imageTitle: config.imageTitle,
    promoEyebrow: config.promoEyebrow,
    promoTitle: config.promoTitle,
    promoBody: config.promoBody,
    promoPrice: config.promoPrice,
    promoNote: config.promoNote,
    footerLeft: config.footerLeft,
    footerRight: config.footerRight,
    dividerIcon: config.dividerIcon,
    backgroundColor: config.background,
    textColor: config.ink,
    mutedColor: config.muted,
    accentColor: config.accent,
    darkPanelColor: config.darkPanel,
    masthead: config.masthead,
    brandLabel: config.brandLabel,
    editionLabel: config.editionLabel,
    uncategorizedLabel: config.uncategorizedLabel,
  }
}

export type PencilConfig = {
  background: string
  ink: string
  muted: string
  accent: string
  darkPanel: string
  image: string
  imageLabel: string
  imageTitle: string
  promoEyebrow: string
  promoTitle: string
  promoBody: string
  promoPrice: string
  promoNote: string
  footerLeft: string
  footerRight: string
  masthead?: string
  brandLabel?: string
  editionLabel?: string
  uncategorizedLabel?: string
  font?: 'sans' | 'editorial' | 'serif' | 'mono' | 'code-pro'
  priceFormat?: '$' | 'U$D' | 'USD'
  dividerIcon?: 'coffee' | 'flower' | 'leaf' | 'none'
  layout:
    | 'left-image'
    | 'top-image'
    | 'full-image'
    | 'top-promo'
    | 'alternating'
    | 'hardware-shelf'
    | 'casa-ritual'
    | 'casa-bath'
    | 'casa-signature'
    | 'casa-services'
    | 'auto-detail'
    | 'blush-bloom'
    | 'nova'
    | 'beardy'
    | 'calm-spa'
    | 'union-barber'
    | 'studio-mono'
    | 'beauty-issue'
    | 'obsidian-quarterly'
    | 'cafecitos'
}

const SERIF = '"Playfair Display", Georgia, serif'
const MONO = '"IBM Plex Mono", "Courier New", monospace'
const SANS = 'Inter, system-ui, sans-serif'

const fontFor = (config: PencilConfig, role: 'body' | 'heading' | 'label') => {
  if (config.font === 'code-pro')
    return "'Code Pro', Inter, system-ui, sans-serif"
  if (config.font === 'mono') return MONO
  if (config.font === 'serif' || config.font === 'editorial') return SERIF
  return role === 'heading' ? SERIF : role === 'label' ? MONO : SANS
}

const withTemplateOverrides = (
  config: PencilConfig,
  template: NonNullable<DesignProps['content']>['template']
): PencilConfig => {
  if (!template) return config
  return {
    ...config,
    ...(template.image !== undefined ? { image: template.image } : {}),
    ...(template.imageLabel !== undefined
      ? { imageLabel: template.imageLabel }
      : {}),
    ...(template.imageTitle !== undefined
      ? { imageTitle: template.imageTitle }
      : {}),
    ...(template.promoEyebrow !== undefined
      ? { promoEyebrow: template.promoEyebrow }
      : {}),
    ...(template.promoTitle !== undefined
      ? { promoTitle: template.promoTitle }
      : {}),
    ...(template.promoBody !== undefined
      ? { promoBody: template.promoBody }
      : {}),
    ...(template.promoPrice !== undefined
      ? { promoPrice: template.promoPrice }
      : {}),
    ...(template.promoNote !== undefined
      ? { promoNote: template.promoNote }
      : {}),
    ...(template.footerLeft !== undefined
      ? { footerLeft: template.footerLeft }
      : {}),
    ...(template.footerRight !== undefined
      ? { footerRight: template.footerRight }
      : {}),
    ...(template.masthead !== undefined ? { masthead: template.masthead } : {}),
    ...(template.brandLabel !== undefined
      ? { brandLabel: template.brandLabel }
      : {}),
    ...(template.editionLabel !== undefined
      ? { editionLabel: template.editionLabel }
      : {}),
    ...(template.uncategorizedLabel !== undefined
      ? { uncategorizedLabel: template.uncategorizedLabel }
      : {}),
    ...(template.font !== undefined ? { font: template.font } : {}),
    ...(template.priceFormat !== undefined
      ? { priceFormat: template.priceFormat }
      : {}),
    ...(template.dividerIcon !== undefined
      ? { dividerIcon: template.dividerIcon }
      : {}),
    ...(template.backgroundColor !== undefined
      ? { background: template.backgroundColor }
      : {}),
    ...(template.textColor !== undefined ? { ink: template.textColor } : {}),
    ...(template.mutedColor !== undefined
      ? { muted: template.mutedColor }
      : {}),
    ...(template.accentColor !== undefined
      ? { accent: template.accentColor }
      : {}),
    ...(template.darkPanelColor !== undefined
      ? { darkPanel: template.darkPanelColor }
      : {}),
  }
}

const price = (value: string | number, prefix = '$') => {
  const amount = typeof value === 'number' ? value : Number.parseFloat(value)
  if (Number.isNaN(amount)) return '$—'
  const display = amount.toFixed(2).replace(/\.00$/, '')
  return prefix === '$' ? `$${display}` : `${prefix} ${display}`
}

function Rule({
  color,
  background,
  icon = 'coffee',
}: {
  color: string
  background: string
  icon?: 'coffee' | 'flower' | 'leaf' | 'none'
}) {
  return (
    <div className="relative my-7 h-px" style={{ background: color }}>
      <span
        className="absolute left-1/2 top-1/2 flex h-10 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        style={{ background }}
      >
        {icon === 'none' ? null : icon === 'coffee' ? (
          <img
            src="/coffee-divider-icon.jpg"
            alt=""
            aria-hidden="true"
            className="h-[26px] w-[26px] object-contain"
          />
        ) : (
          <img
            src={`https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/${icon}.svg`}
            alt=""
            aria-hidden="true"
            className="h-[25px] w-[25px] object-contain"
          />
        )}
      </span>
    </div>
  )
}

function Masthead({
  eyebrow,
  title,
  body,
  color,
  logoUrl,
  brandName,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  body?: string
  color: PencilConfig
  logoUrl?: string | null
  brandName: string
  /** `rail` is the desktop spread: centered on a phone, left in the side rail. */
  align?: 'left' | 'center' | 'rail'
}) {
  const alignment =
    align === 'center'
      ? 'items-center text-center'
      : align === 'left'
        ? 'items-start text-left'
        : 'items-center text-center lg:items-start lg:text-left'
  return (
    <header className={`flex flex-col gap-1 ${alignment}`}>
      {logoUrl && (
        <img
          src={logoUrl}
          alt={`Logo de ${brandName}`}
          className="mb-2 h-24 w-24 rounded-2xl border bg-white object-contain p-1 shadow-sm"
          style={{ borderColor: `${color.accent}66` }}
        />
      )}
      {eyebrow && (
        <p
          className="text-[10px] uppercase tracking-[2px] sm:text-[11px]"
          style={{ color: color.muted, fontFamily: fontFor(color, 'label') }}
        >
          {eyebrow}
        </p>
      )}
      <h1
        className={`max-w-full break-words text-balance text-[44px] leading-none sm:text-[60px] ${align === 'rail' ? 'lg:text-[46px]' : ''}`}
        style={{
          color: color.ink,
          fontFamily: fontFor(color, 'heading'),
          fontWeight: 400,
        }}
      >
        {title}
      </h1>
      {body && (
        <p
          className="max-w-[48ch] text-[13px] italic sm:text-[15px]"
          style={{ color: color.muted, fontFamily: fontFor(color, 'body') }}
        >
          {body}
        </p>
      )}
    </header>
  )
}

function PencilImage({
  config,
  className,
}: {
  config: PencilConfig
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden bg-cover bg-center ${className ?? ''}`}
      style={{ backgroundImage: `url("${config.image}")` }}
    >
      {(config.imageLabel || config.imageTitle) && (
        <div
          className="absolute bottom-3 left-3 flex flex-col gap-0.5 px-3 py-2"
          style={{ background: `${config.background}e8`, color: config.ink }}
        >
          {config.imageLabel && (
            <span
              className="text-[9px] uppercase tracking-[1.6px] sm:text-[10px]"
              style={{ fontFamily: fontFor(config, 'label') }}
            >
              {config.imageLabel}
            </span>
          )}
          {config.imageTitle && (
            <span
              className="text-[17px] italic leading-none sm:text-[18px]"
              style={{ fontFamily: fontFor(config, 'heading') }}
            >
              {config.imageTitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function PencilPromo({ config }: { config: PencilConfig }) {
  // The panel advertises an offer at a price. With nothing authored it used to
  // fall back to the template's sample combo, so a shop that never opened the
  // editor published a product it does not sell. Better to show nothing.
  const authored =
    config.promoEyebrow ||
    config.promoTitle ||
    config.promoBody ||
    config.promoPrice ||
    config.promoNote
  if (!authored) return null
  return (
    <aside
      className="flex min-h-[190px] min-w-0 w-full flex-col justify-between p-5 sm:p-8"
      style={{ background: config.darkPanel, color: '#F8F5EE' }}
    >
      <div className="flex flex-col gap-2">
        <span
          className="text-[10px] font-bold uppercase tracking-[1.6px]"
          style={{ color: '#F4EEDC', fontFamily: fontFor(config, 'label') }}
        >
          {config.promoEyebrow}
        </span>
        <h2
          className="text-[32px] leading-none sm:text-[40px]"
          style={{ fontFamily: fontFor(config, 'heading'), fontWeight: 400 }}
        >
          {config.promoTitle}
        </h2>
        <p
          className="max-w-[32ch] text-[12px] leading-relaxed sm:text-[13px]"
          style={{ color: '#D9D3C8', fontFamily: fontFor(config, 'body') }}
        >
          {config.promoBody}
        </p>
      </div>
      <div className="flex items-end justify-between gap-4 pt-6">
        <span
          className="text-[28px]"
          style={{ fontFamily: fontFor(config, 'heading') }}
        >
          {config.promoPrice}
        </span>
        <span
          className="max-w-[18ch] text-right text-[11px] font-bold uppercase leading-snug tracking-[1px]"
          style={{ color: '#F4EEDC', fontFamily: fontFor(config, 'label') }}
        >
          {config.promoNote}
        </span>
      </div>
    </aside>
  )
}

function PencilItem({
  item,
  color,
  props,
}: {
  item: Section['items'][number]
  color: PencilConfig
  props: DesignProps
}) {
  const galleryItems = (
    props.allItems || props.sections.flatMap((section) => section.items)
  ).filter((candidate) => candidate.imageUrl || candidate.imageThumbUrl)
  const itemImageIndex = galleryItems.findIndex(
    (candidate) => candidate.id === item.id
  )
  const [imageIndex, setImageIndex] = useState<number | null>(null)
  const image = item.imageUrl || item.imageThumbUrl
  const activeImage = imageIndex === null ? null : galleryItems[imageIndex]
  const moveImage = (direction: -1 | 1) =>
    setImageIndex((current) =>
      current === null
        ? null
        : (current + direction + galleryItems.length) % galleryItems.length
    )

  useEffect(() => {
    if (imageIndex === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setImageIndex(null)
      if (event.key === 'ArrowLeft') moveImage(-1)
      if (event.key === 'ArrowRight') moveImage(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [imageIndex, galleryItems.length])
  return (
    <div className="group relative flex min-w-0 items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        {image ? (
          <button
            type="button"
            className="cursor-zoom-in break-words text-left text-[18px] leading-[1.08] underline decoration-transparent underline-offset-4 transition group-hover:decoration-current sm:text-[20px]"
            style={{ color: color.ink, fontFamily: fontFor(color, 'heading') }}
            onClick={() => setImageIndex(Math.max(itemImageIndex, 0))}
            aria-label={`Ver foto de ${item.name}`}
          >
            {item.name}
          </button>
        ) : (
          <p
            className="break-words text-[18px] leading-[1.08] sm:text-[20px]"
            style={{ color: color.ink, fontFamily: fontFor(color, 'heading') }}
          >
            {item.name}
          </p>
        )}
        {item.description && (
          <p
            className="mt-0.5 break-words text-[11px] leading-[1.25] sm:text-[12px]"
            style={{ color: color.muted, fontFamily: fontFor(color, 'body') }}
          >
            {item.description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {!props.isService && (
          <CartControl
            qty={props.cart[item.id] ?? 0}
            id={item.id}
            addToCart={props.addToCart}
            decFromCart={props.decFromCart}
            accent={color.accent}
            ink={color.ink}
          />
        )}
        <span
          className="text-right text-[14px] tabular-nums sm:text-[15px]"
          style={{ color: color.ink, fontFamily: fontFor(color, 'label') }}
        >
          {price(item.price, color.priceFormat)}
        </span>
      </div>
      {image && (
        <>
          <div
            className="pointer-events-none absolute bottom-full left-0 z-20 mb-3 hidden w-52 overflow-hidden rounded-sm border-4 bg-white p-1 opacity-0 shadow-2xl transition-opacity group-hover:opacity-100 md:block"
            style={{ borderColor: color.background }}
          >
            <img
              src={image}
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          {activeImage &&
            createPortal(
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-5"
                role="dialog"
                aria-modal="true"
                aria-label={`Foto de ${activeImage.name}`}
                onClick={() => setImageIndex(null)}
              >
                <button
                  type="button"
                  className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl text-black shadow-lg"
                  onClick={() => setImageIndex(null)}
                  aria-label="Cerrar foto"
                >
                  ×
                </button>
                {galleryItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl text-black shadow-lg sm:left-6"
                      onClick={(event) => {
                        event.stopPropagation()
                        moveImage(-1)
                      }}
                      aria-label="Foto anterior"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl text-black shadow-lg sm:right-6"
                      onClick={(event) => {
                        event.stopPropagation()
                        moveImage(1)
                      }}
                      aria-label="Foto siguiente"
                    >
                      ›
                    </button>
                  </>
                )}
                <figure
                  className="max-w-3xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <img
                    src={
                      activeImage.imageUrl || activeImage.imageThumbUrl || ''
                    }
                    alt={activeImage.name}
                    className="max-h-[78vh] w-auto rounded-sm object-contain shadow-2xl"
                  />
                  <figcaption className="bg-white px-4 py-3 text-center text-sm font-semibold text-black">
                    {activeImage.name}
                  </figcaption>
                </figure>
              </div>,
              document.body
            )}
        </>
      )}
    </div>
  )
}

function PencilSection({
  section,
  config,
  props,
}: {
  section: Section
  config: PencilConfig
  props: DesignProps
}) {
  return (
    <section className="flex min-w-0 flex-col gap-2.5">
      <h2
        className="text-[10px] uppercase tracking-[1.8px] sm:text-[11px]"
        style={{ color: config.accent, fontFamily: fontFor(config, 'label') }}
      >
        {section.name}
      </h2>
      <div className="flex flex-col gap-4 sm:gap-3.5">
        {section.items.map((item) => (
          <PencilItem key={item.id} item={item} color={config} props={props} />
        ))}
      </div>
    </section>
  )
}

function PencilCatalog({
  sections,
  config,
  props,
  fullWidth = false,
}: {
  sections: Section[]
  config: PencilConfig
  props: DesignProps
  fullWidth?: boolean
}) {
  if (sections.length === 0) {
    return (
      <p
        className="border-y py-8 text-center text-[12px]"
        style={{ borderColor: `${config.accent}55`, color: config.muted }}
      >
        {props.t('pub.empty')}
      </p>
    )
  }
  return (
    <div
      className={`grid min-w-0 grid-cols-1 gap-8 ${fullWidth ? '' : 'md:grid-cols-2 md:gap-x-10 md:gap-y-7'}`}
    >
      {sections.map((section) => (
        <PencilSection
          key={section.key}
          section={section}
          config={config}
          props={props}
        />
      ))}
    </div>
  )
}

function PencilGallery({
  items,
  config,
  props,
}: {
  items: Section['items']
  config: PencilConfig
  props: DesignProps
}) {
  return (
    <section>
      <p
        className="text-[10px] uppercase tracking-[1.8px]"
        style={{ color: config.accent, fontFamily: fontFor(config, 'label') }}
      >
        Segunda página
      </p>
      <h2
        className="mb-6 mt-1 text-[36px] leading-none sm:text-[46px]"
        style={{ color: config.ink, fontFamily: fontFor(config, 'heading') }}
      >
        Galería
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, index) => (
          <figure
            key={item.id}
            className={`${index % 5 === 0 ? 'col-span-2 row-span-2' : ''} group overflow-hidden`}
          >
            <img
              src={item.imageUrl || item.imageThumbUrl || ''}
              alt={item.name}
              className="aspect-square h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <figcaption
              className="border-x border-b px-3 py-3 text-[11px] font-semibold"
              style={{ borderColor: `${config.accent}44`, color: config.ink }}
            >
              <span className="block">{item.name}</span>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span
                  className="text-[12px] tabular-nums"
                  style={{ fontFamily: fontFor(config, 'label') }}
                >
                  {price(item.price, config.priceFormat)}
                </span>
                {(props.cart[item.id] ?? 0) > 0 ? (
                  <CartControl
                    qty={props.cart[item.id] ?? 0}
                    id={item.id}
                    addToCart={props.addToCart}
                    decFromCart={props.decFromCart}
                    accent={config.accent}
                    ink={config.ink}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => props.addToCart(item.id)}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.8px] text-white transition hover:opacity-85"
                    style={{ background: config.accent }}
                  >
                    {props.t('pub.add')}
                  </button>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function PencilPageNav({
  page,
  setPage,
  config,
}: {
  page: 'catalog' | 'gallery'
  setPage: (page: 'catalog' | 'gallery') => void
  config: PencilConfig
}) {
  return (
    <nav className="mb-7 flex gap-2" aria-label="Páginas de la lista">
      {(
        [
          ['catalog', 'Productos'],
          ['gallery', 'Galería'],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setPage(value)}
          className="border px-4 py-2 text-[10px] font-semibold uppercase tracking-[1.3px] transition"
          style={{
            borderColor: config.accent,
            background: page === value ? config.accent : 'transparent',
            color: page === value ? config.background : config.ink,
            fontFamily: fontFor(config, 'label'),
          }}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}

function PencilFooter({
  config,
  props,
}: {
  config: PencilConfig
  props: DesignProps
}) {
  // The shop's own words win. With nothing authored we show the shop's real
  // details — never the sample address the template shipped with, which put a
  // street in Paris on the page of a café in Montevideo.
  const left = config.footerLeft || props.tenant.address || props.tenant.name
  const right =
    config.footerRight || props.t('pub.footer', { currency: props.currency })
  return (
    <footer
      className="flex min-w-0 flex-col gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: `${config.accent}66` }}
    >
      <span
        className="break-words text-[10px] uppercase tracking-[1.5px] sm:text-[11px]"
        style={{ color: config.muted, fontFamily: fontFor(config, 'label') }}
      >
        {left}
      </span>
      <span
        className="break-words text-[10px] uppercase tracking-[1.5px] sm:text-right sm:text-[11px]"
        style={{ color: config.accent, fontFamily: fontFor(config, 'label') }}
      >
        {right}
      </span>
    </footer>
  )
}

function PencilShell({
  config,
  children,
  /**
   * Opens the measure up for layouts that lay out as a desktop spread. The
   * default 920px is a phone column stretched onto a monitor: on a 1900px
   * screen it leaves roughly 490px dead on either side.
   */
  wide = false,
}: {
  config: PencilConfig
  children: React.ReactNode
  wide?: boolean
}) {
  const style: CSSProperties = {
    background: config.background,
    color: config.ink,
    fontFamily: fontFor(config, 'body'),
  }
  return (
    <div className="min-h-0 w-full min-w-0 overflow-x-clip" style={style}>
      <div
        className={`mx-auto flex min-w-0 w-full flex-col px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10 ${
          wide
            ? 'max-w-[920px] lg:max-w-[1180px] xl:max-w-[1360px]'
            : 'max-w-[920px]'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export function PencilList({
  variant,
  ...props
}: DesignProps & { variant: PencilVariant }) {
  const [page, setPage] = useState<'catalog' | 'gallery'>('catalog')
  const config = withTemplateOverrides(
    { ...PENCIL_TEMPLATE_CONFIG[variant], accent: props.accent },
    props.content?.template
  )
  if (
    !['left-image', 'top-image', 'full-image', 'top-promo'].includes(
      config.layout
    )
  ) {
    return <SpecialPencilList props={props} config={config} />
  }
  const hero = props.content?.hero
  const title = hero?.title || props.listName || props.tenant.name
  const eyebrow = hero?.eyebrow
  const body = hero?.body
  const layout = config.layout
  const galleryItems = props.sections
    .flatMap((section) => section.items)
    .filter((item) => item.imageUrl || item.imageThumbUrl)
  const masthead = (
    <>
      <Masthead
        eyebrow={eyebrow}
        title={title}
        body={body}
        color={config}
        logoUrl={props.tenant.logoUrl}
        brandName={props.tenant.name}
      />
      <Rule
        color={config.accent}
        background={config.background}
        icon={
          config.dividerIcon ??
          (variant === 'pencil-flower-summer' ? 'flower' : 'coffee')
        }
      />
    </>
  )
  const pageNav = galleryItems.length > 0 && (
    <PencilPageNav page={page} setPage={setPage} config={config} />
  )
  const catalog =
    page === 'gallery' ? (
      <PencilGallery items={galleryItems} config={config} props={props} />
    ) : (
      <PencilCatalog
        sections={props.sections}
        config={config}
        props={props}
        fullWidth={variant === 'pencil-flower-winter'}
      />
    )
  const promo = <PencilPromo config={config} />

  if (layout === 'left-image') {
    return (
      <PencilShell config={config} wide>
        {/*
          Phones keep the single column, in source order. From `lg` the very
          same nodes re-place themselves as a desktop spread: the shop's
          identity, picture, offer and details hold a left rail, and the menu
          itself — the thing people came to read — takes the wide side.
        */}
        <div className="flex flex-col lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-x-12 xl:grid-cols-[400px_minmax(0,1fr)] xl:gap-x-16">
          <div className="lg:col-start-1 lg:row-start-1">
            <Masthead
              eyebrow={eyebrow}
              title={title}
              body={body}
              color={config}
              logoUrl={props.tenant.logoUrl}
              brandName={props.tenant.name}
              align="rail"
            />
            <Rule
              color={config.accent}
              background={config.background}
              icon={config.dividerIcon ?? 'coffee'}
            />
          </div>
          <div className="lg:col-start-2 lg:row-start-1">{pageNav}</div>
          <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-2">
            {catalog}
          </div>
          <div className="mt-10 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:grid-cols-1 lg:gap-6">
            <PencilImage config={config} className="min-h-[220px]" />
            {promo}
          </div>
          <div className="mt-8 lg:col-start-1 lg:row-start-3">
            <PencilFooter config={config} props={props} />
          </div>
        </div>
      </PencilShell>
    )
  }

  if (layout === 'top-image') {
    return (
      <PencilShell config={config}>
        <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_268px] md:items-start">
          <Masthead
            eyebrow={eyebrow}
            title={title}
            body={body}
            color={config}
            logoUrl={props.tenant.logoUrl}
            brandName={props.tenant.name}
            align="left"
          />
          <PencilImage config={config} className="h-[156px]" />
        </div>
        <Rule
          color={config.accent}
          background={config.background}
          icon={
            config.dividerIcon ??
            (variant === 'pencil-flower-summer' ? 'flower' : 'coffee')
          }
        />
        {pageNav}
        <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_268px] md:items-start">
          <div>{catalog}</div>
          {promo}
        </div>
        <div className="mt-8">
          <PencilFooter config={config} props={props} />
        </div>
      </PencilShell>
    )
  }

  if (layout === 'top-promo') {
    return (
      <PencilShell config={config}>
        <div className="mb-8">{promo}</div>
        {masthead}
        {pageNav}
        {catalog}
        <div className="mt-8">
          <PencilImage config={config} className="h-[96px]" />
        </div>
        <div className="mt-8">
          <PencilFooter config={config} props={props} />
        </div>
      </PencilShell>
    )
  }

  return (
    <PencilShell config={config}>
      <PencilImage
        config={config}
        className="-mx-4 -mt-6 h-[220px] sm:-mx-8 sm:-mt-8 lg:-mx-12 lg:-mt-10"
      />
      <div className="mt-8">{masthead}</div>
      {pageNav}
      {catalog}
      <div className="mt-8">{promo}</div>
      <div className="mt-8">
        <PencilFooter config={config} props={props} />
      </div>
    </PencilShell>
  )
}
