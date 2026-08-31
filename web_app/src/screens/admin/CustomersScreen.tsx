import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectTenant, selectCanEdit } from '../../store/slices/authSlice'
import type { Customer, Order, Product, PublicViewer } from '../../types'
import api from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { tone, gradient, type Tone } from './crm/theme'
import { localeOf, normalizeLang, useT } from '../../lib/i18n'
import { DICT_OPERATIONS } from '../../lib/i18nDictionaryOperations'

function useOperationsT() {
  const fallbackT = useT()
  const language = useAppSelector(selectTenant)?.language
  const lang = normalizeLang(language)
  return (key: string, vars?: Record<string, string | number>) => {
    let value = DICT_OPERATIONS[key]?.[lang] ?? fallbackT(key, vars)
    if (vars)
      for (const [name, variable] of Object.entries(vars))
        value = value.replaceAll(`{${name}}`, String(variable))
    return value
  }
}

type Status = 'Activo' | 'Inactivo' | 'Nuevo'
const statusTone: Record<Status, Tone> = {
  Activo: 'green',
  Inactivo: 'slate',
  Nuevo: 'violet',
}

const TONE_POOL: Tone[] = [
  'violet',
  'sky',
  'blue',
  'green',
  'amber',
  'rose',
  'purple',
]
function avatarTone(name: string): Tone {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return TONE_POOL[h % TONE_POOL.length]
}
const initials = (n: string) =>
  n
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?'

function uniqueEmails(values: Array<string | null | undefined>): string[] {
  const unique = new Set<string>()
  for (const email of values) {
    const normalized = email?.trim().toLowerCase()
    if (normalized) unique.add(normalized)
  }
  return Array.from(unique)
}

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

