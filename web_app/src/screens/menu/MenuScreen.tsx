import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { LoadingSpinner } from '../../components'
import api from '../../services/api'
import type { Tenant, ListVersion, Item } from '../../types'

interface PublicList {
  id: string
  name: string
  slug: string | null
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

  const displayLists = listId ? lists.filter((l) => l.id === listId || l.slug === listId) : lists

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

  const currency = tenant?.currency || 'UYU'
  const fmt = (price: string | number) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(typeof price === 'number' ? price : parseFloat(price))
  const money = (price: string | number) => `${currency} ${fmt(price)}`

  const norm = (s?: string | null) => (s?.trim() || 'Otros').toLowerCase()
  const disp = (s?: string | null) => { const c = s?.trim() || 'Otros'; return c.charAt(0).toUpperCase() + c.slice(1) }

  const allItems = useMemo(() => displayLists.flatMap((l) => l.version?.items ?? []), [displayLists])
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
  const updated = (vDate ?? new Date()).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  const monthYear = new Date().toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })

  const shareLink = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center" style={{ background: C.bg }}><LoadingSpinner size="lg" /></div>
  if (error || !tenant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 font-sans" style={{ background: C.bg }}>
        <p className="text-sm font-medium" style={{ color: C.muted }}>{error || 'Lista no encontrada'}</p>
        <Link to="/" className="text-sm font-bold hover:underline" style={{ color: C.accent }}>Volver al inicio</Link>
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
      <div className="mx-auto w-full max-w-[1160px] px-6 md:px-12">
        {/* Masthead */}
        <header className="pb-8 pt-10">
          {tenant.logoUrl && (
            <img src={tenant.logoUrl} alt={tenant.name} className="mb-5 h-14 w-auto max-w-[180px] object-contain" />
          )}
          <div className="h-[3px] w-12" style={{ background: C.accent }} />
          {/* Meta strip */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="flex items-center gap-2 rounded-full border bg-white px-2.5 py-1.5" style={{ borderColor: C.line }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.accent }} />
              <span className="text-[11px] font-semibold tracking-[2px]" style={{ color: C.muted }}>EDICIÓN Nº {String(list?.version?.versionNumber ?? 1).padStart(3, '0')}</span>
            </span>
            <div className="flex-1" />
            <div className="flex flex-wrap items-center gap-4">
              {list && <span className="rounded-full border px-3 py-1 text-[11px] font-bold tracking-[2px]" style={{ borderColor: C.accent, color: C.accent }}>PÚBLICA</span>}
              <span className="text-[12px] font-medium" style={{ color: C.muted }}>Actualizada {updated}</span>
              <span className="h-3 w-px" style={{ background: C.line }} />
              <button type="button" onClick={() => window.print()} className="text-[12px] font-semibold hover:opacity-70" style={{ color: C.ink }}>Imprimir</button>
              <button type="button" onClick={shareLink} className="text-[12px] font-semibold hover:opacity-70" style={{ color: C.ink }}>{copied ? 'Copiado ✓' : 'Compartir'}</button>
            </div>
          </div>

          <div className="my-5 h-px w-full" style={{ background: C.line }} />

          {/* Title */}
          <div className="flex items-end gap-5">
            <span className="hidden h-[72px] w-1.5 sm:block" style={{ background: C.accent }} />
            <h1 className="flex flex-wrap items-end gap-x-4 text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">
              <span style={{ color: C.ink }}>Lista de</span>
              <span style={{ color: C.accent }}>precios.</span>
            </h1>
            <div className="flex-1" />
            <span className="hidden rounded border bg-white px-3 py-2 text-[12px] font-medium font-mono-jb sm:block" style={{ borderColor: C.line, color: C.ink }}>{currency} · {monthYear}</span>
          </div>

          <p className="mt-6 max-w-[720px] text-[16px] leading-relaxed" style={{ color: C.body }}>
            {tenant.description
              ? tenant.description
              : `${list?.name ? `${list.name}. ` : ''}Catálogo público de ${tenant.name}. Escaneá el QR o compartí el link para ver siempre la última versión, con precios actualizados al instante.`}
          </p>

          <div className="my-5 h-px w-full" style={{ background: C.line }} />

          {/* Context strip */}
          <div className="flex flex-wrap gap-x-12 gap-y-4 pt-1">
            <Meta label="EMITIDO POR" value={tenant.name} />
            {tenant.taxId && <Meta label="RUT" value={tenant.taxId} />}
            <Meta label="CATÁLOGO" value={list?.name ?? 'Todas las listas'} />
            <Meta label="ACTUALIZADO" value={updated} />
            <Meta label="MONEDA" value={currency} />
          </div>
        </header>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-3 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <FilterTab active={cat === 'all'} onClick={() => setCat('all')} name="Todos" count={base.length} accent={C.accent} />
            {sections.map((s) => (
              <span key={s.key} className="flex items-center gap-3">
                <span className="h-3 w-px" style={{ background: C.line }} />
                <FilterTab active={cat === s.key} onClick={() => setCat(s.key)} name={s.name} count={s.items.length} accent={C.accent} />
              </span>
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded border bg-white px-2.5 py-1.5" style={{ borderColor: C.line }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" className="w-28 border-0 bg-transparent text-[12px] outline-none placeholder:text-[#84818E] focus:ring-0" style={{ color: C.ink }} />
              <span className="text-[11px] font-mono-jb" style={{ color: C.muted }}>⌘K</span>
            </label>
            <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-semibold" style={{ background: C.ink, color: C.bg }}>Imprimir ↗</button>
          </div>
        </div>

        {/* Main list */}
        <main className="flex flex-col gap-14 pb-24 pt-4">
          {visibleSections.length === 0 ? (
            <p className="py-16 text-center text-sm font-medium" style={{ color: C.muted }}>No hay productos publicados.</p>
          ) : (
            visibleSections.map((s, si) => (
              <section key={s.key}>
                <div className="flex items-end justify-between border-b-2 pb-3" style={{ borderColor: C.accent }}>
                  <div className="flex items-end gap-4">
                    <span className="hidden h-12 w-1 self-stretch sm:block" style={{ background: C.accent }} />
                    <span className="font-mono-jb text-[28px] font-medium leading-none" style={{ color: C.accent }}>{String(si + 1).padStart(2, '0')}.</span>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[28px] font-extrabold leading-none md:text-[36px]" style={{ color: C.ink }}>{s.name}</span>
                      <span className="font-mono-jb text-[11px]" style={{ color: C.muted }}>{s.items.length} {s.items.length === 1 ? 'producto' : 'productos'}</span>
                    </div>
                  </div>
                  <div className="hidden items-end gap-6 sm:flex">
                    <div className="flex flex-col items-end gap-0.5"><span className="text-[10px] font-semibold tracking-[1.5px]" style={{ color: C.muted }}>DESDE</span><span className="font-mono-jb text-[13px] font-semibold" style={{ color: C.ink }}>{money(s.min)}</span></div>
                    <div className="flex flex-col items-end gap-0.5"><span className="text-[10px] font-semibold tracking-[1.5px]" style={{ color: C.muted }}>HASTA</span><span className="font-mono-jb text-[13px] font-semibold" style={{ color: C.ink }}>{money(s.max)}</span></div>
                  </div>
                </div>

                <div>
                  {s.items.map((it, i) => (
                    <div key={it.id} className="flex items-center gap-3 border-b py-4 md:gap-5" style={{ borderColor: C.line }}>
                      <span className="hidden w-[96px] shrink-0 font-mono-jb text-[13px] font-medium md:block" style={{ color: C.muted }}>{code(it, i)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[16px] font-medium" style={{ color: C.ink }}>{it.name}</p>
                        {it.description && <p className="mt-0.5 text-[12px]" style={{ color: C.muted }}>{it.description}</p>}
                      </div>
                      <span className="mx-2 hidden flex-1 translate-y-[-3px] border-b border-dotted md:block" style={{ borderColor: '#CBC8C0' }} />
                      <div className="flex shrink-0 flex-col items-end">
                        <span className="font-mono-jb text-[18px] font-bold md:text-[20px]" style={{ color: C.ink }}>{money(it.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </main>

        {/* Footer */}
        <footer className="flex flex-col items-center gap-2 border-t py-10 text-center" style={{ borderColor: C.line }}>
          <span className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: C.accent }}>{tenant.name}</span>
          <p className="text-xs font-medium" style={{ color: C.muted }}>Precios en {currency} · Generado con MiPrecio</p>
        </footer>
      </div>
    </div>
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
      <span className="text-[10px] font-mono-jb" style={{ color: BASE.muted }}>({count})</span>
    </button>
  )
}

export default MenuScreen
