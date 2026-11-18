import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PlanInfo } from '../../../types'
import { SubscriptionPanel } from './SubscriptionPanel'

const mocks = vi.hoisted(() => ({
  cancelSubscription: vi.fn(),
  resumeSubscription: vi.fn(),
}))
vi.mock('../../../services/api', () => ({ default: mocks }))

const t = (key: string, vars?: Record<string, string | number>) =>
  vars?.date ? `${key}:${vars.date}` : key

function planInfo(
  billing: Partial<NonNullable<PlanInfo['billing']>> = {},
  plan: PlanInfo['plan'] = 'plus'
): PlanInfo {
  return {
    plan,
    limits: { products: 300, lists: 15, members: 5 },
    usage: { products: 1, lists: 1, members: 1 },
    billingEnabled: true,
    billing: {
      provider: 'lemonsqueezy',
      customerId: 'c1',
      subscriptionId: 'sub_1',
      variantId: 'v1',
      status: 'active',
      renewsAt: '2026-12-10T12:00:00',
      endsAt: null,
      trialEndsAt: null,
      portalUrl: null,
      updatePaymentUrl: null,
      cardBrand: 'visa',
      cardLastFour: '4242',
      ...billing,
    },
  }
}

function setup(info: PlanInfo | null, isOwner = true) {
  const onTenantChanged = vi.fn()
  const onChanged = vi.fn().mockResolvedValue(undefined)
  const view = render(
    <SubscriptionPanel
      t={t}
      info={info}
      isOwner={isOwner}
      tenantId="tenant-1"
      language="es"
      onTenantChanged={onTenantChanged}
      onChanged={onChanged}
    />
  )
  return { ...view, onTenantChanged, onChanged }
}

beforeEach(() => {
  mocks.cancelSubscription.mockReset()
  mocks.resumeSubscription.mockReset()
})

describe('SubscriptionPanel', () => {
  it('asks for confirmation before cancelling, then refreshes the plan', async () => {
    const tenant = { id: 'tenant-1' }
    mocks.cancelSubscription.mockResolvedValue({ data: tenant })
    const { onTenantChanged, onChanged } = setup(planInfo())

    fireEvent.click(screen.getByRole('button', { name: 'bill.sub.cancel' }))
    expect(mocks.cancelSubscription).not.toHaveBeenCalled()
    expect(screen.getByText(/^bill\.sub\.confirm:/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'bill.sub.confirmYes' }))

    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
    expect(mocks.cancelSubscription).toHaveBeenCalledWith('tenant-1')
    expect(onTenantChanged).toHaveBeenCalledWith(tenant)
  })

  it('keeps the panel open and shows the error when cancelling fails', async () => {
    mocks.cancelSubscription.mockResolvedValue({ error: 'Probá de nuevo' })
    const { onChanged } = setup(planInfo())

    fireEvent.click(screen.getByRole('button', { name: 'bill.sub.cancel' }))
    fireEvent.click(screen.getByRole('button', { name: 'bill.sub.confirmYes' }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Probá de nuevo'
    )
    expect(onChanged).not.toHaveBeenCalled()
  })

  it('offers to resume a cancelled subscription and shows when access ends', async () => {
    mocks.resumeSubscription.mockResolvedValue({ data: { id: 'tenant-1' } })
    const { onChanged } = setup(
      planInfo({
        status: 'cancelled',
        renewsAt: null,
        endsAt: '2026-12-10T12:00:00',
      })
    )

    expect(screen.getByText('bill.sub.accessUntil')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'bill.sub.cancel' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'bill.sub.resume' }))

    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
    expect(mocks.resumeSubscription).toHaveBeenCalledWith('tenant-1')
  })

  it('still lets an owner cancel after abandoning an upgrade checkout', () => {
    setup(planInfo({ status: 'checkout_pending' }))

    expect(screen.getByRole('button', { name: 'bill.sub.cancel' })).toBeTruthy()
    expect(screen.queryByText('billingStatus.checkout_pending')).toBeNull()
  })

  it.each([
    ['no plan info', null],
    ['no subscription', planInfo({ status: null })],
    ['the free plan', planInfo({}, 'free')],
    [
      'a trial with an open checkout',
      planInfo({ status: 'checkout_pending', subscriptionId: null }, 'pro'),
    ],
  ])('renders nothing for %s', (_label, info) => {
    const { container } = setup(info)

    expect(container.firstChild).toBeNull()
  })

  it('shows the state but no actions to someone who is not the owner', () => {
    setup(planInfo(), false)

    expect(screen.getByText('bill.sub.title')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'bill.sub.cancel' })).toBeNull()
  })

  it('has no cancel button for a plan with no provider subscription', () => {
    setup(planInfo({ provider: 'manual', subscriptionId: null }))

    expect(screen.queryByRole('button', { name: 'bill.sub.cancel' })).toBeNull()
  })
})
