import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { books } from './data/books'
import { loadStory, storyIds } from './data/characterStories'
import { listedLocations, placeHref } from './data/listedLocations'
import { hasLocationStory, loadLocationStory } from './data/locationStories'
import { featuresOf } from './data/pageFeatures'
import { people } from './data/people'
import { findPersona, hasMet, readerCanSee } from './data/reveal'
import { systems } from './data/systems'
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

const allBooks = books.map((b) => b.id)
const ctxOf = (read: string[]) => ({
  canSee: readerCanSee({ read: new Set(read), reading: new Map() }),
})
const planetShown = (read: string[]) => (id: string) =>
  systems
    .flatMap((s) => s.planets)
    .some((p) => p.id === id && ctxOf(read).canSee(p.revealedIn))
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const featureLinks = (name: string) =>
  screen
    .queryAllByRole('link', { name: new RegExp(`^${escape(name)}: `) })
    .map((a) => [a.getAttribute('aria-label'), a.getAttribute('href')])

// Found from the data, so the tests don't name who travels where.
const travellers = people.filter(
  (c) =>
    !findPersona(c.id) && featuresOf('character', c, ctxOf(allBooks)).length,
)
/** A traveller met in a single book whose Travels that book doesn't show. */
const travelHidden = books
  .flatMap((b) => travellers.map((c) => ({ c, read: [b.id] })))
  .find(
    ({ c, read }) =>
      hasMet(c.id, ctxOf(read).canSee) &&
      !featuresOf('character', c, ctxOf(read)).length,
  )

afterEach(() => {
  cleanup()
  localStorage.clear()
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
})

describe('page feature icons', () => {
  beforeAll(() =>
    Promise.all([
      ...storyIds.map(loadStory),
      ...listedLocations
        .filter((l) => hasLocationStory(l.id))
        .map((l) => loadLocationStory(l.id)),
    ]),
  )

  it('links a traveller to their Travels, with a legend', () => {
    const [c] = travellers
    renderAt('/characters', allBooks)
    expect(featureLinks(c.name)).toEqual([
      [`${c.name}: Travels`, `/characters/${c.id}#travels`],
    ])
    const legend = screen.getByRole('group', { name: 'Icon legend' })
    expect(legend).toHaveTextContent('Travels')
    expect(legend).not.toHaveTextContent('Map')
    // Icons add no text to the entry; the tooltip comes from CSS.
    expect(
      screen.getByRole('link', { name: `${c.name}: Travels` }),
    ).toHaveAttribute('data-tip', 'Travels')
    expect(
      screen.getByRole('link', { name: `${c.name}: Travels` }).closest('li'),
    ).toHaveTextContent(new RegExp(`^${escape(c.name)}$`))
  })

  it('shows no Travels icon until the Travels section would show', () => {
    expect(travelHidden).toBeDefined()
    const { c, read } = travelHidden!
    renderAt('/characters', read)
    expect(screen.getByRole('link', { name: c.name })).toBeInTheDocument()
    expect(featureLinks(c.name)).toEqual([])
  })

  it('shows no legend when no listed entry has a feature', () => {
    renderAt('/characters')
    expect(screen.queryByRole('group', { name: 'Icon legend' })).toBeNull()
  })

  it('opens the page at the section the icon names', async () => {
    const scrolled: string[] = []
    Element.prototype.scrollIntoView = function (this: Element) {
      scrolled.push(this.id)
    }
    const [c] = travellers
    renderAt('/characters', allBooks)
    await userEvent.click(
      screen.getByRole('link', { name: `${c.name}: Travels` }),
    )
    const section = await screen.findByRole('region', { name: 'Travels' })
    expect(section.id).toBe('travels')
    expect(
      within(section).getByRole('button', { name: 'Travels' }),
    ).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() => expect(scrolled).toContain('travels'))
  })

  it('renders the section every traveller’s icon links to', async () => {
    for (const c of travellers) {
      const [{ section }] = featuresOf('character', c, ctxOf(allBooks))
      renderAt(`/characters/${c.id}#${section}`, allBooks)
      await waitFor(() =>
        expect(document.getElementById(section)).not.toBeNull(),
      )
      cleanup()
    }
  })

  it('opens the tab a link names in Kaladin’s tabbed layout', () => {
    renderAt('/characters/kaladin?layout=tabs#appearances', allBooks)
    expect(
      screen.getByRole('region', { name: 'Appearances' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'History' })).toBeNull()
  })

  it('links a place to its map, once its map’s book is read', () => {
    renderAt('/locations', ['final-empire'])
    expect(featureLinks('Luthadel')).toEqual([
      [
        'Luthadel: Map',
        '/systems/scadrian/planets/scadrial/locations/luthadel#map',
      ],
    ])
    expect(featureLinks('Pits of Hathsin')).toEqual([
      [
        'Pits of Hathsin: Map',
        '/systems/scadrian/planets/scadrial/locations/pits-of-hathsin#where-it-is',
      ],
    ])
    expect(
      screen.getByRole('group', { name: 'Icon legend' }),
    ).toHaveTextContent('Map')
  })

  it('shows no Map icon for a listed place whose maps are still hidden', () => {
    const found = books
      .flatMap((b) => listedLocations.map((l) => ({ l, read: [b.id] })))
      .find(
        ({ l, read }) =>
          ctxOf(read).canSee(l.revealedIn) &&
          !featuresOf('location', l, ctxOf(read)).length &&
          featuresOf('location', l, ctxOf(allBooks)).length,
      )
    expect(found).toBeDefined()
    const { l, read } = found!
    renderAt(`/locations?q=${encodeURIComponent(l.name)}`, read)
    expect(
      screen.getAllByRole('link', { name: l.name }).length,
    ).toBeGreaterThan(0)
    expect(featureLinks(l.name)).toEqual([])
  })

  it('renders the section each kind of map icon links to', async () => {
    const seen = new Set<string>()
    for (const l of listedLocations) {
      const [found] = featuresOf('location', l, ctxOf(allBooks))
      if (!found || seen.has(found.section)) continue
      seen.add(found.section)
      renderAt(
        `${placeHref(l, planetShown(allBooks))}#${found.section}`,
        allBooks,
      )
      await waitFor(() =>
        expect(document.getElementById(found.section)).not.toBeNull(),
      )
      cleanup()
    }
    expect(seen.size).toBeGreaterThanOrEqual(3)
  })
})

