import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { books } from './data/books'
import { chapters } from './data/chapters'
import {
  listedLocations,
  mapPlaceOf,
  placeKnownIn,
  placeRevealedIn,
} from './data/listedLocations'
import { hasLocationStory, loadLocationStory } from './data/locationStories'
import { planetMaps } from './data/maps'
import { readerCanSee } from './data/reveal'
import type { ListedLocation } from './data/types'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

// The only real place art unlocks with the book that shows what lies inside
// the place, so give Luthadel art from a later book to see its card wait.
vi.mock('./data/entryArt', async (importOriginal) => {
  const real = await importOriginal<typeof import('./data/entryArt')>()
  return {
    ...real,
    entryArt: {
      ...real.entryArt,
      'place:luthadel': [
        {
          src: '/entries/test-sketch.webp',
          alt: 'A test sketch of Luthadel',
          artist: 'Test Artist',
          revealedIn: ['well-of-ascension'],
        },
      ],
    },
  }
})

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

// On a group's own page the article is named for the group, not the list.
const list = () => screen.getByRole('article')
const names = () =>
  [...list().querySelectorAll('.character-group li')].map((li) =>
    li.textContent?.trim(),
  )
const grouping = (label: string) => screen.getByRole('region', { name: label })
/** The groups with a card in a grouping (a card is "<group>, <count>"). */
const groups = (label: string) =>
  within(grouping(label))
    .getAllByRole('link')
    .map((card) =>
      card.getAttribute('aria-label')?.replace(/, \d+ places?$/, ''),
    )
const card = (label: string, group: string) =>
  within(grouping(label)).getByRole('link', {
    name: (name) => name.startsWith(`${group}, `),
  })
/** A card's picture, without the hue of its panel. */
const picture = (element: HTMLElement) =>
  element.firstElementChild?.outerHTML.replace(/[^\s"]*tone\d[^\s"]*/, '')
