import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { mainTabs, underPath } from '../navigation'
import { routes } from '../routes'
import { SIDE_NAV_PINNED_KEY } from '../state/sideNav'

const renderAt = (path: string) =>
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )

const mainNav = () => screen.getByRole('navigation', { name: 'Main' })

const activeTab = () =>
  within(mainNav())
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')
    .map((link) => link.textContent)

describe('main tabs', () => {
  it('renders every tab as a link to its own URL', () => {
    renderAt('/')
    const links = within(mainNav()).getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual([
      'Catch Me Up',
      'Star Map',
      'Books',
      'Timeline',
      'Characters',
      'Magic',
      'Culture',
      'Locations',
      'Lifeforms',
      'Events',
    ])
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/catch-me-up',
      '/',
      '/books',
      '/timeline',
      '/characters',
      '/magic',
      '/culture',
      '/locations',
      '/lifeforms',
      '/events',
    ])
    expect(new Set(mainTabs.map((t) => t.id)).size).toBe(mainTabs.length)
  })

  it.each([
    ['/', 'Star Map'],
    ['/systems/rosharan', 'Star Map'],
    ['/systems/rosharan/planets/roshar', 'Star Map'],
    ['/characters', 'Characters'],
    ['/characters/kaladin', 'Characters'],
    ['/books', 'Books'],
    ['/locations', 'Locations'],
    ['/locations/kredik-shaw', 'Locations'],
    ['/systems/scadrian/planets/scadrial/locations/luthadel', 'Locations'],
    ['/magic', 'Magic'],
    ['/lifeforms', 'Lifeforms'],
    ['/lifeforms/honorspren', 'Lifeforms'],
    ['/events', 'Events'],
    ['/events/last-desolation', 'Events'],
    ['/catch-me-up', 'Catch Me Up'],
  ])('marks the right tab active on %s', (path, tab) => {
    renderAt(path)
    expect(activeTab()).toEqual([tab])
  })

  it('marks no tab active on unknown pages', () => {
    renderAt('/nowhere')
    expect(activeTab()).toEqual([])
  })

  it('groups the sections under headings', () => {
    renderAt('/')
    expect(
      ['Explore the Cosmere', 'People & powers', 'World', 'History'].map(
        (group) =>
          within(within(mainNav()).getByRole('list', { name: group }))
            .getAllByRole('link')
            .map((l) => l.textContent),
      ),
    ).toEqual([
      ['Catch Me Up', 'Star Map', 'Books', 'Timeline'],
      ['Characters', 'Magic', 'Culture'],
      ['Locations', 'Lifeforms'],
      ['Events'],
    ])
  })

  it('opens the phone drawer, holding focus in it until it closes', async () => {
    const user = userEvent.setup()
    renderAt('/')
    const menu = screen.getByRole('button', { name: 'Menu' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    await user.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'true')
    expect(mainNav()).toHaveClass('is-open')
    expect(
      within(mainNav()).getAllByRole('button', { name: 'Close menu' })[1],
    ).toHaveFocus()
    expect(document.querySelector('.app-main')).toHaveAttribute('inert')
    await user.keyboard('{Escape}')
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    expect(menu).toHaveFocus()
    await user.click(menu)
    await user.click(within(mainNav()).getByRole('link', { name: 'Books' }))
    expect(mainNav()).not.toHaveClass('is-open')
    expect(activeTab()).toEqual(['Books'])
  })

  it('pins the rail open on wider screens and remembers it', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    try {
      const user = userEvent.setup()
      const { unmount } = renderAt('/')
      await user.click(screen.getByRole('button', { name: 'Menu' }))
      expect(mainNav()).toHaveClass('is-pinned')
      expect(document.querySelector('.app-main')).not.toHaveAttribute('inert')
      unmount()
      renderAt('/')
      expect(mainNav()).toHaveClass('is-pinned')
      await user.click(screen.getByRole('button', { name: 'Menu' }))
      expect(mainNav()).not.toHaveClass('is-pinned')
      expect(localStorage.getItem(SIDE_NAV_PINNED_KEY)).toBeNull()
    } finally {
      vi.unstubAllGlobals()
      localStorage.clear()
    }
  })

  it('navigates to the characters list from the tab', async () => {
    renderAt('/')
    await userEvent.click(
      within(mainNav()).getByRole('link', { name: 'Characters' }),
    )
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Characters' }),
    ).toBeInTheDocument()
    expect(activeTab()).toEqual(['Characters'])
  })

  it('matches whole path segments only', () => {
    const isCharacters = underPath('/characters')
    expect(isCharacters('/characters')).toBe(true)
    expect(isCharacters('/characters/vin')).toBe(true)
    expect(isCharacters('/charactersheet')).toBe(false)
  })

  it('switches the Timeline tab between its two mockups', async () => {
    const user = userEvent.setup()
    renderAt('/timeline')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Timeline' }),
    ).toBeInTheDocument()
    expect(activeTab()).toEqual(['Timeline'])
    const pick = (name: RegExp) => screen.getByRole('button', { name })
    expect(pick(/Cards/)).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('At a glance')).toBeInTheDocument()

    await user.click(pick(/Spine/))
    expect(pick(/Spine/)).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByLabelText('At a glance')).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'The Shattering of Adonalsium' }),
    )
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'The Shattering of Adonalsium',
      }),
    ).toBeInTheDocument()
  })
})
