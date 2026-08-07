import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant, selectCanEdit } from '../../store/slices/authSlice'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  selectProducts,
  selectProductsLoading,
  selectProductsSaving,
  type ProductInput,
} from '../../store/slices/productsSlice'
import { fetchLists, selectLists } from '../../store/slices/menuSlice'
import type { PriceList, Product } from '../../types'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { tone, gradient } from './crm/theme'
import {
  catTone,
  catIcon,

  displayCategory,
  normalizeCategory,
} from './crm/productFormat'
import api from '../../services/api'
import { localeOf } from '../../lib/i18n'
import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import { trackEvent } from '../../lib/analytics'

const PAGE_SIZE = 8
type Status = 'all' | 'available' | 'unavailable' | 'nophoto' | 'recent'
type SortKey = 'recent' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

const SORT_OPTIONS: { key: SortKey; labelKey: string }[] = [
  { key: 'recent', labelKey: 'products.sortRecent' },
  { key: 'name-asc', labelKey: 'products.sortNameAsc' },
  { key: 'name-desc', labelKey: 'products.sortNameDesc' },
  { key: 'price-asc', labelKey: 'products.sortPriceAsc' },
  { key: 'price-desc', labelKey: 'products.sortPriceDesc' },
]

const outlineBtn =
  'flex h-[38px] items-center gap-2 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'

/** Read an image file, downscale it, and return a compressed WebP blob. */
async function fileToImageBlob(file: File, max = 1600): Promise<Blob> {
  const src = await new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = src
  })
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, w, h)
  return await new Promise<Blob>((res, rej) => {
    canvas.toBlob(
      (blob) =>
        blob ? res(blob) : rej(new Error('No se pudo procesar la imagen.')),
      'image/webp',
      0.82
    )
  })
}

