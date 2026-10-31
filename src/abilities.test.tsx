import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { abilityKindLabels, abilityList } from './data/abilities'
import { books } from './data/books'
import { entryRevealedIn } from './data/entryStories'
import { readerCanSee } from './data/reveal'
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

// On a group's page the article is named for the group, not the list.
const list = () => screen.getByRole('article')
const names = () =>
  [...list().querySelectorAll('.character-group li')].map((li) =>
    li.textContent?.trim(),
  )
const grouping = (label: string) =>
  within(screen.getByRole('region', { name: label }))
const cards = (label: string) =>
  grouping(label)
    .getAllByRole('link')
    .map((card) => card.getAttribute('aria-label'))
const card = (label: string, name: RegExp) =>
  grouping(label).getByRole('link', { name })
const shownAfter = (read: string[]) => {
  const canSee = readerCanSee({ read: new Set(read), reading: new Map() })
  return abilityList.filter((a) => canSee(entryRevealedIn('ability', a)))
}
const ERA1 = ['final-empire', 'well-of-ascension', 'hero-of-ages']
const SA = ['way-of-kings', 'words-of-radiance', 'edgedancer', 'oathbringer']

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('abilities list', () => {
  it('shows nothing before any book is read', () => {
    renderAt('/magic')
    expect(within(list()).queryAllByRole('region')).toEqual([])
    expect(screen.queryByRole('navigation', { name: 'Browse by' })).toBeNull()
    expect(
      screen.getByText(/hidden based on what you've read so far/),
    ).toBeInTheDocument()
    cleanup()
    renderAt('/magic?group=name')
    expect(names()).toEqual([])
  })

  it('lists what the finished books reveal, and nothing from other series', () => {
    renderAt('/magic?group=name', ['final-empire'])
    expect(names()).toEqual(expect.arrayContaining(['Allomancy', 'Steel']))
    expect(names()).not.toContain('Surgebinding')
    expect(names()).not.toContain('Stormlight')
  })

  it('makes a card for each type and system with something to show, counting only that', () => {
    const read = ['final-empire']
    renderAt('/magic', read)
    // A type with nothing to show yet (the Radiant orders) has no card.
    expect(cards('Type')).toEqual(
      Object.entries(abilityKindLabels).flatMap(([kind, label]) => {
        const n = shownAfter(read).filter((a) => a.kind === kind).length
        return n ? [`${label}, ${n} ${n === 1 ? 'entry' : 'entries'}`] : []
      }),
    )
    cleanup()
    renderAt('/magic?group=system&of=allomancy', read)
    expect(names()).toEqual(expect.arrayContaining(['Allomancy', 'Steel']))
  })

  it('names a Shard only once the books tie it to the magic', () => {
    renderAt('/magic?group=shard', ['final-empire'])
    expect(screen.queryByRole('region', { name: 'Shard' })).toBeNull()
    expect(list()).not.toHaveTextContent('Preservation')
    cleanup()
    // Asking for it by address tells a reader nothing either.
    renderAt('/magic?group=shard&of=preservation', ['final-empire'])
    expect(
      screen.getByRole('article', { name: 'Magic' }),
    ).not.toHaveTextContent('Preservation')
    cleanup()
    renderAt('/magic?group=shard', ERA1)
    expect(cards('Shard')).toContainEqual(
      expect.stringMatching(/^Preservation, \d+ entr/),
    )
    cleanup()
    renderAt('/magic?group=shard&of=preservation', ERA1)
    expect(names()).toContain('Allomancy')
  })

  it('shows every ability once every book is read', () => {
    renderAt(
      '/magic?group=name',
      books.map((b) => b.id),
    )
    expect(screen.queryByText(/hidden based on/)).toBeNull()
    expect(names()).toHaveLength(abilityList.length)
  })

  it('also finds an entry by another name the reader has met, and says which', () => {
    renderAt('/magic?q=lashing', ['way-of-kings'])
    expect(names()).toEqual(['Surgebinding (Lashing)'])
    cleanup()
    // This one is only met in the next book.
    renderAt('/magic?q=adhesion', ['way-of-kings'])
    expect(names()).toEqual([])
    expect(screen.getByText('Nothing matches.')).toBeInTheDocument()
  })
})

describe('card art', () => {
  // The Shard's ties to the magic need only these two books; its art also
  // waits for a timeline entry that Secret History unlocks.
  const TIED = ['warbreaker', 'arcanum-unbounded']
  // A card (or a group page's header) with its words and address, and the hue
  // picked from the group's name, taken out: what is left is how it is pictured.
  const look = (el: Element) =>
    el.outerHTML
      .replace(/ (aria-label|href)="[^"]*"/g, '')
      .replace(/ [^\s"]*tone\d[^\s"]*/, '')
      .replace(/>[^<]+</g, '><')
  const header = () => list().querySelector('header')!

  it('keeps a Shard on the plain symbol until its art may show, like a group with no art', async () => {
    // A type has no art of its own, so it shows what "no art" looks like.
    renderAt('/magic', TIED)
    const plain = look(card('Type', /^Magic systems, /))
    expect(plain).not.toContain('<img')
    await userEvent.click(
      within(screen.getByRole('navigation', { name: 'Browse by' })).getByRole(
        'link',
        { name: 'Shard' },
      ),
    )
    expect(look(card('Shard', /^Endowment, /))).toBe(plain)
    cleanup()
    renderAt('/magic?group=shard&of=endowment', TIED)
    const locked = look(header())
    expect(locked).not.toContain('<img')
    cleanup()
    renderAt('/magic?group=type&of=system', TIED)
    expect(look(header())).toBe(locked)
    cleanup()

    const read = [...TIED, 'secret-history']
    renderAt('/magic?group=shard', read)
    const shown = card('Shard', /^Endowment, /)
    expect(look(shown)).not.toBe(plain)
    expect(shown.querySelector('img')).toHaveAttribute(
      'src',
      '/shards/endowment.webp',
    )
    expect(shown).toHaveTextContent('Art: Cam Kuta')
    cleanup()
    renderAt('/magic?group=shard&of=endowment', read)
    expect(look(header())).not.toBe(locked)
    expect(within(list()).getByRole('img')).toHaveAccessibleName(
      'Stained-glass portrait of Endowment',
    )
    expect(list()).toHaveTextContent('Art: Cam Kuta')
  })

  it('pictures a group by what it is, never by one of its members', async () => {
    renderAt('/magic', SA)
    const chips = within(screen.getByRole('navigation', { name: 'Browse by' }))
    // The Radiant orders have art of their own (see "order art"); their type
    // and their system don't borrow it.
    expect(card('Type', /^Orders, /).querySelector('img')).toBeNull()
    await userEvent.click(chips.getByRole('link', { name: 'Magic system' }))
    expect(
      card('Magic system', /^Surgebinding, /).querySelector('img'),
    ).toHaveAttribute('src', '/entries/ability-surgebinding.webp')
    await userEvent.click(chips.getByRole('link', { name: 'Series' }))
    expect(
      card('Series', /^The Stormlight Archive, /).querySelector('img'),
    ).toHaveAttribute('src', expect.stringContaining('way-of-kings'))
    // A world is painted as its planet, not drawn as the symbol.
    await userEvent.click(chips.getByRole('link', { name: 'World' }))
    expect(
      card('World', /^Roshar, /).querySelector('svg:not(.search-icon)'),
    ).not.toBeNull()
  })
})

describe('old Abilities links', () => {
  it('redirect to the Magic tab, keeping the grouping asked for', async () => {
    renderAt('/abilities?group=system', ['final-empire'])
    expect(await screen.findByRole('article', { name: 'Magic' })).toBeTruthy()
    expect(
      within(screen.getByRole('navigation', { name: 'Browse by' })).getByRole(
        'link',
        { name: 'Magic system' },
      ),
    ).toHaveAttribute('aria-current', 'true')
  })

  it('redirect entry pages', async () => {
    renderAt('/abilities/allomancy', ERA1)
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Allomancy' }),
    ).toBeTruthy()
  })
})

