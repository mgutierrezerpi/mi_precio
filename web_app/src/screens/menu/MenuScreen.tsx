import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { LoadingSpinner } from '../../components'
import api from '../../services/api'
import { getT, localeOf } from '../../lib/i18n'
import type { Tenant, ListVersion, Item } from '../../types'

interface PublicList {
  id: string
  name: string
  slug: string | null
  kind?: 'product' | 'service'
  version: ListVersion & { items: Item[] }
}
interface PublicMenuData {
  tenant: Tenant
  lists: PublicList[]
}

// Dedupe view records within a short window (survives StrictMode remounts).
const recentViews = new Map<string, number>()

const BASE = {
  bg: '#FAFAF7', ink: '#0F0D1A', body: '#44424E', muted: '#84818E',
  accent: '#7C3AED', accent2: '#6D28D9', line: '#E5E2DC',
}

// Lighten a hex color toward white (0..1). Used to build a brand gradient from a single brand color.
function lighten(hex: string, amt = 0.4): string {
  const m = hex.replace('#', '')
  const n = m.length === 3 ? m.split('').map((c) => c + c).join('') : m.padEnd(6, '0').slice(0, 6)
  const ch = (i: number) => Math.round(parseInt(n.slice(i, i + 2), 16) + (255 - parseInt(n.slice(i, i + 2), 16)) * amt)
  return `#${[ch(0), ch(2), ch(4)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export function MenuScreen() {
  const { subdomain, listId } = useParams<{ subdomain: string; listId?: string }>()
  const [searchParams] = useSearchParams()
  const viewSource = searchParams.get('src') === 'qr' ? 'qr' : 'link'
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [lists, setLists] = useState<PublicList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cat, setCat] = useState<string>('all')
  const [q, setQ] = useState('')
  const [copied, setCopied] = useState(false)
  // View mode: 'full' = storefront with cart (default, the richer design); 'compact' = read-only price list.
  const [view, setView] = useState<'full' | 'compact'>(() => (localStorage.getItem('pub_view') === 'compact' ? 'compact' : 'full'))
  const switchView = (v: 'full' | 'compact') => { setView(v); localStorage.setItem('pub_view', v) }
  // Visual cart (POC): itemId -> quantity. No checkout yet; "Pedir por WhatsApp" just composes a message.
  const [cart, setCart] = useState<Record<string, number>>({})
  const addToCart = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
  const decFromCart = (id: string) => setCart((c) => {
    const n = { ...c }
    if ((n[id] ?? 0) <= 1) delete n[id]; else n[id] -= 1
    return n
  })
  const clearCart = () => setCart({})

  const displayLists = listId ? lists.filter((l) => l.id === listId || l.slug === listId) : lists
  // Service lists are read-only price lists: no cart / add-to-cart.
  const isService = displayLists.length > 0 && displayLists.every((l) => l.kind === 'service')

  useEffect(() => {
    async function fetchPublicData() {
      if (!subdomain) return
      setIsLoading(true); setError(null)
      const response = await api.getPublicMenu(subdomain) as { data?: PublicMenuData; error?: string }
      if (response.error) setError(response.error)
      else if (response.data) { setTenant(response.data.tenant); setLists(response.data.lists) }
      setIsLoading(false)
    }
    fetchPublicData()
  }, [subdomain])

  useEffect(() => {
    if (!subdomain) return
    const key = `${subdomain}/${listId ?? ''}/${viewSource}`
    const now = Date.now()
    const last = recentViews.get(key)
    if (last && now - last < 3000) return
    recentViews.set(key, now)
    api.recordPublicView(subdomain, listId, viewSource)
  }, [subdomain, listId, viewSource])

  // Palette tinted by the tenant's brand color (falls back to the default purple).
  const accent = tenant?.brandColor || BASE.accent
  const C = { ...BASE, accent, accent2: accent }
  const brandGradient = `linear-gradient(135deg, ${accent} 0%, ${lighten(accent, 0.42)} 100%)`

  // Translations + locale follow the tenant's configured language.
  const t = getT(tenant?.language)
  const locale = localeOf(tenant?.language)

  const currency = tenant?.currency || 'UYU'
  const fmt = (price: string | number) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(typeof price === 'number' ? price : parseFloat(price))
  const money = (price: string | number) => `${currency} ${fmt(price)}`

  const norm = (s?: string | null) => (s?.trim() || 'Otros').toLowerCase()
  const disp = (s?: string | null) => { const c = s?.trim() || 'Otros'; return c.charAt(0).toUpperCase() + c.slice(1) }

  const allItems = useMemo(() => displayLists.flatMap((l) => l.version?.items ?? []), [displayLists])

  const cartCount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart])
  const cartTotal = useMemo(
    () => allItems.reduce((sum, it) => sum + (cart[it.id] ?? 0) * (parseFloat(it.price) || 0), 0),
    [cart, allItems],
  )
  const base = useMemo(() => {
    const t = q.trim().toLowerCase()
    return t ? allItems.filter((i) => [i.name, i.description, i.category].some((v) => v?.toLowerCase().includes(t))) : allItems
  }, [allItems, q])

  const sections = useMemo(() => {
    const map = new Map<string, { key: string; name: string; items: Item[] }>()
    for (const it of base) {
      const k = norm(it.category)
      if (!map.has(k)) map.set(k, { key: k, name: disp(it.category), items: [] })
      map.get(k)!.items.push(it)
    }
    return Array.from(map.values()).map((s) => {
      const prices = s.items.map((i) => parseFloat(i.price)).filter((n) => !Number.isNaN(n))
      return { ...s, min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 }
    })
  }, [base])

  const visibleSections = cat === 'all' ? sections : sections.filter((s) => s.key === cat)
  const code = (it: Item, i: number) => `${(it.category?.trim() || 'GEN').slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`

  const list = displayLists.length === 1 ? displayLists[0] : null
  // Backend stores naive UTC timestamps (datetime.utcnow, no offset). Tag them as UTC
  // so the browser converts to the correct local date instead of treating UTC as local.
  const parseUtc = (iso?: string | null) => {
    if (!iso) return null
    const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso)
    const d = new Date(hasTz ? iso : `${iso}Z`)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const vDate = parseUtc(list?.version?.updatedAt || list?.version?.createdAt)
  const updated = (vDate ?? new Date()).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
  const monthYear = new Date().toLocaleDateString(locale, { month: 'short', year: 'numeric' })

  const shareLink = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  // Compose a WhatsApp order message from the cart (no phone on file → opens the chooser).
  const waHref = useMemo(() => {
    const lines = allItems
      .filter((it) => cart[it.id])
      .map((it) => `• ${cart[it.id]}× ${it.name} — ${money(it.price)}`)
    const msg = `${t('pub.cartHeading')}\n${lines.join('\n')}\n\n${money(cartTotal)}`
    return `https://wa.me/?text=${encodeURIComponent(msg)}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, allItems, cartTotal])

  if (isLoading) return <div className="flex min-h-screen items-center justify-center" style={{ background: C.bg }}><LoadingSpinner size="lg" /></div>
  if (error || !tenant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 font-sans" style={{ background: C.bg }}>
        <p className="text-sm font-medium" style={{ color: C.muted }}>{error || t('pub.notFound')}</p>
        <Link to="/" className="text-sm font-bold hover:underline" style={{ color: C.accent }}>{t('pub.backHome')}</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: C.bg, color: C.ink, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Tint the page scrollbar with the tenant's brand color while this public list is shown. */}
      <style>{`
        html { scrollbar-color: ${accent} transparent; }
        html::-webkit-scrollbar { width: 12px; height: 12px; }
        html::-webkit-scrollbar-track { background: transparent; }
        html::-webkit-scrollbar-thumb { background: ${accent}; border-radius: 9999px; border: 3px solid ${C.bg}; }
        html::-webkit-scrollbar-thumb:hover { background: ${C.accent2}; }
      `}</style>

      {view === 'full' && (
        <Storefront
          tenant={tenant} C={C} accent={accent} t={t} money={money} currency={currency} updated={updated}
          sections={sections} base={base} allItems={allItems} cat={cat} setCat={setCat} q={q} setQ={setQ}
          cart={cart} addToCart={addToCart} cartCount={cartCount} view={view} switchView={switchView}
          shareLink={shareLink} copied={copied} waHref={waHref} list={list} norm={norm} isService={isService}
        />
      )}

      {view === 'compact' && (
      <>
      {/* Brand ribbon */}
      <div className="h-1.5 w-full" style={{ background: brandGradient }} />
      <div style={{ background: `linear-gradient(180deg, ${accent}12 0%, ${accent}00 560px)` }}>
      <div className="mx-auto w-full max-w-[1160px] px-6 md:px-12">
        {/* Masthead */}
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
          {/* Meta strip */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="flex items-center gap-2 rounded-full border bg-white px-2.5 py-1.5" style={{ borderColor: C.line }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.accent }} />
              <span className="text-[11px] font-semibold tracking-[2px]" style={{ color: C.muted }}>{t('pub.edition', { n: String(list?.version?.versionNumber ?? 1).padStart(3, '0') })}</span>
            </span>
            <div className="flex-1" />
            <div className="flex flex-wrap items-center gap-4">
              <ViewToggle view={view} onChange={switchView} t={t} C={C} />
              <span className="h-3 w-px" style={{ background: C.line }} />
              {list && <span className="rounded-full border px-3 py-1 text-[11px] font-bold tracking-[2px]" style={{ borderColor: C.accent, color: C.accent }}>{t('pub.public')}</span>}
              <span className="text-[12px] font-medium" style={{ color: C.muted }}>{t('pub.updated', { date: updated })}</span>
            </div>
          </div>

          <div className="my-5 h-px w-full" style={{ background: C.line }} />

          {/* Title */}
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
            {tenant.description || t('pub.intro', { listPrefix: list?.name ? `${list.name}. ` : '', name: tenant.name })}
          </p>

          <div className="my-5 h-px w-full" style={{ background: C.line }} />

          {/* Context strip */}
          <div className="flex flex-wrap gap-x-12 gap-y-4 pt-1">
            <Meta label={t('pub.issuedBy')} value={tenant.name} />
            {tenant.taxId && <Meta label={t('pub.taxId')} value={tenant.taxId} />}
            <Meta label={t('pub.catalog')} value={list?.name ?? t('pub.allLists')} />
            <Meta label={t('pub.updatedLabel')} value={updated} />
            <Meta label={t('pub.currency')} value={currency} />
          </div>
        </header>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-3 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <FilterTab active={cat === 'all'} onClick={() => setCat('all')} name={t('pub.all')} count={base.length} accent={C.accent} />
            {sections.map((s) => (
              <span key={s.key} className="flex items-center gap-3">
                <span className="h-3 w-px" style={{ background: C.line }} />
                <FilterTab active={cat === s.key} onClick={() => setCat(s.key)} name={s.name} count={s.items.length} accent={C.accent} />
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

        {/* Main list */}
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
                      {!isService && ((cart[it.id] ?? 0) > 0 ? (
                        <div className="flex shrink-0 items-center gap-2 rounded-full border px-1.5 py-1" style={{ borderColor: C.accent }}>
                          <button type="button" onClick={() => decFromCart(it.id)} aria-label="−" className="flex h-6 w-6 items-center justify-center rounded-full text-[15px] font-bold leading-none" style={{ color: C.accent }}>−</button>
                          <span className="min-w-[14px] text-center text-[13px] font-bold" style={{ color: C.ink }}>{cart[it.id]}</span>
                          <button type="button" onClick={() => addToCart(it.id)} aria-label="+" className="flex h-6 w-6 items-center justify-center rounded-full text-[15px] font-bold leading-none text-white" style={{ background: C.accent }}>+</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => addToCart(it.id)} aria-label={t('pub.add')} title={t('pub.add')} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[18px] font-bold leading-none hover:opacity-70" style={{ borderColor: C.accent, color: C.accent }}>+</button>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </main>

        {/* Footer */}
        <footer className="flex flex-col items-center gap-3 border-t py-10 text-center" style={{ borderColor: C.line }}>
          <div className="h-1 w-16 rounded-full" style={{ background: brandGradient }} />
          <span className="text-base font-black uppercase tracking-[0.2em]" style={{ background: brandGradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{tenant.name}</span>
          <p className="text-xs font-medium" style={{ color: C.muted }}>{t('pub.footer', { currency })}</p>
        </footer>

        {/* Keep content clear of the fixed cart bar */}
        {cartCount > 0 && <div className="h-24" />}
      </div>
      </div>
      </>
      )}

      {/* Sticky cart bar — shared by both views, visual only (composes a WhatsApp order) */}
      {!isService && cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t bg-white/95 backdrop-blur" style={{ borderColor: C.line, boxShadow: '0 -4px 24px rgba(15,13,26,0.08)' }}>
          <div className="mx-auto flex w-full max-w-[1160px] items-center justify-between gap-4 px-6 py-4 md:px-12">
            <div className="flex items-center gap-3.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold tracking-[1.6px]" style={{ color: C.accent }}>{t('pub.cartTitle')}</span>
                <span className="text-[15px] font-semibold" style={{ color: C.ink }}>{t('pub.cartSummary', { n: String(cartCount), unit: cartCount === 1 ? t('pub.product') : t('pub.products'), total: money(cartTotal) })}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button type="button" onClick={clearCart} className="text-[13px] font-semibold hover:opacity-70" style={{ color: C.muted }}>{t('pub.cartClear')}</button>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold text-white hover:opacity-90" style={{ background: '#25D366' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                {t('pub.cartWhatsApp')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ViewToggle({ view, onChange, t, C }: { view: 'full' | 'compact'; onChange: (v: 'full' | 'compact') => void; t: ReturnType<typeof getT>; C: { accent: string; ink: string; muted: string; line: string } }) {
  // Single icon button, same as the CRM density toggle. Icon shows the view it switches to.
  const next = view === 'full' ? 'compact' : 'full'
  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      className="flex h-10 w-10 items-center justify-center rounded-[10px] border hover:opacity-80"
      style={{ borderColor: C.line, background: `${C.accent}12` }}
      title={view === 'full' ? t('pub.viewCompact') : t('pub.viewFull')}
    >
      <SIco name={view === 'full' ? 'rows-2' : 'layout-dashboard'} size={18} color={C.accent} />
    </button>
  )
}

/* ── Storefront (full) view — card-grid e-commerce layout from the Pencil design ── */
type Section = { key: string; name: string; items: Item[]; min: number; max: number }
interface StoreColors { bg: string; ink: string; body: string; muted: string; accent: string; accent2: string; line: string }
interface StoreProps {
  tenant: Tenant
  C: StoreColors
  accent: string
  t: ReturnType<typeof getT>
  money: (p: string | number) => string
  currency: string
  updated: string
  sections: Section[]
  base: Item[]
  allItems: Item[]
  cat: string
  setCat: (c: string) => void
  q: string
  setQ: (s: string) => void
  cart: Record<string, number>
  addToCart: (id: string) => void
  cartCount: number
  view: 'full' | 'compact'
  switchView: (v: 'full' | 'compact') => void
  shareLink: () => void
  copied: boolean
  waHref: string
  list: PublicList | null
  norm: (s?: string | null) => string
  isService: boolean
}

const STORE_ICONS: Record<string, React.ReactNode> = {
  'shopping-bag': <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
  'shopping-cart': <><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
  'message-circle': <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  'share-2': <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></>,
  package: <><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /><path d="M12 22V12" /><path d="m3.3 7 8.7 5 8.7-5" /></>,
  box: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>,
  wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  paintbrush: <><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" /><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" /><path d="M14.5 17.5 4.5 15" /></>,
  layers: <><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22 12.18-9.17 4.16a2 2 0 0 1-1.66 0L2 12.18" /><path d="m22 17.18-9.17 4.16a2 2 0 0 1-1.66 0L2 17.18" /></>,
  cog: <><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>,
  droplets: <><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 4.8 7 3c-.29 1.8-1.14 3.14-2.29 4.06S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" /><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" /></>,
  truck: <><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  'chevron-left': <path d="m15 18-6-6 6-6" />,
  'chevron-right': <path d="m9 18 6-6-6-6" />,
  check: <polyline points="20 6 9 17 4 12" />,
  'layout-dashboard': <><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></>,
  'rows-2': <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 12h18" /></>,
}
function SIco({ name, size = 16, color = 'currentColor', style }: { name: string; size?: number; color?: string; style?: React.CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">{STORE_ICONS[name] ?? STORE_ICONS.box}</svg>
}

// Category → icon, mirroring the admin (productFormat). Falls back to a generic box.
const STORE_CAT_ICON: Record<string, string> = {
  ferretería: 'wrench', ferreteria: 'wrench', eléctricos: 'zap', electricos: 'zap',
  pinturas: 'paintbrush', construcción: 'layers', construccion: 'layers', herramientas: 'cog',
  lavadero: 'droplets', limpieza: 'droplets',
}
const catIco = (cat?: string | null): string => (cat && STORE_CAT_ICON[cat.trim().toLowerCase()]) || 'box'

function Storefront(p: StoreProps) {
  const { tenant, C, accent, t, money, updated, sections, base, allItems, cat, setCat, q, setQ, cart, addToCart, cartCount, view, switchView, shareLink, copied, waHref, list, norm, isService } = p
  const grad = { background: `linear-gradient(135deg, ${accent} 0%, ${C.accent2} 100%)` }
  const gridItems = cat === 'all' ? base : base.filter((i) => norm(i.category) === cat)
  const featured = useMemo(() => [...allItems].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))[0], [allItems])
  const heroTitle = tenant.description || t('store.heroTitle', { name: tenant.name })

  return (
    <div>
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-4 px-5 py-3 md:px-16">
          <div className="flex items-center gap-3">
            {tenant.logoUrl
              ? <img src={tenant.logoUrl} alt={tenant.name} className="h-11 w-auto max-w-[160px] object-contain" />
              : (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={grad}><SIco name="shopping-bag" size={22} color="#fff" /></span>
                  <div className="flex flex-col">
                    <span className="text-[17px] font-extrabold" style={{ color: C.ink }}>{tenant.name}</span>
                    {tenant.address && <span className="text-[12px] font-medium" style={{ color: C.muted }}>{tenant.address}</span>}
                  </div>
                </>
              )}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onChange={switchView} t={t} C={C} />
            {!isService && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-white" style={grad}>
                <SIco name="shopping-cart" size={16} color="#fff" /> {t('store.myCart')}{cartCount > 0 ? ` · ${cartCount}` : ''}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-10 md:py-12" style={grad}>
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-10 px-5 md:px-16 lg:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            <span className="w-fit rounded-full px-3 py-1 text-[11px] font-bold tracking-[2px] text-white" style={{ background: 'rgba(255,255,255,0.18)' }}>{t('store.badge')}</span>
            <h1 className="text-3xl font-black leading-tight text-white md:text-[40px]">{heroTitle}</h1>
            <p className="max-w-[560px] text-[15px] font-medium text-white/80">{t('store.heroSub')}</p>
            <div className="mt-2 flex flex-wrap gap-8">
              {[[`${allItems.length}`, t('store.statProducts')], ['24/7', t('store.statShipping')], [updated, t('store.statUpdated')]].map(([v, l]) => (
                <div key={l} className="flex flex-col gap-0.5">
                  <span className="text-[22px] font-extrabold text-white">{v}</span>
                  <span className="text-[11px] font-medium text-white/80">{l}</span>
                </div>
              ))}
            </div>
          </div>
          {featured && (
            <div className="w-full max-w-[380px] rounded-3xl bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
              <div className="mb-4 flex h-44 items-end justify-between rounded-2xl p-3" style={{ background: `linear-gradient(135deg, ${accent}26 0%, #ffffff 100%)` }}>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold" style={{ color: accent }}>{t('store.featured')}</span>
                <SIco name={catIco(featured.category)} size={52} color={accent} style={{ opacity: 0.5 }} />
              </div>
              <p className="text-[16px] font-bold" style={{ color: C.ink }}>{featured.name}</p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-[26px] font-black" style={{ color: C.ink }}>{money(featured.price)}</span>
                {!isService && (
                  <button type="button" onClick={() => addToCart(featured.id)} className="flex items-center gap-1 rounded-xl px-4 py-2 text-[13px] font-bold text-white" style={grad}>
                    <SIco name="plus" size={14} color="#fff" /> {t('pub.add')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search bar */}
      <div className="border-b bg-white" style={{ borderColor: C.line }}>
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-3 px-5 py-4 md:px-16">
          <label className="flex h-12 flex-1 items-center gap-2.5 rounded-2xl border px-4" style={{ borderColor: C.line, background: '#F5F3FF' }}>
            <SIco name="search" size={18} color={C.muted} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('store.searchPh')} className="min-w-0 flex-1 border-0 bg-transparent text-[14px] outline-none focus:ring-0" style={{ color: C.ink }} />
          </label>
        </div>
      </div>

      {/* Category chips */}
      <div className="border-b bg-white" style={{ borderColor: C.line }}>
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-2.5 px-5 py-4 md:px-16">
          <Chip active={cat === 'all'} onClick={() => setCat('all')} label={t('store.allProducts')} count={base.length} C={C} grad={grad} />
          {sections.map((s) => (
            <Chip key={s.key} active={cat === s.key} onClick={() => setCat(s.key)} label={s.name} count={s.items.length} C={C} grad={grad} />
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-5 py-8 md:px-16 lg:flex-row">
        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[280px]">
          <div className="flex flex-col gap-4 rounded-3xl border bg-white p-6" style={{ borderColor: C.line }}>
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-extrabold" style={{ color: C.ink }}>{t('store.filters')}</span>
              {cat !== 'all' && <button type="button" onClick={() => setCat('all')} className="text-[12px] font-bold" style={{ color: accent }}>{t('store.clear')}</button>}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-bold tracking-wide" style={{ color: C.body }}>{t('store.categories')}</span>
              {sections.map((s) => {
                const on = cat === s.key
                return (
                  <button key={s.key} type="button" onClick={() => setCat(on ? 'all' : s.key)} className="flex items-center justify-between gap-2 text-left text-[13px]" style={{ color: on ? accent : C.body, fontWeight: on ? 700 : 500 }}>
                    <span className="flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded border" style={{ borderColor: on ? accent : C.line, background: on ? accent : 'transparent' }}>{on && <SIco name="check" size={11} color="#fff" />}</span>
                      {s.name}
                    </span>
                    <span className="text-[11px]" style={{ color: C.muted }}>{s.items.length}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* WhatsApp card */}
          <div className="flex flex-col gap-3 rounded-3xl p-6 text-white" style={grad}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white"><SIco name="message-circle" size={20} color={accent} /></span>
            <span className="text-[16px] font-extrabold">{t('store.waTitle')}</span>
            <span className="text-[12px] font-medium text-white/80">{t('store.waSub')}</span>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="w-fit rounded-lg bg-white px-3.5 py-2 text-[13px] font-bold" style={{ color: accent }}>{t('store.waBtn')}</a>
          </div>
        </aside>

        {/* Product grid */}
        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[22px] font-extrabold" style={{ color: C.ink }}>{cat === 'all' ? t('store.allProducts') : sections.find((s) => s.key === cat)?.name}</span>
              <span className="text-[12px] font-medium" style={{ color: C.muted }}>{t('store.showing', { n: String(gridItems.length), total: String(base.length) })}</span>
            </div>
            <button type="button" onClick={shareLink} className="flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[12px] font-bold" style={{ borderColor: C.line, color: C.body }}>
              <SIco name="share-2" size={14} color={C.body} /> {copied ? t('pub.copied') : t('pub.share')}
            </button>
          </div>

          {gridItems.length === 0 ? (
            <p className="py-20 text-center text-sm font-medium" style={{ color: C.muted }}>{t('pub.empty')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {gridItems.map((it) => {
                const qty = cart[it.id] ?? 0
                return (
                  <div key={it.id} className="flex flex-col gap-2.5 rounded-3xl border bg-white p-3.5 shadow-[0_4px_12px_rgba(15,23,42,0.04)]" style={{ borderColor: C.line }}>
                    <div className="relative flex h-40 items-end justify-end overflow-hidden rounded-2xl p-2.5" style={{ background: `linear-gradient(135deg, ${accent}22 0%, #ffffff 100%)` }}>
                      {it.imageUrl
                        ? <img src={it.imageUrl} alt={it.name} className="absolute inset-0 h-full w-full object-cover" />
                        : <SIco name={catIco(it.category)} size={48} color={accent} style={{ opacity: 0.45 }} />}
                      {it.category && <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold" style={{ color: accent }}>{p.norm(it.category) === 'otros' ? t('store.other') : it.category}</span>}
                    </div>
                    <p className="line-clamp-2 text-[14px] font-bold leading-tight" style={{ color: C.ink }}>{it.name}</p>
                    {it.description && <p className="line-clamp-1 text-[12px] font-medium" style={{ color: C.muted }}>{it.description}</p>}
                    <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                      <span className="text-[17px] font-black" style={{ color: C.ink }}>{money(it.price)}</span>
                      {!isService && (qty > 0 ? (
                        <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-bold text-white" style={grad}><SIco name="check" size={12} color="#fff" /> {qty}</span>
                      ) : (
                        <button type="button" onClick={() => addToCart(it.id)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-white" style={grad}>
                          <SIco name="plus" size={12} color="#fff" /> {t('pub.add')}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="py-10" style={{ background: '#0F172A' }}>
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-5 md:px-16">
          <span className="text-[16px] font-bold text-white">{tenant.name}</span>
          {tenant.address && <span className="text-[12px] font-medium" style={{ color: '#94A3B8' }}>{tenant.address}</span>}
          {tenant.taxId && <span className="text-[12px] font-medium" style={{ color: '#94A3B8' }}>{t('pub.taxId')} {tenant.taxId}</span>}
          <div className="my-2 h-px w-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-[12px] font-medium" style={{ color: '#94A3B8' }}>{t('pub.footer', { currency: p.currency })}{list ? ` · ${list.name}` : ''}</span>
        </div>
      </footer>
    </div>
  )
}

function Chip({ active, onClick, label, count, C, grad }: { active: boolean; onClick: () => void; label: string; count: number; C: StoreColors; grad: React.CSSProperties }) {
  return (
    <button type="button" onClick={onClick} className="flex h-9 items-center gap-2 rounded-full border px-4 text-[13px] font-bold" style={active ? { ...grad, color: '#fff', borderColor: 'transparent' } : { background: '#fff', color: C.body, borderColor: C.line }}>
      {label}
      <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={active ? { background: 'rgba(255,255,255,0.22)', color: '#fff' } : { background: '#F1F5F9', color: C.body }}>{count}</span>
    </button>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold tracking-[1.5px]" style={{ color: BASE.muted }}>{label}</span>
      <span className="text-[13px] font-medium" style={{ color: BASE.ink }}>{value}</span>
    </div>
  )
}

function FilterTab({ active, onClick, name, count, accent }: { active: boolean; onClick: () => void; name: string; count: number; accent: string }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 py-0.5">
      {active && <span className="h-[5px] w-[5px] rounded-full" style={{ background: accent }} />}
      <span className="text-[12px]" style={{ color: active ? accent : BASE.body, fontWeight: active ? 700 : 500 }}>{name}</span>
      <span className="text-[10px]" style={{ color: BASE.muted }}>({count})</span>
    </button>
  )
}

export default MenuScreen
