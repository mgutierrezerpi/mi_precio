/**
 * Components every Pencil layout draws the same way, whichever file the
 * layout lives in; plain helpers are in `copy.ts`. `pencil/index.tsx` imports
 * `pencilSpecialDesigns.tsx`, so shared parts cannot live in the former
 * without a circular import.
 */
import { useEffect, useState } from 'react'
import type { Section } from '../designs'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { pencilPrice } from './copy'
import { useLogoInk } from '../../../lib/logoInk'

const SHOWCASE_INTERVAL_MS = 5000

/**
 * The shop's own product photos, cycling on their own, each captioned with
 * the product's name and price. It stands where a template's stock photo
 * stood — a car on a café's page, in one case — and replaces the separate
 * "Galería" page: the pictures sell from the page itself.
 *
 * Pauses on hover and holds still under `prefers-reduced-motion`. With no
 * product photos it shows `fallback`, so the frame is never empty.
 */
export function ProductShowcase({
  items,
  caption,
  priceFormat,
  className,
  fallback,
  variant = 'tag',
}: {
  items: Section['items']
  caption: {
    background: string
    ink: string
    headingFont: string
    labelFont: string
    headingWeight?: number
    labelWeight?: number
  }
  priceFormat?: string
  className?: string
  fallback: React.ReactNode
  /**
   * `tag`: a small captioned box and dots — the shared default. `story`: the
   * photo fades into `caption.background` under a large name, the category and
   * a price pill, with story-style progress segments across the top.
   */
  variant?: 'tag' | 'story'
}) {
  const photos = items.filter((item) => item.imageUrl || item.imageThumbUrl)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const count = photos.length

  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      SHOWCASE_INTERVAL_MS
    )
    return () => window.clearInterval(timer)
  }, [count, paused, reduceMotion])

  if (count === 0) return <>{fallback}</>
  // The list can shrink under a running index (a filter, a refetch).
  const active = index % count
  const current = photos[active]

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Fotos de productos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
      {variant === 'story' ? (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${caption.background}F2 0%, ${caption.background}99 26%, transparent 58%)`,
            }}
          />
          {count > 1 && (
            <div className="absolute inset-x-4 top-4 flex gap-1">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ver ${photo.name}`}
                  aria-current={i === active}
                  className="h-1 flex-1 overflow-hidden rounded-full"
                  style={{ background: '#FFFFFF55' }}
                >
                  {i < active && (
                    <span className="block h-full w-full bg-white" />
                  )}
                  {i === active && (
                    <span
                      key={active}
                      className="pencil-story-fill block h-full w-full bg-white"
                      data-paused={paused || reduceMotion}
                      style={{ animationDuration: `${SHOWCASE_INTERVAL_MS}ms` }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
          <div
            className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6"
            aria-live={paused ? 'polite' : 'off'}
          >
            <div className="min-w-0">
              <p
                className="text-[10px] uppercase tracking-[2px]"
                style={{
                  color: caption.ink,
                  opacity: 0.8,
                  fontFamily: caption.labelFont,
                  fontWeight: caption.labelWeight,
                }}
              >
                {current.category ? `${current.category} · ` : ''}
                {active + 1} / {count}
              </p>
              <p
                className="mt-1 break-words text-[26px] leading-[1.05] sm:text-[30px]"
                style={{
                  color: caption.ink,
                  fontFamily: caption.headingFont,
                  fontWeight: caption.headingWeight,
                  letterSpacing: caption.headingWeight ? '-0.02em' : undefined,
                }}
              >
                {current.name}
              </p>
            </div>
            <span
              className="shrink-0 rounded-full px-3.5 py-1.5 text-[14px] tabular-nums"
              style={{
                background: caption.ink,
                color: caption.background,
                fontFamily: caption.labelFont,
                fontWeight: caption.labelWeight,
              }}
            >
              {pencilPrice(current.price, priceFormat)}
            </span>
          </div>
        </>
      ) : (
        <>
          <div
            className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-baseline gap-4 px-3 py-2"
            style={{
              background: `${caption.background}e8`,
              color: caption.ink,
            }}
            aria-live={paused ? 'polite' : 'off'}
          >
            <span
              className="min-w-0 truncate text-[17px] italic leading-none sm:text-[18px]"
              style={{ fontFamily: caption.headingFont }}
            >
              {current.name}
            </span>
            <span
              className="shrink-0 text-[13px] tabular-nums"
              style={{ fontFamily: caption.labelFont }}
            >
              {pencilPrice(current.price, priceFormat)}
            </span>
          </div>
          {count > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ver ${photo.name}`}
                  aria-current={i === active}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === active ? 18 : 6,
                    background: i === active ? '#FFFFFF' : '#FFFFFF80',
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/**
 * MiPrecio's signature for layouts that sign inside their own page rather than
 * in the page-wide band `MenuScreen` draws under the design. Same mark as that
 * band, but the corner of the logo image the band paints over is clipped away
 * instead: a painted strip showed as a rectangle on a gradient or moving sky.
 */
export function PoweredByMark({ ink, muted }: { ink: string; muted: string }) {
  return (
    <a
      href="https://miprecio.app"
      target="_blank"
      rel="noreferrer"
      aria-label="Powered by MiPrecio"
      className="flex w-fit items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] no-underline"
      style={{ color: muted }}
    >
      <span>Powered by</span>
      <span
        className="relative block h-6 w-[94px] overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="absolute inset-0"
          style={{
            background: ink,
            WebkitMask:
              "url('/miprecio-logo-white-pencil.webp') left center / contain no-repeat",
            mask: "url('/miprecio-logo-white-pencil.webp') left center / contain no-repeat",
            clipPath:
              'polygon(0 0, 100% 0, 100% 75%, 30% 75%, 30% 100%, 0 100%)',
          }}
        />
      </span>
    </a>
  )
}

/** Deterministic motes, so the sky renders the same on every pass. */
const MOTES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 2 + ((i * 7) % 4),
  duration: 16 + ((i * 5) % 12),
  delay: -((i * 13) % 24),
}))

/**
 * A full-viewport animated backdrop: three blurred colour fields drifting and
 * motes of light rising (`.pencil-sky` in index.css). Fixed behind the page,
 * so the content above it needs `relative` to stay on top. Still under
 * prefers-reduced-motion.
 */
export function AmbientSky({
  base,
  colors,
  veil,
}: {
  base: string
  colors: [string, string, string]
  /** A translucent colour laid over the whole sky to deepen it. */
  veil?: string
}) {
  return (
    <div
      aria-hidden="true"
      className="pencil-sky"
      style={
        {
          '--sky-base': base,
          '--sky-1': colors[0],
          '--sky-2': colors[1],
          '--sky-3': colors[2],
          '--sky-veil': veil,
        } as React.CSSProperties
      }
    >
      <i />
      <i />
      <i />
      {MOTES.map((mote, i) => (
        <b
          key={i}
          style={{
            left: `${mote.left}%`,
            width: mote.size,
            height: mote.size,
            animationDuration: `${mote.duration}s`,
            animationDelay: `${mote.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * The shop's logo, set to read on the ground it sits on. The logo is read
 * first (`useLogoInk`): on a dark ground, light ink on transparency goes on
 * bare and anything else on a white tile — dark ink needs one; on a light
 * ground it is the reverse, light ink goes on a dark tile (`tileColor`) and
 * anything else bare. The white tile used to be unconditional and swallowed
 * white wordmarks whole.
 *
 * `tile` sizes the tile (a square), `bare` sizes the untiled logo (a height
 * and a max width). Hidden for the instant the logo is being read, so it does
 * not flash from one treatment to the other.
 */
export function ShopLogo({
  name,
  logoUrl,
  tile,
  bare,
  ground = 'dark',
  tileColor = '#1B1B1B',
}: {
  name: string
  logoUrl?: string | null
  tile: string
  bare: string
  ground?: 'dark' | 'light'
  /** The tile's colour on a light ground. */
  tileColor?: string
}) {
  const ink = useLogoInk(logoUrl)
  if (!logoUrl) return null
  const alt = `Logo de ${name}`
  const hidden = ink === null ? { visibility: 'hidden' as const } : undefined
  const goesBare = ground === 'dark' ? ink === 'light' : ink === 'other'
  if (goesBare)
    return (
      <img
        src={logoUrl}
        alt={alt}
        className={`${bare} w-auto shrink-0 object-contain object-left`}
      />
    )
  return (
    <img
      src={logoUrl}
      alt={alt}
      className={`${tile} shrink-0 rounded-2xl object-contain p-2`}
      style={{
        ...hidden,
        background: ground === 'dark' ? '#FFFFFF' : tileColor,
      }}
    />
  )
}
