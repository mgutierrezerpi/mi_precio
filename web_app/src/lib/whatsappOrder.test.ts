import { describe, expect, it } from 'vitest'
import { getT } from './i18n'
import {
  orderContactLines,
  whatsappOrderHref,
  whatsappPhone,
} from './whatsappOrder'

describe('orderContactLines', () => {
  const customer = {
    name: 'Ana',
    phone: '099 111 222',
    email: 'ana@example.com',
    delivery: 'delivery' as const,
    address: 'Calle 1',
    notes: '$& sin azúcar',
  }

  it.each([
    [
      'es',
      [
        'Nombre: Ana',
        'Tel: 099 111 222',
        'Email: ana@example.com',
        'Entrega: Envío a domicilio',
        'Dirección: Calle 1',
        'Notas: $& sin azúcar',
      ],
    ],
    [
      'en',
      [
        'Name: Ana',
        'Phone: 099 111 222',
        'Email: ana@example.com',
        `Delivery: ${getT('en')('store.cartShipping')}`,
        'Address: Calle 1',
        'Notes: $& sin azúcar',
      ],
    ],
    [
      'pt',
      [
        'Nome: Ana',
        'Tel: 099 111 222',
        'E-mail: ana@example.com',
        `Entrega: ${getT('pt')('store.cartShipping')}`,
        'Endereço: Calle 1',
        'Observações: $& sin azúcar',
      ],
    ],
  ])('writes the details in %s', (language, expected) => {
    expect(orderContactLines(customer, getT(language))).toEqual(expected)
  })

  it('leaves out what the customer did not fill in', () => {
    const lines = orderContactLines(
      {
        name: '',
        phone: '',
        email: '',
        delivery: 'pickup',
        address: 'Calle 1',
        notes: '',
      },
      getT('es')
    )
    expect(lines).toEqual(['Entrega: Retiro en el local'])
  })
})

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

  it('reads the number out of a link that carries a message (A9)', () => {
    // Taking every digit glued the text onto the number and sent the order
    // to a stranger or nowhere.
    expect(
      whatsappPhone({ whatsappUrl: 'https://wa.me/59899123456?text=Hola%2025' })
    ).toBe('59899123456')
    expect(
      whatsappPhone({
        whatsappUrl:
          'https://api.whatsapp.com/send?phone=59899123456&text=hola2',
      })
    ).toBe('59899123456')
    expect(
      whatsappPhone({ whatsappUrl: 'wa.me/+59899123456?text=Pedido' })
    ).toBe('59899123456')
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
