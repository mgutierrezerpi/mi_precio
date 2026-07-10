import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant, selectCanEdit } from '../../store/slices/authSlice'
import { fetchLists, createList, updateList, deleteList, createItem, deleteItem, selectLists, selectIsLoading } from '../../store/slices/menuSlice'
import { fetchProducts, selectProducts } from '../../store/slices/productsSlice'
import type { PriceList, Product } from '../../types'
import api from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { QrCode } from './crm/QrCode'
import { tone, gradient } from './crm/theme'
import { timeAgo, formatPrice, catTone, catIcon } from './crm/productFormat'

type Tab = 'all' | 'active' | 'inactive'

const FAVICON = '/miprecio-favicon.png'
// The banner QR is illustrative: it opens the app home.
const HOME_URL = `${window.location.origin}/`

const slugOf = (l: PriceList) => l.slug || l.id
const publicPath = (sub: string | undefined, l: PriceList) => `/p/${sub || ''}/${slugOf(l)}`
const publicDisplay = (sub: string | undefined, l: PriceList) => `miprecio.app${publicPath(sub, l)}`
const publicUrl = (sub: string | undefined, l: PriceList) => `${window.location.origin}${publicPath(sub, l)}`

/* ── Screen ──────────────────────────────────────────────────────── */
export function PriceListsScreen() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const lists = useAppSelector(selectLists)
  const loading = useAppSelector(selectIsLoading)
  const products = useAppSelector(selectProducts)

  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [modal, setModal] = useState<{ open: boolean; list: PriceList | null }>(() => ({ open: searchParams.get('new') === '1' && canEdit, list: null }))
  const [qr, setQr] = useState<PriceList | null>(null)

  useEffect(() => {
    if (tenant?.id) {
      dispatch(fetchLists(tenant.id))
      dispatch(fetchProducts(tenant.id))
    }
  }, [dispatch, tenant?.id])

  const availableProducts = useMemo(() => products.filter((p) => p.available), [products])

  const counts = useMemo(() => ({
    all: lists.length,
    active: lists.filter((l) => l.published).length,
    inactive: lists.filter((l) => !l.published).length,
  }), [lists])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return lists.filter((l) => {
      if (tab === 'active' && !l.published) return false
      if (tab === 'inactive' && l.published) return false
      if (!q) return true
      return [l.name, l.slug].some((v) => v?.toLowerCase().includes(q))
    })
  }, [lists, tab, search])

  const togglePublished = (l: PriceList) => dispatch(updateList({ listId: l.id, data: { published: !l.published } }))
  const togglePrincipal = (l: PriceList) => dispatch(updateList({ listId: l.id, data: { showOnIndex: !l.showOnIndex } }))
  const handleDelete = (l: PriceList) => {
    if (window.confirm(`¿Eliminar la lista “${l.name}”? Esta acción no se puede deshacer.`)) dispatch(deleteList(l.id))
  }
  const copyLink = (l: PriceList) => navigator.clipboard?.writeText(publicUrl(tenant?.subdomain, l))

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'Todas', count: counts.all },
    { key: 'active', label: 'Activas', count: counts.active },
    { key: 'inactive', label: 'Inactivas', count: counts.inactive },
  ]

  return (
    <CrmLayout
      active="Listas de precios"
      title="Listas de precios"
      subtitle="Compartí precios distintos por cliente o canal."
      searchPlaceholder="Buscar listas…"
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="flex flex-col gap-5 p-4 md:p-8 lg:min-w-[900px]">
        {/* Banner */}
        <div className={`flex flex-col gap-6 rounded-3xl p-6 text-white shadow-[0_16px_32px_-8px_rgba(124,58,237,0.4)] md:p-7 lg:flex-row lg:items-center ${gradient}`}>
          <div className="flex flex-1 flex-col gap-3">
            <h2 className="text-2xl font-extrabold leading-tight md:text-3xl">Compartí tu catálogo en un escaneo.</h2>
            <p className="text-sm font-medium leading-relaxed text-white/80">Generá un link o un QR para cada lista y mantenelos siempre actualizados sin reimprimir.</p>
            {canEdit && (
              <button type="button" onClick={() => setModal({ open: true, list: null })} className="mt-1 flex h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#7C3AED] hover:bg-violet-50">
                <Icon name="plus" size={16} /> Nueva lista
              </button>
            )}
          </div>
          <div className="flex h-[140px] w-[140px] shrink-0 items-center justify-center self-center rounded-2xl bg-white p-2.5 lg:self-auto">
            <QrCode value={HOME_URL} size={120} fg="#0F172A" logoUrl={FAVICON} className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Header + filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">Mis listas</h3>
            <p className="text-xs font-medium text-[var(--dash-muted)]">Compartí precios distintos por cliente o canal.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold ${tab === t.key ? `text-white ${gradient}` : 'border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)]'}`}
              >
                {t.label}
                <span className={`rounded-full px-1.5 py-px text-[10px] font-bold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-[var(--dash-soft)] text-[var(--dash-text2)]'}`}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">Cargando listas…</div>
        ) : filtered.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={tone('violet')}><Icon name="list-checks" size={24} /></span>
            <p className="text-sm font-semibold text-[var(--dash-text)]">{lists.length > 0 ? 'Sin resultados' : 'Todavía no tenés listas'}</p>
            {lists.length === 0 && canEdit && (
              <button type="button" onClick={() => setModal({ open: true, list: null })} className={`flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white ${gradient}`}>
                <Icon name="plus" size={16} /> Crear la primera
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((l) => (
              <ListRow
                key={l.id}
                list={l}
                subdomain={tenant?.subdomain}
                canEdit={canEdit}
                onEdit={() => setModal({ open: true, list: l })}
                onTogglePublished={() => togglePublished(l)}
                onTogglePrincipal={() => togglePrincipal(l)}
                onDelete={() => handleDelete(l)}
                onCopy={() => copyLink(l)}
                onQr={() => setQr(l)}
                onOpen={() => window.open(publicUrl(tenant?.subdomain, l), '_blank')}
              />
            ))}
          </div>
        )}
      </div>

      {modal.open && <ListModal key={modal.list?.id ?? 'new'} list={modal.list} tenantId={tenant?.id} products={availableProducts} onClose={() => setModal({ open: false, list: null })} />}
      {qr && <QrModal list={qr} url={publicDisplay(tenant?.subdomain, qr)} qrValue={publicUrl(tenant?.subdomain, qr)} onClose={() => setQr(null)} />}
    </CrmLayout>
  )
}

