import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant, selectCanEdit } from '../../store/slices/authSlice'
import { fetchLists, createList, updateList, deleteList, createItem, deleteItem, selectLists, selectIsLoading } from '../../store/slices/menuSlice'
import { fetchProducts, selectProducts } from '../../store/slices/productsSlice'
import type { PriceList, Product } from '../../types'
import api from '../../services/api'
import { useT } from '../../lib/i18n'
import { ListAppearanceFields, hasOwnAppearance, type ListAppearance } from '../../components/appearance/ListAppearanceFields'
import { CrmLayout } from './crm/CrmLayout'
import { ProductModal } from './ProductsScreen'
import { Icon, type IconName } from './crm/ui'
import { QrCode } from './crm/QrCode'
import { tone, gradient } from './crm/theme'
import { timeAgo, formatPrice, catTone, catIcon } from './crm/productFormat'
import { QR_COLOR_STORAGE_PREFIX, DEFAULT_QR_COLOR, downloadQrPng, downloadQrSvg } from '../../lib/qrRender'

type Tab = 'all' | 'active' | 'inactive'

const FAVICON = '/miprecio-favicon.png'
const slugOf = (l: PriceList) => l.slug || l.id
const publicPath = (sub: string | undefined, l: PriceList) => `/p/${sub || ''}/${slugOf(l)}`
const publicDisplay = (sub: string | undefined, l: PriceList) => `${window.location.origin}${publicPath(sub, l)}`
const publicUrl = (sub: string | undefined, l: PriceList) => `${window.location.origin}${publicPath(sub, l)}`
const qrUrl = (sub: string | undefined, l: PriceList) => `${publicUrl(sub, l)}?src=qr`
const qrFileName = (l: PriceList) => (l.slug || l.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || l.id

/* ── Screen ──────────────────────────────────────────────────────── */
export function PriceListsScreen() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const lists = useAppSelector(selectLists)
  const loading = useAppSelector(selectIsLoading)
  const products = useAppSelector(selectProducts)

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [modal, setModal] = useState<{ open: boolean; list: PriceList | null }>(() => ({ open: searchParams.get('new') === '1' && canEdit, list: null }))
  const [qr, setQr] = useState<PriceList | null>(null)
  const [qrColor, setQrColor] = useState(DEFAULT_QR_COLOR)
  const editId = searchParams.get('edit')
  const newList = searchParams.get('new') === '1'

  useEffect(() => {
    if (tenant?.id) {
      dispatch(fetchLists(tenant.id))
      dispatch(fetchProducts(tenant.id))
      const savedColor = localStorage.getItem(`${QR_COLOR_STORAGE_PREFIX}${tenant.id}`)
      if (savedColor) setQrColor(savedColor)
    }
  }, [dispatch, tenant?.id])

  useEffect(() => {
    if (!canEdit) return
    if (editId) {
      const list = lists.find((item) => item.id === editId)
      if (list) setModal({ open: true, list })
    } else if (newList) {
      setModal({ open: true, list: null })
    }
  }, [canEdit, editId, lists, newList])

  const closeModal = () => {
    setModal({ open: false, list: null })
    setSearchParams((current) => {
      current.delete('new')
      current.delete('edit')
      current.delete('step')
      return current
    })
  }

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
      hideContext
      searchPlaceholder="Buscar listas…"
      searchValue={search}
      onSearchChange={setSearch}
    >
      <main className="flex min-h-full flex-col gap-4 px-4 py-6 md:px-10 md:py-8 xl:min-w-[900px]">
        <section className="flex min-h-[60px] flex-col justify-center gap-1">
          <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">Listas</h1>
          <p className="text-[13px] text-[#9694A6]">Compartí precios distintos por cliente o canal.</p>
        </section>

        {/* Header + filters */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-bold ${tab === t.key ? `text-white ${gradient}` : 'border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'}`}
              >
                {t.label}
                <span className={`rounded-full px-1.5 py-px text-[10px] font-bold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-[var(--dash-soft)] text-[var(--dash-text2)]'}`}>{t.count}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            {canEdit && (
              <button type="button" onClick={() => { setModal({ open: true, list: null }); setSearchParams({ new: '1' }) }} className={`flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-bold text-white ${gradient}`}>
                <Icon name="plus" size={15} /> Nueva lista
              </button>
            )}
          </div>
        </section>

        {/* Rows */}
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">Cargando listas…</div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[208px] flex-col items-center justify-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 text-center">
            <span className={`flex h-10 w-10 items-center justify-center rounded-[10px] text-white ${gradient}`}><Icon name="list-plus" size={19} /></span>
            <div className="flex flex-col gap-1">
              <p className="text-lg font-bold text-[var(--dash-text)]">{lists.length > 0 ? 'Sin resultados' : 'Todavía no tenés listas'}</p>
              {lists.length === 0 && <p className="text-[13px] text-[var(--dash-muted)]">Creá una lista principal para compartir tu catálogo.</p>}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
            <div className="flex min-w-[680px] items-center gap-3 bg-[var(--dash-table-head)] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              <span className="flex-1">Lista</span>
              <span className="w-[100px]">Productos</span>
              <span className="w-[110px]">Estado</span>
              <span className="w-[110px]">Actualizada</span>
              <span className="w-[144px]" />
            </div>
            {filtered.map((l, i) => (
              <ListRow
                key={l.id}
                list={l}
                canEdit={canEdit}
                first={i === 0}
                onEdit={() => { setModal({ open: true, list: l }); setSearchParams({ edit: l.id }) }}
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
      </main>

      {modal.open && <ListModal key={modal.list?.id ?? 'new'} list={modal.list} initialStep={searchParams.get('step') === '2' ? 2 : 1} tenantId={tenant?.id} products={availableProducts} lists={lists} onClose={closeModal} />}
      {qr && <QrModal list={qr} url={publicDisplay(tenant?.subdomain, qr)} linkUrl={publicUrl(tenant?.subdomain, qr)} qrValue={qrUrl(tenant?.subdomain, qr)} fg={qrColor} logoUrl={tenant?.logoUrl || FAVICON} onClose={() => setQr(null)} />}
    </CrmLayout>
  )
}

/* ── Row ─────────────────────────────────────────────────────────── */
function ListRow({ list, canEdit, first, onEdit, onTogglePublished, onTogglePrincipal, onDelete, onCopy, onQr, onOpen }: {
  list: PriceList; canEdit: boolean
  first?: boolean
  onEdit: () => void; onTogglePublished: () => void; onTogglePrincipal: () => void; onDelete: () => void; onCopy: () => void; onQr: () => void; onOpen: () => void
}) {
  const [copied, setCopied] = useState(false)
  const copy = () => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <div className={`flex min-w-[680px] items-center gap-3 bg-[var(--dash-surface)] px-5 py-4 ${!first ? 'border-t border-[var(--dash-divider)]' : ''}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]" style={tone('violet')}><Icon name="list-checks" size={19} /></span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h4 className="min-w-0 whitespace-normal break-words text-base font-bold leading-snug text-[var(--dash-text)]">{list.name}</h4>
            {list.showOnIndex && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={tone('violet')}>Principal</span>}
          </div>
        </div>
      </div>

      <span className="w-[100px] text-sm font-semibold text-[var(--dash-text2)]">{list.itemCount}</span>
      <span className="w-[110px]">
        <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold" style={tone(list.published ? 'green' : 'amber')}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" /> {list.published ? 'Activa' : 'Borrador'}
        </span>
      </span>
      <span className="w-[110px] text-xs font-medium text-[var(--dash-muted)]">{timeAgo(list.updatedAt)}</span>

      <div className="flex w-[144px] shrink-0 items-center justify-end gap-1.5">
        {list.published && <button type="button" onClick={copy} title={copied ? 'Enlace copiado' : 'Copiar enlace público'} aria-label={copied ? 'Enlace copiado' : 'Copiar enlace público'} className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--dash-link)] hover:bg-[var(--dash-soft)]"><Icon name={copied ? 'circle-check' : 'link-2'} size={15} /></button>}
        <button type="button" onClick={onQr} title="Código QR" className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"><Icon name="qr-code" size={15} /></button>
        <button type="button" onClick={onOpen} title="Abrir lista pública" aria-label="Abrir lista pública" className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"><Icon name="external-link" size={15} /></button>
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
function QrModal({ list, url, linkUrl, qrValue, fg, logoUrl, onClose }: { list: PriceList; url: string; linkUrl: string; qrValue: string; fg: string; logoUrl: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="dash relative flex w-full max-w-[360px] animate-scale-in flex-col items-center gap-4 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-7 text-center font-sans shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)]">
        <button type="button" onClick={onClose} aria-label="Cerrar" title="Cerrar" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-lg leading-none text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] hover:text-[var(--dash-text)]">×</button>
        <h3 className="text-lg font-extrabold text-[var(--dash-text)]">{list.name}</h3>
        <div className="h-52 w-52 rounded-2xl bg-white p-3 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.3)]"><QrCode value={qrValue} size={180} margin={2} fg={fg} logoUrl={logoUrl} className="h-full w-full object-contain" /></div>
        <a href={linkUrl} className="text-xs font-semibold text-[var(--dash-link)] underline-offset-2 hover:underline">{url}</a>
        <div className="flex w-full gap-2">
          <button type="button" onClick={() => void downloadQrPng(qrValue, `qr-${qrFileName(list)}.png`, { fg, logoUrl })} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}>
            <Icon name="download" size={14} /> PNG
          </button>
          <button type="button" onClick={() => downloadQrSvg(qrValue, `qr-${qrFileName(list)}.svg`, { fg })} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">
            <Icon name="download" size={14} /> SVG
          </button>
        </div>

      </div>
    </div>
  )
}

/* ── Create wizard / edit modal ──────────────────────────────────── */
function ListModal({ list, initialStep, tenantId, products, lists, onClose }: { list: PriceList | null; initialStep: 1 | 2; tenantId?: string; products: Product[]; lists: PriceList[]; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const [, setWizardParams] = useSearchParams()
  const t = useT()
  const tenant = useAppSelector(selectTenant)
  const editing = !!list
  const [step, setStep] = useState<1 | 2>(initialStep)
  const [name, setName] = useState(list?.name ?? '')
  const [slug, setSlug] = useState(list?.slug ?? '')
  const [kind, setKind] = useState<'product' | 'service'>(list?.kind ?? 'product')
  const [published, setPublished] = useState(list?.published ?? false)
  const [principal, setPrincipal] = useState(list?.showOnIndex ?? false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [prodSearch, setProdSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  // Per-list appearance overrides. Null fields inherit the tenant's defaults,
  // so a list only carries what the user deliberately changed here.
  const [appearance, setAppearance] = useState<ListAppearance>({
    design: list?.design ?? null,
    heroColor: list?.heroColor ?? null,
    bgUrl: list?.bgUrl ?? null,
    bgOverlay: list?.bgOverlay ?? null,
  })
  const [showAppearance, setShowAppearance] = useState(false)
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

  const changeStep = (next: 1 | 2) => {
    setStep(next)
    setWizardParams((current) => {
      if (next === 2) current.set('step', '2')
      else current.delete('step')
      return current
    })
  }

  const goNext = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) changeStep(2) }

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
        await dispatch(updateList({ listId: list!.id, data: { name: name.trim(), slug: slug.trim() || undefined, published, showOnIndex: principal, kind, ...appearance } }))
        if (versionId.current) await syncItems(versionId.current)
      } else if (tenantId) {
        const res = await dispatch(createList({ tenantId, name: name.trim(), kind }))
        if (createList.fulfilled.match(res) && res.payload) {
          const vid = res.payload.versions?.[0]?.id
          await dispatch(updateList({ listId: res.payload.id, data: { slug: slug.trim() || undefined, published, showOnIndex: principal, ...appearance } }))
          if (vid) await syncItems(vid)
        }
      }
      if (tenantId) dispatch(fetchLists(tenantId))
      onClose()
    } finally { setSaving(false) }
  }

  const panelWidth = step === 2 ? 'max-w-[560px]' : showAppearance ? 'max-w-[720px]' : 'max-w-[440px]'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      {/* max-h + scroll: with the appearance block open the panel is taller
          than the viewport, and the footer buttons must stay reachable. */}
      <div className={`dash max-h-[90vh] w-full ${panelWidth} animate-scale-in overflow-y-auto rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 font-sans shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)]`}>
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

              {/* Appearance overrides, collapsed by default so creating a list
                  stays a two-field job. */}
              <button
                type="button"
                onClick={() => setShowAppearance((v) => !v)}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] p-3.5 text-left hover:bg-[var(--dash-soft)]"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-[var(--dash-text)]">{t('list.appearance.title')}</span>
                  <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                    {hasOwnAppearance(appearance) ? t('list.appearance.custom') : t('list.appearance.inherit')}
                  </span>
                </span>
                <Icon name="chevron-down" size={16} className={`shrink-0 text-[var(--dash-muted)] transition-transform ${showAppearance ? 'rotate-180' : ''}`} />
              </button>

              {showAppearance && (
                <div className="flex flex-col gap-4">
                  <p className="text-[11px] font-medium text-[var(--dash-muted)]">{t('list.appearance.subtitle')}</p>
                  <ListAppearanceFields
                    t={t}
                    value={appearance}
                    onChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))}
                    accent={tenant?.brandColor ?? '#7C3AED'}
                    inherited={{
                      design: tenant?.listDesign ?? 'store',
                      heroColor: tenant?.listHeroColor ?? null,
                      bgUrl: tenant?.listBgUrl ?? null,
                      bgOverlay: tenant?.listBgOverlay ?? false,
                    }}
                  />
                </div>
              )}
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
              <label className="flex h-10 flex-1 items-center gap-2.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/15">
                <Icon name="search" size={16} className="text-[var(--dash-muted)]" />
                <input value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} placeholder="Buscar productos disponibles…" className="min-w-0 flex-1 border-0 bg-transparent text-[13px] font-medium text-[var(--dash-text)] outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 placeholder:text-[var(--dash-muted)]" />
              </label>
              <button type="button" onClick={() => setShowProductModal(true)} className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-link)] hover:bg-[var(--dash-soft)]">
                <Icon name="plus" size={14} /> Nuevo producto
              </button>
              {filteredProducts.length > 0 && (
                <button type="button" onClick={toggleAll} className="h-10 shrink-0 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">
                  {allShown ? 'Quitar todos' : 'Seleccionar todos'}
                </button>
              )}
            </div>

            <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="flex h-32 items-center justify-center px-4 text-center text-sm font-medium text-[var(--dash-muted)]">
                  {products.length === 0 ? 'No hay productos disponibles. Creá uno nuevo para agregarlo a esta lista.' : 'Sin resultados para tu búsqueda.'}
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
                <button type="button" onClick={() => changeStep(1)} className="flex h-11 items-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">
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
      {showProductModal && <ProductModal product={null} tenantId={tenantId} lists={lists} onCreated={(product) => setSelected((current) => new Set(current).add(product.id))} onClose={() => setShowProductModal(false)} />}
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
