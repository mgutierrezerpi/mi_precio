import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { selectTenant } from '../../../store/slices/authSlice'
import { setTourOpen } from '../../../store/slices/uiSlice'
import { useT } from '../../../lib/i18n'
import {
  FIRST_STEPS_EVENT,
  checklistFor,
  checklistProgress,
  hideChecklist,
  isChecklistHidden,
  isQrShared,
  type ChecklistItem,
} from '../../../lib/onboardingTour'
import type { PriceList } from '../../../types'
import { Icon } from './ui'
import { gradient } from './theme'

/** How long a just-finished checklist stays on screen before retiring itself.
 *  Long enough to read "¡Listo!", short enough not to become furniture. */
const CELEBRATION_MS = 5000
/** Keep in step with the `duration-500` on the card. */
const FADE_MS = 500

/** "First steps" card on the dashboard — what the guided tour leaves behind.
 *
 *  Rows tick themselves off real data on every render, so a shop that already
 *  created its list sees that step done the first time it looks.
 *
 *  It retires itself: dismissed by hand, or automatically once all five are
 *  done. Completion is persisted the moment it happens, so the card never
 *  returns — a finished checklist is clutter on a dashboard the shop will open
 *  every day. */
export function FirstSteps({
  lists,
  productCount,
}: {
  lists: PriceList[]
  productCount: number
}) {
  const dispatch = useAppDispatch()
  const t = useT()
  const tenant = useAppSelector(selectTenant)
  const tenantId = tenant?.id
  const [hidden, setHidden] = useState(() => isChecklistHidden(tenantId))
  const [shared, setShared] = useState(() => isQrShared(tenantId))
  const [leaving, setLeaving] = useState(false)
  const sawUnfinished = useRef(false)

  // The tenant arrives a tick after mount on a cold load, and sharing can be
  // marked from the sidebar or the QR screen — re-read on both.
  useEffect(() => {
    setHidden(isChecklistHidden(tenantId))
    setShared(isQrShared(tenantId))
  }, [tenantId])
  useEffect(() => {
    const sync = () => setShared(isQrShared(tenantId))
    window.addEventListener(FIRST_STEPS_EVENT, sync)
    return () => window.removeEventListener(FIRST_STEPS_EVENT, sync)
  }, [tenantId])

  const dismiss = useCallback(() => {
    hideChecklist(tenantId)
    setHidden(true)
  }, [tenantId])

  const items = checklistFor({
    productCount,
    appearance: {
      logoUrl: tenant?.logoUrl,
      brandColor: tenant?.brandColor,
      listDesign: tenant?.listDesign,
      listHeroColor: tenant?.listHeroColor,
      listBgUrl: tenant?.listBgUrl,
    },
    lists,
    qrShared: shared,
  })
  const { done, total, complete } = checklistProgress(items)

  // Remember having seen unfinished work, so "completed just now" can be told
  // apart from "was already complete when this screen opened".
  useEffect(() => {
    if (!complete) sawUnfinished.current = true
  }, [complete])

  useEffect(() => {
    if (!complete || !tenantId) return
    hideChecklist(tenantId)
    // Already done on arrival: nothing was achieved here, so do not show it.
    if (!sawUnfinished.current) {
      setHidden(true)
      return
    }
    // Finished under the shop's eyes: hold the "¡Listo!" state for a beat
    // rather than vanishing from under the cursor that completed it, then fade
    // so leaving reads as intentional rather than as a glitch.
    const fade = setTimeout(() => setLeaving(true), CELEBRATION_MS)
    const gone = setTimeout(() => setHidden(true), CELEBRATION_MS + FADE_MS)
    return () => {
      clearTimeout(fade)
      clearTimeout(gone)
    }
  }, [complete, tenantId])

  if (hidden || !tenantId) return null

  return (
    <section
      aria-labelledby="first-steps-title"
      className={`flex flex-col gap-3 rounded-[var(--dash-radius)] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 transition-opacity duration-500 ease-out motion-reduce:transition-none md:p-5 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2
            id="first-steps-title"
            className="text-sm font-extrabold text-[var(--dash-text)]"
          >
            {t('steps.title')}
          </h2>
          <p className="text-xs font-medium text-[var(--dash-muted)]">
            {complete ? t('steps.complete') : t('steps.subtitle')}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-[var(--dash-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--dash-link)]">
            {t('steps.progress', { done, total })}
          </span>
          <button
            type="button"
            onClick={dismiss}
            className="text-[11px] font-bold text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
          >
            {t('steps.hide')}
          </button>
        </div>
      </header>

      <ProgressBar done={done} total={total} />

      <ol className="flex flex-col">
        {items.map((item) => (
          <StepRow key={item.id} item={item} t={t} />
        ))}
      </ol>

      <button
        type="button"
        onClick={() => dispatch(setTourOpen(true))}
        className="flex items-center gap-1.5 self-start text-xs font-bold text-[var(--dash-link)] hover:underline"
      >
        <Icon name="eye" size={14} />
        {t('tour.replay')}
      </button>
    </section>
  )
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--dash-chart-track)]"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none ${gradient}`}
        style={{ width: `${(done / total) * 100}%` }}
      />
    </div>
  )
}

function StepRow({
  item,
  t,
}: {
  item: ChecklistItem
  t: ReturnType<typeof useT>
}) {
  const label = t(`steps.${item.id}.${item.done ? 'done' : 'todo'}`)
  const content = (
    <>
      <span
        aria-hidden
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          item.done
            ? 'bg-[var(--tone-green-bg)] text-[var(--tone-green-fg)]'
            : 'border border-[var(--dash-border)] text-[var(--dash-muted)]'
        }`}
      >
        {item.done && <Icon name="circle-check" size={13} />}
      </span>
      <span
        className={`flex-1 text-[13px] ${
          item.done
            ? 'font-medium text-[var(--dash-muted)] line-through'
            : 'font-bold text-[var(--dash-text)]'
        }`}
      >
        {label}
      </span>
      {!item.done && (
        <Icon name="chevron-right" size={15} className="text-[var(--dash-muted)]" />
      )}
    </>
  )

  // A finished step is a statement, not an action: no link, nothing to click.
  return (
    <li>
      {item.done ? (
        <div className="flex items-center gap-2.5 py-1.5">{content}</div>
      ) : (
        <Link
          to={item.to}
          className="-mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[var(--dash-soft)]"
        >
          {content}
        </Link>
      )}
    </li>
  )
}

export default FirstSteps
