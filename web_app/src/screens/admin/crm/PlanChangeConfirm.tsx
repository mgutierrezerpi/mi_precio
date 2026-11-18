import { useEffect, useRef } from 'react'
import type { TFn } from '../../../lib/i18n'
import { gradient } from './theme'

/** Changing plan on a live subscription applies at once, with no checkout
 *  page to back out of, so the owner confirms it here first. */
export function PlanChangeConfirm({
  t,
  from,
  to,
  resumes,
  busy,
  onConfirm,
  onDismiss,
}: {
  t: TFn
  from: string
  to: string
  resumes: boolean
  busy: boolean
  onConfirm: () => void
  onDismiss: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  }, [to])

  return (
    <div
      ref={ref}
      role="alertdialog"
      aria-label={t('bill.change.yes')}
      className="flex flex-col gap-3 rounded-2xl border border-[var(--tone-violet-fg)]/40 bg-[var(--dash-soft)] p-4"
    >
      <p className="text-[13px] font-semibold text-[var(--dash-text)]">
        {t(resumes ? 'bill.change.confirmResume' : 'bill.change.confirm', {
          from,
          to,
        })}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className={`flex h-10 items-center rounded-xl px-4 text-[13px] font-bold text-white disabled:opacity-60 ${gradient}`}
        >
          {busy ? t('bill.changing') : t('bill.change.yes')}
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
