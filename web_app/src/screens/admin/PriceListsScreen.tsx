import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant, selectCanEdit } from '../../store/slices/authSlice'
import {
  fetchLists,
  createList,
  updateList,
  deleteList,
  createItem,
  deleteItem,
  selectLists,
  selectIsLoading,
} from '../../store/slices/menuSlice'
import { fetchProducts, selectProducts } from '../../store/slices/productsSlice'
import type {
  Customer,
  PriceList,
  Product,
  ListContent,
} from '../../types'
import api from '../../services/api'
import { localeOf, useT, type TFn } from '../../lib/i18n'
import { ListAppearanceFields } from '../../components/appearance/ListAppearanceFields'
import { hasOwnAppearance, type ListAppearance } from '../../lib/listAppearance'
import { CrmLayout } from './crm/CrmLayout'
import { ProductModal } from './ProductsScreen'
import { VariantModal, QrModal } from './PriceListsModals'
export { QrModal } from './PriceListsModals'
import { Icon, type IconName } from './crm/ui'
import { tone, gradient } from './crm/theme'
import { catTone, catIcon } from './crm/productFormat'
import { QR_COLOR_STORAGE_PREFIX } from '../../lib/qrRender'
import { trackEvent } from '../../lib/analytics'
import { useStoredQrColor } from '../../hooks/useStoredQrColor'

type Tab = 'all' | 'active' | 'inactive' | 'offline'

const FAVICON = '/miprecio-favicon.png'
const slugOf = (l: PriceList) => l.slug || l.id
const publicPath = (sub: string | undefined, l: PriceList) =>
  `/p/${sub || ''}/${slugOf(l)}`
const publicDisplay = (sub: string | undefined, l: PriceList) =>
  `${window.location.origin}${publicPath(sub, l)}`
const publicUrl = (sub: string | undefined, l: PriceList) =>
  `${window.location.origin}${publicPath(sub, l)}`
const qrUrl = (sub: string | undefined, l: PriceList) =>
  `${publicUrl(sub, l)}?src=qr`

const starterTemplateContent = (name: string): ListContent => ({
  schemaVersion: 1,
  hero: { title: name },
  blocks: [],
})

