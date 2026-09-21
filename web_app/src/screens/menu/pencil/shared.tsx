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
}: {
  items: Section['items']
  caption: {
    background: string
    ink: string
    headingFont: string
    labelFont: string
  }
  priceFormat?: string
  className?: string
  fallback: React.ReactNode
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
      <div
        className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-baseline gap-4 px-3 py-2"
        style={{ background: `${caption.background}e8`, color: caption.ink }}
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
    </div>
  )
}

/**
 * MiPrecio's signature for layouts that sign inside their own dark panel
 * rather than in the page-wide band `MenuScreen` draws under the design. Same
 * mark and mask as that band; `background` must be the panel's colour, since
 * a strip of it covers part of the logo image.
 */
export function PoweredByMark({
  ink,
  muted,
  background,
}: {
  ink: string
  muted: string
  background: string
}) {
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
          }}
        />
        <span
          className="absolute bottom-0 left-[30%] right-0 h-[25%]"
          style={{ background }}
        />
      </span>
    </a>
  )
}

/**
 * The shop's logo on a dark panel. A logo drawn in light ink on transparency
 * goes straight onto the panel, at its own shape and a real size; anything
 * else sits on a white tile, which is what keeps dark ink legible. The white
 * tile used to be unconditional, and it swallowed white wordmarks whole.
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
}: {
  name: string
  logoUrl?: string | null
  tile: string
  bare: string
}) {
  const ink = useLogoInk(logoUrl)
  if (!logoUrl) return null
  if (ink === 'light')
    return (
      <img
        src={logoUrl}
        alt={`Logo de ${name}`}
        className={`${bare} w-auto shrink-0 object-contain object-left`}
      />
    )
  return (
    <img
      src={logoUrl}
      alt={`Logo de ${name}`}
      className={`${tile} shrink-0 rounded-2xl bg-white object-contain p-2`}
      style={ink === null ? { visibility: 'hidden' } : undefined}
    />
  )
}
