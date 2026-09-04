import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { getT } from '../../lib/i18n'
import { ListAppearanceFields } from './ListAppearanceFields'

describe('ListAppearanceFields', () => {
  it('opens a template preview from the visible card action', () => {
    render(
      <ListAppearanceFields
        t={getT('es')}
        value={{ design: 'classic', heroColor: null, bgUrl: null, bgOverlay: null }}
        onChange={vi.fn()}
        accent="#7C3AED"
      />
    )

    fireEvent.click(screen.getAllByRole('button', { name: /vista previa de/i })[1])

    expect(screen.getByRole('dialog', { name: 'Vista previa del tema' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cerrar vista previa' })).toBeTruthy()
  })
})
