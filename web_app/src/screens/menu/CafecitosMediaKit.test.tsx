import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Magazine } from '../../types'
import { CafecitosMediaKit } from './CafecitosMediaKit'

const magazine: Magazine = {
  id: 'media-kit',
  name: 'Media kit',
  slug: 'media_kit',
  issue: 'CAFECITOS CON DANI',
  description: 'Contenido que conecta con tu comunidad.',
  design: 'cafecitos-media-kit',
  coverImageUrl: null,
  pages: [
    {
      id: 'cover',
      magazineId: 'media-kit',
      position: 0,
      pageType: 'editorial',
      title: 'Portada',
      imageUrl: null,
      content: null,
    },
  ],
}

describe('CafecitosMediaKit', () => {
  it('renders the imported kit as navigable magazine pages', () => {
    render(<CafecitosMediaKit magazine={magazine} />)

    expect(
      screen.getByRole('button', { name: 'Go to Portada' })
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Cafecitos con Dani' })
    ).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Powered by MiPrecio' })
    ).toBeTruthy()
  })
})