// Backend stores naive UTC; tag as UTC so the browser converts to the right local time.
function parseUtc(iso?: string | null): Date | null {
  if (!iso) return null
  const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso)
  const d = new Date(hasTz ? iso : `${iso}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}
function relativeTime(
  iso: string | null | undefined,
  t: (key: string, vars?: Record<string, string | number>) => string
): string {
  const d = parseUtc(iso)
  if (!d) return t('time.noPurchases')
  const s = (Date.now() - d.getTime()) / 1000
  if (s < 60) return t('time.justNow')
  if (s < 3600) return t('time.minutesAgo', { count: Math.floor(s / 60) })
  if (s < 86400) return t('time.hoursAgo', { count: Math.floor(s / 3600) })
  const days = Math.floor(s / 86400)
  if (days < 2) return t('time.yesterday')
  if (days < 30) return t('time.daysAgo', { count: days })
  if (days < 60) return t('time.oneMonthAgo')
  return t('time.monthsAgo', { count: Math.floor(days / 30) })
}
function fullDate(iso: string | null | undefined, locale = localeOf()): string {
  const d = parseUtc(iso)
  return d
    ? d.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—'
}

function statusOf(c: Customer): Status {
  if (c.ordersCount === 0) return 'Nuevo'
  const last = parseUtc(c.lastOrderAt)
  if (last && (Date.now() - last.getTime()) / 86400000 <= 30) return 'Activo'
  return 'Inactivo'
}
function statusLabel(status: Status, t: (key: string) => string) {
  return t(`status.${status.toLowerCase()}`)
}

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

function CopyableContact({
  value,
  kind,
}: {
  value: string
  kind: 'email' | 'phone'
}) {
  const t = useOperationsT()
  const [copied, setCopied] = useState(false)
  const copy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (await copyText(value)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    }
  }
  const label =
    kind === 'email' ? t('contacts.copyEmail') : t('contacts.copyPhone')
  return (
    <button
      type="button"
      onClick={(event) => void copy(event)}
      title={copied ? t('contacts.copied') : label}
      aria-label={copied ? t('contacts.copied') : label}
      className="group flex min-w-0 max-w-full items-center gap-1 text-left text-xs font-medium text-[var(--dash-text2)] transition hover:text-[var(--dash-link)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-link)]/30"
    >
      <span className="truncate">{value}</span>
      <span className="shrink-0 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        <Icon name={copied ? 'circle-check' : 'copy'} size={12} />
      </span>
    </button>
  )
}

/* ── New customer modal ─────────────────────────────────────────────── */
function CustomerModal({
  tenantId,
  customer,
  onClose,
  onSaved,
}: {
  tenantId?: string
  customer?: Customer
  onClose: () => void
  onSaved: (id: string) => void
}) {
  const t = useOperationsT()
  const isEdit = !!customer
  const [name, setName] = useState(customer?.name ?? '')
  const [rut, setRut] = useState(customer?.rut ?? '')
  const [email, setEmail] = useState(customer?.email ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? '')
  const [notes, setNotes] = useState(customer?.notes ?? '')
  const [saving, setSaving] = useState(false)

  // Only the name is required. Email and phone are optional, but if an email is
  // entered it must be a valid shape (keeps out values like "correo-sin-arroba").
  const emailError =
    email.trim() !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
  const valid = name.trim() !== '' && !emailError

  const save = async () => {
    if (!valid || saving) return
    setSaving(true)
    const body = {
      name: name.trim(),
      rut: rut.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      notes: notes.trim() || null,
    }
    const res = isEdit
      ? await api.updateCustomer(customer.id, body)
      : await api.createCustomer(tenantId!, body)
    setSaving(false)
    if (res.data) onSaved(res.data.id)
  }

  return (
    <Overlay onClose={onClose}>
      <div
        className="w-full max-w-[440px] rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-extrabold text-[var(--dash-text)]">
          {isEdit ? t('customers.editCustomer') : t('customers.new')}
        </h3>
        <CustomerFormFields
          email={email}
          emailError={emailError}
          name={name}
          notes={notes}
          onEmailChange={setEmail}
          onNameChange={setName}
          onNotesChange={setNotes}
          onPhoneChange={setPhone}
          onRutChange={setRut}
          phone={phone}
          rut={rut}
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl px-4 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!valid || saving}
            className={`h-10 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-50 ${gradient}`}
          >
            {saving
              ? t('common.saving')
              : isEdit
                ? t('common.saveChanges')
                : t('customers.create')}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

function CustomerFormFields({
  email,
  emailError,
  name,
  notes,
  onEmailChange,
  onNameChange,
  onNotesChange,
  onPhoneChange,
  onRutChange,
  phone,
  rut,
}: {
  email: string
  emailError: boolean
  name: string
  notes: string
  onEmailChange: (value: string) => void
  onNameChange: (value: string) => void
  onNotesChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onRutChange: (value: string) => void
  phone: string
  rut: string
}) {
  const t = useOperationsT()
  return (
    <div className="mt-4 flex flex-col gap-3">
      <Field label={t('customers.name')}>
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
          className={inputCls}
          placeholder={t('customers.namePlaceholder')}
        />
      </Field>
      <Field label={t('customers.rut')}>
        <input
          value={rut}
          onChange={(e) => onRutChange(e.target.value)}
          className={inputCls}
          placeholder="21 123456 0017"
        />
      </Field>
      <Field label={t('customers.email')}>
        <input
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          type="email"
          className={inputCls}
          placeholder="lucia@correo.com"
          aria-invalid={emailError}
        />
        {emailError && (
          <p className="mt-1 text-xs font-semibold text-[#EF4444]">
            {t('customers.invalidEmail')}
          </p>
        )}
      </Field>
      <Field label={t('customers.phoneOptional')}>
        <input
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className={inputCls}
          placeholder="+598 99 123 456"
        />
      </Field>
      <Field label={t('customers.notes')}>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          className={inputCls}
          placeholder={t('customers.notesPlaceholder')}
        />
      </Field>
    </div>
  )
}

/* ── Customer ficha (drawer with purchase history) ──────────────────── */
function CustomerDrawer({
  customerId,
  products,
  money,
  canEdit,
  onClose,
  onChanged,
}: {
  customerId: string
  products: Product[]
  money: (v: string | number) => string
  canEdit: boolean
  onClose: () => void
  onChanged: () => Promise<void>
}) {
  const t = useOperationsT()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCustomer, setEditingCustomer] = useState(false)

  const load = useCallback(async () => {
    const res = await api.getCustomerDetail(customerId)
    if (res.data) {
      setCustomer(res.data.customer)
      setOrders(res.data.orders)
    }
    setLoading(false)
  }, [customerId])

  useEffect(() => {
    let cancelled = false
    api.getCustomerDetail(customerId).then((res) => {
      if (cancelled || !res.data) return
      setCustomer(res.data.customer)
      setOrders(res.data.orders)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [customerId])

  const reloadAll = async () => {
    await load()
    await onChanged()
  }

  const removeCustomer = async () => {
    if (!confirm(t('customers.deleteCurrentConfirm'))) return
    await api.deleteCustomer(customerId)
    await onChanged()
    onClose()
  }
  const removeOrder = async (orderId: string) => {
    await api.deleteOrder(orderId)
    await reloadAll()
  }

  const avgTicket =
    customer && customer.ordersCount > 0
      ? parseFloat(customer.totalSpent) / customer.ordersCount
      : 0

  return (
    <Overlay onClose={onClose} align="right">
      <aside
        className="flex h-full w-[480px] max-w-full flex-col border-l border-[var(--dash-border)] bg-[var(--dash-bg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {loading || !customer ? (
          <div className="flex flex-1 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">
            {t('customers.profileLoading')}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold"
                style={tone(avatarTone(customer.name))}
              >
                {initials(customer.name)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3 className="truncate text-xl font-extrabold text-[var(--dash-text)]">
                  {customer.name}
                </h3>
                <span
                  className="w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={tone(statusTone[statusOf(customer)])}
                >
                  {statusLabel(statusOf(customer), t)}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
              >
                <Icon name="circle-x" size={20} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
              {/* Contact */}
              <div className="flex flex-col gap-2.5 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
                {customer.rut && (
                  <ContactRow
                    icon="file-spreadsheet"
                    value={`RUT ${customer.rut}`}
                  />
                )}
                <ContactRow
                  icon="user"
                  value={customer.email || t('customers.noEmail')}
                />
                <ContactRow
                  icon="user-plus"
                  value={customer.phone || t('customers.noPhone')}
                />
                {customer.notes && (
                  <p className="rounded-xl bg-[var(--dash-soft)] p-3 text-xs font-medium text-[var(--dash-text2)]">
                    {customer.notes}
                  </p>
                )}
              </div>

              {/* Aggregates */}
              <div className="grid grid-cols-2 gap-3">
                <Stat
                  label={t('customers.purchases')}
                  value={String(customer.ordersCount)}
                />
                <Stat
                  label={t('customers.totalSpent')}
                  value={money(customer.totalSpent)}
                />
                <Stat
                  label={t('customers.lastPurchase')}
                  value={fullDate(customer.lastOrderAt)}
                />
                <Stat
                  label={t('customers.averageTicket')}
                  value={money(avgTicket)}
                />
              </div>

              {/* Purchase history */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-[var(--dash-text)]">
                    {t('customers.purchaseHistory')}
                  </h4>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null)
                        setAdding((v) => !v)
                      }}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      style={tone('violet')}
                    >
                      <Icon name={adding ? 'circle-x' : 'plus'} size={14} />{' '}
                      {adding
                        ? t('common.cancel')
                        : t('customers.recordPurchase')}
                    </button>
                  )}
                </div>

                {adding && canEdit && (
                  <OrderForm
                    customerId={customerId}
                    products={products}
                    money={money}
                    onSaved={async () => {
                      setAdding(false)
                      await reloadAll()
                    }}
                  />
                )}

                {orders.length === 0 && !adding ? (
                  <div className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-[var(--dash-border)] py-10 text-center">
                    <Icon
                      name="file-spreadsheet"
                      size={22}
                      className="text-[var(--dash-muted)]"
                    />
                    <p className="text-sm font-semibold text-[var(--dash-text)]">
                      {t('customers.noPurchases')}
                    </p>
                    <p className="text-xs font-medium text-[var(--dash-muted)]">
                      {t('customers.firstPurchase')}
                    </p>
                  </div>
                ) : (
                  orders.map((o) =>
                    editingId === o.id ? (
                      <OrderForm
                        key={o.id}
                        customerId={customerId}
                        products={products}
                        money={money}
                        order={o}
                        onCancel={() => setEditingId(null)}
                        onSaved={async () => {
                          setEditingId(null)
                          await reloadAll()
                        }}
                      />
                    ) : (
                      <OrderCard
                        key={o.id}
                        order={o}
                        money={money}
                        canEdit={canEdit}
                        onEdit={() => {
                          setAdding(false)
                          setEditingId(o.id)
                        }}
                        onDelete={() => removeOrder(o.id)}
                      />
                    )
                  )
                )}
              </div>
            </div>

            {canEdit && (
              <div className="flex gap-2 border-t border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(true)}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold"
                  style={tone('violet')}
                >
                  <Icon name="pencil" size={16} /> {t('customers.edit')}
                </button>
                <button
                  type="button"
                  onClick={removeCustomer}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold"
                  style={tone('red')}
                >
                  <Icon name="circle-x" size={16} /> {t('customers.delete')}
                </button>
              </div>
            )}
          </>
        )}
      </aside>

      {editingCustomer && customer && (
        <CustomerModal
          customer={customer}
          onClose={() => setEditingCustomer(false)}
          onSaved={async () => {
            setEditingCustomer(false)
            await reloadAll()
          }}
        />
      )}
    </Overlay>
  )
}

function OrderCard({
  order,
  money,
  canEdit,
  onEdit,
  onDelete,
}: {
  order: Order
  money: (v: string | number) => string
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const t = useOperationsT()
  const statusLabel: Record<string, { label: string; tone: Tone }> = {
    paid: { label: t('orders.paid'), tone: 'green' },
    pending: { label: t('orders.pending'), tone: 'amber' },
    cancelled: { label: t('orders.cancelled'), tone: 'slate' },
  }
  const s = statusLabel[order.status] || statusLabel.paid
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <div className="flex items-start justify-between">
        {order.reference ? (
          <div className="flex items-center gap-1.5 text-[var(--dash-link)]">
            <Icon name="file-spreadsheet" size={15} />
            <span className="text-[17px] font-black leading-none">
              #{order.reference}
            </span>
          </div>
        ) : (
          <span />
        )}
        {canEdit && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              title={t('orders.edit')}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] hover:text-[var(--dash-link)]"
            >
              <Icon name="pencil" size={14} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title={t('orders.delete')}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] hover:text-[var(--tone-red-fg)]"
            >
              <Icon name="circle-x" size={15} />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-[13px] font-bold text-[var(--dash-text)]">
            {fullDate(order.createdAt)}
          </span>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={tone(s.tone)}
          >
            {s.label}
          </span>
        </div>
        <span className="text-[15px] font-extrabold text-[var(--dash-text)]">
          {money(order.total)}
        </span>
      </div>
      {order.items.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-[var(--dash-divider)] pt-2">
          {order.items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between text-xs"
            >
              <span className="font-medium text-[var(--dash-text2)]">
                {it.quantity}× {it.name}
              </span>
              <span className="font-semibold text-[var(--dash-muted)]">
                {money(parseFloat(it.unitPrice) * it.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}
      {order.note && (
        <p className="text-xs font-medium text-[var(--dash-muted)]">
          {order.note}
        </p>
      )}
    </div>
  )
}

type Line = {
  name: string
  quantity: string
  unitPrice: string
  custom: boolean
}
const CUSTOM = '__custom__'
function OrderForm({
  customerId,
  products,
  money,
  order,
  onSaved,
  onCancel,
}: {
  customerId: string
  products: Product[]
  money: (v: string | number) => string
  order?: Order
  onSaved: () => Promise<void>
  onCancel?: () => void
}) {
  const t = useOperationsT()
  const newLine = (): Line => ({
    name: '',
    quantity: '1',
    unitPrice: '',
    custom: false,
  })
  const initialLines = (): Line[] =>
    order && order.items.length
      ? order.items.map((it) => ({
          name: it.name,
          quantity: String(it.quantity),
          unitPrice: it.unitPrice,
          custom: !products.some((p) => p.name === it.name),
        }))
      : [newLine()]
  const [lines, setLines] = useState<Line[]>(initialLines)
  const [reference, setReference] = useState(order?.reference ?? '')
  const [note, setNote] = useState(order?.note ?? '')
  const [status, setStatus] = useState(order?.status ?? 'paid')
  const [saving, setSaving] = useState(false)
  const isEdit = !!order

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  const addLine = () => setLines((ls) => [...ls, newLine()])
  const removeLine = (i: number) =>
    setLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls))

  // Picking a catalog product fills the name + its price; "Otro" switches to free text.
  const pickProduct = (i: number, value: string) => {
    if (value === CUSTOM) {
      setLine(i, { custom: true, name: '', unitPrice: '' })
      return
    }
    const p = products.find((pr) => pr.name === value)
    setLine(i, { custom: false, name: value, unitPrice: p ? p.price : '' })
  }

  const total = lines.reduce(
    (sum, l) =>
      sum + (parseFloat(l.unitPrice) || 0) * (parseInt(l.quantity) || 0),
    0
  )
  const valid = lines.some((l) => l.name.trim() && parseFloat(l.unitPrice) > 0)

  const save = async () => {
    if (!valid || saving) return
    setSaving(true)
    const items = lines
      .filter((l) => l.name.trim() && parseFloat(l.unitPrice) > 0)
      .map((l) => ({
        name: l.name.trim(),
        quantity: parseInt(l.quantity) || 1,
        unit_price: parseFloat(l.unitPrice),
      }))
    const payload = {
      items,
      status,
      note: note.trim() || null,
      reference: reference.trim() || null,
    }
    if (order) await api.updateOrder(order.id, payload)
    else await api.createOrder(customerId, payload)
    setSaving(false)
    await onSaved()
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-4">
      <div className="flex items-center gap-2">
        <Icon
          name="file-spreadsheet"
          size={15}
          className="shrink-0 text-[var(--dash-muted)]"
        />
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder={t('orders.reference')}
          className={`${inputCls} flex-1`}
        />
      </div>
      <div className="flex flex-col gap-2">
        {lines.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            {l.custom ? (
              <input
                value={l.name}
                onChange={(e) => setLine(i, { name: e.target.value })}
                placeholder={t('orders.product')}
                autoFocus
                className={`${inputCls} flex-1`}
              />
            ) : (
              <select
                value={l.name}
                onChange={(e) => pickProduct(i, e.target.value)}
                className={`${inputCls} flex-1 ${l.name ? '' : 'text-[var(--dash-muted)]'}`}
              >
                <option value="">{t('orders.productSelect')}</option>
                {products.map((p) => (
                  <option
                    key={p.id}
                    value={p.name}
                    className="text-[var(--dash-text)]"
                  >
                    {p.name}
                  </option>
                ))}
                <option value={CUSTOM} className="text-[var(--dash-text)]">
                  {t('orders.custom')}
                </option>
              </select>
            )}
            <input
              value={l.quantity}
              onChange={(e) =>
                setLine(i, { quantity: e.target.value.replace(/\D/g, '') })
              }
              className={`${inputCls} w-14 text-center`}
            />
            <input
              value={l.unitPrice}
              onChange={(e) =>
                setLine(i, { unitPrice: e.target.value.replace(/[^\d.]/g, '') })
              }
              placeholder={t('orders.price')}
              className={`${inputCls} w-24`}
            />
            {lines.length > 1 ? (
              <button
                type="button"
                onClick={() => removeLine(i)}
                title={t('orders.removeLine')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-surface)]"
              >
                <Icon name="circle-x" size={16} />
              </button>
            ) : (
              <span className="h-9 w-9 shrink-0" />
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addLine}
          className="flex w-fit items-center gap-1.5 text-xs font-bold text-[var(--dash-link)]"
        >
          <Icon name="plus" size={14} /> {t('orders.addLine')}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${inputCls} w-32`}
        >
          <option value="paid">{t('orders.paid')}</option>
          <option value="pending">{t('orders.pending')}</option>
          <option value="cancelled">{t('orders.cancelled')}</option>
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('orders.note')}
          className={`${inputCls} flex-1`}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--dash-text)]">
          {t('orders.total', { total: money(total) })}
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="h-9 rounded-xl px-3 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-surface)]"
            >
              {t('common.cancel')}
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!valid || saving}
            className={`h-9 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-50 ${gradient}`}
          >
            {saving
              ? t('common.saving')
              : isEdit
                ? t('common.saveChanges')
                : t('orders.record')}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Small shared pieces ────────────────────────────────────────────── */
const inputCls =
  'rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2 text-sm font-medium text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-link)] focus:ring-0'

function Overlay({
  children,
  onClose,
  align = 'center',
}: {
  children: React.ReactNode
  onClose: () => void
  align?: 'center' | 'right'
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
      className={`fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm ${align === 'right' ? 'justify-end' : 'items-center justify-center p-4'}`}
    >
      {children}
    </div>
  )
}
function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">
        {label}
      </span>
      {children}
    </label>
  )
}
function ContactRow({ icon, value }: { icon: IconName; value: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--dash-text2)]">
      <Icon name={icon} size={15} className="text-[var(--dash-muted)]" />{' '}
      {value}
    </div>
  )
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
        {label}
      </span>
      <span className="text-[15px] font-extrabold text-[var(--dash-text)]">
        {value}
      </span>
    </div>
  )
}

export default CustomersScreen