/* ── Row ─────────────────────────────────────────────────────────── */
function ListRow({ list, subdomain, canEdit, onEdit, onTogglePublished, onTogglePrincipal, onDelete, onCopy, onQr, onOpen }: {
  list: PriceList; subdomain?: string; canEdit: boolean
  onEdit: () => void; onTogglePublished: () => void; onTogglePrincipal: () => void; onDelete: () => void; onCopy: () => void; onQr: () => void; onOpen: () => void
}) {
  const [copied, setCopied] = useState(false)
  const copy = () => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <div className="flex items-center gap-5 rounded-[20px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[0_18px_50px_-22px_rgba(30,27,75,0.2)]">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]" style={tone('violet')}><Icon name="list-checks" size={24} /></span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-[18px] font-extrabold text-[var(--dash-text)]">{list.name}</h4>
            {list.showOnIndex && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={tone('violet')}>Principal</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(list.published ? 'green' : 'amber')}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> {list.published ? 'Activa' : 'Borrador'}
            </span>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone('violet')}>{list.itemCount} producto{list.itemCount === 1 ? '' : 's'}</span>
            <span className="rounded-full bg-[var(--dash-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--dash-text2)]">Actualizada {timeAgo(list.updatedAt)}</span>
          </div>
        </div>
      </div>

      {list.published && (
        <div className="hidden shrink-0 flex-col gap-1.5 lg:flex">
          <span className="text-[11px] font-bold tracking-wide text-[var(--dash-muted)]">URL</span>
          <button type="button" onClick={copy} className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-[12px] font-semibold text-[var(--dash-link)]" style={tone('violet')}>
            <Icon name="link-2" size={14} />
            <span className="max-w-[220px] truncate">{publicDisplay(subdomain, list)}</span>
            <Icon name={copied ? 'circle-check' : 'copy'} size={14} />
          </button>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={onQr} title="Código QR" className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"><Icon name="qr-code" size={16} /></button>
        <button type="button" onClick={onOpen} title="Abrir lista pública" className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"><Icon name="share-2" size={16} /></button>
        {canEdit && <RowMenu list={list} onEdit={onEdit} onTogglePublished={onTogglePublished} onTogglePrincipal={onTogglePrincipal} onDelete={onDelete} />}
      </div>
    </div>
  )
}

