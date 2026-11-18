import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { getT } from '../../lib/i18n'
import type { Tenant } from '../../types'
import { ChoosePlanContent } from './ChoosePlanContent'

const kiosco = { id: 'new', name: 'Kiosco A11 QA' } as Tenant
const aurora = { id: 'old', name: 'Café Aurora' } as Tenant

const paint = (props: Partial<Parameters<typeof ChoosePlanContent>[0]>) =>
  render(
    <ChoosePlanContent
      choosing={null}
      checking={false}
      confirming={false}
      error={null}
      expired={false}
      isOwner
      noPaymentYet={false}
      tenant={kiosco}
      t={getT('es')}
      onChoosePlan={() => {}}
      onLogout={() => {}}
      onRecheck={() => {}}
      {...props}
    />
  )

describe('ChoosePlanContent', () => {
  it('offers the way back to the other businesses (A11)', () => {
    // Creating a second business used to leave only «Salir» on this screen.
    const onSwitchTenant = vi.fn()
    paint({ otherTenants: [aurora], onSwitchTenant })

    fireEvent.click(
      screen.getByRole('button', { name: /Volver a Café Aurora/ })
    )
    expect(onSwitchTenant).toHaveBeenCalledWith(aurora)
  })

  it('does not promise a trial that subscribing skips (N7)', () => {
    // The checkout charges at once, so these cards cannot offer free days.
    const { container } = paint({})

    expect(container.textContent).not.toMatch(/prueba gratis/i)
    expect(container.textContent).not.toMatch(/No se cobra nada/i)
    expect(container.textContent).toContain('momento de suscribirte')
  })

  it('shows only «Salir» when there is no other business', () => {
    paint({})
    expect(screen.queryByRole('button', { name: /Volver a/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'Salir' })).toBeTruthy()
  })
})
