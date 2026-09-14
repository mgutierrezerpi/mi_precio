import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { DesignProps } from '../designs'
import { PencilList, pencilTemplateDefaults } from './index'
import { pencilCartThemeFor } from './cartTheme'
import type { PencilVariant } from './variants'

const variants: PencilVariant[] = [
  'pencil-bakery',
  'pencil-garden',
  'pencil-market',
  'pencil-evening',
  'pencil-workshop',
  'pencil-cheese',
  'pencil-flower',
  'pencil-flower-summer',
  'pencil-flower-winter',
  'pencil-flower-spring',
  'pencil-wine',
  'pencil-cheese-alternating',
  'pencil-hardware-alternating',
  'pencil-hardware-weekend',
  'pencil-hardware-shelf',
  'pencil-casa-ritual',
  'pencil-casa-bath',
  'pencil-casa-signature',
  'pencil-casa-services',
  'pencil-auto-detail',
  'pencil-blush-bloom',
  'pencil-nova',
  'pencil-beardy',
  'pencil-calm-spa',
  'pencil-union-barber',
  'pencil-studio-mono',
  'pencil-beauty-issue',
  'pencil-obsidian-quarterly',
]

const props = {
  tenant: { name: 'Demo Studio' },
  sections: [
    {
      key: 'services',
      name: 'Services',
      min: 1,
      max: 2,
      items: [
        {
          id: 'item-1',
          name: 'Signature service',
          price: '42',
          description: 'A considered detail.',
        },
      ],
    },
  ],
  cart: {},
  cartCount: 0,
  addToCart: () => undefined,
  decFromCart: () => undefined,
  openCart: () => undefined,
  waHref: '#',
  isService: false,
  content: {
    schemaVersion: 1,
    hero: {
      eyebrow: 'Demo',
      title: 'Demo price list',
      body: 'A short description.',
    },
    blocks: [],
  },
  listName: 'Demo price list',
  monthYear: 'AUG 2026',
} as unknown as DesignProps