const ERA1 = ['final-empire', 'well-of-ascension', 'hero-of-ages']
const SUNLIT_NAMED = { 'sunlit-man': '7' }
const SUNLIT_INTRO = { 'sunlit-man': '13' }

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('locations list', () => {
  it('lists places by letter, linking map places to their pages', () => {
    renderAt(
      '/locations?group=name',
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
    expect(screen.queryAllByRole('region')).toEqual([])
    expect(screen.getByText('No places match.')).toBeInTheDocument()
    expect(
      screen.getByText(/hidden based on what you've read so far/),
    ).toBeInTheDocument()
    cleanup()
    renderAt('/locations?group=name')
    expect(names()).toEqual([])
  })

  it('hides places from books the reader has not finished', () => {
    renderAt('/locations?group=name', ['final-empire'])
    expect(names()).toContain('Luthadel')
    expect(names()).not.toContain('Kholinar')
    // Era 2's city would give away how Era 1 ends.
    expect(names()).not.toContain('Elendel')
  })

  it('shows later places once their book is finished', () => {
    renderAt('/locations?group=name', [...ERA1, 'alloy-of-law', 'way-of-kings'])
    expect(names()).toEqual(expect.arrayContaining(['Elendel', 'Kholinar']))
  })

  it('groups by world without naming worlds the reader has not reached', () => {
    renderAt('/locations?group=world', ['final-empire'])
    expect(groups('World')).toContain('Scadrial')
    expect(groups('World')).not.toContain('Roshar')
  })

  it('lists worlds, and the places that hold others, biggest first', async () => {
    renderAt(
      '/locations',
      books.map((b) => b.id),
    )
    for (const label of ['World', 'Inside']) {
      await userEvent.click(
        within(screen.getByRole('navigation', { name: 'Browse by' })).getByRole(
          'link',
          { name: label },
        ),
      )
      const sizes = within(grouping(label))
        .getAllByRole('link')
        .map((c) => c.getAttribute('aria-label') ?? '')
        .filter((name) => !name.startsWith('Not sorted yet, '))
        .map((name) => Number(/(\d+) places?$/.exec(name)?.[1]))
      expect(sizes.length).toBeGreaterThan(1)
      expect(sizes).toEqual([...sizes].sort((a, b) => b - a))
    }
  })

  it('opens a type with the places of that type, and a series as a card', async () => {
    const user = userEvent.setup()
    renderAt('/locations?group=type', ERA1)
    await user.click(card('Type', 'Cities and towns'))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cities and towns' }),
    ).toBeInTheDocument()
    expect(names()).toContain('Luthadel')
    cleanup()
    renderAt('/locations?group=series', ERA1)
    expect(groups('Series')).toContain('Mistborn (Era 1)')
  })

  it('filters by name', () => {
    renderAt('/locations?q=kredik', ERA1)
    expect(names()).toEqual(['Kredik Shaw'])
  })

  it('groups by book, only books the reader may see', () => {
    renderAt('/locations?group=book', ERA1)
    const wellOf = books.find((b) => b.id === 'well-of-ascension')!.title
    expect(groups('Book')).toContain(wellOf)
    expect(groups('Book')).not.toContain(
      books.find((b) => b.id === 'way-of-kings')!.title,
    )
    cleanup()
    renderAt('/locations?group=book&of=well-of-ascension', ERA1)
    const inBook = listedLocations
      .filter((l) => l.books.includes('well-of-ascension'))
      .map((l) => l.name)
    expect(names().length).toBeGreaterThan(0)
    for (const name of names()) expect(inBook).toContain(name)
  })

  it('groups a place under the book being read once it is revealed', () => {
    const sunlit = books.find((b) => b.id === 'sunlit-man')!.title
    renderAt('/locations?group=book', [], { 'sunlit-man': '6' })
    expect(screen.queryByRole('region', { name: 'Book' })).toBeNull()
    cleanup()
    renderAt('/locations?group=book', [], SUNLIT_NAMED)
    expect(groups('Book')).toEqual([sunlit])
    cleanup()
    renderAt('/locations?group=book&of=sunlit-man', [], SUNLIT_NAMED)
    expect(names()).toEqual(['Beacon'])
  })

  it('files a place named in a chapter under Not sorted yet until the chapter that says what it is', () => {
    // Under its book from the start (the book names it), but nowhere else.
    renderAt('/locations?group=type', [], SUNLIT_NAMED)
    expect(screen.queryByRole('region', { name: 'Type' })).toBeNull()
    cleanup()
    const by = {
      type: 'Type',
      world: 'World',
      series: 'Series',
      inside: 'Inside',
      feature: 'Page feature',
    }
    for (const [group, label] of Object.entries(by)) {
      renderAt(`/locations?group=${group}`, ['final-empire'], SUNLIT_NAMED)
      expect(groups(label)).toContain('Not sorted yet')
      cleanup()
      renderAt(
        `/locations?group=${group}&of=unsorted`,
        ['final-empire'],
        SUNLIT_NAMED,
      )
      expect(names()).toContain('Beacon')
      cleanup()
    }
    const cities = '/locations?group=type&of=settlement'
    renderAt(cities, ['final-empire'], SUNLIT_NAMED)
    expect(names()).not.toContain('Beacon')
    cleanup()
    renderAt(cities, ['final-empire'], SUNLIT_INTRO)
    expect(names()).toContain('Beacon')
    cleanup()
    renderAt('/locations?group=type', ['final-empire'], SUNLIT_INTRO)
    expect(groups('Type')).not.toContain('Not sorted yet')
  })

  it("keeps a place's feature links and the legend on a group's page", () => {
    renderAt('/locations?group=feature&of=map', ['final-empire'])
    const row = within(list())
      .getByRole('link', { name: 'Luthadel' })
      .closest('li')!
    expect(
      within(row).getByRole('link', { name: 'Luthadel: Map' }),
    ).toHaveAttribute(
      'href',
      '/systems/scadrian/planets/scadrial/locations/luthadel#map',
    )
    expect(
      screen.getByRole('group', { name: 'Icon legend' }),
    ).toHaveTextContent('Map')
    cleanup()
    renderAt('/locations?group=feature&of=no-features', ['final-empire'])
    expect(names().length).toBeGreaterThan(0)
    expect(screen.queryAllByRole('link', { name: /: Map$/ })).toEqual([])
  })
})

describe('a place that holds others', () => {
  it('has a card with the same panel whether its art is locked or there is none', () => {
    renderAt('/locations?group=inside', ['final-empire'])
    const locked = card('Inside', 'Luthadel')
    expect(locked.querySelector('img, [data-art]')).toBeNull()
    expect(locked).not.toHaveTextContent('Art:')
    expect(picture(locked)).toContain('search-icon')
    expect(picture(locked)).not.toContain('monogram')
    expect(picture(locked)).toBe(picture(card('Inside', 'Final Empire')))
    cleanup()
    renderAt('/locations?group=inside', ['final-empire', 'well-of-ascension'])
    const unlocked = card('Inside', 'Luthadel')
    expect(unlocked.querySelector('img')).toHaveAttribute(
      'src',
      expect.stringContaining('test-sketch'),
    )
    expect(unlocked).toHaveTextContent('Art: Test Artist')
  })

  it('shows its art on the page of what is inside it only once unlocked', () => {
    const sketch = { name: 'A test sketch of Luthadel' }
    renderAt('/locations?group=inside&of=luthadel', ['final-empire'])
    expect(screen.queryByRole('img', sketch)).toBeNull()
    expect(screen.queryByText(/^Art:/)).toBeNull()
    cleanup()
    renderAt('/locations?group=inside&of=luthadel', [
      'final-empire',
      'well-of-ascension',
    ])
    expect(screen.getByRole('img', sketch)).toBeInTheDocument()
    expect(screen.getByText('Art: Test Artist')).toBeInTheDocument()
  })

  it('has a card once something inside it can be seen, counting only what can', async () => {
    const user = userEvent.setup()
    const read = ['way-of-kings', 'words-of-radiance']
    renderAt('/locations?group=name', read)
    expect(names()).toContain('Urithiru')
    cleanup()
    renderAt('/locations?group=inside', read)
    expect(groups('Inside')).not.toContain('Urithiru')
    const holder = card('Inside', 'Alethkar')
    const seen = Number(
      /(\d+) places$/.exec(holder.getAttribute('aria-label') ?? '')?.[1],
    )
    expect(seen).toBeGreaterThan(0)
    expect(seen).toBeLessThan(
      listedLocations.filter((l) => l.parentId === 'alethkar').length,
    )
    await user.click(holder)
    expect(names()).toHaveLength(seen)
    expect(screen.getByText(`${seen} places`)).toBeInTheDocument()
    cleanup()
    renderAt('/locations?group=inside', [...read, 'oathbringer'])
    expect(card('Inside', 'Urithiru').querySelector('img')).toHaveAttribute(
      'src',
      expect.stringContaining('place-urithiru'),
    )
  })

  it('does not name the place that holds another until the reader can see it', () => {
    const read = ['final-empire', 'well-of-ascension']
    const canSee = readerCanSee({ read: new Set(read), reading: new Map() })
    const holderOf = (l: ListedLocation) =>
      listedLocations.find((p) => p.id === l.parentId)
    // Found from the data, so the test doesn't name places it hides.
    const inside = listedLocations.find((l) => {
      const holder = holderOf(l)
      return (
        holder &&
        canSee(placeRevealedIn(l)) &&
        canSee(placeKnownIn(l)) &&
        !canSee(placeRevealedIn(holder))
      )
    })!
    const holder = holderOf(inside)!
    renderAt('/locations?group=inside', read)
    expect(groups('Inside')).not.toContain(holder.name)
    cleanup()
    renderAt('/locations?group=inside&of=unsorted', read)
    expect(names()).toContain(inside.name)
    expect(screen.queryByText(holder.name)).toBeNull()
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
    const page = within(screen.getByRole('article'))
    expect(page.queryByText('Type')).toBeNull()
    expect(page.queryByText('World')).toBeNull()
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
        name: 'Pits of Hathsin circled on a map of The Final Empire',
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
      screen.queryByRole('img', { name: / (outlined|circled) on a map/ }),
    ).not.toBeInTheDocument()
  })

  const roshar = '/systems/rosharan/planets/roshar/locations'
  const outline = (name: string) =>
    screen.findByRole('img', { name: `${name} outlined on a map of Roshar` })

  it('redraws each piece of a place over the greyed map, unlabelled', async () => {
    renderAt(`${roshar}/aimia`, ['way-of-kings'])
    const svg = await outline('Aimia')
    const pieces = planetMaps.roshar
      .find((m) => m.id === 'roshar')!
      .versions.flatMap((v) => v.hotspots ?? [])
      .filter((h) => h.locationId === 'aimia')
    expect(pieces.length).toBeGreaterThan(1)
    expect(svg.querySelectorAll('clipPath polygon')).toHaveLength(pieces.length)
    expect(svg.querySelector('image[clip-path]')).toBeInTheDocument()
    expect(svg.querySelector('text')).not.toBeInTheDocument()
    expect(svg.closest('.map-viewer-frame')).toHaveClass('is-spotlit')
    expect(
      screen.getByText((_, el) =>
        el?.matches('.place-key span')
          ? el.textContent === 'Aimia outlined on the map of Roshar'
          : false,
      ),
    ).toBeInTheDocument()
  })

  describe('framed on the place', () => {
    // A laid-out 800×500 frame, so PanZoom can frame the place.
    afterEach(() => {
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
    })
    const laidOut = () => {
      vi.stubGlobal(
        'ResizeObserver',
        class {
          cb: (entries: unknown[]) => void
          constructor(cb: (entries: unknown[]) => void) {
            this.cb = cb
          }
          observe() {
            this.cb([{ contentRect: { width: 800, height: 500 } }])
          }
          disconnect() {}
        },
      )
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 500,
      } as DOMRect)
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(800)
      vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(800)
      vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(500)
    }

    it('opens zoomed on a small place and toggles the whole map', async () => {
      laidOut()
      renderAt(`${roshar}/steen`, ['way-of-kings'])
      await outline('Steen')
      const showAll = await screen.findByRole('button', {
        name: 'Show all of Roshar',
      })
      expect(document.querySelector('.place-inset')).toBeInTheDocument()
      expect(document.querySelector('.place-tag')).not.toBeInTheDocument()
      await userEvent.click(showAll)
      expect(
        screen.getByRole('button', { name: 'Back to Steen' }),
      ).toBeInTheDocument()
      expect(document.querySelector('.place-tag')).toHaveTextContent('Steen')
      expect(document.querySelector('.place-inset')).not.toBeInTheDocument()
      await userEvent.click(
        screen.getByRole('button', { name: 'Back to Steen' }),
      )
      expect(
        screen.getByRole('button', { name: 'Show all of Roshar' }),
      ).toBeInTheDocument()
    })

    it('has no toggle for a place that already fills its map', async () => {
      laidOut()
      renderAt(
        '/systems/nalthian/planets/nalthis/locations/hallandren-jungle',
        ['warbreaker'],
      )
      await screen.findByRole('img', {
        name: "Hallandren Jungle outlined on a map of T'Telir",
      })
      expect(
        screen.queryByRole('button', { name: /^Show all of/ }),
      ).not.toBeInTheDocument()
      expect(document.querySelector('.place-tag')).not.toBeInTheDocument()
      expect(document.querySelector('.place-inset')).not.toBeInTheDocument()
    })
  })
})

