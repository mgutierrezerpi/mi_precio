import type { CSSProperties } from 'react'
import { CartControl, cartThemeFor, type CartTheme, type DesignProps, type Section } from '../designs'
import type { ListContent, ListDesign } from '../../../types'
import { SpecialPencilList } from '../pencilSpecialDesigns'
import { PENCIL_TEMPLATE_CONFIG } from './templates'

export type PencilVariant =
  | 'pencil-bakery'
  | 'pencil-garden'
  | 'pencil-market'
  | 'pencil-evening'
  | 'pencil-workshop'
  | 'pencil-cheese'
  | 'pencil-flower'
  | 'pencil-flower-summer'
  | 'pencil-flower-winter'
  | 'pencil-flower-spring'
  | 'pencil-wine'
  | 'pencil-cheese-alternating'
  | 'pencil-hardware-alternating'
  | 'pencil-hardware-weekend'
  | 'pencil-hardware-shelf'
  | 'pencil-casa-ritual'
  | 'pencil-casa-bath'
  | 'pencil-casa-signature'
  | 'pencil-casa-services'
  | 'pencil-auto-detail'
  | 'pencil-blush-bloom'
  | 'pencil-nova'
  | 'pencil-beardy'
  | 'pencil-calm-spa'
  | 'pencil-union-barber'
  | 'pencil-studio-mono'
  | 'pencil-beauty-issue'
  | 'pencil-obsidian-quarterly'
  | 'pencil-cafecitos'

const PENCIL_VARIANTS = new Set<PencilVariant>([
  'pencil-bakery', 'pencil-garden', 'pencil-market', 'pencil-evening', 'pencil-workshop',
  'pencil-cheese', 'pencil-flower', 'pencil-flower-summer', 'pencil-flower-winter', 'pencil-flower-spring', 'pencil-wine',
  'pencil-cheese-alternating', 'pencil-hardware-alternating', 'pencil-hardware-weekend', 'pencil-hardware-shelf',
  'pencil-casa-ritual', 'pencil-casa-bath', 'pencil-casa-signature', 'pencil-casa-services', 'pencil-auto-detail',
  'pencil-blush-bloom', 'pencil-nova', 'pencil-beardy', 'pencil-calm-spa', 'pencil-union-barber',
  'pencil-studio-mono', 'pencil-beauty-issue', 'pencil-obsidian-quarterly', 'pencil-cafecitos',
])

export function isPencilVariant(design: ListDesign): design is PencilVariant {
  return PENCIL_VARIANTS.has(design as PencilVariant)
}

/** The authored copy/media a Pencil layout starts with. Exposed to the admin
 * editor so an untouched template is editable rather than looking blank. */
