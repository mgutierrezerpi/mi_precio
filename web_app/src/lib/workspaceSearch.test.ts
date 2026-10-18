import { describe, expect, it } from 'vitest'
import { pickSearchTarget } from './workspaceSearch'

const data = {
  products: [{ name: 'Espresso', sku: 'CAF-01', category: 'Cafés' }],
  customers: [
    { name: 'Carlos Methol', email: 'cmethol@gmail.com', phone: '091 447 200' },
  ],
  lists: [{ name: 'Mayorista' }],
}

describe('pickSearchTarget (M10)', () => {
  it('opens Products filtered when a product matches', () => {
    expect(pickSearchTarget('espresso', data)).toBe('/admin/items?q=espresso')
    expect(pickSearchTarget('caf-01', data)).toBe('/admin/items?q=caf-01')
  })

  it('opens Customers when only a customer matches', () => {
    // «Methol» used to land on an empty Products screen.
    expect(pickSearchTarget('Methol', data)).toBe('/admin/customers?q=Methol')
    expect(pickSearchTarget('447 200', data)).toBe(
      '/admin/customers?q=447%20200'
    )
  })

  it('opens Lists when only a list matches', () => {
    expect(pickSearchTarget('mayor', data)).toBe('/admin/lists?q=mayor')
  })

  it('falls back to Products when nothing matches', () => {
    expect(pickSearchTarget('zzz', data)).toBe('/admin/items?q=zzz')
    expect(pickSearchTarget('  ', data)).toBe('/admin/items')
  })
})
