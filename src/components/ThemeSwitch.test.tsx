import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { loadStory } from '../data/characterStories'
import { routes } from '../routes'
import { BOOKS_READ_KEY } from '../state/booksRead'
import { SIDE_NAV_PINNED_KEY } from '../state/sideNav'
import { ThemeSwitch } from './ThemeSwitch'
import { applyTheme, loadTheme, THEME_KEY } from './theme'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  delete document.documentElement.dataset.theme
})

describe('Theme preference', () => {
  it.each([null, 'unknown', 'CLASSIC', 'illuminated'])(
    'boots Illuminated for preference %s and agrees with the header',
    (saved) => {
      if (saved !== null) localStorage.setItem(THEME_KEY, saved)
      applyTheme(loadTheme())
      expect(document.documentElement).toHaveAttribute(
        'data-theme',
        'illuminated',
      )
      render(<ThemeSwitch />)
      expect(
        screen.getByRole('button', {
          name: 'Theme: Illuminated. Switch to Classic',
        }),
      ).toBeInTheDocument()
    },
  )

  it('switches both ways and restores Classic before paint and after remount', async () => {
    render(<ThemeSwitch />)
    await userEvent.click(screen.getByRole('button', { name: /^Theme:/ }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'classic')
    expect(localStorage.getItem(THEME_KEY)).toBe('classic')
    cleanup()
    delete document.documentElement.dataset.theme
    applyTheme(loadTheme())
    expect(document.documentElement).toHaveAttribute('data-theme', 'classic')
    render(<ThemeSwitch />)
    expect(
      screen.getByRole('button', {
        name: 'Theme: Classic. Switch to Illuminated',
      }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /^Theme:/ }))
    expect(document.documentElement).toHaveAttribute(
      'data-theme',
      'illuminated',
    )
    expect(localStorage.getItem(THEME_KEY)).toBe('illuminated')
  })

  it('warns on denied reads and keeps the switch working when saving is blocked', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError')
    })
    applyTheme(loadTheme())
    render(<ThemeSwitch />)
    expect(
      screen.getByRole('button', {
        name: 'Theme: Illuminated. Switch to Classic',
      }),
    ).toBeInTheDocument()
    expect(warning).toHaveBeenCalledWith(
      'Theme preference unavailable; using Illuminated.',
    )
    fireEvent.click(screen.getByRole('button', { name: /^Theme:/ }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'classic')
    expect(
      screen.getByRole('button', {
        name: 'Theme: Classic. Switch to Illuminated',
      }),
    ).toBeInTheDocument()
    expect(warning).toHaveBeenCalledWith(
      'Theme preference could not be saved; using it for this visit.',
    )
  })
})

describe('Theme on the real app', () => {
  beforeAll(() => loadStory('kaladin'))

  it('keeps a per-visit Show anyway choice while switching', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/characters/kaladin'],
    })
    render(<RouterProvider router={router} />)
    expect(await screen.findByText(/Not met yet/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Show anyway' }))
    const facts = await screen.findByRole('complementary', {
      name: 'Key facts',
    })
    for (let i = 0; i < 2; i++) {
      await userEvent.click(screen.getByRole('button', { name: /^Theme:/ }))
      expect(screen.getByRole('complementary', { name: 'Key facts' })).toBe(
        facts,
      )
      expect(screen.queryByText(/Not met yet/)).not.toBeInTheDocument()
    }
  })

  it('keeps chapter-gated facts hidden, the same page, disclosure, pinned nav and reading progress', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    localStorage.setItem(
      BOOKS_READ_KEY,
      JSON.stringify({
        version: 2,
        read: [],
        reading: { 'way-of-kings': '1' },
      }),
    )
    const router = createMemoryRouter(routes, {
      initialEntries: ['/characters/kaladin?layout=original#top'],
    })
    render(<RouterProvider router={router} />)
    const facts = await screen.findByRole('complementary', {
      name: 'Key facts',
    })
    const article = screen.getByRole('article')
    expect(facts).not.toHaveTextContent(/Parent|Sibling|Windrunner|Hearthstone/)
    const source = within(facts).getByRole('button', {
      name: 'Source: Word of Brandon',
    })
    await userEvent.click(source)
    expect(source).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const menu = screen.getByRole('button', { name: 'Menu' })
    expect(menu).toHaveAttribute('aria-expanded', 'true')
    const progress = localStorage.getItem(BOOKS_READ_KEY)
    const location = router.state.location
    const nav = screen.getByRole('navigation', { name: 'Main' })
    const links = within(nav)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
    const main = document.querySelector('.app-main')!
    main.scrollTop = 240
    for (const theme of ['classic', 'illuminated']) {
      await userEvent.click(screen.getByRole('button', { name: /^Theme:/ }))
      expect(document.documentElement).toHaveAttribute('data-theme', theme)
      expect(screen.getByRole('article')).toBe(article)
      expect(router.state.location).toBe(location)
      expect(source).toHaveAttribute('aria-expanded', 'true')
      expect(menu).toHaveAttribute('aria-expanded', 'true')
      expect(localStorage.getItem(SIDE_NAV_PINNED_KEY)).toBe('true')
      expect(localStorage.getItem(BOOKS_READ_KEY)).toBe(progress)
      expect(main.scrollTop).toBe(240)
      expect(
        within(nav)
          .getAllByRole('link')
          .map((link) => link.getAttribute('href')),
      ).toEqual(links)
      expect(facts).not.toHaveTextContent(
        /Parent|Sibling|Windrunner|Hearthstone/,
      )
      expect(screen.getByText(/Some information hidden/)).toBeInTheDocument()
    }
  })
})
