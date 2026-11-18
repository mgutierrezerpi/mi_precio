import { render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { store } from '../../../store'
import { setTenant } from '../../../store/slices/authSlice'
import { TOUR_STEPS } from '../../../lib/onboardingTourStorage'
import type { PlanInfo, Tenant } from '../../../types'
import { CrmSidebar } from './CrmSidebar'

const mocks = vi.hoisted(() => ({
  getPlan: vi.fn(),
}))

vi.mock('../../../services/api', () => ({
  default: {
    getLists: vi.fn(async () => ({ data: [] })),
    getTenant: vi.fn(async () => ({})),
    getPlan: mocks.getPlan,
  },
}))

const answersPlan = (info: Partial<PlanInfo>) =>
  mocks.getPlan.mockResolvedValue({ data: info })

describe('CrmSidebar', () => {
  it('carries every anchor the onboarding tour spotlights', () => {
    // A refactor once dropped these attributes and the tour silently showed
    // centered cards pointing at nothing.
    store.dispatch(
      setTenant({ id: 't1', subdomain: 'cafe', plan: 'pro' } as Tenant)
    )
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <CrmSidebar active="Overview" />
        </MemoryRouter>
      </Provider>
    )

    const anchors = TOUR_STEPS.flatMap((step) =>
      step.anchor ? [step.anchor] : []
    )
    for (const anchor of anchors) {
      expect(
        container.querySelector(`[data-tour="${anchor}"]`),
        anchor
      ).not.toBeNull()
    }
  })

  it('links to the leads inbox', () => {
    // The squash of #38 once dropped this item and left /admin/leads with no
    // way in from the app.
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <CrmSidebar active="Overview" />
        </MemoryRouter>
      </Provider>
    )
    expect(container.querySelector('a[href="/admin/leads"]')).not.toBeNull()
  })

  it('names the next plan in the upsell, not a fixed «Micro» (B10)', async () => {
    answersPlan({ plan: 'plus', features: ['leads'], trialActive: false })
    store.dispatch(
      setTenant({ id: 't1', subdomain: 'cafe', plan: 'plus' } as Tenant)
    )
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <CrmSidebar active="Overview" />
        </MemoryRouter>
      </Provider>
    )
    await waitFor(() => expect(container.textContent).toContain('Plan Plus'))
    const aside = container.textContent ?? ''
    expect(aside).not.toContain('Micro')
    expect(aside).toContain('$U 1.500')
  })

  it('does not call a Pro trial «Sin plan» nor sell it Micro (N2)', async () => {
    answersPlan({ plan: 'pro', features: ['leads'], trialActive: true })
    store.dispatch(
      setTenant({ id: 't-trial', subdomain: 'cafe', plan: 'free' } as Tenant)
    )
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <CrmSidebar active="Overview" />
        </MemoryRouter>
      </Provider>
    )
    await waitFor(() =>
      expect(mocks.getPlan).toHaveBeenCalledWith('t-trial')
    )
    await waitFor(() =>
      expect(store.getState().plan.status).toBe('loaded')
    )

    expect(container.textContent).not.toContain('Sin plan')
    expect(container.textContent).not.toContain('Subí a Micro')
  })
})
