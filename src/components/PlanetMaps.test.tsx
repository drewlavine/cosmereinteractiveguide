import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { books } from '../data/books'
import { planetMaps } from '../data/maps'
import { routes } from '../routes'
import { BOOKS_READ_KEY } from '../state/booksRead'

const renderPlanet = (path: string, read: string[]) => {
  localStorage.setItem(BOOKS_READ_KEY, JSON.stringify(read))
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )
}
const renderRoshar = (read: string[]) =>
  renderPlanet('/systems/rosharan/planets/roshar', read)

const strip = () => screen.getByRole('list', { name: 'Choose a map' })

describe('planet maps', () => {
  it('only references real books', () => {
    const ids = new Set(books.map((b) => b.id))
    for (const map of Object.values(planetMaps).flat())
      for (const v of map.versions)
        for (const id of [v.bookId, ...(v.alsoIn ?? [])])
          expect(ids).toContain(id)
  })

  it('shows no maps section before any revealing book is read', () => {
    renderRoshar([])
    expect(
      screen.queryByRole('heading', { name: 'Maps' }),
    ).not.toBeInTheDocument()
  })

  it('shows only maps from books the reader has read', () => {
    renderRoshar(['way-of-kings'])
    const titles = within(strip())
      .getAllByRole('button')
      .map((b) => b.querySelector('.map-thumb-title')?.textContent)
    expect(titles).toContain('Roshar')
    expect(titles).toContain('Battle of the Tower')
    expect(titles).not.toContain('Battle of Narak')
    expect(titles).not.toContain('Kholinar')
    expect(
      screen.queryByRole('group', { name: 'Roshar editions' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: /^Roshar:/ })).toHaveAttribute(
      'src',
      'https://uploads.coppermind.net/Roshar.jpg',
    )
  })

  it('defaults to the newest unlocked edition and switches maps', async () => {
    renderRoshar(['way-of-kings', 'words-of-radiance', 'oathbringer'])
    const editions = screen.getByRole('group', { name: 'Roshar editions' })
    expect(within(editions).getAllByRole('button')).toHaveLength(3)
    expect(
      within(editions).getByRole('button', { name: 'Oathbringer' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(editions).queryByRole('button', { name: 'Wind and Truth' }),
    ).not.toBeInTheDocument()

    await userEvent.click(
      within(editions).getByRole('button', { name: 'The Way of Kings' }),
    )
    expect(screen.getByRole('img', { name: /^Roshar:/ })).toHaveAttribute(
      'src',
      'https://uploads.coppermind.net/Roshar.jpg',
    )

    await userEvent.click(
      within(strip()).getByRole('button', { name: /^Kholinar/ }),
    )
    expect(screen.getByRole('img', { name: /^Kholinar:/ })).toBeInTheDocument()
    expect(
      within(strip()).getByRole('button', { name: /^Kholinar/ }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('maps other planets too, labelling same-book editions', () => {
    renderPlanet('/systems/scadrian/planets/scadrial', ['final-empire'])
    const titles = within(strip())
      .getAllByRole('button')
      .map((b) => b.querySelector('.map-thumb-title')?.textContent)
    expect(titles).toEqual(['The Final Empire', 'Luthadel'])

    const editions = screen.queryByRole('group', { name: 'Luthadel editions' })
    expect(editions).not.toBeInTheDocument()
  })

  it('names editions from the same book by their edition', async () => {
    renderPlanet('/systems/selish/planets/sel', ['elantris'])
    await userEvent.click(
      within(strip()).getByRole('button', { name: /^Arelon/ }),
    )
    const editions = screen.getByRole('group', { name: 'Arelon editions' })
    expect(
      within(editions)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Original', 'Tenth anniversary'])
  })
})
