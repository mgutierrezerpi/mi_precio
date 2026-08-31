import { useEffect, useRef } from 'react'
import type { TFn } from '../../../lib/i18n'
import { Icon } from './ui'
import { gradient } from './theme'
import {
  TOUR_CARD_WIDTH,
  TOUR_GUTTER,
  useCardPosition,
} from './onboardingTourPosition'

interface TourCardProps {
  body: string
  current: number
  last: boolean
  onBack?: () => void
  onNext: () => void
  onSkip: () => void
  rect: DOMRect | null
  t: TFn
  title: string
  total: number
}

export function TourCard({
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
}: TourCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const position = useCardPosition(cardRef, rect, current)
  const cardClassName = [
    'absolute flex flex-col gap-5 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)]',
    'p-6 shadow-[0_24px_60px_-12px_rgba(4,2,12,0.7)] transition-[top,left] duration-200 ease-out',
    'motion-reduce:transition-none',
  ].join(' ')
  const closeButtonClassName = [
    'flex h-7 w-7 items-center justify-center rounded-md text-[var(--dash-muted)]',
    'hover:bg-[var(--dash-soft)] hover:text-[var(--dash-text)]',
  ].join(' ')
  const backButtonClassName = [
    'flex h-10 items-center rounded-lg border border-[var(--dash-border)] px-4 text-sm font-bold',
    'text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]',
  ].join(' ')
  useEffect(() => nextRef.current?.focus(), [current])
  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
      className={cardClassName}
      style={{
        top: position.top,
        left: position.left,
        width: `min(${TOUR_CARD_WIDTH}px, calc(100vw - ${TOUR_GUTTER * 2}px))`,
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
          className={closeButtonClassName}
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
              className={backButtonClassName}
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
            {last
              ? t('tour.finish')
              : current === 1
                ? t('tour.start')
                : t('tour.next')}
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
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none ${
            index + 1 === current
              ? 'w-5 bg-[var(--dash-chart-fill)]'
              : 'w-1.5 bg-[var(--dash-chart-track)]'
          }`}
        />
      ))}
    </div>
  )
}
