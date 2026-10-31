import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
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
  chapters: 'Chapters',
  metro: 'Metro line',
  stars: 'Star chart',
  dial: 'Tuning dial',
}
const styles = Object.keys(labels)
// The Time scrubber and its alternative looks share one slider.
const scrubbers = styles.filter((style) => style !== 'chronicle')

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
    await userEvent.click(history.getByRole('button', { name: 'Metro line' }))
    expect(
      history.getByRole('slider', { name: 'Moment in history' }),
    ).toBeInTheDocument()
    expect(localStorage.getItem('cosmere-guide:history-style')).toBe('metro')
  })

  it('falls back to the Chronicle for a style that’s gone', async () => {
    localStorage.setItem('cosmere-guide:history-style', 'retold')
    renderAt(NALTHIS, ['warbreaker'])
    const kept = within(await section())
    expect(
      kept.getByRole('button', { name: 'Chronicle', pressed: true }),
    ).toBeInTheDocument()
    cleanup()
    renderAt(`${NALTHIS}?history=codex`, ['warbreaker'])
    const asked = within(await section())
    expect(
      asked.getByRole('button', { name: 'Chronicle', pressed: true }),
    ).toBeInTheDocument()
    expect(asked.queryByRole('slider')).toBeNull()
  })

  it.each(scrubbers)(
    'steps the scrubber through moments (%s)',
    async (style) => {
      renderAt(`${NALTHIS}?history=${style}`, ['tress'], { warbreaker: '15' })
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
    },
  )

  it.each(scrubbers)(
    'drags and keys the scrubber to the nearest moment (%s)',
    async (style) => {
      renderAt(`${NALTHIS}?history=${style}`, ['warbreaker'])
      const history = within(await section())
      const slider = history.getByRole('slider', { name: 'Moment in history' })
      const dots = slider.querySelectorAll('[data-dot]')
      dots.forEach((dot, n) => {
        dot.getBoundingClientRect = () =>
          ({ left: n * 10, width: 6 }) as DOMRect
      })
      slider.setPointerCapture = () => {}
      fireEvent.pointerDown(slider, { clientX: 32, pointerId: 1 })
      expect(slider).toHaveAttribute('aria-valuenow', '3')
      fireEvent.keyDown(slider, { key: 'End' })
      expect(slider).toHaveAttribute('aria-valuenow', String(dots.length - 1))
      fireEvent.keyDown(slider, { key: 'ArrowLeft' })
      expect(slider).toHaveAttribute('aria-valuenow', String(dots.length - 2))
    },
  )
})
