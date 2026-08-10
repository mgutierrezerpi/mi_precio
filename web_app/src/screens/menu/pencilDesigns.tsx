import type { CSSProperties } from 'react'
import { CartControl, type DesignProps, type Section } from './designs'
import type { ListDesign } from '../../types'
import { SpecialPencilList } from './pencilSpecialDesigns'

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

const PENCIL_VARIANTS = new Set<PencilVariant>([
  'pencil-bakery', 'pencil-garden', 'pencil-market', 'pencil-evening', 'pencil-workshop',
  'pencil-cheese', 'pencil-flower', 'pencil-flower-summer', 'pencil-flower-winter', 'pencil-flower-spring', 'pencil-wine',
  'pencil-cheese-alternating', 'pencil-hardware-alternating', 'pencil-hardware-weekend', 'pencil-hardware-shelf',
  'pencil-casa-ritual', 'pencil-casa-bath', 'pencil-casa-signature', 'pencil-casa-services', 'pencil-auto-detail',
  'pencil-blush-bloom', 'pencil-nova', 'pencil-beardy', 'pencil-calm-spa', 'pencil-union-barber',
  'pencil-studio-mono', 'pencil-beauty-issue', 'pencil-obsidian-quarterly',
])

export function isPencilVariant(design: ListDesign): design is PencilVariant {
  return PENCIL_VARIANTS.has(design as PencilVariant)
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
}

const PENCIL_IMAGES = {
  bakery:
    'https://images.unsplash.com/photo-1753826366896-170e04691b1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  garden:
    'https://images.unsplash.com/photo-1726950189914-8fe1016eb9c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  market:
    'https://images.unsplash.com/photo-1693140539040-aa567b436278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  evening:
    'https://images.unsplash.com/photo-1779282620211-810663eac20e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  workshop:
    'https://images.unsplash.com/photo-1695728130932-7b5967d59f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
}

const PENCIL_CONFIG: Partial<Record<PencilVariant, PencilConfig>> = {
  'pencil-bakery': {
    background: '#F4F2EF',
    ink: '#1A1A1A',
    muted: '#4A4A4A',
    accent: '#C8B496',
    darkPanel: '#1B1B1B',
    image: PENCIL_IMAGES.bakery,
    imageLabel: 'SATURDAY ONLY',
    imageTitle: 'the morning table',
    promoEyebrow: 'WEEKEND RITUAL',
    promoTitle: 'The pastry box',
    promoBody: 'Six bakery favourites, wrapped for a slow morning.',
    promoPrice: '$28',
    promoNote: 'pre-order by 5pm',
    footerLeft: '17 RUE DES FLEURS · OPEN DAILY 7–4',
    footerRight: 'PLEASE ASK ABOUT TODAY’S CAKES',
    layout: 'left-image',
  },
  'pencil-garden': {
    background: '#FBF7EF',
    ink: '#2A3029',
    muted: '#5D665B',
    accent: '#A6AD91',
    darkPanel: '#1B1B1B',
    image: PENCIL_IMAGES.garden,
    imageLabel: 'SATURDAY ONLY',
    imageTitle: 'the morning table',
    promoEyebrow: 'SPRING PICNIC',
    promoTitle: 'The garden box',
    promoBody: 'Six bright bakes for a sunlit table and a slow afternoon.',
    promoPrice: '$30',
    promoNote: 'available Fri–Sun',
    footerLeft: '17 RUE DES FLEURS · OPEN DAILY 7–4',
    footerRight: 'PLEASE ASK ABOUT TODAY’S CAKES',
    layout: 'top-image',
  },
  'pencil-market': {
    background: '#F8F1E7',
    ink: '#2B211D',
    muted: '#665650',
    accent: '#C86E4E',
    darkPanel: '#1B1B1B',
    image: PENCIL_IMAGES.market,
    imageLabel: 'SATURDAY ONLY',
    imageTitle: 'the morning table',
    promoEyebrow: 'MARKET SATURDAY',
    promoTitle: 'The apricot crate',
    promoBody: 'A generous collection of fruit-led favourites, made for sharing.',
    promoPrice: '$34',
    promoNote: 'limited bake',
    footerLeft: '17 RUE DES FLEURS · OPEN DAILY 7–4',
    footerRight: 'PLEASE ASK ABOUT TODAY’S CAKES',
    layout: 'top-promo',
  },
  'pencil-evening': {
    background: '#F2EFE9',
    ink: '#28231F',
    muted: '#655E55',
    accent: '#A99476',
    darkPanel: '#1B1B1B',
    image: PENCIL_IMAGES.evening,
    imageLabel: 'SATURDAY ONLY',
    imageTitle: 'the morning table',
    promoEyebrow: 'WINTER SUPPER',
    promoTitle: 'The candlelight box',
    promoBody: 'A warm collection of dark chocolate, spice and late-season citrus.',
    promoPrice: '$36',
    promoNote: 'pre-order 24 hours',
    footerLeft: '17 RUE DES FLEURS · OPEN DAILY 7–4',
    footerRight: 'PLEASE ASK ABOUT TODAY’S CAKES',
    layout: 'full-image',
  },
  'pencil-workshop': {
    background: '#E7ECE7',
    ink: '#20322C',
    muted: '#53625B',
    accent: '#809589',
    darkPanel: '#20322C',
    image: PENCIL_IMAGES.workshop,
    imageLabel: 'IN THE FIELD',
    imageTitle: 'made for the bench',
    promoEyebrow: 'WEEKEND PROJECT',
    promoTitle: 'The starter kit',
    promoBody: 'The everyday essentials for a good Saturday’s work.',
    promoPrice: '$48',
    promoNote: 'save 15%',
    footerLeft: '18 CEDAR STREET · OPEN 8–6',
    footerRight: 'ASK US ABOUT RENTALS',
    layout: 'top-promo',
  },
}

