import { getT } from '../../lib/i18n'
import type { Item, Tenant, ListDesign } from '../../types'

/* ── Shared helpers (used by MenuScreen's Storefront/CartView and the designs) ── */

// Lighten a hex color toward white (0..1). Builds a brand gradient from a single color.
export function lighten(hex: string, amt = 0.4): string {
  const m = hex.replace('#', '')
  const n = m.length === 3 ? m.split('').map((c) => c + c).join('') : m.padEnd(6, '0').slice(0, 6)
  const ch = (i: number) => Math.round(parseInt(n.slice(i, i + 2), 16) + (255 - parseInt(n.slice(i, i + 2), 16)) * amt)
  return `#${[ch(0), ch(2), ch(4)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

// Append an alpha channel to a hex color (a in 0..1). Used to scrim a design over a background image.
export function withAlpha(hex: string, a: number): string {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6)
  return `#${n}${Math.round(a * 255).toString(16).padStart(2, '0')}`
}

/** Background color for a design root: solid normally, or a translucent scrim when a bg image is set. */
const rootBg = (base: string, hasBg: boolean, a = 0.62) => (hasBg ? withAlpha(base, a) : base)

/** Pick black or white text for good contrast over a solid hex background. */
export function readableOn(hex: string): string {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6)
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16))
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? '#141414' : '#FFFFFF'
}

const STORE_ICONS: Record<string, React.ReactNode> = {
  'shopping-bag': <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
  'shopping-cart': <><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
  minus: <path d="M5 12h14" />,
  x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  'arrow-left': <><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>,
  'shield-check': <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>,
  'message-circle': <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  'share-2': <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></>,
  wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  paintbrush: <><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" /><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" /><path d="M14.5 17.5 4.5 15" /></>,
  layers: <><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22 12.18-9.17 4.16a2 2 0 0 1-1.66 0L2 12.18" /><path d="m22 17.18-9.17 4.16a2 2 0 0 1-1.66 0L2 17.18" /></>,
  cog: <><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>,
  droplets: <><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 4.8 7 3c-.29 1.8-1.14 3.14-2.29 4.06S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" /><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" /></>,
  check: <polyline points="20 6 9 17 4 12" />,
  box: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>,
}

export function SIco({ name, size = 16, color = 'currentColor', style }: { name: string; size?: number; color?: string; style?: React.CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">{STORE_ICONS[name] ?? STORE_ICONS.box}</svg>
}

// Category → icon, mirroring the admin (productFormat). Falls back to a generic box.
const STORE_CAT_ICON: Record<string, string> = {
  ferretería: 'wrench', ferreteria: 'wrench', eléctricos: 'zap', electricos: 'zap',
  pinturas: 'paintbrush', construcción: 'layers', construccion: 'layers', herramientas: 'cog',
  lavadero: 'droplets', limpieza: 'droplets',
}
export const catIco = (cat?: string | null): string => (cat && STORE_CAT_ICON[cat.trim().toLowerCase()]) || 'box'

/* ── Shared types ── */
export interface StoreColors { bg: string; ink: string; body: string; muted: string; accent: string; accent2: string; line: string }
export type Section = { key: string; name: string; items: Item[]; min: number; max: number }

/* ── Cart theme: the sticky bar + checkout follow the selected design ── */
export interface CartTheme {
  isDark: boolean
  bg: string        // page background (solid)
  surface: string   // card background
  field: string     // input / stepper background
  divider: string   // subtle inner divider
  line: string      // borders
  ink: string       // headings
  body: string      // body text
  muted: string     // muted text
  footerBg: string
  footerText: string
}

const CART_THEMES: Record<ListDesign, CartTheme> = {
  store: { isDark: false, bg: '#FFFFFF', surface: '#FFFFFF', field: '#FFFFFF', divider: '#F1F5F9', line: '#E5E2DC', ink: '#0F0D1A', body: '#44424E', muted: '#84818E', footerBg: '#0F172A', footerText: '#94A3B8' },
  classic: { isDark: false, bg: '#FFFFFF', surface: '#FFFFFF', field: '#FFFFFF', divider: '#F1F5F9', line: '#E5E2DC', ink: '#0F0D1A', body: '#44424E', muted: '#84818E', footerBg: '#0F172A', footerText: '#94A3B8' },
  nordic: { isDark: false, bg: '#F3EBE2', surface: '#FBF7F1', field: '#FFFFFF', divider: '#E7DFD4', line: '#C5BEB6', ink: '#2B2620', body: '#4A4238', muted: '#6B6156', footerBg: '#211D16', footerText: '#C9C0B4' },
  fine: { isDark: true, bg: '#10100F', surface: '#1B1A16', field: '#242019', divider: '#2A2620', line: '#34302A', ink: '#F7F2E8', body: '#D9D2C4', muted: '#A89C82', footerBg: '#0A0A09', footerText: '#8C8474' },
  modern: { isDark: false, bg: '#FFFFFF', surface: '#FFFFFF', field: '#FFFFFF', divider: '#EEF0F3', line: '#E5E7EB', ink: '#0F0F0F', body: '#374151', muted: '#6B7280', footerBg: '#111111', footerText: '#9CA3AF' },
  photo: { isDark: true, bg: '#0A0A0A', surface: '#161616', field: '#1C1C1C', divider: '#222222', line: '#2A2A2A', ink: '#F5F5F5', body: '#D4D4D4', muted: '#9A9A9A', footerBg: '#050505', footerText: '#8A8A8A' },
  cards: { isDark: false, bg: '#F4F7FB', surface: '#FFFFFF', field: '#FFFFFF', divider: '#EDF1F6', line: '#E2E8F0', ink: '#0F172A', body: '#334155', muted: '#64748B', footerBg: '#0F172A', footerText: '#94A3B8' },
  catalog: { isDark: false, bg: '#F8FAFC', surface: '#FFFFFF', field: '#FFFFFF', divider: '#EDF1F6', line: '#E2E8F0', ink: '#0F172A', body: '#334155', muted: '#64748B', footerBg: '#0B1F30', footerText: '#A9C0D0' },
  tech: { isDark: true, bg: '#0A0E16', surface: '#121826', field: '#161D2C', divider: '#20293A', line: '#26324A', ink: '#E8EDF5', body: '#B7C0D0', muted: '#7C879B', footerBg: '#070A11', footerText: '#7C879B' },
}
export const cartThemeFor = (design: ListDesign): CartTheme => CART_THEMES[design] ?? CART_THEMES.store

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
  addToCart: (id: string) => void
  decFromCart: (id: string) => void
  isService: boolean
  listName: string | null
  edition: string
  taxId: string | null
  hasBg: boolean
}