// eslint-disable-next-line react-refresh/only-export-components
export function pencilTemplateDefaults(design: ListDesign): ListContent['template'] | undefined {
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
  font?: 'sans' | 'editorial' | 'serif' | 'mono' | 'code-pro'
  priceFormat?: '$' | 'U$D' | 'USD'
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

const CART_SHARP_VARIANTS = new Set<PencilVariant>([
  'pencil-casa-ritual', 'pencil-casa-bath', 'pencil-casa-signature',
  'pencil-casa-services', 'pencil-auto-detail', 'pencil-blush-bloom',
  'pencil-beardy', 'pencil-union-barber', 'pencil-studio-mono',
  'pencil-obsidian-quarterly',
])
const CART_ROUNDED_VARIANTS = new Set<PencilVariant>([
  'pencil-nova', 'pencil-calm-spa',
])

const isSolidHex = (value: string) => /^#[\da-f]{6}$/i.test(value)

const hexLuminance = (value: string) => {
  if (!isSolidHex(value)) return 1
  const channels = [1, 3, 5].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255)
  const linear = channels.map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

const actionAccentFor = (config: PencilConfig) => {
  if (hexLuminance(config.accent) < 0.62) return config.accent
  if (isSolidHex(config.darkPanel) && hexLuminance(config.darkPanel) < 0.32) return config.darkPanel
  if (hexLuminance(config.background) < 0.32) return config.background
  return config.ink
}

/** Build cart tokens from the same visual config used by each Pencil list. */
export function pencilCartThemeFor(variant: PencilVariant | 'pencil-journal'): CartTheme {
  if (variant === 'pencil-journal') return cartThemeFor('pencil-journal')
  const config = PENCIL_TEMPLATE_CONFIG[variant]
  const isDark = config.ink === '#FFFFFF' || config.background === '#050505' || variant === 'pencil-calm-spa' || variant === 'pencil-auto-detail'
  const sharp = CART_SHARP_VARIANTS.has(variant)
  const rounded = CART_ROUNDED_VARIANTS.has(variant)
  const radius = sharp ? '4px' : rounded ? '28px' : '14px'
  const controlRadius = sharp ? '2px' : rounded ? '16px' : '8px'
  const footerBg = config.darkPanel.startsWith('#') ? config.darkPanel : (isDark ? '#111111' : '#1B1B1B')
  return {
    ...cartThemeFor('pencil-journal'),
    isDark,
    bg: config.background,
    surface: isDark ? '#111111' : config.background,
    field: isDark ? '#1A1A1A' : '#FFFFFF',
    divider: `${config.accent}33`,
    line: `${config.accent}88`,
    ink: config.ink,
    body: config.muted,
    muted: config.muted,
    footerBg,
    footerText: isDark ? '#D7D7D7' : config.muted,
    accent: config.accent,
    actionAccent: actionAccentFor(config),
    cardRadius: radius,
    controlRadius,
    buttonRadius: sharp ? '2px' : rounded ? '999px' : '8px',
    barRadius: sharp ? '0px' : rounded ? '24px' : '12px',
    bodyFamily: 'Inter, system-ui, sans-serif',
    headingFamily: '"Playfair Display", Georgia, serif',
    labelFamily: '"IBM Plex Mono", "Courier New", monospace',
    headingTracking: sharp ? '0.02em' : '-0.03em',
    cardShadow: sharp ? '0 12px 30px -20px rgba(0,0,0,0.5)' : '0 18px 50px -20px rgba(15,13,26,0.30)',
  }
}

const SERIF = '"Playfair Display", Georgia, serif'
const MONO = '"IBM Plex Mono", "Courier New", monospace'
const SANS = 'Inter, system-ui, sans-serif'

const fontFor = (config: PencilConfig, role: 'body' | 'heading' | 'label') => {
  if (config.font === 'code-pro') return "'Code Pro', Inter, system-ui, sans-serif"
  if (config.font === 'mono') return MONO
  if (config.font === 'serif' || config.font === 'editorial') return SERIF
  return role === 'heading' ? SERIF : role === 'label' ? MONO : SANS
}

const withTemplateOverrides = (config: PencilConfig, template: NonNullable<DesignProps['content']>['template']): PencilConfig => {
  if (!template) return config
  return {
    ...config,
    ...(template.image !== undefined ? { image: template.image } : {}),
    ...(template.imageLabel !== undefined ? { imageLabel: template.imageLabel } : {}),
    ...(template.imageTitle !== undefined ? { imageTitle: template.imageTitle } : {}),
    ...(template.promoEyebrow !== undefined ? { promoEyebrow: template.promoEyebrow } : {}),
    ...(template.promoTitle !== undefined ? { promoTitle: template.promoTitle } : {}),
    ...(template.promoBody !== undefined ? { promoBody: template.promoBody } : {}),
    ...(template.promoPrice !== undefined ? { promoPrice: template.promoPrice } : {}),
    ...(template.promoNote !== undefined ? { promoNote: template.promoNote } : {}),
    ...(template.footerLeft !== undefined ? { footerLeft: template.footerLeft } : {}),
    ...(template.footerRight !== undefined ? { footerRight: template.footerRight } : {}),
    ...(template.font !== undefined ? { font: template.font } : {}),
    ...(template.priceFormat !== undefined ? { priceFormat: template.priceFormat } : {}),
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
  flower = false,
}: {
  color: string
  background: string
  flower?: boolean
}) {
  return (
    <div className="relative my-7 h-px" style={{ background: color }}>
      <span
        className="absolute left-1/2 top-1/2 flex h-10 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        style={{ background }}
      >
        {flower ? (
          <img
            src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/flower.svg"
            alt=""
            aria-hidden="true"
            className="h-[25px] w-[25px] object-contain"
          />
        ) : (
          <img
            src="/coffee-divider-icon.jpg"
            alt=""
            aria-hidden="true"
            className="h-[26px] w-[26px] object-contain"
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
  align?: 'left' | 'center'
}) {
  return (
    <header
      className={`flex flex-col gap-1 ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
    >
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
        className="max-w-full break-words text-balance text-[44px] leading-none sm:text-[60px]"
        style={{ color: color.ink, fontFamily: fontFor(color, 'heading'), fontWeight: 400 }}
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
      <div
        className="absolute bottom-3 left-3 flex flex-col gap-0.5 px-3 py-2"
        style={{ background: `${config.background}e8`, color: config.ink }}
      >
        <span className="text-[9px] uppercase tracking-[1.6px] sm:text-[10px]" style={{ fontFamily: fontFor(config, 'label') }}>
          {config.imageLabel}
        </span>
        <span className="text-[17px] italic leading-none sm:text-[18px]" style={{ fontFamily: fontFor(config, 'heading') }}>
          {config.imageTitle}
        </span>
      </div>
    </div>
  )
}

function PencilPromo({ config }: { config: PencilConfig }) {
  return (
    <aside
      className="flex min-h-[190px] min-w-0 w-full flex-col justify-between p-5 sm:p-8"
      style={{ background: config.darkPanel, color: '#F8F5EE' }}
    >
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[1.6px]" style={{ color: config.accent, fontFamily: fontFor(config, 'label') }}>
          {config.promoEyebrow}
        </span>
        <h2 className="text-[32px] leading-none sm:text-[40px]" style={{ fontFamily: fontFor(config, 'heading'), fontWeight: 400 }}>
          {config.promoTitle}
        </h2>
        <p className="max-w-[32ch] text-[12px] leading-relaxed sm:text-[13px]" style={{ color: '#D9D3C8', fontFamily: fontFor(config, 'body') }}>
          {config.promoBody}
        </p>
      </div>
      <div className="flex items-end justify-between gap-4 pt-6">
        <span className="text-[28px]" style={{ fontFamily: fontFor(config, 'heading') }}>
          {config.promoPrice}
        </span>
        <span className="text-right text-[10px] uppercase tracking-[1px]" style={{ color: config.accent, fontFamily: fontFor(config, 'label') }}>
          {config.promoNote}
        </span>
      </div>
    </aside>
  )
}

function PencilItem({ item, color, props }: { item: Section['items'][number]; color: PencilConfig; props: DesignProps }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="break-words text-[18px] leading-[1.08] sm:text-[20px]" style={{ color: color.ink, fontFamily: fontFor(color, 'heading') }}>
          {item.name}
        </p>
        {item.description && (
          <p className="mt-0.5 break-words text-[11px] leading-[1.25] sm:text-[12px]" style={{ color: color.muted, fontFamily: fontFor(color, 'body') }}>
            {item.description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {!props.isService && <CartControl qty={props.cart[item.id] ?? 0} id={item.id} addToCart={props.addToCart} decFromCart={props.decFromCart} accent={color.accent} ink={color.ink} />}
        <span className="text-right text-[14px] tabular-nums sm:text-[15px]" style={{ color: color.ink, fontFamily: fontFor(color, 'label') }}>
          {price(item.price, color.priceFormat)}
        </span>
      </div>
    </div>
  )
}

function PencilSection({ section, config, props }: { section: Section; config: PencilConfig; props: DesignProps }) {
  return (
    <section className="flex min-w-0 flex-col gap-2.5">
      <h2 className="text-[10px] uppercase tracking-[1.8px] sm:text-[11px]" style={{ color: config.accent, fontFamily: fontFor(config, 'label') }}>
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

function PencilCatalog({ sections, config, props, fullWidth = false }: { sections: Section[]; config: PencilConfig; props: DesignProps; fullWidth?: boolean }) {
  if (sections.length === 0) {
    return (
      <p className="border-y py-8 text-center text-[12px]" style={{ borderColor: `${config.accent}55`, color: config.muted }}>
        {props.t('pub.empty')}
      </p>
    )
  }
  return (
    <div className={`grid min-w-0 grid-cols-1 gap-8 ${fullWidth ? '' : 'md:grid-cols-2 md:gap-x-10 md:gap-y-7'}`}>
      {sections.map((section) => (
        <PencilSection key={section.key} section={section} config={config} props={props} />
      ))}
    </div>
  )
}

function PencilFooter({ config }: { config: PencilConfig }) {
  return (
    <footer className="flex min-w-0 flex-col gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: `${config.accent}66` }}>
      <span className="break-words text-[10px] uppercase tracking-[1.5px] sm:text-[11px]" style={{ color: config.muted, fontFamily: fontFor(config, 'label') }}>
        {config.footerLeft}
      </span>
      <span className="break-words text-[10px] uppercase tracking-[1.5px] sm:text-right sm:text-[11px]" style={{ color: config.accent, fontFamily: fontFor(config, 'label') }}>
        {config.footerRight}
      </span>
    </footer>
  )
}

function PencilShell({
  config,
  children,
}: {
  config: PencilConfig
  children: React.ReactNode
}) {
  const style: CSSProperties = {
    background: config.background,
    color: config.ink,
    fontFamily: fontFor(config, 'body'),
  }
  return (
    <div className="min-h-0 w-full min-w-0 overflow-x-clip" style={style}>
      <div className="mx-auto flex min-w-0 w-full max-w-[920px] flex-col px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        {children}
      </div>
    </div>
  )
}

export function PencilList({ variant, ...props }: DesignProps & { variant: PencilVariant }) {
  const config = {
    ...withTemplateOverrides(PENCIL_TEMPLATE_CONFIG[variant], props.content?.template),
    accent: props.accent,
  }
  if (!['left-image', 'top-image', 'full-image', 'top-promo'].includes(config.layout)) {
    return <SpecialPencilList props={props} config={config} />
  }
  const hero = props.content?.hero
  const title = hero?.title || props.listName || props.tenant.name
  const eyebrow = hero?.eyebrow
  const body = hero?.body
  const layout = config.layout
  const masthead = (
    <>
      <Masthead eyebrow={eyebrow} title={title} body={body} color={config} logoUrl={props.tenant.logoUrl} brandName={props.tenant.name} />
      <Rule color={config.accent} background={config.background} flower={variant === 'pencil-flower-summer'} />
    </>
  )
  const catalog = <PencilCatalog sections={props.sections} config={config} props={props} fullWidth={variant === 'pencil-flower-winter'} />
  const promo = <PencilPromo config={config} />

  if (layout === 'left-image') {
    return (
      <PencilShell config={config}>
        {masthead}
        {catalog}
        <div className="mt-10 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          <PencilImage config={config} className="min-h-[220px]" />
          {promo}
        </div>
        <div className="mt-8">
          <PencilFooter config={config} />
        </div>
      </PencilShell>
    )
  }

  if (layout === 'top-image') {
    return (
      <PencilShell config={config}>
        <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_268px] md:items-start">
          <Masthead eyebrow={eyebrow} title={title} body={body} color={config} logoUrl={props.tenant.logoUrl} brandName={props.tenant.name} align="left" />
          <PencilImage config={config} className="h-[156px]" />
        </div>
        <Rule color={config.accent} background={config.background} flower={variant === 'pencil-flower-summer'} />
        <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_268px] md:items-start">
          <div>{catalog}</div>
          {promo}
        </div>
        <div className="mt-8">
          <PencilFooter config={config} />
        </div>
      </PencilShell>
    )
  }

  if (layout === 'top-promo') {
    return (
      <PencilShell config={config}>
        <div className="mb-8">{promo}</div>
        {masthead}
        {catalog}
        <div className="mt-8">
          <PencilImage config={config} className="h-[96px]" />
        </div>
        <div className="mt-8">
          <PencilFooter config={config} />
        </div>
      </PencilShell>
    )
  }

  return (
    <PencilShell config={config}>
      <PencilImage config={config} className="-mx-4 -mt-6 h-[220px] sm:-mx-8 sm:-mt-8 lg:-mx-12 lg:-mt-10" />
      <div className="mt-8">{masthead}</div>
      {catalog}
      <div className="mt-8">{promo}</div>
      <div className="mt-8">
        <PencilFooter config={config} />
      </div>
    </PencilShell>
  )
}