function RowMenu({ list, onEdit, onTogglePublished, onTogglePrincipal, onDelete }: {
  list: PriceList; onEdit: () => void; onTogglePublished: () => void; onTogglePrincipal: () => void; onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const H = 230

  const toggle = () => {
    if (open) { setOpen(false); return }
    const r = btnRef.current!.getBoundingClientRect()
    const top = r.bottom + 6 + H > window.innerHeight ? r.top - H - 6 : r.bottom + 6
    setPos({ top, left: Math.max(8, r.right - 200) })
    setOpen(true)
  }
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (btnRef.current?.contains(e.target as Node) || menuRef.current?.contains(e.target as Node)) return; setOpen(false) }
    const close = () => setOpen(false)
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => { document.removeEventListener('mousedown', onDoc); window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close) }
  }, [open])

  const act = (fn: () => void) => () => { setOpen(false); fn() }

  return (
    <>
      <button ref={btnRef} type="button" onClick={toggle} className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"><Icon name="ellipsis" size={16} /></button>
      {open && createPortal(
        <div ref={menuRef} style={{ top: pos.top, left: pos.left, width: 200 }} className="dash fixed z-[120] rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1.5 font-sans shadow-[0_16px_44px_-12px_rgba(15,23,42,0.35)] animate-scale-in">
          <MenuItemBtn icon="settings" label="Editar lista" onClick={act(onEdit)} />
          <MenuItemBtn icon={list.published ? 'eye' : 'share-2'} label={list.published ? 'Despublicar' : 'Publicar'} onClick={act(onTogglePublished)} />
          <MenuItemBtn icon="list-checks" label={list.showOnIndex ? 'Quitar de principal' : 'Marcar principal'} onClick={act(onTogglePrincipal)} />
          <div className="my-1 h-px bg-[var(--dash-divider)]" />
          <MenuItemBtn icon="circle-x" label="Eliminar" onClick={act(onDelete)} danger />
        </div>,
        document.body
      )}
    </>
  )
}