/* ── Shared add-to-cart control ── */
function CartControl({ qty, id, addToCart, decFromCart, accent, ink }: { qty: number; id: string; addToCart: (id: string) => void; decFromCart: (id: string) => void; accent: string; ink: string }) {
  if (qty > 0) {
    return (
      <div className="flex shrink-0 items-center gap-2 rounded-full border px-1.5 py-1" style={{ borderColor: accent }}>
        <button type="button" onClick={() => decFromCart(id)} aria-label="−" className="flex h-6 w-6 items-center justify-center rounded-full text-[15px] font-bold leading-none" style={{ color: accent }}>−</button>
        <span className="min-w-[14px] text-center text-[13px] font-bold" style={{ color: ink }}>{qty}</span>
        <button type="button" onClick={() => addToCart(id)} aria-label="+" className="flex h-6 w-6 items-center justify-center rounded-full text-[15px] font-bold leading-none text-white" style={{ background: accent }}>+</button>
      </div>
    )
  }
  return (
    <button type="button" onClick={() => addToCart(id)} aria-label="+" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[18px] font-bold leading-none hover:opacity-70" style={{ borderColor: accent, color: accent }}>+</button>
  )
}

const code = (it: Item, i: number) => `${(it.category?.trim() || 'GEN').slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`

/* ══════════════════════════════════════════════════════════════════════
   1) CLASSIC — the previous "compact" read-only price list (brand-tinted)
   ══════════════════════════════════════════════════════════════════════ */
