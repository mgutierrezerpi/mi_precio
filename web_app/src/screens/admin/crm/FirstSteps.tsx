import { useCallback, useEffect, useRef, useState } from 'react'
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
} from '../../../lib/onboardingTour'
import type { PriceList } from '../../../types'
import { FirstStepsView } from './FirstStepsView'

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
    <FirstStepsView
      items={items}
      done={done}
      total={total}
      complete={complete}
      leaving={leaving}
      t={t}
      onDismiss={dismiss}
      onReplay={() => dispatch(setTourOpen(true))}
    />
  )
}

export default FirstSteps
