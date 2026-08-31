/** Browser-persisted state for the first-login tour and checklist visibility. */

const TOUR_SEEN_PREFIX = 'mp_tour_seen_'
const CHECKLIST_HIDDEN_PREFIX = 'mp_first_steps_hidden_'
const QR_SHARED_PREFIX = 'mp_qr_shared_'

export interface TourStep {
  id: string
  anchor?: string
  placement?: 'right' | 'bottom'
}

export const TOUR_STEPS: TourStep[] = [
  { id: 'welcome' },
  { id: 'lists', anchor: 'nav-lists', placement: 'right' },
  { id: 'products', anchor: 'nav-products', placement: 'right' },
  { id: 'brand', anchor: 'nav-settings', placement: 'right' },
  { id: 'design', anchor: 'nav-lists', placement: 'right' },
  { id: 'qr', anchor: 'nav-qr', placement: 'right' },
  { id: 'share', anchor: 'share-link', placement: 'right' },
  { id: 'support', anchor: 'nav-support', placement: 'right' },
]

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage is optional for this onboarding nicety.
  }
}

function remove(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Storage is optional for this onboarding nicety.
  }
}

export function isTourSeen(userId?: string | null): boolean {
  return !userId || read(`${TOUR_SEEN_PREFIX}${userId}`) === '1'
}

export function markTourSeen(userId?: string | null) {
  if (userId) write(`${TOUR_SEEN_PREFIX}${userId}`, '1')
}

export function resetTour(userId?: string | null) {
  if (userId) remove(`${TOUR_SEEN_PREFIX}${userId}`)
}

export function isChecklistHidden(tenantId?: string | null): boolean {
  return !tenantId || read(`${CHECKLIST_HIDDEN_PREFIX}${tenantId}`) === '1'
}

export function hideChecklist(tenantId?: string | null) {
  if (tenantId) write(`${CHECKLIST_HIDDEN_PREFIX}${tenantId}`, '1')
}

export const FIRST_STEPS_EVENT = 'miprecio:first-steps'

export function isQrShared(tenantId?: string | null): boolean {
  return !!tenantId && read(`${QR_SHARED_PREFIX}${tenantId}`) === '1'
}

export function markQrShared(tenantId?: string | null) {
  if (!tenantId) return
  write(`${QR_SHARED_PREFIX}${tenantId}`, '1')
  window.dispatchEvent(new CustomEvent(FIRST_STEPS_EVENT))
}
