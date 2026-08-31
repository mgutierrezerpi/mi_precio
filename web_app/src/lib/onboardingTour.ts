/** First-login onboarding: the guided spotlight tour and the "first steps"
 *  checklist that outlives it.
 *
 *  Both live only inside the CRM (`/admin/*`). The public list belongs to the
 *  shop, not to us, and never shows a MiPrecio tour.
 *
 *  Progress is kept in localStorage, keyed by **user** id for the tour (so a
 *  second member of the team gets their own run, and a shared browser does not
 *  swallow it) and by **tenant** id for the checklist (it describes the
 *  business, not the person looking at it).
 */

export {
  FIRST_STEPS_EVENT,
  TOUR_STEPS,
  hideChecklist,
  isChecklistHidden,
  isQrShared,
  isTourSeen,
  markQrShared,
  markTourSeen,
  resetTour,
} from './onboardingTourStorage'
export type { TourStep } from './onboardingTourStorage'

/* ── Checklist ───────────────────────────────────────────────────── */

export type ChecklistId = 'products' | 'design' | 'list' | 'publish' | 'share'

export interface ChecklistItem {
  id: ChecklistId
  done: boolean
  /** Where the row's arrow takes them to get it done. */
  to: string
}

/** Only the fields the checklist reads, so tests need no full Tenant/PriceList. */
export interface ChecklistInput {
  productCount: number
  appearance: {
    logoUrl?: string | null
    brandColor?: string | null
    listDesign?: string | null
    listHeroColor?: string | null
    listBgUrl?: string | null
  }
  lists: { published: boolean; live: boolean }[]
  qrShared: boolean
}

/** The five steps, derived from real data on every render — nothing to keep in
 *  sync, and a step the shop completed on its own is already ticked the first
 *  time it sees the card.
 *
 *  Order follows how the work actually goes: load the catalog, decide how the
 *  list should look, build the list, publish it, share it. There is no "pick a
 *  plan" step — the plan gate means an account without one never reaches this
 *  screen at all (see plan_required / selectNeedsPlan).
 *
 *  "Design" is done once any brand or appearance field is set. Every one of
 *  them is null on a fresh tenant, so a value there is always a deliberate
 *  choice by the shop, never a default we handed it.
 *
 *  "Publish" checks `published && live`: a list the plan no longer serves is
 *  not reachable by a customer, so calling that step done would be a lie. */
export function checklistFor(input: ChecklistInput): ChecklistItem[] {
  const { appearance } = input
  return [
    { id: 'products', done: input.productCount > 0, to: '/admin/items' },
    {
      id: 'design',
      done: !!(
        appearance.logoUrl ||
        appearance.brandColor ||
        appearance.listDesign ||
        appearance.listHeroColor ||
        appearance.listBgUrl
      ),
      to: '/admin/settings?section=brand',
    },
    { id: 'list', done: input.lists.length > 0, to: '/admin/lists?new=1' },
    {
      id: 'publish',
      done: input.lists.some((list) => list.published && list.live),
      to: '/admin/lists',
    },
    { id: 'share', done: input.qrShared, to: '/admin/qr' },
  ]
}

export function checklistProgress(items: ChecklistItem[]) {
  const done = items.filter((item) => item.done).length
  return { done, total: items.length, complete: done === items.length }
}
