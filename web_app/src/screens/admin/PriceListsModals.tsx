import { useEffect, useState } from 'react'
import type { Customer, Item, PriceList, PriceListVariantType } from '../../types'
import api from '../../services/api'
import { useAppDispatch } from '../../store/hooks'
import { createList } from '../../store/slices/menuSlice'
import { Icon } from './crm/ui'
import { QrCode } from './crm/QrCode'
import { gradient } from './crm/theme'
import { downloadQrPng, downloadQrSvg } from '../../lib/qrRender'
import { useT } from '../../lib/i18n'

const qrFileName = (l: PriceList) =>
  (l.slug || l.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || l.id
const inputCls =
  'h-10 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-sm text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]'

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

export function VariantModal({
  parent,
  tenantId,
  onClose,
}: {
  parent: PriceList
  tenantId: string
  onClose: () => void
}) {
  const dispatch = useAppDispatch()
  const t = useT()
  const [name, setName] = useState(`${parent.name} — `)
  const [variantType, setVariantType] =
    useState<PriceListVariantType>('customer')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sourceItems, setSourceItems] = useState<Item[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [showPriceAdjustment, setShowPriceAdjustment] = useState(false)
  const [adjustmentKind, setAdjustmentKind] = useState<
    'discount' | 'surcharge'
  >('discount')
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
    const days = (8 - today.getDay()) % 7 || 7
    setStart(scheduledDate(days))
  }

  useEffect(() => {
    void api
      .getCustomers(tenantId)
      .then((response) => setCustomers(response.data ?? []))
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
    const factor =
      adjustmentKind === 'discount' ? 1 - percent / 100 : 1 + percent / 100
    await Promise.all(
      (variantItems.data ?? []).flatMap((item) => {
        const source = sourceByKey.get(item.productId || `name:${item.name}`)
        if (!source) return []
        const price = Math.max(
          0,
          Math.round(Number(source.price) * factor * 100) / 100
        )
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
            customerId:
              variantType === 'customer' ? customerId || undefined : undefined,
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
              {t('pl.variant.modal.title')}
            </h3>
            <p className="mt-1 text-xs font-medium text-[var(--dash-muted)]">
              {t('pl.variant.modal.description', { parent: parent.name })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80"
            aria-label={t('pl.close')}
          >
            ✕
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[var(--dash-text2)]">
            {t('pl.name')}
          </span>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputCls}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[var(--dash-text2)]">
            {t('pl.variant.purpose')}
          </span>
          <select
            value={variantType}
            onChange={(event) =>
              setVariantType(event.target.value as PriceListVariantType)
            }
            className={inputCls}
          >
            <option value="customer">{t('pl.variant.customerPrices')}</option>
            <option value="promotion">{t('pl.variant.promotion')}</option>
            <option value="seasonal">{t('pl.variant.seasonalList')}</option>
            <option value="custom">{t('pl.variant.modal.title')}</option>
          </select>
        </label>

        {variantType === 'customer' && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--dash-text2)]">
              {t('pl.variant.customer')}
            </span>
            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className={inputCls}
            >
              <option value="">{t('pl.variant.selectLater')}</option>
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
                <p className="text-xs font-bold text-[var(--dash-text2)]">
                  {t('pl.variant.adjustPrices')}
                </p>
                <p className="text-[11px] font-medium text-[var(--dash-muted)]">
                  {t('pl.variant.adjustDescription')}
                </p>
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
                {t('pl.variant.remove')}
              </button>
            </div>
            <div className="flex gap-2">
              <select
                value={adjustmentKind}
                onChange={(event) =>
                  setAdjustmentKind(
                    event.target.value as 'discount' | 'surcharge'
                  )
                }
                className={`${inputCls} flex-1`}
              >
                <option value="discount">{t('pl.variant.discount')}</option>
                <option value="surcharge">{t('pl.variant.surcharge')}</option>
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
                <span className="absolute right-3 top-3 text-sm font-bold text-[var(--dash-muted)]">
                  %
                </span>
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
                    ? t('pl.removeAll')
                    : t('pl.selectAll')}
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
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--dash-text)]">
                        {item.name}
                      </span>
                      <span className="text-xs font-medium text-[var(--dash-muted)]">
                        {item.currency} {item.price}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs font-medium text-[var(--dash-muted)]">
                {t('pl.variant.loadingProducts')}
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowPriceAdjustment(true)}
            className="flex w-full items-center justify-between rounded-xl border border-dashed border-[var(--dash-border)] px-3.5 py-3 text-left hover:bg-[var(--dash-soft)]"
          >
            <span className="text-sm font-bold text-[var(--dash-text2)]">
              {t('pl.variant.adjustPrices')}
            </span>
            <span className="text-xs font-medium text-[var(--dash-muted)]">
              {t('pl.variant.discount')} / {t('pl.variant.surcharge')}
            </span>
          </button>
        )}

        {showSchedule ? (
          <>
            <div className="flex flex-col gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[var(--dash-text2)]">
                  {t('pl.variant.schedule')}
                </span>
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
                  {t('pl.variant.noDates')}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="self-center text-[11px] font-medium text-[var(--dash-muted)]">
                  {t('pl.variant.starts')}
                </span>
                <button
                  type="button"
                  onClick={() => setStart(new Date())}
                  className={shortcutClass}
                >
                  {t('pl.variant.now')}
                </button>
                <button
                  type="button"
                  onClick={() => setStart(scheduledDate(1))}
                  className={shortcutClass}
                >
                  {t('pl.variant.tomorrow')}
                </button>
                <button
                  type="button"
                  onClick={setNextMonday}
                  className={shortcutClass}
                >
                  {t('pl.variant.nextMonday')}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="self-center text-[11px] font-medium text-[var(--dash-muted)]">
                  {t('pl.variant.ends')}
                </span>
                <button
                  type="button"
                  onClick={() => setEndAfter(1)}
                  className={shortcutClass}
                >
                  {t('pl.variant.inDay')}
                </button>
                <button
                  type="button"
                  onClick={() => setEndAfter(7)}
                  className={shortcutClass}
                >
                  {t('pl.variant.inWeek')}
                </button>
                <button
                  type="button"
                  onClick={() => setEndAfter(30)}
                  className={shortcutClass}
                >
                  {t('pl.variant.inMonth')}
                </button>
                <button
                  type="button"
                  onClick={() => setEndsAt('')}
                  className={shortcutClass}
                >
                  {t('pl.variant.noExpiry')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomSchedule(true)}
                  className={shortcutClass}
                >
                  {t('pl.variant.customize')}
                </button>
              </div>
            </div>

            {showCustomSchedule && (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[var(--dash-text2)]">
                    {t('pl.variant.fromDate')}
                  </span>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(event) => setStartsAt(event.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[var(--dash-text2)]">
                    {t('pl.variant.toDate')}
                  </span>
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
            <span className="text-sm font-bold text-[var(--dash-text2)]">
              {t('pl.variant.addPeriod')}
            </span>
            <span className="text-xs font-medium text-[var(--dash-muted)]">
              {t('pl.variant.optional')}
            </span>
          </button>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl px-4 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
          >
            {t('pl.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}
          >
            <Icon name="list-plus" size={16} />{' '}
            {saving ? t('pl.saving') : t('pl.variant.create')}
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