describe('order art', () => {
  it('shows the glyph until a painting of modern Radiants may be seen', async () => {
    renderAt('/magic/order-of-bondsmiths', SA)
    const img = await screen.findByRole('img', {
      name: 'The glyph of the Bondsmiths',
    })
    expect(img).toHaveAttribute('src', '/entries/order-of-bondsmiths-glyph.svg')
    expect(screen.getByText(/Some information hidden/)).toBeInTheDocument()
  })

  it('shows the painting once its date is reached', async () => {
    renderAt('/magic/order-of-bondsmiths', [
      ...SA,
      'dawnshard',
      'rhythm-of-war',
    ])
    const fig = (
      await screen.findByRole('img', { name: /Two Bondsmiths/ })
    ).closest('figure')!
    expect(within(fig).getByRole('link', { name: 'Steve Argyle' })).toBeTruthy()
  })
})

describe('Radiant Ideals', () => {
  const group = (id: string) => document.getElementById(id)!

  it('lists each Radiant under the highest Ideal the reader has seen', async () => {
    renderAt('/magic/order-of-windrunners', SA)
    await screen.findByRole('heading', { level: 1, name: /Windrunners/ })
    expect(
      within(group('people-third-ideal')).getByRole('link', {
        name: /^Kaladin/,
      }),
    ).toBeTruthy()
    expect(document.getElementById('people-fourth-ideal')).toBeNull()
    expect(group('people-other')).toBeTruthy()
  })

  it('moves them up when a later Ideal is reached', async () => {
    renderAt('/magic/order-of-windrunners', [
      ...SA,
      'dawnshard',
      'rhythm-of-war',
    ])
    await screen.findByRole('heading', { level: 1, name: /Windrunners/ })
    expect(
      within(group('people-fourth-ideal')).getByRole('link', {
        name: /^Kaladin/,
      }),
    ).toBeTruthy()
    expect(
      within(group('people-third-ideal')).queryByRole('link', {
        name: /^Kaladin/,
      }),
    ).toBeNull()
  })
})
