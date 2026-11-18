import { useState } from 'react'
import api from '../../../services/api'
import { parseUtc } from '../../../lib/datetime'
import { localeOf, type TFn } from '../../../lib/i18n'
import { planById } from '../../../lib/plans'
import type { BillingStatus, PlanInfo, Tenant } from '../../../types'
import { Icon } from './ui'
import { gradient, tone } from './theme'

function statusTone(status: BillingStatus) {
  if (status === 'active' || status === 'paid') return 'green'
  if (status === 'on_trial') return 'violet'
  if (status === 'cancelled' || status === 'paused') return 'amber'
  return 'red'
}

function SubRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-semibold text-[var(--dash-text2)]">{label}</span>
      <span
        className={`font-bold ${highlight ? 'text-[var(--tone-amber-fg)]' : 'text-[var(--dash-text)]'}`}
      >
        {value}
      </span>
    </div>
  )
}

/** Current subscription: state, dates, card, and the cancel / resume actions.
 *  Hidden for accounts with no subscription: there is nothing to manage. */
export function SubscriptionPanel({
  t,
  info,
  isOwner,
  tenantId,
  language,
  onTenantChanged,
  onChanged,
}: {
  t: TFn
  info: PlanInfo | null
  isOwner: boolean
  tenantId?: string
  language?: string | null
  onTenantChanged: (tenant: Tenant) => void
  onChanged: () => Promise<void>
}) {
  const [busy, setBusy] = useState<'cancel' | 'resume' | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const billing = info?.billing
  const status = billing?.status ?? null
  if (!info || !billing || !status || info.plan === 'free') return null
  // An open checkout is not a subscription until the provider confirms it.
  const pendingCheckout = status === 'checkout_pending'
  if (pendingCheckout && !billing.subscriptionId) return null

  const cancelled = status === 'cancelled'
  // Demo and manual plans have no provider subscription to act on.
  const manageable =
    !info.billingEnabled ||
    (billing.provider === 'lemonsqueezy' && !!billing.subscriptionId)

  const fmtDate = (iso?: string | null) =>
    parseUtc(iso)?.toLocaleDateString(localeOf(language), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) ?? null
  const trialEnds = fmtDate(billing.trialEndsAt)
  const endsAt = fmtDate(billing.endsAt)
  const renewsAt = fmtDate(billing.renewsAt)
  const periodEnd = renewsAt ?? endsAt

  const act = async (kind: 'cancel' | 'resume') => {
    if (!tenantId) return
    setBusy(kind)
    setError(null)
    const res =
      kind === 'cancel'
        ? await api.cancelSubscription(tenantId)
        : await api.resumeSubscription(tenantId)
    setBusy(null)
    if (res.error) {
      setError(res.error)
      return
    }
    setConfirming(false)
    if (res.data) onTenantChanged(res.data)
    await onChanged()
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--dash-border)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-extrabold text-[var(--dash-text)]">
            {t('bill.sub.title')}
          </span>
          <span className="text-[12px] font-medium text-[var(--dash-muted)]">
            {t('bill.sub.plan', { plan: planById(info.plan).name })}
          </span>
        </div>
        {!pendingCheckout && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
            style={tone(statusTone(status))}
          >
            {t(`billingStatus.${status}`)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-[var(--dash-divider)] pt-3 text-[12px]">
        {status === 'on_trial' && trialEnds && (
          <SubRow label={t('bill.sub.trialEnds')} value={trialEnds} />
        )}
        {cancelled && endsAt && (
          <SubRow label={t('bill.sub.accessUntil')} value={endsAt} highlight />
        )}
        {!cancelled && renewsAt && (
          <SubRow label={t('bill.sub.renews')} value={renewsAt} />
        )}
        {billing.cardBrand && billing.cardLastFour && (
          <SubRow
            label={t('bill.sub.card')}
            value={`${billing.cardBrand.toUpperCase()} ···· ${billing.cardLastFour}`}
          />
        )}
      </div>

      {cancelled && (
        <p className="rounded-xl bg-[var(--tone-amber-bg)] px-3.5 py-2.5 text-[12px] font-semibold text-[var(--tone-amber-fg)]">
          {t('bill.sub.cancelledNote')}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-[var(--tone-red-bg)] px-3.5 py-2.5 text-[12px] font-semibold text-[var(--tone-red-fg)]"
        >
          {error}
        </p>
      )}

      {isOwner && manageable && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--dash-divider)] pt-3.5">
          {billing.updatePaymentUrl && !cancelled && (
            <a
              href={billing.updatePaymentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
            >
              <Icon name="tags" size={15} /> {t('bill.sub.updateCard')}
            </a>
          )}
          {cancelled ? (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => act('resume')}
              className={`flex h-10 items-center rounded-xl px-4 text-[13px] font-bold text-white disabled:opacity-60 ${gradient}`}
            >
              {busy === 'resume'
                ? t('bill.sub.resuming')
                : t('bill.sub.resume')}
            </button>
          ) : !confirming ? (
            // Destructive but not primary: outlined and pushed to the right so
            // it never reads as the default thing to do here.
            <button
              type="button"
              onClick={() => {
                setConfirming(true)
                setError(null)
              }}
              className="ml-auto flex h-10 items-center gap-2 rounded-xl border border-[#EF4444]/40 px-4 text-[13px] font-bold text-[#EF4444] transition hover:border-[#EF4444] hover:bg-[var(--tone-red-bg)]"
            >
              <Icon name="circle-x" size={15} /> {t('bill.sub.cancel')}
            </button>
          ) : (
            <div className="flex w-full flex-col gap-2 rounded-xl border border-[#EF4444]/40 bg-[var(--tone-red-bg)] p-3.5">
              <span className="text-[12px] font-semibold text-[var(--tone-red-fg)]">
                {periodEnd
                  ? t('bill.sub.confirm', { date: periodEnd })
                  : t('bill.sub.confirmNoDate')}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => act('cancel')}
                  className="flex h-9 items-center rounded-xl bg-[#EF4444] px-4 text-[13px] font-bold text-white disabled:opacity-60"
                >
                  {busy === 'cancel'
                    ? t('bill.sub.cancelling')
                    : t('bill.sub.confirmYes')}
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => setConfirming(false)}
                  className="flex h-9 items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 text-[13px] font-bold text-[var(--dash-text2)]"
                >
                  {t('bill.sub.confirmNo')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