describe('grouping by page feature', () => {
  const headings = () =>
    screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
  const region = (name: string) => screen.queryByRole('region', { name })
  const inGroup = (group: string, name: string) => {
    const r = region(group)
    return !!r && !!within(r).queryByRole('link', { name })
  }

  it('groups characters under each feature their page shows', () => {
    renderAt('/characters?group=feature', allBooks)
    expect(headings()).toEqual(['Travels', 'No special features'])
    for (const c of travellers) expect(inGroup('Travels', c.name)).toBe(true)
    expect(inGroup('No special features', 'Kaladin')).toBe(true)
    expect(screen.queryByText(/not sorted by/)).toBeNull()
  })

  it('keeps a hidden feature out of the groups', () => {
    renderAt('/characters?group=feature')
    expect(headings()).toEqual(['No special features'])
    cleanup()
    const { c, read } = travelHidden!
    renderAt('/characters?group=feature', read)
    expect(inGroup('Travels', c.name)).toBe(false)
    expect(inGroup('No special features', c.name)).toBe(true)
  })

  it('groups places by their maps', () => {
    renderAt('/locations?group=feature', ['final-empire'])
    expect(headings()).toEqual(['Map', 'No special features'])
    expect(inGroup('Map', 'Luthadel')).toBe(true)
  })

  it('names no group for a feature still hidden', () => {
    const found = books
      .map((b) => [b.id])
      .find(
        (read) =>
          listedLocations.some((l) => ctxOf(read).canSee(l.revealedIn)) &&
          !listedLocations.some(
            (l) => featuresOf('location', l, ctxOf(read)).length,
          ),
      )
    expect(found).toBeDefined()
    renderAt('/locations?group=feature', found)
    expect(headings()).toEqual(['No special features'])
  })
})