export function ClassicList(p: DesignProps) {
  const { tenant, C, accent, brandGradient, t, money, currency, updated, monthYear, sections, base, cat, setCat, q, setQ, isService, listName, edition, taxId, cart, addToCart, decFromCart } = p
  const visibleSections = cat === 'all' ? sections : sections.filter((s) => s.key === cat)

  return (
    <>
      <div className="h-1.5 w-full" style={{ background: brandGradient }} />
      <div style={{ background: `linear-gradient(180deg, ${accent}12 0%, ${accent}00 560px)` }}>
        <div className="mx-auto w-full max-w-[1160px] px-6 md:px-12">
          <header className="pb-8 pt-10">
            <div className="mb-5 flex items-center gap-3">
              {tenant.logoUrl
                ? <img src={tenant.logoUrl} alt={tenant.name} className="h-14 w-auto max-w-[180px] object-contain" />
                : (
                  <>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-[20px] font-black text-white shadow-sm" style={{ background: brandGradient }}>{(tenant.name || '·').charAt(0).toUpperCase()}</span>
                    <span className="text-[18px] font-extrabold tracking-tight" style={{ color: C.ink }}>{tenant.name}</span>
                  </>
                )}
            </div>
            <div className="h-1 w-14 rounded-full" style={{ background: brandGradient }} />
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
              <span className="flex items-center gap-2 rounded-full border bg-white px-2.5 py-1.5" style={{ borderColor: C.line }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.accent }} />
                <span className="text-[11px] font-semibold tracking-[2px]" style={{ color: C.muted }}>{t('pub.edition', { n: edition })}</span>
              </span>
              <div className="flex-1" />
              <div className="flex flex-wrap items-center gap-4">
                <span className="rounded-full border px-3 py-1 text-[11px] font-bold tracking-[2px]" style={{ borderColor: C.accent, color: C.accent }}>{t('pub.public')}</span>
                <span className="text-[12px] font-medium" style={{ color: C.muted }}>{t('pub.updated', { date: updated })}</span>
              </div>
            </div>

            <div className="my-5 h-px w-full" style={{ background: C.line }} />

            <div className="flex items-end gap-5">
              <span className="hidden h-[72px] w-1.5 sm:block" style={{ background: C.accent }} />
              <h1 className="flex flex-wrap items-end gap-x-4 text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">
                <span style={{ color: C.ink }}>{t('pub.titleA')}</span>
                <span style={{ background: brandGradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{t('pub.titleB')}</span>
              </h1>
              <div className="flex-1" />
              <span className="hidden rounded-lg px-3 py-2 text-[12px] font-bold sm:block" style={{ background: `${accent}12`, border: `1px solid ${accent}33`, color: C.accent }}>{currency} · {monthYear}</span>
            </div>

            <p className="mt-6 max-w-[720px] text-[16px] leading-relaxed" style={{ color: C.body }}>
              {tenant.description || t('pub.intro', { listPrefix: listName ? `${listName}. ` : '', name: tenant.name })}
            </p>

            <div className="my-5 h-px w-full" style={{ background: C.line }} />

            <div className="flex flex-wrap gap-x-12 gap-y-4 pt-1">
              <Meta C={C} label={t('pub.issuedBy')} value={tenant.name} />
              {taxId && <Meta C={C} label={t('pub.taxId')} value={taxId} />}
              <Meta C={C} label={t('pub.catalog')} value={listName ?? t('pub.allLists')} />
              <Meta C={C} label={t('pub.updatedLabel')} value={updated} />
              <Meta C={C} label={t('pub.currency')} value={currency} />
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-3 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <FilterTab C={C} active={cat === 'all'} onClick={() => setCat('all')} name={t('pub.all')} count={base.length} accent={C.accent} />
              {sections.map((s) => (
                <span key={s.key} className="flex items-center gap-3">
                  <span className="h-3 w-px" style={{ background: C.line }} />
                  <FilterTab C={C} active={cat === s.key} onClick={() => setCat(s.key)} name={s.name} count={s.items.length} accent={C.accent} />
                </span>
              ))}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <label className="flex h-10 items-center gap-2.5 rounded-xl px-3.5" style={{ background: `${accent}12`, border: `1px solid ${accent}26` }}>
                <SIco name="search" size={16} color={C.muted} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('pub.search')} className="w-72 max-w-[60vw] border-0 bg-transparent text-[13px] outline-none placeholder:text-[#84818E] focus:ring-0" style={{ color: C.ink }} />
              </label>
            </div>
          </div>

          <main className="flex flex-col gap-7 pb-24 pt-4">
            {visibleSections.length === 0 ? (
              <p className="py-16 text-center text-sm font-medium" style={{ color: C.muted }}>{t('pub.empty')}</p>
            ) : (
              visibleSections.map((s, si) => (
                <section key={s.key} className="rounded-[24px] border bg-white p-6 shadow-[0_12px_32px_-10px_rgba(30,27,75,0.14)] md:p-7" style={{ borderColor: lighten(accent, 0.84) }}>
                  <div className="flex items-end justify-between border-b-2 pb-3" style={{ borderColor: C.accent }}>
                    <div className="flex items-end gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl text-[17px] font-bold leading-none text-white" style={{ background: brandGradient }}>{String(si + 1).padStart(2, '0')}</span>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[28px] font-extrabold leading-none md:text-[36px]" style={{ color: C.ink }}>{s.name}</span>
                        <span className="text-[11px]" style={{ color: C.muted }}>{s.items.length} {s.items.length === 1 ? t('pub.product') : t('pub.products')}</span>
                      </div>
                    </div>
                    <div className="hidden items-end gap-6 sm:flex">
                      <div className="flex flex-col items-end gap-0.5"><span className="text-[10px] font-semibold tracking-[1.5px]" style={{ color: C.muted }}>{t('pub.from')}</span><span className="text-[13px] font-semibold" style={{ color: C.ink }}>{money(s.min)}</span></div>
                      <div className="flex flex-col items-end gap-0.5"><span className="text-[10px] font-semibold tracking-[1.5px]" style={{ color: C.muted }}>{t('pub.to')}</span><span className="text-[13px] font-semibold" style={{ color: C.ink }}>{money(s.max)}</span></div>
                    </div>
                  </div>

                  <div>
                    {s.items.map((it, i) => (
                      <div key={it.id} className="flex items-center gap-3 border-b py-4 md:gap-5" style={{ borderColor: C.line }}>
                        <span className="hidden w-[96px] shrink-0 text-[13px] font-medium md:block" style={{ color: C.muted }}>{code(it, i)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[16px] font-medium" style={{ color: C.ink }}>{it.name}</p>
                          {it.description && <p className="mt-0.5 text-[12px]" style={{ color: C.muted }}>{it.description}</p>}
                        </div>
                        <span className="mx-2 hidden flex-1 translate-y-[-3px] border-b border-dotted md:block" style={{ borderColor: '#CBC8C0' }} />
                        <div className="flex shrink-0 flex-col items-end">
                          <span className="text-[18px] font-bold md:text-[20px]" style={{ color: C.ink }}>{money(it.price)}</span>
                        </div>
                        {!isService && <CartControl qty={cart[it.id] ?? 0} id={it.id} addToCart={addToCart} decFromCart={decFromCart} accent={accent} ink={C.ink} />}
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </main>

          <footer className="flex flex-col items-center gap-3 border-t py-10 text-center" style={{ borderColor: C.line }}>
            <div className="h-1 w-16 rounded-full" style={{ background: brandGradient }} />
            <span className="text-base font-black uppercase tracking-[0.2em]" style={{ background: brandGradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{tenant.name}</span>
            <p className="text-xs font-medium" style={{ color: C.muted }}>{t('pub.footer', { currency })}</p>
          </footer>
        </div>
      </div>
    </>
  )
}

function Meta({ C, label, value }: { C: StoreColors; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold tracking-[1.5px]" style={{ color: C.muted }}>{label}</span>
      <span className="text-[13px] font-medium" style={{ color: C.ink }}>{value}</span>
    </div>
  )
}

function FilterTab({ C, active, onClick, name, count, accent }: { C: StoreColors; active: boolean; onClick: () => void; name: string; count: number; accent: string }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 py-0.5">
      {active && <span className="h-[5px] w-[5px] rounded-full" style={{ background: accent }} />}
      <span className="text-[12px]" style={{ color: active ? accent : C.body, fontWeight: active ? 700 : 500 }}>{name}</span>
      <span className="text-[10px]" style={{ color: C.muted }}>({count})</span>
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   2) NORDIC — beige paper menu, serif, dotted leaders (jyR00)
   ══════════════════════════════════════════════════════════════════════ */
const SERIF = "'Playfair Display', 'Georgia', serif"

export function NordicMenu(p: DesignProps) {
  const { tenant, t, money, currency, updated, sections, isService, cart, addToCart, decFromCart } = p
  const paper = '#F3EBE2', ink = '#2B2620', soft = '#6B6156', line = '#C5BEB6', accent = p.accent

  return (
    <div style={{ background: rootBg(paper, p.hasBg), fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mx-auto w-full max-w-[900px] px-6 md:px-12">
        {/* Cover */}
        <header className="flex flex-col items-center gap-3 border-b py-14 text-center" style={{ borderColor: line }}>
          {tenant.logoUrl && <img src={tenant.logoUrl} alt={tenant.name} className="mb-2 h-16 w-auto max-w-[160px] object-contain" />}
          <span className="text-[11px] font-semibold uppercase tracking-[4px]" style={{ color: accent }}>{t('pub.public')}</span>
          <h1 className="text-5xl md:text-7xl" style={{ fontFamily: SERIF, color: ink, fontWeight: 600 }}>{tenant.name}</h1>
          {tenant.description && <p className="max-w-[560px] text-[14px] leading-relaxed" style={{ color: soft }}>{tenant.description}</p>}
          <span className="mt-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[2px]" style={{ borderColor: line, color: soft }}>{currency} · {t('pub.updated', { date: updated })}</span>
        </header>

        {/* Sections */}
        <main className="flex flex-col gap-12 py-14">
          {sections.length === 0 ? (
            <p className="py-16 text-center text-sm" style={{ color: soft }}>{t('pub.empty')}</p>
          ) : sections.map((s) => (
            <section key={s.key} className="flex flex-col gap-1">
              <div className="mb-3 flex flex-col items-center gap-2 text-center">
                <h2 className="text-[26px] md:text-[32px]" style={{ fontFamily: SERIF, color: ink, fontWeight: 600 }}>{s.name}</h2>
                <span className="h-px w-16" style={{ background: accent }} />
              </div>
              {s.items.map((it) => (
                <div key={it.id} className="flex items-baseline gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold" style={{ color: ink }}>{it.name}</p>
                    {it.description && <p className="mt-0.5 text-[12px] italic" style={{ color: soft }}>{it.description}</p>}
                  </div>
                  <span className="mx-1 min-w-[16px] flex-1 translate-y-[-3px] border-b border-dotted" style={{ borderColor: '#B9B0A4' }} />
                  <span className="shrink-0 text-[16px] font-semibold tabular-nums" style={{ color: ink }}>{money(it.price)}</span>
                  {!isService && <CartControl qty={cart[it.id] ?? 0} id={it.id} addToCart={addToCart} decFromCart={decFromCart} accent={accent} ink={ink} />}
                </div>
              ))}
            </section>
          ))}
        </main>

        <footer className="flex flex-col items-center gap-2 border-t py-10 text-center" style={{ borderColor: line }}>
          <span className="text-[15px] uppercase tracking-[3px]" style={{ fontFamily: SERIF, color: ink }}>{tenant.name}</span>
          <p className="text-[11px]" style={{ color: soft }}>{t('pub.footer', { currency })}</p>
        </footer>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   3) FINE DINING — dark stage, cream sheet, gold accents, serif (IPt2q)
   ══════════════════════════════════════════════════════════════════════ */
export function FineDining(p: DesignProps) {
  const { tenant, t, money, currency, updated, sections, isService, cart, addToCart, decFromCart } = p
  const stage = '#10100F', paper = '#F7F2E8', ink = '#211D16', soft = '#6E6656', gold = '#B69A62'

  return (
    <div style={{ background: rootBg(stage, p.hasBg, 0.5), padding: '40px 0', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mx-auto w-full max-w-[1000px] px-4">
        <div className="mx-auto w-full border p-8 md:p-16" style={{ background: paper, borderColor: gold }}>
          {/* Masthead */}
          <header className="flex flex-col items-center gap-4 text-center">
            {tenant.logoUrl
              ? <img src={tenant.logoUrl} alt={tenant.name} className="h-16 w-auto max-w-[150px] object-contain" />
              : <span className="flex h-14 w-14 items-center justify-center rounded-full border text-[20px] font-bold" style={{ borderColor: gold, color: gold, fontFamily: SERIF }}>{(tenant.name || '·').charAt(0).toUpperCase()}</span>}
            <span className="text-[11px] font-semibold uppercase tracking-[5px]" style={{ color: gold }}>{t('pub.updated', { date: updated })}</span>
            <h1 className="text-5xl md:text-7xl" style={{ fontFamily: SERIF, color: ink, fontWeight: 600 }}>{tenant.name}</h1>
            {tenant.description && <p className="max-w-[560px] text-[13px] leading-relaxed" style={{ color: soft }}>{tenant.description}</p>}
            <span className="h-px w-24" style={{ background: gold }} />
          </header>

          {/* Sections */}
          <main className="flex flex-col gap-11 pt-12">
            {sections.length === 0 ? (
              <p className="py-16 text-center text-sm" style={{ color: soft }}>{t('pub.empty')}</p>
            ) : sections.map((s, si) => (
              <section key={s.key} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold tabular-nums" style={{ color: gold }}>{String(si + 1).padStart(2, '0')}</span>
                  <h2 className="text-[22px] md:text-[26px]" style={{ fontFamily: SERIF, color: ink, fontWeight: 600 }}>{s.name}</h2>
                  <span className="h-px flex-1" style={{ background: `${gold}66` }} />
                </div>
                {s.items.map((it) => (
                  <div key={it.id} className="flex items-baseline gap-3 py-1.5">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold" style={{ color: ink }}>{it.name}</p>
                      {it.description && <p className="mt-0.5 text-[12px] italic" style={{ color: soft }}>{it.description}</p>}
                    </div>
                    <span className="mx-1 min-w-[16px] flex-1 translate-y-[-3px] border-b border-dotted" style={{ borderColor: '#CDBF9F' }} />
                    <span className="shrink-0 text-[15px] font-semibold tabular-nums" style={{ color: ink }}>{money(it.price)}</span>
                    {!isService && <CartControl qty={cart[it.id] ?? 0} id={it.id} addToCart={addToCart} decFromCart={decFromCart} accent={gold} ink={ink} />}
                  </div>
                ))}
              </section>
            ))}
          </main>

          <footer className="mt-14 flex flex-col items-center gap-2 border-t pt-8 text-center" style={{ borderColor: `${gold}55` }}>
            <span className="text-[14px] uppercase tracking-[4px]" style={{ fontFamily: SERIF, color: ink }}>{tenant.name}</span>
            <p className="text-[11px]" style={{ color: soft }}>{t('pub.footer', { currency })}</p>
          </footer>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   4) MODERN BRAND — white, bold, accent proof strip, tabular rows (KkLqy)
   ══════════════════════════════════════════════════════════════════════ */
export function ModernBrand(p: DesignProps) {
  const { tenant, t, money, currency, updated, sections, base, allItems, isService, cart, addToCart, decFromCart } = p
  const accent = p.accent, hero = p.heroColor, heroInk = readableOn(p.heroColor), ink = '#0F0F0F', soft = '#6B7280', line = '#E5E7EB'
  const stat = (v: string, l: string) => (
    <div className="flex flex-col gap-0.5"><span className="text-[22px] font-black md:text-[26px]" style={{ color: heroInk }}>{v}</span><span className="text-[11px] font-semibold" style={{ color: heroInk, opacity: 0.75 }}>{l}</span></div>
  )

  return (
    <div style={{ background: rootBg('#FFFFFF', p.hasBg), fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Masthead */}
      <header className="border-b" style={{ borderColor: line }}>
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-6 py-10 md:px-12">
          <div className="flex items-center gap-3">
            {tenant.logoUrl
              ? <img src={tenant.logoUrl} alt={tenant.name} className="h-12 w-auto max-w-[160px] object-contain" />
              : <span className="flex h-12 w-12 items-center justify-center rounded-xl text-[18px] font-black text-white" style={{ background: accent }}>{(tenant.name || '·').charAt(0).toUpperCase()}</span>}
            <span className="text-[15px] font-bold" style={{ color: ink }}>{tenant.name}</span>
          </div>
          <h1 className="max-w-[820px] text-4xl font-black leading-[1.05] tracking-tight md:text-6xl" style={{ color: ink }}>
            {tenant.description || t('store.heroTitle', { name: tenant.name })}
          </h1>
        </div>
      </header>

      {/* Proof strip (uses the configurable hero color) */}
      <div style={{ background: hero }}>
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap gap-x-14 gap-y-4 px-6 py-6 md:px-12">
          {stat(String(allItems.length), t('store.statProducts'))}
          {stat(String(sections.length), t('store.categories'))}
          {stat(updated, t('store.statUpdated'))}
          {stat(currency, t('pub.currency'))}
        </div>
      </div>

      {/* Body */}
      <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-10 px-6 py-12 md:px-12">
        {sections.length === 0 ? (
          <p className="py-16 text-center text-sm font-medium" style={{ color: soft }}>{t('pub.empty')}</p>
        ) : sections.map((s) => (
          <section key={s.key} className="flex flex-col">
            <div className="flex items-baseline justify-between border-b-2 pb-2" style={{ borderColor: ink }}>
              <h2 className="text-[20px] font-extrabold md:text-[24px]" style={{ color: ink }}>{s.name}</h2>
              <span className="text-[12px] font-bold" style={{ color: soft }}>{s.items.length} · {money(s.min)}–{money(s.max)}</span>
            </div>
            {s.items.map((it) => (
              <div key={it.id} className="flex items-center gap-4 border-b py-3.5" style={{ borderColor: line }}>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold" style={{ color: ink }}>{it.name}</p>
                  {it.description && <p className="mt-0.5 line-clamp-1 text-[12px] font-medium" style={{ color: soft }}>{it.description}</p>}
                </div>
                <span className="shrink-0 text-[18px] font-black tabular-nums" style={{ color: ink }}>{money(it.price)}</span>
                {!isService && <CartControl qty={cart[it.id] ?? 0} id={it.id} addToCart={addToCart} decFromCart={decFromCart} accent={accent} ink={ink} />}
              </div>
            ))}
          </section>
        ))}
        <p className="pt-2 text-[12px] font-medium" style={{ color: soft }}>{t('store.showing', { n: String(base.length), total: String(allItems.length) })}</p>
      </main>

      {/* Footer */}
      <footer className="py-10" style={{ background: '#111111' }}>
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-2 px-6 md:px-12">
          <span className="text-[16px] font-bold text-white">{tenant.name}</span>
          <span className="text-[12px] font-medium" style={{ color: '#9CA3AF' }}>{t('pub.footer', { currency })}</span>
        </div>
      </footer>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   5) PHOTO LOOKBOOK — dark, product photos, catalog boards (waReV)
   ══════════════════════════════════════════════════════════════════════ */
export function PhotoLookbook(p: DesignProps) {
  const { tenant, t, money, currency, updated, sections, allItems, isService, cart, addToCart, decFromCart } = p
  const bg = '#0A0A0A', panel = '#161616', ink = '#F5F5F5', soft = '#9A9A9A', accent = p.accent
  const featured = [...allItems].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)).slice(0, 3)

  const Thumb = ({ it, className }: { it: Item; className?: string }) => (
    <div className={`relative flex items-center justify-center overflow-hidden ${className ?? ''}`} style={{ background: panel }}>
      {it.imageUrl
        ? <img src={it.imageThumbUrl || it.imageUrl} alt={it.name} className="absolute inset-0 h-full w-full object-cover" />
        : <SIco name={catIco(it.category)} size={40} color={accent} style={{ opacity: 0.5 }} />}
    </div>
  )

  return (
    <div style={{ background: rootBg(bg, p.hasBg, 0.5), fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mx-auto w-full max-w-[1120px] px-6 py-12 md:px-12">
        {/* Hero */}
        <header className="flex flex-col gap-4 pb-10">
          <div className="flex items-center gap-3">
            {tenant.logoUrl
              ? <img src={tenant.logoUrl} alt={tenant.name} className="h-11 w-auto max-w-[150px] object-contain" />
              : <span className="flex h-11 w-11 items-center justify-center rounded-xl text-[16px] font-black text-white" style={{ background: accent }}>{(tenant.name || '·').charAt(0).toUpperCase()}</span>}
            <span className="text-[14px] font-bold" style={{ color: ink }}>{tenant.name}</span>
            <span className="ml-auto text-[11px] font-medium" style={{ color: soft }}>{t('pub.updated', { date: updated })}</span>
          </div>
          <h1 className="max-w-[720px] text-4xl font-black leading-[1.05] tracking-tight md:text-6xl" style={{ color: ink }}>
            {tenant.description || t('store.heroTitle', { name: tenant.name })}
          </h1>
        </header>

        {/* Featured cards */}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 gap-4 pb-12 sm:grid-cols-3">
            {featured.map((it) => (
              <div key={it.id} className="flex flex-col overflow-hidden rounded-2xl" style={{ background: panel }}>
                <Thumb it={it} className="h-44 w-full" />
                <div className="flex items-center justify-between gap-2 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold" style={{ color: ink }}>{it.name}</p>
                    <span className="text-[18px] font-black" style={{ color: accent }}>{money(it.price)}</span>
                  </div>
                  {!isService && <CartControl qty={cart[it.id] ?? 0} id={it.id} addToCart={addToCart} decFromCart={decFromCart} accent={accent} ink={ink} />}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category boards */}
        <main className="flex flex-col gap-10">
          {sections.length === 0 ? (
            <p className="py-16 text-center text-sm font-medium" style={{ color: soft }}>{t('pub.empty')}</p>
          ) : sections.map((s) => (
            <section key={s.key} className="flex flex-col">
              <div className="flex items-baseline justify-between border-b pb-2" style={{ borderColor: '#262626' }}>
                <h2 className="text-[20px] font-extrabold md:text-[24px]" style={{ color: ink }}>{s.name}</h2>
                <span className="text-[12px] font-semibold" style={{ color: soft }}>{s.items.length}</span>
              </div>
              {s.items.map((it) => (
                <div key={it.id} className="flex items-center gap-4 border-b py-3" style={{ borderColor: '#1C1C1C' }}>
                  <Thumb it={it} className="h-14 w-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold" style={{ color: ink }}>{it.name}</p>
                    {it.description && <p className="mt-0.5 line-clamp-1 text-[12px] font-medium" style={{ color: soft }}>{it.description}</p>}
                  </div>
                  <span className="shrink-0 text-[17px] font-black tabular-nums" style={{ color: accent }}>{money(it.price)}</span>
                  {!isService && <CartControl qty={cart[it.id] ?? 0} id={it.id} addToCart={addToCart} decFromCart={decFromCart} accent={accent} ink={ink} />}
                </div>
              ))}
            </section>
          ))}
        </main>

        <footer className="mt-12 flex flex-col gap-2 border-t pt-8" style={{ borderColor: '#262626' }}>
          <span className="text-[15px] font-bold" style={{ color: ink }}>{tenant.name}</span>
          <span className="text-[12px] font-medium" style={{ color: soft }}>{t('pub.footer', { currency })}</span>
        </footer>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   6) CARDS — light service-oriented price cards grid (N7Y8MV Laundromat)
   ══════════════════════════════════════════════════════════════════════ */
export function ServiceCards(p: DesignProps) {
  const { tenant, t, money, currency, updated, sections, allItems, isService, cart, addToCart, decFromCart } = p
  const accent = p.accent, hero = p.heroColor, heroInk = readableOn(p.heroColor), ink = '#0F172A', soft = '#64748B', line = '#E2E8F0', card = '#FFFFFF', bg = '#F4F7FB'

  return (
    <div style={{ background: rootBg(bg, p.hasBg), fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mx-auto w-full max-w-[1120px] px-5 py-10 md:px-10">
        {/* Header */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
          <div className="flex flex-1 flex-col justify-center gap-3 rounded-3xl border bg-white p-6 md:p-8" style={{ borderColor: line }}>
            <div className="flex items-center gap-3">
              {tenant.logoUrl
                ? <img src={tenant.logoUrl} alt={tenant.name} className="h-11 w-auto max-w-[150px] object-contain" />
                : <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-[16px] font-black text-white" style={{ background: accent }}>{(tenant.name || '·').charAt(0).toUpperCase()}</span>}
              <span className="text-[13px] font-bold uppercase tracking-[2px]" style={{ color: accent }}>{t('store.badge')}</span>
            </div>
            <h1 className="text-3xl font-black leading-tight md:text-5xl" style={{ color: ink }}>{tenant.name}</h1>
            {tenant.description && <p className="max-w-[520px] text-[14px] font-medium" style={{ color: soft }}>{tenant.description}</p>}
          </div>
          <div className="flex w-full flex-col justify-center gap-2 rounded-3xl p-6 md:p-8 lg:w-[320px]" style={{ background: hero, color: heroInk }}>
            <span className="text-[11px] font-bold uppercase tracking-[2px]" style={{ color: heroInk, opacity: 0.8 }}>{t('pub.updated', { date: updated })}</span>
            <span className="text-[20px] font-extrabold leading-tight">{t('store.heroSub')}</span>
            <span className="mt-1 text-[13px] font-semibold" style={{ color: heroInk, opacity: 0.9 }}>{allItems.length} · {currency}</span>
          </div>
        </header>

        {/* Card grid per section */}
        <main className="flex flex-col gap-10 pt-10">
          {sections.length === 0 ? (
            <p className="py-16 text-center text-sm font-medium" style={{ color: soft }}>{t('pub.empty')}</p>
          ) : sections.map((s) => (
            <section key={s.key} className="flex flex-col gap-4">
              <div className="flex items-baseline gap-3">
                <h2 className="text-[13px] font-bold uppercase tracking-[2px]" style={{ color: accent }}>{s.name}</h2>
                <span className="h-px flex-1" style={{ background: line }} />
                <span className="text-[12px] font-semibold" style={{ color: soft }}>{s.items.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {s.items.map((it) => (
                  <div key={it.id} className="flex flex-col gap-2 rounded-2xl border p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)]" style={{ background: card, borderColor: line }}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${accent}18` }}><SIco name={catIco(it.category)} size={18} color={accent} /></span>
                    <p className="text-[14px] font-bold leading-tight" style={{ color: ink }}>{it.name}</p>
                    {it.description && <p className="line-clamp-2 text-[12px] font-medium" style={{ color: soft }}>{it.description}</p>}
                    <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                      <span className="text-[19px] font-black" style={{ color: accent }}>{money(it.price)}</span>
                      {!isService && <CartControl qty={cart[it.id] ?? 0} id={it.id} addToCart={addToCart} decFromCart={decFromCart} accent={accent} ink={ink} />}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>

        {/* Contact CTA */}
        <div className="mt-10 flex flex-col gap-2 rounded-3xl p-6 md:p-8" style={{ background: ink }}>
          <span className="text-[18px] font-extrabold text-white">{tenant.name}</span>
          {tenant.address && <span className="text-[13px] font-medium text-white/80">{tenant.address}</span>}
          {tenant.taxId && <span className="text-[13px] font-medium text-white/60">{t('pub.taxId')} {tenant.taxId}</span>}
          <span className="mt-1 text-[12px] font-medium text-white/60">{t('pub.footer', { currency })}</span>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   7) CATALOG — dark header + spec strip + white image grid (s12NN)
   ══════════════════════════════════════════════════════════════════════ */
export function ImageCatalog(p: DesignProps) {
  const { tenant, t, money, currency, updated, sections, allItems, base, isService, cart, addToCart, decFromCart } = p
  const accent = p.accent, hero = p.heroColor, heroDark = lighten(p.heroColor, -0.16), heroInk = readableOn(p.heroColor), ink = '#0F172A', soft = '#64748B', line = '#E2E8F0'
  const stat = (v: string, l: string) => (
    <div className="flex flex-col gap-0.5"><span className="text-[18px] font-extrabold md:text-[22px]" style={{ color: heroInk }}>{v}</span><span className="text-[10px] font-semibold uppercase tracking-[1.5px]" style={{ color: heroInk, opacity: 0.6 }}>{l}</span></div>
  )

  return (
    <div style={{ background: rootBg('#FFFFFF', p.hasBg), fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Hero header (uses the configurable hero color) */}
      <header style={{ background: hero }}>
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-5 py-9 md:px-12">
          <div className="flex items-center gap-3">
            {tenant.logoUrl
              ? <img src={tenant.logoUrl} alt={tenant.name} className="h-10 w-auto max-w-[150px] object-contain" />
              : <span className="flex h-10 w-10 items-center justify-center rounded-lg text-[15px] font-black" style={{ background: accent, color: readableOn(accent) }}>{(tenant.name || '·').charAt(0).toUpperCase()}</span>}
            <span className="text-[14px] font-bold" style={{ color: heroInk }}>{tenant.name}</span>
            <span className="ml-auto text-[11px] font-medium" style={{ color: heroInk, opacity: 0.55 }}>{t('pub.updated', { date: updated })}</span>
          </div>
          <h1 className="max-w-[720px] text-3xl font-black leading-tight md:text-5xl" style={{ color: heroInk }}>
            {tenant.description || t('store.heroTitle', { name: tenant.name })}
          </h1>
          {tenant.description && <p className="max-w-[560px] text-[13px] font-medium" style={{ color: heroInk, opacity: 0.72 }}>{t('store.heroSub')}</p>}
        </div>
      </header>

      {/* Spec strip */}
      <div style={{ background: heroDark }}>
        <div className="mx-auto grid w-full max-w-[1180px] grid-cols-2 gap-4 px-5 py-5 sm:grid-cols-4 md:px-12">
          {stat(String(allItems.length), t('store.statProducts'))}
          {stat(String(sections.length), t('store.categories'))}
          {stat(updated, t('store.statUpdated'))}
          {stat(currency, t('pub.currency'))}
        </div>
      </div>

      {/* White image grid */}
      <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-9 px-5 py-10 md:px-12">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[22px] font-extrabold md:text-[26px]" style={{ color: ink }}>{t('store.allProducts')}</h2>
          <span className="text-[12px] font-semibold" style={{ color: soft }}>{t('store.showing', { n: String(base.length), total: String(allItems.length) })}</span>
        </div>
        {sections.length === 0 ? (
          <p className="py-16 text-center text-sm font-medium" style={{ color: soft }}>{t('pub.empty')}</p>
        ) : sections.map((s) => (
          <section key={s.key} className="flex flex-col gap-4">
            <div className="flex items-baseline gap-3 border-b pb-2" style={{ borderColor: line }}>
              <span className="text-[11px] font-bold uppercase tracking-[2px]" style={{ color: accent }}>{s.name}</span>
              <span className="h-px flex-1" />
              <span className="text-[12px] font-semibold" style={{ color: soft }}>{s.items.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {s.items.map((it) => (
                <div key={it.id} className="flex flex-col overflow-hidden rounded-2xl border shadow-[0_4px_16px_rgba(15,23,42,0.06)]" style={{ background: '#FFFFFF', borderColor: line }}>
                  <div className="relative flex h-40 items-center justify-center" style={{ background: '#F1F5F9' }}>
                    {it.imageUrl
                      ? <img src={it.imageThumbUrl || it.imageUrl} alt={it.name} className="absolute inset-0 h-full w-full object-cover" />
                      : <SIco name={catIco(it.category)} size={44} color={accent} style={{ opacity: 0.4 }} />}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <p className="text-[14px] font-bold leading-tight" style={{ color: ink }}>{it.name}</p>
                    {it.description && <p className="line-clamp-1 text-[12px] font-medium" style={{ color: soft }}>{it.description}</p>}
                    <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                      <span className="text-[18px] font-black" style={{ color: ink }}>{money(it.price)}</span>
                      {!isService && <CartControl qty={cart[it.id] ?? 0} id={it.id} addToCart={addToCart} decFromCart={decFromCart} accent={accent} ink={ink} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Hero-colored footer */}
      <footer style={{ background: hero }}>
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-1 px-5 py-8 md:px-12">
          <span className="text-[15px] font-bold" style={{ color: heroInk }}>{tenant.name}</span>
          {tenant.address && <span className="text-[12px] font-medium" style={{ color: heroInk, opacity: 0.72 }}>{tenant.address}</span>}
          <span className="text-[12px] font-medium" style={{ color: heroInk, opacity: 0.55 }}>{t('pub.footer', { currency })}</span>
        </div>
      </footer>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   8) TECH — dark modern SaaS grid, accent glow, monospaced prices
   ══════════════════════════════════════════════════════════════════════ */
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

export function TechGrid(p: DesignProps) {
  const { tenant, t, money, currency, updated, sections, allItems, isService, cart, addToCart, decFromCart } = p
  const accent = p.accent, hero = p.heroColor
  const bg = '#0A0E16', panel = 'rgba(255,255,255,0.035)', panelSolid = '#121826', border = 'rgba(255,255,255,0.08)', ink = '#E8EDF5', soft = '#8A94A6'
  const grid: React.CSSProperties = {
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
    backgroundSize: '34px 34px',
  }

  return (
    <div style={{ background: rootBg(bg, p.hasBg, 0.55), fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mx-auto w-full max-w-[1180px] px-5 py-10 md:px-10 md:py-14">
        {/* Hero panel */}
        <header className="relative overflow-hidden rounded-3xl border p-7 md:p-11" style={{ borderColor: border, background: panelSolid }}>
          <div className="pointer-events-none absolute inset-0" style={grid} />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full" style={{ background: hero, filter: 'blur(90px)', opacity: 0.35 }} />
          <div className="relative flex flex-col gap-5">
            <div className="flex items-center gap-3">
              {tenant.logoUrl
                ? <img src={tenant.logoUrl} alt={tenant.name} className="h-10 w-auto max-w-[150px] object-contain" />
                : <span className="flex h-10 w-10 items-center justify-center rounded-xl text-[15px] font-black" style={{ background: accent, color: readableOn(accent) }}>{(tenant.name || '·').charAt(0).toUpperCase()}</span>}
              <span className="flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold" style={{ borderColor: border, color: soft, fontFamily: MONO }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} /> {tenant.name}
              </span>
              <span className="ml-auto text-[11px]" style={{ color: soft, fontFamily: MONO }}>{updated}</span>
            </div>
            <h1 className="max-w-[760px] text-4xl font-black leading-[1.05] tracking-tight md:text-6xl" style={{ color: ink }}>
              {tenant.description || t('store.heroTitle', { name: tenant.name })}
            </h1>
            <div className="flex flex-wrap gap-2.5">
              {[[String(allItems.length), t('store.statProducts')], [String(sections.length), t('store.categories')], [currency, t('pub.currency')], [updated, t('store.statUpdated')]].map(([v, l]) => (
                <div key={l} className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: border, background: panel }}>
                  <span className="text-[14px] font-bold" style={{ color: ink, fontFamily: MONO }}>{v}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[1.5px]" style={{ color: soft }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Data panels */}
        <main className="mt-6 flex flex-col gap-5">
          {sections.length === 0 ? (
            <p className="py-16 text-center text-sm font-medium" style={{ color: soft }}>{t('pub.empty')}</p>
          ) : sections.map((s, si) => (
            <section key={s.key} className="overflow-hidden rounded-2xl border" style={{ borderColor: border, background: panelSolid }}>
              <div className="flex items-center gap-3 border-b px-5 py-3.5" style={{ borderColor: border }}>
                <span className="text-[12px] font-bold" style={{ color: accent, fontFamily: MONO }}>{String(si + 1).padStart(2, '0')}</span>
                <h2 className="text-[16px] font-extrabold" style={{ color: ink }}>{s.name}</h2>
                <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold" style={{ borderColor: border, color: soft, fontFamily: MONO }}>{s.items.length}</span>
              </div>
              <div>
                {s.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-4 border-b px-5 py-3.5 transition-colors last:border-b-0 hover:bg-white/[0.02]" style={{ borderColor: border }}>
                    <span className="hidden h-1.5 w-1.5 shrink-0 rounded-full sm:block" style={{ background: accent }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold" style={{ color: ink }}>{it.name}</p>
                      {it.description && <p className="mt-0.5 line-clamp-1 text-[12px]" style={{ color: soft }}>{it.description}</p>}
                    </div>
                    <span className="shrink-0 text-[15px] font-bold tabular-nums" style={{ color: accent, fontFamily: MONO }}>{money(it.price)}</span>
                    {!isService && <CartControl qty={cart[it.id] ?? 0} id={it.id} addToCart={addToCart} decFromCart={decFromCart} accent={accent} ink={ink} />}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>

        <footer className="mt-8 flex items-center justify-between gap-3 border-t pt-6" style={{ borderColor: border }}>
          <span className="text-[13px] font-bold" style={{ color: ink }}>{tenant.name}</span>
          <span className="text-[11px]" style={{ color: soft, fontFamily: MONO }}>{t('pub.footer', { currency })}</span>
        </footer>
      </div>
    </div>
  )
}
