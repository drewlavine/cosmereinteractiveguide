import { render, screen, waitFor, within } from '@testing-library/react'
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

describe('book chapter map', () => {
  const reading = (chapter: string, read: string[] = []) =>
    localStorage.setItem(
      BOOKS_READ_KEY,
      JSON.stringify({
        version: 2,
        read,
        reading: { 'final-empire': chapter },
      }),
    )
  const mapRegion = () =>
    screen.findByRole('region', { name: 'Chapter by chapter' })
  const chapterHeading = (region: HTMLElement) =>
    within(
      within(region).getByRole('region', { name: 'This chapter' }),
    ).getByRole('heading', { level: 3 })

  it('opens at the reader’s chapter and shows nothing past it', async () => {
    reading('17')
    renderAt('/books/final-empire')
    const region = await mapRegion()
    expect(chapterHeading(region)).toHaveTextContent('Chapter 17')
    expect(
      within(region).getByRole('region', { name: 'This chapter' }),
    ).toHaveTextContent('Kelsier agreed to let Vin attend another ball')
    expect(
      within(region).getByRole('button', { name: 'Next chapter' }),
    ).toBeDisabled()
    const timeline = within(region).getByRole('list', { name: 'Chapters' })
    expect(
      within(timeline).getByRole('button', { name: 'Chapter 17, Part Three' }),
    ).toHaveAttribute('aria-current', 'step')
    expect(
      within(timeline).getByRole('button', { name: 'Prologue' }),
    ).toHaveTextContent('Prologue')
    expect(
      within(timeline).getByRole('button', { name: /^Chapter 5,/ }),
    ).toHaveTextContent('5')
    expect(
      within(timeline).queryByRole('button', { name: /^Chapter 18,/ }),
    ).toBeNull()
    expect(within(region).queryByText(/Keep Elariel/)).toBeNull()
    expect(within(region).queryByText(/Shan/)).toBeNull()
  })

  it('is absent for a book the reader hasn’t started', async () => {
    localStorage.setItem(BOOKS_READ_KEY, JSON.stringify(['way-of-kings']))
    renderAt('/books/final-empire')
    await screen.findByRole('heading', {
      level: 1,
      name: 'Mistborn: The Final Empire',
    })
    expect(
      screen.queryByRole('region', { name: 'Chapter by chapter' }),
    ).toBeNull()
  })

  it('opens the chapter in the link and steps through chapters', async () => {
    reading('17')
    renderAt('/books/final-empire?ch=5')
    const region = await mapRegion()
    expect(chapterHeading(region)).toHaveTextContent('Chapter 5')
    expect(within(region).getByText(/stole its atium/)).toBeInTheDocument()
    await userEvent.click(
      within(region).getByRole('button', { name: 'Next chapter' }),
    )
    expect(chapterHeading(region)).toHaveTextContent('Chapter 6')
    await userEvent.click(
      within(region).getByRole('button', { name: 'Previous chapter' }),
    )
    await userEvent.click(
      within(region).getByRole('button', { name: 'Previous chapter' }),
    )
    expect(chapterHeading(region)).toHaveTextContent('Chapter 4')
  })

  it('ignores a chapter in the link the reader hasn’t reached', async () => {
    reading('3')
    renderAt('/books/final-empire?ch=20')
    const region = await mapRegion()
    expect(chapterHeading(region)).toHaveTextContent('Chapter 3')
    expect(within(region).queryByText(/Marsh/)).toBeNull()
  })

  it('lists who is in the chapter and who is elsewhere', async () => {
    reading('17')
    renderAt('/books/final-empire?ch=5')
    const cast = within(await mapRegion()).getByRole('region', {
      name: 'Characters',
    })
    expect(
      within(cast).getByRole('button', { name: 'Kelsier' }),
    ).toBeInTheDocument()
    expect(
      within(cast).getByRole('link', { name: 'Kelsier’s page' }),
    ).toHaveAttribute('href', '/characters/kelsier')
    expect(
      within(cast).getByRole('button', { name: /^Vin\b/ }),
    ).toHaveTextContent('Vin (not in this chapter)')
    expect(within(cast).queryByRole('button', { name: /Sazed/ })).toBeNull()
  })

  it('follows picked characters and hides the others on request', async () => {
    reading('17')
    const { container } = renderAt('/books/final-empire?ch=5')
    const region = await mapRegion()
    const markers = () =>
      [...container.querySelectorAll('svg g > title')].map((t) => t.textContent)
    await waitFor(() => expect(markers()).toContain('Clubs'))
    const cast = within(region).getByRole('region', { name: 'Characters' })
    const kelsier = within(cast).getByRole('button', { name: 'Kelsier' })
    await userEvent.click(kelsier)
    expect(kelsier).toHaveAttribute('aria-pressed', 'true')
    expect(markers().join()).not.toMatch(/Clubs|Vin/)
    await userEvent.click(
      within(cast).getByRole('button', { name: 'Show everyone' }),
    )
    expect(markers()).toContain('Clubs')
    expect(markers().some((m) => m?.startsWith('Vin (last seen'))).toBe(true)
    await userEvent.click(
      within(region).getByRole('button', { name: 'Others' }),
    )
    expect(markers().some((m) => m?.startsWith('Vin'))).toBe(false)
    expect(markers()).toContain('Clubs')
  })

  it('draws routes for the chosen stretch of chapters', async () => {
    reading('17')
    const { container } = renderAt('/books/final-empire?ch=17')
    const region = await mapRegion()
    const routes = within(region).getByRole('group', { name: 'Routes' })
    const count = () => container.querySelectorAll('svg path[stroke]').length
    await userEvent.click(
      within(routes).getByRole('button', { name: 'This chapter' }),
    )
    const chapterOnly = count()
    await userEvent.click(
      within(routes).getByRole('button', { name: 'Whole book' }),
    )
    expect(count()).toBeGreaterThan(chapterOnly)
  })

  it('plays through the chapters', async () => {
    reading('17')
    renderAt('/books/final-empire?ch=15')
    const region = await mapRegion()
    await userEvent.click(within(region).getByRole('button', { name: 'Play' }))
    await waitFor(
      () => expect(chapterHeading(region)).toHaveTextContent('Chapter 16'),
      { timeout: 4000 },
    )
    await userEvent.click(within(region).getByRole('button', { name: 'Pause' }))
    expect(
      within(region).getByRole('button', { name: 'Play' }),
    ).toBeInTheDocument()
  })

  it('shows the rest of the book on Show anyway', async () => {
    reading('17')
    renderAt('/books/final-empire')
    const region = await mapRegion()
    await userEvent.click(
      within(region).getByRole('button', { name: /show anyway/i }),
    )
    const timeline = within(region).getByRole('list', { name: 'Chapters' })
    expect(
      within(timeline).getByRole('button', { name: 'Epilogue' }),
    ).toBeInTheDocument()
    await userEvent.click(
      within(timeline).getByRole('button', { name: /^Chapter 30,/ }),
    )
    expect(chapterHeading(region)).toHaveTextContent('Chapter 30')
  })
})
