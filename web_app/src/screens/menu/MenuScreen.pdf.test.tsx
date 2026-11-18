import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../../services/api'
import { MenuScreen } from './MenuScreen'

const exportListPdf = vi.hoisted(() => vi.fn())
vi.mock('../../lib/exportListPdf', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/exportListPdf')>()),
  exportListPdf,
}))

function menu(listDesign: string, tenant: Record<string, unknown> = {}) {
  return {
    data: {
      tenant: {
        name: 'Test Shop',
        subdomain: 'test-shop',
        currency: 'UYU',
        language: 'es',
        listDesign,
        ...tenant,
      },
      lists: [
        {
          id: 'list-1',
          name: 'Menu',
          slug: 'menu',
          kind: 'product',
          captureViewerInfo: true,
          version: {
            id: 'version-1',
            versionNumber: 1,
            content: { schemaVersion: 1, blocks: [] },
            items: [
              { id: 'item-1', name: 'Espresso', price: '120', category: null },
            ],
          },
        },
      ],
      magazines: [],
      viewerIdentified: false,
    },
  }
}

function open(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/p/:subdomain" element={<MenuScreen />} />
        <Route path="/p/:subdomain/:listId" element={<MenuScreen />} />
      </Routes>
    </MemoryRouter>
  )
}

let recordView: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  exportListPdf.mockReset().mockResolvedValue(undefined)
  recordView = vi
    .spyOn(api, 'recordPublicView')
    .mockResolvedValue(undefined as never)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('exporting a list to PDF', () => {
  it('captures the real page and names the file after the shop and list', async () => {
    vi.spyOn(api, 'getPublicMenu').mockResolvedValue(menu('store') as never)

    open('/p/test-shop/menu?pdf=1&preview=editor')

    await waitFor(() => expect(exportListPdf).toHaveBeenCalledTimes(1))
    const { node, fileName } = exportListPdf.mock.calls[0][0]
    expect(node.classList.contains('miprecio-public-list')).toBe(true)
    expect(fileName).toBe('test-shop-menu')
    expect(
      (await screen.findByRole('status')).hasAttribute('data-no-export')
    ).toBe(true)
  })

  it('does not count the export as a customer visit', async () => {
    vi.spyOn(api, 'getPublicMenu').mockResolvedValue(menu('store') as never)

    open('/p/test-shop/menu?pdf=1&preview=editor')

    await waitFor(() => expect(exportListPdf).toHaveBeenCalled())
    expect(recordView).not.toHaveBeenCalled()
  })

  it('does not ask who is visiting while it exports', async () => {
    vi.spyOn(api, 'getPublicMenu').mockResolvedValue(menu('store') as never)

    open('/p/test-shop/menu?pdf=1')

    await waitFor(() => expect(exportListPdf).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('leaves a normal visit alone', async () => {
    vi.spyOn(api, 'getPublicMenu').mockResolvedValue(menu('store') as never)

    open('/p/test-shop/menu')

    await waitFor(() => expect(recordView).toHaveBeenCalled())
    expect(exportListPdf).not.toHaveBeenCalled()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('tells the shop when the PDF could not be generated', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    exportListPdf.mockRejectedValue(new Error('canvas exploded'))
    vi.spyOn(api, 'getPublicMenu').mockResolvedValue(menu('store') as never)

    open('/p/test-shop/menu?pdf=1')

    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain(
        'No pudimos generar el PDF'
      )
    )
  })
})

describe('social links at the foot of the public list', () => {
  const DESIGNS = [
    'store',
    'classic',
    'nordic',
    'fine',
    'modern',
    'photo',
    'cards',
    'catalog',
    'tech',
    'pencil-journal',
  ]

  it.each(DESIGNS)('shows the networks on the %s design', async (design) => {
    vi.spyOn(api, 'getPublicMenu').mockResolvedValue(
      menu(design, {
        socialInstagram: 'https://instagram.com/testshop',
      }) as never
    )

    open('/p/test-shop')

    const links = await screen.findAllByRole('link', { name: 'Instagram' })
    expect(links).toHaveLength(1)
    expect(links[0].getAttribute('href')).toBe('https://instagram.com/testshop')
  })

  it.each(DESIGNS)(
    'shows no icons on %s when none are filled',
    async (design) => {
      vi.spyOn(api, 'getPublicMenu').mockResolvedValue(menu(design) as never)

      open('/p/test-shop')

      await waitFor(() =>
        expect(document.querySelector('.miprecio-public-list')).not.toBeNull()
      )
      expect(screen.queryByRole('link', { name: 'Instagram' })).toBeNull()
      expect(screen.queryByRole('link', { name: 'WhatsApp' })).toBeNull()
    }
  )

  it('offers the WhatsApp number orders already go to', async () => {
    vi.spyOn(api, 'getPublicMenu').mockResolvedValue(
      menu('store', { whatsappUrl: 'https://wa.me/59899111222' }) as never
    )

    open('/p/test-shop')

    const link = await screen.findByRole('link', { name: 'WhatsApp' })
    expect(link.getAttribute('href')).toBe('https://wa.me/59899111222')
  })
})
