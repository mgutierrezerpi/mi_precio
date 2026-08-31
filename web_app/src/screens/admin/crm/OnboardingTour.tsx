import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { selectTenant, selectUser } from '../../../store/slices/authSlice'
import { selectTourOpen, setTourOpen } from '../../../store/slices/uiSlice'
import { useT } from '../../../lib/i18n'
import {
  TOUR_STEPS,
  isTourSeen,
  markTourSeen,
  type TourStep,
} from '../../../lib/onboardingTour'
import { Icon } from './ui'
import { gradient } from './theme'

const CARD_WIDTH = 400
const GUTTER = 16
/** Breathing room painted around the highlighted element. */
const HALO = 6

/** Guided spotlight over the real CRM. Mounted once by the admin shell, so it
 *  works on any `/admin/*` route and never on the public list.
 *
 *  Every step points at the sidebar, which is on screen everywhere in the panel
 *  — the tour explains the app without driving the user around it. */
export function OnboardingTour() {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectTourOpen)
  const user = useAppSelector(selectUser)
  const tenant = useAppSelector(selectTenant)
  const t = useT()
  const [index, setIndex] = useState(0)

  // First login: open once per user, then never again unless they replay it.
  useEffect(() => {
    if (!user?.id) return
    if (!isTourSeen(user.id)) {
      setIndex(0)
      dispatch(setTourOpen(true))
    }
  }, [dispatch, user?.id])

  const close = useCallback(() => {
    markTourSeen(user?.id)
    dispatch(setTourOpen(false))
    setIndex(0)
  }, [dispatch, user?.id])

  const step: TourStep | undefined = TOUR_STEPS[index]
  const last = index === TOUR_STEPS.length - 1
  const next = useCallback(() => {
    if (last) close()
    else setIndex((value) => value + 1)
  }, [close, last])
  const back = useCallback(() => setIndex((value) => Math.max(0, value - 1)), [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      else if (event.key === 'ArrowRight') next()
      else if (event.key === 'ArrowLeft') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [back, close, next, open])

  const rect = useAnchorRect(open ? step?.anchor : undefined, index)

  if (!open || !step) return null

  // `dash` scopes the CRM palette (`.dash { --dash-* }` in index.css) and
  // `font-sans` its typeface. The overlay is mounted by the admin shell,
  // outside the CrmLayout tree that normally carries both — without them the
  // card renders transparent and in the body's serif.
  return (
    <div className="dash fixed inset-0 z-[100] font-sans">
      {/* Blocks the app underneath. When a step has no visible anchor it also
          paints the dimming, which otherwise comes from the halo's shadow. */}
      <div
        aria-hidden
        className={`absolute inset-0 ${rect ? '' : 'bg-[rgba(4,2,12,0.72)]'}`}
      />
      {rect && <Spotlight rect={rect} />}
      <TourCard
        body={t(`tour.${step.id}.body`)}
        current={index + 1}
        last={last}
        onBack={index > 0 ? back : undefined}
        onNext={next}
        onSkip={close}
        rect={rect}
        t={t}
        title={t(`tour.${step.id}.title`, { name: tenant?.name || 'MiPrecio' })}
        total={TOUR_STEPS.length}
      />
    </div>
  )
}

/** The lit ring. The dimming is a shadow spread far past the viewport, so a
 *  single element both cuts the hole and darkens everything around it. */
function Spotlight({ rect }: { rect: DOMRect }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute rounded-[10px] transition-[top,left,width,height] duration-200 ease-out motion-reduce:transition-none"
      style={{
        top: rect.top - HALO,
        left: rect.left - HALO,
        width: rect.width + HALO * 2,
        height: rect.height + HALO * 2,
        // Ring and dimming are one declaration: an inline boxShadow replaces
        // Tailwind's `ring-*` outright, so a `ring` class here would vanish.
        boxShadow: '0 0 0 2px #C4B5FD, 0 0 0 9999px rgba(4,2,12,0.72)',
      }}
    />
  )
}