/* ── Screen ──────────────────────────────────────────────────────── */
export function PriceListsScreen() {
  const t = useT()
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const lists = useAppSelector(selectLists)
  const loading = useAppSelector(selectIsLoading)
  const products = useAppSelector(selectProducts)

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [modal, setModal] = useState<{ open: boolean; list: PriceList | null }>(
    () => ({
      open: searchParams.get('new') === '1' && canEdit,
      list: null,
    })
  )
  const [qr, setQr] = useState<PriceList | null>(null)
  const [qrColor] = useStoredQrColor(
    tenant?.id ? `${QR_COLOR_STORAGE_PREFIX}${tenant.id}` : null
  )
  const [variantParent, setVariantParent] = useState<PriceList | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const editId = searchParams.get('edit')
  const newList = searchParams.get('new') === '1'
  const customize = searchParams.get('customize') === '1'

  useEffect(() => {
    if (tenant?.id) {
      dispatch(fetchLists(tenant.id))
      dispatch(fetchProducts(tenant.id))
    }
  }, [dispatch, tenant?.id])

  useEffect(() => {
    if (!tenant?.id) return
    void api
      .getCustomers(tenant.id)
      .then((response) => setCustomers(response.data ?? []))
  }, [tenant?.id])

  useEffect(() => {
    if (!canEdit) return
    let cancelled = false
    const nextModal = () => {
      if (editId) {
        const list = lists.find((item) => item.id === editId)
        return list ? { open: true, list } : null
      }
      return newList ? { open: true, list: null } : null
    }
    void Promise.resolve().then(() => {
      const next = nextModal()
      if (next && !cancelled) setModal(next)
    })
    return () => {
      cancelled = true
    }
  }, [canEdit, editId, lists, newList])

  const closeModal = () => {
    setModal({ open: false, list: null })
    setSearchParams((current) => {
      current.delete('new')
      current.delete('edit')
      current.delete('step')
      current.delete('customize')
      return current
    })
  }

  const availableProducts = useMemo(
    () => products.filter((p) => p.available),
    [products]
  )

  const counts = useMemo(
    () => ({
      all: lists.length,
      active: lists.filter((l) => l.published && l.live).length,
      inactive: lists.filter((l) => !l.published).length,
      offline: lists.filter((l) => l.published && !l.live).length,
    }),
    [lists]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matches = (l: PriceList) =>
      (!q || [l.name, l.slug].some((v) => v?.toLowerCase().includes(q))) &&
      (tab === 'all' || (tab === 'active' ? l.published : !l.published))

    return lists.filter((l) => {
      if (tab === 'active' && !(l.published && l.live)) return false
      if (tab === 'inactive' && l.published) return false
      if (tab === 'offline' && !(l.published && !l.live)) return false
      if (l.parentListId) return false
      const variants = lists.filter((child) => child.parentListId === l.id)
      return matches(l) || variants.some(matches)
    })
  }, [lists, tab, search])

  const togglePublished = (l: PriceList) =>
    dispatch(updateList({ listId: l.id, data: { published: !l.published } }))
  const togglePrincipal = (l: PriceList) =>
    dispatch(
      updateList({ listId: l.id, data: { showOnIndex: !l.showOnIndex } })
    )
  const handleDelete = (l: PriceList) => {
    if (window.confirm(t('pl.deleteConfirm', { name: l.name })))
      dispatch(deleteList(l.id))
  }
  const copyLink = (l: PriceList) =>
    navigator.clipboard?.writeText(publicUrl(tenant?.subdomain, l))

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: t('pl.tab.all'), count: counts.all },
    { key: 'active', label: t('pl.tab.active'), count: counts.active },
    { key: 'inactive', label: t('pl.tab.inactive'), count: counts.inactive },
    // Only worth a tab when the plan is actually holding lists back.
    ...(counts.offline
      ? [
          {
            key: 'offline' as Tab,
            label: t('pl.tab.offline'),
            count: counts.offline,
          },
        ]
      : []),
  ]

  return (
    <CrmLayout
      active="Listas de precios"
      title={t('nav.lists')}
      subtitle={t('lists.subtitle')}
      hideContext
      searchPlaceholder={t('lists.search')}
      searchValue={search}
      onSearchChange={setSearch}
    >
      <main className="flex min-h-full flex-col gap-4 px-4 py-6 md:px-10 md:py-8 xl:min-w-[900px]">
        <section className="flex min-h-[60px] flex-col justify-center gap-1">
          <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">
            {t('nav.lists')}
          </h1>
          <p className="text-[13px] text-[#9694A6]">{t('lists.subtitle')}</p>
        </section>

        {/* Lists published beyond what the plan serves. Nothing was unpublished,
            so without this the owner has no way to know they are unreachable. */}
        {counts.offline > 0 && (
          <div
            className="flex flex-col gap-3 rounded-2xl border border-[var(--tone-red-fg)]/25 p-4 sm:flex-row sm:items-center sm:justify-between"
            style={tone('red')}
          >
            <div className="flex items-start gap-3">
              <Icon
                name="alert-triangle"
                size={18}
                className="mt-0.5 shrink-0"
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-bold">
                  {counts.offline === 1
                    ? t('pl.offline.oneTitle')
                    : t('pl.offline.manyTitle', { count: counts.offline })}
                </p>
                <p className="text-xs font-medium opacity-80">
                  {counts.offline === 1
                    ? t('pl.offline.oneDescription', { active: counts.active })
                    : t('pl.offline.manyDescription', {
                        active: counts.active,
                      })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              className="h-10 shrink-0 rounded-full bg-[var(--tone-red-fg)] px-4 text-xs font-bold text-[var(--dash-surface)]"
            >
              {t('pl.offline.viewPlans')}
            </button>
          </div>
        )}

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
                <span
                  className={`rounded-full px-1.5 py-px text-[10px] font-bold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-[var(--dash-soft)] text-[var(--dash-text2)]'}`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setModal({ open: true, list: null })
                  setSearchParams({ new: '1' })
                }}
                className={`flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-bold text-white ${gradient}`}
              >
                <Icon name="plus" size={15} /> {t('pl.new')}
              </button>
            )}
          </div>
        </section>

        {/* Rows */}
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">
            {t('pl.loading')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[208px] flex-col items-center justify-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 text-center">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-[10px] text-white ${gradient}`}
            >
              <Icon name="list-plus" size={19} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-lg font-bold text-[var(--dash-text)]">
                {lists.length > 0
                  ? t('lists.noResults')
                  : t('lists.emptyTitle')}
              </p>
              {lists.length === 0 && (
                <p className="text-[13px] text-[var(--dash-muted)]">
                  {t('lists.emptyDescription')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-visible rounded-xl border-0 bg-transparent lg:overflow-hidden lg:border lg:border-[var(--dash-border)] lg:bg-[var(--dash-surface)]">
            <div className="hidden min-w-[680px] items-center gap-3 bg-[var(--dash-table-head)] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--dash-muted)] lg:flex">
              <span className="flex-1">{t('pl.column.list')}</span>
              <span className="w-[100px]">{t('pl.column.products')}</span>
              <span className="w-[110px]">{t('pl.column.status')}</span>
              <span className="w-[110px]">{t('pl.column.updated')}</span>
              <span className="w-[144px]" />
            </div>
            {filtered.map((l, i) => (
              <div
                key={l.id}
                className="mx-2 my-2 overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)] lg:contents"
              >
                <ListRow
                  list={l}
                  canEdit={canEdit}
                  first={i === 0}
                  onEdit={() => {
                    setModal({ open: true, list: l })
                    setSearchParams({ edit: l.id })
                  }}
                  onCustomize={() => {
                    navigate(`/admin/lists/${l.id}/customize`)
                  }}
                  onTogglePublished={() => togglePublished(l)}
                  onTogglePrincipal={() => togglePrincipal(l)}
                  onDelete={() => handleDelete(l)}
                  onCopy={() => copyLink(l)}
                  onQr={() => setQr(l)}
                  onOpen={() =>
                    window.open(publicUrl(tenant?.subdomain, l), '_blank')
                  }
                  onReports={() => navigate(`/admin/reports?list=${l.id}`)}
                  onCreateVariant={() => setVariantParent(l)}
                />
                {lists
                  .filter((variant) => variant.parentListId === l.id)
                  .filter((variant) => {
                    const q = search.trim().toLowerCase()
                    return (
                      (!q ||
                        [variant.name, variant.slug].some((v) =>
                          v?.toLowerCase().includes(q)
                        )) &&
                      (tab === 'all' ||
                        (tab === 'active'
                          ? variant.published
                          : !variant.published))
                    )
                  })
                  .map((variant) => (
                    <ListRow
                      key={variant.id}
                      list={variant}
                      canEdit={canEdit}
                      variant
                      variantDetail={variantDetail(
                        variant,
                        customers.find(
                          (customer) => customer.id === variant.customerId
                        ),
                        t
                      )}
                      onEdit={() => {
                        setModal({ open: true, list: variant })
                        setSearchParams({ edit: variant.id })
                      }}
                      onCustomize={() => {
                        navigate(`/admin/lists/${variant.id}/customize`)
                      }}
                      onTogglePublished={() => togglePublished(variant)}
                      onTogglePrincipal={() => undefined}
                      onDelete={() => handleDelete(variant)}
                      onCopy={() => copyLink(variant)}
                      onQr={() => setQr(variant)}
                      onOpen={() =>
                        window.open(
                          publicUrl(tenant?.subdomain, variant),
                          '_blank'
                        )
                      }
                      onReports={() =>
                        navigate(`/admin/reports?list=${variant.id}`)
                      }
                    />
                  ))}
              </div>
            ))}
          </div>
        )}
      </main>

      {modal.open && (
        <ListModal
          key={modal.list?.id ?? 'new'}
          list={modal.list}
          initialStep={searchParams.get('step') === '2' ? 2 : 1}
          initialCustomize={customize}
          tenantId={tenant?.id}
          products={availableProducts}
          lists={lists}
          onClose={closeModal}
        />
      )}
      {variantParent && tenant?.id && (
        <VariantModal
          parent={variantParent}
          tenantId={tenant.id}
          onClose={() => setVariantParent(null)}
        />
      )}
      {qr && (
        <QrModal
          list={qr}
          url={publicDisplay(tenant?.subdomain, qr)}
          linkUrl={publicUrl(tenant?.subdomain, qr)}
          qrValue={qrUrl(tenant?.subdomain, qr)}
          fg={qrColor}
          logoUrl={tenant?.logoUrl || FAVICON}
          onClose={() => setQr(null)}
        />
      )}
    </CrmLayout>
  )
}

