import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { books } from './data/books'
import { cultureKindLabels, cultureList } from './data/culture'
import { readerCanSee } from './data/reveal'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const renderAt = (path: string, read: string[] = []) => {
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({ version: 2, read, reading: {} }),
  )
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

// A member page's article is named by its group, so look it up unnamed.
const list = () => screen.getByRole('article')
// The names on the member and A–Z pages.
const names = () =>
  [...list().querySelectorAll('.character-group li')].map((li) =>
    li.textContent?.trim(),
  )
const letters = () =>
  within(list())
    .queryAllByRole('heading', { level: 2 })
    .map((h) => h.textContent)
// The group names on the cards of one grouping (a card names its count too).
const cardNames = (grouping: string) =>
  within(screen.getByRole('region', { name: grouping }))
    .getAllByRole('link')
    .map((a) => a.getAttribute('aria-label')?.replace(/, \d+ .+$/, ''))
const card = (grouping: string, name: string) =>
  within(screen.getByRole('region', { name: grouping })).getByRole('link', {
    name: new RegExp(`^${name}, `),
  })
const shownAfter = (read: string[]) => {
  const canSee = readerCanSee({ read: new Set(read), reading: new Map() })
  return cultureList.filter((c) => canSee(c.revealedIn))
}
const byPage = (page: string) => {
  const entry = cultureList.find((c) => c.coppermindPage === page)
  if (!entry) throw new Error(`no entry for ${page}`)
  return entry
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
})

