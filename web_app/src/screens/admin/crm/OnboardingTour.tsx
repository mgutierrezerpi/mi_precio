import { useCallback, useEffect, useState } from 'react'
import { useT } from '../../../lib/i18n'
import {
  TOUR_STEPS,
  isTourSeen,
  markTourSeen,
  type TourStep,
} from '../../../lib/onboardingTour'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { selectTenant, selectUser } from '../../../store/slices/authSlice'
import { selectTourOpen, setTourOpen } from '../../../store/slices/uiSlice'
import { TourCard } from './OnboardingTourCard'
import { TOUR_HALO, useAnchorRect } from './onboardingTourPosition'

/** Guided spotlight overlay mounted once by the admin shell. */
export function OnboardingTour() {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectTourOpen)
  const user = useAppSelector(selectUser)
  const tenant = useAppSelector(selectTenant)
  const t = useT()
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (user?.id && !isTourSeen(user.id)) dispatch(setTourOpen(true))
  }, [dispatch, user?.id])
  const close = useCallback(() => {
    markTourSeen(user?.id)
    dispatch(setTourOpen(false))
    setIndex(0)
  }, [dispatch, user?.id])
  const step: TourStep | undefined = TOUR_STEPS[index]
  const last = index === TOUR_STEPS.length - 1
  const next = useCallback(
    () => (last ? close() : setIndex((value) => value + 1)),
    [close, last]
  )
  const back = useCallback(
    () => setIndex((value) => Math.max(0, value - 1)),
    []
  )
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
  return (
    <div className="dash fixed inset-0 z-[100] font-sans">
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

function Spotlight({ rect }: { rect: DOMRect }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute rounded-[10px] transition-[top,left,width,height] duration-200 ease-out motion-reduce:transition-none"
      style={{
        top: rect.top - TOUR_HALO,
        left: rect.left - TOUR_HALO,
        width: rect.width + TOUR_HALO * 2,
        height: rect.height + TOUR_HALO * 2,
        boxShadow: '0 0 0 2px #C4B5FD, 0 0 0 9999px rgba(4,2,12,0.72)',
      }}
    />
  )
}

export default OnboardingTour