function MenuItemBtn({ icon, label, onClick, danger }: { icon: IconName; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold hover:bg-[var(--dash-soft)] ${danger ? 'text-[#EF4444]' : 'text-[var(--dash-text2)]'}`}>
      <Icon name={icon} size={15} /> {label}
    </button>
  )
}

/* ── QR modal ────────────────────────────────────────────────────── */
function QrModal({ list, url, qrValue, onClose }: { list: PriceList; url: string; qrValue: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="dash flex w-full max-w-[360px] animate-scale-in flex-col items-center gap-4 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-7 text-center font-sans shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)]">
        <h3 className="text-lg font-extrabold text-[var(--dash-text)]">{list.name}</h3>
        <div className="h-52 w-52 rounded-2xl bg-white p-3 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.3)]"><QrCode value={qrValue} size={180} fg="#0F172A" logoUrl={FAVICON} className="h-full w-full object-contain" /></div>
        <p className="text-xs font-semibold text-[var(--dash-link)]">{url}</p>
        <button type="button" onClick={onClose} className={`flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold text-white ${gradient}`}>Listo</button>
      </div>
    </div>
  )
}

/* ── Create wizard / edit modal ──────────────────────────────────── */
function ListModal({ list, tenantId, products, onClose }: { list: PriceList | null; tenantId?: string; products: Product[]; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const editing = !!list
  const [step, setStep] = useState(1)
  const [name, setName] = useState(list?.name ?? '')
  const [slug, setSlug] = useState(list?.slug ?? '')
  const [kind, setKind] = useState<'product' | 'service'>(list?.kind ?? 'product')
  const [published, setPublished] = useState(list?.published ?? false)
  const [principal, setPrincipal] = useState(list?.showOnIndex ?? false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [prodSearch, setProdSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const versionId = useRef<string | undefined>(undefined)
  const [loadedItems, setLoadedItems] = useState<{ id: string; name: string; productId: string | null }[]>([])

  // The product an item came from: by stable product id, else (legacy items with no
  // product_id) by name. Renaming a product no longer detaches it from the list.
  const productForItem = (it: { name: string; productId: string | null }): Product | undefined =>
    it.productId
      ? products.find((p) => p.id === it.productId)
      : products.find((p) => p.name.trim().toLowerCase() === it.name.trim().toLowerCase())

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  // When editing, load the current version + its items once.
  useEffect(() => {
    if (!list) return
    let cancelled = false
    ;(async () => {
      const lres = await api.getList(list.id)
      const vid = lres.data?.versions?.[0]?.id
      if (!vid) return
      const ires = await api.getItems(vid)
      if (cancelled) return
      versionId.current = vid
      setLoadedItems((ires.data ?? []).map((i) => ({ id: i.id, name: i.name, productId: i.productId })))
    })()
    return () => { cancelled = true }
  }, [list?.id])

  // Pre-select the products already in the list (matched by id, name for legacy items).
  // Depends on `products` too, so the checkboxes recompute once the catalog finishes
  // loading — it may arrive after the modal opens, which used to leave everything unchecked.
  useEffect(() => {
    const inList = new Set(loadedItems.map((i) => productForItem(i)?.id).filter(Boolean))
    setSelected(new Set(products.filter((p) => inList.has(p.id)).map((p) => p.id)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedItems, products])

  const filteredProducts = useMemo(() => {
    const q = prodSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => [p.name, p.sku, p.category].some((v) => v?.toLowerCase().includes(q)))
  }, [products, prodSearch])

  const toggleSel = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const allShown = filteredProducts.length > 0 && filteredProducts.every((p) => selected.has(p.id))
  const toggleAll = () => setSelected((s) => {
    const n = new Set(s)
    if (filteredProducts.every((p) => n.has(p.id))) filteredProducts.forEach((p) => n.delete(p.id))
    else filteredProducts.forEach((p) => n.add(p.id))
    return n
  })

  const goNext = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) setStep(2) }

  // Add the selected products as items / remove the ones deselected. Membership is
  // keyed off the product id (stable across renames); items store product_id and copy
  // the product's image so the public list shows the real photo, not a category icon.
  const syncItems = async (vid: string) => {
    const chosenIds = new Set(products.filter((p) => selected.has(p.id)).map((p) => p.id))
    const representedIds = new Set(loadedItems.map((i) => productForItem(i)?.id).filter(Boolean))
    // Create an item for every newly-selected product not already in the list.
    for (const p of products.filter((p) => selected.has(p.id) && !representedIds.has(p.id))) {
      await dispatch(createItem({ versionId: vid, data: { name: p.name, price: parseFloat(p.price) || 0, description: p.description || undefined, category: p.category || undefined, imageUrl: p.imageUrl || undefined, imageThumbUrl: p.imageThumbUrl || undefined, productId: p.id } }))
    }
    // Remove items whose product was deselected. Orphan/manual items (no matching
    // product) are left untouched.
    for (const it of loadedItems.filter((i) => { const p = productForItem(i); return p && !chosenIds.has(p.id) })) {
      await dispatch(deleteItem(it.id))
    }
  }

  const finalize = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await dispatch(updateList({ listId: list!.id, data: { name: name.trim(), slug: slug.trim() || undefined, published, showOnIndex: principal, kind } }))
        if (versionId.current) await syncItems(versionId.current)
      } else if (tenantId) {
        const res = await dispatch(createList({ tenantId, name: name.trim(), kind }))
        if (createList.fulfilled.match(res) && res.payload) {
          const vid = res.payload.versions?.[0]?.id
          await dispatch(updateList({ listId: res.payload.id, data: { slug: slug.trim() || undefined, published, showOnIndex: principal } }))
          if (vid) await syncItems(vid)
        }
      }
      if (tenantId) dispatch(fetchLists(tenantId))
      onClose()
    } finally { setSaving(false) }
  }

  const panelWidth = step === 2 ? 'max-w-[560px]' : 'max-w-[440px]'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`dash w-full ${panelWidth} animate-scale-in rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 font-sans shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)]`}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-extrabold text-[var(--dash-text)]">{step === 1 ? (editing ? 'Editar lista' : 'Nueva lista') : 'Elegí los productos'}</h3>
            <span className="text-xs font-medium text-[var(--dash-muted)]">Paso {step} de 2</span>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80">✕</button>
        </div>

        {step === 1 ? (
          <form onSubmit={goNext}>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[var(--dash-text2)]">Nombre</span>
                <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Lista principal" className={inputCls} required />
              </label>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[var(--dash-text2)]">Tipo de lista</span>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { k: 'product' as const, icon: 'package' as const, title: 'Productos', desc: 'Con carrito y pedidos' },
                    { k: 'service' as const, icon: 'sliders-horizontal' as const, title: 'Servicios', desc: 'Solo lista de precios' },
                  ]).map((o) => {
                    const on = kind === o.k
                    return (
                      <button key={o.k} type="button" onClick={() => setKind(o.k)} className={`flex flex-col gap-1 rounded-xl border p-3 text-left ${on ? 'border-[var(--dash-link)] bg-[var(--dash-soft)]' : 'border-[var(--dash-border)] hover:bg-[var(--dash-soft)]'}`}>
                        <span className="flex items-center gap-2 text-[13px] font-bold text-[var(--dash-text)]">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={tone(on ? 'violet' : 'slate')}><Icon name={o.icon} size={15} /></span>
                          {o.title}
                        </span>
                        <span className="text-[11px] font-medium text-[var(--dash-muted)]">{o.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[var(--dash-text2)]">Slug del link (opcional)</span>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mayoristas" className={inputCls} />
              </label>
              <ToggleRow label="Publicar lista" desc="Visible con link y QR para tus clientes." value={published} onToggle={() => setPublished((v) => !v)} />
              <ToggleRow label="Marcar como principal" desc="Se muestra primero en tu página pública." value={principal} onToggle={() => setPrincipal((v) => !v)} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="flex h-11 items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">Cancelar</button>
              <button type="submit" className={`flex h-11 items-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white ${gradient}`}>
                Siguiente <Icon name="chevron-right" size={16} />
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <label className="flex h-10 flex-1 items-center gap-2.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3">
                <Icon name="search" size={16} className="text-[var(--dash-muted)]" />
                <input value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} placeholder="Buscar productos disponibles…" className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)]" />
              </label>
              {filteredProducts.length > 0 && (
                <button type="button" onClick={toggleAll} className="h-10 shrink-0 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">
                  {allShown ? 'Quitar todos' : 'Seleccionar todos'}
                </button>
              )}
            </div>

            <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="flex h-32 items-center justify-center px-4 text-center text-sm font-medium text-[var(--dash-muted)]">
                  {products.length === 0 ? 'No hay productos disponibles. Cargá productos primero (solo se listan los marcados como disponibles).' : 'Sin resultados para tu búsqueda.'}
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const on = selected.has(p.id)
                  return (
                    <button key={p.id} type="button" onClick={() => toggleSel(p.id)} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${on ? 'border-[#7C3AED] bg-[var(--dash-soft)]' : 'border-[var(--dash-border)] bg-[var(--dash-surface)] hover:bg-[var(--dash-soft)]'}`}>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${on ? `border-transparent text-white ${gradient}` : 'border-[#CBD5E1]'}`}>{on && <Icon name="circle-check" size={13} />}</span>
                      {p.imageUrl
                        ? <img src={p.imageThumbUrl || p.imageUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                        : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={tone(catTone(p.category))}><Icon name={catIcon(p.category)} size={18} /></span>}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{p.name}</span>
                        <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">{p.category || 'Sin categoría'}</span>
                      </div>
                      <span className="shrink-0 text-[13px] font-extrabold text-[var(--dash-text)]">{formatPrice(p.price)}</span>
                    </button>
                  )
                })
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[var(--dash-muted)]">{selected.size} seleccionado{selected.size === 1 ? '' : 's'}</span>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex h-11 items-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">
                  <Icon name="chevron-left" size={16} /> Atrás
                </button>
                <button type="button" onClick={finalize} disabled={saving} className={`flex h-11 items-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}>
                  {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear lista'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ToggleRow({ label, desc, value, onToggle }: { label: string; desc: string; value: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 py-3">
      <div className="flex flex-col">
        <span className="text-[13px] font-bold text-[var(--dash-text)]">{label}</span>
        <span className="text-[11px] font-medium text-[var(--dash-muted)]">{desc}</span>
      </div>
      <button type="button" role="switch" aria-checked={value} onClick={onToggle} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-[#10B981]' : 'bg-[var(--dash-border)]'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

const inputCls = 'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)]'

export default PriceListsScreen
