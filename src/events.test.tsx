import { cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { eventList } from './data/events'
import { readerCanSee } from './data/reveal'
import { routes } from './routes'
import { createSearch } from './search/engine'
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

const list = () => screen.getByRole('article', { name: 'Events' })
const names = () =>
  [...list().querySelectorAll('.character-group li')].map((li) =>
    li.textContent?.trim(),
  )
const shownAfter = (read: string[]) => {
  const canSee = readerCanSee({ read: new Set(read), reading: new Map() })
  return eventList.filter((e) => canSee(e.revealedIn))
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('events list', () => {
  it('shows nothing before any book is read', () => {
    renderAt('/events')
    expect(names()).toEqual([])
  })

  it('lists what the finished books reveal, and no later battles', () => {
    renderAt('/events', ['way-of-kings'])
    expect(names()).toContain('Aharietiam')
    expect(names()).not.toContain('Battle of Thaylen Field')
    expect(names()).toHaveLength(shownAfter(['way-of-kings']).length)
    cleanup()
    renderAt('/events', ['way-of-kings', 'words-of-radiance', 'oathbringer'])
    expect(names()).toContain('Battle of Thaylen Field')
  })
})

describe('Aharietiam', () => {
  it('tells the Vorin story first and the Heralds’ lie only in Oathbringer', async () => {
    renderAt('/events/last-desolation', ['way-of-kings'])
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Aharietiam' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/said to have defeated/)).toBeInTheDocument()
    expect(screen.queryByText(/abandoned the Oathpact/)).toBeNull()
    expect(screen.queryByText('Day of Glory')).toBeNull()
    cleanup()
    renderAt('/events/last-desolation', [
      'way-of-kings',
      'words-of-radiance',
      'oathbringer',
    ])
    expect(
      (await screen.findAllByText(/abandoned the Oathpact/)).length,
    ).toBeGreaterThan(0)
    expect(screen.getByText('Day of Glory')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Characters' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { level: 2, name: 'People' }),
    ).toBeNull()
  })

  it('is found by its other names once they are revealed', () => {
    const reader = (...books: string[]) =>
      createSearch(readerCanSee({ read: new Set(books), reading: new Map() }))
    const keys = (books: string[], query: string) =>
      reader(...books)
        .search(query)
        .groups.flatMap((g) => g.hits)
        .map((h) => h.key)
    expect(keys(['way-of-kings'], 'aharietiam')).toContain(
      'event:last-desolation',
    )
    expect(keys(['way-of-kings'], 'day of glory')).toEqual([])
    expect(
      keys(
        ['way-of-kings', 'words-of-radiance', 'oathbringer'],
        'day of glory',
      ),
    ).toContain('event:last-desolation:Day of Glory')
  })
})
