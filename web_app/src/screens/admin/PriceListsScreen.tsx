import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
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
  Item,
  PriceList,
  PriceListVariantType,
  Product,
} from '../../types'
import api from '../../services/api'
import { localeOf, useT } from '../../lib/i18n'
import { DICT } from '../../lib/i18nDictionary'
import { DICT_LISTS } from '../../lib/i18nDictionaryLists'
import {
  ListAppearanceFields,
  hasOwnAppearance,
  type ListAppearance,
} from '../../components/appearance/ListAppearanceFields'
import { CrmLayout } from './crm/CrmLayout'
import { ProductModal } from './ProductsScreen'
import { Icon, type IconName } from './crm/ui'
import { QrCode } from './crm/QrCode'
import { tone, gradient } from './crm/theme'
import { catTone, catIcon } from './crm/productFormat'
import {
  QR_COLOR_STORAGE_PREFIX,
  DEFAULT_QR_COLOR,
  downloadQrPng,
  downloadQrSvg,
} from '../../lib/qrRender'
import { trackEvent } from '../../lib/analytics'

type Tab = 'all' | 'active' | 'inactive' | 'offline'

Object.assign(DICT, DICT_LISTS)

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
/** The list's own public page, which captures itself into a PDF on arrival.
 *  Exporting does not redraw the list anywhere — the sheet is the design. */
const pdfExportUrl = (sub: string | undefined, l: PriceList) =>
  `${publicUrl(sub, l)}?pdf=1`
