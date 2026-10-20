import { cleanup, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
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
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )
}

const list = () => screen.getByRole('article', { name: 'Culture' })
const names = () =>
  [...list().querySelectorAll('.character-group li')].map((li) =>
    li.textContent?.trim(),
  )
const headings = () =>
  within(list())
    .queryAllByRole('heading', { level: 2 })
    .map((h) => h.textContent)
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
})

describe('culture list', () => {
  it('shows nothing before any book is read', () => {
    renderAt('/culture')
    expect(names()).toEqual([])
    expect(headings()).toEqual([])
    expect(
      screen.getByText(/hidden based on books you've read/),
    ).toBeInTheDocument()
  })

  it('lists what the finished books reveal, and nothing from other series', () => {
    renderAt('/culture', ['final-empire'])
    expect(names()).toEqual(expect.arrayContaining(['Skaa', 'House Venture']))
    expect(names()).not.toContain('Vorinism')
    expect(names()).not.toContain('Lighteyes')
    expect(names()).toHaveLength(shownAfter(['final-empire']).length)
  })

  it('hides a name dated later by hand until that book is finished', () => {
    const entry = byPage('Church of the Survivor')
    expect(entry.revealedIn).toEqual(['well-of-ascension'])
    renderAt('/culture', ['final-empire'])
    expect(names()).not.toContain(entry.name)
    cleanup()
    renderAt('/culture', ['final-empire', 'well-of-ascension'])
    expect(names()).toContain(entry.name)
  })

  it('groups by type by default, with no heading for a type that is all hidden', () => {
    renderAt('/culture', ['final-empire'])
    const kinds = new Set(shownAfter(['final-empire']).map((c) => c.kind))
    expect(headings()).toEqual(
      Object.entries(cultureKindLabels)
        .filter(([kind]) => kinds.has(kind as never))
        .map(([, label]) => label),
    )
    expect(headings()).not.toContain(cultureKindLabels.currency)
    const classes = screen.getByRole('region', {
      name: cultureKindLabels.class,
    })
    expect(within(classes).getByText('Skaa')).toBeInTheDocument()
  })

  it('lists A–Z when Name is picked', () => {
    renderAt('/culture?group=name', ['final-empire'])
    expect(headings()).not.toContain(cultureKindLabels.class)
    expect(screen.getByRole('combobox')).toHaveValue('name')
    const shown = names()
    expect(shown).toEqual(
      [...shown].sort((a, b) =>
        (a ?? '').localeCompare(b ?? '', undefined, { sensitivity: 'base' }),
      ),
    )
  })

  it('groups by book, world and series using only finished books', () => {
    renderAt('/culture?group=book', ['final-empire', 'way-of-kings'])
    expect(headings()).toEqual([
      'Mistborn: The Final Empire',
      'The Way of Kings',
    ])
    cleanup()
    renderAt('/culture?group=world', ['final-empire'])
    expect(headings()).toEqual(['Scadrial'])
    cleanup()
    renderAt('/culture?group=series', ['way-of-kings'])
    expect(headings()).toEqual(['The Stormlight Archive'])
  })

  it('filters by name', () => {
    renderAt('/culture?q=venture', ['final-empire'])
    expect(names()).toEqual(['House Venture'])
    expect(screen.getByText(/^1 of \d+ entries/)).toBeInTheDocument()
  })

  it('shows every entry once every book is read', () => {
    renderAt(
      '/culture',
      books.map((b) => b.id),
    )
    expect(screen.queryByText(/hidden based on/)).toBeNull()
    expect(names()).toHaveLength(cultureList.length)
  })
})