/* ── Screen ──────────────────────────────────────────────────────── */
export function ProductsScreen() {
  const t = useCatalogT()
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const products = useAppSelector(selectProducts)
  const lists = useAppSelector(selectLists)
  const loading = useAppSelector(selectProductsLoading)
  const locale = localeOf(tenant?.language)
  const formatProductPrice = (price: string) => {
    const value = parseFloat(price)
    return Number.isNaN(value)
      ? price
      : new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: tenant?.currency || 'UYU',
          maximumFractionDigits: 0,
        }).format(value)
  }

  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState<Status>('all')
  const [category, setCategory] = useState<string>(
    searchParams.get('cat') || 'all'
  )
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<{
    open: boolean
    product: Product | null
  }>(() => ({
    open: searchParams.get('new') === '1' && canEdit,
    product: null,
  }))
  const [sort, setSort] = useState<SortKey>('recent')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (tenant?.id) dispatch(fetchProducts(tenant.id))
  }, [dispatch, tenant?.id])

  useEffect(() => {
    if (tenant?.id) dispatch(fetchLists(tenant.id))
  }, [dispatch, tenant?.id])

  // Distinct categories, deduped case-insensitively (keeps first-seen spelling).
  const categories = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of products) {
      const c = p.category?.trim()
      if (c && !map.has(c.toLowerCase())) map.set(c.toLowerCase(), c)
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b))
  }, [products])

  // Base = search + category + price filters.
  const base = useMemo(() => {
    const q = search.trim().toLowerCase()
    const cat = category.trim().toLowerCase()
    const min = parseFloat(priceMin)
    const max = parseFloat(priceMax)
    return products.filter((p) => {
      if (
        category !== 'all' &&
        (p.category?.trim().toLowerCase() ?? '') !== cat
      )
        return false
      const price = parseFloat(p.price)
      if (!Number.isNaN(min) && (Number.isNaN(price) || price < min))
        return false
      if (!Number.isNaN(max) && (Number.isNaN(price) || price > max))
        return false
      if (!q) return true
      return [p.name, p.sku, p.category].some((v) =>
        v?.toLowerCase().includes(q)
      )
    })
  }, [products, search, category, priceMin, priceMax])

  const visible = useMemo(() => {
    const arr =
      status === 'recent'
        ? [...base]
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
            .slice(0, 12)
        : base.filter((p) => {
            if (status === 'all') return true
            if (status === 'nophoto') return !p.imageUrl
            if (status === 'available') return p.available
            if (status === 'unavailable') return !p.available
            return true
          })
    const price = (p: Product) => parseFloat(p.price) || 0
    const cmp: Record<SortKey, (a: Product, b: Product) => number> = {
      recent: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      'name-asc': (a, b) => a.name.localeCompare(b.name),
      'name-desc': (a, b) => b.name.localeCompare(a.name),
      'price-asc': (a, b) => price(a) - price(b),
      'price-desc': (a, b) => price(b) - price(a),
    }
    return [...arr].sort(cmp[sort])
  }, [base, status, sort])

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = visible.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  const resetTo = (fn: () => void) => {
    fn()
    setPage(1)
  }

  const handleDelete = (p: Product) => {
    if (
      window.confirm(t('products.deleteConfirm', { name: p.name }))
    ) {
      dispatch(deleteProduct(p.id))
    }
  }

  // ── Multi-select ──────────────────────────────────────────────────
  const visibleIds = useMemo(() => visible.map((p) => p.id), [visible])
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someSelected = selected.size > 0
  const selectedProducts = useMemo(
    () => products.filter((p) => selected.has(p.id)),
    [products, selected]
  )

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleSelectAll = () =>
    setSelected((prev) => {
      if (visibleIds.every((id) => prev.has(id))) {
        const next = new Set(prev)
        visibleIds.forEach((id) => next.delete(id))
        return next
      }
      return new Set([...prev, ...visibleIds])
    })
  const clearSelection = () => setSelected(new Set())

  const bulkDelete = () => {
    if (!someSelected) return
    if (
      !window.confirm(
        t('products.bulkDeleteConfirm', {
                  count: selected.size,
                  plural: selected.size === 1 ? '' : 's',
                })
      )
    )
      return
    selectedProducts.forEach((p) => dispatch(deleteProduct(p.id)))
    clearSelection()
  }

  const clearFilters = () =>
    resetTo(() => {
      setStatus('all')
      setCategory('all')
      setPriceMin('')
      setPriceMax('')
      setSearch('')
    })

  // ── Export (scope: selection if any, else the filtered list) ──────
  const exportScope = () => (someSelected ? selectedProducts : visible)
  const exportExcel = () =>
    downloadExcel(exportScope(), tenant?.currency || 'UYU', t)
  const exportPdf = () =>
    printPdf(
      exportScope(),
      tenant?.name || t('products.catalog'),
      tenant?.currency || 'UYU',
      t,
      locale
    )

  return (
    <CrmLayout
      active={t('products.title')}
      title={t('products.title')}
      subtitle={t('products.subtitle')}
      hideContext
      searchPlaceholder={t('products.search')}
      searchValue={search}
      onSearchChange={(v) => resetTo(() => setSearch(v))}
    >
      <main className="flex min-h-full flex-col gap-4 px-4 py-6 md:px-10 md:py-8 xl:min-w-[980px]">
        <section className="flex min-h-[60px] flex-col justify-center gap-1">
          <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">
            {t('products.title')}
          </h1>
          <p className="text-[13px] text-[#9694A6]">
            {t('products.subtitle')}
          </p>
        </section>

        <div className="flex flex-col gap-4">
          {/* Header */}
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <FilterMenu
                status={status}
                onStatus={(s) => resetTo(() => setStatus(s))}
                priceMin={priceMin}
                priceMax={priceMax}
                onPriceMin={(v) => resetTo(() => setPriceMin(v))}
                onPriceMax={(v) => resetTo(() => setPriceMax(v))}
                onClear={clearFilters}
              />
              <CategoryDropdown
                value={category}
                options={categories}
                onChange={(v) => resetTo(() => setCategory(v))}
              />
              <SortMenu sort={sort} onSort={setSort} />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <ExportMenu
                count={someSelected ? selected.size : visible.length}
                scoped={someSelected}
                onExcel={exportExcel}
                onPdf={exportPdf}
              />
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setModal({ open: true, product: null })}
                  className={`flex h-[38px] w-full items-center justify-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white lg:w-auto lg:justify-start ${gradient}`}
                >
                  <Icon name="plus" size={16} /> {t('products.new')}
                </button>
              )}
            </div>
          </section>

          {/* Bulk action bar */}
          {someSelected && (
            <div className="flex items-center gap-3 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3">
              <Icon
                name="circle-check"
                size={18}
                className="text-[var(--dash-link)]"
              />
              <span className="text-[13px] font-bold text-[var(--dash-text2)]">
                {t('products.selected', {
                  count: selected.size,
                  plural: selected.size === 1 ? '' : 's',
                })}
              </span>
              <div className="flex-1" />
              {canEdit && (
                <button
                  type="button"
                  onClick={bulkDelete}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-bold text-[#F87171] hover:bg-white/10"
                >
                  <Icon name="circle-x" size={15} /> {t('products.delete')}
                </button>
              )}
              <button
                type="button"
                onClick={clearSelection}
                className="flex h-8 items-center rounded-lg px-3 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-white/10"
              >
                {t('products.clear')}
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
            <div className="flex items-center gap-3 bg-[var(--dash-table-head)] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--dash-muted)] lg:hidden">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={toggleSelectAll}
              />
              <span>{t('products.product')}</span>
            </div>
            <div className="hidden min-w-[720px] items-center gap-3 bg-[var(--dash-table-head)] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--dash-muted)] lg:flex">
              <span className="w-9">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={toggleSelectAll}
                />
              </span>
              <span className="flex-1">{t('products.product')}</span>
              <span className="w-[110px]">SKU</span>
              <span className="w-[130px]">{t('products.category')}</span>
              <span className="w-[110px]">{t('products.price')}</span>
              <span className="w-[160px]">{t('products.availability')}</span>
              <span className="w-[120px]">{t('products.updated')}</span>
              <span className="w-8" />
            </div>

            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">
                {t('products.loading')}
              </div>
            ) : pageItems.length === 0 ? (
              <EmptyState hasProducts={products.length > 0} />
            ) : (
              pageItems.map((p, i) => {
                return (
                  <div
                    key={p.id}
                    className={`flex min-w-0 flex-col gap-3 px-4 py-4 lg:min-w-[720px] lg:flex-row lg:items-center lg:gap-3 lg:px-5 ${selected.has(p.id) ? 'bg-[var(--dash-soft)]' : 'bg-[var(--dash-surface)]'} ${i > 0 ? 'border-t border-[var(--dash-divider)]' : ''}`}
                  >
                    <div className="flex min-w-0 items-start gap-3 lg:contents">
                      <span className="w-9 shrink-0">
                        <Checkbox
                          checked={selected.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                        />
                      </span>
                      <div className="flex min-w-0 flex-1 items-start gap-3 lg:items-center">
                      {p.imageUrl ? (
                        <img
                          src={p.imageThumbUrl || p.imageUrl}
                          alt={p.name}
                          className="h-10 w-10 shrink-0 rounded-[10px] object-cover"
                        />
                      ) : (
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                          style={tone(catTone(p.category))}
                        >
                          <Icon name={catIcon(p.category)} size={20} />
                        </span>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="break-words text-sm font-bold text-[var(--dash-text)] lg:truncate">
                          {p.name}
                        </span>
                        <span className="line-clamp-2 text-xs font-medium text-[var(--dash-muted)] lg:truncate">
                          {p.description || '—'}
                        </span>
                      </div>
                      {canEdit && (
                        <div className="shrink-0 lg:hidden">
                          <RowMenu
                            onEdit={() => setModal({ open: true, product: p })}
                            onDelete={() => handleDelete(p)}
                          />
                        </div>
                      )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-9 text-xs sm:grid-cols-3 lg:hidden">
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">SKU</span>
                        <span className="truncate font-semibold text-[var(--dash-text2)]">{p.sku || '—'}</span>
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">{t('products.category')}</span>
                        {p.category ? (
                          <span
                            className="inline-flex max-w-full w-fit truncate rounded-full px-2 py-1 text-[11px] font-bold"
                            style={tone(catTone(p.category))}
                          >
                            {displayCategory(p.category)}
                          </span>
                        ) : (
                          <span className="font-medium text-[var(--dash-muted)]">{t('products.noCategory')}</span>
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">{t('products.price')}</span>
                        <span className="font-extrabold text-[var(--dash-text)]">{formatProductPrice(p.price)}</span>
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">{t('products.availability')}</span>
                        {canEdit ? (
                          <AvailabilitySwitch
                            value={p.available}
                            onToggle={() =>
                              dispatch(
                                updateProduct({
                                  productId: p.id,
                                  data: { available: !p.available },
                                })
                              )
                            }
                          />
                        ) : (
                          <span
                            className="w-fit rounded-full px-2.5 py-1 text-[11px] font-bold"
                            style={tone(p.available ? 'green' : 'red')}
                          >
                            {p.available
                              ? t('products.available')
                              : t('products.unavailable')}
                          </span>
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">{t('products.updated')}</span>
                        <span className="truncate font-medium text-[var(--dash-muted)]">
                          {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(p.updatedAt))}
                        </span>
                      </span>
                    </div>
                    <span className="hidden w-[110px] text-xs font-semibold text-[var(--dash-text2)] lg:block">
                      {p.sku || '—'}
                    </span>
                    <span className="hidden w-[130px] lg:block">
                      {p.category ? (
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                          style={tone(catTone(p.category))}
                        >
                          {displayCategory(p.category)}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                          {t('products.noCategory')}
                        </span>
                      )}
                    </span>
                    <span className="hidden w-[110px] text-sm font-extrabold text-[var(--dash-text)] lg:block">
                      {formatProductPrice(p.price)}
                    </span>
                    <span className="hidden w-[160px] lg:block">
                      {canEdit ? (
                        <AvailabilitySwitch
                          value={p.available}
                          onToggle={() =>
                            dispatch(
                              updateProduct({
                                productId: p.id,
                                data: { available: !p.available },
                              })
                            )
                          }
                        />
                      ) : (
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                          style={tone(p.available ? 'green' : 'red')}
                        >
                          {p.available
                            ? t('products.available')
                            : t('products.unavailable')}
                        </span>
                      )}
                    </span>
                    <span className="hidden w-[120px] text-xs font-medium text-[var(--dash-muted)] lg:block">
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: 'medium',
                      }).format(new Date(p.updatedAt))}
                    </span>
                    {canEdit ? (
                      <span className="hidden shrink-0 lg:block">
                        <RowMenu
                          onEdit={() => setModal({ open: true, product: p })}
                          onDelete={() => handleDelete(p)}
                        />
                      </span>
                    ) : (
                      <span className="hidden w-8 shrink-0 lg:block" />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-[var(--dash-muted)]">
              {t('products.showing', {
                shown: pageItems.length,
                total: visible.length,
              })}
            </span>
            <div className="flex items-center gap-1">
              <PagerBtn
                icon="chevrons-left"
                disabled={safePage === 1}
                onClick={() => setPage(1)}
              />
              <PagerBtn
                icon="chevron-left"
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
              {pageList(safePage, totalPages).map((n, i) =>
                n === '…' ? (
                  <span
                    key={`e${i}`}
                    className="px-1 text-xs font-bold text-[var(--dash-muted)]"
                  >
                    …
                  </span>
                ) : (
                  <PagerNum
                    key={n}
                    n={n}
                    active={n === safePage}
                    onClick={() => setPage(n)}
                  />
                )
              )}
              <PagerBtn
                icon="chevron-right"
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
              <PagerBtn
                icon="chevrons-right"
                disabled={safePage === totalPages}
                onClick={() => setPage(totalPages)}
              />
            </div>
          </div>
        </div>
      </main>

      {modal.open && (
        <ProductModal
          key={modal.product?.id ?? 'new'}
          product={modal.product}
          tenantId={tenant?.id}
          lists={lists}
          onClose={() => setModal({ open: false, product: null })}
        />
      )}
    </CrmLayout>
  )
}

/* ── Pieces ──────────────────────────────────────────────────────── */
function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked?: boolean
  indeterminate?: boolean
  onChange?: () => void
}) {
  const on = checked || indeterminate
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : !!checked}
      onClick={(e) => {
        e.stopPropagation()
        onChange?.()
      }}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] text-white transition ${on ? `border-transparent ${gradient}` : 'border-[#CBD5E1] bg-[var(--dash-surface)] hover:border-[var(--dash-link)]'}`}
    >
      {indeterminate ? (
        <span className="h-[2px] w-2.5 rounded bg-white" />
      ) : checked ? (
        <span className="text-[11px] font-black leading-none">✓</span>
      ) : null}
    </button>
  )
}

function AvailabilitySwitch({
  value,
  onToggle,
}: {
  value: boolean
  onToggle: () => void
}) {
  const t = useCatalogT()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-[#10B981]' : 'bg-[var(--dash-border)]'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${value ? 'left-[22px]' : 'left-0.5'}`}
        />
      </span>
      <span
        className={`text-[11px] font-bold ${value ? 'text-[#10B981]' : 'text-[var(--dash-muted)]'}`}
      >
        {value ? t('products.available') : t('products.unavailable')}
      </span>
    </button>
  )
}

function EmptyState({ hasProducts }: { hasProducts: boolean }) {
  const t = useCatalogT()
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={tone('violet')}
      >
        <Icon name="package" size={24} />
      </span>
      <p className="text-sm font-semibold text-[var(--dash-text)]">
        {hasProducts
          ? t('products.emptyFiltered')
          : t('products.empty')}
      </p>
    </div>
  )
}

function CategoryDropdown({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const t = useCatalogT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  const label =
    value === 'all' ? t('products.allCategories') : displayCategory(value)
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-text2)]"
      >
        <Icon name="tags" size={14} className="text-[var(--dash-link)]" />{' '}
        {label}
        <Icon
          name="chevron-down"
          size={14}
          className={`text-[var(--dash-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`absolute right-0 top-[calc(100%+6px)] z-40 max-h-64 w-52 origin-top-right overflow-y-auto rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1.5 shadow-[0_16px_44px_-12px_rgba(15,23,42,0.3)] transition-all duration-150 ${open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
      >
        <MenuRow
          active={value === 'all'}
          onClick={() => {
            onChange('all')
            setOpen(false)
          }}
        >
          {t('products.allCategories')}
        </MenuRow>
        {options.map((c) => (
          <MenuRow
            key={c}
            active={value === c}
            onClick={() => {
              onChange(c)
              setOpen(false)
            }}
          >
            {displayCategory(c)}
          </MenuRow>
        ))}
      </div>
    </div>
  )
}

function MenuRow({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-[13px] font-semibold hover:bg-[var(--dash-soft)] ${active ? 'text-[var(--dash-link)]' : 'text-[var(--dash-text2)]'}`}
    >
      {children}
    </button>
  )
}

/* Generic toolbar dropdown using the outline-button trigger. */
function Menu({
  icon,
  label,
  width = 'w-56',
  children,
}: {
  icon: IconName
  label: string
  width?: string
  children: (close: () => void) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  return (
    <div ref={ref} className="relative w-full lg:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${outlineBtn} w-full justify-between lg:w-auto lg:justify-start`}
      >
        <span className="flex items-center gap-2">
          <Icon name={icon} size={16} /> {label}
        </span>
        <Icon
          name="chevron-down"
          size={14}
          className={`text-[var(--dash-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`absolute right-0 top-[calc(100%+6px)] z-40 ${width} origin-top-right rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-2 shadow-[0_16px_44px_-12px_rgba(15,23,42,0.3)] transition-all duration-150 ${open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
      >
        {children(() => setOpen(false))}
      </div>
    </div>
  )
}

function SortMenu({
  sort,
  onSort,
}: {
  sort: SortKey
  onSort: (s: SortKey) => void
}) {
  const t = useCatalogT()
  return (
    <Menu icon="arrow-up-down" label={t('products.sort')} width="w-60">
      {(close) =>
        SORT_OPTIONS.map((o) => (
          <MenuRow
            key={o.key}
            active={sort === o.key}
            onClick={() => {
              onSort(o.key)
              close()
            }}
          >
            {t(o.labelKey)}
          </MenuRow>
        ))
      }
    </Menu>
  )
}

function ExportMenu({
  count,
  scoped,
  onExcel,
  onPdf,
}: {
  count: number
  scoped: boolean
  onExcel: () => void
  onPdf: () => void
}) {
  const t = useCatalogT()
  return (
    <Menu icon="download" label={t('products.export')} width="w-60">
      {(close) => (
        <>
          <p className="px-3 py-1.5 text-[11px] font-semibold text-[var(--dash-muted)]">
            {t('products.exportScope', {
              count,
              plural: count === 1 ? '' : 's',
              scope: scoped ? t('products.selection') : t('products.currentFilter'),
            })}
          </p>
          <MenuRow
            active={false}
            onClick={() => {
              if (count) onExcel()
              close()
            }}
          >
            <span className="flex items-center gap-2">
              <Icon
                name="file-spreadsheet"
                size={15}
                className="text-[#16A34A]"
              />{' '}
              Excel (.xls)
            </span>
          </MenuRow>
          <MenuRow
            active={false}
            onClick={() => {
              if (count) onPdf()
              close()
            }}
          >
            <span className="flex items-center gap-2">
              <Icon
                name="file-spreadsheet"
                size={15}
                className="text-[#DC2626]"
              />{' '}
              PDF
            </span>
          </MenuRow>
        </>
      )}
    </Menu>
  )
}

const filterInput =
  'h-9 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-soft)] px-2.5 text-[13px] font-medium text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]'

function FilterMenu({
  status,
  onStatus,
  priceMin,
  priceMax,
  onPriceMin,
  onPriceMax,
  onClear,
}: {
  status: Status
  onStatus: (s: Status) => void
  priceMin: string
  priceMax: string
  onPriceMin: (v: string) => void
  onPriceMax: (v: string) => void
  onClear: () => void
}) {
  const t = useCatalogT()
  const avail: { key: Status; label: string }[] = [
    { key: 'all', label: t('products.all') },
    { key: 'available', label: t('products.availablePlural') },
    { key: 'unavailable', label: t('products.unavailablePlural') },
  ]
  const onlyDigits = (v: string) => v.replace(/[^\d]/g, '')
  return (
    <Menu icon="sliders-horizontal" label={t('products.filters')} width="w-64">
      {() => (
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 px-1 text-[11px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              {t('products.availability')}
            </p>
            {avail.map((a) => (
              <MenuRow
                key={a.key}
                active={status === a.key}
                onClick={() => onStatus(a.key)}
              >
                {a.label}
              </MenuRow>
            ))}
          </div>
          <div>
            <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              {t('products.price')}
            </p>
            <div className="flex items-center gap-2 px-1">
              <input
                value={priceMin}
                onChange={(e) => onPriceMin(onlyDigits(e.target.value))}
                inputMode="numeric"
                placeholder={t('products.min')}
                className={filterInput}
              />
              <span className="text-[var(--dash-muted)]">–</span>
              <input
                value={priceMax}
                onChange={(e) => onPriceMax(onlyDigits(e.target.value))}
                inputMode="numeric"
                placeholder={t('products.max')}
                className={filterInput}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--dash-border)] text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
          >
            <Icon name="circle-x" size={15} /> {t('products.clearFilters')}
          </button>
        </div>
      )}
    </Menu>
  )
}

/* ── Export helpers ──────────────────────────────────────────────── */
const exportColumns = (t: ReturnType<typeof useCatalogT>) => [
  t('products.exportName'),
  'SKU',
  t('products.exportCategory'),
  t('products.price'),
  t('products.exportAvailable'),
]
const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] || c
  )
const exportCells = (
  p: Product,
  currency: string,
  t: ReturnType<typeof useCatalogT>
) => [
  p.name,
  p.sku || '',
  p.category || '',
  `${currency} ${parseFloat(p.price) || 0}`,
  p.available ? t('products.yes') : t('products.no'),
]

function downloadExcel(
  products: Product[],
  currency: string,
  t: ReturnType<typeof useCatalogT>
) {
  if (!products.length) return
  const head = `<tr>${exportColumns(t).map((c) => `<th>${c}</th>`).join('')}</tr>`
  const rows = products
    .map(
      (p) =>
        `<tr>${exportCells(p, currency, t)
          .map((v) => `<td>${escapeHtml(String(v))}</td>`)
          .join('')}</tr>`
    )
    .join('')
  const html = `<html><head><meta charset="utf-8"></head><body><table border="1">${head}${rows}</table></body></html>`
  const blob = new Blob(['﻿' + html], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `productos-${new Date().toISOString().slice(0, 10)}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function printPdf(
  products: Product[],
  title: string,
  currency: string,
  t: ReturnType<typeof useCatalogT>,
  locale: string
) {
  if (!products.length) return
  const head = `<tr>${exportColumns(t).map((c) => `<th>${c}</th>`).join('')}</tr>`
  const rows = products
    .map(
      (p) =>
        `<tr>${exportCells(p, currency, t)
          .map(
            (v, i) =>
              `<td class="${i === 3 ? 'num' : ''}">${escapeHtml(String(v))}</td>`
          )
          .join('')}</tr>`
    )
    .join('')
  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) {
    alert(t('products.popupBlocked'))
    return
  }
  w.document
    .write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)} — ${t('products.catalog')}</title>
    <style>
      *{font-family:Inter,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{margin:32px;color:#0F172A} h1{font-size:22px;margin:0 0 4px}
      .meta{color:#64748B;font-size:12px;margin-bottom:18px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th{text-align:left;background:#F1F5F9;padding:8px 10px;border-bottom:2px solid #E2E8F0;text-transform:uppercase;font-size:10px;letter-spacing:.04em;color:#475569}
      td{padding:8px 10px;border-bottom:1px solid #E2E8F0} td.num{text-align:right;font-variant-numeric:tabular-nums}
      @media print{body{margin:12mm}}
    </style></head>
    <body><h1>${escapeHtml(title)}</h1>
    <div class="meta">${t('products.catalogMeta', { count: products.length, plural: products.length === 1 ? '' : 's', date: new Date().toLocaleDateString(locale) })}</div>
    <table>${head}${rows}</table>
    <script>window.onload=function(){setTimeout(function(){window.print()},200)}</script>
    </body></html>`)
  w.document.close()
}

const MENU_W = 160
const MENU_H = 96

function RowMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  const t = useCatalogT()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggle = () => {
    if (open) {
      setOpen(false)
      return
    }
    const r = btnRef.current!.getBoundingClientRect()
    const top =
      r.bottom + 6 + MENU_H > window.innerHeight
        ? r.top - MENU_H - 6
        : r.bottom + 6
    setPos({ top, left: Math.max(8, r.right - MENU_W) })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const close = () => setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80"
      >
        <Icon name="ellipsis" size={14} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: pos.top, left: pos.left, width: MENU_W }}
            className="dash fixed z-[120] rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1.5 font-sans shadow-[0_16px_44px_-12px_rgba(15,23,42,0.35)] animate-scale-in"
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onEdit()
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
            >
              <Icon name="settings" size={15} /> {t('products.edit')}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onDelete()
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[#EF4444] hover:bg-[var(--dash-soft)]"
            >
              <Icon name="circle-x" size={15} /> {t('products.delete')}
            </button>
          </div>,
          document.body
        )}
    </>
  )
}

