import {
  cleanup,
  fireEvent,
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

  it('shows only the topics the reader has reached', async () => {
    const culture = await renderAt('alethkar', ['way-of-kings'])
    const topics = within(culture)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent)
    // Dress has nothing to show until later.
    expect(topics).toContain('War')
    expect(topics).not.toContain('Dress')
    cleanup()

    const few = await renderAt('thaylenah', ['way-of-kings'])
    expect(within(few).getAllByRole('heading', { level: 3 })).toHaveLength(2)
  })

  it('shows only the notes the reader has reached', async () => {
    const war = async (read: string[]) => {
      await renderAt('alethkar', read)
      return screen.getByRole('region', { name: 'War' }).querySelectorAll('p')
        .length
    }
    expect(await war(['way-of-kings'])).toBe(4)
    cleanup()
    expect(await war(['way-of-kings', 'words-of-radiance'])).toBe(5)
    cleanup()
    expect(await war([...toOathbringer, 'oathbringer', 'rhythm-of-war'])).toBe(
      6,
    )
  })
})

describe('the plate layout', () => {
  const toOathbringer = ['way-of-kings', 'words-of-radiance', 'edgedancer']

  describe('a place page’s navigation and plate', { timeout: 20000 }, () => {
    const throughOathbringer = [
      'way-of-kings',
      'words-of-radiance',
      'edgedancer',
      'oathbringer',
    ]
    const links = (list: HTMLElement) =>
      within(list)
        .getAllByRole('link')
        .map((a) => a.textContent)
    const cultureParts = async (nav: HTMLElement) => {
      const toggle = within(nav).getByRole('button', {
        name: /^(Show|Hide) Culture topics$/,
      })
      if (toggle.getAttribute('aria-expanded') === 'false')
        await userEvent.click(toggle)
      return document.getElementById(toggle.getAttribute('aria-controls')!)!
    }

    it('lists in the phone sheet only the topics the reader can see', async () => {
      const user = userEvent.setup()
      // Alethkar's Music and art waits for Oathbringer.
      let culture = await renderAt('alethkar', ['way-of-kings'])
      await user.click(screen.getByRole('button', { name: /^Contents/ }))
      const sheet = screen.getByRole('dialog', { name: 'On this page' })
      const index = within(sheet).getByRole('navigation', {
        name: 'On this page',
      })
      const early = links(await cultureParts(index)).map((s) =>
        s?.replace(/\d+$/, ''),
      )
      expect(early).not.toContain('Music and art')
      expect(early).toEqual(
        within(culture)
          .getAllByRole('heading', { level: 3 })
          .map((h) => h.textContent),
      )
      expect(index).toHaveTextContent(`${early.length} topics`)
      cleanup()

      culture = await renderAt('alethkar', throughOathbringer)
      await user.click(screen.getByRole('button', { name: /^Contents/ }))
      const later = within(
        screen.getByRole('dialog', { name: 'On this page' }),
      ).getByRole('navigation', { name: 'On this page' })
      expect(links(await cultureParts(later)).join()).toContain('Music and art')
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
      const contents = () =>
        within(plate()).getByRole('navigation', { name: 'On this page' })

      it('follows the parts of a place without culture once its story loads', async () => {
        localStorage.setItem(
          BOOKS_READ_KEY,
          JSON.stringify({ version: 2, read: ['way-of-kings'], reading: {} }),
        )
        render(
          <RouterProvider
            router={createMemoryRouter(routes, {
              initialEntries: ['/locations/kholinar'],
            })}
          />,
        )
        await screen.findByRole('heading', { level: 1, name: 'Kholinar' })
        const history = await within(contents()).findByRole('link', {
          name: 'History',
        })
        const main = document.querySelector<HTMLElement>('.app-main')!
        const article = screen.getByRole('article', { name: 'Kholinar' })
        const rect = (top: number, height: number) =>
          ({ top, height, bottom: top + height }) as DOMRect
        Object.defineProperty(main, 'clientHeight', { value: 500 })
        Object.defineProperty(main, 'scrollHeight', { value: 2000 })
        main.getBoundingClientRect = () => rect(0, 500)
        article.getBoundingClientRect = () => rect(-main.scrollTop, 2000)
        article.querySelectorAll<HTMLElement>('[data-toc]').forEach((el) => {
          const position =
            el.id === 'history' ? 500 : el.id === 'about' ? 200 : 1600
          el.getBoundingClientRect = () => rect(position - main.scrollTop, 100)
        })
        main.scrollTop = 500
        fireEvent.scroll(main)
        await waitFor(() => expect(history).toHaveAttribute('aria-current'))
        await userEvent.click(history)
        expect(history).toHaveAttribute('aria-current', 'location')
      })

      it('shows a place’s own picture in the hero and plate only once revealed', async () => {
        const sketches = /Shallan's sketches of Urithiru/
        const at = async (read: string[]) => {
          localStorage.setItem(
            BOOKS_READ_KEY,
            JSON.stringify({ version: 2, read, reading: {} }),
          )
          render(
            <RouterProvider
              router={createMemoryRouter(routes, {
                initialEntries: ['/locations/urithiru'],
              })}
            />,
          )
          await screen.findByRole('heading', { level: 1, name: 'Urithiru' })
        }
        await at(['way-of-kings', 'words-of-radiance', 'oathbringer'])
        const src = within(plate())
          .getByRole('img', { name: sketches })
          .getAttribute('src')
        const withSrc = () =>
          [...document.querySelectorAll('img')].filter(
            (i) => i.getAttribute('src') === src,
          )
        // On the plate and as the hero backdrop.
        expect(withSrc()).toHaveLength(2)
        cleanup()

        await at(['way-of-kings', 'words-of-radiance'])
        expect(screen.queryByRole('img', { name: sketches })).toBeNull()
        expect(withSrc()).toHaveLength(0)
      })

      it('lists on the plate only the topics the reader can see', async () => {
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
        expect(links(await cultureParts(contents()))).toEqual(topics(culture))
        expect(links(await cultureParts(contents())).join()).not.toContain(
          'Music and art',
        )
        cleanup()

        culture = await renderAt('alethkar', throughOathbringer)
        expect(links(await cultureParts(contents()))).toEqual(topics(culture))
        expect(links(await cultureParts(contents())).join()).toContain(
          'Music and art',
        )
      })

      it('shows a topic’s picture on the plate only once it’s revealed', async () => {
        const user = userEvent.setup()
        const { alt } = art('thaylenah', 'dress')
        // The Thaylen dress picture is revealed at Oathbringer 12.
        await renderAt('thaylenah', toOathbringer, { oathbringer: '11' })
        await user.click(
          within(await cultureParts(contents())).getByRole('link', {
            name: /Dress/,
          }),
        )
        await waitFor(() =>
          expect(
            within(contents()).getByRole('link', { name: /Dress/ }),
          ).toHaveAttribute('aria-current', 'location'),
        )
        expect(screen.queryByRole('img', { name: alt })).toBeNull()
        cleanup()

        await renderAt('thaylenah', toOathbringer, { oathbringer: '12' })
        await user.click(
          within(await cultureParts(contents())).getByRole('link', {
            name: /Dress/,
          }),
        )
        expect(
          await within(plate()).findByRole('img', { name: alt }),
        ).toBeInTheDocument()
        // Shown once: on the plate, not again in the text.
        expect(screen.getAllByRole('img', { name: alt })).toHaveLength(1)
      })
    })
  })
})
