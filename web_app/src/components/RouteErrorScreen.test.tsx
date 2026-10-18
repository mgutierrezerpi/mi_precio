import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { store } from '../store'
import { RouteErrorScreen } from './RouteErrorScreen'

function Boom(): never {
  throw new RangeError('Invalid currency code : pesos')
}

describe('RouteErrorScreen', () => {
  it('replaces the router developer page when a screen throws', async () => {
    // A tenant with currency "pesos" once took Products down with React
    // Router's «Unexpected Application Error!» and a stack trace.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const router = createMemoryRouter(
      [
        {
          errorElement: <RouteErrorScreen />,
          children: [{ path: '/admin/items', element: <Boom /> }],
        },
      ],
      { initialEntries: ['/admin/items'] }
    )
    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    )

    expect(
      await screen.findByText('Algo salió mal en esta pantalla')
    ).toBeTruthy()
    expect(screen.queryByText(/Unexpected Application Error/)).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Ir al inicio' }).getAttribute('href')
    ).toBe('/admin')
  })
})