function PagerBtn({
  icon,
  disabled,
  onClick,
}: {
  icon: IconName
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="dash-pagination flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon name={icon} size={13} />
    </button>
  )
}

function PagerNum({
  n,
  active,
  onClick,
}: {
  n: number
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dash-pagination flex h-[30px] w-[30px] items-center justify-center rounded-lg text-xs font-bold ${active ? `text-white ${gradient}` : 'border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'}`}
    >
      {n}
    </button>
  )
}

function pageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) out.push('…')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push('…')
  out.push(total)
  return out
}

/* ── Create / edit modal ─────────────────────────────────────────── */
export function ProductModal({
  product,
  tenantId,
  lists,
  onClose,
  onCreated,
}: {
  product: Product | null
  tenantId?: string
  lists: PriceList[]
  onClose: () => void
  onCreated?: (product: Product) => void
}) {
  const t = useCatalogT()
  const dispatch = useAppDispatch()
  const saving = useAppSelector(selectProductsSaving)
  const [name, setName] = useState(product?.name ?? '')
  const [sku, setSku] = useState(product?.sku ?? '')
  const [categoryValue, setCategoryValue] = useState(product?.category ?? '')
  const [price, setPrice] = useState(
    product ? String(parseFloat(product.price)) : ''
  )
  const [available, setAvailable] = useState(product ? product.available : true)
  const [description, setDescription] = useState(product?.description ?? '')
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '')
  const [imageThumbUrl, setImageThumbUrl] = useState(
    product?.imageThumbUrl ?? ''
  )
  const [priceListIds, setPriceListIds] = useState<Set<string>>(
    () => new Set(lists.map((list) => list.id))
  )
  const [imgLoading, setImgLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const priceChanged =
    !!product && (parseFloat(price) || 0) !== (parseFloat(product.price) || 0)

  useEffect(() => {
    setPriceListIds(new Set(lists.map((list) => list.id)))
  }, [lists])

  const togglePriceList = (id: string) => {
    setPriceListIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllPriceLists = () =>
    setPriceListIds(new Set(lists.map((list) => list.id)))
  const clearPriceLists = () => setPriceListIds(new Set())

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImgLoading(true)
    setError(null)
    try {
      const image = await fileToImageBlob(f)
      if (!tenantId) throw new Error('No se encontró la empresa.')
      const response = await api.uploadProductImage(tenantId, image)
      if (response.error || !response.data)
        throw new Error(response.error || 'No se pudo subir la imagen.')
      setImageUrl(response.data.url)
      setImageThumbUrl(response.data.thumbnailUrl)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo subir la imagen.'
      )
    } finally {
      setImgLoading(false)
      e.target.value = ''
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    const data: ProductInput = {
      name: name.trim(),
      price: parseFloat(price) || 0,
      available,
      sku: sku.trim() || null,
      category: normalizeCategory(categoryValue),
      description: description.trim() || null,
      imageUrl: imageUrl || '',
      imageThumbUrl: imageUrl ? imageThumbUrl || imageUrl : '',
    }
    if (priceChanged) data.priceListIds = Array.from(priceListIds)
    const result = product
      ? await dispatch(updateProduct({ productId: product.id, data }))
      : tenantId
        ? await dispatch(createProduct({ tenantId, data }))
        : null
    if (
      result &&
      (createProduct.fulfilled.match(result) ||
        updateProduct.fulfilled.match(result))
    ) {
      if (createProduct.fulfilled.match(result)) {
        trackEvent('Created Product', {
          has_image: Boolean(imageUrl),
          has_category: Boolean(data.category),
          is_available: available,
        })
        onCreated?.(result.payload)
      }
      onClose()
    } else if (
      result &&
      (createProduct.rejected.match(result) ||
        updateProduct.rejected.match(result))
    ) {
      setError((result.payload as string) || 'No se pudo guardar el producto.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <form
        onSubmit={submit}
        className="max-h-[calc(100vh-32px)] w-full max-w-[460px] animate-scale-in overflow-auto rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[var(--dash-text)]">
            {product ? t('products.editTitle') : t('products.new')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--dash-text2)]">
              {t('products.photo')}
            </span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] text-[var(--dash-muted)] hover:opacity-90"
              >
                {imageUrl ? (
                  <img
                    src={imageThumbUrl || imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon name="package" size={26} />
                )}
              </button>
              <div className="flex flex-col items-start gap-1.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-9 items-center gap-2 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
                >
                  <Icon name="upload" size={15} />{' '}
                  {imgLoading
                    ? t('products.loadingImage')
                    : imageUrl
                      ? t('products.changePhoto')
                      : t('products.uploadPhoto')}
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('')
                      setImageThumbUrl('')
                    }}
                    className="text-[12px] font-semibold text-[#EF4444] hover:underline"
                  >
                    {t('products.removePhoto')}
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickImage}
                className="hidden"
              />
            </div>
          </div>
          <Field label={t('products.name')}>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('products.namePlaceholder')}
              className={inputCls}
              required
            />
          </Field>
          <div className="flex gap-3">
            <Field label="SKU">
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="TOR-001"
                className={inputCls}
              />
            </Field>
            <Field label={t('products.category')}>
              <input
                value={categoryValue}
                onChange={(e) => setCategoryValue(e.target.value)}
                placeholder={t('products.categoryPlaceholder')}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="flex gap-3">
            <Field label={t('products.price')}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className={inputCls}
                required
              />
            </Field>
            <Field label={t('products.availability')}>
              <div className="flex h-11 items-center gap-1 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-1">
                <button
                  type="button"
                  onClick={() => setAvailable(true)}
                  className={`h-full flex-1 rounded-lg text-xs font-bold transition ${available ? `text-white ${gradient}` : 'text-[var(--dash-text2)]'}`}
                >
                  {t('products.available')}
                </button>
                <button
                  type="button"
                  onClick={() => setAvailable(false)}
                  className={`h-full flex-1 rounded-lg text-xs font-bold transition ${!available ? 'bg-[#EF4444] text-white' : 'text-[var(--dash-text2)]'}`}
                >
                  {t('products.unavailable')}
                </button>
              </div>
            </Field>
          </div>
          <Field label={t('products.description')}>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('products.descriptionPlaceholder')}
              className={inputCls}
            />
          </Field>
          {priceChanged && (
            <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--dash-text2)]">
                    {t('products.applyPrice')}
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-[var(--dash-muted)]">
                    {t('products.priceListsHelp')}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={selectAllPriceLists}
                    className="text-[12px] font-bold text-[var(--dash-link)]"
                  >
                    {t('products.allFemale')}
                  </button>
                  <button
                    type="button"
                    onClick={clearPriceLists}
                    className="text-[12px] font-bold text-[var(--dash-muted)]"
                  >
                    {t('products.none')}
                  </button>
                </div>
              </div>
              <div className="mt-3 flex max-h-32 flex-col gap-2 overflow-auto pr-1">
                {lists.length === 0 ? (
                  <p className="text-[12px] font-semibold text-[var(--dash-muted)]">
                    {t('products.noLists')}
                  </p>
                ) : (
                  lists.map((list) => (
                    <label
                      key={list.id}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2"
                    >
                      <span className="text-[13px] font-bold text-[var(--dash-text)]">
                        {list.name}
                      </span>
                      <input
                        type="checkbox"
                        checked={priceListIds.has(list.id)}
                        onChange={() => togglePriceList(list.id)}
                        className="h-4 w-4 accent-[#7C3AED]"
                      />
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-[13px] font-semibold text-[#B91C1C]">
            <Icon name="alert-triangle" size={15} className="mt-0.5 shrink-0" />{' '}
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
          >
            {t('products.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`flex h-11 items-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}
          >
            {saving
              ? t('products.saving')
              : product
                ? t('products.saveChanges')
                : t('products.create')}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls =
  'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)]'

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">
        {label}
      </span>
      {children}
    </label>
  )
}

export default ProductsScreen
