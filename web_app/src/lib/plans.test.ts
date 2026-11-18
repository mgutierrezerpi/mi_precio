import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { PlanInfo } from '../types'
import { PLANS, trialHasEnded } from './plans'

const endingAt = (trialEndsAt: string | null) => ({ trialEndsAt }) as PlanInfo

describe('trialHasEnded (N12)', () => {
  const end = Date.UTC(2026, 10, 13, 12, 0, 0)

  // The bug only shows away from UTC: Montevideo read the end 3 hours late.
  beforeAll(() => {
    vi.stubEnv('TZ', 'America/Montevideo')
  })
  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it.each([
    ['with the UTC mark', '2026-11-13T12:00:00Z'],
    ['from a response that has no offset', '2026-11-13T12:00:00'],
  ])('reads the end %s as UTC', (_label, iso) => {
    expect(trialHasEnded(endingAt(iso), end - 1000)).toBe(false)
    expect(trialHasEnded(endingAt(iso), end + 1000)).toBe(true)
  })

  it('is false when there is no trial', () => {
    expect(trialHasEnded(endingAt(null), end)).toBe(false)
    expect(trialHasEnded(null, end)).toBe(false)
  })
})

describe('PLANS', () => {
  it('promises no free days: subscribing charges at once (N7)', () => {
    expect(JSON.stringify(PLANS)).not.toMatch(/prueba gratis/i)
  })
})