/* ── Row ─────────────────────────────────────────────────────────── */
function ListRow({
  list,
  canEdit,
  first,
  onEdit,
  onCustomize,
  onTogglePublished,
  onTogglePrincipal,
  onDelete,
  onCopy,
  onQr,
  onOpen,
  onReports,
  onCreateVariant,
  variant = false,
  variantDetail,
}: {
  list: PriceList
  canEdit: boolean
  first?: boolean
  onEdit: () => void
  onCustomize: () => void
  onTogglePublished: () => void
  onTogglePrincipal: () => void
  onDelete: () => void
  onCopy: () => void
  onQr: () => void
  onOpen: () => void
  onReports: () => void
  onCreateVariant?: () => void
  variant?: boolean
  variantDetail?: string
}) {
  const t = useT()
  const tenant = useAppSelector(selectTenant)
  const [copied, setCopied] = useState(false)
  const copy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={`flex min-w-0 flex-col gap-3 px-4 py-4 lg:min-w-[680px] lg:flex-row lg:items-center lg:gap-3 lg:px-5 ${variant ? 'border-t border-[var(--dash-divider)] bg-[var(--dash-soft)] lg:py-3' : 'bg-[var(--dash-surface)] lg:py-4'} ${!first ? 'lg:border-t lg:border-[var(--dash-divider)]' : ''}`}
    >
      <div
        className={`relative flex min-w-0 flex-1 items-start gap-3 lg:items-center ${variant ? 'pl-10 lg:pl-12' : ''}`}
      >
        {variant && (
          <span
            aria-hidden="true"
            className="absolute left-3 top-0 h-1/2 w-5 rounded-bl-lg border-b-2 border-l-2 border-[var(--dash-border)]"
          />
        )}
        <span
          className={`flex shrink-0 items-center justify-center ${variant ? 'h-8 w-8 rounded-lg' : 'h-10 w-10 rounded-[10px]'}`}
          style={tone(variant ? 'slate' : 'violet')}
        >
          <Icon name="list-checks" size={variant ? 15 : 19} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {variant && (
            <span className="flex items-center gap-1 whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--dash-link)]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
              {t('pl.variant.main')}
            </span>
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h4
              className={`min-w-0 whitespace-normal break-words font-bold leading-snug text-[var(--dash-text)] ${variant ? 'text-[14px]' : 'text-base'}`}
            >
              {list.name}
            </h4>
            {variant ? (
              <span className="rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--dash-text2)]">
                {variantLabel(list, t)}
              </span>
            ) : (
              list.showOnIndex && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={tone('violet')}
                >
                  {t('pl.main')}
                </span>
              )
            )}
          </div>
          {variant &&
            variantDetail &&
            variantDetail !== variantLabel(list, t) && (
              <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                {variantDetail}
              </span>
            )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-3 border-t border-[var(--dash-divider)] pt-3 text-xs lg:hidden">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
            {t('pl.column.products')}
          </span>
          <span className="font-semibold text-[var(--dash-text2)]">
            {list.itemCount}
          </span>
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
            {t('pl.column.status')}
          </span>
          <span
            className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold"
            style={tone(
              list.published && list.live
                ? 'green'
                : list.published
                  ? 'red'
                  : 'amber'
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {list.published && !list.live
              ? t('pl.status.offline')
              : list.published
                ? t('pl.status.active')
                : t('pl.status.draft')}
          </span>
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
            {t('pl.column.updated')}
          </span>
          <span className="truncate font-medium text-[var(--dash-muted)]">
            {formatListTimeAgo(list.updatedAt, localeOf(tenant?.language))}
          </span>
        </span>
      </div>

      <span
        className={`hidden w-[100px] font-semibold text-[var(--dash-text2)] lg:block ${variant ? 'text-xs' : 'text-sm'}`}
      >
        {list.itemCount}
      </span>
      <span className="hidden w-[110px] lg:block">
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold"
          style={tone(
            list.published && list.live
              ? 'green'
              : list.published
                ? 'red'
                : 'amber'
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />{' '}
          {list.published && !list.live
            ? t('pl.status.offline')
            : list.published
              ? t('pl.status.active')
              : t('pl.status.draft')}
        </span>
      </span>
      <span className="hidden w-[110px] text-xs font-medium text-[var(--dash-muted)] lg:block">
        {formatListTimeAgo(list.updatedAt, localeOf(tenant?.language))}
      </span>

      <div className="flex w-full shrink-0 items-center justify-end gap-2 border-t border-[var(--dash-divider)] pt-3 lg:w-[144px] lg:border-0 lg:pt-0">
        {list.published && (
          <button
            type="button"
            onClick={copy}
            title={copied ? t('pl.linkCopied') : t('pl.copyPublicLink')}
            aria-label={copied ? t('pl.linkCopied') : t('pl.copyPublicLink')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--dash-link)] hover:bg-[var(--dash-soft)]"
          >
            <Icon name={copied ? 'circle-check' : 'link-2'} size={15} />
          </button>
        )}
        {list.published && (
          <>
            <button
              type="button"
              onClick={onQr}
              title={t('pl.qrCode')}
              aria-label={t('pl.qrCode')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
            >
              <Icon name="qr-code" size={15} />
            </button>
            <button
              type="button"
              onClick={onOpen}
              title={t('pl.openPublic')}
              aria-label={t('pl.openPublic')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
            >
              <Icon name="external-link" size={15} />
            </button>
          </>
        )}
        {canEdit && (
          <RowMenu
            list={list}
            onEdit={onEdit}
            onCustomize={onCustomize}
            onTogglePublished={onTogglePublished}
            onTogglePrincipal={onTogglePrincipal}
            onDelete={onDelete}
            onCreateVariant={onCreateVariant}
            isVariant={variant}
            onReports={onReports}
          />
        )}
      </div>
    </div>
  )
}

function RowMenu({
  list,
  onEdit,
  onCustomize,
  onTogglePublished,
  onTogglePrincipal,
  onDelete,
  onCreateVariant,
  isVariant = false,
  onReports,
}: {
  list: PriceList
  onEdit: () => void
  onCustomize: () => void
  onTogglePublished: () => void
  onTogglePrincipal: () => void
  onDelete: () => void
  onCreateVariant?: () => void
  isVariant?: boolean
  onReports: () => void
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const H = isVariant ? 220 : 270

  const toggle = () => {
    if (open) {
      setOpen(false)
      return
    }
    const r = btnRef.current!.getBoundingClientRect()
    const top =
      r.bottom + 6 + H > window.innerHeight ? r.top - H - 6 : r.bottom + 6
    setPos({ top, left: Math.max(8, r.right - 200) })
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
    const close = () => setOpen(false)
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const act = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label={t('pl.options')}
        title={t('pl.options')}
        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
      >
        <Icon name="ellipsis" size={16} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: pos.top, left: pos.left, width: 200 }}
            className="dash fixed z-[120] rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1.5 font-sans shadow-[0_16px_44px_-12px_rgba(15,23,42,0.35)] animate-scale-in"
          >
            <MenuItemBtn
              icon="settings"
              label={t('pl.menu.edit')}
              onClick={act(onEdit)}
            />
            <MenuItemBtn
              icon="paintbrush"
              label="Personalizar plantilla"
              onClick={act(onCustomize)}
            />
            {!isVariant && onCreateVariant && (
              <MenuItemBtn
                icon="list-plus"
                label={t('pl.menu.createVariant')}
                onClick={act(onCreateVariant)}
              />
            )}
            <MenuItemBtn
              icon={list.published ? 'eye' : 'share-2'}
              label={
                list.published ? t('pl.menu.unpublish') : t('pl.menu.publish')
              }
              onClick={act(onTogglePublished)}
            />
            {!isVariant && (
              <MenuItemBtn
                icon="list-checks"
                label={
                  list.showOnIndex
                    ? t('pl.menu.removeMain')
                    : t('pl.menu.makeMain')
                }
                onClick={act(onTogglePrincipal)}
              />
            )}
            <MenuItemBtn
              icon="bar-chart"
              label={t('nav.reports')}
              onClick={act(onReports)}
            />
            <div className="my-1 h-px bg-[var(--dash-divider)]" />
            <MenuItemBtn
              icon="circle-x"
              label={t('pl.menu.delete')}
              onClick={act(onDelete)}
              danger
            />
          </div>,
          document.body
        )}
    </>
  )
}

function MenuItemBtn({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: IconName
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold hover:bg-[var(--dash-soft)] ${danger ? 'text-[#EF4444]' : 'text-[var(--dash-text2)]'}`}
    >
      <Icon name={icon} size={15} /> {label}
    </button>
  )
}

function variantLabel(list: PriceList, t: TFn): string {
  if (list.variantType === 'customer') return t('pl.variant.customer')
  if (list.variantType === 'promotion') return t('pl.variant.promotion')
  if (list.variantType === 'seasonal') return t('pl.variant.seasonal')
  return t('pl.variant.custom')
}

function variantDetail(
  list: PriceList,
  customer: Customer | undefined,
  t: TFn
): string {
  const audience = customer
    ? t('pl.variant.customerWithName', { name: customer.name })
    : variantLabel(list, t)
  const date = list.startsAt
    ? ` · ${t('pl.variant.from', { date: new Date(list.startsAt).toLocaleDateString() })}`
    : ''
  const end = list.endsAt
    ? ` ${t('pl.variant.to', { date: new Date(list.endsAt).toLocaleDateString() })}`
    : ''
  return `${audience}${date}${end}`
}

function DashField({
  label,
  wide = false,
  children,
}: {
  label: string
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <label
      className={`flex min-w-0 flex-col gap-1.5 ${wide ? 'sm:col-span-2' : ''}`}
    >
      <span className="text-xs font-bold text-[var(--dash-text2)]">
        {label}
      </span>
      {children}
    </label>
  )
}

/* ── Create wizard / edit modal ──────────────────────────────────── */
function ListModal({
  list,
  initialStep,
  initialCustomize,
  tenantId,
  products,
  lists,
  onClose,
}: {
  list: PriceList | null
  initialStep: 1 | 2
  initialCustomize: boolean
  tenantId?: string
  products: Product[]
  lists: PriceList[]
  onClose: () => void
}) {
  const dispatch = useAppDispatch()
  const [, setWizardParams] = useSearchParams()
  const t = useT()
  const tenant = useAppSelector(selectTenant)
  const editing = !!list
  const [step, setStep] = useState<1 | 2>(initialStep)
  const [name, setName] = useState(list?.name ?? '')
  const [slug, setSlug] = useState(list?.slug ?? '')
  const [kind, setKind] = useState<'product' | 'service'>(
    list?.kind ?? 'product'
  )
  const [published, setPublished] = useState(list?.published ?? false)
  const [principal, setPrincipal] = useState(list?.showOnIndex ?? false)
  const [captureViewerInfo, setCaptureViewerInfo] = useState(
    list?.captureViewerInfo ?? false
  )
  const [parentListId, setParentListId] = useState(list?.parentListId ?? '')
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
  const [showTemplateContent, setShowTemplateContent] =
    useState(initialCustomize)
  const [templateContent, setTemplateContent] = useState<ListContent | null>(
    null
  )
  const [contentRevision, setContentRevision] = useState(0)
  const [savingTemplateContent, setSavingTemplateContent] = useState(false)
  const versionId = useRef<string | undefined>(undefined)
  const [loadedItems, setLoadedItems] = useState<
    { id: string; name: string; productId: string | null }[]
  >([])

  // The product an item came from: by stable product id, else (legacy items with no
  // product_id) by name. Renaming a product no longer detaches it from the list.
  const productForItem = (it: {
    name: string
    productId: string | null
  }): Product | undefined =>
    it.productId
      ? products.find((p) => p.id === it.productId)
      : products.find(
          (p) => p.name.trim().toLowerCase() === it.name.trim().toLowerCase()
        )

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

  // When editing, load the current version + its items once.
  useEffect(() => {
    if (!list) return
    let cancelled = false
    ;(async () => {
      const lres = await api.getList(list.id)
      const version = lres.data?.versions?.[0]
      const vid = version?.id
      if (!vid) return
      const ires = await api.getItems(vid)
      if (cancelled) return
      versionId.current = vid
      setTemplateContent(version?.content ?? starterTemplateContent(list.name))
      setContentRevision(version?.contentRevision ?? 0)
      setLoadedItems(
        (ires.data ?? []).map((i) => ({
          id: i.id,
          name: i.name,
          productId: i.productId,
        }))
      )
    })()
    return () => {
      cancelled = true
    }
  }, [list])

  // Pre-select the products already in the list (matched by id, name for legacy items).
  // Depends on `products` too, so the checkboxes recompute once the catalog finishes
  // loading — it may arrive after the modal opens, which used to leave everything unchecked.
  useEffect(() => {
    const inList = new Set(
      loadedItems.map((i) => productForItem(i)?.id).filter(Boolean)
    )
    setSelected(
      new Set(products.filter((p) => inList.has(p.id)).map((p) => p.id))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedItems, products])

  const filteredProducts = useMemo(() => {
    const q = prodSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) =>
      [p.name, p.sku, p.category].some((v) => v?.toLowerCase().includes(q))
    )
  }, [products, prodSearch])

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  const allShown =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selected.has(p.id))
  const toggleAll = () =>
    setSelected((s) => {
      const n = new Set(s)
      if (filteredProducts.every((p) => n.has(p.id)))
        filteredProducts.forEach((p) => n.delete(p.id))
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

  const goNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) changeStep(2)
  }

  const updateTemplateContent = (patch: Partial<ListContent>) =>
    setTemplateContent((current) => ({
      ...(current ?? starterTemplateContent(list?.name ?? 'Mi lista')),
      ...patch,
    }))

  const updateTemplateHero = (
    key: 'eyebrow' | 'title' | 'body',
    value: string
  ) => {
    const current =
      templateContent ?? starterTemplateContent(list?.name ?? 'Mi lista')
    updateTemplateContent({ hero: { ...current.hero, [key]: value } })
  }

  const updateTemplateField = (
    key: keyof NonNullable<ListContent['template']>,
    value: string
  ) => {
    const current =
      templateContent ?? starterTemplateContent(list?.name ?? 'Mi lista')
    updateTemplateContent({ template: { ...current.template, [key]: value } })
  }

  const uploadTemplateImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !tenant?.id) return
    const response = await api.uploadListTemplateImage(tenant.id, file)
    event.target.value = ''
    if (!response.data) return
    updateTemplateField('image', response.data.url)
  }

  const saveTemplateContent = async () => {
    if (!versionId.current || !templateContent) return
    setSavingTemplateContent(true)
    try {
      const response = await api.updateVersionContent(
        versionId.current,
        templateContent,
        contentRevision
      )
      if (response.data) {
        setTemplateContent(response.data.content)
        setContentRevision(response.data.contentRevision)
      }
    } finally {
      setSavingTemplateContent(false)
    }
  }

  // Add the selected products as items / remove the ones deselected. Membership is
  // keyed off the product id (stable across renames); items store product_id and copy
  // the product's image so the public list shows the real photo, not a category icon.
  const syncItems = async (vid: string) => {
    const chosenIds = new Set(
      products.filter((p) => selected.has(p.id)).map((p) => p.id)
    )
    const representedIds = new Set(
      loadedItems.map((i) => productForItem(i)?.id).filter(Boolean)
    )
    // Create an item for every newly-selected product not already in the list.
    for (const p of products.filter(
      (p) => selected.has(p.id) && !representedIds.has(p.id)
    )) {
      await dispatch(
        createItem({
          versionId: vid,
          data: {
            name: p.name,
            price: parseFloat(p.price) || 0,
            description: p.description || undefined,
            category: p.category || undefined,
            imageUrl: p.imageUrl || undefined,
            imageThumbUrl: p.imageThumbUrl || undefined,
            productId: p.id,
          },
        })
      )
    }
    // Remove items whose product was deselected. Orphan/manual items (no matching
    // product) are left untouched.
    for (const it of loadedItems.filter((i) => {
      const p = productForItem(i)
      return p && !chosenIds.has(p.id)
    })) {
      await dispatch(deleteItem(it.id))
    }
  }

  const finalize = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await dispatch(
          updateList({
            listId: list!.id,
            data: {
              name: name.trim(),
              slug: slug.trim() || undefined,
              published,
              showOnIndex: principal,
              captureViewerInfo,
              kind,
              parentListId: parentListId || null,
              ...appearance,
            },
          })
        )
        if (versionId.current) await syncItems(versionId.current)
      } else if (tenantId) {
        const res = await dispatch(
          createList({ tenantId, name: name.trim(), kind })
        )
        if (createList.fulfilled.match(res) && res.payload) {
          const vid = res.payload.versions?.[0]?.id
          await dispatch(
            updateList({
              listId: res.payload.id,
              data: {
                slug: slug.trim() || undefined,
                published,
                showOnIndex: principal,
                captureViewerInfo,
                ...appearance,
              },
            })
          )
          if (vid) await syncItems(vid)
          trackEvent('Created Price List', {
            kind,
            published,
            is_primary: principal,
            initial_item_count: selected.size,
          })
        }
      }
      if (tenantId) dispatch(fetchLists(tenantId))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const panelWidth =
    step === 2
      ? 'max-w-[560px]'
      : showAppearance || showTemplateContent
        ? 'max-w-[720px]'
        : 'max-w-[440px]'
  const activeTemplateContent =
    templateContent ?? starterTemplateContent(list?.name ?? 'Mi lista')
  const selectedDesign = appearance.design ?? tenant?.listDesign
  const supportsEditorialContent =
    selectedDesign?.startsWith('pencil-') ?? false

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* max-h + scroll: with the appearance block open the panel is taller
          than the viewport, and the footer buttons must stay reachable. */}
      <div
        className={`dash max-h-[90vh] w-full ${panelWidth} animate-scale-in overflow-y-auto rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 font-sans shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)]`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-extrabold text-[var(--dash-text)]">
              {initialCustomize
                ? 'Personalizar lista'
                : step === 1
                  ? editing
                    ? t('pl.wizard.edit')
                    : t('pl.wizard.new')
                  : t('pl.wizard.chooseProducts')}
            </h3>
            <span className="text-xs font-medium text-[var(--dash-muted)]">
              {t('pl.wizard.step', { current: step, total: 2 })}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('pl.close')}
            title={t('pl.close')}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80"
          >
            ✕
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={goNext}>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[var(--dash-text2)]">
                  {t('pl.name')}
                </span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('pl.namePlaceholder')}
                  className={inputCls}
                  required
                />
              </label>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[var(--dash-text2)]">
                  {t('pl.type')}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      k: 'product' as const,
                      icon: 'package' as const,
                      title: t('pl.type.products'),
                      desc: t('pl.type.productsDesc'),
                    },
                    {
                      k: 'service' as const,
                      icon: 'sliders-horizontal' as const,
                      title: t('pl.type.services'),
                      desc: t('pl.type.servicesDesc'),
                    },
                  ].map((o) => {
                    const on = kind === o.k
                    return (
                      <button
                        key={o.k}
                        type="button"
                        onClick={() => setKind(o.k)}
                        className={`flex flex-col gap-1 rounded-xl border p-3 text-left ${on ? 'border-[var(--dash-link)] bg-[var(--dash-soft)]' : 'border-[var(--dash-border)] hover:bg-[var(--dash-soft)]'}`}
                      >
                        <span className="flex items-center gap-2 text-[13px] font-bold text-[var(--dash-text)]">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-lg"
                            style={tone(on ? 'violet' : 'slate')}
                          >
                            <Icon name={o.icon} size={15} />
                          </span>
                          {o.title}
                        </span>
                        <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                          {o.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              {editing && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[var(--dash-text2)]">
                    {t('pl.baseList')}
                  </span>
                  <select
                    value={parentListId}
                    onChange={(event) => setParentListId(event.target.value)}
                    className={inputCls}
                  >
                    <option value="">{t('pl.independentList')}</option>
                    {lists
                      .filter(
                        (candidate) =>
                          candidate.id !== list?.id && !candidate.parentListId
                      )
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name}
                        </option>
                      ))}
                  </select>
                  <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                    {t('pl.baseListDescription')}
                  </span>
                </label>
              )}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[var(--dash-text2)]">
                  {t('pl.slug')}
                </span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder={t('pl.slugPlaceholder')}
                  className={inputCls}
                />
              </label>
              <ToggleRow
                label={t('pl.publish')}
                desc={t('pl.publishDesc')}
                value={published}
                onToggle={() => setPublished((v) => !v)}
              />
              <ToggleRow
                label={t('pl.makeMain')}
                desc={t('pl.makeMainDesc')}
                value={principal}
                onToggle={() => setPrincipal((v) => !v)}
              />
              <ToggleRow
                label={t('list.viewerCapture')}
                desc={t('list.viewerCaptureDesc')}
                value={captureViewerInfo}
                onToggle={() => setCaptureViewerInfo((v) => !v)}
              />

              {/* Appearance overrides, collapsed by default so creating a list
                  stays a two-field job. */}
              <button
                type="button"
                onClick={() => setShowAppearance((v) => !v)}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] p-3.5 text-left hover:bg-[var(--dash-soft)]"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-[var(--dash-text)]">
                    {t('list.appearance.title')}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                    {hasOwnAppearance(appearance)
                      ? t('list.appearance.custom')
                      : t('list.appearance.inherit')}
                  </span>
                </span>
                <Icon
                  name="chevron-down"
                  size={16}
                  className={`shrink-0 text-[var(--dash-muted)] transition-transform ${showAppearance ? 'rotate-180' : ''}`}
                />
              </button>

              {showAppearance && (
                <div className="flex flex-col gap-4">
                  <p className="text-[11px] font-medium text-[var(--dash-muted)]">
                    {t('list.appearance.subtitle')}
                  </p>
                  <ListAppearanceFields
                    t={t}
                    value={appearance}
                    onChange={(patch) =>
                      setAppearance((a) => ({ ...a, ...patch }))
                    }
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

              {editing && (
                <>
                  {!initialCustomize && (
                    <button
                      type="button"
                      onClick={() => setShowTemplateContent((value) => !value)}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] p-3.5 text-left hover:bg-[var(--dash-soft)]"
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-bold text-[var(--dash-text)]">
                          Contenido y tipografía
                        </span>
                        <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                          Textos, imagen y detalles de esta plantilla.
                        </span>
                      </span>
                      <Icon
                        name="chevron-down"
                        size={16}
                        className={`shrink-0 text-[var(--dash-muted)] transition-transform ${showTemplateContent ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}

                  {showTemplateContent && (
                    <div
                      className={`flex flex-col gap-4 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-4 ${initialCustomize ? 'order-first' : ''}`}
                    >
                      {initialCustomize && (
                        <div className="flex items-start justify-between gap-3 border-b border-[var(--dash-border)] pb-4">
                          <div>
                            <p className="text-sm font-bold text-[var(--dash-text)]">
                              Personalizar plantilla
                            </p>
                            <p className="mt-0.5 text-xs font-medium text-[var(--dash-muted)]">
                              Cambios solo para esta lista.
                            </p>
                          </div>
                          <span className="rounded-lg bg-[var(--dash-surface)] px-2 py-1 text-[10px] font-bold text-[var(--dash-link)]">
                            {supportsEditorialContent ? 'EDITORIAL' : 'LISTA'}
                          </span>
                        </div>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <DashField label="Antetítulo">
                          <input
                            value={activeTemplateContent.hero?.eyebrow ?? ''}
                            onChange={(event) =>
                              updateTemplateHero('eyebrow', event.target.value)
                            }
                            className={inputCls}
                            placeholder="NOVEDADES"
                          />
                        </DashField>
                        <DashField label="Título">
                          <input
                            value={activeTemplateContent.hero?.title ?? ''}
                            onChange={(event) =>
                              updateTemplateHero('title', event.target.value)
                            }
                            className={inputCls}
                            placeholder={list?.name}
                          />
                        </DashField>
                        <DashField label="Descripción" wide>
                          <textarea
                            value={activeTemplateContent.hero?.body ?? ''}
                            onChange={(event) =>
                              updateTemplateHero('body', event.target.value)
                            }
                            className={`${inputCls} h-20 py-3`}
                            placeholder="Una breve introducción a la lista."
                          />
                        </DashField>
                        <DashField label="Tipografía">
                          <select
                            value={
                              activeTemplateContent.template?.font ?? 'sans'
                            }
                            onChange={(event) =>
                              updateTemplateField('font', event.target.value)
                            }
                            className={inputCls}
                          >
                            <option value="sans">Sans · moderna</option>
                            <option value="editorial">Editorial · serif</option>
                            <option value="serif">Serif · clásica</option>
                            <option value="mono">Mono · técnica</option>
                            <option value="code-pro">Code Pro</option>
                          </select>
                        </DashField>
                      </div>

                      {supportsEditorialContent && (
                        <div className="grid gap-3 border-t border-[var(--dash-border)] pt-4 sm:grid-cols-2">
                          <DashField label="Imagen editorial" wide>
                            <div className="flex flex-wrap gap-2">
                              <input
                                value={
                                  activeTemplateContent.template?.image ?? ''
                                }
                                onChange={(event) =>
                                  updateTemplateField(
                                    'image',
                                    event.target.value
                                  )
                                }
                                className={`${inputCls} min-w-0 flex-1`}
                                placeholder="https://…"
                              />
                              <label className="flex h-11 cursor-pointer items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-link)] hover:bg-white">
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp,image/gif"
                                  className="sr-only"
                                  onChange={(event) =>
                                    void uploadTemplateImage(event)
                                  }
                                />
                                Subir
                              </label>
                            </div>
                          </DashField>
                          {activeTemplateContent.template?.image && (
                            <img
                              src={activeTemplateContent.template.image}
                              alt="Vista previa"
                              className="h-32 w-full rounded-xl object-cover sm:col-span-2"
                            />
                          )}
                          <DashField label="Etiqueta de imagen">
                            <input
                              value={
                                activeTemplateContent.template?.imageLabel ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'imageLabel',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Título de imagen">
                            <input
                              value={
                                activeTemplateContent.template?.imageTitle ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'imageTitle',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Antetítulo de promoción">
                            <input
                              value={
                                activeTemplateContent.template?.promoEyebrow ??
                                ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'promoEyebrow',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Título de promoción">
                            <input
                              value={
                                activeTemplateContent.template?.promoTitle ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'promoTitle',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Texto de promoción" wide>
                            <textarea
                              value={
                                activeTemplateContent.template?.promoBody ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'promoBody',
                                  event.target.value
                                )
                              }
                              className={`${inputCls} h-20 py-3`}
                            />
                          </DashField>
                          <DashField label="Precio o llamada">
                            <input
                              value={
                                activeTemplateContent.template?.promoPrice ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'promoPrice',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Nota de promoción">
                            <input
                              value={
                                activeTemplateContent.template?.promoNote ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'promoNote',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Pie izquierdo">
                            <input
                              value={
                                activeTemplateContent.template?.footerLeft ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'footerLeft',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Pie derecho">
                            <input
                              value={
                                activeTemplateContent.template?.footerRight ??
                                ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'footerRight',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => void saveTemplateContent()}
                          disabled={savingTemplateContent || !versionId.current}
                          className={`flex h-10 items-center rounded-xl px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${gradient}`}
                        >
                          {savingTemplateContent
                            ? 'Guardando…'
                            : 'Guardar contenido'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
              >
                {t('pl.cancel')}
              </button>
              <button
                type={initialCustomize ? 'button' : 'submit'}
                onClick={initialCustomize ? onClose : undefined}
                className={`flex h-11 items-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white ${gradient}`}
              >
                {initialCustomize ? (
                  'Listo'
                ) : (
                  <>
                    {t('pl.next')} <Icon name="chevron-right" size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <label className="flex h-10 flex-1 items-center gap-2.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/15">
                <Icon
                  name="search"
                  size={16}
                  className="text-[var(--dash-muted)]"
                />
                <input
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  placeholder={t('pl.searchProducts')}
                  className="min-w-0 flex-1 border-0 bg-transparent text-[13px] font-medium text-[var(--dash-text)] outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 placeholder:text-[var(--dash-muted)]"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-link)] hover:bg-[var(--dash-soft)]"
              >
                <Icon name="plus" size={14} /> {t('pl.newProduct')}
              </button>
              {filteredProducts.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="h-10 shrink-0 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
                >
                  {allShown ? t('pl.removeAll') : t('pl.selectAll')}
                </button>
              )}
            </div>

            <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="flex h-32 items-center justify-center px-4 text-center text-sm font-medium text-[var(--dash-muted)]">
                  {products.length === 0
                    ? t('pl.noProducts')
                    : t('pl.noProductResults')}
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const on = selected.has(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleSel(p.id)}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${on ? 'border-[#7C3AED] bg-[var(--dash-soft)]' : 'border-[var(--dash-border)] bg-[var(--dash-surface)] hover:bg-[var(--dash-soft)]'}`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${on ? `border-transparent text-white ${gradient}` : 'border-[#CBD5E1]'}`}
                      >
                        {on && <Icon name="circle-check" size={13} />}
                      </span>
                      {p.imageUrl ? (
                        <img
                          src={p.imageThumbUrl || p.imageUrl}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={tone(catTone(p.category))}
                        >
                          <Icon name={catIcon(p.category)} size={18} />
                        </span>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">
                          {p.name}
                        </span>
                        <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">
                          {p.category || t('pl.noCategory')}
                        </span>
                      </div>
                      <span className="shrink-0 text-[13px] font-extrabold text-[var(--dash-text)]">
                        {formatListPrice(
                          p.price,
                          p.currency,
                          localeOf(tenant?.language)
                        )}
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[var(--dash-muted)]">
                {selected.size === 1
                  ? t('pl.selected', { count: selected.size })
                  : t('pl.selectedPlural', { count: selected.size })}
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => changeStep(1)}
                  className="flex h-11 items-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
                >
                  <Icon name="chevron-left" size={16} /> {t('pl.back')}
                </button>
                <button
                  type="button"
                  onClick={finalize}
                  disabled={saving}
                  className={`flex h-11 items-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}
                >
                  {saving
                    ? t('pl.saving')
                    : editing
                      ? t('pl.saveChanges')
                      : t('pl.create')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {showProductModal && (
        <ProductModal
          product={null}
          tenantId={tenantId}
          lists={lists}
          onCreated={(product) =>
            setSelected((current) => new Set(current).add(product.id))
          }
          onClose={() => setShowProductModal(false)}
        />
      )}
    </div>
  )
}

function ToggleRow({
  label,
  desc,
  value,
  onToggle,
}: {
  label: string
  desc: string
  value: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 py-3">
      <div className="flex flex-col">
        <span className="text-[13px] font-bold text-[var(--dash-text)]">
          {label}
        </span>
        <span className="text-[11px] font-medium text-[var(--dash-muted)]">
          {desc}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-[#10B981]' : 'bg-[var(--dash-border)]'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${value ? 'left-[22px]' : 'left-0.5'}`}
        />
      </button>
    </div>
  )
}

function formatListPrice(
  price: string,
  currency: string,
  locale: string
): string {
  const value = Number(price)
  if (Number.isNaN(value)) return price
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
      value
    )
  }
}

function formatListTimeAgo(iso: string, locale: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (seconds < 60) return formatter.format(0, 'second')
  if (seconds < 3600)
    return formatter.format(-Math.floor(seconds / 60), 'minute')
  if (seconds < 86400)
    return formatter.format(-Math.floor(seconds / 3600), 'hour')
  return formatter.format(-Math.floor(seconds / 86400), 'day')
}

const inputCls =
  'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)]'

export default PriceListsScreen
