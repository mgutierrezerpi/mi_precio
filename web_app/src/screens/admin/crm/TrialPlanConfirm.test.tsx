import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { getT } from '../../../lib/i18n'
import { TrialPlanConfirm } from './TrialPlanConfirm'

const paint = (
  props: Partial<Parameters<typeof TrialPlanConfirm>[0]> = {},
  language = 'es'
) => {
  const onConfirm = vi.fn()
  const onDismiss = vi.fn()
  const { container } = render(
    <TrialPlanConfirm
      t={getT(language)}
      plan="Pro"
      price="$U 1.500"
      trialEnds="2 de diciembre de 2026"
      charges
      busy={false}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
      {...props}
    />
  )
  return { container, onConfirm, onDismiss }
}

describe('TrialPlanConfirm (N7)', () => {
  it('says the charge is immediate and the trial days are lost', () => {
    const { container } = paint()

    expect(container.textContent).toContain('se cobran $U 1.500 en ese momento')
    expect(container.textContent).toContain('2 de diciembre de 2026')
    expect(container.textContent).toContain('se pierden')
  })

  it.each(['en', 'pt'])('is translated to %s', (language) => {
    const { container } = paint({}, language)

    expect(container.textContent).toContain('$U 1.500')
    expect(container.textContent).not.toContain('bill.trial')
    expect(container.textContent).not.toContain('se cobran')
  })

  it('does not mention a charge when there is no payment gateway', () => {
    const { container } = paint({ charges: false })

    expect(container.textContent).not.toContain('se cobran')
    expect(container.textContent).toContain('tu prueba gratis termina ahora')
  })

  it('goes on only after the owner confirms', () => {
    const { onConfirm, onDismiss } = paint()
    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Volver' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar al pago' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
