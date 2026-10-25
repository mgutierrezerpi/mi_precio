import { describe, expect, it } from 'vitest'
import type { Tenant } from '../../types'
import { tenantNeedsPlan } from './authSelectors'

const tenant = (overrides: Partial<Tenant> = {}) =>
  ({ plan: 'free', planGate: true, ...overrides }) as Tenant

describe('tenantNeedsPlan', () => {
  it('keeps a new tenant open during its cardless trial', () => {
    expect(
      tenantNeedsPlan(
        tenant({ trialEndsAt: new Date(Date.now() + 60_000).toISOString() }),
      ),
    ).toBe(false)
  })

  it('requires a plan once the cardless trial expires', () => {
    expect(
      tenantNeedsPlan(
        tenant({ trialEndsAt: new Date(Date.now() - 60_000).toISOString() }),
      ),
    ).toBe(true)
  })

  it('does not gate a paid tenant', () => {
    expect(tenantNeedsPlan(tenant({ plan: 'plus' }))).toBe(false)
  })
})
