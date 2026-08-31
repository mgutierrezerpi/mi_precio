import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant, selectCanEdit } from '../../store/slices/authSlice'
import {
  fetchLists,
  updateList,
  deleteList,
  selectLists,
  selectIsLoading,
} from '../../store/slices/menuSlice'
import { fetchProducts, selectProducts } from '../../store/slices/productsSlice'
import type { Customer, PriceList } from '../../types'
import api from '../../services/api'
import { useT } from '../../lib/i18n'
import { CrmLayout } from './crm/CrmLayout'
import { VariantModal, QrModal } from './PriceListsModals'
import { ListRow, variantDetail } from './PriceListRows'
import { ListModal } from './PriceListEditorModal'
export { QrModal } from './PriceListsModals'
import { Icon } from './crm/ui'
import { tone, gradient } from './crm/theme'
import { QR_COLOR_STORAGE_PREFIX } from '../../lib/qrRender'
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

export default PriceListsScreen
