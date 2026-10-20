import { cleanup, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { chapters } from './data/chapters'
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