const qrFileName = (l: PriceList) =>
  (l.slug || l.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || l.id

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
  const [qrColor, setQrColor] = useState(DEFAULT_QR_COLOR)
  const [variantParent, setVariantParent] = useState<PriceList | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const editId = searchParams.get('edit')
  const newList = searchParams.get('new') === '1'

  useEffect(() => {
    if (tenant?.id) {
      dispatch(fetchLists(tenant.id))
      dispatch(fetchProducts(tenant.id))
      const savedColor = localStorage.getItem(
        `${QR_COLOR_STORAGE_PREFIX}${tenant.id}`
      )
      if (savedColor) setQrColor(savedColor)
    }
  }, [dispatch, tenant?.id])

  useEffect(() => {
    if (!tenant?.id) return
    void api.getCustomers(tenant.id).then((response) =>
      setCustomers(response.data ?? [])
    )
  }, [tenant?.id])

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
    if (
      window.confirm(
        t('pl.deleteConfirm', { name: l.name })
      )
    )
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
      ? [{ key: 'offline' as Tab, label: 'Fuera de línea', count: counts.offline }]
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
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--tone-red-fg)]/25 p-4 sm:flex-row sm:items-center sm:justify-between" style={tone('red')}>
            <div className="flex items-start gap-3">
              <Icon name="alert-triangle" size={18} className="mt-0.5 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-bold">
                  {counts.offline === 1
                    ? 'Una de tus listas publicadas no se está viendo'
                    : `${counts.offline} de tus listas publicadas no se están viendo`}
                </p>
                <p className="text-xs font-medium opacity-80">
                  Tu plan permite {counts.active} {counts.active === 1 ? 'lista publicada' : 'listas publicadas'}. Quien abra su link o escanee su QR no va a ver nada. No se borró nada: subí de plan y vuelven solas, tal como estaban.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              className="h-10 shrink-0 rounded-full bg-[var(--tone-red-fg)] px-4 text-xs font-bold text-[var(--dash-surface)]"
            >
              Ver planes
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
          <div className="overflow-x-auto rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
            <div className="flex min-w-[680px] items-center gap-3 bg-[var(--dash-table-head)] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              <span className="flex-1">{t('pl.column.list')}</span>
              <span className="w-[100px]">{t('pl.column.products')}</span>
              <span className="w-[110px]">{t('pl.column.status')}</span>
              <span className="w-[110px]">{t('pl.column.updated')}</span>
              <span className="w-[144px]" />
            </div>
            {filtered.map((l, i) => (
              <Fragment key={l.id}>
              <ListRow
                list={l}
                canEdit={canEdit}
                first={i === 0}
                onEdit={() => {
                  setModal({ open: true, list: l })
                  setSearchParams({ edit: l.id })
                }}
                onTogglePublished={() => togglePublished(l)}
                onTogglePrincipal={() => togglePrincipal(l)}
                onDelete={() => handleDelete(l)}
                onCopy={() => copyLink(l)}
                onQr={() => setQr(l)}
                onOpen={() =>
                  window.open(publicUrl(tenant?.subdomain, l), '_blank')
                }
                onReports={() => navigate(`/admin/reportes?list=${l.id}`)}
                onExportPdf={() =>
                  window.open(pdfExportUrl(tenant?.subdomain, l), '_blank')
                }
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
                      customers.find((customer) => customer.id === variant.customerId)
                    )}
                    onEdit={() => {
                      setModal({ open: true, list: variant })
                      setSearchParams({ edit: variant.id })
                    }}
                    onTogglePublished={() => togglePublished(variant)}
                    onTogglePrincipal={() => undefined}
                    onDelete={() => handleDelete(variant)}
                    onCopy={() => copyLink(variant)}
                    onQr={() => setQr(variant)}
                    onOpen={() =>
                      window.open(publicUrl(tenant?.subdomain, variant), '_blank')
                    }
                    onReports={() => navigate(`/admin/reportes?list=${variant.id}`)}
                    onExportPdf={() =>
                      window.open(pdfExportUrl(tenant?.subdomain, variant), '_blank')
                    }
                  />
                ))}
              </Fragment>
            ))}
          </div>
        )}
      </main>

      {modal.open && (
        <ListModal
          key={modal.list?.id ?? 'new'}
          list={modal.list}
          initialStep={searchParams.get('step') === '2' ? 2 : 1}
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
  onTogglePublished,
  onTogglePrincipal,
  onDelete,
  onCopy,
  onQr,
  onOpen,
  onReports,
  onCreateVariant,
  onExportPdf,
  variant = false,
  variantDetail,
}: {
  list: PriceList
  canEdit: boolean
  first?: boolean
  onEdit: () => void
  onTogglePublished: () => void
  onTogglePrincipal: () => void
  onDelete: () => void
  onCopy: () => void
  onQr: () => void
  onOpen: () => void
  onReports: () => void
  onCreateVariant?: () => void
  onExportPdf?: () => void
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
      className={`flex min-w-[680px] items-center gap-3 px-5 ${variant ? 'bg-[var(--dash-soft)] py-3' : 'bg-[var(--dash-surface)] py-4'} ${!first ? 'border-t border-[var(--dash-divider)]' : ''}`}
    >
      <div className={`relative flex min-w-0 flex-1 items-center gap-3 ${variant ? 'pl-12' : ''}`}>
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
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h4 className={`min-w-0 whitespace-normal break-words font-bold leading-snug text-[var(--dash-text)] ${variant ? 'text-[14px]' : 'text-base'}`}>
              {list.name}
            </h4>
            {variant ? (
              <span className="rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--dash-text2)]">
                {variantLabel(list)}
              </span>
            ) : list.showOnIndex && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={tone('violet')}
              >
                {t('pl.main')}
              </span>
            )}
          </div>
          {variant && variantDetail && variantDetail !== variantLabel(list) && (
            <span className="text-[11px] font-medium text-[var(--dash-muted)]">
              {variantDetail}
            </span>
          )}
        </div>
      </div>

      <span className={`w-[100px] font-semibold text-[var(--dash-text2)] ${variant ? 'text-xs' : 'text-sm'}`}>
        {list.itemCount}
      </span>
      <span className="w-[110px]">
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold"
          style={tone(list.published && list.live ? 'green' : list.published ? 'red' : 'amber')}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />{' '}
          {list.published && !list.live
            ? 'Fuera de línea'
            : list.published
              ? t('pl.status.active')
              : t('pl.status.draft')}
        </span>
      </span>
      <span className="w-[110px] text-xs font-medium text-[var(--dash-muted)]">
        {formatListTimeAgo(list.updatedAt, localeOf(tenant?.language))}
      </span>

      <div className="flex w-[144px] shrink-0 items-center justify-end gap-1.5">
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
            onTogglePublished={onTogglePublished}
            onTogglePrincipal={onTogglePrincipal}
            onDelete={onDelete}
            onCreateVariant={onCreateVariant}
            isVariant={variant}
            onReports={onReports}
            onExportPdf={onExportPdf}
          />
        )}
      </div>
    </div>
  )
}

