import { cleanup, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { cultureList } from './data/culture'
import { entryRevealedIn } from './data/entryStories'
import { lifeformList } from './data/lifeforms'
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
  return lifeformList.filter((e) => canSee(entryRevealedIn('lifeform', e)))
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

  it('splits true and lesser spren and hides those from unread books', () => {
    renderAt('/lifeforms', ['way-of-kings'])
    expect(headings().slice(0, 3)).toEqual([
      'Spren',
      'True spren',
      'Lesser spren',
    ])
    expect(names()).toEqual(
      expect.arrayContaining(['Windspren', 'Honorspren', 'Chasmfiend']),
    )
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

  it('shows spren art dated by what it shows', async () => {
    const art = () =>
      document.querySelector('.character-portrait img')?.getAttribute('src')
    renderAt('/lifeforms/painspren', ['way-of-kings'])
    await screen.findByRole('heading', { level: 1, name: 'Painspren' })
    expect(art()).toBe('/entries/lifeform-painspren.webp')
    cleanup()
    renderAt('/lifeforms/painspren', ['way-of-kings', 'oathbringer'])
    await screen.findByRole('heading', { level: 1, name: 'Painspren' })
    expect(art()).toBe('/entries/lifeform-painspren-2.webp')
    cleanup()
    // Shows spren held in gems, which waits for Oathbringer's end
    renderAt('/lifeforms/flamespren', ['way-of-kings'])
    await screen.findByRole('heading', { level: 1, name: 'Flamespren' })
    expect(art()).toBeUndefined()
  })
})