describe('place pages', () => {
  const era1 = readerCanSee({ read: new Set(ERA1), reading: new Map() })
  const listedOnly = listedLocations.find(
    (l) =>
      !mapPlaceOf(l) &&
      hasLocationStory(l.id) &&
      l.kind !== 'planet' &&
      l.world === 'scadrial' &&
      era1(placeRevealedIn(l)),
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
    renderAt('/locations?group=name', ERA1)
    expect(
      within(list()).getByRole('link', { name: listedOnly.name }),
    ).toHaveAttribute('href', `/locations/${listedOnly.id}`)
  })

  it("shows a place's art once its book is finished", async () => {
    const sketches = /Shallan's sketches of Urithiru/
    renderAt('/locations/urithiru', ['way-of-kings', 'words-of-radiance'])
    await screen.findByRole('heading', { level: 1, name: 'Urithiru' })
    expect(screen.queryByRole('img', { name: sketches })).toBeNull()
    cleanup()
    renderAt('/locations/urithiru', [
      'way-of-kings',
      'words-of-radiance',
      'oathbringer',
    ])
    expect(
      await screen.findByRole('img', { name: sketches }),
    ).toBeInTheDocument()
  })

  it('trims a long list of characters to the notable ones until asked', async () => {
    const user = userEvent.setup()
    renderAt('/locations/urithiru', [
      'way-of-kings',
      'words-of-radiance',
      'oathbringer',
    ])
    const section = await screen.findByRole('region', {
      name: 'Notable characters',
    })
    const shown = within(section).getAllByRole('link').length
    await user.click(
      within(section).getByRole('button', { name: /^See all \d+ characters$/ }),
    )
    expect(within(section).getAllByRole('link').length).toBeGreaterThan(shown)
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