function RowMenu({
  list,
  onEdit,
  onTogglePublished,
  onTogglePrincipal,
  onDelete,
  onCreateVariant,
  isVariant = false,
  onReports,
  onExportPdf,
}: {
  list: PriceList
  onEdit: () => void
  onTogglePublished: () => void
  onTogglePrincipal: () => void
  onDelete: () => void
  onCreateVariant?: () => void
  isVariant?: boolean
  onReports: () => void
  onExportPdf?: () => void
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  // Rough menu height, used to flip it above the button when it would fall off
  // the viewport. Keep in step with the items rendered below.
  const H = (isVariant ? 180 : 230) + (list.published && list.live ? 34 : 0)

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
            {!isVariant && onCreateVariant && (
              <MenuItemBtn
                icon="list-plus"
                label="Crear lista especial"
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
            {/* Exporting prints the real public page, so it is only offered for
                a list the plan actually serves — there is nothing to render
                for a draft or an offline one. */}
            {list.published && list.live && onExportPdf && (
              <MenuItemBtn
                icon="file-spreadsheet"
                label={t('pl.menu.exportPdf')}
                onClick={act(onExportPdf)}
              />
            )}
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

function variantLabel(list: PriceList): string {
  if (list.variantType === 'customer') return 'Cliente'
  if (list.variantType === 'promotion') return 'Promoción'
  if (list.variantType === 'seasonal') return 'Temporada'
  return 'Especial'
}

function variantDetail(list: PriceList, customer?: Customer): string {
  const audience = customer
    ? `Cliente · ${customer.name}`
    : variantLabel(list)
  const date = list.startsAt
    ? ` · desde ${new Date(list.startsAt).toLocaleDateString()}`
    : ''
  const end = list.endsAt
    ? ` hasta ${new Date(list.endsAt).toLocaleDateString()}`
    : ''
  return `${audience}${date}${end}`
}

function dateTimeInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function scheduledDate(daysFromNow: number, hour = 9): Date {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hour, 0, 0, 0)
  return date
}

function VariantModal({
  parent,
  tenantId,
  onClose,
}: {
  parent: PriceList
  tenantId: string
  onClose: () => void
}) {
  const dispatch = useAppDispatch()
  const [name, setName] = useState(`${parent.name} — `)
  const [variantType, setVariantType] =
    useState<PriceListVariantType>('customer')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sourceItems, setSourceItems] = useState<Item[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [showPriceAdjustment, setShowPriceAdjustment] = useState(false)
  const [adjustmentKind, setAdjustmentKind] = useState<'discount' | 'surcharge'>('discount')
  const [adjustmentPercent, setAdjustmentPercent] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)
  const [showCustomSchedule, setShowCustomSchedule] = useState(false)
  const [saving, setSaving] = useState(false)
  const shortcutClass =
    'rounded-lg border border-[var(--dash-border)] px-2.5 py-1 text-[11px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'

  const setStart = (date: Date) => setStartsAt(dateTimeInputValue(date))
  const setEndAfter = (days: number) => {
    const date = startsAt ? new Date(startsAt) : new Date()
    date.setDate(date.getDate() + days)
    setEndsAt(dateTimeInputValue(date))
  }
  const setNextMonday = () => {
    const today = new Date()
    const days = ((8 - today.getDay()) % 7) || 7
    setStart(scheduledDate(days))
  }

  useEffect(() => {
    void api.getCustomers(tenantId).then((response) =>
      setCustomers(response.data ?? [])
    )
  }, [tenantId])

  useEffect(() => {
    let cancelled = false
    void api.getList(parent.id).then(async (response) => {
      const sourceVersion = response.data?.versions
        ?.slice()
        .sort(
          (a, b) =>
            Number(b.published) - Number(a.published) ||
            b.versionNumber - a.versionNumber
        )[0]
      if (!sourceVersion) return
      const items = await api.getItems(sourceVersion.id)
      if (!cancelled) setSourceItems(items.data ?? [])
    })
    return () => {
      cancelled = true
    }
  }, [parent.id])

  const toggleItem = (id: string) =>
    setSelectedItemIds((selected) => {
      const next = new Set(selected)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAllItems = () =>
    setSelectedItemIds((selected) =>
      selected.size === sourceItems.length
        ? new Set()
        : new Set(sourceItems.map((item) => item.id))
    )

  const applyPriceAdjustment = async (variant: PriceList) => {
    const percent = Number(adjustmentPercent)
    if (!Number.isFinite(percent) || percent <= 0 || selectedItemIds.size === 0)
      return
    const versionId = variant.versions?.[0]?.id
    if (!versionId) return
    const variantItems = await api.getItems(versionId)
    const sourceByKey = new Map(
      sourceItems
        .filter((item) => selectedItemIds.has(item.id))
        .map((item) => [item.productId || `name:${item.name}`, item])
    )
    const factor = adjustmentKind === 'discount' ? 1 - percent / 100 : 1 + percent / 100
    await Promise.all(
      (variantItems.data ?? []).flatMap((item) => {
        const source = sourceByKey.get(item.productId || `name:${item.name}`)
        if (!source) return []
        const price = Math.max(0, Math.round(Number(source.price) * factor * 100) / 100)
        return [api.updateItem(item.id, { price })]
      })
    )
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const result = await dispatch(
        createList({
          tenantId,
          name: name.trim(),
          kind: parent.kind,
          variant: {
            parentListId: parent.id,
            variantType,
            customerId: variantType === 'customer' ? customerId || undefined : undefined,
            startsAt: startsAt || undefined,
            endsAt: endsAt || undefined,
          },
        })
      )
      if (createList.fulfilled.match(result) && result.payload) {
        await applyPriceAdjustment(result.payload)
        onClose()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form
        onSubmit={submit}
        className="dash flex w-full max-w-[440px] flex-col gap-4 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 font-sans shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-[var(--dash-text)]">
              Crear lista especial
            </h3>
            <p className="mt-1 text-xs font-medium text-[var(--dash-muted)]">
              Parte de “{parent.name}” y conserva una copia independiente de sus precios.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[var(--dash-text2)]">Nombre</span>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputCls}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[var(--dash-text2)]">Propósito</span>
          <select
            value={variantType}
            onChange={(event) =>
              setVariantType(event.target.value as PriceListVariantType)
            }
            className={inputCls}
          >
            <option value="customer">Precios para un cliente</option>
            <option value="promotion">Promoción</option>
            <option value="seasonal">Lista de temporada</option>
            <option value="custom">Lista especial</option>
          </select>
        </label>

        {variantType === 'customer' && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--dash-text2)]">Cliente</span>
            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className={inputCls}
            >
              <option value="">Seleccionar después</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {showPriceAdjustment ? (
          <div className="flex flex-col gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[var(--dash-text2)]">Ajustar precios</p>
                <p className="text-[11px] font-medium text-[var(--dash-muted)]">Solo cambia los productos elegidos en esta lista especial.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPriceAdjustment(false)
                  setSelectedItemIds(new Set())
                  setAdjustmentPercent('')
                }}
                className="text-[11px] font-bold text-[var(--dash-link)] hover:underline"
              >
                Quitar
              </button>
            </div>
            <div className="flex gap-2">
              <select
                value={adjustmentKind}
                onChange={(event) =>
                  setAdjustmentKind(event.target.value as 'discount' | 'surcharge')
                }
                className={`${inputCls} flex-1`}
              >
                <option value="discount">Descuento</option>
                <option value="surcharge">Recargo</option>
              </select>
              <label className="relative w-28">
                <input
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={adjustmentPercent}
                  onChange={(event) => setAdjustmentPercent(event.target.value)}
                  placeholder="10"
                  className={`${inputCls} pr-7`}
                />
                <span className="absolute right-3 top-3 text-sm font-bold text-[var(--dash-muted)]">%</span>
              </label>
            </div>
            {sourceItems.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={toggleAllItems}
                  className="self-start text-[11px] font-bold text-[var(--dash-link)] hover:underline"
                >
                  {selectedItemIds.size === sourceItems.length
                    ? 'Quitar todos'
                    : 'Seleccionar todos'}
                </button>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)]">
                  {sourceItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-center gap-2 border-b border-[var(--dash-divider)] px-3 py-2 last:border-0 hover:bg-[var(--dash-soft)]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItemIds.has(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="rounded border-[var(--dash-border)] text-[#7C3AED]"
                      />
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--dash-text)]">{item.name}</span>
                      <span className="text-xs font-medium text-[var(--dash-muted)]">{item.currency} {item.price}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs font-medium text-[var(--dash-muted)]">Cargando productos de la lista…</p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowPriceAdjustment(true)}
            className="flex w-full items-center justify-between rounded-xl border border-dashed border-[var(--dash-border)] px-3.5 py-3 text-left hover:bg-[var(--dash-soft)]"
          >
            <span className="text-sm font-bold text-[var(--dash-text2)]">Ajustar precios</span>
            <span className="text-xs font-medium text-[var(--dash-muted)]">Descuento o recargo</span>
          </button>
        )}

        {showSchedule ? (
          <>
            <div className="flex flex-col gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[var(--dash-text2)]">Programación</span>
                <button
                  type="button"
                  onClick={() => {
                    setStartsAt('')
                    setEndsAt('')
                    setShowCustomSchedule(false)
                    setShowSchedule(false)
                  }}
                  className="text-[11px] font-bold text-[var(--dash-link)] hover:underline"
                >
                  Sin fechas
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="self-center text-[11px] font-medium text-[var(--dash-muted)]">Empieza:</span>
                <button type="button" onClick={() => setStart(new Date())} className={shortcutClass}>Ahora</button>
                <button type="button" onClick={() => setStart(scheduledDate(1))} className={shortcutClass}>Mañana 9:00</button>
                <button type="button" onClick={setNextMonday} className={shortcutClass}>Próximo lunes</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="self-center text-[11px] font-medium text-[var(--dash-muted)]">Termina:</span>
                <button type="button" onClick={() => setEndAfter(1)} className={shortcutClass}>En 1 día</button>
                <button type="button" onClick={() => setEndAfter(7)} className={shortcutClass}>En 1 semana</button>
                <button type="button" onClick={() => setEndAfter(30)} className={shortcutClass}>En 1 mes</button>
                <button type="button" onClick={() => setEndsAt('')} className={shortcutClass}>Sin vencimiento</button>
                <button
                  type="button"
                  onClick={() => setShowCustomSchedule(true)}
                  className={shortcutClass}
                >
                  Personalizar
                </button>
              </div>
            </div>

            {showCustomSchedule && (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[var(--dash-text2)]">Desde</span>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(event) => setStartsAt(event.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[var(--dash-text2)]">Hasta</span>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    min={startsAt || undefined}
                    onChange={(event) => setEndsAt(event.target.value)}
                    className={inputCls}
                  />
                </label>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowSchedule(true)}
            className="flex w-full items-center justify-between rounded-xl border border-dashed border-[var(--dash-border)] px-3.5 py-3 text-left hover:bg-[var(--dash-soft)]"
          >
            <span className="text-sm font-bold text-[var(--dash-text2)]">Agregar período</span>
            <span className="text-xs font-medium text-[var(--dash-muted)]">Opcional</span>
          </button>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-xl px-4 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}
          >
            <Icon name="list-plus" size={16} /> {saving ? 'Creando…' : 'Crear variante'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── QR modal ────────────────────────────────────────────────────── */
export function QrModal({
  list,
  url,
  linkUrl,
  qrValue,
  fg,
  logoUrl,
  onClose,
}: {
  list: PriceList
  url: string
  linkUrl: string
  qrValue: string
  fg: string
  logoUrl: string
  onClose: () => void
}) {
  const t = useT()
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="dash relative flex w-full max-w-[360px] animate-scale-in flex-col items-center gap-4 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-7 text-center font-sans shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)]">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('pl.close')}
          title={t('pl.close')}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-lg leading-none text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] hover:text-[var(--dash-text)]"
        >
          ×
        </button>
        <h3 className="text-lg font-extrabold text-[var(--dash-text)]">
          {list.name}
        </h3>
        <div className="h-52 w-52 rounded-2xl bg-white p-3 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.3)]">
          <QrCode
            value={qrValue}
            size={180}
            margin={2}
            fg={fg}
            logoUrl={logoUrl}
            className="!h-full !w-full object-contain"
          />
        </div>
        <a
          href={linkUrl}
          className="text-xs font-semibold text-[var(--dash-link)] underline-offset-2 hover:underline"
        >
          {url}
        </a>
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={() =>
              void downloadQrPng(qrValue, `qr-${qrFileName(list)}.png`, {
                fg,
                logoUrl,
              })
            }
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}
          >
            <Icon name="download" size={14} /> PNG
          </button>
          <button
            type="button"
            onClick={() =>
              downloadQrSvg(qrValue, `qr-${qrFileName(list)}.svg`, { fg })
            }
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
          >
            <Icon name="download" size={14} /> SVG
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Create wizard / edit modal ──────────────────────────────────── */
function ListModal({
  list,
  initialStep,
  tenantId,
  products,
  lists,
  onClose,
}: {
  list: PriceList | null
  initialStep: 1 | 2
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
      const vid = lres.data?.versions?.[0]?.id
      if (!vid) return
      const ires = await api.getItems(vid)
      if (cancelled) return
      versionId.current = vid
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
  }, [list?.id])

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
      : showAppearance
        ? 'max-w-[720px]'
        : 'max-w-[440px]'

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
              {step === 1
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
                    Lista base
                  </span>
                  <select
                    value={parentListId}
                    onChange={(event) => setParentListId(event.target.value)}
                    className={inputCls}
                  >
                    <option value="">Lista independiente</option>
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
                    Seleccioná una lista base para mostrar esta lista como una variante anidada.
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
                type="submit"
                className={`flex h-11 items-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white ${gradient}`}
              >
                {t('pl.next')} <Icon name="chevron-right" size={16} />
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

function formatListPrice(price: string, currency: string, locale: string): string {
  const value = Number(price)
  if (Number.isNaN(value)) return price
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
  }
}

function formatListTimeAgo(iso: string, locale: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (seconds < 60) return formatter.format(0, 'second')
  if (seconds < 3600) return formatter.format(-Math.floor(seconds / 60), 'minute')
  if (seconds < 86400) return formatter.format(-Math.floor(seconds / 3600), 'hour')
  return formatter.format(-Math.floor(seconds / 86400), 'day')
}

const inputCls =
  'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)]'

export default PriceListsScreen
