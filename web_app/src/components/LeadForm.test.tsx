import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LeadForm } from './LeadForm'
import type { Tenant } from '../types'

const createLead = vi.hoisted(() => vi.fn())
vi.mock('../services/api', () => ({ default: { createLead } }))

const tenant = {
  id: 't1',
  subdomain: 'cafe',
  name: 'Café Aurora',
  language: 'es',
  leadsEnabled: true,
} as unknown as Tenant

const paint = (over: Partial<Tenant> = {}) =>
  render(
    <LeadForm
      tenant={{ ...tenant, ...over }}
      listId="l1"
      listName="Menú"
      ink="#111111"
      accent="#7C3AED"
    />
  )

const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })

beforeEach(() => createLead.mockReset().mockResolvedValue({ data: { ok: true } }))
afterEach(() => vi.restoreAllMocks())

describe('LeadForm', () => {
  it('stays out of the way when the shop is not taking leads', () => {
    // jest-dom matchers are not set up in this project, so assert plainly.
    const { container } = paint({ leadsEnabled: false })
    expect(container.innerHTML).toBe('')
  })

  it('sends the contact along with the list they were reading', async () => {
    paint()
    fill('Tu nombre', 'Ana')
    fill('Teléfono o WhatsApp', '099 123 456')
    fireEvent.click(screen.getByText('Enviar'))

    await waitFor(() => expect(createLead).toHaveBeenCalledTimes(1))
    expect(createLead).toHaveBeenCalledWith(
      'cafe',
      expect.objectContaining({
        name: 'Ana',
        phone: '099 123 456',
        listId: 'l1',
        listName: 'Menú',
        source: 'form',
      })
    )
  })

  it('thanks them instead of leaving the form sitting there', async () => {
    paint()
    fill('Tu nombre', 'Ana')
    fill('Teléfono o WhatsApp', '099123456')
    fireEvent.click(screen.getByText('Enviar'))

    await waitFor(() => expect(screen.getByText('¡Gracias!')).toBeTruthy())
  })

  it('shows what the visitor can fix, and keeps what they typed', async () => {
    createLead.mockResolvedValue({ error: 'Dejanos un teléfono o un email.' })
    paint()
    fill('Tu nombre', 'Ana')
    fill('Teléfono o WhatsApp', 'no tengo')
    fireEvent.click(screen.getByText('Enviar'))

    await waitFor(() =>
      expect(screen.getByText('Dejanos un teléfono o un email.')).toBeTruthy()
    )
    expect(screen.getByLabelText<HTMLInputElement>('Tu nombre').value).toBe('Ana')
  })

  it('carries a honeypot that a person never sees', () => {
    const { container } = paint()
    const trap = container.querySelector<HTMLInputElement>('input[name="website"]')

    expect(trap).not.toBeNull()
    // Off-screen rather than display:none — some bots skip hidden fields, and
    // the point is that they fill it in.
    expect(trap!.getAttribute('aria-hidden')).toBe('true')
    expect(trap!.tabIndex).toBe(-1)
  })

  it('does not fire twice while the first send is in flight', async () => {
    let release: (v: unknown) => void = () => {}
    createLead.mockReturnValue(new Promise((r) => (release = r)))
    paint()
    fill('Tu nombre', 'Ana')
    fill('Teléfono o WhatsApp', '099123456')

    fireEvent.click(screen.getByText('Enviar'))
    fireEvent.click(screen.getByText('Enviando…'))

    expect(createLead).toHaveBeenCalledTimes(1)
    release({ data: { ok: true } })
  })
})
