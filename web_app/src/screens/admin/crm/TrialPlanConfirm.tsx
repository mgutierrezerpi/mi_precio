import { useEffect, useRef } from 'react'
import type { TFn } from '../../../lib/i18n'
import { gradient } from './theme'

/** Subscribing during the trial charges at once and gives up the days left,
 *  so the owner reads that here before going on to pay. */
export function TrialPlanConfirm({
  t,
  plan,
  price,
  trialEnds,
  charges,
  busy,
  onConfirm,
  onDismiss,
}: {
  t: TFn
  plan: string
  price: string
  trialEnds: string | null
  /** False when there is no payment gateway and the plan applies for free. */
  charges: boolean
  busy: boolean
  onConfirm: () => void
  onDismiss: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  }, [plan])

  const message = charges
    ? t(trialEnds ? 'bill.trial.confirm' : 'bill.trial.confirmNoDate', {
        plan,
        price,
        date: trialEnds ?? '',
      })
    : t(
        trialEnds
          ? 'bill.trial.confirmNoCharge'
          : 'bill.trial.confirmNoChargeNoDate',
        { plan, date: trialEnds ?? '' }
      )
  const confirmLabel = t(charges ? 'bill.trial.pay' : 'bill.trial.subscribe', {
    plan,
  })

  return (
    <div
      ref={ref}
      role="alertdialog"
      aria-label={confirmLabel}
      className="flex flex-col gap-3 rounded-2xl border border-[var(--tone-violet-fg)]/40 bg-[var(--dash-soft)] p-4"
    >
      <p className="text-[13px] font-semibold text-[var(--dash-text)]">
        {message}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className={`flex h-10 items-center rounded-xl px-4 text-[13px] font-bold text-white disabled:opacity-60 ${gradient}`}
        >
          {busy ? t('bill.changing') : confirmLabel}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDismiss}
          className="flex h-10 items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 text-[13px] font-bold text-[var(--dash-text2)]"
        >
          {t('bill.change.no')}
        </button>
      </div>
    </div>
  )
}
