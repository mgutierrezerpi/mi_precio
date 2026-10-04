import { describe, expect, it } from 'vitest'
import { whatsappOrderHref, whatsappPhone } from './whatsappOrder'

describe('whatsappPhone', () => {
  it('reads the number the shop typed, formatting and all', () => {
    expect(whatsappPhone({ socialWhatsapp: '+598 98 402 451' })).toBe(
      '59898402451'
    )
  })

  it('drops the 00 international prefix wa.me does not accept', () => {
    expect(whatsappPhone({ socialWhatsapp: '0059898402451' })).toBe(
      '59898402451'
    )
  })

  it('falls back to the marketplace wa.me link', () => {
    expect(
      whatsappPhone({
        socialWhatsapp: null,
        whatsappUrl: 'https://wa.me/59898402451',
      })
    ).toBe('59898402451')
  })

  it('treats anything that is not a phone as no number', () => {
    expect(whatsappPhone({})).toBeNull()
    expect(
      whatsappPhone({ whatsappUrl: 'https://wa.me/message/AB12C' })
    ).toBeNull()
  })
})

describe('whatsappOrderHref', () => {
  it('sends the order straight to the shop chat', () => {
    expect(whatsappOrderHref('59898402451', 'Pedido: 2 x Yerba')).toBe(
      'https://wa.me/59898402451?text=Pedido%3A%202%20x%20Yerba'
    )
  })

  it('opens the chat picker only when there is no number', () => {
    expect(whatsappOrderHref(null, 'Hola')).toBe('https://wa.me/?text=Hola')
  })
})
