import { cleanup, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { books } from './data/books'
import { chapters } from './data/chapters'
import { listedLocations, mapPlaceOf } from './data/listedLocations'
import { hasLocationStory, loadLocationStory } from './data/locationStories'
import { readerCanSee } from './data/reveal'
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

  it('groups by book, only books the reader may see', () => {
    renderAt('/locations?group=book', ERA1)
    const regions = screen
      .getAllByRole('region')
      .map((r) => r.getAttribute('aria-labelledby'))
    expect(regions.length).toBeGreaterThan(0)
    const wellOf = books.find((b) => b.id === 'well-of-ascension')!.title
    const group = screen.getByRole('region', { name: wellOf })
    const inBook = listedLocations
      .filter((l) => l.books.includes('well-of-ascension'))
      .map((l) => l.name)
    for (const li of group.querySelectorAll('li'))
      expect(inBook).toContain(li.textContent?.trim())
    expect(
      screen.queryByRole('region', {
        name: books.find((b) => b.id === 'way-of-kings')!.title,
      }),
    ).toBeNull()
  })

  it('groups a place under the book being read once it is revealed', () => {
    const sunlit = books.find((b) => b.id === 'sunlit-man')!.title
    renderAt('/locations?group=book', [], { 'sunlit-man': '6' })
    expect(screen.queryByRole('region', { name: sunlit })).toBeNull()
    cleanup()
    renderAt('/locations?group=book', [], { 'sunlit-man': '7' })
    expect(
      within(screen.getByRole('region', { name: sunlit })).getByText('Beacon'),
    ).toBeInTheDocument()
  })

  it('shows a place from the chapter that names it, sorted by type only once known', () => {
    renderAt('/locations?group=type', [], { 'sunlit-man': '7' })
    expect(within(list()).queryByText('Beacon')).toBeNull()
    expect(
      screen.getByText(/1 more place not sorted by type/),
    ).toBeInTheDocument()
    cleanup()
    renderAt('/locations?group=type', [], { 'sunlit-man': '13' })
    expect(within(list()).getByText('Beacon')).toBeInTheDocument()
  })
})

describe('a place only named so far', () => {
  it('says where it was mentioned and nothing more until its intro', async () => {
    renderAt('/locations/beacon', [], { 'sunlit-man': '7' })
    expect(
      await screen.findByText(
        'A place first mentioned in Chapter 7 of The Sunlit Man.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('Type')).toBeNull()
    expect(screen.queryByText('World')).toBeNull()
    cleanup()
    renderAt('/locations/beacon', [], { 'sunlit-man': '13' })
    expect(await screen.findByText('Type')).toBeInTheDocument()
    expect(screen.queryByText(/first mentioned in/)).toBeNull()
  })

  it('stays hidden before the chapter that names it', () => {
    renderAt('/locations/beacon', [], { 'sunlit-man': '6' })
    expect(
      screen.getByRole('heading', { name: 'Not reached yet' }),
    ).toBeInTheDocument()
  })
})

describe('location page maps', () => {
  const hathsin = '/systems/scadrian/planets/scadrial/locations/pits-of-hathsin'

  it('marks a place without its own map on the maps it appears on', async () => {
    renderAt(hathsin, ['final-empire'])
    expect(
      await screen.findByRole('heading', { name: 'Where it is' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: 'Pits of Hathsin marked on a map of The Final Empire',
      }),
    ).toBeInTheDocument()
    // The Scadrial map is from a later book, so there's nothing to choose.
    expect(
      screen.queryByRole('group', { name: 'Choose a map' }),
    ).not.toBeInTheDocument()
  })

  it('lets the reader choose between maps once more are unlocked', async () => {
    renderAt(
      hathsin,
      books.map((b) => b.id),
    )
    const choice = await screen.findByRole('group', { name: 'Choose a map' })
    expect(
      within(choice)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Scadrial', 'The Final Empire'])
  })

  it('shows a city its own map', async () => {
    renderAt('/systems/scadrian/planets/scadrial/locations/luthadel', [
      'final-empire',
    ])
    expect(
      await screen.findByRole('heading', { name: 'Map' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /^Luthadel: / })).toBeInTheDocument()
    expect(
      screen.queryByRole('img', { name: /marked on/ }),
    ).not.toBeInTheDocument()
  })
})

describe('place pages', () => {
  const listedOnly = listedLocations.find(
    (l) =>
      !mapPlaceOf(l) &&
      hasLocationStory(l.id) &&
      l.kind !== 'planet' &&
      l.world === 'scadrial',
  )!

  it('gives places without a map page a page of their own', async () => {
    renderAt(`/locations/${listedOnly.id}`, ERA1)
    expect(
      await screen.findByRole('heading', { level: 1, name: listedOnly.name }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('complementary', { name: 'Key facts' }),
    ).toBeInTheDocument()
  })

  it('links every listed place from the list', () => {
    renderAt('/locations', ERA1)
    expect(
      within(list()).getByRole('link', { name: listedOnly.name }),
    ).toHaveAttribute('href', `/locations/${listedOnly.id}`)
  })

  it('hides a place page before its book is read', () => {
    renderAt(`/locations/${listedOnly.id}`)
    expect(
      screen.getByRole('heading', { name: 'Not reached yet' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(listedOnly.name)).not.toBeInTheDocument()
  })

  it('sends map places to their map page', async () => {
    renderAt('/locations/luthadel', ERA1)
    const crumbs = await screen.findByRole('navigation', { name: 'Breadcrumb' })
    // Place pages belong to the Locations tab, with a geographic trail.
    expect(
      within(crumbs)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(['Locations', 'Scadrial', 'Final Empire', 'Central Dominance'])
    expect(within(crumbs).getByText('Luthadel')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it.each([5, 20, 40])(
    "shows Luthadel's text only up to the chapter reached (%i)",
    async (i) => {
      const woa = chapters['well-of-ascension'].map((c) => c.id)
      const reading = { 'well-of-ascension': woa[i] }
      const canSee = readerCanSee({
        read: new Set(['final-empire']),
        reading: new Map(Object.entries(reading)),
      })
      const story = (await loadLocationStory('luthadel'))!
      renderAt(
        '/systems/scadrian/planets/scadrial/locations/luthadel',
        ['final-empire'],
        reading,
      )
      await screen.findByRole('heading', { level: 1, name: 'Luthadel' })
      const page = document.body.textContent ?? ''
      const items = [
        ...story.description,
        ...story.history.flatMap((s) => [...s.title, ...s.items]),
      ]
      for (const item of items)
        if (!canSee(item.revealedIn))
          expect(page.includes(item.text), 'hidden item shown').toBe(false)
      const shownIntro = story.intro.filter((x) => canSee(x.revealedIn)).at(-1)
      if (shownIntro) expect(page).toContain(shownIntro.text)
    },
  )
})
