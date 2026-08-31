import {
  DEFAULT_AQUA_PRODUCTS,
  type MagazinePageContent,
  type MagazineProductContent,
} from '../../../components/magazine/templateCatalog'

export const SERIF = '"DM Serif Display", Georgia, serif'
export const MONO = '"IBM Plex Mono", "Courier New", monospace'
export const SANS = 'Inter, system-ui, sans-serif'

export const COLORS = {
  ink: '#1B1D1B',
  paper: '#F1EEE7',
  dark: '#252725',
  darkInk: '#F5F1E8',
  muted: '#746E62',
  darkMuted: '#D8D6CF',
  sand: '#D6C8AD',
  shower: '#D9D4C7',
  history: '#E8E1D3',
  sources: '#222522',
  coupons: '#D6C8AD',
}

export const IMAGES = {
  cover: '/pencil/aqua-objects/x4XJN.png',
  monolith: '/pencil/aqua-objects/idcKU.png',
  fittings: '/pencil/aqua-objects/ac0MG.png',
  history: '/pencil/aqua-objects/N6NA6m.png',
  paleRoom: '/pencil/aqua-objects/pale-room.jpg',
  brassRoom: '/pencil/aqua-objects/brass-room.jpg',
  steamRoom: '/pencil/aqua-objects/steam-room.jpg',
}

export function Page({
  background,
  children,
  className = '',
}: {
  background: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`relative mx-auto min-h-[900px] w-full max-w-[700px] overflow-hidden ${className}`}
      style={{ background, color: COLORS.ink }}
    >
      {children}
    </section>
  )
}

export function Folio({
  children,
  color = COLORS.muted,
  field = false,
}: {
  children: React.ReactNode
  color?: string
  field?: boolean
}) {
  return (
    <p
      {...(field ? { 'data-magazine-field': 'eyebrow' } : {})}
      className="text-[10px] uppercase tracking-[1.1px]"
      style={{ color, fontFamily: MONO }}
    >
      {children}
    </p>
  )
}

export function Footer({
  children,
  color = COLORS.muted,
}: {
  children: React.ReactNode
  color?: string
}) {
  return (
    <p
      data-magazine-field="footer"
      className="text-[9px] uppercase tracking-[.8px]"
      style={{ color, fontFamily: MONO }}
    >
      {children}
    </p>
  )
}

export function Photo({
  src,
  alt,
  className = '',
  position = 'center',
}: {
  src: string
  alt: string
  className?: string
  position?: string
}) {
  return (
    <img
      data-magazine-field="image"
      src={src}
      alt={alt}
      className={`block w-full object-cover ${className}`}
      style={{ objectPosition: position }}
    />
  )
}

export function imagePosition(content: MagazinePageContent, index: number) {
  return content.imagePositions?.[index] ?? 'center'
}

export function productsFor(
  content: MagazinePageContent,
  layout: string
): MagazineProductContent[] {
  if (content.products !== undefined) return content.products
  return DEFAULT_AQUA_PRODUCTS[layout] ?? []
}

