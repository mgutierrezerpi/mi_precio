import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../../services/api'
import { getT } from '../../lib/i18n'
import { MenuScreen } from './MenuScreen'

const LANGUAGES = ['en', 'pt'] as const

function menu(language: string, template?: Record<string, unknown>) {
  return {
    data: {
      tenant: {
        name: 'Test Shop',
        subdomain: 'test-shop',
        currency: 'UYU',
        language,
        listDesign: 'store',
        socialWhatsapp: '59899111222',
      },
      lists: [
        {
          id: 'list-1',
          name: 'Menu',
          slug: 'menu',
          kind: 'product',
          version: {
            id: 'version-1',
            versionNumber: 1,
            content: { schemaVersion: 1, blocks: [], template },
            items: [
              {
                id: 'item-1',
                name: 'Espresso',
                price: '1250',
                category: null,
              },
            ],
          },
        },
      ],
      magazines: [],
      viewerIdentified: true,
    },
  }
}

function open(path = '/p/test-shop') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/p/:subdomain" element={<MenuScreen />} />
        <Route path="/p/:subdomain/:listId" element={<MenuScreen />} />
      </Routes>
    </MemoryRouter>
  )
}

async function openCart(language: string) {
  const t = getT(language)
  const add = await screen.findAllByRole('button', { name: t('pub.add') })
  fireEvent.click(add[0])
  fireEvent.click(
    screen.getAllByRole('button', { name: new RegExp(t('store.myCart')) })[0]
  )
  return t
}

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn())
  vi.spyOn(api, 'recordPublicView').mockResolvedValue({
    data: undefined,
  } as never)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe.each(LANGUAGES)('public page of a shop in %s', (language) => {
  it('shows the catalog in the language of the shop', async () => {
    vi.spyOn(api, 'getPublicMenu').mockResolvedValue(menu(language) as never)
    const t = getT(language)

    open()

    expect(
      (await screen.findAllByRole('button', { name: t('pub.add') })).length
    ).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Agregar' })).toBeNull()
    // Screen readers and the browser's translate offer go by this attribute.
    expect(document.documentElement.lang).toBe(language)
    // Items without a category fall under our own word for it.
    expect(screen.getAllByText(t('store.other')).length).toBeGreaterThan(0)
  })

  it('writes the WhatsApp order in the language of the shop', async () => {
    vi.spyOn(api, 'getPublicMenu').mockResolvedValue(menu(language) as never)

    open()
    const t = await openCart(language)
    fireEvent.change(screen.getByPlaceholderText(t('store.cartNamePh')), {
      target: { value: 'Ana' },
    })

    const link = screen.getByRole('link', { name: t('store.cartSend') })
    const message = new URL(link.getAttribute('href')!).searchParams.get('text')

    expect(message).toContain(t('pub.cartHeading'))
    expect(message).toContain(`${t('pub.order.name')}: Ana`)
    expect(message).toContain(
      `${t('pub.order.delivery')}: ${t('store.cartPickup')}`
    )
    if (language === 'en') {
      expect(message).toContain('UYU 1,250')
      expect(message).not.toMatch(/Nombre:|Retiro en el local/)
    }
  })

  it('names the Instagram checkout in the language of the shop', async () => {
    vi.spyOn(api, 'getPublicMenu').mockResolvedValue(
      menu(language, {
        checkoutChannel: 'instagram',
        instagramHandle: 'testshop',
      }) as never
    )

    open()
    const t = await openCart(language)

    expect(
      screen.getByRole('link', { name: t('pub.instagramCheckout') })
    ).toBeTruthy()
    expect(screen.queryByText('Copiar pedido y abrir Instagram')).toBeNull()
  })

  it('asks for the code of a private list in the language of the shop', async () => {
    vi.spyOn(api, 'getPublicMenu').mockResolvedValue({
      error: 'Esta lista pide un código de acceso.',
      errorCode: 'Access code required',
      errorLanguage: language,
    } as never)
    const t = getT(language)

    open('/p/test-shop/menu')

    expect(
      await screen.findByRole('heading', { name: t('pub.access.title') })
    ).toBeTruthy()
    expect(screen.getByPlaceholderText(t('pub.access.placeholder'))).toBeTruthy()
    expect(screen.queryByText('Ingresá tu código')).toBeNull()
  })
})

describe('public page of a shop in Spanish', () => {
  it('keeps its order message as it was', async () => {
    vi.spyOn(api, 'getPublicMenu').mockResolvedValue(menu('es') as never)

    open()
    const t = await openCart('es')
    fireEvent.change(screen.getByPlaceholderText(t('store.cartNamePh')), {
      target: { value: 'Ana' },
    })

    const link = screen.getByRole('link', { name: t('store.cartSend') })
    const message = new URL(link.getAttribute('href')!).searchParams.get('text')

    expect(message).toContain('Nombre: Ana')
    expect(message).toContain('Entrega: Retiro en el local')
    expect(message).toContain('Total: UYU 1.250')
  })
})
