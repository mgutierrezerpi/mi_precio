import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  TOUR_STEPS,
  checklistFor,
  checklistProgress,
  hideChecklist,
  isChecklistHidden,
  isQrShared,
  isTourSeen,
  markQrShared,
  markTourSeen,
  resetTour,
} from './onboardingTour'

const list = (over: Partial<{ published: boolean; live: boolean }> = {}) => ({
  published: false,
  live: false,
  ...over,
})

// vitest.setup.ts stubs localStorage with vi.fn()s that store nothing, which
// cannot answer "does this survive a write?". These tests are exactly about
// persistence, so they run against a real in-memory Storage instead.
beforeEach(() => {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  })
})
afterEach(() => vi.unstubAllGlobals())

describe('tour state', () => {
  it('shows the tour once per user and never again', () => {
    expect(isTourSeen('u1')).toBe(false)
    markTourSeen('u1')
    expect(isTourSeen('u1')).toBe(true)
  })

  it('keeps each user separate on a shared browser', () => {
    markTourSeen('u1')
    expect(isTourSeen('u2')).toBe(false)
  })

  it('treats an unknown user as seen, so a half-loaded session never flashes it', () => {
    expect(isTourSeen(undefined)).toBe(true)
    expect(isTourSeen(null)).toBe(true)
  })

  it('replays after a reset', () => {
    markTourSeen('u1')
    resetTour('u1')
    expect(isTourSeen('u1')).toBe(false)
  })

  it('opens on a welcome step with no anchor, so step 1 never depends on layout', () => {
    expect(TOUR_STEPS[0].anchor).toBeUndefined()
    expect(TOUR_STEPS.length).toBeGreaterThan(1)
  })
})

describe('checklist state', () => {
  it('hides per tenant', () => {
    expect(isChecklistHidden('t1')).toBe(false)
    hideChecklist('t1')
    expect(isChecklistHidden('t1')).toBe(true)
    expect(isChecklistHidden('t2')).toBe(false)
  })

  it('records sharing per tenant', () => {
    expect(isQrShared('t1')).toBe(false)
    markQrShared('t1')
    expect(isQrShared('t1')).toBe(true)
    expect(isQrShared('t2')).toBe(false)
  })
})

describe('checklistFor', () => {
  const fresh = {
    productCount: 0,
    appearance: {},
    lists: [],
    qrShared: false,
  }
  const step = (input: Parameters<typeof checklistFor>[0], id: string) =>
    checklistFor(input).find((i) => i.id === id)!

  it('starts a brand-new account with nothing done', () => {
    const { done, total, complete } = checklistProgress(checklistFor(fresh))
    expect(done).toBe(0)
    expect(total).toBe(5)
    expect(complete).toBe(false)
  })

  // Also pins that there is no "pick a plan" step: the plan gate means an
  // account without one never reaches the dashboard to see this card.
  it('leads with the catalog, in the order the work actually happens', () => {
    expect(checklistFor(fresh).map((i) => i.id)).toEqual([
      'products',
      'design',
      'list',
      'publish',
      'share',
    ])
  })

  it('counts the catalog, so products tick before any list exists', () => {
    expect(step({ ...fresh, productCount: 4 }, 'products').done).toBe(true)
    expect(step({ ...fresh, productCount: 4 }, 'list').done).toBe(false)
  })

  it('ticks design on any appearance field, since all are null when fresh', () => {
    expect(step(fresh, 'design').done).toBe(false)
    for (const field of [
      'logoUrl',
      'brandColor',
      'listDesign',
      'listHeroColor',
      'listBgUrl',
    ] as const)
      expect(step({ ...fresh, appearance: { [field]: 'x' } }, 'design').done).toBe(true)
  })

  it('will not claim a list is published when the plan does not serve it', () => {
    const offline = { ...fresh, lists: [list({ published: true, live: false })] }
    expect(step(offline, 'publish').done).toBe(false)

    const online = { ...fresh, lists: [list({ published: true, live: true })] }
    expect(step(online, 'publish').done).toBe(true)
  })

  it('completes once every step is done', () => {
    const items = checklistFor({
      productCount: 8,
      appearance: { listDesign: 'catalog' },
      lists: [list({ published: true, live: true })],
      qrShared: true,
    })
    expect(checklistProgress(items).complete).toBe(true)
  })
})
