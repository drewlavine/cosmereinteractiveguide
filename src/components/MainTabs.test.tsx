import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { mainTabs, underPath } from '../navigation'
import { routes } from '../routes'

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
      'Star Map',
      'Books',
      'Characters',
      'Locations',
      'Abilities',
      'Culture',
      'Events',
    ])
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/',
      '/books',
      '/characters',
      '/locations',
      '/abilities',
      '/culture',
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
    ['/abilities', 'Abilities'],
    ['/events', 'Events'],
  ])('marks the right tab active on %s', (path, tab) => {
    renderAt(path)
    expect(activeTab()).toEqual([tab])
  })

  it('marks no tab active on unknown pages', () => {
    renderAt('/nowhere')
    expect(activeTab()).toEqual([])
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

  it.each(['Events'])(
    'shows a coming-soon page for the %s tab',
    async (label) => {
      renderAt('/')
      await userEvent.click(
        within(mainNav()).getByRole('link', { name: label }),
      )
      expect(
        await screen.findByRole('heading', { level: 1, name: label }),
      ).toBeInTheDocument()
      expect(screen.getByText('Coming soon')).toBeInTheDocument()
      expect(activeTab()).toEqual([label])
    },
  )
})
