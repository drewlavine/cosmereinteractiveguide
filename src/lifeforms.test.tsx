import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { cultureList } from './data/culture'
import { entryRevealedIn } from './data/entryStories'
import { lesserSpren, lifeformList, listedLifeforms } from './data/lifeforms'
import { readerCanSee } from './data/reveal'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const renderAt = (
  path: string,
  read: string[] = [],
  reading: Record<string, string> = {},
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

const list = () => screen.getByRole('article', { name: 'Lifeforms' })
const names = () =>
  [...list().querySelectorAll('.character-group li')].map((li) =>
    li.textContent?.trim(),
  )
const headings = () =>
  within(list())
    .queryAllByRole('heading', { level: 2 })
    .map((h) => h.textContent?.replace(/\s*\d+$/, ''))
const shownAfter = (read: string[]) => {
  const canSee = readerCanSee({ read: new Set(read), reading: new Map() })
  return listedLifeforms.filter((e) => canSee(entryRevealedIn('lifeform', e)))
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('lifeforms list', () => {
  it('holds spren, species, creatures and plants, none of them in Culture', () => {
    const kinds = new Set(lifeformList.map((e) => e.kind))
    expect([...kinds].sort()).toEqual([
      'creature',
      'lesser-spren',
      'plant',
      'species',
      'spren',
      'true-spren',
      'unique-spren',
    ])
    const culture = new Set(cultureList.map((c) => c.coppermindPage))
    expect(lifeformList.filter((e) => culture.has(e.coppermindPage))).toEqual(
      [],
    )
  })

  it('lists a spren type the Coppermind covers only in its Spren article', () => {
    const windspren = lifeformList.find((e) => e.id === 'windspren')
    expect(windspren).toMatchObject({
      kind: 'lesser-spren',
      world: 'roshar',
    })
    expect(windspren?.coppermindPage).toBe('Windspren')
  })

  it('shows nothing before any book is read', () => {
    renderAt('/lifeforms')
    expect(names()).toEqual([])
  })

  it('lists true spren, one Lesser spren page, and hides unread books', () => {
    renderAt('/lifeforms', ['way-of-kings'])
    expect(headings().slice(0, 2)).toEqual(['Spren', 'True spren'])
    expect(headings()).not.toContain('Lesser spren')
    expect(names()).toEqual(
      expect.arrayContaining(['Lesser spren', 'Honorspren', 'Chasmfiend']),
    )
    expect(names()).not.toContain('Windspren')
    expect(names()).not.toContain('Cryptic')
    expect(names()).toHaveLength(shownAfter(['way-of-kings']).length)
    cleanup()
    renderAt('/lifeforms', ['way-of-kings', 'words-of-radiance'])
    expect(names()).toContain('Cryptic')
  })
})

describe('lifeform pages', () => {
  it('opens under Lifeforms, and old Culture links redirect there', async () => {
    renderAt('/culture/honorspren', ['way-of-kings'])
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Honorspren' }),
    ).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(
      within(nav).getByRole('link', { name: 'Lifeforms' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  const lesserPage = (read: string[]) => {
    renderAt('/lifeforms/lesser-spren', read)
    return screen.findByRole('heading', { level: 1, name: 'Lesser spren' })
  }
  const kind = (id: string) => document.getElementById(id) as HTMLElement | null
  const art = (id: string) =>
    kind(id)?.querySelector('.character-portrait img')?.getAttribute('src')

  it('gathers the lesser spren on one page, each in its own part', async () => {
    await lesserPage(['way-of-kings'])
    const windspren = kind('windspren')!
    expect(
      within(windspren).getByRole('heading', { level: 3, name: 'Windspren' }),
    ).toBeInTheDocument()
    expect(windspren.querySelectorAll('p').length).toBeGreaterThan(0)
    // Who's seen with it waits for the scene
    expect(windspren.querySelector('.entry-card-people')).toBeNull()
    // Unmet kinds aren't there at all
    const canSee = readerCanSee({
      read: new Set(['way-of-kings']),
      reading: new Map(),
    })
    const unmet = lesserSpren.filter(
      (e) => !canSee(entryRevealedIn('lifeform', e)),
    )
    expect(unmet.length).toBeGreaterThan(0)
    for (const e of unmet) expect(kind(e.id)).toBeNull()
    cleanup()
    await lesserPage(['way-of-kings', 'words-of-radiance', 'oathbringer'])
    const seen =
      kind('windspren')!.querySelector<HTMLElement>('.entry-card-people')!
    expect(within(seen).getByRole('link', { name: 'Kaladin' })).toHaveAttribute(
      'href',
      '/characters/kaladin',
    )
  })

  it('holds the place of art not shown with a placeholder', async () => {
    await lesserPage(['way-of-kings'])
    const noArt = (id: string) => kind(id)!.querySelector('.entry-card-no-art')
    // Flamespren art waits for Oathbringer
    expect(noArt('flamespren')).toHaveTextContent('No art yet')
    expect(noArt('painspren')).toBeNull()
  })

  it("sends a lesser spren's old page to its part of the shared page", async () => {
    renderAt('/lifeforms/windspren', ['way-of-kings'])
    await screen.findByRole('heading', { level: 1, name: 'Lesser spren' })
    expect(kind('windspren')).not.toBeNull()
  })

  it('shows spren art dated by what it shows', async () => {
    await lesserPage(['way-of-kings'])
    expect(art('painspren')).toBe('/entries/lifeform-painspren.webp')
    // Shows spren held in gems, which waits for Oathbringer's end
    expect(art('flamespren')).toBeUndefined()
    cleanup()
    await lesserPage(['way-of-kings', 'oathbringer'])
    expect(art('painspren')).toBe('/entries/lifeform-painspren-2.webp')
    expect(art('flamespren')).toBeDefined()
  })

  it('shows the whole picture when the art is clicked', async () => {
    await lesserPage(['way-of-kings'])
    await userEvent.click(
      within(kind('painspren')!).getByRole('button', {
        name: 'View the whole picture',
      }),
    )
    const viewer = screen.getByRole('dialog', { name: 'Picture' })
    expect(within(viewer).getByRole('img')).toHaveAttribute(
      'src',
      '/entries/lifeform-painspren.webp',
    )
    expect(
      within(viewer).getByRole('link', { name: "Holly D'Oench" }),
    ).toBeInTheDocument()
    await userEvent.click(
      within(viewer).getByRole('button', { name: 'Close picture' }),
    )
    expect(screen.queryByRole('dialog', { name: 'Picture' })).toBeNull()
  })

  it('groups the lesser spren into emotion and nature spren', async () => {
    await lesserPage(['way-of-kings'])
    expect(kind('emotion-spren')!.contains(kind('painspren'))).toBe(true)
    expect(kind('nature-spren')!.contains(kind('windspren'))).toBe(true)
  })

  const sectionTitles = () =>
    screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent?.trim())

  it('splits the Spren page into the Coppermind’s parts, each when its facts are', async () => {
    const sprenPage = async (read: string[]) => {
      renderAt('/lifeforms/spren', read)
      await screen.findByRole('heading', { level: 1, name: 'Spren' })
    }
    await sprenPage(['way-of-kings', 'words-of-radiance'])
    expect(sectionTitles()).toEqual(
      expect.arrayContaining(['Characteristics', 'Classification', 'Bonds']),
    )
    expect(sectionTitles()).not.toContain('Enlightened spren')
    cleanup()
    await sprenPage(['way-of-kings', 'words-of-radiance', 'oathbringer'])
    expect(sectionTitles()).toContain('Enlightened spren')
  })

  it('sums up each true spren met, linking to its own page', async () => {
    const truePage = async (read: string[]) => {
      renderAt('/lifeforms/true-spren', read)
      await screen.findByRole('heading', { level: 1, name: 'True spren' })
    }
    await truePage(['way-of-kings'])
    const honorspren = kind('honorspren')!
    expect(
      within(honorspren).getByRole('link', { name: 'Honorspren' }),
    ).toHaveAttribute('href', '/lifeforms/honorspren')
    expect(honorspren.querySelectorAll('p').length).toBeGreaterThan(0)
    expect(kind('cryptic')).toBeNull()
    cleanup()
    await truePage(['way-of-kings', 'words-of-radiance'])
    expect(kind('cryptic')).not.toBeNull()
  })

  it('opens Unique spren once the books name them as a kind', async () => {
    renderAt('/lifeforms/unique-spren', ['way-of-kings', 'words-of-radiance'], {
      oathbringer: '103',
    })
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Not reached yet' }),
    ).toBeInTheDocument()
    cleanup()
    renderAt('/lifeforms/unique-spren', ['way-of-kings', 'words-of-radiance'], {
      oathbringer: '104',
    })
    await screen.findByRole('heading', { level: 1, name: 'Unique spren' })
    expect(
      within(kind('stormfather')!).getByRole('link', { name: 'Stormfather' }),
    ).toHaveAttribute('href', '/characters/stormfather')
    expect(
      within(kind('unmade')!).getByRole('link', { name: 'Unmade' }),
    ).toHaveAttribute('href', '/lifeforms/unmade')
  })
})
