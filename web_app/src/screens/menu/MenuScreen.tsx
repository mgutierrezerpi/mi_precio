import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { LoadingSpinner } from '../../components'
import api from '../../services/api'
import { getT, localeOf, type TFn } from '../../lib/i18n'
import type {
  Tenant,
  ListVersion,
  Item,
  ListDesign,
  ListContent,
  Magazine,
} from '../../types'
import {
  SIco,
  cartThemeFor,
  ClassicList,
  NordicMenu,
  FineDining,
  ModernBrand,
  PhotoLookbook,
  ServiceCards,
  ImageCatalog,
  TechGrid,
  type StoreColors,
  type Section,
  type DesignProps,
  type CartTheme,
} from './designs'
import { lighten, readableOn } from '../../lib/designColors'
import { parseUtc } from '../../lib/datetime'
import { categoryIcon } from '../../lib/categoryIcon'
import { PencilList } from './pencil'
import { pencilCartThemeFor } from './pencil/cartTheme'
import { isPencilVariant } from './pencil/variants'
import { PencilActionBar } from './pencilActions'
import { PencilJournal } from './pencilJournal'
import { StoreChip } from './StoreChip'
import { MagazineShelf } from './MagazineShelf'

export interface PublicList {
  id: string
  name: string
  slug: string | null
  kind?: 'product' | 'service'
  /** The shop's main list — whose look stands in when no single list is shown. */
  showOnIndex?: boolean
  // Per-list appearance overrides; null falls back to the tenant's defaults.
  design?: ListDesign | null
  heroColor?: string | null
  bgUrl?: string | null
  bgOverlay?: boolean | null
  captureViewerInfo?: boolean
  version: ListVersion & { items: Item[] }
}
interface PublicMenuData {
  tenant: Tenant
  lists: PublicList[]
  magazines?: Magazine[]
  viewerIdentified?: boolean
}

// Dedupe view records within a short window (survives StrictMode remounts).
const recentViews = new Map<string, number>()

const BASE = {
  bg: '#FAFAF7',
  ink: '#0F0D1A',
  body: '#44424E',
  muted: '#84818E',
  accent: '#7C3AED',
  accent2: '#6D28D9',
  line: '#E5E2DC',
}

// Only for the "no such shop" dead end, where there is no tenant to brand with.
// The white mark is the one that sits on the purple half.
const MIPRECIO_LOGO_WHITE = '/miprecio-logo-white-pencil.webp'

