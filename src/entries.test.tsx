import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { chapters } from './data/chapters'
import { NOTABLE } from './data/notable'
import nightBrigade from './data/cultureStories/night-brigade.json'
import { routes } from './routes'
import { createSearch } from './search/engine'
import { readerCanSee } from './data/reveal'
import { BOOKS_READ_KEY } from './state/booksRead'
import type { RevealPoint } from './data/types'

const sunlit = chapters['sunlit-man'].map((c) => c.id)
const point = (r: RevealPoint[]) => r[0] as { book: string; chapter: string }
const firstIntro = point(nightBrigade.intro[0].revealedIn as RevealPoint[])
const before = sunlit[sunlit.indexOf(firstIntro.chapter) - 1]

const renderAt = (path: string, chapter: string) => {
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({
      version: 2,
      read: [],
      reading: { 'sunlit-man': chapter },
    }),
  )
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('culture pages', () => {
  it('appear at the chapter that first names them, not before', async () => {
    renderAt('/culture/night-brigade', before)
    expect(
      await screen.findByRole('heading', { name: 'Not reached yet' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(nightBrigade.intro[0].text)).toBeNull()
  })

  it('build up chapter by chapter once reached', async () => {
    renderAt('/culture/night-brigade', firstIntro.chapter)
    expect(
      await screen.findByText(
        (_, el) =>
          el?.tagName === 'P' && el.textContent === nightBrigade.intro[0].text,
      ),
    ).toBeInTheDocument()
    // Later facts wait for their own chapters.
    for (const f of nightBrigade.facts.filter(
      (f) =>
        sunlit.indexOf(point(f.revealedIn as RevealPoint[]).chapter) >
        sunlit.indexOf(firstIntro.chapter),
    ))
      expect(
        within(
          screen.getByRole('complementary', { name: 'Key facts' }),
        ).queryByText(f.name),
      ).toBeNull()
  })

  it('are linked from the Culture list once reached', async () => {
    renderAt('/culture', before)
    await screen.findByRole('article', { name: 'Culture' })
    expect(screen.queryByRole('link', { name: 'Night Brigade' })).toBeNull()
    cleanup()
    renderAt('/culture', firstIntro.chapter)
    expect(
      await screen.findByRole('link', { name: 'Night Brigade' }),
    ).toHaveAttribute('href', '/culture/night-brigade')
  })
})

describe('group members', () => {
  it('lists each with what the page says, in the page’s order', async () => {
    localStorage.setItem(
      BOOKS_READ_KEY,
      JSON.stringify({
        version: 2,
        read: ['way-of-kings', 'words-of-radiance', 'oathbringer'],
        reading: {},
      }),
    )
    render(
      <RouterProvider
        router={createMemoryRouter(routes, {
          initialEntries: ['/lifeforms/unmade'],
        })}
      />,
    )
    const members = await screen.findByRole('region', {
      name: 'Members of the Unmade',
    })
    const sja = within(members).getByRole('region', { name: 'Sja-anat' })
    expect(
      within(sja).getByText(
        (_, el) =>
          el?.tagName === 'P' &&
          !!el.textContent?.includes('saves Shallan and her companions'),
      ),
    ).toBeInTheDocument()
    // Rhythm of War's lines wait for it.
    expect(members.textContent).not.toContain('Glys and Tumi')
    // A card, its name linked to their page
    expect(within(sja).getByRole('link', { name: 'Sja-anat' })).toHaveAttribute(
      'href',
      '/characters/sja-anat',
    )
  })

  it('hides that Kalak leads the Sons of Honor until the reader learns it', async () => {
    const kalakAt = async (chapter: string) => {
      cleanup()
      localStorage.setItem(
        BOOKS_READ_KEY,
        JSON.stringify({
          version: 2,
          read: ['way-of-kings', 'words-of-radiance', 'oathbringer'],
          reading: { 'rhythm-of-war': chapter },
        }),
      )
      render(
        <RouterProvider
          router={createMemoryRouter(routes, {
            initialEntries: ['/magic/herald'],
          })}
        />,
      )
      const heralds = await screen.findByRole('region', { name: 'Heralds' })
      return within(heralds).getByRole('region', { name: 'Kalak' })
    }
    expect((await kalakAt('81')).textContent).not.toContain('Restares')
    expect(await kalakAt('82')).toHaveTextContent('Sons of Honor as Restares')
  })

  it('keeps Thaidakar apart from Kelsier until the reader sees through him', async () => {
    const membersAt = async (chapter: string) => {
      cleanup()
      localStorage.setItem(
        BOOKS_READ_KEY,
        JSON.stringify({
          version: 2,
          read: ['final-empire', 'way-of-kings', 'words-of-radiance'],
          reading: { 'rhythm-of-war': chapter },
        }),
      )
      render(
        <RouterProvider
          router={createMemoryRouter(routes, {
            initialEntries: ['/culture/ghostbloods'],
          })}
        />,
      )
      return screen.findByRole('region', { name: 'Notable members' })
    }
    let members = await membersAt('64')
    expect(
      within(members).getByRole('region', { name: 'Thaidakar' }),
    ).toBeInTheDocument()
    expect(within(members).queryByRole('region', { name: 'Kelsier' })).toBe(
      null,
    )
    expect(members.textContent).not.toContain('Kelsier')
    members = await membersAt('115')
    const kelsier = within(members).getByRole('region', { name: 'Kelsier' })
    expect(kelsier).toHaveTextContent('known on Roshar as Thaidakar')
    expect(within(members).queryByRole('region', { name: 'Thaidakar' })).toBe(
      null,
    )
  })

  it('shows a long list’s notable people until See all', async () => {
    localStorage.setItem(
      BOOKS_READ_KEY,
      JSON.stringify({ version: 2, read: ['way-of-kings'], reading: {} }),
    )
    render(
      <RouterProvider
        router={createMemoryRouter(routes, {
          initialEntries: ['/culture/bridge-four'],
        })}
      />,
    )
    const button = await screen.findByRole('button', { name: /^See all \d+/ })
    const section = button.closest('section')!
    const count = () => within(section).getAllByRole('region').length
    expect(count()).toBe(NOTABLE)
    expect(
      within(section).getByRole('region', { name: 'Teft' }),
    ).toBeInTheDocument()
    const all = Number(button.textContent!.match(/\d+/)![0])
    fireEvent.click(button)
    expect(count()).toBe(all)
    expect(button).toHaveTextContent('Show fewer')
  })
})

describe('culture in search', () => {
  const search = (chapter: string) =>
    createSearch(
      readerCanSee({
        read: new Set(),
        reading: new Map([['sunlit-man', chapter]]),
      }),
    )
  const keys = (chapter: string, q: string) =>
    search(chapter)
      .search(q)
      .groups.flatMap((g) => g.hits.map((h) => h.key))

  it('finds an entry only once the reader reaches it', () => {
    expect(keys(before, 'night brigade')).not.toContain('culture:night-brigade')
    expect(keys(firstIntro.chapter, 'night brigade')).toContain(
      'culture:night-brigade',
    )
  })
})