const SPECIAL_BASE: PencilConfig = {
  background: '#F5F1E8',
  ink: '#24231F',
  muted: '#6E6A61',
  accent: '#A98D68',
  darkPanel: '#1B1D1B',
  image: PENCIL_IMAGES.workshop,
  imageLabel: 'FEATURED',
  imageTitle: 'the good things',
  promoEyebrow: 'THIS WEEK',
  promoTitle: 'A considered collection',
  promoBody: 'Thoughtful details, made for a slower and better day.',
  promoPrice: '$48',
  promoNote: 'available now',
  footerLeft: 'OPEN DAILY · BY APPOINTMENT',
  footerRight: 'ASK US ABOUT THE DETAILS',
  layout: 'alternating',
}

const specialConfig = (overrides: Partial<PencilConfig>): PencilConfig => ({
  ...SPECIAL_BASE,
  ...overrides,
})

const SPECIAL_CONFIG: Partial<Record<PencilVariant, PencilConfig>> = {
  'pencil-cheese': specialConfig({
    background: '#F5EFE3',
    ink: '#3B2B21',
    muted: '#756154',
    accent: '#B67C55',
    image: '/pencil/templates/UED6s.png',
    imageLabel: 'FROMAGE & CO.',
    imageTitle: 'the cheese room',
    promoEyebrow: 'BOARD + PANTRY',
    promoTitle: 'The supper board',
    promoBody: 'A generous gathering of cheese, fruit, bread and something sparkling.',
    promoPrice: '$55',
    promoNote: 'serves 2–4',
    layout: 'top-image',
  }),
  'pencil-flower': specialConfig({
    background: '#F3EEE4',
    ink: '#344238',
    muted: '#6E776D',
    accent: '#879D82',
    image: '/pencil/templates/BVICw.png',
    imageLabel: 'WILD STEM STUDIO · DAILY FLOWERS',
    imageTitle: 'flowers for an ordinary day',
    promoEyebrow: 'FLOWER NOTE',
    promoTitle: 'Flowers, every Friday.',
    promoBody: 'A changing bouquet for the table, gathered close to home.',
    promoPrice: '$48',
    promoNote: 'subscription',
    layout: 'left-image',
  }),
  'pencil-flower-summer': specialConfig({
    background: '#FAF0DD',
    ink: '#4E342A',
    muted: '#866958',
    accent: '#A67C62',
    image: '/pencil/templates/BVICw.png',
    imageLabel: 'WILD STEM STUDIO · SUMMER EDITION',
    imageTitle: 'the late-summer table',
    promoEyebrow: 'SEASONAL NOTE',
    promoTitle: 'A bouquet for the long table.',
    promoBody: 'Field-grown flowers and bright stems for a generous room.',
    promoPrice: '$72',
    promoNote: 'pre-order 48h',
    layout: 'left-image',
  }),
  'pencil-flower-winter': specialConfig({
    background: '#F1EEE8',
    ink: '#36413A',
    muted: '#6D766C',
    accent: '#9AA78E',
    image: '/pencil/templates/TQhws.png',
    imageLabel: 'WILD STEM STUDIO · WINTER EDITION',
    imageTitle: 'the winter room',
    promoEyebrow: 'DARKER DAYS',
    promoTitle: 'Flowers for the darker hours.',
    promoBody: 'Evergreen branches, paper whites and stems that bring the outside in.',
    promoPrice: '$68',
    promoNote: 'order by Thursday',
    layout: 'left-image',
  }),
  'pencil-flower-spring': specialConfig({
    background: '#F1F5E8',
    ink: '#3C4D3B',
    muted: '#6B7865',
    accent: '#91A27A',
    image: '/pencil/templates/TdSTl.png',
    imageLabel: 'WILD STEM STUDIO · SPRING EDITION',
    imageTitle: 'the green beginning',
    promoEyebrow: 'FIRST OF THE SEASON',
    promoTitle: 'The first flowers of spring.',
    promoBody: 'Fresh green stems and soft colour for the changing season.',
    promoPrice: '$64',
    promoNote: 'freshly gathered',
    layout: 'left-image',
  }),
  'pencil-wine': specialConfig({
    background: '#EEE7D9',
    ink: '#34251D',
    muted: '#786656',
    accent: '#C87852',
    image: PENCIL_IMAGES.evening,
    imageLabel: 'PARCHMENT CELLAR · NATURAL WINE',
    imageTitle: 'something beautiful to open',
    promoEyebrow: 'THE CELLAR LETTER',
    promoTitle: 'Three bottles, one small story.',
    promoBody: 'A small, changing shelf for dinners, gifts and long conversations.',
    promoPrice: '$75',
    promoNote: '3 bottles',
    layout: 'full-image',
  }),
  'pencil-cheese-alternating': specialConfig({
    background: '#F6F0E2',
    ink: '#3B2B21',
    muted: '#7A695C',
    accent: '#B67C55',
    image: '/pencil/templates/UED6s.png',
    imageLabel: 'FROMAGE & CO. · THE DAILY EDIT',
    imageTitle: 'a few good pieces',
    layout: 'alternating',
  }),
  'pencil-hardware-alternating': specialConfig({
    background: '#E7ECE7',
    ink: '#20322C',
    muted: '#53625B',
    accent: '#809589',
    darkPanel: '#20322C',
    image: PENCIL_IMAGES.workshop,
    imageLabel: 'NORTHLINE HARDWARE · OBJECTS FOR WORK',
    imageTitle: 'the tools you keep',
    layout: 'alternating',
  }),
  'pencil-hardware-weekend': specialConfig({
    background: '#ECEEE8',
    ink: '#20322C',
    muted: '#53625B',
    accent: '#809589',
    darkPanel: '#20322C',
    image: PENCIL_IMAGES.workshop,
    imageLabel: 'SATURDAY SHELF',
    imageTitle: 'weekend project',
    promoEyebrow: 'SATURDAY SPECIAL',
    promoTitle: 'The deck kit',
    promoBody: 'The practical essentials for a weekend afternoon outside.',
    promoPrice: '$84',
    promoNote: 'save 10%',
    layout: 'top-promo',
  }),
  'pencil-hardware-shelf': specialConfig({
    background: '#E6ECE7',
    ink: '#20322C',
    muted: '#53625B',
    accent: '#809589',
    darkPanel: '#20322C',
    image: PENCIL_IMAGES.workshop,
    imageLabel: 'NORTHLINE HARDWARE · OBJECTS FOR WORK',
    imageTitle: 'the workshop shelf',
    layout: 'hardware-shelf',
  }),
  'pencil-casa-ritual': specialConfig({
    background: '#E8EAEC',
    ink: '#202124',
    muted: '#6A6D70',
    accent: '#B5A384',
    darkPanel: '#171717',
    image: '/pencil/templates/b1fvV.png',
    imageLabel: 'CASA FÉRREA',
    imageTitle: 'El baño, como un ritual.',
    layout: 'casa-ritual',
  }),
  'pencil-casa-bath': specialConfig({
    background: '#FFFFFF',
    ink: '#090909',
    muted: '#686868',
    accent: '#B9A487',
    darkPanel: '#090909',
    image: '/pencil/templates/j1DN7.png',
    imageLabel: 'CASA FÉRREA',
    imageTitle: 'BAÑO EQUIPAR',
    layout: 'casa-bath',
  }),
  'pencil-casa-signature': specialConfig({
    background: '#F8F8F6',
    ink: '#171717',
    muted: '#707070',
    accent: '#D5D8D9',
    darkPanel: '#ECEEEF',
    image: '/pencil/templates/w6m36A.png',
    imageLabel: 'CASA FÉRREA',
    imageTitle: 'Signature reference',
    layout: 'casa-signature',
  }),
  'pencil-casa-services': specialConfig({
    background: '#050505',
    ink: '#FFFFFF',
    muted: '#A5A5A5',
    accent: '#FFFFFF',
    darkPanel: '#050505',
    image: '',
    layout: 'casa-services',
  }),
  'pencil-auto-detail': specialConfig({
    background: '#050505',
    ink: '#FFFFFF',
    muted: '#A9A9A9',
    accent: '#FF2A23',
    darkPanel: '#0B0B0B',
    image: '/pencil/templates/JJyIi.png',
    layout: 'auto-detail',
  }),
  'pencil-blush-bloom': specialConfig({
    background: '#F8E8EF',
    ink: '#F24AA6',
    muted: '#FF86C6',
    accent: '#F24AA6',
    darkPanel: '#08080A',
    image: '',
    layout: 'blush-bloom',
  }),
  'pencil-nova': specialConfig({
    background: '#5B4BCA',
    ink: '#FFFFFF',
    muted: '#F2D9FF',
    accent: '#FFFFFF',
    darkPanel: '#FFFFFF1A',
    image: '',
    layout: 'nova',
  }),
  'pencil-beardy': specialConfig({
    background: '#D9D5CB',
    ink: '#171313',
    muted: '#6C655D',
    accent: '#FFFFFF',
    darkPanel: '#050505',
    image: '/pencil/templates/mquE7.png',
    layout: 'beardy',
  }),
  'pencil-calm-spa': specialConfig({
    background: '#FFF7B5',
    ink: '#F9F4D0',
    muted: '#D6E0B6',
    accent: '#F9F4D0',
    darkPanel: '#173D2C',
    image: '',
    layout: 'calm-spa',
  }),
  'pencil-union-barber': specialConfig({
    background: '#FFFFFF',
    ink: '#17226C',
    muted: '#26305F',
    accent: '#D9232E',
    darkPanel: '#283B97',
    image: '',
    layout: 'union-barber',
  }),
  'pencil-studio-mono': specialConfig({
    background: '#FFFFFF',
    ink: '#292929',
    muted: '#6A6A6A',
    accent: '#292929',
    darkPanel: '#303030',
    image: '',
    layout: 'studio-mono',
  }),
  'pencil-beauty-issue': specialConfig({
    background: '#EDE9E2',
    ink: '#242022',
    muted: '#756C67',
    accent: '#242022',
    darkPanel: '#171416',
    image: '/pencil/templates/mquE7.png',
    layout: 'beauty-issue',
  }),
  'pencil-obsidian-quarterly': specialConfig({
    background: '#080A0D',
    ink: '#FFFFFF',
    muted: '#9AA4B1',
    accent: '#95A8D9',
    darkPanel: '#080A0D',
    image: '/pencil/templates/a2qkO.png',
    layout: 'obsidian-quarterly',
  }),
}