export function MenuScreen() {
  const { subdomain, listId } = useParams<{
    subdomain: string
    listId?: string
  }>()
  const [searchParams] = useSearchParams()
  const viewSource = searchParams.get('src') === 'qr' ? 'qr' : 'link'
  // Embedded in the admin template editor: show the list itself, never the
  // visitor-identification interruption intended for real customers.
  const isEditorPreview = searchParams.get('preview') === 'editor'
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [lists, setLists] = useState<PublicList[]>([])
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cat, setCat] = useState<string>('all')
  const [q, setQ] = useState('')
  const [copied, setCopied] = useState(false)
  // Visual cart (POC): itemId -> quantity. No checkout yet; "Pedir por WhatsApp" just composes a message.
  const [cart, setCart] = useState<Record<string, number>>({})
  const addToCart = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
  const decFromCart = (id: string) =>
    setCart((c) => {
      const n = { ...c }
      if ((n[id] ?? 0) <= 1) delete n[id]
      else n[id] -= 1
      return n
    })
  const removeFromCart = (id: string) =>
    setCart((c) => {
      const n = { ...c }
      delete n[id]
      return n
    })
  const clearCart = () => setCart({})
  // Full cart page (mirrors the Pencil "Carrito" design). "Mi carrito" opens this instead of jumping to WhatsApp.
  const [showCart, setShowCart] = useState(false)
  // Customer details collected on the cart page; folded into the WhatsApp order message.
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    delivery: 'pickup' as 'pickup' | 'delivery',
    address: '',
    notes: '',
  })
  const [viewerContact, setViewerContact] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [viewerSubmitted, setViewerSubmitted] = useState(false)
  const [viewerSaving, setViewerSaving] = useState(false)
  const [viewerError, setViewerError] = useState(false)

  const displayLists = listId
    ? lists.filter((l) => l.id === listId || l.slug === listId)
    : lists
  // Service lists are read-only price lists: no cart / add-to-cart.
  const isService =
    displayLists.length > 0 && displayLists.every((l) => l.kind === 'service')

  useEffect(() => {
    async function fetchPublicData() {
      if (!subdomain) return
      setIsLoading(true)
      setError(null)
      const response = (await api.getPublicMenu(subdomain, listId)) as {
        data?: PublicMenuData
        error?: string
      }
      if (response.error) setError(response.error)
      else if (response.data) {
        setTenant(response.data.tenant)
        setLists(response.data.lists)
        setMagazines(response.data.magazines ?? [])
        setViewerSubmitted(Boolean(response.data.viewerIdentified))
      }
      setIsLoading(false)
    }
    fetchPublicData()
  }, [subdomain, listId])

  useEffect(() => {
    setViewerSubmitted(false)
    setViewerContact({ name: '', email: '', phone: '' })
    setViewerError(false)
  }, [subdomain, listId])

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
    api.recordPublicView(
      subdomain,
      listId ? displayLists[0]?.id : undefined,
      viewSource
    )
  }, [subdomain, listId, viewSource, isLoading, error, tenant, displayLists])

  // Customer-facing catalog and Linktree intentionally share one accent.
  const accent =
    tenant?.linktreeAccentColor || tenant?.brandColor || BASE.accent
  const C = { ...BASE, accent, accent2: accent }
  const brandGradient = `linear-gradient(135deg, ${accent} 0%, ${lighten(accent, 0.42)} 100%)`

  // Translations + locale follow the tenant's configured language.
  const t = getT(tenant?.language)
  const locale = localeOf(tenant?.language)

  const currency = tenant?.currency || 'UYU'
  const fmt = (price: string | number) =>
    new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(
      typeof price === 'number' ? price : parseFloat(price)
    )
  // Non-breaking space keeps the currency and the amount together on the same line.
  const money = (price: string | number) => `${currency}\u00a0${fmt(price)}`

  const norm = (s?: string | null) => (s?.trim() || 'Otros').toLowerCase()
  const disp = (s?: string | null) => {
    const c = s?.trim() || 'Otros'
    return c.charAt(0).toUpperCase() + c.slice(1)
  }

  const allItems = useMemo(
    () => displayLists.flatMap((l) => l.version?.items ?? []),
    [displayLists]
  )

  const cartCount = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart]
  )
  const cartTotal = useMemo(
    () =>
      allItems.reduce(
        (sum, it) => sum + (cart[it.id] ?? 0) * (parseFloat(it.price) || 0),
        0
      ),
    [cart, allItems]
  )
  const base = useMemo(() => {
    const t = q.trim().toLowerCase()
    return t
      ? allItems.filter((i) =>
          [i.name, i.description, i.category].some((v) =>
            v?.toLowerCase().includes(t)
          )
        )
      : allItems
  }, [allItems, q])

  const list = displayLists.length === 1 ? displayLists[0] : null
  const content = list?.version.content ?? null

  // A public list should carry the shop's identity into the browser chrome as
  // well as into the page itself. Restore the app defaults when this route
  // unmounts so the admin and marketing pages never inherit a shop's branding.
  useEffect(() => {
    if (!tenant) return

    const previousTitle = document.title
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    const previousHref = favicon?.getAttribute('href') ?? null
    const previousType = favicon?.getAttribute('type') ?? null
    const icon = favicon ?? document.createElement('link')

    if (!favicon) {
      icon.rel = 'icon'
      document.head.appendChild(icon)
    }

    document.title =
      [tenant.name, list?.name].filter(Boolean).join(' · ') || 'MiPrecio'
    icon.href = tenant.logoUrl || '/miprecio-favicon.png'
    // Tenant logos may be PNG, JPEG, WebP, or an uploaded image URL; let the
    // browser infer the type rather than retaining the app favicon's PNG hint.
    icon.removeAttribute('type')

    return () => {
      document.title = previousTitle
      if (previousHref) icon.href = previousHref
      else icon.removeAttribute('href')
      if (previousType) icon.type = previousType
      else icon.removeAttribute('type')
      if (!favicon) icon.remove()
    }
  }, [tenant, list?.name])

  const sections = useMemo(() => {
    const map = new Map<string, { key: string; name: string; items: Item[] }>()
    for (const it of base) {
      const k = norm(it.category)
      if (!map.has(k))
        map.set(k, { key: k, name: disp(it.category), items: [] })
      map.get(k)!.items.push(it)
    }
    const inferred = Array.from(map.values()).map((s) => {
      const prices = s.items
        .map((i) => parseFloat(i.price))
        .filter((n) => !Number.isNaN(n))
      return {
        ...s,
        min: prices.length ? Math.min(...prices) : 0,
        max: prices.length ? Math.max(...prices) : 0,
      }
    })
    const catalog = content?.blocks.find((block) => block.type === 'catalog')
    if (!catalog || catalog.type !== 'catalog') return inferred

    const remaining = new Map(inferred.map((section) => [section.key, section]))
    const ordered = catalog.sections.flatMap((definition) => {
      const key = norm(definition.source.value)
      const section = remaining.get(key)
      if (!section) return []
      remaining.delete(key)
      return [{ ...section, name: definition.title }]
    })
    return [...ordered, ...remaining.values()]
  }, [base, content])
  const viewerPromptEnabled = Boolean(
    list?.captureViewerInfo && !viewerSubmitted && !isEditorPreview
  )
  const submitViewer = async () => {
    if (!list || !subdomain) return
    const name = viewerContact.name.trim()
    const email = viewerContact.email.trim()
    const phone = viewerContact.phone.trim()
    if (!name || (!email && !phone)) {
      setViewerError(true)
      return
    }
    setViewerError(false)
    setViewerSaving(true)
    const response = await api.submitPublicViewer(subdomain, {
      listId: list.id,
      name,
      email: email || undefined,
      phone: phone || undefined,
    })
    setViewerSaving(false)
    if (response.data) {
      setCustomer((current) => ({ ...current, name, email, phone }))
      setViewerSubmitted(true)
    } else setViewerError(true)
  }
  const vDate = parseUtc(list?.version?.updatedAt || list?.version?.createdAt)
  const updated = (vDate ?? new Date()).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const monthYear = new Date().toLocaleDateString(locale, {
    month: 'short',
    year: 'numeric',
  })

  const shareLink = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const checkoutChannel =
    content?.template?.checkoutChannel === 'instagram' &&
    (content.template.instagramHandle || tenant?.instagramUrl)
      ? ('instagram' as const)
      : ('whatsapp' as const)
  const orderMessage = useMemo(() => {
    const lines = allItems
      .filter((it) => cart[it.id])
      .map((it) => `• ${cart[it.id]}× ${it.name} — ${money(it.price)}`)
    const datos = [
      customer.name && `Nombre: ${customer.name}`,
      customer.phone && `Tel: ${customer.phone}`,
      customer.email && `Email: ${customer.email}`,
      `Entrega: ${customer.delivery === 'delivery' ? 'Envío a domicilio' : 'Retiro en el local'}`,
      customer.delivery === 'delivery' &&
        customer.address &&
        `Dirección: ${customer.address}`,
      customer.notes && `Notas: ${customer.notes}`,
    ].filter(Boolean)
    const msg = [
      t('pub.cartHeading'),
      lines.join('\n'),
      '',
      `Total: ${money(cartTotal)}`,
      datos.length ? `\n${datos.join('\n')}` : '',
    ].join('\n')
    return msg
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, allItems, cartTotal, customer])
  const waHref = useMemo(() => {
    if (checkoutChannel === 'whatsapp')
      return `https://wa.me/?text=${encodeURIComponent(orderMessage)}`
    const raw = content?.template?.instagramHandle || tenant?.instagramUrl || ''
    const handle = raw
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/^@/, '')
      .split(/[/?#]/)[0]
    return handle ? `https://ig.me/m/${handle}` : 'https://instagram.com'
  }, [
    checkoutChannel,
    content?.template?.instagramHandle,
    orderMessage,
    tenant?.instagramUrl,
  ])
  const onCheckout = () => {
    if (checkoutChannel === 'instagram')
      void navigator.clipboard?.writeText(orderMessage)
  }

  if (isLoading)
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: C.bg }}
      >
        <LoadingSpinner size="lg" />
      </div>
    )
  // No such business. This is the only dead end where we know nothing about a
  // shop, so it is the only one that may talk about MiPrecio.
  // `error` is the API's raw `detail` — English, written for us, not for someone
  // who just scanned a QR. It belongs in the console, never on screen.
  if (error || !tenant) {
    if (error) console.warn('[public] %s: %s', subdomain, error)
    // No shop to borrow an identity from, so this one is ours. It also doubles
    // as a pitch: whoever got here already scans QR menus, which is the whole
    // product. Sized to one viewport — a dead end nobody meant to open should
    // never ask to be scrolled.
    // Stacked on phones, side by side from md. The rows are 2fr/3fr rather than
    // even: the message needs a couple of lines, the pitch needs room for a CTA,
    // and on a 320px-tall half the CTA is what gets cut.
    return (
      <div className="grid h-[100dvh] grid-rows-[2fr_3fr] overflow-hidden font-sans md:grid-cols-2 md:grid-rows-1">
        {/* Why they are here. Its own half, so the pitch can never bury it. */}
        {/* `overflow-y-auto`, not `hidden`: the page never scrolls, but on a very
            short phone a half scrolls itself rather than clipping its CTA. */}
        <div
          className="flex flex-col items-center justify-center gap-3 overflow-y-auto px-6 py-6 text-center md:gap-6 md:px-8"
          style={{ background: BASE.bg }}
        >
          {/* Sized to break in two. `text-balance` keeps the split even here and
              degrades sanely for the longer en/pt strings. */}
          <h1
            className="text-[26px] font-extrabold leading-[1.1] sm:text-[30px] md:text-[46px] lg:text-[54px]"
            style={{ color: BASE.ink, maxWidth: '16ch', textWrap: 'balance' }}
          >
            {t('pub.shopNotFound')}
          </h1>
          <p
            className="max-w-sm text-[13px] font-medium leading-relaxed sm:text-sm md:text-lg"
            style={{ color: BASE.muted }}
          >
            {t('pub.shopNotFoundHint')}
          </p>
        </div>

        {/* Ours to use: whoever reached this already scans QR menus. */}
        <div
          className="flex flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-6 text-center text-white sm:gap-6 md:gap-11 md:px-8"
          style={{
            background: `linear-gradient(150deg, ${BASE.accent2} 0%, ${BASE.accent} 55%, ${lighten(BASE.accent, 0.3)} 100%)`,
          }}
        >
          <img
            src={MIPRECIO_LOGO_WHITE}
            alt="MiPrecio"
            className="h-9 w-auto sm:h-12 md:h-20 lg:h-24"
          />

          <div className="flex max-w-lg flex-col gap-2 md:gap-3">
            <h2 className="text-[20px] font-extrabold leading-[1.15] sm:text-[24px] md:text-[36px] lg:text-[42px]">
              {t('pub.lpHeadline')}
            </h2>
            <p className="text-xs font-medium leading-relaxed text-white/80 sm:text-[13px] md:text-base lg:text-lg">
              {t('pub.lpSub')}
            </p>
          </div>

          <ul className="flex flex-col gap-1.5 text-left sm:gap-2 md:gap-3">
            {['pub.lpFeat1', 'pub.lpFeat2', 'pub.lpFeat3'].map((key) => (
              <li
                key={key}
                className="flex items-center gap-2.5 text-xs font-semibold text-white/90 sm:text-[13px] md:gap-3 md:text-base lg:text-[17px]"
              >
                <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-5 sm:w-5 md:h-7 md:w-7">
                  <SIco name="check" size={12} />
                </span>
                {t(key)}
              </li>
            ))}
          </ul>

          <Link
            to="/"
            className="flex h-11 w-full max-w-xs items-center justify-center rounded-full bg-white text-[13px] font-bold shadow-[0_14px_30px_-12px_rgba(0,0,0,0.5)] sm:h-12 sm:text-sm md:h-14 md:max-w-sm md:text-base lg:h-16 lg:text-lg"
            style={{ color: BASE.accent }}
          >
            {t('pub.lpCta')}
          </Link>
        </div>
      </div>
    )
  }
  // The slug matches no list we serve: renamed, unpublished, or held back by the
  // plan. The shop exists, so send its customer to the rest of its catalogue —
  // never to MiPrecio's landing, which sells them nothing they came for.
  if (listId && displayLists.length === 0) {
    return (
      <ListNotFound
        tenant={tenant}
        lists={lists}
        t={t}
        accent={accent}
        brandGradient={brandGradient}
      />
    )
  }

  // Appearance falls back field by field: this list's own override → the
  // business default (Settings → Brand & appearance). Only a URL that targets
  // one list (/p/sub/slug, or its QR) takes that list's own look; the index
  // page merges every published list, so it stays on the business default even
  // when there happens to be a single list.
  const skin = listId ? list : null
  const design: ListDesign = skin?.design ?? tenant.listDesign ?? 'store'
  const isPencilCartDesign =
    isPencilVariant(design) || design === 'pencil-journal'
  const baseCartT =
    design === 'pencil-journal'
      ? pencilCartThemeFor('pencil-journal')
      : isPencilVariant(design)
        ? pencilCartThemeFor(design)
        : cartThemeFor(design)
  const cartT = isPencilCartDesign
    ? { ...baseCartT, accent, actionAccent: accent }
    : baseCartT
  const cartAccent = cartT.accent || accent
  const cartActionAccent = cartT.actionAccent || cartAccent
  const cartGradient = `linear-gradient(135deg, ${cartActionAccent} 0%, ${lighten(cartActionAccent, 0.22)} 100%)`
  const listSurface = isPencilCartDesign ? cartT.bg : C.bg
  const bgUrl = skin?.bgUrl ?? tenant.listBgUrl
  const bgOverlay = skin?.bgUrl ? !!skin.bgOverlay : !!tenant.listBgOverlay
  const hasBg = !!bgUrl
  const heroColor = skin?.heroColor || tenant.listHeroColor || accent
  const edition = String(list?.version?.versionNumber ?? 1).padStart(3, '0')
  const designProps: DesignProps = {
    tenant,
    C,
    accent,
    brandGradient,
    heroColor,
    t,
    money,
    currency,
    updated,
    monthYear,
    sections,
    base,
    allItems,
    cat,
    setCat,
    q,
    setQ,
    cart,
    cartCount,
    addToCart,
    decFromCart,
    openCart: () => setShowCart(true),
    waHref,
    checkoutChannel,
    onCheckout,
    isService,
    listName: list?.name ?? null,
    edition,
    taxId: tenant.taxId,
    hasBg,
    content,
    cartTheme: cartT,
  }
  const templateFont = content?.template?.font
  const publicFont =
    templateFont === 'code-pro'
      ? "'Code Pro', Inter, system-ui, sans-serif"
      : templateFont === 'mono'
        ? "'IBM Plex Mono', 'Courier New', monospace"
        : templateFont === 'editorial' || templateFont === 'serif'
          ? "'Playfair Display', Georgia, serif"
          : "'Inter', system-ui, -apple-system, sans-serif"

  return (
    <div
      className="miprecio-public-list min-h-[100dvh] font-sans"
      style={{
        background: listSurface,
        color: C.ink,
        fontFamily: publicFont,
      }}
    >
      {/* Tint the page scrollbar with the tenant's brand color while this public list is shown. */}
      <style>{`
        html { scrollbar-color: ${accent} transparent; }
        html::-webkit-scrollbar { width: 12px; height: 12px; }
        html::-webkit-scrollbar-track { background: transparent; }
        html::-webkit-scrollbar-thumb { background: ${accent}; border-radius: 9999px; border: 3px solid ${C.bg}; }
        html::-webkit-scrollbar-thumb:hover { background: ${C.accent2}; }
        .miprecio-public-list button:not(:disabled),
        .miprecio-public-list a[href],
        .miprecio-public-list [role="button"] { cursor: pointer; }
        .miprecio-public-list button:disabled { cursor: not-allowed; }
      `}</style>

      {!showCart && (
        <div className="relative flex min-h-[100dvh] flex-col overflow-x-clip">
          {/* Optional background image, with an optional brand-color filter on top. */}
          {hasBg && (
            <div
              className="pointer-events-none fixed inset-0"
              style={{
                zIndex: 0,
                backgroundImage: `url(${bgUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {bgOverlay && (
                <div
                  className="absolute inset-0"
                  style={{
                    background: accent,
                    opacity: 0.5,
                    mixBlendMode: 'multiply',
                  }}
                />
              )}
            </div>
          )}
          <div
            className={`relative flex-1 ${isPencilCartDesign && !isService ? 'pb-24' : ''}`}
            style={{ zIndex: 1 }}
          >
            {!listId && magazines.length > 0 && (
              <MagazineShelf
                tenant={tenant}
                magazines={magazines}
                accent={accent}
                t={t}
              />
            )}
            {isPencilVariant(design) ? (
              <PencilList variant={design} {...designProps} />
            ) : design === 'pencil-journal' ? (
              <PencilJournal {...designProps} />
            ) : design === 'store' ? (
              <Storefront
                tenant={tenant}
                C={C}
                accent={accent}
                heroColor={heroColor}
                t={t}
                money={money}
                currency={currency}
                updated={updated}
                sections={sections}
                base={base}
                allItems={allItems}
                cat={cat}
                setCat={setCat}
                q={q}
                setQ={setQ}
                cart={cart}
                addToCart={addToCart}
                cartCount={cartCount}
                shareLink={shareLink}
                copied={copied}
                waHref={waHref}
                list={list}
                norm={norm}
                isService={isService}
                openCart={() => setShowCart(true)}
                content={content}
              />
            ) : design === 'nordic' ? (
              <NordicMenu {...designProps} />
            ) : design === 'fine' ? (
              <FineDining {...designProps} />
            ) : design === 'modern' ? (
              <ModernBrand {...designProps} />
            ) : design === 'photo' ? (
              <PhotoLookbook {...designProps} />
            ) : design === 'cards' ? (
              <ServiceCards {...designProps} />
            ) : design === 'catalog' ? (
              <ImageCatalog {...designProps} />
            ) : design === 'tech' ? (
              <TechGrid {...designProps} />
            ) : (
              <ClassicList {...designProps} />
            )}
          </div>
          {isPencilCartDesign && !isService && !showCart && (
            <PencilActionBar props={designProps} />
          )}
          <a
            href="https://miprecio.app"
            target="_blank"
            rel="noreferrer"
            aria-label="Powered by MiPrecio"
            className="relative z-10 mx-auto flex w-fit items-center gap-2 px-5 py-7 text-[9px] font-bold uppercase tracking-[0.12em] no-underline"
            style={{ color: C.muted, background: listSurface }}
          >
            <span>Powered by</span>
            <span
              className="relative block h-6 w-[94px] overflow-hidden"
              aria-hidden="true"
            >
              <span
                className="absolute inset-0"
                style={{
                  background: accent,
                  WebkitMask:
                    "url('/miprecio-logo-white-pencil.webp') left center / contain no-repeat",
                  mask: "url('/miprecio-logo-white-pencil.webp') left center / contain no-repeat",
                }}
              />
              <span
                className="absolute bottom-0 left-[30%] right-0 h-[25%]"
                style={{ background: listSurface }}
              />
            </span>
          </a>
        </div>
      )}

      {viewerPromptEnabled && !showCart && (
        <ViewerCapturePrompt
          t={t}
          accent={accent}
          values={viewerContact}
          error={viewerError}
          saving={viewerSaving}
          onChange={(field, value) =>
            setViewerContact((current) => ({ ...current, [field]: value }))
          }
          onSubmit={() => void submitViewer()}
          onSkip={() => {
            setViewerSubmitted(true)
            if (subdomain && list) {
              void api
                .recordPublicViewerDismissal(subdomain, list.id)
                .then((response) => {
                  if (response.error) {
                    console.warn(
                      '[public] could not record anonymous dismissal',
                      response.error
                    )
                  }
                })
            }
          }}
        />
      )}

      {showCart && !isService && (
        <CartView
          tenant={tenant}
          T={cartT}
          accent={cartAccent}
          t={t}
          money={money}
          cart={cart}
          allItems={allItems}
          cartCount={cartCount}
          cartTotal={cartTotal}
          addToCart={addToCart}
          decFromCart={decFromCart}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          customer={customer}
          setCustomer={setCustomer}
          waHref={waHref}
          checkoutChannel={checkoutChannel}
          onCheckout={onCheckout}
          norm={norm}
          onBack={() => setShowCart(false)}
        />
      )}

      {/* Sticky cart bar — follows the selected design's theme; opens the full cart page. */}
      {!isService && !isPencilCartDesign && cartCount > 0 && !showCart && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur"
          style={{
            background: `${cartT.surface}F2`,
            borderColor: cartT.line,
            boxShadow: '0 -4px 24px rgba(15,13,26,0.12)',
          }}
        >
          <div className="mx-auto flex w-full max-w-[1160px] items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-12 md:py-4">
            <div className="flex min-w-0 items-center gap-2.5 md:gap-3.5">
              <svg
                className="shrink-0"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={cartActionAccent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span
                  className="hidden text-[11px] font-bold tracking-[1.6px] sm:block"
                  style={{ color: cartActionAccent }}
                >
                  {t('pub.cartTitle')}
                </span>
                <span
                  className="text-[13px] font-semibold leading-tight md:text-[15px]"
                  style={{ color: cartT.ink }}
                >
                  {t('pub.cartSummary', {
                    n: String(cartCount),
                    unit:
                      cartCount === 1 ? t('pub.product') : t('pub.products'),
                    total: money(cartTotal),
                  })}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 md:gap-4">
              <button
                type="button"
                onClick={clearCart}
                className="hidden text-[13px] font-semibold hover:opacity-70 sm:block"
                style={{ color: cartT.muted }}
              >
                {t('pub.cartClear')}
              </button>
              <button
                type="button"
                onClick={() => setShowCart(true)}
                className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-bold text-white hover:opacity-90 md:px-5 md:py-3 md:text-[14px]"
                style={{ background: cartGradient }}
              >
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

/** Dead end on a shop's own link or QR: the list is gone, the shop is not.
 *
 *  Reached by a renamed or unpublished list, and — since plan limits apply to
 *  what is already published — by every list the current plan no longer serves.
 *  The reader is the shop's customer standing at a table with a phone, so this
 *  wears the shop's own storefront skin and offers the shop's other lists. When
 *  there are none (an expired subscription takes the whole storefront down) it
 *  says so plainly rather than advertising MiPrecio to someone who came for a
 *  menu.
 *
 *  No single list is being shown, so the look comes from the shop's main list
 *  (`showOnIndex`) and falls back field by field to the business defaults — the
 *  same cascade the storefront uses. A shop on the dark "tech" or "fine"
 *  template gets a dark dead end, not a white card that reads as another site. */
function ViewerCapturePrompt({
  t,
  accent,
  values,
  error,
  saving,
  onChange,
  onSubmit,
  onSkip,
}: {
  t: TFn
  accent: string
  values: { name: string; email: string; phone: string }
  error: boolean
  saving: boolean
  onChange: (field: 'name' | 'email' | 'phone', value: string) => void
  onSubmit: () => void
  onSkip: () => void
}) {
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email')
  const fieldClass =
    'h-12 w-full rounded-xl border border-[#E5E2DC] bg-[#FAFAF7] px-3.5 text-sm font-medium text-[#0F0D1A] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15'

  const switchContactMethod = (method: 'email' | 'phone') => {
    setContactMethod(method)
    onChange(method === 'email' ? 'phone' : 'email', '')
    onChange(method, values[method])
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F0D1A]/45 p-4 backdrop-blur-sm">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
        className="w-full max-w-[440px] overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_-20px_rgba(15,13,26,0.45)]"
      >
        <div className="h-1.5 w-full" style={{ background: accent }} />
        <div className="p-6 sm:p-7">
          <div
            className="-mx-6 -mt-6 flex items-start gap-3 px-6 py-6 sm:-mx-7 sm:-mt-7 sm:px-7"
            style={{ background: accent }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(255,255,255,.18)' }}
            >
              <SIco name="message-circle" size={21} color="#fff" />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <h2
                className="text-xl font-extrabold leading-tight"
                style={{ color: readableOn(accent) }}
              >
                {t('viewer.title')}
              </h2>
              <p
                className="text-sm font-medium leading-5"
                style={{ color: `${readableOn(accent)}CC` }}
              >
                {t('viewer.subtitle')}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-[#FAFAF7] p-1">
            <div className="grid grid-cols-2 gap-1">
              {(['email', 'phone'] as const).map((method) => {
                const active = contactMethod === method
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => switchContactMethod(method)}
                    aria-pressed={active}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition"
                    style={{
                      background: active ? accent : 'transparent',
                      borderColor: active ? accent : 'transparent',
                      color: active ? readableOn(accent) : '#84818E',
                      boxShadow: active
                        ? '0 4px 12px rgba(15,13,26,0.16)'
                        : 'none',
                    }}
                  >
                    {active && (
                      <SIco name="check" size={13} color={readableOn(accent)} />
                    )}
                    {method === 'email' ? t('viewer.email') : t('viewer.phone')}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#44424E]">
                {t('viewer.name')}
              </span>
              <input
                autoFocus
                value={values.name}
                onChange={(event) => onChange('name', event.target.value)}
                placeholder={t('viewer.namePlaceholder')}
                className={fieldClass}
                required
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#44424E]">
                {contactMethod === 'email'
                  ? t('viewer.email')
                  : t('viewer.phone')}
              </span>
              <input
                type={contactMethod === 'email' ? 'email' : 'tel'}
                inputMode={contactMethod === 'email' ? 'email' : 'tel'}
                value={values[contactMethod]}
                onChange={(event) =>
                  onChange(contactMethod, event.target.value)
                }
                placeholder={
                  contactMethod === 'email'
                    ? t('viewer.emailPlaceholder')
                    : t('viewer.phonePlaceholder')
                }
                className={fieldClass}
                required
              />
            </label>
            <p className="text-[11px] font-medium text-[#84818E]">
              {t('viewer.contactHint')}
            </p>
            <p className="text-[10px] font-medium leading-4 text-[#A19EAA]">
              {t('viewer.privacy')}
            </p>
            {error && (
              <p className="text-xs font-bold text-[#DC2626]">
                {t('viewer.required')}
              </p>
            )}
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: accent }}
            >
              {saving ? t('viewer.submitting') : t('viewer.submit')}
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="h-10 rounded-xl px-4 text-xs font-bold text-[#84818E] hover:bg-[#FAFAF7]"
            >
              {t('viewer.skip')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function ListNotFound({
  tenant,
  lists,
  t,
  accent,
  brandGradient,
}: {
  tenant: Tenant
  lists: PublicList[]
  t: ReturnType<typeof getT>
  accent: string
  brandGradient: string
}) {
  const onBrand = readableOn(accent)
  const main = lists.find((l) => l.showOnIndex) ?? lists[0] ?? null
  const design: ListDesign = main?.design ?? tenant.listDesign ?? 'store'
  const skin = cartThemeFor(design)
  const heroColor = main?.heroColor || tenant.listHeroColor || accent
  const bgUrl = main?.bgUrl ?? tenant.listBgUrl
  const bgOverlay = main?.bgUrl ? !!main.bgOverlay : !!tenant.listBgOverlay

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 py-12 font-sans"
      style={{ background: skin.bg }}
    >
      {bgUrl && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {bgOverlay && (
            <div
              className="absolute inset-0"
              style={{
                background: accent,
                opacity: 0.5,
                mixBlendMode: 'multiply',
              }}
            />
          )}
        </div>
      )}

      <div className="relative flex flex-col items-center gap-3 text-center">
        {tenant.logoUrl ? (
          <img
            src={tenant.logoUrl}
            alt={tenant.name}
            className="h-16 w-16 rounded-2xl object-cover"
          />
        ) : (
          <span
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold"
            style={{ background: brandGradient, color: onBrand }}
          >
            {tenant.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <h1 className="text-xl font-extrabold" style={{ color: skin.ink }}>
          {tenant.name}
        </h1>
      </div>

      <div className="relative flex w-full max-w-sm flex-col gap-4">
        <p
          className="text-center text-sm font-medium"
          style={{ color: skin.body }}
        >
          {lists.length > 0 ? t('pub.listGone') : t('pub.catalogUnavailable')}
        </p>

        {lists.length > 0 ? (
          <>
            <p
              className="text-center text-xs font-bold uppercase tracking-wide"
              style={{ color: skin.muted }}
            >
              {t('pub.listGoneOthers')}
            </p>
            <div className="flex flex-col gap-2">
              {lists.map((l) => {
                const count = l.version?.items?.length ?? 0
                return (
                  <Link
                    key={l.id}
                    to={`/p/${tenant.subdomain}/${l.slug || l.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 transition-transform active:scale-[0.99]"
                    style={{
                      background: skin.surface,
                      border: `1px solid ${skin.line}`,
                      color: skin.ink,
                    }}
                  >
                    <span className="truncate text-sm font-bold">{l.name}</span>
                    <span
                      className="shrink-0 text-xs font-semibold"
                      style={{ color: skin.muted }}
                    >
                      {count} {t(count === 1 ? 'pub.product' : 'pub.products')}
                    </span>
                  </Link>
                )
              })}
            </div>
            <Link
              to={`/p/${tenant.subdomain}`}
              className="mt-1 flex h-12 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: heroColor, color: readableOn(heroColor) }}
            >
              {t('pub.seeCatalog')}
            </Link>
          </>
        ) : (
          /* Nothing of this shop is being served — most often an expired
             subscription. Say so and stop: there is nowhere useful to send them. */
          <p
            className="text-center text-sm font-medium"
            style={{ color: skin.muted }}
          >
            {t('pub.catalogUnavailableHint')}
          </p>
        )}
      </div>
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
  list: { name: string } | null
  norm: (s?: string | null) => string
  isService: boolean
  openCart: () => void
  content: ListContent | null
}

function Storefront(p: StoreProps) {
  const {
    tenant,
    C,
    accent,
    heroColor,
    t,
    money,
    updated,
    sections,
    base,
    allItems,
    cat,
    setCat,
    q,
    setQ,
    cart,
    addToCart,
    cartCount,
    shareLink,
    copied,
    waHref,
    list,
    norm,
    isService,
    openCart,
    content,
  } = p
  const grad = {
    background: `linear-gradient(135deg, ${accent} 0%, ${C.accent2} 100%)`,
  }
  const heroInk = readableOn(heroColor)
  const heroGrad = {
    background: `linear-gradient(135deg, ${heroColor} 0%, ${lighten(heroColor, 0.18)} 100%)`,
  }
  const heroChip =
    heroInk === '#FFFFFF' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)'
  const gridItems =
    cat === 'all' ? base : base.filter((i) => norm(i.category) === cat)
  const featured = useMemo(
    () =>
      [...allItems].sort(
        (a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)
      )[0],
    [allItems]
  )
  const hero = content?.hero
  const heroTitle =
    hero?.title ||
    tenant.description ||
    t('store.heroTitle', { name: tenant.name })
  const heroStats = hero?.stats?.map((stat) => [stat.value, stat.label]) ?? [
    [`${allItems.length}`, t('store.statProducts')],
    ['24/7', t('store.statShipping')],
    [updated, t('store.statUpdated')],
  ]
  const promotion = content?.blocks.find(
    (block) => block.type === 'promotion_strip'
  )
  const contact = content?.blocks.find((block) => block.type === 'contact')

  return (
    <div className="min-h-screen bg-[#FCFBF9]">
      {/* Top nav */}
      <header
        className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur"
        style={{ borderColor: C.line }}
      >
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-4 px-5 py-3 md:px-16">
          <div className="flex items-center gap-3">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="h-11 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <>
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-[14px] text-white"
                  style={grad}
                >
                  <SIco name="shopping-bag" size={22} color="#fff" />
                </span>
                <div className="flex flex-col">
                  <span
                    className="text-[17px] font-extrabold"
                    style={{ color: C.ink }}
                  >
                    {tenant.name}
                  </span>
                  {tenant.address && (
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: C.muted }}
                    >
                      {tenant.address}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {!isService && (
              <button
                type="button"
                onClick={openCart}
                className="flex h-10 items-center gap-2 rounded-[12px] px-4 text-[13px] font-bold text-white shadow-[0_8px_18px_-10px_rgba(15,13,26,0.55)]"
                style={grad}
              >
                <SIco name="shopping-cart" size={16} color="#fff" />{' '}
                {t('store.myCart')}
                {cartCount > 0 ? ` · ${cartCount}` : ''}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero (uses the configurable hero color) */}
      <section className="py-9 md:py-11" style={heroGrad}>
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-10 px-5 md:px-16 lg:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            <span
              className="w-fit rounded-full px-3 py-1 text-[11px] font-bold tracking-[2px]"
              style={{ background: heroChip, color: heroInk }}
            >
              {hero?.eyebrow || t('store.badge')}
            </span>
            <h1
              className="text-3xl font-black leading-tight md:text-[40px]"
              style={{ color: heroInk }}
            >
              {heroTitle}
            </h1>
            <p
              className="max-w-[560px] text-[15px] font-medium"
              style={{ color: heroInk, opacity: 0.82 }}
            >
              {hero?.body || t('store.heroSub')}
            </p>
            <div className="mt-2 flex flex-wrap gap-8">
              {heroStats.map(([v, l]) => (
                <div key={l} className="flex flex-col gap-0.5">
                  <span
                    className="text-[22px] font-extrabold"
                    style={{ color: heroInk }}
                  >
                    {v}
                  </span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: heroInk, opacity: 0.82 }}
                  >
                    {l}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {featured && (
            <div className="w-full max-w-[380px] rounded-[22px] bg-white p-5 shadow-[0_20px_42px_-18px_rgba(15,13,26,0.32)] md:p-6">
              <div
                className="relative mb-4 flex h-36 items-end justify-between overflow-hidden rounded-[16px] p-3 md:h-44"
                style={{
                  background: `linear-gradient(135deg, ${accent}26 0%, #ffffff 100%)`,
                }}
              >
                {featured.imageUrl && (
                  <img
                    src={featured.imageUrl}
                    alt={featured.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {featured.imageUrl && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${accent}55 0%, ${accent}12 100%)`,
                    }}
                  />
                )}
                <span
                  className="relative rounded-full bg-white px-2.5 py-1 text-[11px] font-bold"
                  style={{ color: accent }}
                >
                  {t('store.featured')}
                </span>
                {!featured.imageUrl && (
                  <SIco
                    name={categoryIcon(featured.category)}
                    size={52}
                    color={accent}
                    style={{ opacity: 0.5 }}
                  />
                )}
              </div>
              <p className="text-[16px] font-bold" style={{ color: C.ink }}>
                {featured.name}
              </p>
              <div className="mt-2 flex items-end justify-between">
                <span
                  className="text-[26px] font-black"
                  style={{ color: C.ink }}
                >
                  {money(featured.price)}
                </span>
                {!isService && (
                  <button
                    type="button"
                    onClick={() => addToCart(featured.id)}
                    className="flex items-center gap-1 rounded-[10px] px-4 py-2 text-[13px] font-bold text-white"
                    style={grad}
                  >
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
          <label
            className="flex h-12 flex-1 items-center gap-2.5 rounded-[14px] border px-4"
            style={{ borderColor: C.line, background: `${accent}08` }}
          >
            <SIco name="search" size={18} color={C.muted} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('store.searchPh')}
              className="min-w-0 flex-1 border-0 bg-transparent text-[14px] outline-none focus:ring-0"
              style={{ color: C.ink }}
            />
          </label>
        </div>
      </div>

      {/* Category chips */}
      <div className="border-b bg-white" style={{ borderColor: C.line }}>
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-2.5 px-5 py-4 md:px-16">
          <StoreChip
            active={cat === 'all'}
            onClick={() => setCat('all')}
            label={t('store.allProducts')}
            count={base.length}
            colors={C}
            gradient={grad}
          />
          {sections.map((s) => (
            <StoreChip
              key={s.key}
              active={cat === s.key}
              onClick={() => setCat(s.key)}
              label={s.name}
              count={s.items.length}
              colors={C}
              gradient={grad}
            />
          ))}
        </div>
      </div>

      {promotion?.type === 'promotion_strip' && promotion.items.length > 0 && (
        <div className="border-b bg-violet-50" style={{ borderColor: C.line }}>
          <div className="mx-auto flex w-full max-w-[1280px] flex-wrap gap-x-6 gap-y-2 px-5 py-3 text-[12px] font-bold md:px-16">
            {promotion.items.map((item) => (
              <span
                key={item}
                className="flex items-center gap-2"
                style={{ color: accent }}
              >
                <SIco name="sparkles" size={14} color={accent} /> {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-5 py-8 md:px-16 lg:flex-row">
        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[280px]">
          <div
            className="flex flex-col gap-4 rounded-[20px] border bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,13,26,0.28)] md:p-6"
            style={{ borderColor: C.line }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[16px] font-extrabold"
                style={{ color: C.ink }}
              >
                {t('store.filters')}
              </span>
              {cat !== 'all' && (
                <button
                  type="button"
                  onClick={() => setCat('all')}
                  className="text-[12px] font-bold"
                  style={{ color: accent }}
                >
                  {t('store.clear')}
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <span
                className="text-[12px] font-bold tracking-wide"
                style={{ color: C.body }}
              >
                {t('store.categories')}
              </span>
              {sections.map((s) => {
                const on = cat === s.key
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setCat(on ? 'all' : s.key)}
                    className="flex items-center justify-between gap-2 text-left text-[13px]"
                    style={{
                      color: on ? accent : C.body,
                      fontWeight: on ? 700 : 500,
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded border"
                        style={{
                          borderColor: on ? accent : C.line,
                          background: on ? accent : 'transparent',
                        }}
                      >
                        {on && <SIco name="check" size={11} color="#fff" />}
                      </span>
                      {s.name}
                    </span>
                    <span className="text-[11px]" style={{ color: C.muted }}>
                      {s.items.length}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* WhatsApp card */}
          <div
            className="flex flex-col gap-3 rounded-[20px] p-5 text-white shadow-[0_18px_30px_-18px_rgba(15,13,26,0.35)] md:p-6"
            style={grad}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
              <SIco name="message-circle" size={20} color={accent} />
            </span>
            <span className="text-[16px] font-extrabold">
              {t('store.waTitle')}
            </span>
            <span className="text-[12px] font-medium text-white/80">
              {t('store.waSub')}
            </span>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit rounded-lg bg-white px-3.5 py-2 text-[13px] font-bold"
              style={{ color: accent }}
            >
              {t('store.waBtn')}
            </a>
            {contact?.type === 'contact' &&
              contact.hours &&
              contact.hours.length > 0 && (
                <div className="mt-1 border-t border-white/20 pt-3 text-[12px] font-medium text-white/90">
                  {contact.hours.map((entry) => (
                    <div
                      key={entry.days}
                      className="flex justify-between gap-3"
                    >
                      <span>{entry.days}</span>
                      <span>{entry.hours}</span>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </aside>

        {/* Product grid */}
        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col">
              <span
                className="text-[22px] font-extrabold"
                style={{ color: C.ink }}
              >
                {cat === 'all'
                  ? t('store.allProducts')
                  : sections.find((s) => s.key === cat)?.name}
              </span>
              <span
                className="text-[12px] font-medium"
                style={{ color: C.muted }}
              >
                {t('store.showing', {
                  n: String(gridItems.length),
                  total: String(base.length),
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={shareLink}
              className="flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[12px] font-bold"
              style={{ borderColor: C.line, color: C.body }}
            >
              <SIco name="share-2" size={14} color={C.body} />{' '}
              {copied ? t('pub.copied') : t('pub.share')}
            </button>
          </div>

          {gridItems.length === 0 ? (
            <p
              className="py-20 text-center text-sm font-medium"
              style={{ color: C.muted }}
            >
              {t('pub.empty')}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {gridItems.map((it) => {
                const qty = cart[it.id] ?? 0
                return (
                  <div
                    key={it.id}
                    className="flex flex-col gap-2.5 rounded-[20px] border bg-white p-3.5 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.22)]"
                    style={{ borderColor: C.line }}
                  >
                    <div
                      className="relative flex h-32 items-end justify-end overflow-hidden rounded-[15px] p-2.5 sm:h-36 xl:h-40"
                      style={{
                        background: `linear-gradient(135deg, ${accent}22 0%, #ffffff 100%)`,
                      }}
                    >
                      {it.imageUrl ? (
                        <img
                          src={it.imageThumbUrl || it.imageUrl}
                          alt={it.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <SIco
                          name={categoryIcon(it.category)}
                          size={48}
                          color={accent}
                          style={{ opacity: 0.45 }}
                        />
                      )}
                      {it.imageUrl && (
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${accent}55 0%, ${accent}12 100%)`,
                          }}
                        />
                      )}
                      {it.category && (
                        <span
                          className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold"
                          style={{ color: accent }}
                        >
                          {p.norm(it.category) === 'otros'
                            ? t('store.other')
                            : it.category}
                        </span>
                      )}
                    </div>
                    <p
                      className="line-clamp-2 text-[14px] font-bold leading-tight"
                      style={{ color: C.ink }}
                    >
                      {it.name}
                    </p>
                    {it.description && (
                      <p
                        className="line-clamp-1 text-[12px] font-medium"
                        style={{ color: C.muted }}
                      >
                        {it.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                      <span
                        className="text-[17px] font-black"
                        style={{ color: C.ink }}
                      >
                        {money(it.price)}
                      </span>
                      {!isService &&
                        (qty > 0 ? (
                          <span
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-bold text-white"
                            style={grad}
                          >
                            <SIco name="check" size={12} color="#fff" /> {qty}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(it.id)}
                            className="flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-[12px] font-bold text-white"
                            style={grad}
                          >
                            <SIco name="plus" size={12} color="#fff" />{' '}
                            {t('pub.add')}
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
          <span className="text-[16px] font-bold text-white">
            {tenant.name}
          </span>
          {tenant.address && (
            <span
              className="text-[12px] font-medium"
              style={{ color: '#94A3B8' }}
            >
              {tenant.address}
            </span>
          )}
          {tenant.taxId && (
            <span
              className="text-[12px] font-medium"
              style={{ color: '#94A3B8' }}
            >
              {t('pub.taxId')} {tenant.taxId}
            </span>
          )}
          <div
            className="my-2 h-px w-full"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />
          <span
            className="text-[12px] font-medium"
            style={{ color: '#94A3B8' }}
          >
            {t('pub.footer', { currency: p.currency })}
            {list ? ` · ${list.name}` : ''}
          </span>
        </div>
      </footer>
    </div>
  )
}

/* ── Cart page — mirrors the Pencil "Carrito · Desktop" design, wired to real cart data ── */
type CartCustomer = {
  name: string
  phone: string
  email: string
  delivery: 'pickup' | 'delivery'
  address: string
  notes: string
}
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
  checkoutChannel: 'whatsapp' | 'instagram'
  onCheckout: () => void
  norm: (s?: string | null) => string
  onBack: () => void
}

function CartView(p: CartProps) {
  const {
    tenant,
    T,
    accent,
    t,
    money,
    cart,
    allItems,
    cartCount,
    cartTotal,
    addToCart,
    decFromCart,
    removeFromCart,
    clearCart,
    customer,
    setCustomer,
    waHref,
    checkoutChannel,
    onCheckout,
    norm,
    onBack,
  } = p
  const cartAccent = T.accent || accent
  const cartActionAccent = T.actionAccent || cartAccent
  const grad = {
    background: `linear-gradient(135deg, ${cartActionAccent} 0%, ${lighten(cartActionAccent, 0.22)} 100%)`,
  }
  const cartItems = allItems.filter((it) => (cart[it.id] ?? 0) > 0)
  const set = (patch: Partial<CartCustomer>) =>
    setCustomer((c) => ({ ...c, ...patch }))
  const field =
    'h-[46px] w-full border px-3.5 text-[13px] font-semibold outline-none focus:ring-2'
  const fieldStyle = {
    borderColor: T.line,
    color: T.ink,
    background: T.field,
    borderRadius: T.controlRadius,
    fontFamily: T.bodyFamily,
  }
  const labelCls = 'text-[12px] font-bold'
  const cardCls = 'border p-5 md:p-7'
  const cardStyle = {
    background: T.surface,
    borderColor: T.line,
    borderRadius: T.cardRadius,
    boxShadow: T.cardShadow,
  }

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: `linear-gradient(180deg, ${cartAccent}22 0%, ${cartAccent}0A 300px, transparent 460px), ${T.bg}`,
        color: T.ink,
        fontFamily: T.bodyFamily,
      }}
    >
      {/* Navbar */}
      <header
        className="sticky top-0 z-30 flex flex-wrap items-center gap-4 border-b px-5 py-3.5 backdrop-blur md:px-16"
        style={{
          background: `${T.surface}F2`,
          borderColor: T.line,
          fontFamily: T.bodyFamily,
        }}
      >
        <div className="flex items-center gap-3">
          {tenant.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="h-11 w-auto max-w-[160px] object-contain"
            />
          ) : (
            <>
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                style={{ ...grad, borderRadius: T.buttonRadius }}
              >
                <SIco name="shopping-bag" size={22} color="#fff" />
              </span>
              <div className="flex flex-col">
                <span
                  className="text-[17px] font-extrabold"
                  style={{ color: T.ink }}
                >
                  {tenant.name}
                </span>
                {tenant.address && (
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: T.muted }}
                  >
                    {tenant.address}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 items-center gap-2 px-3.5 text-[13px] font-bold"
          style={{
            background: `${cartActionAccent}22`,
            color: cartActionAccent,
            borderRadius: T.buttonRadius,
          }}
        >
          <SIco name="arrow-left" size={14} color={cartActionAccent} />{' '}
          {t('store.keepShopping')}
        </button>
      </header>

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-3 px-5 pb-4 pt-7 md:px-16">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBack}
            className="text-[12px] font-medium hover:underline"
            style={{ color: T.muted }}
          >
            {t('store.catalog')}
          </button>
          <SIco name="chevron-right" size={14} color={T.muted} />
          <span className="text-[12px] font-bold" style={{ color: T.body }}>
            {t('store.yourCart')}
          </span>
        </div>
      </div>

      {cartCount === 0 ? (
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-5 px-5 py-24 text-center md:px-16">
          <span
            className="flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{
              background: `${cartAccent}1F`,
              borderRadius: T.cardRadius,
            }}
          >
            <SIco name="shopping-cart" size={36} color={cartAccent} />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-[20px] font-extrabold" style={{ color: T.ink }}>
              {t('store.cartEmptyTitle')}
            </p>
            <p className="text-[14px] font-medium" style={{ color: T.muted }}>
              {t('store.cartEmptySub')}
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="flex h-12 items-center gap-2 rounded-2xl px-6 text-[14px] font-bold text-white"
            style={{ ...grad, borderRadius: T.buttonRadius }}
          >
            <SIco name="arrow-left" size={16} color="#fff" />{' '}
            {t('store.keepShopping')}
          </button>
        </div>
      ) : (
        <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-5 pb-12 md:px-16 lg:flex-row">
          {/* Left column */}
          <div className="flex flex-1 flex-col gap-4">
            {/* Title row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1
                  className="text-[28px] font-black md:text-[32px]"
                  style={{
                    color: T.ink,
                    fontFamily: T.headingFamily,
                    letterSpacing: T.headingTracking,
                  }}
                >
                  {t('store.yourCart')}
                </h1>
                <p
                  className="text-[14px] font-medium"
                  style={{ color: T.muted }}
                >
                  {t('store.cartReview')}
                </p>
              </div>
              <button
                type="button"
                onClick={clearCart}
                className="flex h-9 items-center gap-2 border px-3.5 text-[13px] font-bold"
                style={{
                  borderColor: '#EF444455',
                  color: '#EF4444',
                  background: '#EF444414',
                  borderRadius: T.buttonRadius,
                }}
              >
                <SIco name="trash-2" size={14} color="#EF4444" />{' '}
                {t('store.cartClear')}
              </button>
            </div>

            {/* Products card */}
            <div className={cardCls} style={cardStyle}>
              <div className="flex items-center gap-2.5 pb-2">
                <h2
                  className="text-[18px] font-extrabold md:text-[20px]"
                  style={{
                    color: T.ink,
                    fontFamily: T.headingFamily,
                    letterSpacing: T.headingTracking,
                  }}
                >
                  {t('store.cartProducts')}
                </h2>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{ background: `${cartAccent}22`, color: cartAccent }}
                >
                  {cartCount}{' '}
                  {cartCount === 1 ? t('pub.product') : t('pub.products')}
                </span>
              </div>
              {cartItems.map((it) => {
                const qty = cart[it.id] ?? 0
                const line = (parseFloat(it.price) || 0) * qty
                return (
                  <div
                    key={it.id}
                    className="flex flex-wrap items-center gap-4 border-t py-4 first:border-t-0"
                    style={{ borderColor: T.divider }}
                  >
                    <div
                      className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[14px]"
                      style={{
                        background: `linear-gradient(135deg, ${cartAccent}2A 0%, ${T.field} 100%)`,
                      }}
                    >
                      {it.imageUrl ? (
                        <img
                          src={it.imageThumbUrl || it.imageUrl}
                          alt={it.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <SIco
                          name={categoryIcon(it.category)}
                          size={34}
                          color={cartAccent}
                          style={{ opacity: 0.7 }}
                        />
                      )}
                    </div>
                    <div className="flex min-w-[140px] flex-1 flex-col gap-1.5">
                      <p
                        className="text-[15px] font-bold leading-tight"
                        style={{ color: T.ink }}
                      >
                        {it.name}
                      </p>
                      {it.description && (
                        <p
                          className="line-clamp-1 text-[12px] font-medium"
                          style={{ color: T.muted }}
                        >
                          {it.description}
                        </p>
                      )}
                      {it.category && (
                        <span
                          className="w-fit rounded-full px-2 py-0.5 text-[11px] font-bold"
                          style={{ background: T.divider, color: T.body }}
                        >
                          {norm(it.category) === 'otros'
                            ? t('store.other')
                            : it.category}
                        </span>
                      )}
                    </div>
                    <div
                      className="flex items-center rounded-xl border"
                      style={{
                        borderColor: T.line,
                        background: T.field,
                        borderRadius: T.controlRadius,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => decFromCart(it.id)}
                        aria-label="−"
                        className="flex h-10 w-10 items-center justify-center hover:opacity-60"
                      >
                        <SIco name="minus" size={14} color={T.body} />
                      </button>
                      <span
                        className="flex h-10 w-10 items-center justify-center text-[16px] font-extrabold"
                        style={{ color: T.ink }}
                      >
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCart(it.id)}
                        aria-label="+"
                        className="flex h-10 w-10 items-center justify-center hover:opacity-60"
                      >
                        <SIco name="plus" size={14} color={T.body} />
                      </button>
                    </div>
                    <div className="flex w-[120px] flex-col items-end gap-0.5">
                      <span
                        className="text-[18px] font-black"
                        style={{ color: T.ink }}
                      >
                        {money(line)}
                      </span>
                      {qty > 1 && (
                        <span
                          className="text-[12px] font-medium"
                          style={{ color: T.muted }}
                        >
                          {money(it.price)} {t('store.each')}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(it.id)}
                      aria-label={t('store.cartRemove')}
                      className="flex h-9 w-9 items-center justify-center"
                      style={{
                        background: '#EF444418',
                        borderRadius: T.controlRadius,
                      }}
                    >
                      <SIco name="x" size={16} color="#EF4444" />
                    </button>
                  </div>
                )
              })}
              <div
                className="flex items-center justify-end gap-2 border-t pt-4"
                style={{ borderColor: T.divider }}
              >
                <span
                  className="text-[14px] font-medium"
                  style={{ color: T.body }}
                >
                  {t('store.cartSubtotalN', { n: String(cartCount) })}
                </span>
                <span
                  className="text-[18px] font-extrabold"
                  style={{
                    color: T.ink,
                    fontFamily: T.headingFamily,
                    letterSpacing: T.headingTracking,
                  }}
                >
                  {money(cartTotal)}
                </span>
              </div>
            </div>

            {/* Contact card */}
            <div className={`flex flex-col gap-4 ${cardCls}`} style={cardStyle}>
              <div className="flex flex-col gap-1">
                <h2
                  className="text-[18px] font-extrabold"
                  style={{
                    color: T.ink,
                    fontFamily: T.headingFamily,
                    letterSpacing: T.headingTracking,
                  }}
                >
                  {t('store.cartYourData')}
                </h2>
                <p
                  className="text-[12px] font-medium"
                  style={{ color: T.muted }}
                >
                  {t('store.cartYourDataSub')}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span
                    className={labelCls}
                    style={{ color: T.body, fontFamily: T.labelFamily }}
                  >
                    {t('store.cartName')}
                  </span>
                  <input
                    value={customer.name}
                    onChange={(e) => set({ name: e.target.value })}
                    placeholder={t('store.cartNamePh')}
                    className={field}
                    style={fieldStyle}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span
                    className={labelCls}
                    style={{ color: T.body, fontFamily: T.labelFamily }}
                  >
                    {t('store.cartPhone')}
                  </span>
                  <input
                    value={customer.phone}
                    onChange={(e) => set({ phone: e.target.value })}
                    placeholder={t('store.cartPhonePh')}
                    className={field}
                    style={fieldStyle}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span
                    className={labelCls}
                    style={{ color: T.body, fontFamily: T.labelFamily }}
                  >
                    {t('store.cartEmail')}
                  </span>
                  <input
                    value={customer.email}
                    onChange={(e) => set({ email: e.target.value })}
                    placeholder={t('store.cartEmailPh')}
                    className={field}
                    style={fieldStyle}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span
                    className={labelCls}
                    style={{ color: T.body, fontFamily: T.labelFamily }}
                  >
                    {t('store.cartDelivery')}
                  </span>
                  {tenant.deliveryEnabled ? (
                    <select
                      value={customer.delivery}
                      onChange={(e) =>
                        set({
                          delivery: e.target.value as 'pickup' | 'delivery',
                        })
                      }
                      className={field}
                      style={fieldStyle}
                    >
                      <option value="pickup">{t('store.cartPickup')}</option>
                      <option value="delivery">
                        {t('store.cartShipping')}
                      </option>
                    </select>
                  ) : (
                    // Business doesn't offer delivery → pickup is the only option.
                    <div
                      className={`${field} flex items-center`}
                      style={{
                        borderColor: T.line,
                        color: T.ink,
                        background: T.divider,
                      }}
                    >
                      {t('store.cartPickup')}
                    </div>
                  )}
                </label>
                {tenant.deliveryEnabled && customer.delivery === 'delivery' && (
                  <label className="flex flex-col gap-1.5 md:col-span-2">
                    <span
                      className={labelCls}
                      style={{ color: T.body, fontFamily: T.labelFamily }}
                    >
                      {t('store.cartAddress')}
                    </span>
                    <input
                      value={customer.address}
                      onChange={(e) => set({ address: e.target.value })}
                      placeholder={t('store.cartAddressPh')}
                      className={field}
                      style={fieldStyle}
                    />
                  </label>
                )}
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span
                    className={labelCls}
                    style={{ color: T.body, fontFamily: T.labelFamily }}
                  >
                    {t('store.cartNotes')}
                  </span>
                  <textarea
                    value={customer.notes}
                    onChange={(e) => set({ notes: e.target.value })}
                    placeholder={t('store.cartNotesPh')}
                    rows={3}
                    className="w-full border px-3.5 py-3 text-[13px] font-semibold outline-none focus:ring-2"
                    style={fieldStyle}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right column — order summary */}
          <div className="flex w-full flex-col gap-4 lg:w-[380px]">
            <div
              className={`flex flex-col gap-4 ${cardCls} lg:sticky lg:top-24`}
              style={cardStyle}
            >
              <div className="flex flex-col gap-1">
                <h2
                  className="text-[18px] font-extrabold"
                  style={{
                    color: T.ink,
                    fontFamily: T.headingFamily,
                    letterSpacing: T.headingTracking,
                  }}
                >
                  {t('store.cartSummary')}
                </h2>
                <p
                  className="text-[12px] font-medium"
                  style={{ color: T.muted }}
                >
                  {t('store.cartPricesIn', {
                    currency: tenant.currency || 'UYU',
                  })}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-[13px] font-medium"
                  style={{ color: T.body }}
                >
                  {t('store.cartSubtotal')}
                </span>
                <span
                  className="text-[14px] font-bold"
                  style={{ color: T.ink }}
                >
                  {money(cartTotal)}
                </span>
              </div>
              <div className="h-px w-full" style={{ background: T.divider }} />
              <div className="flex items-center justify-between">
                <span
                  className="text-[16px] font-extrabold"
                  style={{ color: T.ink }}
                >
                  {t('store.cartTotal')}
                </span>
                <span
                  className="text-[24px] font-black"
                  style={{ color: T.ink }}
                >
                  {money(cartTotal)}
                </span>
              </div>
              <a
                href={waHref}
                onClick={onCheckout}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 items-center justify-center gap-2 text-[16px] font-extrabold text-white"
                style={{ ...grad, borderRadius: T.buttonRadius }}
              >
                <SIco name="message-circle" size={22} color="#fff" />{' '}
                {checkoutChannel === 'instagram'
                  ? 'Copiar pedido y abrir Instagram'
                  : t('store.cartSend')}
              </a>
              <div className="flex items-center justify-center gap-1.5">
                <SIco name="shield-check" size={12} color="#10B981" />
                <span
                  className="text-[11px] font-medium"
                  style={{ color: T.muted }}
                >
                  {t('store.cartTrust')}
                </span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer
        className="flex flex-col items-center gap-2 px-5 py-8 md:px-16"
        style={{ background: T.footerBg }}
      >
        <span className="text-[14px] font-bold text-white">{tenant.name}</span>
        <span
          className="text-[12px] font-medium"
          style={{ color: T.footerText }}
        >
          {t('pub.footer', { currency: tenant.currency || 'UYU' })}
        </span>
      </footer>
    </div>
  )
}

export default MenuScreen
