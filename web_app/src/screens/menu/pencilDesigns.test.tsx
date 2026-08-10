import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { DesignProps } from './designs'
import { PencilList, type PencilVariant } from './pencilDesigns'

const variants: PencilVariant[] = [
  'pencil-bakery', 'pencil-garden', 'pencil-market', 'pencil-evening', 'pencil-workshop',
  'pencil-cheese', 'pencil-flower', 'pencil-flower-summer', 'pencil-flower-winter', 'pencil-flower-spring', 'pencil-wine',
  'pencil-cheese-alternating', 'pencil-hardware-alternating', 'pencil-hardware-weekend', 'pencil-hardware-shelf',
  'pencil-casa-ritual', 'pencil-casa-bath', 'pencil-casa-signature', 'pencil-casa-services', 'pencil-auto-detail',
  'pencil-blush-bloom', 'pencil-nova', 'pencil-beardy', 'pencil-calm-spa', 'pencil-union-barber',
  'pencil-studio-mono', 'pencil-beauty-issue', 'pencil-obsidian-quarterly',
]

const props = {
  tenant: { name: 'Demo Studio' },
  sections: [{ key: 'services', name: 'Services', min: 1, max: 2, items: [{ id: 'item-1', name: 'Signature service', price: '42', description: 'A considered detail.' }] }],
  cart: {},
  cartCount: 0,
  addToCart: () => undefined,
  decFromCart: () => undefined,
  openCart: () => undefined,
  waHref: '#',
  isService: false,
  content: { schemaVersion: 1, hero: { eyebrow: 'Demo', title: 'Demo price list', body: 'A short description.' }, blocks: [] },
  listName: 'Demo price list',
  monthYear: 'AUG 2026',
} as unknown as DesignProps

describe('Pencil price-list templates', () => {
  it.each(variants)('renders %s', (variant) => {
    const view = render(<PencilList variant={variant} {...props} />)
    expect(view.container.textContent).toContain('Demo')
    view.unmount()
  })
})
