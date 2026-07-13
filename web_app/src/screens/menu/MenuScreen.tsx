import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { LoadingSpinner } from '../../components'
import api from '../../services/api'
import { getT, localeOf } from '../../lib/i18n'
import type { Tenant, ListVersion, Item, ListDesign } from '../../types'
import {
  lighten, readableOn, SIco, catIco, cartThemeFor, ClassicList, NordicMenu, FineDining, ModernBrand, PhotoLookbook, ServiceCards, ImageCatalog, TechGrid,
  type StoreColors, type Section, type DesignProps, type CartTheme,
} from './designs'

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
  // Visual cart (POC): itemId -> quantity. No checkout yet; "Pedir por WhatsApp" just composes a message.
  const [cart, setCart] = useState<Record<string, number>>({})
  const addToCart = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
  const decFromCart = (id: string) => setCart((c) => {
    const n = { ...c }
    if ((n[id] ?? 0) <= 1) delete n[id]; else n[id] -= 1
    return n
  })
  const removeFromCart = (id: string) => setCart((c) => { const n = { ...c }; delete n[id]; return n })
  const clearCart = () => setCart({})
  // Full cart page (mirrors the Pencil "Carrito" design). "Mi carrito" opens this instead of jumping to WhatsApp.
  const [showCart, setShowCart] = useState(false)
  // Customer details collected on the cart page; folded into the WhatsApp order message.
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', delivery: 'pickup' as 'pickup' | 'delivery', address: '', notes: '' })

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
    // Only count a view once the tenant loaded fine. If a slug is given, it must
    // match a published list — a bogus or unpublished slug must not pollute metrics.
    if (!subdomain || isLoading || error || !tenant) return
    if (listId && displayLists.length === 0) return
    const key = `${subdomain}/${listId ?? ''}/${viewSource}`
    const now = Date.now()
    const last = recentViews.get(key)
    if (last && now - last < 3000) return
    recentViews.set(key, now)
    api.recordPublicView(subdomain, listId, viewSource)
  }, [subdomain, listId, viewSource, isLoading, error, tenant, displayLists.length])

  // Palette tinted by the tenant's brand color (falls back to the default purple).
  const accent = tenant?.brandColor || BASE.accent
  const C = { ...BASE, accent, accent2: accent }
  const brandGradient = `linear-gradient(135deg, ${accent} 0%, ${lighten(accent, 0.42)} 100%)`

  // Translations + locale follow the tenant's configured language.
  const t = getT(tenant?.language)
  const locale = localeOf(tenant?.language)

  const currency = tenant?.currency || 'UYU'
  const fmt = (price: string | number) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(typeof price === 'number' ? price : parseFloat(price))
  // Non-breaking space keeps the currency and the amount together on the same line.
  const money = (price: string | number) => `${currency} ${fmt(price)}`

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
    const datos = [
      customer.name && `Nombre: ${customer.name}`,
      customer.phone && `Tel: ${customer.phone}`,
      customer.email && `Email: ${customer.email}`,
      `Entrega: ${customer.delivery === 'delivery' ? 'Envío a domicilio' : 'Retiro en el local'}`,
      customer.delivery === 'delivery' && customer.address && `Dirección: ${customer.address}`,
      customer.notes && `Notas: ${customer.notes}`,
    ].filter(Boolean)
    const msg = [
      t('pub.cartHeading'),
      lines.join('\n'),
      '',
      `Total: ${money(cartTotal)}`,
      datos.length ? `\n${datos.join('\n')}` : '',
    ].join('\n')
    return `https://wa.me/?text=${encodeURIComponent(msg)}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, allItems, cartTotal, customer])

  if (isLoading) return <div className="flex min-h-screen items-center justify-center" style={{ background: C.bg }}><LoadingSpinner size="lg" /></div>
  if (error || !tenant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 font-sans" style={{ background: C.bg }}>
        <p className="text-sm font-medium" style={{ color: C.muted }}>{error || t('pub.notFound')}</p>
        <Link to="/" className="text-sm font-bold hover:underline" style={{ color: C.accent }}>{t('pub.backHome')}</Link>
      </div>
    )
  }
  // A slug was requested but matches no published list (invalid, renamed, or
  // unpublished): show "list not found" instead of the empty storefront shell.
  if (listId && displayLists.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 font-sans" style={{ background: C.bg }}>
        <p className="text-sm font-medium" style={{ color: C.muted }}>{t('pub.notFound')}</p>
        <Link to="/" className="text-sm font-bold hover:underline" style={{ color: C.accent }}>{t('pub.backHome')}</Link>
      </div>
    )
  }

  // The public list design is chosen by the business (Settings → Brand & appearance)
  // and applies to every list. The old per-visitor simple/full toggle is gone.
  const design: ListDesign = tenant.listDesign ?? 'store'
  const cartT = cartThemeFor(design)
  const hasBg = !!tenant.listBgUrl
  const heroColor = tenant.listHeroColor || accent
  const edition = String(list?.version?.versionNumber ?? 1).padStart(3, '0')
  const designProps: DesignProps = {
    tenant, C, accent, brandGradient, heroColor, t, money, currency, updated, monthYear,
    sections, base, allItems, cat, setCat, q, setQ, cart, addToCart, decFromCart,
    isService, listName: list?.name ?? null, edition, taxId: tenant.taxId, hasBg,
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

      {!showCart && (
        <div className="relative">
          {/* Optional background image, with an optional brand-color filter on top. */}
          {hasBg && (
            <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0, backgroundImage: `url(${tenant.listBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
              {tenant.listBgOverlay && <div className="absolute inset-0" style={{ background: accent, opacity: 0.5, mixBlendMode: 'multiply' }} />}
            </div>
          )}
          <div className="relative" style={{ zIndex: 1 }}>
            {design === 'store' ? (
              <Storefront
                tenant={tenant} C={C} accent={accent} heroColor={heroColor} t={t} money={money} currency={currency} updated={updated}
                sections={sections} base={base} allItems={allItems} cat={cat} setCat={setCat} q={q} setQ={setQ}
                cart={cart} addToCart={addToCart} cartCount={cartCount}
                shareLink={shareLink} copied={copied} waHref={waHref} list={list} norm={norm} isService={isService}
                openCart={() => setShowCart(true)}
              />
            ) : design === 'nordic' ? <NordicMenu {...designProps} />
              : design === 'fine' ? <FineDining {...designProps} />
                : design === 'modern' ? <ModernBrand {...designProps} />
                  : design === 'photo' ? <PhotoLookbook {...designProps} />
                    : design === 'cards' ? <ServiceCards {...designProps} />
                      : design === 'catalog' ? <ImageCatalog {...designProps} />
                        : design === 'tech' ? <TechGrid {...designProps} />
                          : <ClassicList {...designProps} />}
          </div>
        </div>
      )}

      {showCart && !isService && (
        <CartView
          tenant={tenant} T={cartT} accent={accent} t={t} money={money} cart={cart} allItems={allItems}
          cartCount={cartCount} cartTotal={cartTotal} addToCart={addToCart} decFromCart={decFromCart}
          removeFromCart={removeFromCart} clearCart={clearCart} customer={customer} setCustomer={setCustomer}
          waHref={waHref} norm={norm} onBack={() => setShowCart(false)}
        />
      )}


      {/* Sticky cart bar — follows the selected design's theme; opens the full cart page. */}
      {!isService && cartCount > 0 && !showCart && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur" style={{ background: `${cartT.surface}F2`, borderColor: cartT.line, boxShadow: '0 -4px 24px rgba(15,13,26,0.12)' }}>
          <div className="mx-auto flex w-full max-w-[1160px] items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-12 md:py-4">
            <div className="flex min-w-0 items-center gap-2.5 md:gap-3.5">
              <svg className="shrink-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="hidden text-[11px] font-bold tracking-[1.6px] sm:block" style={{ color: accent }}>{t('pub.cartTitle')}</span>
                <span className="text-[13px] font-semibold leading-tight md:text-[15px]" style={{ color: cartT.ink }}>{t('pub.cartSummary', { n: String(cartCount), unit: cartCount === 1 ? t('pub.product') : t('pub.products'), total: money(cartTotal) })}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 md:gap-4">
              <button type="button" onClick={clearCart} className="hidden text-[13px] font-semibold hover:opacity-70 sm:block" style={{ color: cartT.muted }}>{t('pub.cartClear')}</button>
              <button type="button" onClick={() => setShowCart(true)} className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-bold text-white hover:opacity-90 md:px-5 md:py-3 md:text-[14px]" style={{ background: brandGradient }}>
                <SIco name="shopping-cart" size={18} color="#fff" />
                {t('store.myCart')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface StoreProps {
  tenant: Tenant
  C: StoreColors
  accent: string
  heroColor: string
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
  shareLink: () => void
  copied: boolean
  waHref: string
  list: PublicList | null
  norm: (s?: string | null) => string
  isService: boolean
  openCart: () => void
}

function Storefront(p: StoreProps) {
  const { tenant, C, accent, heroColor, t, money, updated, sections, base, allItems, cat, setCat, q, setQ, cart, addToCart, cartCount, shareLink, copied, waHref, list, norm, isService, openCart } = p
  const grad = { background: `linear-gradient(135deg, ${accent} 0%, ${C.accent2} 100%)` }
  const heroInk = readableOn(heroColor)
  const heroGrad = { background: `linear-gradient(135deg, ${heroColor} 0%, ${lighten(heroColor, 0.18)} 100%)` }
  const heroChip = heroInk === '#FFFFFF' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)'
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
            {!isService && (
              <button type="button" onClick={openCart} className="flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-white" style={grad}>
                <SIco name="shopping-cart" size={16} color="#fff" /> {t('store.myCart')}{cartCount > 0 ? ` · ${cartCount}` : ''}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero (uses the configurable hero color) */}
      <section className="py-10 md:py-12" style={heroGrad}>
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-10 px-5 md:px-16 lg:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            <span className="w-fit rounded-full px-3 py-1 text-[11px] font-bold tracking-[2px]" style={{ background: heroChip, color: heroInk }}>{t('store.badge')}</span>
            <h1 className="text-3xl font-black leading-tight md:text-[40px]" style={{ color: heroInk }}>{heroTitle}</h1>
            <p className="max-w-[560px] text-[15px] font-medium" style={{ color: heroInk, opacity: 0.82 }}>{t('store.heroSub')}</p>
            <div className="mt-2 flex flex-wrap gap-8">
              {[[`${allItems.length}`, t('store.statProducts')], ['24/7', t('store.statShipping')], [updated, t('store.statUpdated')]].map(([v, l]) => (
                <div key={l} className="flex flex-col gap-0.5">
                  <span className="text-[22px] font-extrabold" style={{ color: heroInk }}>{v}</span>
                  <span className="text-[11px] font-medium" style={{ color: heroInk, opacity: 0.82 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          {featured && (
            <div className="w-full max-w-[380px] rounded-3xl bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
              <div className="relative mb-4 flex h-44 items-end justify-between overflow-hidden rounded-2xl p-3" style={{ background: `linear-gradient(135deg, ${accent}26 0%, #ffffff 100%)` }}>
                {featured.imageUrl && <img src={featured.imageUrl} alt={featured.name} className="absolute inset-0 h-full w-full object-cover" />}
                {featured.imageUrl && <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}55 0%, ${accent}12 100%)` }} />}
                <span className="relative rounded-full bg-white px-2.5 py-1 text-[11px] font-bold" style={{ color: accent }}>{t('store.featured')}</span>
                {!featured.imageUrl && <SIco name={catIco(featured.category)} size={52} color={accent} style={{ opacity: 0.5 }} />}
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
                        ? <img src={it.imageThumbUrl || it.imageUrl} alt={it.name} className="absolute inset-0 h-full w-full object-cover" />
                        : <SIco name={catIco(it.category)} size={48} color={accent} style={{ opacity: 0.45 }} />}
                      {it.imageUrl && <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}55 0%, ${accent}12 100%)` }} />}
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

/* ── Cart page — mirrors the Pencil "Carrito · Desktop" design, wired to real cart data ── */
type CartCustomer = { name: string; phone: string; email: string; delivery: 'pickup' | 'delivery'; address: string; notes: string }
interface CartProps {
  tenant: Tenant
  T: CartTheme
  accent: string
  t: ReturnType<typeof getT>
  money: (p: string | number) => string
  cart: Record<string, number>
  allItems: Item[]
  cartCount: number
  cartTotal: number
  addToCart: (id: string) => void
  decFromCart: (id: string) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  customer: CartCustomer
  setCustomer: React.Dispatch<React.SetStateAction<CartCustomer>>
  waHref: string
  norm: (s?: string | null) => string
  onBack: () => void
}

function CartView(p: CartProps) {
  const { tenant, T, accent, t, money, cart, allItems, cartCount, cartTotal, addToCart, decFromCart, removeFromCart, clearCart, customer, setCustomer, waHref, norm, onBack } = p
  const grad = { background: `linear-gradient(135deg, ${accent} 0%, ${lighten(accent, 0.22)} 100%)` }
  const cartItems = allItems.filter((it) => (cart[it.id] ?? 0) > 0)
  const set = (patch: Partial<CartCustomer>) => setCustomer((c) => ({ ...c, ...patch }))
  const field = "h-[46px] w-full rounded-xl border px-3.5 text-[13px] font-semibold outline-none focus:ring-2"
  const fieldStyle = { borderColor: T.line, color: T.ink, background: T.field }
  const labelCls = "text-[12px] font-bold"
  const cardCls = "rounded-[24px] border p-5 shadow-[0_18px_50px_-20px_rgba(15,13,26,0.30)] md:p-7"

  return (
    <div className="min-h-screen font-sans" style={{ background: `linear-gradient(180deg, ${accent}22 0%, ${accent}0A 300px, transparent 460px), ${T.bg}` }}>
      {/* Navbar */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center gap-4 border-b px-5 py-3.5 backdrop-blur md:px-16" style={{ background: `${T.surface}F2`, borderColor: T.line }}>
        <div className="flex items-center gap-3">
          {tenant.logoUrl
            ? <img src={tenant.logoUrl} alt={tenant.name} className="h-11 w-auto max-w-[160px] object-contain" />
            : (
              <>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={grad}><SIco name="shopping-bag" size={22} color="#fff" /></span>
                <div className="flex flex-col">
                  <span className="text-[17px] font-extrabold" style={{ color: T.ink }}>{tenant.name}</span>
                  {tenant.address && <span className="text-[12px] font-medium" style={{ color: T.muted }}>{tenant.address}</span>}
                </div>
              </>
            )}
        </div>
        <div className="flex-1" />
        <button type="button" onClick={onBack} className="flex h-9 items-center gap-2 rounded-[10px] px-3.5 text-[13px] font-bold" style={{ background: `${accent}22`, color: accent }}>
          <SIco name="arrow-left" size={14} color={accent} /> {t('store.keepShopping')}
        </button>
      </header>

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-3 px-5 pb-4 pt-7 md:px-16">
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onBack} className="text-[12px] font-medium hover:underline" style={{ color: T.muted }}>{t('store.catalog')}</button>
          <SIco name="chevron-right" size={14} color={T.muted} />
          <span className="text-[12px] font-bold" style={{ color: T.body }}>{t('store.yourCart')}</span>
        </div>
      </div>

      {cartCount === 0 ? (
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-5 px-5 py-24 text-center md:px-16">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl" style={{ background: `${accent}1F` }}><SIco name="shopping-cart" size={36} color={accent} /></span>
          <div className="flex flex-col gap-1">
            <p className="text-[20px] font-extrabold" style={{ color: T.ink }}>{t('store.cartEmptyTitle')}</p>
            <p className="text-[14px] font-medium" style={{ color: T.muted }}>{t('store.cartEmptySub')}</p>
          </div>
          <button type="button" onClick={onBack} className="flex h-12 items-center gap-2 rounded-2xl px-6 text-[14px] font-bold text-white" style={grad}>
            <SIco name="arrow-left" size={16} color="#fff" /> {t('store.keepShopping')}
          </button>
        </div>
      ) : (
        <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-5 pb-12 md:px-16 lg:flex-row">
          {/* Left column */}
          <div className="flex flex-1 flex-col gap-4">
            {/* Title row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-[28px] font-black md:text-[32px]" style={{ color: T.ink }}>{t('store.yourCart')}</h1>
                <p className="text-[14px] font-medium" style={{ color: T.muted }}>{t('store.cartReview')}</p>
              </div>
              <button type="button" onClick={clearCart} className="flex h-9 items-center gap-2 rounded-[10px] border px-3.5 text-[13px] font-bold" style={{ borderColor: '#EF444455', color: '#EF4444', background: '#EF444414' }}>
                <SIco name="trash-2" size={14} color="#EF4444" /> {t('store.cartClear')}
              </button>
            </div>

            {/* Products card */}
            <div className={cardCls} style={{ background: T.surface, borderColor: T.line }}>
              <div className="flex items-center gap-2.5 pb-2">
                <h2 className="text-[18px] font-extrabold md:text-[20px]" style={{ color: T.ink }}>{t('store.cartProducts')}</h2>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: `${accent}22`, color: accent }}>{cartCount} {cartCount === 1 ? t('pub.product') : t('pub.products')}</span>
              </div>
              {cartItems.map((it) => {
                const qty = cart[it.id] ?? 0
                const line = (parseFloat(it.price) || 0) * qty
                return (
                  <div key={it.id} className="flex flex-wrap items-center gap-4 border-t py-4 first:border-t-0" style={{ borderColor: T.divider }}>
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[14px]" style={{ background: `linear-gradient(135deg, ${accent}2A 0%, ${T.field} 100%)` }}>
                      {it.imageUrl
                        ? <img src={it.imageThumbUrl || it.imageUrl} alt={it.name} className="absolute inset-0 h-full w-full object-cover" />
                        : <SIco name={catIco(it.category)} size={34} color={accent} style={{ opacity: 0.7 }} />}
                    </div>
                    <div className="flex min-w-[140px] flex-1 flex-col gap-1.5">
                      <p className="text-[15px] font-bold leading-tight" style={{ color: T.ink }}>{it.name}</p>
                      {it.description && <p className="line-clamp-1 text-[12px] font-medium" style={{ color: T.muted }}>{it.description}</p>}
                      {it.category && <span className="w-fit rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: T.divider, color: T.body }}>{norm(it.category) === 'otros' ? t('store.other') : it.category}</span>}
                    </div>
                    <div className="flex items-center rounded-xl border" style={{ borderColor: T.line, background: T.field }}>
                      <button type="button" onClick={() => decFromCart(it.id)} aria-label="−" className="flex h-10 w-10 items-center justify-center hover:opacity-60"><SIco name="minus" size={14} color={T.body} /></button>
                      <span className="flex h-10 w-10 items-center justify-center text-[16px] font-extrabold" style={{ color: T.ink }}>{qty}</span>
                      <button type="button" onClick={() => addToCart(it.id)} aria-label="+" className="flex h-10 w-10 items-center justify-center hover:opacity-60"><SIco name="plus" size={14} color={T.body} /></button>
                    </div>
                    <div className="flex w-[120px] flex-col items-end gap-0.5">
                      <span className="text-[18px] font-black" style={{ color: T.ink }}>{money(line)}</span>
                      {qty > 1 && <span className="text-[12px] font-medium" style={{ color: T.muted }}>{money(it.price)} {t('store.each')}</span>}
                    </div>
                    <button type="button" onClick={() => removeFromCart(it.id)} aria-label={t('store.cartRemove')} className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={{ background: '#EF444418' }}><SIco name="x" size={16} color="#EF4444" /></button>
                  </div>
                )
              })}
              <div className="flex items-center justify-end gap-2 border-t pt-4" style={{ borderColor: T.divider }}>
                <span className="text-[14px] font-medium" style={{ color: T.body }}>{t('store.cartSubtotalN', { n: String(cartCount) })}</span>
                <span className="text-[18px] font-extrabold" style={{ color: T.ink }}>{money(cartTotal)}</span>
              </div>
            </div>

            {/* Contact card */}
            <div className={`flex flex-col gap-4 ${cardCls}`} style={{ background: T.surface, borderColor: T.line }}>
              <div className="flex flex-col gap-1">
                <h2 className="text-[18px] font-extrabold" style={{ color: T.ink }}>{t('store.cartYourData')}</h2>
                <p className="text-[12px] font-medium" style={{ color: T.muted }}>{t('store.cartYourDataSub')}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls} style={{ color: T.body }}>{t('store.cartName')}</span>
                  <input value={customer.name} onChange={(e) => set({ name: e.target.value })} placeholder={t('store.cartNamePh')} className={field} style={fieldStyle} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls} style={{ color: T.body }}>{t('store.cartPhone')}</span>
                  <input value={customer.phone} onChange={(e) => set({ phone: e.target.value })} placeholder={t('store.cartPhonePh')} className={field} style={fieldStyle} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls} style={{ color: T.body }}>{t('store.cartEmail')}</span>
                  <input value={customer.email} onChange={(e) => set({ email: e.target.value })} placeholder={t('store.cartEmailPh')} className={field} style={fieldStyle} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls} style={{ color: T.body }}>{t('store.cartDelivery')}</span>
                  {tenant.deliveryEnabled ? (
                    <select value={customer.delivery} onChange={(e) => set({ delivery: e.target.value as 'pickup' | 'delivery' })} className={field} style={fieldStyle}>
                      <option value="pickup">{t('store.cartPickup')}</option>
                      <option value="delivery">{t('store.cartShipping')}</option>
                    </select>
                  ) : (
                    // Business doesn't offer delivery → pickup is the only option.
                    <div className={`${field} flex items-center`} style={{ borderColor: T.line, color: T.ink, background: T.divider }}>{t('store.cartPickup')}</div>
                  )}
                </label>
                {tenant.deliveryEnabled && customer.delivery === 'delivery' && (
                  <label className="flex flex-col gap-1.5 md:col-span-2">
                    <span className={labelCls} style={{ color: T.body }}>{t('store.cartAddress')}</span>
                    <input value={customer.address} onChange={(e) => set({ address: e.target.value })} placeholder={t('store.cartAddressPh')} className={field} style={fieldStyle} />
                  </label>
                )}
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span className={labelCls} style={{ color: T.body }}>{t('store.cartNotes')}</span>
                  <textarea value={customer.notes} onChange={(e) => set({ notes: e.target.value })} placeholder={t('store.cartNotesPh')} rows={3} className="w-full rounded-xl border px-3.5 py-3 text-[13px] font-semibold outline-none focus:ring-2" style={fieldStyle} />
                </label>
              </div>
            </div>
          </div>

          {/* Right column — order summary */}
          <div className="flex w-full flex-col gap-4 lg:w-[380px]">
            <div className={`flex flex-col gap-4 ${cardCls} lg:sticky lg:top-24`} style={{ background: T.surface, borderColor: T.line }}>
              <div className="flex flex-col gap-1">
                <h2 className="text-[18px] font-extrabold" style={{ color: T.ink }}>{t('store.cartSummary')}</h2>
                <p className="text-[12px] font-medium" style={{ color: T.muted }}>{t('store.cartPricesIn', { currency: tenant.currency || 'UYU' })}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium" style={{ color: T.body }}>{t('store.cartSubtotal')}</span>
                <span className="text-[14px] font-bold" style={{ color: T.ink }}>{money(cartTotal)}</span>
              </div>
              <div className="h-px w-full" style={{ background: T.divider }} />
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-extrabold" style={{ color: T.ink }}>{t('store.cartTotal')}</span>
                <span className="text-[24px] font-black" style={{ color: T.ink }}>{money(cartTotal)}</span>
              </div>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex h-14 items-center justify-center gap-2 rounded-2xl text-[16px] font-extrabold text-white" style={grad}>
                <SIco name="message-circle" size={22} color="#fff" /> {t('store.cartSend')}
              </a>
              <div className="flex items-center justify-center gap-1.5">
                <SIco name="shield-check" size={12} color="#10B981" />
                <span className="text-[11px] font-medium" style={{ color: T.muted }}>{t('store.cartTrust')}</span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="flex flex-col items-center gap-2 px-5 py-8 md:px-16" style={{ background: T.footerBg }}>
        <span className="text-[14px] font-bold text-white">{tenant.name}</span>
        <span className="text-[12px] font-medium" style={{ color: T.footerText }}>{t('pub.footer', { currency: tenant.currency || 'UYU' })}</span>
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

export default MenuScreen
