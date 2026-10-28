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

  const openCast = async (region: HTMLElement) => {
    await userEvent.click(
      within(region).getByRole('button', { name: /^Characters/ }),
    )
    return within(region).getByRole('region', { name: 'Characters' })
  }

  it('keeps the character list in a drawer, and goes full screen', async () => {
    reading('17')
    renderAt('/books/final-empire?ch=5')
    const region = await mapRegion()
    expect(
      within(region).queryByRole('region', { name: 'Characters' }),
    ).toBeNull()
    const toggle = within(region).getByRole('button', { name: /^Characters/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    const cast = await openCast(region)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(within(cast).getByRole('button', { name: 'Kelsier' }))
    expect(toggle).toHaveTextContent('Characters · following 1')
    await userEvent.click(
      within(cast).getByRole('button', {
        name: 'Close the character list',
      }),
    )
    expect(
      within(region).queryByRole('region', { name: 'Characters' }),
    ).toBeNull()

    const card = within(region).getByRole('region', { name: 'This chapter' })
    await userEvent.click(
      within(card).getByRole('button', { name: 'Hide what happens' }),
    )
    expect(card).not.toHaveTextContent(/stole its atium/)
    expect(chapterHeading(region)).toHaveTextContent('Chapter 5')

    const full = within(region).getByRole('button', { name: 'Full screen' })
    await userEvent.click(full)
    expect(full).toHaveAttribute('aria-pressed', 'true')
    await userEvent.keyboard('{Escape}')
    expect(full).toHaveAttribute('aria-pressed', 'false')
  })

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
    const cast = await openCast(await mapRegion())
    expect(
      within(cast).getByRole('button', { name: 'Kelsier' }),
    ).toBeInTheDocument()
    expect(
      within(cast)
        .getByRole('button', { name: 'Kelsier' })
        .querySelector('img'),
    ).toHaveAttribute('src', expect.stringContaining('/portraits/faces/'))
    expect(
      within(cast).getByRole('link', { name: 'Kelsier’s journey' }),
    ).toHaveAttribute('href', '/characters/kelsier#journey')
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
      [...container.querySelectorAll('svg g[role="button"]')].map((g) =>
        g.getAttribute('aria-label'),
      )
    await waitFor(() => expect(markers()).toContain('Clubs'))
    const cast = await openCast(region)
    const kelsier = within(cast).getByRole('button', { name: 'Kelsier' })
    await userEvent.click(kelsier)
    expect(kelsier).toHaveAttribute('aria-pressed', 'true')
    expect(markers().join()).not.toMatch(/Clubs|Vin/)
    await userEvent.click(
      within(cast).getByRole('button', { name: 'Stop following' }),
    )
    expect(markers()).toContain('Clubs')
    expect(markers().some((m) => m?.startsWith('Vin, last seen here in'))).toBe(
      true,
    )
    await userEvent.click(
      within(region).getByRole('button', { name: 'Others' }),
    )
    expect(markers().some((m) => m?.startsWith('Vin'))).toBe(false)
    expect(markers()).toContain('Clubs')
  })

  it('goes to the chapter a faded marker was last seen in', async () => {
    reading('17')
    const { container } = renderAt('/books/final-empire?ch=5')
    const region = await mapRegion()
    const marker = (name: string) =>
      container.querySelector<SVGElement>(
        `svg g[role="button"][aria-label^="${name}"]`,
      )
    await waitFor(() => expect(marker('Vin, last seen')).not.toBeNull())
    const vin = marker('Vin, last seen')!
    const seen = vin.getAttribute('aria-label')!.replace(/.* in /, '')
    expect(vin.dataset.tooltip).toMatch(/Click to go to that chapter/)
    await userEvent.click(vin)
    expect(chapterHeading(region)).toHaveTextContent(new RegExp(`${seen}$`))
    expect(marker('Vin')).toHaveAttribute('aria-label', 'Vin')
  })

  it('tells who took an old route, and goes to its chapter', async () => {
    reading('17')
    const { container } = renderAt('/books/final-empire?ch=17')
    const region = await mapRegion()
    await userEvent.click(
      within(region).getByRole('button', { name: 'Whole book' }),
    )
    const old = container.querySelector<SVGElement>(
      'svg path[role="button"][data-tooltip]',
    )!
    const tip = old.dataset.tooltip!
    expect(tip).toMatch(/^Chapter \d+: \w.*Click to go to that chapter$/)
    await userEvent.click(old)
    expect(chapterHeading(region)).toHaveTextContent(
      new RegExp(`${tip.slice(0, tip.indexOf(':'))}$`),
    )
  })

  it('says what happened at each place so far, and which way routes go', async () => {
    reading('17')
    const { container } = renderAt('/books/final-empire?ch=17')
    const region = await mapRegion()
    await waitFor(() =>
      expect(container.querySelector('svg text[data-tooltip]')).not.toBeNull(),
    )
    const label = container.querySelector<SVGElement>('svg text[data-tooltip]')!
    expect(label.dataset.tooltip).toMatch(/^[^\n]+\nChapter 17: /)
    expect(label.dataset.tooltip!.startsWith(label.textContent!)).toBe(true)
    await userEvent.click(
      within(region).getByRole('button', { name: 'Whole book' }),
    )
    await waitFor(() =>
      expect(
        container.querySelector('svg path[marker-end^="url(#"]'),
      ).not.toBeNull(),
    )
    const dot = [
      ...container.querySelectorAll<SVGElement>('svg circle[role="button"]'),
    ].find((d) => /Click to go to /.test(d.dataset.tooltip ?? ''))!
    const last = dot.dataset.tooltip!.match(/Click to go to (.+)$/)![1]
    await userEvent.click(dot)
    expect(chapterHeading(region)).toHaveTextContent(new RegExp(`${last}$`))
  })

  it('explains every button in a tooltip on hover', async () => {
    reading('17')
    renderAt('/books/final-empire')
    const region = await mapRegion()
    for (const button of within(region).getAllByRole('button'))
      expect(button.dataset.tooltip, button.textContent ?? '').toBeTruthy()
    const others = within(region).getByRole('button', { name: 'Others' })
    await userEvent.hover(others)
    expect(document.querySelector('.tooltip')).toHaveTextContent(
      'Hide the main characters who aren’t in this chapter',
    )
    await userEvent.click(others)
    await waitFor(() =>
      expect(document.querySelector('.tooltip')).toHaveTextContent(
        'Show where the main characters not in this chapter were last seen',
      ),
    )
    await userEvent.unhover(others)
    expect(document.querySelector('.tooltip')).toBeNull()
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

  describe('The Way of Kings', () => {
    const readingWok = (chapter: string) =>
      localStorage.setItem(
        BOOKS_READ_KEY,
        JSON.stringify({
          version: 2,
          read: [],
          reading: { 'way-of-kings': chapter },
        }),
      )

    it('stops at the reader’s chapter, leaving out later chapters and people', async () => {
      readingWok('10')
      renderAt('/books/way-of-kings')
      const region = await mapRegion()
      expect(chapterHeading(region)).toHaveTextContent('Chapter 10')
      expect(
        within(region).getByRole('region', { name: 'This chapter' }),
      ).toHaveTextContent('Nine years earlier in Hearthstone')
      const timeline = within(region).getByRole('list', { name: 'Chapters' })
      expect(
        within(timeline).queryByRole('button', { name: /^Chapter 11,/ }),
      ).toBeNull()
      expect(
        within(timeline).queryByRole('button', { name: 'Interlude I-1' }),
      ).toBeNull()
      const cast = await openCast(region)
      expect(
        within(cast).getByRole('button', { name: /^Kaladin\b/ }),
      ).toBeInTheDocument()
      expect(
        within(cast).getByRole('button', { name: /^Shallan\b/ }),
      ).toBeInTheDocument()
      expect(
        within(region).queryByText(/Dalinar|Adolin|Navani|Teft/),
      ).toBeNull()
    })

    it('shows Wit as Wit until the book says who he is', async () => {
      readingWok('22')
      renderAt('/books/way-of-kings?ch=15')
      const region = await mapRegion()
      const cast = await openCast(region)
      expect(
        within(cast).getByRole('button', { name: 'Wit' }),
      ).toBeInTheDocument()
      expect(within(region).queryByText(/Hoid/)).toBeNull()
    })

    it('says what someone the chapter text doesn’t name does there', async () => {
      readingWok('22')
      const { container } = renderAt('/books/way-of-kings?ch=15')
      const region = await mapRegion()
      const role = 'Mocked Sadeas and praised Renarin as clever'
      const wit = () =>
        container.querySelector<SVGElement>(
          'svg g[role="button"][aria-label="Wit"]',
        )
      await waitFor(() => expect(wit()).not.toBeNull())
      expect(wit()!.dataset.tooltip).toMatch(new RegExp(`^Wit\\n${role}\\n`))
      expect(wit()).toHaveAttribute('aria-description', role)
      const cast = await openCast(region)
      expect(within(cast).getByRole('button', { name: 'Wit' })).toHaveAttribute(
        'aria-description',
        role,
      )
    })

    it('keeps only notable characters on the map when away, unless followed', async () => {
      readingWok('30')
      const { container } = renderAt('/books/way-of-kings?ch=i-2')
      const region = await mapRegion()
      const markers = () =>
        [...container.querySelectorAll('svg g[role="button"]')].map((g) =>
          g.getAttribute('aria-label'),
        )
      await waitFor(() =>
        expect(
          markers().some((m) => m?.startsWith('Kaladin, last seen here in')),
        ).toBe(true),
      )
      expect(markers().join()).not.toMatch(/Ishikk/)
      const cast = await openCast(region)
      await userEvent.click(
        within(cast).getByRole('button', { name: /^Ishikk\b/ }),
      )
      expect(markers()).toContain('Ishikk, last seen here in Interlude I-1')
    })
  })
})
