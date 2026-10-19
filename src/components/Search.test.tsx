import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from '../routes'
import { RECENT_SEARCHES_KEY } from '../search/recent'
import { BOOKS_READ_KEY } from '../state/booksRead'

const renderAt = (path: string, read: string[] = []) => {
  localStorage.setItem(BOOKS_READ_KEY, JSON.stringify(read))
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

const dialog = () =>
  document.querySelector<HTMLDialogElement>('dialog.search-dialog')!

describe('search box', () => {
  it('opens from the header button and finds a character', async () => {
    const router = renderAt('/', ['way-of-kings'])
    await userEvent.click(
      screen.getByRole('button', { name: 'Search the Cosmere' }),
    )
    expect(dialog()).toHaveAttribute('open')
    await userEvent.type(screen.getByRole('combobox'), 'kaladin')
    expect(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: /^Kaladin(?!’s|'s)/,
      }),
    ).toBeInTheDocument()
    await userEvent.keyboard('{Enter}')
    expect(router.state.location.pathname).toBe('/characters/kaladin')
    expect(dialog()).not.toHaveAttribute('open')
    expect(JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)!)).toEqual([
      'character:kaladin',
    ])
  })

  it('opens and closes with Ctrl+K', async () => {
    renderAt('/')
    await userEvent.keyboard('{Control>}k{/Control}')
    expect(dialog()).toHaveAttribute('open')
    await userEvent.keyboard('{Control>}k{/Control}')
    expect(dialog()).not.toHaveAttribute('open')
  })

  it('opens with "/" unless typing in a field', async () => {
    renderAt('/')
    await userEvent.keyboard('/')
    expect(dialog()).toHaveAttribute('open')
    expect(screen.getByRole('combobox')).toHaveFocus()
  })

  it('moves through results with the arrow keys', async () => {
    const router = renderAt('/', ['elantris'])
    await userEvent.keyboard('/')
    await userEvent.type(screen.getByRole('combobox'), 'ka')
    const options = within(screen.getByRole('listbox')).getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{ArrowDown}')
    expect(options[1]).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    expect(options.at(-1)).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{Enter}')
    expect(router.state.location.pathname).not.toBe('/')
  })

  it('says how many results are hidden, without naming them', async () => {
    renderAt('/')
    await userEvent.keyboard('/')
    await userEvent.type(screen.getByRole('combobox'), 'sycla')
    expect(dialog()).toHaveTextContent(
      /\d+ results? hidden based on books you've read/,
    )
    expect(screen.queryByRole('option', { name: /Sycla/ })).toBeNull()
  })

  it('hides characters the reader has not met, unless named exactly', async () => {
    renderAt('/')
    await userEvent.keyboard('/')
    await userEvent.type(screen.getByRole('combobox'), 'kalad')
    expect(screen.queryByRole('option', { name: /Kaladin/ })).toBeNull()
    expect(dialog()).toHaveTextContent(/results? hidden based on books/)
    await userEvent.type(screen.getByRole('combobox'), 'in')
    expect(
      screen.getByRole('option', { name: /Kaladin.*not met yet/ }),
    ).toBeInTheDocument()
  })

  it('shows recent picks that the reader may still see, and clears them', async () => {
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(['place:sycla', 'character:vin']),
    )
    renderAt('/', ['final-empire'])
    await userEvent.keyboard('/')
    const listbox = screen.getByRole('listbox')
    expect(within(listbox).getByRole('group', { name: /Recent/ })).toBeVisible()
    expect(within(listbox).getAllByRole('option')).toHaveLength(1)
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull()
  })
})

describe('search page', () => {
  it('lists every result for the query in the URL', async () => {
    const router = renderAt('/search?q=vin', ['final-empire'])
    expect(
      screen.getByRole('heading', { level: 1, name: 'Search' }),
    ).toBeInTheDocument()
    const characters = screen.getByRole('region', { name: /Characters/ })
    expect(
      within(characters).getByRole('link', { name: /^Vin\s*Character$/ }),
    ).toHaveAttribute('href', '/characters/vin')
    await userEvent.clear(screen.getByRole('searchbox'))
    await userEvent.type(screen.getByRole('searchbox'), 'hoid')
    expect(router.state.location.search).toBe('?q=hoid')
  })
})
