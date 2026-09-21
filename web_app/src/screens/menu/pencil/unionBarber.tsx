import { useEffect, useState } from 'react'
import { CartControl, SIco, type DesignProps, type Section } from '../designs'
import { useIsDesktop, useMediaQuery } from '../../../hooks/useMediaQuery'
import { useWebFont } from '../../../lib/useWebFont'
import { footerLines, heroCopy, pencilPrice } from './copy'
import { PoweredByMark, ShopLogo } from './shared'
import type { PencilConfig } from './index'

const SANS = 'Inter, system-ui, sans-serif'
/** Condensed display sans for the barbershop sign; loaded only by this design. */
const OSWALD = "'Oswald', 'Arial Narrow', Inter, sans-serif"
const OSWALD_HREF =
  'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap'

/** The trade's colours, fixed: a barbershop's red and blue are its sign. */
const BARBER = {
  navy: '#131B5C',
  royal: '#283B97',
  red: '#D9232E',
  paper: '#F4F2EE',
  slate: '#5B6283',
}
const POLE_CAP = 'linear-gradient(90deg, #8C93B8, #F4F2EE, #8C93B8)'

const TOOLS = ['scissors', 'razor', 'comb'] as const
type Tool = (typeof TOOLS)[number]

/** Line icons of the trade, one per section in turn. */
function BarberTool({
  kind,
  color,
  size = 22,
}: {
  kind: Tool
  color: string
  size?: number
}) {
  return (
    <svg
      className="barber-tool shrink-0"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === 'scissors' && (
        <>
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M20 4 8.12 15.88" />
          <path d="M14.47 14.48 20 20" />
          <path d="M8.12 8.12 12 12" />
        </>
      )}
      {kind === 'razor' && (
        <>
          <path d="M3 17 14.5 7.5 21 8.5 9.5 18.5Z" />
          <path d="M14.5 7.5 18 3" />
          <path d="M6.5 15.5 9 17.5" />
        </>
      )}
      {kind === 'comb' && (
        <>
          <rect x="2.5" y="6" width="19" height="4" rx="1.5" />
          <path d="M5 10v8M8 10v8M11 10v8M14 10v8M17 10v8M20 10v6" />
        </>
      )}
    </svg>
  )
}

/** A pole standing on its own: silver caps top and bottom, stripes turning. */
function Pole({ height }: { height: string }) {
  return (
    <div className="flex flex-col items-center" aria-hidden="true">
      <span
        className="h-4 w-12 rounded-full"
        style={{ background: POLE_CAP }}
      />
      <span className={`barber-pole -my-1 w-8 rounded-full ${height}`} />
      <span
        className="h-4 w-12 rounded-full"
        style={{ background: POLE_CAP }}
      />
    </div>
  )
}

const FEATURE_INTERVAL_MS = 5000

/**
 * The sign's right side: one service at a time, large, in a wide rounded
 * frame. A lone pole in half a hero of empty navy said nothing; this sells.
 * Cycles through the photos and holds on the first under reduced motion; with
 * none, a pole stands in its place so the sign is not left bare.
 */
