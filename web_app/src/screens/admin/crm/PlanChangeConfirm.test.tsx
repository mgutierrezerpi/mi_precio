import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { hasLiveSubscription } from '../../../lib/plans'
import type { PlanInfo } from '../../../types'
import { PlanChangeConfirm } from './PlanChangeConfirm'

const t = (key: string) => key

function planInfo(
  billing: Partial<NonNullable<PlanInfo['billing']>> = {},
  overrides: Partial<PlanInfo> = {}
): PlanInfo {
  return {
    plan: 'plus',
    limits: { products: 300, lists: 15, members: 5 },
    usage: { products: 1, lists: 1, members: 1 },
    billingEnabled: true,
    billing: {
      provider: 'lemonsqueezy',
      customerId: 'c1',
      subscriptionId: 'sub_1',
      variantId: 'v1',
      status: 'active',
      renewsAt: null,
      endsAt: null,
      trialEndsAt: null,
      portalUrl: null,
      updatePaymentUrl: null,
      cardBrand: null,
      cardLastFour: null,
      ...billing,
    },
    ...overrides,
  }
}

describe('hasLiveSubscription', () => {
  it.each([
    ['an active subscription', planInfo()],
    [
      'a cancelled one still in its paid period',
      planInfo({ status: 'cancelled' }),
    ],
    ['an abandoned upgrade checkout', planInfo({ status: 'checkout_pending' })],
  ])('is true for %s', (_label, info) => {
    expect(hasLiveSubscription(info)).toBe(true)
  })

  it.each([
    ['no plan info', null],
    ['an expired subscription', planInfo({ status: 'expired' })],
    ['a trial with no subscription', planInfo({ subscriptionId: null })],
    ['a manual plan', planInfo({ provider: 'manual' })],
    ['the free plan', planInfo({}, { plan: 'free' })],
    ['billing turned off', planInfo({}, { billingEnabled: false })],
  ])('is false for %s', (_label, info) => {
    expect(hasLiveSubscription(info)).toBe(false)
  })
})

describe('PlanChangeConfirm', () => {
  const paint = (props: { resumes?: boolean; busy?: boolean } = {}) => {
    const onConfirm = vi.fn()
    const onDismiss = vi.fn()
    render(
      <PlanChangeConfirm
        t={t}
        from="Plus"
        to="Pro"
        resumes={props.resumes ?? false}
        busy={props.busy ?? false}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
      />
    )
    return { onConfirm, onDismiss }
  }

  it('changes the plan only after the owner confirms', () => {
    const { onConfirm, onDismiss } = paint()
    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'bill.change.yes' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('can be dismissed without changing anything', () => {
    const { onConfirm, onDismiss } = paint()

    fireEvent.click(screen.getByRole('button', { name: 'bill.change.no' }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('warns that a cancelled subscription starts renewing again', () => {
    paint({ resumes: true })

    expect(screen.getByText('bill.change.confirmResume')).toBeTruthy()
  })
})
