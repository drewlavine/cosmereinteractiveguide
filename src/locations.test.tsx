import { cleanup, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { books } from './data/books'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const renderAt = (
  path: string,
  read: string[] = [],
  reading: Record<string, string | null> = {},
) => {
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({ version: 2, read, reading }),
  )
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )
}

const list = () => screen.getByRole('article', { name: 'Locations' })
const names = () =>
  [...list().querySelectorAll('.character-group li')].map((li) =>
    li.textContent?.trim(),
  )
const ERA1 = ['final-empire', 'well-of-ascension', 'hero-of-ages']

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('locations list', () => {
  it('lists places by letter, linking map places to their pages', () => {
    renderAt(
      '/locations',
      books.map((b) => b.id),
    )
    expect(
      within(list()).getByRole('link', { name: 'Luthadel' }),
    ).toHaveAttribute(
      'href',
      '/systems/scadrian/planets/scadrial/locations/luthadel',
    )
    expect(screen.getByRole('region', { name: 'L' })).toBeInTheDocument()
  })

  it('shows no places before any book is read', () => {
    renderAt('/locations')
    expect(names()).toEqual([])
    expect(
      screen.getByText(/hidden based on books you've read/),
    ).toBeInTheDocument()
  })

  it('hides places from books the reader has not finished', () => {
    renderAt('/locations', ['final-empire'])
    expect(names()).toContain('Luthadel')
    expect(names()).not.toContain('Kholinar')
    // Era 2's city would give away how Era 1 ends.
    expect(names()).not.toContain('Elendel')
  })

  it('shows later places once their book is finished', () => {
    renderAt('/locations', [...ERA1, 'alloy-of-law', 'way-of-kings'])
    expect(names()).toEqual(expect.arrayContaining(['Elendel', 'Kholinar']))
  })

  it('groups by world without naming worlds the reader has not reached', () => {
    renderAt('/locations?group=world', ['final-empire'])
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent)
    expect(headings).toContain('Scadrial')
    expect(headings).not.toContain('Roshar')
  })

  it('groups by type and by series', () => {
    renderAt('/locations?group=type', ERA1)
    expect(
      within(
        screen.getByRole('region', { name: 'Cities and towns' }),
      ).getByText('Luthadel'),
    ).toBeInTheDocument()
    cleanup()
    renderAt('/locations?group=series', ERA1)
    expect(
      screen.getByRole('region', { name: 'Mistborn (Era 1)' }),
    ).toBeInTheDocument()
  })

  it('filters by name', () => {
    renderAt('/locations?q=kredik', ERA1)
    expect(names()).toEqual(['Kredik Shaw'])
  })
})
