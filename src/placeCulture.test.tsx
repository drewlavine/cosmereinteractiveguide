import { cleanup, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { loadLocationStory } from './data/locationStories'
import { placeCultureArt } from './data/placeCultureArt'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const ROSHAR = '/systems/rosharan/planets/roshar/locations'
const art = (place: string, topic: string) =>
  placeCultureArt[place].find((a) => a.topic === topic)!

/** A Roshar nation's page; resolves to its Culture section. */
const renderAt = (
  place: string,
  read: string[],
  reading: Record<string, string> = {},
) => {
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({ version: 2, read, reading }),
  )
  render(
    <RouterProvider
      router={createMemoryRouter(routes, {
        initialEntries: [`${ROSHAR}/${place}`],
      })}
    />,
  )
  return screen.findByRole('region', { name: 'Culture' }, { timeout: 10000 })
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('a place page’s Culture', { timeout: 20000 }, () => {
  const toOathbringer = ['way-of-kings', 'words-of-radiance', 'edgedancer']

  it('waits for a picture’s chapter, then shows it beside its topic', async () => {
    // The Thaylen dress picture is revealed at Oathbringer 12.
    const { alt } = art('thaylenah', 'dress')
    await renderAt('thaylenah', toOathbringer, { oathbringer: '11' })
    expect(screen.getByRole('region', { name: 'Dress' })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: alt })).toBeNull()
    expect(screen.getByText(/Some information hidden/)).toBeInTheDocument()
    cleanup()

    await renderAt('thaylenah', toOathbringer, { oathbringer: '12' })
    const dress = screen.getByRole('region', { name: 'Dress' })
    expect(within(dress).getByRole('img', { name: alt })).toBeInTheDocument()
  })

  it('leaves out a picture whose topic has nothing to show yet', async () => {
    // Azir's dress picture is reached (Words of Radiance i-9) before any
    // dress text.
    await renderAt('azir', ['way-of-kings'], { 'words-of-radiance': 'i-9' })
    expect(screen.queryByRole('region', { name: 'Dress' })).toBeNull()
    expect(
      screen.queryByRole('img', { name: art('azir', 'dress').alt }),
    ).toBeNull()
  })

  it('doesn’t repeat a Culture item under About', async () => {
    const story = (await loadLocationStory('alethkar'))!
    const mirrored = story.description.find((d) => d.fromCulture)!
    const culture = await renderAt('alethkar', ['way-of-kings'])
    expect(document.body.textContent?.split(mirrored.text)).toHaveLength(2)
    expect(
      within(culture).getByText(mirrored.text, { exact: false }),
    ).toBeInTheDocument()
  })
})
