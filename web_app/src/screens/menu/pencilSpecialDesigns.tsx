import { useEffect } from 'react'
import { CartControl, type DesignProps, type Section } from './designs'
import type { PencilConfig } from './pencil'
import { CafecitosTemplate } from './pencil/templates/cafecitos-layout'
import { footerLines, heroCopy } from './pencil/copy'
import {
  AmbientSky,
  PoweredByMark,
  ProductShowcase,
  ShopLogo,
} from './pencil/shared'
import { PencilActionBar } from './pencilActions'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { UnionBarber } from './pencil/unionBarber'

const SERIF = '"Playfair Display", Georgia, serif'
const MONO = '"IBM Plex Mono", "Courier New", monospace'
const SANS = 'Inter, system-ui, sans-serif'
const CODE = "'Code Pro', 'DM Sans', Arial, sans-serif"

const CAFECITOS_VIDEOS = [
  '/cafecitos-DcYv0vBgdfZ.mp4',
  '/cafecitos-Db6v779A9YV.mp4',
  '/cafecitos-DbtnZtbAh25.mp4',
]

const price = (value: string | number) => {
  const amount = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isNaN(amount)
    ? '$—'
    : `$${amount.toFixed(2).replace(/\.00$/, '')}`
}

function Heading({
  config,
  eyebrow,
  title,
  body,
  align = 'left',
  large = false,
  sans = false,
}: {
  config: PencilConfig
  eyebrow?: string
  title: string
  body?: string
  align?: 'left' | 'center'
  large?: boolean
  /** All Inter: a heavy, tight title and a semibold eyebrow, no serif or mono. */
  sans?: boolean
}) {
  return (
    <div
      className={`flex min-w-0 max-w-full flex-col gap-2 ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
    >
      {eyebrow && (
        <span
          className="text-[10px] uppercase tracking-[2px] sm:text-[11px]"
          style={{
            color: config.muted,
            fontFamily: sans ? SANS : MONO,
            fontWeight: sans ? 600 : undefined,
          }}
        >
          {eyebrow}
        </span>
      )}
      <h1
        className={`${large ? 'text-[40px] sm:text-[68px]' : 'text-[40px] sm:text-[60px]'} max-w-full break-words text-balance leading-[0.94]`}
        style={{
          color: config.ink,
          fontFamily: sans ? SANS : SERIF,
          fontWeight: sans ? 800 : 400,
          letterSpacing: sans ? '-0.035em' : undefined,
        }}
      >
        {title}
      </h1>
      {body && (
        <p
          className={`${large ? 'text-[12px] sm:text-[14px]' : 'text-[12px] sm:text-[13px]'} max-w-[44ch] break-words leading-relaxed`}
          style={{ color: config.muted, fontFamily: SANS }}
        >
          {body}
        </p>
      )}
    </div>
  )
}

function Footer({
  config,
  props,
  signed = false,
}: {
  config: PencilConfig
  props: DesignProps
  /** MiPrecio's badge sits right below, so the stock line drops its credit. */
  signed?: boolean
}) {
  const lines = footerLines(config, props)
  const left = lines.left
  const right =
    signed && !config.footerRight
      ? props.t('pub.pricesIn', { currency: props.currency })
      : lines.right
  return (
    <footer
      className="flex flex-col gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: `${config.accent}66` }}
    >
      <span
        className="text-[10px] uppercase tracking-[1.5px] sm:text-[11px]"
        style={{ color: config.muted, fontFamily: MONO }}
      >
        {left}
      </span>
      <span
        className="text-[10px] uppercase tracking-[1.5px] sm:text-right sm:text-[11px]"
        style={{ color: config.accent, fontFamily: MONO }}
      >
        {right}
      </span>
    </footer>
  )
}

/** Ambient light drifting behind a dark panel; see `.pencil-glow` in index.css. */
function Glow({ accent }: { accent: string }) {
  return (
    <div
      aria-hidden="true"
      className="pencil-glow"
      style={{ '--glow': accent } as React.CSSProperties}
    />
  )
}

function Shell({
  config,
  children,
  glow,
}: {
  config: PencilConfig
  children: React.ReactNode
  /** Accent colour for an ambient `Glow` behind the content. */
  glow?: string
}) {
  return (
    <div
      className={`min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10 ${glow ? 'relative' : ''}`}
      style={{
        background: config.background,
        color: config.ink,
        fontFamily: SANS,
      }}
    >
      {glow && <Glow accent={glow} />}
      <div className="relative mx-auto flex min-w-0 w-full max-w-[920px]">
        <div className="flex min-w-0 w-full flex-col">{children}</div>
      </div>
    </div>
  )
}

function Image({
  config,
  className = '',
}: {
  config: PencilConfig
  className?: string
}) {
  if (!config.image) return null
  return (
    <div
      className={`w-full min-w-0 overflow-hidden bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url("${config.image}")` }}
    />
  )
}

function ItemAction({
  props,
  item,
  config,
  ink = config.ink,
}: {
  props: DesignProps
  item: Section['items'][number]
  config: PencilConfig
  ink?: string
}) {
  if (props.isService) return null
  return (
    <CartControl
      qty={props.cart[item.id] ?? 0}
      id={item.id}
      addToCart={props.addToCart}
      decFromCart={props.decFromCart}
      accent={config.accent}
      ink={ink}
    />
  )
}

function Rows({
  sections,
  config,
  props,
  dark = false,
  compact = false,
  large = false,
  singleColumn = false,
  alignedActions = true,
  sans = false,
}: {
  sections: Section[]
  config: PencilConfig
  props: DesignProps
  dark?: boolean
  compact?: boolean
  large?: boolean
  singleColumn?: boolean
  alignedActions?: boolean
  /** All Inter, by weight: 700 section labels, 600 names and prices. */
  sans?: boolean
}) {
  const sectionGap = large ? 'gap-4' : 'gap-3.5'
  const itemGap = large ? 'gap-3' : 'gap-2.5'
  const nameSize = large
    ? 'text-[18px] leading-[1.08] sm:text-[20px]'
    : 'text-[18px] leading-[1.08] sm:text-[20px]'
  const descriptionSize = large
    ? 'text-[11px] leading-[1.25] sm:text-[12px]'
    : 'text-[11px] leading-[1.25] sm:text-[12px]'
  const priceSize = large
    ? 'text-[12px] sm:text-[13px]'
    : 'text-[12px] sm:text-[13px]'
  const labelSize = large
    ? 'text-[10px] sm:text-[11px]'
    : 'text-[10px] sm:text-[11px]'
  const actionClass = alignedActions
    ? `items-center justify-end gap-3 ${singleColumn ? 'w-[136px]' : 'w-[112px]'}`
    : 'items-start gap-2'
  const priceClass = alignedActions
    ? `${singleColumn ? 'w-[64px]' : 'w-[48px]'} text-right tabular-nums`
    : ''
  return (
    <div
      className={`grid min-w-0 grid-cols-1 ${large ? 'gap-8' : compact ? 'gap-6' : 'gap-7'} ${singleColumn ? 'md:grid-cols-1' : 'md:grid-cols-2 md:gap-x-10'}`}
    >
      {sections.map((section) => (
        <section
          key={section.key}
          className={`flex min-w-0 flex-col ${sectionGap}`}
        >
          {section.name && (
            <h2
              className={`${labelSize} uppercase tracking-[1.8px]`}
              style={{
                color: config.accent,
                fontFamily: sans ? SANS : MONO,
                fontWeight: sans ? 700 : undefined,
              }}
            >
              {section.name}
            </h2>
          )}
          <div className={`flex min-w-0 flex-col ${itemGap}`}>
            {section.items.map((item) => (
              <div
                key={item.id}
                className="flex min-w-0 items-start justify-between gap-3 border-b pb-2"
                style={{ borderColor: `${config.accent}33` }}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`break-words ${nameSize}`}
                    style={{
                      color: dark ? '#FFFFFF' : config.ink,
                      fontFamily: sans ? SANS : SERIF,
                      fontWeight: sans ? 600 : undefined,
                      letterSpacing: sans ? '-0.01em' : undefined,
                    }}
                  >
                    {item.name}
                  </p>
                  {item.description && (
                    <p
                      className={`break-words ${descriptionSize}`}
                      style={{
                        color: dark ? '#C9C9C9' : config.muted,
                        fontFamily: SANS,
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
                <div className={`flex shrink-0 ${actionClass}`}>
                  <span
                    className={`${priceSize} ${priceClass}`}
                    style={{
                      color: dark ? '#FFFFFF' : config.ink,
                      fontFamily: sans ? SANS : MONO,
                      fontWeight: sans ? 600 : undefined,
                    }}
                  >
                    {price(item.price)}
                  </span>
                  {!props.isService && (
                    <CartControl
                      qty={props.cart[item.id] ?? 0}
                      id={item.id}
                      addToCart={props.addToCart}
                      decFromCart={props.decFromCart}
                      accent={config.accent}
                      ink={dark ? '#FFFFFF' : config.ink}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function Alternating({
  props,
  config,
  shelf = false,
}: {
  props: DesignProps
  config: PencilConfig
  shelf?: boolean
}) {
  const hero = props.content?.hero
  const title = hero?.title || props.listName || props.tenant.name
  const items = props.sections
    .slice(0, 4)
    .flatMap((section) => section.items.slice(0, 2))
  return (
    <Shell config={config}>
      <Heading
        config={config}
        eyebrow={hero?.eyebrow}
        title={title}
        body={hero?.body}
      />
      <div className="mt-8 flex min-w-0 flex-col gap-7">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="grid min-w-0 grid-cols-1 items-center gap-6 md:grid-cols-2"
          >
            <Image
              config={config}
              className={`h-[150px] md:h-[190px] ${index % 2 ? 'md:order-2' : ''}`}
            />
            <div
              className={`min-w-0 ${index % 2 ? 'md:order-1' : ''} ${shelf ? 'border-l pl-5' : ''}`}
              style={{ borderColor: `${config.accent}66` }}
            >
              <span
                className="text-[10px] uppercase tracking-[1.8px] sm:text-[11px]"
                style={{ color: config.accent, fontFamily: MONO }}
              >
                {props.sections[index % Math.max(props.sections.length, 1)]
                  ?.name || 'Collection'}
              </span>
              <h2
                className="mt-2 break-words text-[24px] leading-none sm:text-[30px]"
                style={{
                  color: config.ink,
                  fontFamily: SERIF,
                  fontWeight: 400,
                }}
              >
                {item.name}
              </h2>
              <p
                className="mt-2 max-w-[34ch] break-words text-[12px] leading-relaxed sm:text-[13px]"
                style={{ color: config.muted, fontFamily: SANS }}
              >
                {item.description || 'Selected with care for the everyday.'}
              </p>
              <div className="mt-2 flex items-start gap-2">
                <p
                  className="text-[12px] sm:text-[13px]"
                  style={{ color: config.ink, fontFamily: MONO }}
                >
                  {price(item.price)}
                </p>
                <ItemAction props={props} item={item} config={config} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Footer config={config} props={props} />
      </div>
    </Shell>
  )
}

function CasaRitual({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const hero = props.content?.hero
  return (
    <Shell config={config}>
      <div
        className="grid min-w-0 grid-cols-1 overflow-hidden md:grid-cols-2"
        style={{ background: config.darkPanel }}
      >
        <div className="flex min-w-0 flex-col justify-end gap-3 p-6 sm:p-8">
          <Heading
            config={{ ...config, ink: '#FFFFFF', muted: '#C7C7C7' }}
            eyebrow={hero?.eyebrow}
            title={heroCopy(props).title}
            body={hero?.body}
          />
        </div>
        <Image config={config} className="min-h-[230px]" />
      </div>
      <div
        className="mt-6 flex min-w-0 flex-wrap items-center justify-between gap-2 border-y py-3 text-[10px] uppercase tracking-[1.5px] sm:text-[11px]"
        style={{
          borderColor: config.accent,
          color: config.ink,
          fontFamily: MONO,
        }}
      >
        <span>Selección esencial</span>
        <span>Casa Férrea · 01</span>
      </div>
      <div className="mt-6">
        <Rows sections={props.sections} config={config} props={props} compact />
      </div>
      <div className="mt-8">
        <Footer config={config} props={props} />
      </div>
    </Shell>
  )
}

function CasaBath({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const hero = props.content?.hero
  return (
    <Shell config={config}>
      <Image
        config={config}
        className="-mx-4 -mt-6 h-[220px] sm:-mx-8 sm:-mt-8 sm:h-[250px] lg:-mx-12 lg:-mt-10"
      />
      <div className="mt-6">
        <Heading
          config={config}
          eyebrow={hero?.eyebrow}
          title={heroCopy(props).title}
          body={hero?.body}
          large
        />
      </div>
      <div className="mt-8">
        <Rows sections={props.sections} config={config} props={props} compact />
      </div>
      <div className="mt-8">
        <Footer config={config} props={props} />
      </div>
    </Shell>
  )
}

function CasaSignature({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const hero = props.content?.hero
  return (
    <Shell config={config}>
      <div className="grid min-w-0 grid-cols-2 gap-3">
        <Image
          config={{ ...config, image: '/pencil/templates/UED6s.png' }}
          className="h-[110px] sm:h-[130px]"
        />
        <Image
          config={{ ...config, image: '/pencil/templates/iQ1h5.png' }}
          className="h-[110px] sm:h-[130px]"
        />
      </div>
      <div className="py-6 text-center">
        <Heading
          config={config}
          eyebrow={hero?.eyebrow}
          title={heroCopy(props).title}
          body={hero?.body}
          align="center"
        />
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-3 border-y py-7 md:grid-cols-3">
        {props.sections.slice(0, 3).map((section) => (
          <div key={section.key} className="min-w-0 text-center">
            <h2
              className="break-words text-[11px] uppercase sm:text-[12px]"
              style={{ color: config.ink, fontFamily: MONO }}
            >
              {section.name}
            </h2>
            <p
              className="mt-2 break-words text-[12px] sm:text-[13px]"
              style={{ color: config.muted, fontFamily: SANS }}
            >
              {section.items[0]?.description ||
                'A considered detail for the room.'}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span
                className="border px-2 py-1 text-[10px] sm:text-[11px]"
                style={{ borderColor: config.accent, fontFamily: MONO }}
              >
                {price(section.items[0]?.price || 0)}
              </span>
              {section.items[0] && (
                <ItemAction
                  props={props}
                  item={section.items[0]}
                  config={config}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Footer config={config} props={props} />
      </div>
    </Shell>
  )
}

function CasaServices({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const hero = props.content?.hero
  const template = props.content?.template
  const masthead =
    template?.masthead !== undefined
      ? template.masthead
      : hero?.title || config.masthead || 'SERVICIOS'
  const brandLabel =
    template?.brandLabel !== undefined
      ? template.brandLabel
      : hero?.eyebrow || config.brandLabel || 'Casa Férrea'
  const editionLabel =
    template?.editionLabel !== undefined
      ? template.editionLabel
      : config.editionLabel || props.monthYear
  const uncategorizedLabel =
    template?.uncategorizedLabel !== undefined
      ? template.uncategorizedLabel
      : config.uncategorizedLabel || 'Otros'
  const footer =
    template?.footerLeft !== undefined
      ? template.footerLeft
      : hero?.body ||
        config.footerLeft ||
        'Un servicio pensado para acompañar cada proyecto.'
  const sections = props.sections.map((section) =>
    section.key === 'otros'
      ? { ...section, name: uncategorizedLabel }
      : section
  )
  return (
    <div
      className="min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10"
      style={{
        background: config.background,
        color: config.ink,
        fontFamily: SANS,
      }}
    >
      <div
        className={`mx-auto grid min-w-0 w-full max-w-[920px] ${masthead ? 'grid-cols-[38px_minmax(0,1fr)] gap-4 sm:grid-cols-[70px_minmax(0,1fr)] sm:gap-8' : 'grid-cols-1'}`}
      >
        {masthead && <div className="flex items-start justify-center">
          <span
            className="text-[36px] font-bold leading-none sm:text-[52px]"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontFamily: SANS,
            }}
          >
            {masthead}
          </span>
        </div>}
        <div className="min-w-0">
          {(brandLabel || editionLabel) && <div
            className="flex flex-wrap justify-between gap-2 border-b pb-4 text-[10px] uppercase tracking-[1.5px] sm:text-[11px]"
            style={{ borderColor: '#FFFFFF66', fontFamily: MONO }}
          >
            {brandLabel && <span className="break-words">{brandLabel}</span>}
            {editionLabel && <span>{editionLabel}</span>}
          </div>}
          <div className="mt-7">
            <Rows
              sections={sections}
              config={config}
              props={props}
              dark
              compact
            />
          </div>
          {footer && <div
            className="mt-8 border-t pt-6 text-[10px] uppercase tracking-[1.5px] sm:text-[11px]"
            style={{
              borderColor: '#FFFFFF66',
              color: config.muted,
              fontFamily: MONO,
            }}
          >
            {footer}
          </div>}
        </div>
      </div>
    </div>
  )
}

/**
 * Obsidian · Auto Detail. The template's composition — type and menu on the
 * left, a big picture on the right — kept, but filled with the shop: its logo,
 * name and description instead of "OBSIDIAN AUTO DETAIL / CAR DETAILING /
 * Price list", and its own product photos instead of a stock car, which is
 * what a café using this template was showing.
 *
 * From lg the picture becomes a sticky full-height showcase and the left side
 * carries everything else, actions and MiPrecio's signature included, so
 * `MenuScreen` drops its floating bar and closing band (`pencilHasDesktopCover`).
 */
function AutoDetail({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const isDesktop = useIsDesktop()
  const copy = heroCopy(props)
  const items = props.sections.flatMap((section) => section.items)
  const showcase = (className: string) => (
    <ProductShowcase
      items={items}
      caption={{
        background: config.background,
        ink: config.ink,
        headingFont: SANS,
        labelFont: MONO,
      }}
      priceFormat={config.priceFormat}
      className={className}
      fallback={<Image config={config} className={className} />}
    />
  )
  const heading = (
    <div className="flex min-w-0 flex-col gap-5">
      <ShopLogo
        name={props.tenant.name}
        logoUrl={props.tenant.logoUrl}
        tile="h-24 w-24 lg:h-32 lg:w-32"
        bare="h-16 max-w-[300px] lg:h-24 lg:max-w-[400px]"
      />
      <Heading
        config={config}
        // The shop's name only stands in for a missing eyebrow; with a logo
        // right above, it would say the same thing twice.
        eyebrow={
          props.tenant.logoUrl ? props.content?.hero?.eyebrow : copy.eyebrow
        }
        title={copy.title}
        body={copy.body}
        large
        sans
      />
    </div>
  )
  const menu = (
    <Rows
      sections={props.sections}
      config={config}
      props={props}
      dark
      compact
      singleColumn
      sans
    />
  )

  if (isDesktop)
    return (
      <div
        className="grid min-h-[100dvh] w-full grid-cols-[minmax(0,1fr)_minmax(420px,44%)]"
        style={{
          background: config.background,
          color: config.ink,
          fontFamily: SANS,
        }}
      >
        <main className="relative min-w-0 px-12 py-14 xl:px-20 xl:py-16">
          <Glow accent={config.accent} />
          <div className="relative mx-auto flex max-w-[680px] flex-col">
            {heading}
            {!props.isService && (
              <div className="mt-8 max-w-[440px]">
                <PencilActionBar props={props} docked />
              </div>
            )}
            <div
              className="my-10 h-px"
              style={{ background: `${config.accent}66` }}
            />
            {menu}
            <div className="mt-14 flex flex-col gap-5">
              <Footer config={config} props={props} signed />
              <PoweredByMark ink={config.ink} muted={config.muted} />
            </div>
          </div>
        </main>
        <aside className="sticky top-0 h-[100dvh] min-w-0">
          {showcase('h-full')}
        </aside>
      </div>
    )

  return (
    <Shell config={config} glow={config.accent}>
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="min-w-0">
          {heading}
          <div className="mt-8">{menu}</div>
        </div>
        {showcase('min-h-[360px] md:min-h-[420px]')}
      </div>
      <div className="mt-8">
        <Footer config={config} props={props} />
      </div>
    </Shell>
  )
}

function BlushBloom({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const hero = props.content?.hero
  return (
    <div
      className="min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10"
      style={{ background: config.background, color: config.ink }}
    >
      <div
        className="mx-auto w-full min-w-0 max-w-[430px] border-[6px] px-4 py-6 shadow-[10px_0_0_#F24AA6] sm:border-8 sm:px-10 sm:py-7 sm:shadow-[14px_0_0_#F24AA6]"
        style={{ background: config.darkPanel, borderColor: '#0A0A0B' }}
      >
        <Heading
          config={config}
          eyebrow={hero?.eyebrow}
          title={heroCopy(props).title}
          body={hero?.body}
          align="center"
        />
        <div className="mt-8">
          <Rows
            sections={props.sections}
            config={config}
            props={props}
            dark
            compact
            singleColumn
          />
        </div>
        <div
          className="mt-8 border-t pt-6 text-center text-[10px] uppercase tracking-[1.4px] sm:text-[11px]"
          style={{
            borderColor: `${config.accent}66`,
            color: config.muted,
            fontFamily: MONO,
          }}
        >
          {props.monthYear} · {props.tenant.name}
        </div>
      </div>
    </div>
  )
}

/**
 * Nova Studio: glass cards over a moving violet sky.
 *
 * It used to be a "packages" teaser — `sections.slice(0, 4)` and, per card,
 * three item names, the first item's price and a `+` that added only that
 * item, with a decorative `»` that led nowhere. A café's twelve products came
 * out as three prices and three orderable things. Every section and every
 * item now shows, each with its own price and cart control.
 *
 * The sky (`AmbientSky`) is fixed behind the page, the cards are frosted so it
 * moves through them, and they rise in turn on load. The design signs MiPrecio
 * itself at every width (`pencilSignsItself`) — a flat band would cut the sky.
 */
function Nova({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const isDesktop = useIsDesktop()
  const copy = heroCopy(props)
  const { left } = footerLines(config, props)
  const soft = '#F4E7FF'
  return (
    <div
      className="relative min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 pb-32 pt-10 sm:px-8 lg:px-12 lg:pb-14 lg:pt-16"
      style={{ color: '#FFFFFF', fontFamily: SANS }}
    >
      <AmbientSky
        base="#5B4BCA"
        colors={[config.accent, '#F3B8FF', '#8B5CF6']}
        veil="rgba(18, 10, 52, 0.34)"
      />
      <div className="relative mx-auto w-full min-w-0 max-w-[600px] lg:max-w-[1200px]">
        <header className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <div className="flex min-w-0 flex-col items-center gap-5 lg:items-start">
            <ShopLogo
              name={props.tenant.name}
              logoUrl={props.tenant.logoUrl}
              tile="h-20 w-20"
              bare="h-16 max-w-[280px] lg:h-20 lg:max-w-[340px]"
            />
            <Heading
              config={{ ...config, ink: '#FFFFFF', muted: soft }}
              eyebrow={
                props.tenant.logoUrl ? props.content?.hero?.eyebrow : copy.eyebrow
              }
              title={copy.title}
              body={copy.body}
              align={isDesktop ? 'left' : 'center'}
              large
              sans
            />
          </div>
          {isDesktop && !props.isService && (
            <div className="w-[420px] shrink-0">
              <PencilActionBar props={props} docked />
            </div>
          )}
        </header>

        <div className="mt-12 columns-1 gap-5 lg:columns-2 xl:columns-3">
          {props.sections.map((section, index) => (
            <section
              key={section.key}
              className="pencil-rise pencil-glass mb-5 w-full min-w-0 break-inside-avoid rounded-3xl border p-5 backdrop-blur-md sm:p-6"
              style={{
                borderColor: '#FFFFFF55',
                background: '#FFFFFF14',
                animationDelay: `${index * 90}ms`,
              }}
            >
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="min-w-0 break-words text-[18px] font-bold uppercase tracking-[1.5px] sm:text-[20px]">
                  {section.name}
                </h2>
                <span
                  className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] tabular-nums"
                  style={{
                    borderColor: '#FFFFFF55',
                    color: soft,
                    fontFamily: MONO,
                  }}
                >
                  {section.items.length}
                </span>
              </div>
              <ul className="flex flex-col">
                {section.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex min-w-0 items-start justify-between gap-3 border-t py-3 first:border-t-0 first:pt-0"
                    style={{ borderColor: '#FFFFFF26' }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-[15px] font-semibold leading-snug">
                        {item.name}
                      </p>
                      {item.description && (
                        <p
                          className="mt-0.5 break-words text-[12px] leading-snug"
                          style={{ color: soft }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className="text-[14px] tabular-nums"
                        style={{ fontFamily: MONO }}
                      >
                        {price(item.price)}
                      </span>
                      {/* A white ground of its own: the shop's accent on
                          the violet sky was all but invisible. */}
                      {!props.isService && (
                        <span className="rounded-full bg-white shadow-[0_4px_14px_-4px_rgba(30,27,75,0.45)]">
                          <ItemAction
                            props={props}
                            item={item}
                            config={config}
                            ink="#1E1B4B"
                          />
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="mt-8 flex flex-col items-center gap-4 text-center lg:flex-row lg:justify-between lg:text-left">
          <p
            className="text-[10px] uppercase tracking-[2px] sm:text-[11px]"
            style={{ color: soft, fontFamily: MONO }}
          >
            {left !== props.tenant.name && <>{left} · </>}
            {config.footerRight ||
              props.t('pub.pricesIn', { currency: props.currency })}
          </p>
          <PoweredByMark ink="#FFFFFF" muted={soft} />
        </footer>
      </div>
    </div>
  )
}

function Beardy({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const hero = props.content?.hero
  return (
    <div
      className="min-h-[100svh] w-full min-w-0 overflow-x-clip bg-cover bg-center px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10"
      style={{ backgroundImage: `url("${config.image}")` }}
    >
      <div className="mx-auto grid w-full min-w-0 max-w-[1180px] grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
        <div
          className="flex min-w-0 min-h-[680px] flex-col justify-between p-8 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)] sm:min-h-[760px] sm:p-10 md:min-h-[780px] md:p-14"
          style={{ background: '#050505', color: '#FFFFFF' }}
        >
          <div>
            <Heading
              config={{ ...config, ink: '#FFFFFF', muted: '#BDBDBD' }}
              eyebrow={hero?.eyebrow}
              title={props.tenant.name}
              align="center"
              large
            />
          </div>
          {/* The cover used to print another studio: "BEARDY / Beauty studio /
              Cut, colour and craft… / Cut · Colour · Craft". Same shape, filled
              with the shop's description and its own first sections. */}
          <div className="mx-auto max-w-[24ch] text-center">
            {props.tenant.description && (
              <p
                className="text-[14px] italic leading-relaxed sm:text-[16px]"
                style={{ color: '#D6D1CA', fontFamily: SERIF }}
              >
                {props.tenant.description}
              </p>
            )}
            {props.sections.length > 0 && (
              <p
                className="mt-8 text-[10px] uppercase tracking-[2px] sm:text-[11px]"
                style={{ color: '#FFFFFF', fontFamily: MONO }}
              >
                {props.sections
                  .slice(0, 3)
                  .map((section) => section.name)
                  .join(' · ')}
              </p>
            )}
          </div>
        </div>
        <div
          className="flex min-w-0 min-h-[680px] flex-col p-8 shadow-[0_24px_60px_-24px_rgba(15,13,26,0.3)] sm:min-h-[760px] sm:p-10 md:min-h-[780px] md:p-14"
          style={{ background: '#FFFFFF', color: config.ink }}
        >
          <Heading
            config={{ ...config, ink: '#171313', muted: '#6C655D' }}
            eyebrow={props.tenant.name}
            title={heroCopy(props).title}
            body={hero?.body}
            align="center"
            large
          />
          <div className="mt-10 flex-1">
            <Rows
              sections={props.sections}
              config={{ ...config, ink: '#171313' }}
              props={props}
              compact
              large
              singleColumn
            />
          </div>
          <Footer
            config={{
              ...config,
              footerRight: config.footerRight || props.monthYear,
            }}
            props={props}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * The Calm Spa: forest green on butter yellow, in soft-cornered panels.
 *
 * It used to be one `rounded-[48%]` box around everything — an ellipse that
 * grew with the menu, so the title sat outside it (cream on yellow) and every
 * row near a corner ran off the curve. Panels with gently rounded corners
 * keep the calm and scale with any menu; nothing sits near a curve.
 *
 * Desktop: a sticky left side with the shop's details over a window of product
 * photos; the menu in a green panel on the right. The sky drifts behind both,
 * so the design signs MiPrecio itself at every width.
 */
function CalmSpa({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const isDesktop = useIsDesktop()
  const copy = heroCopy(props)
  const green = config.darkPanel
  const sage = '#4B6B57'
  const items = props.sections.flatMap((section) => section.items)
  const { left } = footerLines(config, props)
  const corners = 'rounded-[28px]'

  const photos = (
    <div
      className={`w-full overflow-hidden ${corners}`}
      style={{ aspectRatio: isDesktop ? '1 / 1' : '4 / 4.2' }}
    >
      <ProductShowcase
        items={items}
        caption={{
          background: green,
          ink: '#F9F4D0',
          headingFont: SANS,
          labelFont: SANS,
          headingWeight: 700,
          labelWeight: 600,
        }}
        priceFormat={config.priceFormat}
        variant="story"
        className="h-full w-full"
        fallback={<div className="h-full w-full" style={{ background: green }} />}
      />
    </div>
  )

  const details = (
    <div
      className={`flex min-w-0 flex-col gap-5 ${isDesktop ? 'items-start text-left' : 'items-center text-center'}`}
    >
      <ShopLogo
        name={props.tenant.name}
        logoUrl={props.tenant.logoUrl}
        // On a light ground the dark tile can follow the logo's own shape.
        tile="h-20 w-auto max-w-[300px] px-4"
        bare="h-14 max-w-[260px]"
        ground="light"
        tileColor={green}
      />
      <Heading
        config={{ ...config, ink: green, muted: sage }}
        eyebrow={
          props.tenant.logoUrl ? props.content?.hero?.eyebrow : copy.eyebrow
        }
        title={copy.title}
        body={copy.body}
        align={isDesktop ? 'left' : 'center'}
        large
        sans
      />
      {isDesktop && !props.isService && (
        <div className="w-full max-w-[420px]">
          <PencilActionBar props={props} docked />
        </div>
      )}
    </div>
  )

  const menu = (
    <div
      className={`w-full min-w-0 px-7 py-10 sm:px-12 sm:py-12 ${corners}`}
      style={{ background: green, color: config.ink }}
    >
      <Rows
        sections={props.sections}
        config={config}
        props={props}
        dark
        compact
        singleColumn
        sans
      />
    </div>
  )

  const signature = (
    <div
      className={`flex flex-col gap-3 ${isDesktop ? 'items-start' : 'items-center text-center'}`}
    >
      <p
        className="text-[10px] uppercase tracking-[1.5px] sm:text-[11px]"
        style={{ color: sage, fontWeight: 500 }}
      >
        {left !== props.tenant.name && <>{left} · </>}
        {config.footerRight ||
          props.t('pub.pricesIn', { currency: props.currency })}
      </p>
      <PoweredByMark ink={green} muted={sage} />
    </div>
  )

  return (
    <div
      className="relative min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 pb-32 pt-10 sm:px-8 lg:px-12 lg:pb-16 lg:pt-14"
      style={{ fontFamily: SANS }}
    >
      <AmbientSky
        base={config.background}
        colors={['#DCEAC0', '#FFFFFF', '#F6E27A']}
      />
      {isDesktop ? (
        <div className="relative mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-14 xl:gap-20">
          {/* The shop's details lead: this side is sticky, so whatever sits at
              its top is what stays on screen while the menu scrolls. */}
          <aside className="sticky top-10 flex flex-col gap-8">
            {details}
            {photos}
            {signature}
          </aside>
          <main className="min-w-0">{menu}</main>
        </div>
      ) : (
        <div className="relative mx-auto flex w-full max-w-[560px] flex-col gap-8">
          {details}
          {photos}
          {menu}
          {signature}
        </div>
      )}
    </div>
  )
}

function StudioMono({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const hero = props.content?.hero
  return (
    <Shell config={config}>
      <Heading
        config={config}
        eyebrow={hero?.eyebrow}
        title={heroCopy(props).title}
        body={hero?.body}
        align="center"
      />
      <div className="mx-auto mt-10 flex w-full max-w-[820px] flex-col gap-9">
        {props.sections.slice(0, 4).map((section) => (
          <section key={section.key}>
            <div className="flex items-center gap-3">
              <div
                className="h-px flex-1"
                style={{ background: config.accent }}
              />
              <h2
                className="rounded-full px-5 py-2 text-[11px] uppercase tracking-[1px] sm:text-[12px]"
                style={{
                  background: config.darkPanel,
                  color: '#FFFFFF',
                  fontFamily: MONO,
                }}
              >
                {section.name}
              </h2>
              <div
                className="h-px flex-1"
                style={{ background: config.accent }}
              />
            </div>
            <div className="mx-auto mt-5 w-full">
              <Rows
                sections={[section]}
                config={config}
                props={props}
                compact
                singleColumn
                alignedActions
              />
            </div>
          </section>
        ))}
      </div>
    </Shell>
  )
}

function BeautyIssue({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const hero = props.content?.hero
  return (
    <div
      className="min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 py-6 sm:px-8 sm:py-8"
      style={{ background: config.background }}
    >
      <div className="mx-auto grid min-h-[640px] w-full min-w-0 max-w-[800px] grid-cols-1 md:min-h-[760px] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div
          className="flex min-w-0 flex-col justify-between p-6 sm:p-7"
          style={{ background: config.darkPanel, color: '#FFFFFF' }}
        >
          <Heading
            config={{ ...config, ink: '#FFFFFF', muted: '#BDB6B0' }}
            eyebrow={hero?.eyebrow}
            title={heroCopy(props).title}
            body={hero?.body}
          />
          <span
            className="text-[10px] uppercase tracking-[1.5px] sm:text-[11px]"
            style={{ color: '#BDB6B0', fontFamily: MONO }}
          >
            {props.monthYear}
          </span>
        </div>
        <div className="min-w-0 p-6">
          <Rows
            sections={props.sections}
            config={config}
            props={props}
            compact
            singleColumn
          />
        </div>
        <Image config={config} className="min-h-[260px] md:min-h-0" />
      </div>
    </div>
  )
}

function ObsidianQuarterly({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const hero = props.content?.hero
  return (
    <div
      className="min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 py-6 sm:px-8 sm:py-8"
      style={{ background: config.background, color: config.ink }}
    >
      <div className="mx-auto grid w-full min-w-0 max-w-[900px] grid-cols-1 md:grid-cols-2">
        <Image
          config={config}
          className="order-first min-h-[240px] md:order-last md:min-h-[430px]"
        />
        <div className="min-w-0 p-6 sm:p-10">
          <Heading
            config={config}
            eyebrow={heroCopy(props).eyebrow}
            title={heroCopy(props).title}
            body={hero?.body}
          />
          <div className="mt-8">
            <Rows
              sections={props.sections}
              config={config}
              props={props}
              dark
              compact
              singleColumn
            />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 w-full min-w-0 max-w-[900px]">
        <Footer config={config} props={props} />
      </div>
    </div>
  )
}

export function Cafecitos({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  return <CafecitosV2 props={props} config={config} />
  const hero = props.content?.hero
  const services = props.sections.flatMap((section) => section.items)
  const title = hero?.title || 'Contenido que conecta con tu comunidad.'
  const story =
    hero?.body ||
    'Disfrutando mis 30s entre cafés y plancitos que me hacen feliz.'
  return (
    <div
      className="min-h-[100svh] w-full overflow-x-clip px-4 py-5 sm:px-8 sm:py-8"
      style={{ background: '#F8FAF7', color: '#16352A', fontFamily: CODE }}
    >
      <main className="mx-auto w-full max-w-[920px]">
        <header
          className="flex items-center justify-between border-b pb-4"
          style={{ borderColor: '#C9E2D5' }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#007239]">
            Cafecitos con Dani
          </span>
          <span className="text-[10px] uppercase tracking-[1.2px] text-[#5E7067]">
            Colaboraciones
          </span>
        </header>
        <section className="grid grid-cols-1 gap-7 py-9 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[1.8px] text-[#007239]">
              Hola, soy Dani
            </p>
            <h1 className="mt-3 max-w-[15ch] text-[42px] leading-[.95] tracking-[-.04em] sm:text-[62px]">
              {title}
            </h1>
            <p className="mt-5 max-w-[47ch] text-[14px] leading-relaxed text-[#5E7067]">
              {story}
            </p>
          </div>
          <div className="mx-auto w-[160px] rotate-3 rounded-[32px] bg-[#00613E] p-2 shadow-[0_20px_40px_-26px_rgba(0,49,34,.7)] md:w-[220px]">
            <img
              src={config.image}
              alt="Dani, Cafecitos con Dani"
              className="aspect-square w-full rounded-[25px] object-cover"
            />
          </div>
        </section>
        <section className="border-y py-8" style={{ borderColor: '#C9E2D5' }}>
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[1.8px] text-[#007239]">
            Formas de colaborar
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {services.map((item, index) => (
              <article
                key={item.id}
                className="rounded-[22px] bg-[#EAF4EE] p-5 transition hover:-translate-y-0.5 hover:bg-[#DDF0E6]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-[1.4px] text-[#007239]">
                      0{index + 1}
                    </span>
                    <h2 className="mt-2 text-[21px] leading-[1.05] tracking-[-.025em]">
                      {item.name}
                    </h2>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#00613E] px-3 py-1 text-[12px] text-white">
                    {price(item.price)}
                  </span>
                </div>
                {item.description && (
                  <p className="mt-3 text-[12px] leading-relaxed text-[#5E7067]">
                    {item.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
        <section className="py-9">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[1.8px] text-[#007239]">
            Un poco de lo que hago
          </p>
          <div className="-mx-4 overflow-hidden sm:mx-0 sm:rounded-[30px] sm:bg-[#EAF4EE] sm:p-4">
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
              {CAFECITOS_VIDEOS.map((src, index) => (
                <div
                  key={src}
                  className="w-[min(76vw,272px)] shrink-0 snap-center rounded-[22px] bg-[#00613E] p-1.5 shadow-[0_14px_30px_-22px_rgba(0,49,34,.8)] transition hover:-translate-y-1 sm:w-auto"
                >
                  <video
                    className="block aspect-[9/16] w-full rounded-[17px] bg-[#16352A] object-cover"
                    controls
                    controlsList="nodownload"
                    playsInline
                    preload="metadata"
                    aria-label={`Video ${index + 1} de Cafecitos con Dani`}
                  >
                    <source src={src} type="video/mp4" />
                  </video>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-[28px] bg-[#00613E] px-6 py-7 text-white sm:px-8">
          <p className="text-[10px] uppercase tracking-[1.8px] text-[#B6DCC8]">
            ¿Te imaginás tu marca acá?
          </p>
          <h2 className="mt-3 max-w-[22ch] text-[28px] leading-[1.02] tracking-[-.03em] sm:text-[36px]">
            Conozcámonos y pensemos una colaboración.
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              ['Instagram', 'https://www.instagram.com/cafecitos.uy/'],
              ['TikTok', 'https://www.tiktok.com/@cafecitos.uy'],
              ['YouTube', 'https://youtube.com/@cafecitoscondani'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#B6DCC8] px-4 py-2 text-[11px] font-semibold uppercase tracking-[1px] transition hover:bg-white hover:text-[#00613E]"
              >
                {label}
              </a>
            ))}
          </div>
        </section>
        <footer className="py-6 text-center text-[10px] uppercase tracking-[1.5px] text-[#5E7067]">
          Cafecitos con Dani · Colaboraciones
        </footer>
      </main>
    </div>
  )
}

function CafecitosV2({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  useEffect(() => {
    const videos = document.querySelectorAll<HTMLVideoElement>(
      '[aria-label="Videos recientes de Cafecitos con Dani"] video'
    )
    videos.forEach((video) => {
      video.muted = true
      video.controls = false
      video.autoplay = true
      video.loop = true
    })
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) void video.play().catch(() => undefined)
          else video.pause()
        }),
      { threshold: 0.75 }
    )
    videos.forEach((video) => observer.observe(video))
    return () => observer.disconnect()
  }, [])
  const hero = props.content?.hero
  const services = props.sections.flatMap((section) => section.items)
  const title = hero?.title || 'Contenido que conecta con tu comunidad.'
  const story =
    hero?.body ||
    'Disfrutando mis 30s entre cafés y plancitos que me hacen feliz.'
  return (
    <div
      className="min-h-[100svh] overflow-x-clip bg-[#F8FAF7] px-5 py-6 text-[#16352A] sm:px-10 sm:py-10"
      style={{ fontFamily: CODE }}
    >
      <main className="mx-auto max-w-[1040px]">
        <header className="flex items-center justify-between border-b border-[#C9E2D5] pb-5 text-[12px] font-bold uppercase tracking-[1.5px]">
          <span className="text-[#007239]">Cafecitos con Dani</span>
          <span className="text-[#5E7067]">Colaboraciones</span>
        </header>
        <section className="grid gap-8 py-11 md:grid-cols-[1fr_260px] md:items-center">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[1.6px] text-[#007239]">
              Hola, soy Dani
            </p>
            <h1 className="mt-4 max-w-[14ch] text-[48px] font-bold leading-[.92] tracking-[-.055em] sm:text-[72px]">
              {title}
            </h1>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-[#5E7067]">
              {story}
            </p>
          </div>
          <div className="mx-auto w-[188px] rotate-3 rounded-[36px] bg-[#00613E] p-2.5 shadow-[0_24px_46px_-28px_rgba(0,49,34,.78)] md:w-[250px]">
            <img
              src={config.image}
              alt="Dani, Cafecitos con Dani"
              className="aspect-square w-full rounded-[28px] object-cover"
            />
          </div>
        </section>
        <section className="border-y border-[#C9E2D5] py-10">
          <p className="mb-5 text-[12px] font-bold uppercase tracking-[1.6px] text-[#007239]">
            Formas de colaborar
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((item, index) => (
              <article
                key={item.id}
                className="rounded-[26px] bg-[#EAF4EE] p-6 transition hover:-translate-y-1 hover:bg-[#DDF0E6]"
              >
                <div className="flex gap-4">
                  <span className="text-[13px] font-bold text-[#007239]">
                    0{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-[25px] font-bold leading-[1.02] tracking-[-.04em]">
                        {item.name}
                      </h2>
                      <span className="shrink-0 rounded-full bg-[#00613E] px-3.5 py-1.5 text-[14px] text-white">
                        {price(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-4 text-[14px] leading-relaxed text-[#5E7067]">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          aria-label="Videos recientes de Cafecitos con Dani"
          className="py-11"
        >
          <p className="mb-5 text-[12px] font-bold uppercase tracking-[1.6px] text-[#007239]">
            Reels recientes
          </p>
          <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[calc((100vw-min(86vw,380px))/2)] pb-5 sm:mx-0 sm:px-[calc((100%-380px)/2)]">
            {CAFECITOS_VIDEOS.map((src, index) => (
              <article
                key={src}
                className="w-[min(86vw,380px)] shrink-0 snap-center rounded-[38px] border border-white/20 bg-[#10261E] p-2 shadow-[0_24px_50px_-28px_rgba(0,49,34,.9)]"
              >
                <div className="mx-auto mb-1.5 h-1.5 w-16 rounded-full bg-white/40" />
                <video
                  className="block aspect-[9/16] w-full rounded-[29px] bg-black object-cover"
                  controls
                  controlsList="nodownload"
                  playsInline
                  preload={index === 0 ? 'metadata' : 'none'}
                  aria-label={`Reel ${index + 1} de Cafecitos con Dani`}
                >
                  <source src={src} type="video/mp4" />
                </video>
                <div
                  className="flex items-center justify-center gap-1.5 py-2"
                  aria-hidden="true"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-[32px] bg-[#00613E] px-7 py-9 text-white sm:px-10">
          <p className="text-[12px] font-bold uppercase tracking-[1.6px] text-[#B6DCC8]">
            ¿Te imaginás tu marca acá?
          </p>
          <h2 className="mt-4 max-w-[21ch] text-[34px] font-bold leading-[.98] tracking-[-.045em] sm:text-[46px]">
            Conozcámonos y pensemos una colaboración.
          </h2>
          <div className="mt-7 flex flex-wrap gap-3">
            {[
              ['Instagram', 'https://www.instagram.com/cafecitos.uy/'],
              ['TikTok', 'https://www.tiktok.com/@cafecitos.uy'],
              ['YouTube', 'https://youtube.com/@cafecitoscondani'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#B6DCC8] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[1px] transition hover:bg-white hover:text-[#00613E]"
              >
                {label}
              </a>
            ))}
          </div>
        </section>
        <footer className="py-8 text-center text-[11px] font-bold uppercase tracking-[1.5px] text-[#5E7067]">
          Cafecitos con Dani · Colaboraciones
        </footer>
      </main>
    </div>
  )
}

export function SpecialPencilList({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const content = (() => {
    switch (config.layout) {
      case 'alternating':
        return <Alternating props={props} config={config} />
      case 'hardware-shelf':
        return <Alternating props={props} config={config} shelf />
      case 'casa-ritual':
        return <CasaRitual props={props} config={config} />
      case 'casa-bath':
        return <CasaBath props={props} config={config} />
      case 'casa-signature':
        return <CasaSignature props={props} config={config} />
      case 'casa-services':
        return <CasaServices props={props} config={config} />
      case 'auto-detail':
        return <AutoDetail props={props} config={config} />
      case 'blush-bloom':
        return <BlushBloom props={props} config={config} />
      case 'nova':
        return <Nova props={props} config={config} />
      case 'beardy':
        return <Beardy props={props} config={config} />
      case 'calm-spa':
        return <CalmSpa props={props} config={config} />
      case 'union-barber':
        return <UnionBarber props={props} config={config} />
      case 'studio-mono':
        return <StudioMono props={props} config={config} />
      case 'beauty-issue':
        return <BeautyIssue props={props} config={config} />
      case 'obsidian-quarterly':
        return <ObsidianQuarterly props={props} config={config} />
      case 'cafecitos':
        return <CafecitosTemplate props={props} config={config} />
      default:
        return null
    }
  })()
  return content
}
