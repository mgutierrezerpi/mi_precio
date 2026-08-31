import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectTenant, selectCanEdit } from '../../store/slices/authSlice'
import type { Customer, Product, PublicViewer } from '../../types'
import api from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { localeOf } from '../../lib/i18n'
import { Icon } from './crm/ui'
import { tone, gradient } from './crm/theme'
import { CopyableContact, CustomerModal, CustomerDrawer } from './CustomerComponents'
import { uniqueEmails, relativeTime, useOperationsT, statusOf, statusLabel, copyText, avatarTone, initials, fullDate, statusTone } from './customerUtils'


export function CustomersScreen() {
  const t = useOperationsT()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const currency = tenant?.currency || 'UYU'
  const money = useCallback(
    (v: string | number) =>
      `${currency} ${new Intl.NumberFormat(localeOf(tenant?.language), { maximumFractionDigits: 0 }).format(typeof v === 'number' ? v : parseFloat(v) || 0)}`,
    [currency, tenant?.language]
  )

  const [customers, setCustomers] = useState<Customer[]>([])
  const [viewers, setViewers] = useState<PublicViewer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewersLoading, setViewersLoading] = useState(true)
  const [anonymousDismissals, setAnonymousDismissals] = useState(0)
  const [anonymousLoading, setAnonymousLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()
  const [showNew, setShowNew] = useState(
    () => searchParams.get('new') === '1' && canEdit
  )
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [promotingViewerId, setPromotingViewerId] = useState<string | null>(
    null
  )
  const [viewerError, setViewerError] = useState<string | null>(null)
  const [customerEmailsCopied, setCustomerEmailsCopied] = useState(false)
  const [viewerEmailsCopied, setViewerEmailsCopied] = useState(false)

  const tenantId = tenant?.id
  const refresh = useCallback(async () => {
    if (!tenantId) return
    const cs = await api.getCustomers(tenantId)
    if (cs.data) setCustomers(cs.data)
    setLoading(false)
  }, [tenantId])

  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    Promise.all([
      api.getCustomers(tenantId),
      api.getPublicViewers(tenantId),
      api.getProducts(tenantId),
      api.getPublicViewerStats(tenantId),
    ]).then(([cs, vs, ps, stats]) => {
      if (cancelled) return
      if (cs.data) setCustomers(cs.data)
      if (vs.data) setViewers(vs.data)
      if (ps.data) setProducts(ps.data)
      if (stats.data) setAnonymousDismissals(stats.data.anonymousDismissals)
      setLoading(false)
      setViewersLoading(false)
      setAnonymousLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [tenantId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q
      ? customers.filter((c) =>
          [c.name, c.email, c.phone].some((v) => v?.toLowerCase().includes(q))
        )
      : customers
  }, [customers, search])

  const customerEmailList = useMemo(
    () => uniqueEmails(customers.map((customer) => customer.email)),
    [customers]
  )
  const viewerEmailList = useMemo(
    () => uniqueEmails(viewers.map((viewer) => viewer.email)),
    [viewers]
  )

  const copyEmailList = async (
    emails: string[],
    setCopied: (copied: boolean) => void
  ) => {
    if (!emails.length) return
    if (await copyText(emails.join(', '))) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  const removeCustomer = async (c: Customer) => {
    if (!confirm(t('customers.deleteConfirm', { name: c.name }))) return
    await api.deleteCustomer(c.id)
    if (openId === c.id) setOpenId(null)
    await refresh()
  }

  const promoteViewer = async (viewer: PublicViewer) => {
    if (!tenantId || !canEdit || promotingViewerId) return
    setPromotingViewerId(viewer.id)
    setViewerError(null)
    const res = await api.promotePublicViewer(tenantId, viewer.id)
    if (res.data) {
      setViewers((current) =>
        current.map((item) =>
          item.id === viewer.id ? { ...item, customerId: res.data!.id } : item
        )
      )
      await refresh()
      setOpenId(res.data.id)
    } else {
      setViewerError(t('viewers.promoteError'))
    }
    setPromotingViewerId(null)
  }

  return (
    <CrmLayout
      active={t('customers.title')}
      title={t('customers.title')}
      subtitle={t('customers.subtitle')}
      hideContext
      searchPlaceholder={t('customers.search')}
      searchValue={search}
      onSearchChange={setSearch}
    >
      <main className="flex min-h-full flex-col gap-4 px-4 py-6 md:px-10 md:py-8 xl:min-w-[980px]">
        <section className="flex min-h-[60px] items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">
              {t('customers.title')}
            </h1>
            <p className="text-[13px] text-[#9694A6]">
              {t('customers.subtitle')}
            </p>
          </div>
          {canEdit && (
            <div className="flex shrink-0 items-center gap-2">
              {customerEmailList.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    void copyEmailList(
                      customerEmailList,
                      setCustomerEmailsCopied
                    )
                  }
                  className="flex h-9 items-center gap-1.5 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-[12px] font-bold text-[var(--dash-text2)] shadow-sm transition hover:border-[var(--dash-link)]/40 hover:bg-[var(--dash-soft)] hover:text-[var(--dash-link)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-link)]/30"
                  title={t('customers.copyEmails', {
                    count: customerEmailList.length,
                  })}
                  aria-label={t('customers.copyEmails', {
                    count: customerEmailList.length,
                  })}
                >
                  <Icon
                    name={customerEmailsCopied ? 'circle-check' : 'copy'}
                    size={15}
                  />
                  <span>
                    {customerEmailsCopied
                      ? t('customers.emailsCopied')
                      : t('customers.copyEmails', {
                          count: customerEmailList.length,
                        })}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowNew(true)}
                className={`flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white ${gradient}`}
              >
                <Icon name="plus" size={16} /> {t('customers.new')}
              </button>
            </div>
          )}
        </section>
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
            <div className="flex min-w-[720px] items-center gap-3 bg-[var(--dash-table-head)] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              <span className="flex-1">{t('customers.customer')}</span>
              <span className="w-[150px]">{t('customers.phone')}</span>
              <span className="w-[120px]">{t('customers.lastPurchase')}</span>
              <span className="w-[110px]">{t('customers.total')}</span>
              <span className="w-[90px]">{t('customers.status')}</span>
              <span className="w-[184px] text-right">
                {t('customers.actions')}
              </span>
            </div>

            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">
                {t('customers.loading')}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm font-semibold text-[var(--dash-text)]">
                  {customers.length === 0
                    ? t('customers.empty')
                    : t('customers.noResults')}
                </p>
              </div>
            ) : (
              filtered.map((c, i) => {
                const st = statusOf(c)
                return (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenId(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setOpenId(c.id)
                    }}
                    className={`flex w-full min-w-[720px] cursor-pointer items-center gap-3 bg-[var(--dash-surface)] px-5 py-4 text-left hover:bg-[var(--dash-soft)] ${i > 0 ? 'border-t border-[var(--dash-divider)]' : ''}`}
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={tone(avatarTone(c.name))}
                      >
                        {initials(c.name)}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">
                          {c.name}
                        </span>
                        {c.email ? (
                          <CopyableContact value={c.email} kind="email" />
                        ) : (
                          <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">
                            {t('customers.noEmail')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="w-[150px] text-xs font-medium text-[var(--dash-text2)]">
                      {c.phone ? (
                        <CopyableContact value={c.phone} kind="phone" />
                      ) : (
                        '—'
                      )}
                    </span>
                    <span className="w-[120px] text-xs font-medium text-[var(--dash-muted)]">
                      {relativeTime(c.lastOrderAt, t)}
                    </span>
                    <span className="w-[110px] text-[13px] font-extrabold text-[var(--dash-text)]">
                      {money(c.totalSpent)}
                    </span>
                    <span className="w-[90px]">
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={tone(statusTone[st])}
                      >
                        {statusLabel(st, t)}
                      </span>
                    </span>
                    <div className="flex w-[184px] items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenId(c.id)
                        }}
                        className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-bold"
                        style={tone('violet')}
                      >
                        <Icon name="eye" size={14} /> {t('customers.view')}
                      </button>
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditCustomer(c)
                            }}
                            title={t('customers.editCustomer')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] hover:text-[var(--dash-link)]"
                          >
                            <Icon name="pencil" size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              void removeCustomer(c)
                            }}
                            title={t('customers.deleteCustomer')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--tone-red-bg)] hover:text-[var(--tone-red-fg)]"
                          >
                            <Icon name="circle-x" size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--dash-divider)] px-5 py-4">
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-[var(--dash-text)]">
                {t('viewers.title')}
              </h2>
              <p className="mt-1 text-xs font-medium text-[var(--dash-muted)]">
                {t('viewers.subtitle')}
              </p>
              {viewerError && (
                <p className="mt-2 text-xs font-semibold text-[#EF4444]">
                  {viewerError}
                </p>
              )}
            </div>
            {canEdit && viewerEmailList.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  void copyEmailList(viewerEmailList, setViewerEmailsCopied)
                }
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-[12px] font-bold text-[var(--dash-text2)] shadow-sm transition hover:border-[var(--dash-link)]/40 hover:bg-[var(--dash-soft)] hover:text-[var(--dash-link)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-link)]/30"
                title={t('viewers.copyEmails', {
                  count: viewerEmailList.length,
                })}
                aria-label={t('viewers.copyEmails', {
                  count: viewerEmailList.length,
                })}
              >
                <Icon
                  name={viewerEmailsCopied ? 'circle-check' : 'copy'}
                  size={15}
                />
                <span>
                  {viewerEmailsCopied
                    ? t('customers.emailsCopied')
                    : t('viewers.copyEmails', {
                        count: viewerEmailList.length,
                      })}
                </span>
              </button>
            )}
          </div>
          {viewersLoading ? (
            <div className="flex h-28 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">
              {t('viewers.loading')}
            </div>
          ) : viewers.length === 0 ? (
            <div className="flex h-28 items-center justify-center px-5 text-center text-sm font-medium text-[var(--dash-muted)]">
              {t('viewers.empty')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[820px]">
                <div className="grid grid-cols-[1.2fr_1fr_1.2fr_140px_80px_80px] gap-3 bg-[var(--dash-table-head)] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
                  <span>{t('customers.customer')}</span>
                  <span>
                    {t('customers.phone')} / {t('customers.email')}
                  </span>
                  <span>{t('viewers.list')}</span>
                  <span>{t('viewers.lastSeen')}</span>
                  <span>{t('viewers.views')}</span>
                  <span className="text-right">{t('customers.actions')}</span>
                </div>
                {viewers.map((viewer, index) => (
                  <div
                    key={viewer.id}
                    className={`grid grid-cols-[1.2fr_1fr_1.2fr_140px_80px_80px] items-center gap-3 px-5 py-3.5 text-xs ${index > 0 ? 'border-t border-[var(--dash-divider)]' : ''}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[var(--dash-text)]">
                        {viewer.name}
                      </p>
                      <p className="truncate text-[11px] font-medium text-[var(--dash-muted)]">
                        {fullDate(viewer.createdAt, localeOf(tenant?.language))}
                      </p>
                    </div>
                    <div className="flex min-w-0 flex-col items-start gap-0.5 font-medium text-[var(--dash-text2)]">
                      {viewer.email && (
                        <CopyableContact value={viewer.email} kind="email" />
                      )}
                      {viewer.phone && (
                        <CopyableContact value={viewer.phone} kind="phone" />
                      )}
                      {!viewer.email && !viewer.phone && (
                        <span className="truncate">
                          {t('viewers.noContact')}
                        </span>
                      )}
                      {viewer.ipAddress && (
                        <p className="truncate text-[10px] font-medium text-[var(--dash-muted)]">
                          {t('viewers.ip')}: {viewer.ipAddress}
                        </p>
                      )}
                    </div>
                    <div className="min-w-0 truncate font-semibold text-[var(--dash-text2)]">
                      {viewer.listName}
                    </div>
                    <div className="text-[var(--dash-muted)]">
                      {fullDate(viewer.lastSeenAt, localeOf(tenant?.language))}
                    </div>
                    <div className="font-bold text-[var(--dash-text2)]">
                      {viewer.viewCount}
                    </div>
                    <div className="flex justify-end">
                      {viewer.customerId ? (
                        <button
                          type="button"
                          onClick={() => setOpenId(viewer.customerId!)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--tone-green-fg)]/15 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tone-green-fg)]/30"
                          style={tone('green')}
                          title={t('viewers.viewCustomer')}
                          aria-label={t('viewers.viewCustomer')}
                        >
                          <Icon name="circle-check" size={16} />
                        </button>
                      ) : canEdit ? (
                        <button
                          type="button"
                          onClick={() => void promoteViewer(viewer)}
                          disabled={promotingViewerId !== null}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]/60 disabled:cursor-wait disabled:opacity-60 ${promotingViewerId === viewer.id ? 'animate-pulse' : ''} ${gradient}`}
                          aria-busy={promotingViewerId === viewer.id}
                          title={
                            promotingViewerId === viewer.id
                              ? t('viewers.promoting')
                              : t('viewers.promote')
                          }
                          aria-label={
                            promotingViewerId === viewer.id
                              ? t('viewers.promoting')
                              : t('viewers.promote')
                          }
                        >
                          <Icon name="user-plus" size={16} />
                        </button>
                      ) : (
                        <span className="text-[11px] text-[var(--dash-muted)]">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--dash-divider)] px-5 py-4">
            <div>
              <h2 className="text-base font-extrabold text-[var(--dash-text)]">
                {t('anonymous.title')}
              </h2>
              <p className="mt-1 text-xs font-medium text-[var(--dash-muted)]">
                {t('anonymous.subtitle')}
              </p>
            </div>
            <div className="flex h-14 min-w-20 flex-col items-center justify-center rounded-xl bg-[var(--dash-soft)] px-4">
              {anonymousLoading ? (
                <span className="text-sm font-bold text-[var(--dash-muted)]">
                  …
                </span>
              ) : (
                <span className="text-2xl font-black leading-none text-[var(--dash-text)]">
                  {anonymousDismissals}
                </span>
              )}
              <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
                {t('anonymous.countLabel')}
              </span>
            </div>
          </div>
        </section>
      </main>

      {showNew && tenant?.id && (
        <CustomerModal
          tenantId={tenant.id}
          onClose={() => setShowNew(false)}
          onSaved={(id) => {
            setShowNew(false)
            void refresh()
            setOpenId(id)
          }}
        />
      )}
      {editCustomer && (
        <CustomerModal
          customer={editCustomer}
          onClose={() => setEditCustomer(null)}
          onSaved={() => {
            setEditCustomer(null)
            void refresh()
          }}
        />
      )}
      {openId && (
        <CustomerDrawer
          customerId={openId}
          products={products}
          money={money}
          canEdit={canEdit}
          onClose={() => setOpenId(null)}
          onChanged={refresh}
        />
      )}
    </CrmLayout>
  )
}

export default CustomersScreen
