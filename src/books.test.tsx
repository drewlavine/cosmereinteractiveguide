import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { books, bookSeries } from './data/books'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const renderAt = (path: string) =>
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )

describe('books pages', () => {
  beforeEach(() => {
    localStorage.setItem(BOOKS_READ_KEY, JSON.stringify(['way-of-kings']))
  })

  it('lists every book under its series', () => {
    renderAt('/books')
    const list = screen.getByRole('article', { name: 'Books' })
    expect(list.querySelectorAll('a[href^="/books/"]')).toHaveLength(
      books.length,
    )
    for (const series of bookSeries)
      expect(
        screen.getByRole('region', { name: series.name }),
      ).toBeInTheDocument()
    const stormlight = screen.getByRole('region', {
      name: 'The Stormlight Archive',
    })
    expect(
      within(stormlight).getByRole('link', { name: 'Edgedancer' }),
    ).toHaveAttribute('href', '/books/edgedancer')
    expect(
      within(stormlight).getByText('Book 2.5 · Novella · 2016'),
    ).toBeInTheDocument()
  })

  it('marks the books the reader has read', () => {
    renderAt('/books')
    expect(
      screen.getByText(`${books.length} books · 1 read`),
    ).toBeInTheDocument()
    const wok = screen.getByRole('link', { name: 'The Way of Kings' })
    expect(within(wok.parentElement!).getByText('Read')).toBeInTheDocument()
    const wor = screen.getByRole('link', { name: 'Words of Radiance' })
    expect(within(wor.parentElement!).queryByText('Read')).toBeNull()
  })

  it('shows where the reader is in books they are reading', () => {
    localStorage.setItem(
      BOOKS_READ_KEY,
      JSON.stringify({
        version: 2,
        read: ['way-of-kings'],
        reading: { 'words-of-radiance': '12', oathbringer: null },
      }),
    )
    renderAt('/books')
    expect(
      screen.getByText(`${books.length} books · 1 read · 2 in progress`),
    ).toBeInTheDocument()
    const wor = screen.getByRole('link', { name: 'Words of Radiance' })
    expect(
      within(wor.parentElement!).getByText('Reading · up to Chapter 12'),
    ).toBeInTheDocument()
    const ob = screen.getByRole('link', { name: 'Oathbringer' })
    expect(within(ob.parentElement!).getByText('Reading')).toBeInTheDocument()
  })

  it('opens a book page from the list', async () => {
    renderAt('/books')
    await userEvent.click(screen.getByRole('link', { name: 'Warbreaker' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Warbreaker' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Standalones · Novel · 2009')).toBeInTheDocument()
    expect(screen.getByText('Details coming soon.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Read about Warbreaker on the Coppermind',
      }),
    ).toHaveAttribute(
      'href',
      'https://coppermind.net/wiki/Special:Search?go=Go&search=Warbreaker',
    )
  })

  it('shows not found for an unknown book', () => {
    renderAt('/books/nope')
    expect(
      screen.getByRole('heading', { name: 'Lost in the Cognitive Realm' }),
    ).toBeInTheDocument()
  })
})