describe('culture list', () => {
  it('shows nothing before any book is read', () => {
    renderAt('/culture')
    expect(screen.queryAllByRole('region')).toEqual([])
    expect(screen.queryByRole('navigation', { name: 'Browse by' })).toBeNull()
    expect(
      screen.getByText(/hidden based on what you've read so far/),
    ).toBeInTheDocument()
    cleanup()
    renderAt('/culture?group=name')
    expect(names()).toEqual([])
    expect(letters()).toEqual([])
  })

  it('lists what the finished books reveal, and nothing from other series', () => {
    renderAt('/culture?group=name', ['final-empire'])
    expect(names()).toEqual(expect.arrayContaining(['Skaa', 'House Venture']))
    expect(names()).not.toContain('Vorinism')
    expect(names()).not.toContain('Lighteyes')
    expect(names()).toHaveLength(shownAfter(['final-empire']).length)
  })

  it('hides a name dated later by hand until that book is finished', () => {
    const entry = byPage('Church of the Survivor')
    expect(entry.revealedIn).toEqual(['well-of-ascension'])
    renderAt('/culture?group=name', ['final-empire'])
    expect(names()).not.toContain(entry.name)
    cleanup()
    renderAt('/culture?group=name', ['final-empire', 'well-of-ascension'])
    expect(names()).toContain(entry.name)
  })

  it('has a card for each type, with no card for a type that is all hidden', () => {
    renderAt('/culture', ['final-empire'])
    const shown = shownAfter(['final-empire'])
    const kinds = new Set(shown.map((c) => c.kind))
    expect(cardNames('Type')).toEqual(
      Object.entries(cultureKindLabels)
        .filter(([kind]) => kinds.has(kind as never))
        .map(([, label]) => label),
    )
    expect(
      screen.queryByRole('link', {
        name: new RegExp(cultureKindLabels.currency),
      }),
    ).toBeNull()
    // A card counts only what the reader may see of its type.
    const classes = shown.filter((c) => c.kind === 'class').length
    expect(card('Type', cultureKindLabels.class)).toHaveAccessibleName(
      `${cultureKindLabels.class}, ${classes} ${classes === 1 ? 'entry' : 'entries'}`,
    )
  })

  it('opens a group’s names from its card, and Back returns to the cards', async () => {
    renderAt('/culture', ['final-empire'])
    await userEvent.click(card('Type', cultureKindLabels.class))
    expect(
      screen.getByRole('heading', { level: 1, name: cultureKindLabels.class }),
    ).toBeInTheDocument()
    expect(names()).toContain('Skaa')
    expect(names()).not.toContain('House Venture')
    expect(screen.queryByRole('searchbox')).toBeNull()
    await userEvent.click(screen.getByRole('link', { name: 'All types' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Culture' }))
    expect(card('Type', cultureKindLabels.class)).toBeInTheDocument()
    // The page opens at the top, so keyboard focus starts at its heading.
    expect(
      screen.getByRole('heading', { level: 1, name: 'Culture' }),
    ).toHaveFocus()
  })

  it('puts focus back on the card that was opened when the reader goes Back', async () => {
    const router = renderAt('/culture', ['final-empire'])
    await userEvent.click(card('Type', cultureKindLabels.class))
    expect(
      screen.getByRole('heading', { level: 1, name: cultureKindLabels.class }),
    ).toHaveFocus()
    await act(() => router.navigate(-1))
    expect(card('Type', cultureKindLabels.class)).toHaveFocus()
  })

  it('lists every name A–Z from the button, and returns to the cards from there', async () => {
    renderAt('/culture', ['final-empire'])
    await userEvent.click(screen.getByRole('link', { name: 'List all A–Z' }))
    expect(screen.queryAllByRole('region', { name: 'Type' })).toEqual([])
    expect(letters()).toContain('S')
    const shown = names()
    expect(shown).toEqual(
      [...shown].sort((a, b) =>
        (a ?? '').localeCompare(b ?? '', undefined, { sensitivity: 'base' }),
      ),
    )
    expect(shown).toHaveLength(shownAfter(['final-empire']).length)
    await userEvent.click(screen.getByRole('link', { name: 'Browse by group' }))
    expect(screen.getByRole('region', { name: 'Type' })).toBeInTheDocument()
  })

  it('has a card for each book, world and series using only finished books', () => {
    renderAt('/culture?group=book', ['final-empire', 'way-of-kings'])
    expect(cardNames('Book')).toEqual([
      'Mistborn: The Final Empire',
      'The Way of Kings',
    ])
    cleanup()
    renderAt('/culture?group=world', ['final-empire'])
    expect(cardNames('World')).toContain('Scadrial')
    expect(cardNames('World')).not.toContain('Roshar')
    cleanup()
    renderAt('/culture?group=series', ['way-of-kings'])
    expect(cardNames('Series')).toEqual(['The Stormlight Archive'])
  })

  it('takes an old ?group= link to that grouping’s cards', () => {
    renderAt('/culture?group=series', ['final-empire'])
    const chips = within(screen.getByRole('navigation', { name: 'Browse by' }))
    expect(chips.getAllByRole('link').map((a) => a.textContent)).toEqual([
      'Type',
      'Book',
      'World',
      'Series',
    ])
    expect(chips.getByRole('link', { name: 'Series' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(chips.getByRole('link', { name: 'Type' })).not.toHaveAttribute(
      'aria-current',
    )
    cleanup()
    renderAt('/culture?group=nonsense', ['final-empire'])
    expect(screen.getByRole('region', { name: 'Type' })).toBeInTheDocument()
  })

  it.each(['/culture', '/culture?layout=stacked'])(
    'switches the cards to only the selected grouping at %s, even with an old saved layout',
    async (path) => {
      localStorage.setItem('cosmere-guide:list-layout', 'stacked')
      const router = renderAt(path, ['final-empire'])
      expect(screen.getAllByRole('region')).toHaveLength(1)
      expect(screen.getByRole('region', { name: 'Type' })).toBeInTheDocument()

      const chips = within(
        screen.getByRole('navigation', { name: 'Browse by' }),
      )
      await userEvent.click(chips.getByRole('link', { name: 'Book' }))
      expect(screen.getAllByRole('region')).toHaveLength(1)
      expect(screen.queryByRole('region', { name: 'Type' })).toBeNull()
      expect(cardNames('Book')).toEqual(['Mistborn: The Final Empire'])
      expect(router.state.location.search).toBe('?group=book')

      chips.getByRole('link', { name: 'World' }).focus()
      await userEvent.keyboard('{Enter}')
      expect(screen.getAllByRole('region')).toHaveLength(1)
      expect(screen.queryByRole('region', { name: 'Book' })).toBeNull()
      expect(cardNames('World')).toEqual(['Scadrial'])
      expect(chips.getByRole('link', { name: 'World' })).toHaveAttribute(
        'aria-current',
        'true',
      )
    },
  )

  it('opens a ?group= link at the top with only the selected grouping', async () => {
    const scrolled: string[] = []
    Element.prototype.scrollIntoView = function (this: Element) {
      scrolled.push(this.id)
    }
    // Pushed from another page, so scroll memory left by an earlier test in
    // this file doesn't count as a Back.
    const router = renderAt('/', ['final-empire'])
    screen.getByRole('main').scrollTop = 500
    await act(() => router.navigate('/culture?group=world'))
    await screen.findByRole('region', { name: 'World' })
    expect(screen.getAllByRole('region')).toHaveLength(1)
    expect(scrolled).toEqual([])
    expect(screen.getByRole('main').scrollTop).toBe(0)
  })

  it('still lists, and still takes a pick, when the browser blocks storage', async () => {
    const get = Storage.prototype.getItem
    const set = Storage.prototype.setItem
    const ours = (key: string) => key.startsWith('cosmere-guide:list-')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (
      this: Storage,
      key,
    ) {
      if (ours(key)) throw new Error('blocked')
      return get.call(this, key)
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (ours(key)) throw new Error('blocked')
      set.call(this, key, value)
    })
    try {
      const router = renderAt('/culture', ['final-empire'])
      expect(screen.getByRole('region', { name: 'Type' })).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: /Try a style/ }))
      expect(screen.queryByRole('group', { name: 'Layout' })).toBeNull()
      await userEvent.click(screen.getByRole('button', { name: 'Banner' }))
      expect(screen.getAllByRole('region')).toHaveLength(1)
      expect(router.state.location.search).toBe('?cards=banner')
      expect(
        within(screen.getByRole('region', { name: 'Type' })).getByRole('list'),
      ).toHaveAttribute('data-card', 'banner')
    } finally {
      vi.restoreAllMocks()
    }
  })

  it('filters by name, swapping the cards for the matches', async () => {
    renderAt('/culture?q=venture', ['final-empire'])
    expect(names()).toEqual(['House Venture'])
    expect(screen.getByText(/^1 of \d+ entries/)).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Type' })).toBeNull()
    await userEvent.clear(screen.getByRole('searchbox'))
    expect(screen.getByRole('region', { name: 'Type' })).toBeInTheDocument()
    await userEvent.type(screen.getByRole('searchbox'), 'skaa')
    expect(names()).toEqual(['Skaa', 'Skaa rebellion'])
  })

  it('counts "Not sorted yet" from the entries the reader can see', async () => {
    const read = ['way-of-kings']
    renderAt('/culture?group=world', read)
    const unsorted = shownAfter(read).filter((c) => !c.world)
    expect(unsorted.length).toBeGreaterThan(0)
    const card = within(
      screen.getByRole('region', { name: 'World' }),
    ).getByRole('link', { name: /^Not sorted yet, / })
    expect(card).toHaveAccessibleName(
      `Not sorted yet, ${unsorted.length} ${unsorted.length === 1 ? 'entry' : 'entries'}`,
    )
    await userEvent.click(card)
    expect(names()).toEqual(
      unsorted.map((c) => c.name).sort((a, b) => a.localeCompare(b)),
    )
  })

  it('has an empty page, naming nothing, for a group the reader cannot see', () => {
    renderAt('/culture?group=world&of=roshar', ['final-empire'])
    expect(screen.getByRole('heading', { level: 1, name: 'Culture' }))
    expect(screen.getByText('Nothing matches.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse by group' }))
    expect(names()).toEqual([])
    expect(screen.queryByText(/Roshar/)).toBeNull()
  })

  it('shows every entry once every book is read', () => {
    renderAt(
      '/culture?group=name',
      books.map((b) => b.id),
    )
    expect(screen.queryByText(/hidden based on/)).toBeNull()
    expect(names()).toHaveLength(cultureList.length)
  })
})