describe('Pencil price-list templates', () => {
  it.each(variants)('renders %s', (variant) => {
    const view = render(<PencilList variant={variant} {...props} />)
    expect(view.container.textContent).toContain('Demo')
    view.unmount()
  })

  it.each(variants)('derives a readable cart theme for %s', (variant) => {
    const theme = pencilCartThemeFor(variant)
    expect(theme.bg).toMatch(/^#/)
    expect(theme.accent ?? '').toMatch(/^#/)
    expect(theme.actionAccent ?? '').toMatch(/^#/)
    expect(theme.cardRadius).toBeTruthy()
    expect(theme.buttonRadius).toBeTruthy()
  })

  it('honors intentional blank template fields instead of restoring defaults', () => {
    const view = render(
      <PencilList
        variant="pencil-flower-winter"
        {...props}
        content={{
          schemaVersion: 1,
          hero: {
            eyebrow: 'Demo',
            title: 'Demo price list',
            body: 'A short description.',
          },
          blocks: [],
          template: {
            imageLabel: '',
            imageTitle: '',
            promoEyebrow: '',
            promoTitle: '',
            promoBody: '',
            promoPrice: '',
            promoNote: '',
            footerLeft: '',
            footerRight: '',
          },
        }}
      />
    )

    expect(view.container.textContent).not.toContain(
      'WILD STEM STUDIO · WINTER EDITION'
    )
    expect(view.container.textContent).not.toContain(
      'Flowers for the darker hours.'
    )
    expect(view.container.textContent).not.toContain('order by Thursday')
    view.unmount()
  })

  it('renders a selected divider icon and per-list palette', () => {
    const view = render(
      <PencilList
        variant="pencil-flower-summer"
        {...props}
        content={{
          schemaVersion: 1,
          blocks: [],
          template: {
            dividerIcon: 'leaf',
            backgroundColor: '#F7FAF5',
            textColor: '#153D2E',
            mutedColor: '#557064',
            accentColor: '#176B45',
            darkPanelColor: '#0F4D32',
          },
        }}
      />
    )

    expect(view.container.querySelector('img[src$="/leaf.svg"]')).toBeTruthy()
    expect(view.container.firstElementChild?.getAttribute('style')).toContain(
      'background: #F7FAF5'
    )
    view.unmount()
  })

  it('portals a clicked product image above storefront chrome', () => {
    const imageItems = [
      {
        ...props.sections[0].items[0],
        imageUrl: '/plant.jpg',
        imageThumbUrl: '/plant-thumb.jpg',
      },
      {
        ...props.sections[0].items[0],
        id: 'item-2',
        name: 'Second plant',
        imageUrl: '/plant-2.jpg',
        imageThumbUrl: '/plant-2-thumb.jpg',
      },
    ]
    const view = render(
      <PencilList
        variant="pencil-flower-summer"
        {...props}
        allItems={imageItems}
        sections={[
          {
            ...props.sections[0],
            items: imageItems,
          },
        ]}
      />
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ver foto de Signature service',
      })
    )
    const dialog = screen.getByRole('dialog', { name: /foto de/i })
    expect(dialog.parentElement).toBe(document.body)
    expect(dialog.className).toContain('z-[9999]')
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }))
    expect(screen.getByAltText('Second plant')).toBeTruthy()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByAltText('Signature service')).toBeTruthy()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    view.unmount()
  })

  it('makes every visible Casa Services label authorable', () => {
    const view = render(
      <PencilList
        variant="pencil-casa-services"
        {...props}
        sections={[
          {
            ...props.sections[0],
            key: 'otros',
            name: 'Otros',
          },
        ]}
        content={{
          schemaVersion: 1,
          blocks: [],
          template: {
            masthead: 'CONSULTORÍA',
            brandLabel: 'Acme Software',
            editionLabel: 'EDICIÓN 04',
            uncategorizedLabel: 'Servicios técnicos',
            footerLeft: 'Construimos productos digitales.',
          },
        }}
      />
    )

    expect(view.container.textContent).toContain('CONSULTORÍA')
    expect(view.container.textContent).toContain('Acme Software')
    expect(view.container.textContent).toContain('EDICIÓN 04')
    expect(view.container.textContent).toContain('Servicios técnicos')
    expect(view.container.textContent).toContain(
      'Construimos productos digitales.'
    )
    expect(view.container.textContent).not.toContain('Casa Férrea')
    expect(view.container.textContent).not.toContain('AUG 2026')
    view.unmount()
  })

  it('provides Casa Services defaults to the customization form', () => {
    expect(pencilTemplateDefaults('pencil-casa-services')).toMatchObject({
      masthead: 'SERVICIOS',
      brandLabel: 'Casa Férrea',
      uncategorizedLabel: 'Otros',
      footerLeft: 'Un servicio pensado para acompañar cada proyecto.',
    })
  })

  it('removes empty Casa Services chrome instead of restoring defaults', () => {
    const view = render(
      <PencilList
        variant="pencil-casa-services"
        {...props}
        sections={[
          {
            ...props.sections[0],
            key: 'otros',
            name: 'Otros',
          },
        ]}
        content={{
          schemaVersion: 1,
          blocks: [],
          template: {
            masthead: '',
            brandLabel: '',
            editionLabel: '',
            uncategorizedLabel: '',
            footerLeft: '',
          },
        }}
      />
    )

    expect(view.container.textContent).toContain('Signature service')
    expect(view.container.textContent).not.toContain('SERVICIOS')
    expect(view.container.textContent).not.toContain('Casa Férrea')
    expect(view.container.textContent).not.toContain('AUG 2026')
    expect(view.container.textContent).not.toContain('Otros')
    expect(view.container.textContent).not.toContain(
      'Un servicio pensado para acompañar cada proyecto.'
    )
    view.unmount()
  })
})
