import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const ALETHKAR = '/systems/rosharan/planets/roshar/locations/alethkar'

const renderAt = (path: string, reading: Record<string, string>) => {
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({
      version: 2,
      read: ['way-of-kings', 'words-of-radiance', 'edgedancer'],
      reading,
    }),
  )
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )
}

const history = async () =>
  (await screen.findByRole('heading', { name: 'History' })).closest('section')!

/** The names of the stops along the line. */
const stops = async () =>
  within(await history()).getByRole('slider').textContent

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('a nation’s timeline', () => {
  it('shows a moment from the chapter that tells it, not before', async () => {
    renderAt(ALETHKAR, { oathbringer: '113' })
    expect(await stops()).toContain('Humans take the land')
    cleanup()
    renderAt(ALETHKAR, { oathbringer: '112' })
    expect(await stops()).toContain('Reshi raiders')
    expect(await stops()).not.toContain('Humans take the land')
  })

  it('is told as a Metro line, without the style switcher', async () => {
    renderAt(ALETHKAR, { oathbringer: '113' })
    const section = await history()
    expect(within(section).getByRole('button', { name: '▶ Play' }))
    expect(
      within(section).queryByRole('group', { name: 'Try a history style' }),
    ).toBeNull()
  })

  it('links a moment’s place to that place’s own page', async () => {
    renderAt(ALETHKAR, { oathbringer: '113' })
    const slider = within(await history()).getByRole('slider')
    const user = userEvent.setup()
    slider.focus()
    for (let n = 0; n < 99; n++) {
      if (slider.getAttribute('aria-valuetext')?.includes('Reshi raiders'))
        break
      await user.keyboard('{ArrowRight}')
    }
    const places = within(await history()).getByRole('list', {
      name: 'Where it happened',
    })
    expect(
      within(places).getByRole('link', { name: 'Hearthstone' }),
    ).toHaveAttribute('href', '/locations/hearthstone')
  })
})
