import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const NALTHIS = '/systems/nalthian/planets/nalthis'
const SCADRIAL = '/systems/scadrian/planets/scadrial'
const labels: Record<string, string> = {
  chronicle: 'Chronicle',
  scrubber: 'Time scrubber',
  codex: 'Codex',
  retold: 'As you read it',
}
const styles = Object.keys(labels)

const renderAt = (
  path: string,
  read: string[] = [],
  reading: Record<string, string> = {},
) => {
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({ version: 2, read, reading }),
  )
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />,
  )
}

const section = () => screen.findByRole('region', { name: 'History' })

describe('a planet’s History section', () => {
  it.each(styles)(
    'tells a reader at Warbreaker chapter 15 only that far (%s)',
    async (style) => {
      // The planet's page opens with Tress, so this reader has finished it.
      renderAt(`${NALTHIS}?history=${style}`, ['tress'], { warbreaker: '15' })
      const history = within(await section())
      for (const era of [
        'The Manywar',
        'Under the God Kings',
        'The God King’s bride',
        'Later years',
      ])
        expect(history.getAllByText(era).length).toBeGreaterThan(0)
      expect((await section()).textContent).not.toMatch(
        /Vasher|Phantom|Kuth|Vo\b|Scholars|Pahn Kahl|Bluefingers|Endowment/,
      )
      expect(
        history.getByRole('button', { name: labels[style], pressed: true }),
      ).toBeInTheDocument()
    },
  )

  it.each(styles)(
    'shows an Era 1 reader Scadrial’s history (%s)',
    async (style) => {
      renderAt(`${SCADRIAL}?history=${style}`, [
        'final-empire',
        'well-of-ascension',
        'hero-of-ages',
      ])
      const history = within(await section())
      expect(history.getAllByText('The Final Empire').length).toBeGreaterThan(0)
      expect((await section()).textContent).not.toMatch(/Elendel|Harmony/)
    },
  )

  it('stays away for a Stormlight reader, whose books never reach Nalthis', async () => {
    renderAt(NALTHIS, [
      'way-of-kings',
      'words-of-radiance',
      'oathbringer',
      'rhythm-of-war',
    ])
    expect(await screen.findByText('Not yet charted')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'History' })).toBeNull()
  })

  it('switches style and remembers the pick', async () => {
    renderAt(NALTHIS, ['warbreaker'])
    const history = within(await section())
    expect(
      history.getByRole('button', { name: 'Chronicle', pressed: true }),
    ).toBeInTheDocument()
    await userEvent.click(history.getByRole('button', { name: 'Codex' }))
    expect(
      history.getByRole('group', { name: 'Show moments of kind' }),
    ).toBeInTheDocument()
    expect(localStorage.getItem('cosmere-guide:history-style')).toBe('codex')
  })

  it('steps the scrubber through moments', async () => {
    renderAt(`${NALTHIS}?history=scrubber`, ['tress'], { warbreaker: '15' })
    const history = within(await section())
    const slider = history.getByRole('slider', { name: 'Moment in history' })
    expect(slider).toHaveAttribute(
      'aria-valuetext',
      'The Manywar: Kalad starts the Manywar',
    )
    await userEvent.click(history.getByRole('button', { name: 'Later ›' }))
    expect(slider).toHaveAttribute(
      'aria-valuetext',
      'The Manywar: Peacegiver the Blessed',
    )
    await userEvent.click(
      history.getByRole('button', { name: 'Under the God Kings' }),
    )
    expect(
      history.getByRole('heading', { name: 'The Court of Gods' }),
    ).toBeInTheDocument()
  })

  it('follows a cause in the codex, even past the kind filter', async () => {
    renderAt(`${NALTHIS}?history=codex`, ['warbreaker'])
    const history = within(await section())
    await userEvent.click(history.getByRole('button', { name: /^War/ }))
    // The stone army marched because the rebellion failed, a Realm card.
    await userEvent.click(
      history.getAllByRole('button', { name: 'The rebellion fails' })[0],
    )
    expect(
      history.getByRole('button', {
        name: 'The rebellion fails',
        expanded: true,
      }),
    ).toHaveFocus()
    expect(
      history.getByRole('button', { name: /^All/, pressed: true }),
    ).toBeInTheDocument()
  })

  it('replays what the reader knew at each point', async () => {
    renderAt(`${NALTHIS}?history=retold`, ['tress'], { warbreaker: '58' })
    const history = within(await section())
    const slider = history.getByRole('slider', {
      name: 'Point in your reading',
    })
    expect(slider).toHaveAttribute(
      'aria-valuetext',
      'Tress of the Emerald Sea, Chapter 15',
    )
    await userEvent.click(history.getByRole('button', { name: '‹ Earlier' }))
    expect(slider).toHaveAttribute('aria-valuetext', 'Warbreaker, Chapter 58')
    expect(
      history.getByRole('heading', { name: 'Lightsong’s gift' }),
    ).toBeInTheDocument()
    await userEvent.click(history.getByRole('button', { name: '‹ Earlier' }))
    expect(slider).toHaveAttribute('aria-valuetext', 'Warbreaker, Chapter 57')
    expect(
      history.queryByRole('heading', { name: 'Lightsong’s gift' }),
    ).toBeNull()
    expect(
      history.getByRole('heading', {
        name: 'The Pahn Kahl rebellion once “The God King’s bride”',
      }),
    ).toBeInTheDocument()
  })
})
