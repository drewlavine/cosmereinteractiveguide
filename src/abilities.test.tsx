import { cleanup, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { books } from './data/books'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const renderAt = (path: string, read: string[] = []) => {
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({ version: 2, read, reading: {} }),
  )
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )
}

const list = () => screen.getByRole('article', { name: 'Magic' })
const names = () =>
  [...list().querySelectorAll('.character-group li')].map((li) =>
    li.textContent?.trim(),
  )
const headings = () =>
  within(list())
    .queryAllByRole('heading', { level: 2 })
    .map((h) => h.textContent)
const ERA1 = ['final-empire', 'well-of-ascension', 'hero-of-ages']

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('abilities list', () => {
  it('shows nothing before any book is read', () => {
    renderAt('/magic')
    expect(names()).toEqual([])
    expect(
      screen.getByText(/hidden based on books you've read/),
    ).toBeInTheDocument()
  })

  it('lists what the finished books reveal, and nothing from other series', () => {
    renderAt('/magic', ['final-empire'])
    expect(names()).toEqual(expect.arrayContaining(['Allomancy', 'Steel']))
    expect(names()).not.toContain('Surgebinding')
    expect(names()).not.toContain('Stormlight')
  })

  it('groups by type and by magic system', () => {
    renderAt('/magic?group=type', ['final-empire'])
    expect(headings()).toEqual(
      expect.arrayContaining(['Magic systems', 'Metals']),
    )
    cleanup()
    renderAt('/magic?group=system', ['final-empire'])
    const allomancy = screen.getByRole('region', { name: 'Allomancy' })
    expect(within(allomancy).getByText('Steel')).toBeInTheDocument()
  })

  it('names a Shard only once the books tie it to the magic', () => {
    renderAt('/magic?group=shard', ['final-empire'])
    expect(headings()).not.toContain('Preservation')
    cleanup()
    renderAt('/magic?group=shard', ERA1)
    expect(headings()).toContain('Preservation')
  })

  it('shows every ability once every book is read', () => {
    renderAt(
      '/magic',
      books.map((b) => b.id),
    )
    expect(screen.queryByText(/hidden based on/)).toBeNull()
  })
})

describe('old Abilities links', () => {
  it('redirect to the Magic tab', async () => {
    renderAt('/abilities?group=type', ['final-empire'])
    expect(await screen.findByRole('article', { name: 'Magic' })).toBeTruthy()
  })

  it('redirect entry pages', async () => {
    renderAt('/abilities/allomancy', ERA1)
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Allomancy' }),
    ).toBeTruthy()
  })
})
