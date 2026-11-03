import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('indexes only the topics the reader has reached', async () => {
    const culture = await renderAt('alethkar', ['way-of-kings'])
    const topics = within(culture)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent)
    const index = within(culture).getByRole('navigation', {
      name: 'Culture topics',
    })
    expect(
      within(index)
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual(topics)
    // Dress has nothing to show until later.
    expect(topics).not.toContain('Dress')
    expect(within(index).getByRole('link', { name: 'War' })).toHaveAttribute(
      'href',
      '#culture-war',
    )
    cleanup()

    // Thaylenah has only two topics by then: no index.
    const few = await renderAt('thaylenah', ['way-of-kings'])
    expect(within(few).getAllByRole('heading', { level: 3 })).toHaveLength(2)
    expect(within(few).queryByRole('navigation')).toBeNull()
  })

  it('counts only the notes the reader has reached in Show all', async () => {
    const war = async (read: string[]) => {
      await renderAt('alethkar', read)
      const region = screen.getByRole('region', { name: 'War' })
      return {
        notes: region.querySelectorAll('p').length,
        more: region.querySelector('summary'),
      }
    }
    // Four notes after The Way of Kings: short enough to show whole.
    expect((await war(['way-of-kings'])).more).toBeNull()
    cleanup()

    const later = await war(['way-of-kings', 'words-of-radiance'])
    expect(later.notes).toBe(5)
    expect(later.more).toHaveTextContent('Show all 5 notes on War')
    cleanup()

    const all = await war([...toOathbringer, 'oathbringer', 'rhythm-of-war'])
    expect(all.notes).toBe(6)
    expect(all.more).toHaveTextContent('Show all 6 notes on War')
  })
})

describe('design D', () => {
  // The design switch remembers the reader's pick.
  beforeEach(() => localStorage.setItem('placeLook', 'd'))
  const toOathbringer = ['way-of-kings', 'words-of-radiance', 'edgedancer']

  describe('a place page’s topic jumper and plate', { timeout: 20000 }, () => {
    const throughOathbringer = [
      'way-of-kings',
      'words-of-radiance',
      'edgedancer',
      'oathbringer',
    ]
    const links = (nav: HTMLElement) =>
      within(nav)
        .getAllByRole('link')
        .map((a) => a.textContent)

    it('lists in the jumper only the topics the reader can see', async () => {
      const user = userEvent.setup()
      // Alethkar's Music and art waits for Oathbringer.
      let culture = await renderAt('alethkar', ['way-of-kings'])
      const jumper = within(culture).getByRole('navigation', {
        name: 'Culture topics',
      })
      await user.click(within(jumper).getByRole('button'))
      const early = links(jumper)
      expect(early).not.toContain('Music and art')
      expect(early).toEqual(
        within(culture)
          .getAllByRole('heading', { level: 3 })
          .map((h) => h.textContent),
      )
      expect(jumper).toHaveTextContent(`${early.length} topics`)
      cleanup()

      culture = await renderAt('alethkar', throughOathbringer)
      const later = within(culture).getByRole('navigation', {
        name: 'Culture topics',
      })
      await user.click(within(later).getByRole('button'))
      expect(links(later)).toContain('Music and art')
    })

    describe('on a wide screen', () => {
      beforeEach(() => {
        vi.stubGlobal('matchMedia', (query: string) => ({
          matches: query === '(min-width: 1024px)',
          addEventListener: () => {},
          removeEventListener: () => {},
        }))
      })
      afterEach(() => vi.unstubAllGlobals())

      const plate = () => screen.getByRole('complementary', { name: 'Plate' })
      const compass = () =>
        within(plate()).getByRole('navigation', { name: 'Culture topics' })

      it('lists in the compass only the topics the reader can see', async () => {
        // Each chip is a topic title followed by its count of visible notes.
        const topics = (culture: HTMLElement) =>
          within(culture)
            .getAllByRole('region')
            .filter((r) => r.querySelector('h3'))
            .map(
              (r) =>
                `${r.querySelector('h3')!.textContent}${r.querySelectorAll('p').length}`,
            )
        let culture = await renderAt('alethkar', ['way-of-kings'])
        expect(links(compass())).toEqual(topics(culture))
        expect(links(compass()).join()).not.toContain('Music and art')
        cleanup()

        culture = await renderAt('alethkar', throughOathbringer)
        expect(links(compass())).toEqual(topics(culture))
        expect(links(compass()).join()).toContain('Music and art')
      })

      it('shows a topic’s picture on the plate only once it’s revealed', async () => {
        const user = userEvent.setup()
        const { alt } = art('thaylenah', 'dress')
        // The Thaylen dress picture is revealed at Oathbringer 12.
        await renderAt('thaylenah', toOathbringer, { oathbringer: '11' })
        await user.click(within(compass()).getByRole('link', { name: /Dress/ }))
        await waitFor(() =>
          expect(
            within(compass()).getByRole('link', { name: /Dress/ }),
          ).toHaveAttribute('aria-current', 'location'),
        )
        expect(screen.queryByRole('img', { name: alt })).toBeNull()
        cleanup()

        await renderAt('thaylenah', toOathbringer, { oathbringer: '12' })
        await user.click(within(compass()).getByRole('link', { name: /Dress/ }))
        expect(
          await within(plate()).findByRole('img', { name: alt }),
        ).toBeInTheDocument()
        // Shown once: on the plate, not again in the text.
        expect(screen.getAllByRole('img', { name: alt })).toHaveLength(1)
      })
    })
  })
})

describe('the design switch', { timeout: 20000 }, () => {
  it('swaps the place page design and remembers the pick', async () => {
    const user = userEvent.setup()
    await renderAt('alethkar', ['way-of-kings'])
    const switcher = screen.getByRole('group', { name: 'Page design' })
    expect(
      within(switcher).getByRole('button', { name: 'Design A' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await user.click(within(switcher).getByRole('button', { name: 'Design D' }))
    expect(localStorage.getItem('placeLook')).toBe('d')
    expect(
      await screen.findByRole('button', { name: /Culture topics|topics/ }),
    ).toBeInTheDocument()
  })
})
