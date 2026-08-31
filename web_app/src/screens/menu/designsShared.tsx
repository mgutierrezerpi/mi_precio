import { getT } from '../../lib/i18n'
import { withAlpha } from '../../lib/designColors'
import type { Item, Tenant, ListDesign, ListContent } from '../../types'

/* ── Shared helpers (used by MenuScreen's Storefront/CartView and the designs) ── */

/** Background color for a design root: solid normally, or a translucent scrim when a bg image is set. */
export const rootBg = (base: string, hasBg: boolean, a = 0.62) =>
  hasBg ? withAlpha(base, a) : base

const STORE_ICONS: Record<string, React.ReactNode> = {
  'shopping-bag': (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  'shopping-cart': (
    <>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  plus: (
    <>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </>
  ),
  'shield-check': (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  'message-circle': <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  'share-2': (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  paintbrush: (
    <>
      <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
      <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
      <path d="M14.5 17.5 4.5 15" />
    </>
  ),
  layers: (
    <>
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.18-9.17 4.16a2 2 0 0 1-1.66 0L2 12.18" />
      <path d="m22 17.18-9.17 4.16a2 2 0 0 1-1.66 0L2 17.18" />
    </>
  ),
  cog: (
    <>
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </>
  ),
  droplets: (
    <>
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 4.8 7 3c-.29 1.8-1.14 3.14-2.29 4.06S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
      <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  box: (
    <>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </>
  ),
}

export function SIco({
  name,
  size = 16,
  color = 'currentColor',
  style,
}: {
  name: string
  size?: number
  color?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {STORE_ICONS[name] ?? STORE_ICONS.box}
    </svg>
  )
}

/* ── Shared types ── */
export interface StoreColors {
  bg: string
  ink: string
  body: string
  muted: string
  accent: string
  accent2: string
  line: string
}
export type Section = {
  key: string
  name: string
  items: Item[]
  min: number
  max: number
}

/* ── Cart theme: the sticky bar + checkout follow the selected design ── */
export interface CartTheme {
  isDark: boolean
  bg: string // page background (solid)
  surface: string // card background
  field: string // input / stepper background
  divider: string // subtle inner divider
  line: string // borders
  ink: string // headings
  body: string // body text
  muted: string // muted text
  footerBg: string
  footerText: string
  /** Optional template-specific visual tokens used by the cart surface. */
  accent?: string
  actionAccent?: string
  cardRadius?: string
  controlRadius?: string
  buttonRadius?: string
  barRadius?: string
  bodyFamily?: string
  headingFamily?: string
  labelFamily?: string
  headingTracking?: string
  cardShadow?: string
}

const CART_DEFAULTS: Required<
  Pick<
    CartTheme,
    | 'cardRadius'
    | 'controlRadius'
    | 'buttonRadius'
    | 'barRadius'
    | 'bodyFamily'
    | 'headingFamily'
    | 'labelFamily'
    | 'headingTracking'
    | 'cardShadow'
  >
> = {
  cardRadius: '24px',
  controlRadius: '12px',
  buttonRadius: '16px',
  barRadius: '16px',
  bodyFamily: 'Inter, system-ui, sans-serif',
  headingFamily: 'Inter, system-ui, sans-serif',
  labelFamily: 'Inter, system-ui, sans-serif',
  headingTracking: 'normal',
  cardShadow: '0 18px 50px -20px rgba(15,13,26,0.30)',
}

const CART_THEMES: Partial<Record<ListDesign, CartTheme>> = {
  store: {
    isDark: false,
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    field: '#FFFFFF',
    divider: '#F1F5F9',
    line: '#E5E2DC',
    ink: '#0F0D1A',
    body: '#44424E',
    muted: '#84818E',
    footerBg: '#0F172A',
    footerText: '#94A3B8',
  },
  classic: {
    isDark: false,
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    field: '#FFFFFF',
    divider: '#F1F5F9',
    line: '#E5E2DC',
    ink: '#0F0D1A',
    body: '#44424E',
    muted: '#84818E',
    footerBg: '#0F172A',
    footerText: '#94A3B8',
  },
  nordic: {
    isDark: false,
    bg: '#F3EBE2',
    surface: '#FBF7F1',
    field: '#FFFFFF',
    divider: '#E7DFD4',
    line: '#C5BEB6',
    ink: '#2B2620',
    body: '#4A4238',
    muted: '#6B6156',
    footerBg: '#211D16',
    footerText: '#C9C0B4',
  },
  fine: {
    isDark: true,
    bg: '#10100F',
    surface: '#1B1A16',
    field: '#242019',
    divider: '#2A2620',
    line: '#34302A',
    ink: '#F7F2E8',
    body: '#D9D2C4',
    muted: '#A89C82',
    footerBg: '#0A0A09',
    footerText: '#8C8474',
  },
  modern: {
    isDark: false,
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    field: '#FFFFFF',
    divider: '#EEF0F3',
    line: '#E5E7EB',
    ink: '#0F0F0F',
    body: '#374151',
    muted: '#6B7280',
    footerBg: '#111111',
    footerText: '#9CA3AF',
  },
  photo: {
    isDark: true,
    bg: '#0A0A0A',
    surface: '#161616',
    field: '#1C1C1C',
    divider: '#222222',
    line: '#2A2A2A',
    ink: '#F5F5F5',
    body: '#D4D4D4',
    muted: '#9A9A9A',
    footerBg: '#050505',
    footerText: '#8A8A8A',
  },
  cards: {
    isDark: false,
    bg: '#F4F7FB',
    surface: '#FFFFFF',
    field: '#FFFFFF',
    divider: '#EDF1F6',
    line: '#E2E8F0',
    ink: '#0F172A',
    body: '#334155',
    muted: '#64748B',
    footerBg: '#0F172A',
    footerText: '#94A3B8',
  },
  catalog: {
    isDark: false,
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    field: '#FFFFFF',
    divider: '#EDF1F6',
    line: '#E2E8F0',
    ink: '#0F172A',
    body: '#334155',
    muted: '#64748B',
    footerBg: '#0B1F30',
    footerText: '#A9C0D0',
  },
  tech: {
    isDark: true,
    bg: '#0A0E16',
    surface: '#121826',
    field: '#161D2C',
    divider: '#20293A',
    line: '#26324A',
    ink: '#E8EDF5',
    body: '#B7C0D0',
    muted: '#7C879B',
    footerBg: '#070A11',
    footerText: '#7C879B',
  },
  'pencil-bakery': {
    isDark: false,
    bg: '#F4F2EF',
    surface: '#F4F2EF',
    field: '#FFFFFF',
    divider: '#E3DED5',
    line: '#C8B496',
    ink: '#1A1A1A',
    body: '#4A4A4A',
    muted: '#777168',
    footerBg: '#1B1B1B',
    footerText: '#D9D3C8',
  },
  'pencil-garden': {
    isDark: false,
    bg: '#FBF7EF',
    surface: '#FBF7EF',
    field: '#FFFFFF',
    divider: '#E7E3D7',
    line: '#A6AD91',
    ink: '#2A3029',
    body: '#5D665B',
    muted: '#7A8373',
    footerBg: '#1B1B1B',
    footerText: '#D9D3C8',
  },
  'pencil-market': {
    isDark: false,
    bg: '#F8F1E7',
    surface: '#F8F1E7',
    field: '#FFFFFF',
    divider: '#E9DCD0',
    line: '#C86E4E',
    ink: '#2B211D',
    body: '#665650',
    muted: '#85736B',
    footerBg: '#1B1B1B',
    footerText: '#D9D3C8',
  },
  'pencil-evening': {
    isDark: false,
    bg: '#F2EFE9',
    surface: '#F2EFE9',
    field: '#FFFFFF',
    divider: '#E4DED4',
    line: '#A99476',
    ink: '#28231F',
    body: '#655E55',
    muted: '#82786B',
    footerBg: '#1B1B1B',
    footerText: '#D9D3C8',
  },
  'pencil-workshop': {
    isDark: true,
    bg: '#E7ECE7',
    surface: '#F4F6F2',
    field: '#FFFFFF',
    divider: '#D4DDD4',
    line: '#809589',
    ink: '#20322C',
    body: '#53625B',
    muted: '#6B7A71',
    footerBg: '#20322C',
    footerText: '#C5D0C8',
  },
  'pencil-journal': {
    isDark: false,
    bg: '#EEE5D7',
    surface: '#F7F2EA',
    field: '#FAF5EC',
    divider: '#DED1C0',
    line: '#A76D3E',
    ink: '#3A2A1D',
    body: '#70583F',
    muted: '#8A7561',
    footerBg: '#3A2A1D',
    footerText: '#F3EDE2',
    accent: '#A76D3E',
    actionAccent: '#A76D3E',
    cardRadius: '0px',
    controlRadius: '0px',
    buttonRadius: '0px',
    barRadius: '0px',
    bodyFamily: 'Inter, system-ui, sans-serif',
    headingFamily: '"Playfair Display", Georgia, serif',
    labelFamily: '"IBM Plex Mono", "Courier New", monospace',
    headingTracking: '-0.03em',
    cardShadow: '0 16px 40px -22px rgba(58,42,29,0.32)',
  },
}
// Shared cart tokens are intentionally exported alongside their design catalogue.
// eslint-disable-next-line react-refresh/only-export-components
export const cartThemeFor = (design: ListDesign): CartTheme => ({
  ...CART_DEFAULTS,
  ...(CART_THEMES[design] ?? CART_THEMES.store!),
})

export interface DesignProps {
  tenant: Tenant
  C: StoreColors
  accent: string
  brandGradient: string
  heroColor: string
  t: ReturnType<typeof getT>
  money: (p: string | number) => string
  currency: string
  updated: string
  monthYear: string
  sections: Section[]
  base: Item[]
  allItems: Item[]
  cat: string
  setCat: (c: string) => void
  q: string
  setQ: (s: string) => void
  cart: Record<string, number>
  cartCount: number
  addToCart: (id: string) => void
  decFromCart: (id: string) => void
  openCart: () => void
  waHref: string
  checkoutChannel?: 'whatsapp' | 'instagram'
  onCheckout?: () => void
  isService: boolean
  listName: string | null
  edition: string
  taxId: string | null
  hasBg: boolean
  content?: ListContent | null
  cartTheme?: CartTheme
}

/* ── Shared add-to-cart control ── */
export function CartControl({
  qty,
  id,
  addToCart,
  decFromCart,
  accent,
  ink,
}: {
  qty: number
  id: string
  addToCart: (id: string) => void
  decFromCart: (id: string) => void
  accent: string
  ink: string
}) {
  if (qty > 0) {
    return (
      <div
        className="flex shrink-0 items-center gap-2 rounded-full border px-1.5 py-1"
        style={{ borderColor: accent }}
      >
        <button
          type="button"
          onClick={() => decFromCart(id)}
          aria-label="−"
          className="flex h-6 w-6 items-center justify-center rounded-full text-[15px] font-bold leading-none"
          style={{ color: accent }}
        >
          −
        </button>
        <span
          className="min-w-[14px] text-center text-[13px] font-bold"
          style={{ color: ink }}
        >
          {qty}
        </span>
        <button
          type="button"
          onClick={() => addToCart(id)}
          aria-label="+"
          className="flex h-6 w-6 items-center justify-center rounded-full text-[15px] font-bold leading-none text-white"
          style={{ background: accent }}
        >
          +
        </button>
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={() => addToCart(id)}
      aria-label="+"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[18px] font-bold leading-none hover:opacity-70"
      style={{ borderColor: accent, color: accent }}
    >
      +
    </button>
  )
}

export const code = (it: Item, i: number) =>
  `${(it.category?.trim() || 'GEN').slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`

/* ══════════════════════════════════════════════════════════════════════
   1) CLASSIC — the previous "compact" read-only price list (brand-tinted)
   ══════════════════════════════════════════════════════════════════════ */