const SERIF = '"Playfair Display", Georgia, serif'
const MONO = '"IBM Plex Mono", "Courier New", monospace'
const SANS = 'Inter, system-ui, sans-serif'

const price = (value: string | number) => {
  const amount = typeof value === 'number' ? value : Number.parseFloat(value)
  if (Number.isNaN(amount)) return '$—'
  return `$${amount.toFixed(2).replace(/\.00$/, '')}`
}

function Rule({ color, background }: { color: string; background: string }) {
  return (
    <div className="relative my-7 h-px" style={{ background: color }}>
      <span
        className="absolute left-1/2 top-1/2 flex h-10 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        style={{ background }}
      >
        <span style={{ color, fontFamily: SERIF, fontSize: 22 }}>✦</span>
      </span>
    </div>
  )
}

function Masthead({
  eyebrow,
  title,
  body,
  color,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  body?: string
  color: PencilConfig
  align?: 'left' | 'center'
}) {
  return (
    <header
      className={`flex flex-col gap-1 ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
    >
      {eyebrow && (
        <p
          className="text-[10px] uppercase tracking-[2px] sm:text-[11px]"
          style={{ color: color.muted, fontFamily: MONO }}
        >
          {eyebrow}
        </p>
      )}
      <h1
        className="max-w-full break-words text-balance text-[44px] leading-none sm:text-[60px]"
        style={{ color: color.ink, fontFamily: SERIF, fontWeight: 400 }}
      >
        {title}
      </h1>
      {body && (
        <p
          className="max-w-[48ch] text-[13px] italic sm:text-[17px]"
          style={{ color: color.muted, fontFamily: SERIF }}
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
        <span className="text-[8px] uppercase tracking-[1.6px]" style={{ fontFamily: MONO }}>
          {config.imageLabel}
        </span>
        <span className="text-[16px] italic leading-none" style={{ fontFamily: SERIF }}>
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
        <span className="text-[10px] uppercase tracking-[1.6px]" style={{ color: config.accent, fontFamily: MONO }}>
          {config.promoEyebrow}
        </span>
        <h2 className="text-[32px] leading-none sm:text-[40px]" style={{ fontFamily: SERIF, fontWeight: 400 }}>
          {config.promoTitle}
        </h2>
        <p className="max-w-[32ch] text-[12px] leading-relaxed sm:text-[13px]" style={{ color: '#D9D3C8', fontFamily: SANS }}>
          {config.promoBody}
        </p>
      </div>
      <div className="flex items-end justify-between gap-4 pt-6">
        <span className="text-[28px]" style={{ fontFamily: SERIF }}>
          {config.promoPrice}
        </span>
        <span className="text-right text-[10px] uppercase tracking-[1px]" style={{ color: config.accent, fontFamily: MONO }}>
          {config.promoNote}
        </span>
      </div>
    </aside>
  )
}

function PencilItem({ item, color, props }: { item: Section['items'][number]; color: PencilConfig; props: DesignProps }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="break-words text-[18px] leading-tight sm:text-[21px]" style={{ color: color.ink, fontFamily: SERIF }}>
          {item.name}
        </p>
        {item.description && (
          <p className="mt-0.5 break-words text-[10px] leading-tight sm:text-[11px]" style={{ color: color.muted, fontFamily: SANS }}>
            {item.description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-start gap-2">
        <span className="pt-0.5 text-[11px] sm:text-[12px]" style={{ color: color.ink, fontFamily: MONO }}>
          {price(item.price)}
        </span>
        {!props.isService && <CartControl qty={props.cart[item.id] ?? 0} id={item.id} addToCart={props.addToCart} decFromCart={props.decFromCart} accent={color.accent} ink={color.ink} />}
      </div>
    </div>
  )
}

function PencilSection({ section, config, props }: { section: Section; config: PencilConfig; props: DesignProps }) {
  return (
    <section className="flex min-w-0 flex-col gap-2.5">
      <h2 className="text-[10px] uppercase tracking-[1.8px] sm:text-[11px]" style={{ color: config.accent, fontFamily: MONO }}>
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

function PencilCatalog({ sections, config, props }: { sections: Section[]; config: PencilConfig; props: DesignProps }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-10 md:gap-y-7">
      {sections.map((section) => (
        <PencilSection key={section.key} section={section} config={config} props={props} />
      ))}
    </div>
  )
}

function PencilFooter({ config }: { config: PencilConfig }) {
  return (
    <footer className="flex min-w-0 flex-col gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: `${config.accent}66` }}>
      <span className="break-words text-[10px] uppercase tracking-[1.5px] sm:text-[11px]" style={{ color: config.muted, fontFamily: MONO }}>
        {config.footerLeft}
      </span>
      <span className="break-words text-[10px] uppercase tracking-[1.5px] sm:text-right sm:text-[11px]" style={{ color: config.accent, fontFamily: MONO }}>
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
    fontFamily: SANS,
  }
  return (
    <div className="min-h-[100svh] w-full min-w-0 overflow-x-clip" style={style}>
      <div className="mx-auto flex min-w-0 w-full max-w-[920px] flex-col px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        {children}
      </div>
    </div>
  )
}

export function PencilList({ variant, ...props }: DesignProps & { variant: PencilVariant }) {
  const config = PENCIL_CONFIG[variant] ?? SPECIAL_CONFIG[variant] ?? SPECIAL_BASE
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
      <Masthead eyebrow={eyebrow} title={title} body={body} color={config} />
      <Rule color={config.accent} background={config.background} />
    </>
  )
  const catalog = <PencilCatalog sections={props.sections} config={config} props={props} />
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
          <Masthead eyebrow={eyebrow} title={title} body={body} color={config} align="left" />
          <PencilImage config={config} className="h-[156px]" />
        </div>
        <Rule color={config.accent} background={config.background} />
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
