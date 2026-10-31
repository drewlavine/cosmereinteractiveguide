import { cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const renderAt = (
  path: string,
  read: string[],
  reading: Record<string, string> = {},
) => {
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({ version: 2, read, reading }),
  )
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('a Magic entry whose type comes later', () => {
  it('stays hidden until the books reveal it', async () => {
    renderAt('/magic/mist', [], { 'final-empire': '7' })
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Not reached yet' }),
    ).toBeTruthy()
    expect(document.body).not.toHaveTextContent('Investiture')
    cleanup()
    renderAt('/magic/mist', [], { 'final-empire': '38' })
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mist' }),
    ).toBeTruthy()
    expect(screen.getByRole('article')).toHaveTextContent('Investiture')
  })
})

describe('entries moved off the Magic list', () => {
  it('send old links to their new page', async () => {
    const router = renderAt('/magic/reod', ['elantris'])
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reod' }),
    ).toBeTruthy()
    expect(router.state.location.pathname).toBe('/events/reod')
    cleanup()
    const culture = renderAt('/magic/sprouter', ['tress'])
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Sprouter' }),
    ).toBeTruthy()
    expect(culture.state.location.pathname).toBe('/culture/sprouter')
  })
})