function TourCard({
  body,
  current,
  last,
  onBack,
  onNext,
  onSkip,
  rect,
  t,
  title,
  total,
}: {
  body: string
  current: number
  last: boolean
  onBack?: () => void
  onNext: () => void
  onSkip: () => void
  rect: DOMRect | null
  t: ReturnType<typeof useT>
  title: string
  total: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const position = useCardPosition(cardRef, rect, current)

  // Move focus onto the card so the keyboard lands somewhere useful and screen
  // readers announce the step instead of whatever was focused before.
  useEffect(() => nextRef.current?.focus(), [current])

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
      className="absolute flex flex-col gap-5 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_24px_60px_-12px_rgba(4,2,12,0.7)] transition-[top,left] duration-200 ease-out motion-reduce:transition-none"
      style={{
        top: position.top,
        left: position.left,
        width: `min(${CARD_WIDTH}px, calc(100vw - ${GUTTER * 2}px))`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--dash-muted)]">
          {t('tour.step', { current, total })}
        </span>
        <button
          type="button"
          onClick={onSkip}
          aria-label={t('tour.close')}
          title={t('tour.close')}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] hover:text-[var(--dash-text)]"
        >
          <Icon name="circle-x" size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        <p
          id="tour-title"
          className="text-xl font-extrabold leading-snug tracking-tight text-[var(--dash-text)]"
        >
          {title}
        </p>
        <p
          id="tour-body"
          className="text-[15px] font-medium leading-[1.65] text-[var(--dash-text2)]"
        >
          {body}
        </p>
      </div>

      <StepDots current={current} total={total} />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="text-[13px] font-bold text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
        >
          {t('tour.skip')}
        </button>
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 items-center rounded-lg border border-[var(--dash-border)] px-4 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
            >
              {t('tour.back')}
            </button>
          )}
          <button
            ref={nextRef}
            type="button"
            onClick={onNext}
            className={`flex h-10 items-center gap-1.5 rounded-lg px-5 text-sm font-bold text-white hover:opacity-90 ${gradient}`}
          >
            {last ? t('tour.finish') : current === 1 ? t('tour.start') : t('tour.next')}
            {!last && <Icon name="chevron-right" size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div aria-hidden className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none ${
            i + 1 === current
              ? 'w-5 bg-[var(--dash-chart-fill)]'
              : 'w-1.5 bg-[var(--dash-chart-track)]'
          }`}
        />
      ))}
    </div>
  )
}

/** Measures the element carrying `data-tour="<anchor>"`.
 *
 *  Returns null when there is nothing to point at — no anchor, element missing,
 *  or off-screen (the sidebar below `lg` is a drawer parked outside the
 *  viewport). Callers then render a plain centered card, which is the right
 *  answer on a phone: highlighting something the user cannot see is worse than
 *  not highlighting at all. */
function useAnchorRect(anchor: string | undefined, index: number) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useLayoutEffect(() => {
    if (!anchor) {
      setRect(null)
      return
    }
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${anchor}"]`)
      const box = el?.getBoundingClientRect()
      const visible =
        box &&
        box.width > 0 &&
        box.height > 0 &&
        box.right > 0 &&
        box.bottom > 0 &&
        box.left < window.innerWidth &&
        box.top < window.innerHeight
      setRect(visible ? box : null)
    }
    measure()
    // The sidebar animates (drawer, collapse), so settle a frame later too.
    const frame = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [anchor, index])

  return rect
}

/** Hangs the card off the anchor — to its right, below it if that does not fit,
 *  centered when there is no anchor — and always clamped inside the viewport. */
function useCardPosition(
  cardRef: React.RefObject<HTMLDivElement | null>,
  rect: DOMRect | null,
  index: number
) {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    const place = () => {
      const card = cardRef.current
      if (!card) return
      const width = card.offsetWidth || CARD_WIDTH
      const height = card.offsetHeight || 200
      const vw = window.innerWidth
      const vh = window.innerHeight

      if (!rect) {
        setPosition({
          top: Math.max(GUTTER, (vh - height) / 2),
          left: Math.max(GUTTER, (vw - width) / 2),
        })
        return
      }

      const fitsRight = rect.right + HALO + GUTTER + width <= vw - GUTTER
      const left = fitsRight
        ? rect.right + HALO + GUTTER
        : Math.min(rect.left, vw - width - GUTTER)
      const top = fitsRight
        ? rect.top + rect.height / 2 - height / 2
        : rect.bottom + HALO + GUTTER

      setPosition({
        top: clamp(top, GUTTER, Math.max(GUTTER, vh - height - GUTTER)),
        left: clamp(left, GUTTER, Math.max(GUTTER, vw - width - GUTTER)),
      })
    }
    place()
    const frame = requestAnimationFrame(place)
    window.addEventListener('resize', place)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', place)
    }
  }, [cardRef, index, rect])

  return position
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export default OnboardingTour
