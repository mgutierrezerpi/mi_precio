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

const TOUR_SEEN_PREFIX = 'mp_tour_seen_'
const CHECKLIST_HIDDEN_PREFIX = 'mp_first_steps_hidden_'
const QR_SHARED_PREFIX = 'mp_qr_shared_'

/* ── Tour steps ──────────────────────────────────────────────────── */

export interface TourStep {
  id: string
  /** `data-tour` value of the element to highlight. Absent = centered card. */
  anchor?: string
  /** Preferred side to hang the card off. Falls back when it does not fit. */
  placement?: 'right' | 'bottom'
}

/** Every anchor lives in the CRM sidebar, which is on screen on every admin
 *  route — so the tour never has to navigate the user around mid-run, and a
 *  step whose anchor is hidden (mobile drawer) just degrades to a centered
 *  card instead of pointing at nothing. */
export const TOUR_STEPS: TourStep[] = [
  { id: 'welcome' },
  { id: 'lists', anchor: 'nav-lists', placement: 'right' },
  { id: 'products', anchor: 'nav-products', placement: 'right' },
  // Brand and per-list design both live in Configuración → Marca y apariencia,
  // so they share an anchor; the list step that follows is where a shop
  // actually overrides the design for one list.
  { id: 'brand', anchor: 'nav-settings', placement: 'right' },
  { id: 'design', anchor: 'nav-lists', placement: 'right' },
  { id: 'qr', anchor: 'nav-qr', placement: 'right' },
  { id: 'share', anchor: 'share-link', placement: 'right' },
  { id: 'support', anchor: 'nav-support', placement: 'right' },
]

/* ── Tour state ──────────────────────────────────────────────────── */

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    // Private mode / storage disabled: treat as "never seen". Showing the tour
    // twice is a smaller sin than crashing the panel.
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Nothing to do: the tour is a nicety, not a feature to fail the app over.
  }
}

function remove(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Same as above.
  }
}

/** True once this user finished or skipped the tour. Unknown user = "seen", so
 *  a half-loaded session never flashes the overlay. */
export function isTourSeen(userId?: string | null): boolean {
  if (!userId) return true
  return read(`${TOUR_SEEN_PREFIX}${userId}`) === '1'
}

export function markTourSeen(userId?: string | null) {
  if (userId) write(`${TOUR_SEEN_PREFIX}${userId}`, '1')
}

/** Replays the tour from "Volver a ver el recorrido". */
export function resetTour(userId?: string | null) {
  if (userId) remove(`${TOUR_SEEN_PREFIX}${userId}`)
}

/* ── Checklist state ─────────────────────────────────────────────── */

export function isChecklistHidden(tenantId?: string | null): boolean {
  if (!tenantId) return true
  return read(`${CHECKLIST_HIDDEN_PREFIX}${tenantId}`) === '1'
}

export function hideChecklist(tenantId?: string | null) {
  if (tenantId) write(`${CHECKLIST_HIDDEN_PREFIX}${tenantId}`, '1')
}

/** Fired when a checklist step is completed somewhere other than the dashboard
 *  (the sidebar's copy-link button, the QR screen), so the card can tick the
 *  row without waiting for a remount. */
export const FIRST_STEPS_EVENT = 'miprecio:first-steps'

/** Sharing is the one step with no server-side trace, so the CRM records it
 *  when the shop copies its public link or downloads a QR. */
export function isQrShared(tenantId?: string | null): boolean {
  if (!tenantId) return false
  return read(`${QR_SHARED_PREFIX}${tenantId}`) === '1'
}

export function markQrShared(tenantId?: string | null) {
  if (!tenantId) return
  write(`${QR_SHARED_PREFIX}${tenantId}`, '1')
  window.dispatchEvent(new CustomEvent(FIRST_STEPS_EVENT))
}

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