function Featured({
  photos,
  priceFormat,
  label,
}: {
  photos: Section['items']
  priceFormat?: string
  label: string
}) {
  const [index, setIndex] = useState(0)
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const count = photos.length
  useEffect(() => {
    if (count < 2 || reduceMotion) return
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      FEATURE_INTERVAL_MS
    )
    return () => window.clearInterval(timer)
  }, [count, reduceMotion])

  if (count === 0) return <Pole height="h-[340px]" />
  const active = index % count
  const current = photos[active]
  return (
    <div className="relative h-[360px] w-[460px] xl:h-[380px] xl:w-[540px]">
      <div className="absolute inset-0 overflow-hidden rounded-[28px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/15">
        {photos.map((photo, i) => (
          <img
            key={photo.id}
            src={photo.imageUrl || photo.imageThumbUrl || ''}
            alt={i === active ? photo.name : ''}
            aria-hidden={i !== active}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
        <div
          className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5"
          style={{
            background: `linear-gradient(to top, ${BARBER.navy}F0, ${BARBER.navy}00)`,
            fontFamily: OSWALD,
          }}
        >
          <div className="min-w-0">
            <p
              className="text-[11px] font-medium uppercase tracking-[3px]"
              style={{ color: '#FFFFFFA6' }}
            >
              {label}
            </p>
            <p className="truncate text-[26px] font-semibold uppercase leading-tight text-white">
              {current.name}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full px-4 py-1.5 text-[18px] font-bold text-white"
            style={{ background: BARBER.red }}
          >
            {pencilPrice(current.price, priceFormat)}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Union Barber Shop, rebuilt as a modern barbershop page rather than a price
 * list in a card: a navy sign with the shop's name set large in condensed
 * Oswald and a turning barber pole; a red-white-blue ribbon that keeps
 * running; a strip of work photos passing by itself; category chips; and the
 * services as cards — number, tool icon, name, price in red.
 *
 * It deliberately borrows nothing from the other lists (no side cover, no
 * rows, no boxed carousel). The trade's red and blue are fixed rather than
 * the shop's accent. WhatsApp reads "Reservar turno" (`pencilAskLabel`), and
 * the design signs MiPrecio in its own footer at every width.
 */
export function UnionBarber({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  useWebFont(OSWALD_HREF)
  const isDesktop = useIsDesktop()
  const [filter, setFilter] = useState('all')
  const copy = heroCopy(props)
  const { tenant, sections, t } = props
  const items = sections.flatMap((section) => section.items)
  const numberOf = new Map(items.map((item, i) => [item.id, i + 1]))
  const photos = items.filter((item) => item.imageUrl || item.imageThumbUrl)
  const shown =
    filter === 'all'
      ? sections
      : sections.filter((section) => section.key === filter)
  const { left } = footerLines(config, props)
  const bookLabel =
    props.checkoutChannel === 'instagram'
      ? 'Copiar pedido · Instagram'
      : t('pub.bookWhatsApp')
  // Desktop has no floating bar for this design (`pencilHasDesktopCover`),
  // and the sign's buttons scroll away — the sticky bar carries them instead.
  const showBarActions = isDesktop && !props.isService
  const toolFor = (section: Section) =>
    TOOLS[Math.max(sections.indexOf(section), 0) % TOOLS.length]
  const chips = [
    { key: 'all', name: t('pub.all'), count: items.length },
    ...sections.map((section) => ({
      key: section.key,
      name: section.name,
      count: section.items.length,
    })),
  ]

  return (
    <div
      className="min-h-[100svh] w-full min-w-0 overflow-x-clip"
      style={
        {
          background: BARBER.paper,
          color: BARBER.navy,
          fontFamily: SANS,
          '--pole-red': BARBER.red,
          '--pole-blue': BARBER.royal,
        } as React.CSSProperties
      }
    >
      {/* The sign */}
      <header
        className="relative overflow-hidden"
        style={{ background: BARBER.navy, color: '#FFFFFF' }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, #FFFFFF 0 1px, transparent 1px 16px)',
          }}
        />
        <div className="relative mx-auto grid w-full max-w-[1200px] grid-cols-1 items-end gap-10 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-12 lg:pb-20 lg:pt-16">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <ShopLogo
              name={tenant.name}
              logoUrl={tenant.logoUrl}
              tile="h-20 w-20"
              bare="h-14 max-w-[280px] lg:h-20 lg:max-w-[360px]"
            />
            {!tenant.logoUrl && copy.eyebrow && (
              <p
                className="text-[12px] font-semibold uppercase tracking-[3px]"
                style={{ color: '#FFFFFFB3' }}
              >
                {copy.eyebrow}
              </p>
            )}
            <h1
              className="max-w-full break-words text-[56px] font-bold uppercase leading-[0.88] sm:text-[84px] lg:text-[120px]"
              style={{ fontFamily: OSWALD, letterSpacing: '-0.01em' }}
            >
              {copy.title}
            </h1>
            {copy.body && (
              <p
                className="max-w-[52ch] text-[15px] leading-relaxed sm:text-[16px]"
                style={{ color: '#FFFFFFBF' }}
              >
                {copy.body}
              </p>
            )}
            {isDesktop && !props.isService && (
              <div className="mt-2 flex flex-wrap gap-3">
                <a
                  href={props.waHref}
                  onClick={props.onCheckout}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-semibold uppercase tracking-[2px] text-white transition-transform hover:-translate-y-0.5"
                  style={{ background: BARBER.red, fontFamily: OSWALD }}
                >
                  <SIco name="message-circle" size={18} color="#FFFFFF" />
                  {bookLabel}
                </a>
                <button
                  type="button"
                  onClick={props.openCart}
                  className="rounded-full border px-8 py-4 text-[15px] font-semibold uppercase tracking-[2px] text-white transition-colors hover:bg-white/10"
                  style={{ borderColor: '#FFFFFF66', fontFamily: OSWALD }}
                >
                  {t('store.myCart')}
                  {props.cartCount > 0 ? ` · ${props.cartCount}` : ''}
                </button>
              </div>
            )}
          </div>
          {isDesktop && (
            <Featured
              photos={photos}
              priceFormat={config.priceFormat}
              label={t('store.featured')}
            />
          )}
        </div>
      </header>
      <div className="barber-ribbon h-3" aria-hidden="true" />

      {/* Work photos passing by */}
      {photos.length >= 3 && (
        <section
          className="barber-marquee overflow-hidden py-8 motion-reduce:overflow-x-auto"
          aria-label="Trabajos"
        >
          <div
            className="barber-track flex w-max gap-4 px-4"
            style={{ animationDuration: `${Math.max(28, photos.length * 5)}s` }}
          >
            {[...photos, ...photos].map((photo, i) => (
              <figure
                key={`${photo.id}-${i}`}
                aria-hidden={i >= photos.length}
                className="relative h-[230px] w-[180px] shrink-0 overflow-hidden rounded-2xl sm:h-[270px] sm:w-[210px]"
              >
                <img
                  src={photo.imageUrl || photo.imageThumbUrl || ''}
                  alt={i < photos.length ? photo.name : ''}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <figcaption
                  className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-white"
                  style={{
                    background: `linear-gradient(to top, ${BARBER.navy}E6, transparent)`,
                    fontFamily: OSWALD,
                  }}
                >
                  <span className="min-w-0 truncate text-[15px] font-medium uppercase tracking-[1px]">
                    {photo.name}
                  </span>
                  <span className="shrink-0 text-[15px] font-semibold">
                    {pencilPrice(photo.price, config.priceFormat)}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Category chips */}
      {(sections.length > 1 || showBarActions) && (
        <nav
          className="sticky top-0 z-20 border-b backdrop-blur"
          style={{
            background: `${BARBER.paper}EB`,
            borderColor: `${BARBER.navy}1A`,
          }}
        >
          <div className="mx-auto flex w-full max-w-[1200px] items-center gap-4 px-5 py-3 sm:px-8 lg:px-12">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
              {sections.length > 1 &&
                chips.map((chip) => {
                  const on = filter === chip.key
                  return (
                    <button
                      key={chip.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setFilter(chip.key)}
                      className="flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium uppercase tracking-[1.5px] transition-colors"
                      style={{
                        fontFamily: OSWALD,
                        background: on ? BARBER.navy : '#FFFFFF',
                        color: on ? '#FFFFFF' : BARBER.navy,
                        borderColor: on ? BARBER.navy : `${BARBER.navy}26`,
                      }}
                    >
                      {chip.name}
                      <span
                        className="text-[11px]"
                        style={{ color: on ? '#FFFFFFA6' : BARBER.slate }}
                      >
                        {chip.count}
                      </span>
                    </button>
                  )
                })}
            </div>
            {showBarActions && (
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={props.waHref}
                  onClick={props.onCheckout}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[1.5px] text-white transition-opacity hover:opacity-90"
                  style={{ background: '#25D366', fontFamily: OSWALD }}
                >
                  <SIco name="message-circle" size={16} color="#FFFFFF" />
                  {bookLabel}
                </a>
                <button
                  type="button"
                  onClick={props.openCart}
                  className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[1.5px] text-white transition-opacity hover:opacity-90"
                  style={{ background: BARBER.navy, fontFamily: OSWALD }}
                >
                  <SIco name="shopping-cart" size={16} color="#FFFFFF" />
                  {t('store.myCart')}
                  {props.cartCount > 0 && (
                    <span
                      className="rounded-full px-1.5 text-[11px] leading-5"
                      style={{ background: BARBER.red }}
                    >
                      {props.cartCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Services */}
      <main className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        {shown.map((section) => (
          <section key={section.key} className="mb-12 last:mb-0">
            <div className="mb-5 flex items-center gap-3">
              <BarberTool
                kind={toolFor(section)}
                color={BARBER.red}
                size={26}
              />
              <h2
                className="text-[24px] font-semibold uppercase tracking-[2px] sm:text-[28px]"
                style={{ fontFamily: OSWALD }}
              >
                {section.name}
              </h2>
              <span
                className="h-px flex-1"
                style={{ background: `${BARBER.navy}24` }}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item, index) => (
                <article
                  key={item.id}
                  className="barber-card pencil-rise relative flex min-w-0 flex-col gap-3 rounded-2xl bg-white p-5 shadow-[0_12px_32px_-22px_rgba(19,27,92,0.4)] sm:p-6"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <BarberTool
                      kind={toolFor(section)}
                      color={`${BARBER.navy}80`}
                      size={20}
                    />
                    <span
                      className="text-[13px] font-medium tracking-[2px]"
                      style={{ color: BARBER.slate, fontFamily: OSWALD }}
                    >
                      {String(numberOf.get(item.id) ?? index + 1).padStart(
                        2,
                        '0'
                      )}
                    </span>
                  </div>
                  <h3
                    className="break-words text-[22px] font-semibold uppercase leading-[1.1]"
                    style={{ fontFamily: OSWALD }}
                  >
                    {item.name}
                  </h3>
                  {item.description && (
                    <p
                      className="break-words text-[13px] leading-snug"
                      style={{ color: BARBER.slate }}
                    >
                      {item.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                    <span
                      className="text-[28px] font-bold leading-none tabular-nums"
                      style={{ color: BARBER.red, fontFamily: OSWALD }}
                    >
                      {pencilPrice(item.price, config.priceFormat)}
                    </span>
                    {!props.isService && (
                      <CartControl
                        qty={props.cart[item.id] ?? 0}
                        id={item.id}
                        addToCart={props.addToCart}
                        decFromCart={props.decFromCart}
                        accent={BARBER.red}
                        ink={BARBER.navy}
                      />
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer, signed */}
      <footer style={{ background: BARBER.navy, color: '#FFFFFF' }}>
        <div className="barber-ribbon h-2" aria-hidden="true" />
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-5 px-5 pb-32 pt-10 text-center sm:px-8 lg:flex-row lg:justify-between lg:px-12 lg:pb-12 lg:text-left">
          <div>
            <p
              className="text-[20px] font-semibold uppercase tracking-[2px]"
              style={{ fontFamily: OSWALD }}
            >
              {tenant.name}
            </p>
            <p className="mt-1 text-[12px]" style={{ color: '#FFFFFF99' }}>
              {left !== tenant.name && <>{left} · </>}
              {config.footerRight ||
                t('pub.pricesIn', { currency: props.currency })}
            </p>
          </div>
          <PoweredByMark ink="#FFFFFF" muted="#FFFFFF99" />
        </div>
      </footer>
    </div>
  )
}
