import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { LinkTree } from '../../types'
import { LinkTreeView } from './LinkTreeView'

const tree: LinkTree = {
  id: 'tree-1',
  tenantId: 'tenant-1',
  publicSlug: 'studio',
  displayName: 'Studio Objects',
  handle: '@studio',
  bio: 'Objetos para habitar despacio.',
  avatarUrl: null,
  accentColor: '#D6EE4A',
  backgroundColor: '#F5F4ED',
  template: 'botanical',
  font: 'sans',
  tags: ['cerámica'],
  links: [
    {
      id: 'catalog',
      title: 'Ver catálogo',
      description: 'Precios actualizados',
      url: '/p/studio',
      icon: 'bag',
      style: 'featured',
      enabled: true,
    },
    {
      id: 'hidden',
      title: 'Oculto',
      description: null,
      url: '#hidden',
      icon: 'link',
      style: 'light',
      enabled: false,
    },
  ],
  instagramUrl: null,
  tiktokUrl: null,
  emailUrl: null,
  whatsappUrl: null,
  websiteUrl: null,
  locationUrl: null,
  published: true,
  createdAt: '',
  updatedAt: '',
}

describe('LinkTreeView', () => {
  it('renders business-specific profile and only enabled links', () => {
    const view = render(
      <MemoryRouter>
        <LinkTreeView data={tree} preview publicUrl="http://localhost:3001/l/studio" />
      </MemoryRouter>
    )

    expect(view.getByRole('heading', { name: 'Studio Objects' })).toBeTruthy()
    expect(view.getByText('Ver catálogo')).toBeTruthy()
    expect(view.queryByText('Oculto')).toBeNull()
    expect(view.queryByText('Vista previa')).toBeNull()
    expect(view.container.querySelector('.link-tree-page')?.classList.contains('link-tree-page--botanical')).toBe(true)
  })

  it('turns an email address into a mailto link', () => {
    const view = render(<MemoryRouter><LinkTreeView data={{ ...tree, emailUrl: 'hola@studio.test' }} /></MemoryRouter>)
    expect(view.getByLabelText('Enviar email').getAttribute('href')).toBe('mailto:hola@studio.test')
  })

  it('uses the selected visual template without changing the page content', () => {
    const view = render(
      <MemoryRouter>
        <LinkTreeView data={{ ...tree, template: 'editorial', locationUrl: 'https://maps.example.test', websiteUrl: 'https://studio.example.test' }} />
      </MemoryRouter>
    )

    expect(view.container.querySelector('.link-tree-page')?.classList.contains('link-tree-page--editorial')).toBe(true)
    expect(view.getByRole('heading', { name: 'Studio Objects' })).toBeTruthy()
    expect(view.getByText('Ver ubicación')).toBeTruthy()
    expect(view.getByText('Visitar sitio web')).toBeTruthy()
  })
})
