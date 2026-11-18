import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { store } from '../../store'
import { logout, setTenant } from '../../store/slices/authSlice'
import type { PlanInfo, Tenant } from '../../types'
import { LeadsScreen } from './LeadsScreen'

const mocks = vi.hoisted(() => ({
  getPlan: vi.fn(),
  getLeads: vi.fn(),
}))

vi.mock('../../services/api', () => ({
  default: {
    getPlan: mocks.getPlan,
    getLeads: mocks.getLeads,
    setToken: vi.fn(),
  },
}))
vi.mock('./crm/CrmLayout', () => ({
  CrmLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const paint = async (storedPlan: Tenant['plan'], info: Partial<PlanInfo>) => {
  await store.dispatch(logout())
  mocks.getPlan.mockResolvedValue({ data: info })
  store.dispatch(setTenant({ id: 't1', plan: storedPlan } as Tenant))
  render(
    <Provider store={store}>
      <MemoryRouter>
        <LeadsScreen />
      </MemoryRouter>
    </Provider>
  )
  await waitFor(() => expect(store.getState().plan.status).toBe('loaded'))
}

describe('LeadsScreen', () => {
  beforeEach(() => {
    mocks.getLeads.mockReset()
    mocks.getLeads.mockResolvedValue({ data: [] })
  })

  it('opens the inbox during the Pro trial, when tenant.plan is free (N2)', async () => {
    await paint('free', {
      plan: 'pro',
      features: ['leads'],
      trialActive: true,
    })

    await waitFor(() => expect(mocks.getLeads).toHaveBeenCalledWith('t1'))
    expect(screen.queryByText(/vienen con Plus y Pro/)).toBeNull()
  })

  it('keeps the upsell for a plan without leads', async () => {
    await paint('micro', { plan: 'micro', features: [], trialActive: false })

    expect(await screen.findByText(/vienen con Plus y Pro/)).toBeTruthy()
    expect(mocks.getLeads).not.toHaveBeenCalled()
  })
})
