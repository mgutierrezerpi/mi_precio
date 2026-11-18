import { fireEvent, render, screen, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { store } from '../../store'
import { logout, setTenant, setUser } from '../../store/slices/authSlice'
import type { PlanInfo, Tenant, User } from '../../types'
import { SettingsCrmContent } from './SettingsCrmScreen'

const mocks = vi.hoisted(() => ({
  getPlan: vi.fn(),
  createCheckout: vi.fn(),
  updatePlan: vi.fn(),
}))

vi.mock('../../services/api', () => ({
  default: { ...mocks, setToken: vi.fn() },
}))

const trial: Partial<PlanInfo> = {
  plan: 'pro',
  features: ['leads'],
  trialActive: true,
  trialEndsAt: '2026-12-02T12:00:00Z',
  billingEnabled: true,
  usage: { products: 0, lists: 0, members: 1 },
  billing: undefined,
}

const paint = async (
  info: Partial<PlanInfo>,
  plan: Tenant['plan'] = 'free'
) => {
  await store.dispatch(logout())
  mocks.getPlan.mockResolvedValue({ data: info })
  store.dispatch(setUser({ id: 'u1', role: 'owner' } as User))
  store.dispatch(
    setTenant({ id: 't1', plan, language: 'es', name: 'Kiosco' } as Tenant)
  )
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin/settings?section=billing']}>
        <SettingsCrmContent />
      </MemoryRouter>
    </Provider>
  )
}

describe('Plan y facturación durante la prueba', () => {
  beforeEach(() => {
    mocks.createCheckout.mockReset()
    mocks.createCheckout.mockResolvedValue({ error: 'sin checkout' })
  })

  it('lets the owner subscribe to Pro and does not call it the current plan (N3)', async () => {
    await paint(trial)

    expect(
      await screen.findByRole('button', { name: 'Contratar Pro' })
    ).toBeTruthy()
    expect(screen.queryByText('Plan actual')).toBeNull()
    expect(screen.getByText('En prueba')).toBeTruthy()
  })

  it('warns before the checkout that the trial ends and the charge is immediate (N7)', async () => {
    await paint(trial)

    fireEvent.click(
      await screen.findByRole('button', { name: 'Contratar Plus' })
    )

    const dialog = screen.getByRole('alertdialog')
    expect(dialog.textContent).toContain('se cobran $U 800 en ese momento')
    expect(dialog.textContent).toContain('diciembre')
    expect(mocks.createCheckout).not.toHaveBeenCalled()

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Continuar al pago' })
    )
    expect(mocks.createCheckout).toHaveBeenCalledTimes(1)
    expect(mocks.createCheckout.mock.calls[0][1]).toBe('plus')
  })

  it('still marks a paid Pro as the current plan', async () => {
    await paint({ ...trial, trialActive: false, trialEndsAt: null }, 'pro')

    expect(await screen.findByText('Plan actual')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Contratar Pro' })).toBeNull()
    expect(screen.queryByText('En prueba')).toBeNull()
  })
})
