import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AtlasMap } from '../../data/journey'
import type { ShownJourney } from '../../data/reveal'
import JourneyMap from './JourneyMap'

const map: AtlasMap = {
  id: 'world',
  title: 'Testland',
  image: { src: 'world.jpg', width: 1000, height: 500, alt: 'Map' },
  credit: { text: 'Map by someone', url: 'https://example.com/map' },
  revealedIn: [],
}

const journey: ShownJourney = {
  maps: [map],
  credits: [{ text: 'Data from a fan map', url: 'https://example.com/data' }],
  spoilers: false,
  stops: [
    {
      id: 's1',
      mapId: 'world',
      path: [[100, 100]],
      approximate: false,
      place: { name: 'Harbour' },
      where: { bookId: 'way-of-kings', chapter: '6' },
      summary: [],
    },
    {
      id: 's2',
      mapId: 'world',
      path: [
        [100, 100],
        [800, 400],
      ],
      approximate: true,
      where: { bookId: 'way-of-kings', chapter: '16' },
      summary: [{ text: 'Hand-written words' }],
    },
    {
      id: 's3',
      mapId: 'world',
      path: [[900, 50]],
      approximate: false,
      title: 'Siege of the Keep',
      art: {
        src: '/journey-art/s3.webp',
        alt: 'Banners over a burning keep.',
        credit: { text: 'An Artist', url: 'https://example.com/art' },
      },
      place: { name: 'Keep' },
      summary: [],
    },
  ],
}

const setup = () => {
  render(
    <RouterProvider
      router={createMemoryRouter(
        [
          {
            path: '/',
            element: <JourneyMap name="Hero" journey={journey} />,
          },
        ],
        { initialEntries: ['/'] },
      )}
    />,
  )
  const group = screen.getByRole('group', { name: 'Hero’s journey' })
  const slider = within(group).getByRole('slider', { name: 'Event' })
  const content = document.querySelector('.pan-zoom-content') as HTMLElement
  return { group, slider, content }
}

let reduced = false
beforeEach(() => {
  reduced = false
  // jsdom lays nothing out; give the map a size so it can fly.
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(500)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 400,
    bottom: 200,
    width: 400,
    height: 200,
    toJSON: () => ({}),
  })
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduced && query.includes('reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('JourneyMap', () => {
  it('steps through the stops with the buttons, slider and list', async () => {
    const { group, slider } = setup()
    const card = () => group.querySelector('.journey-card') as HTMLElement
    expect(slider).toHaveAttribute('aria-valuetext', 'Event 1 of 3: Harbour')
    expect(card()).toHaveTextContent('Harbour')
    expect(card()).toHaveTextContent('The Way of Kings, Chapter 6')
    expect(
      screen.getByRole('button', { name: 'Previous event' }),
    ).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Next event' }))
    // An unnamed place is only numbered; an approximate one says so.
    expect(slider).toHaveAttribute('aria-valuetext', 'Event 2 of 3: Event 2')
    expect(card()).toHaveTextContent('Approximate')
    expect(card()).toHaveTextContent('Hand-written words')

    fireEvent.change(slider, { target: { value: '2' } })
    // An event with a title is named by it, with its place beneath.
    expect(slider).toHaveAttribute(
      'aria-valuetext',
      'Event 3 of 3: Siege of the Keep',
    )
    expect(within(card()).getByRole('heading')).toHaveTextContent(
      'Siege of the Keep',
    )
    expect(card().querySelector('.journey-source')).toHaveTextContent('Keep')
    // Its art, with the artist credited.
    expect(
      within(card()).getByRole('img', { name: 'Banners over a burning keep.' }),
    ).toHaveAttribute('src', '/journey-art/s3.webp')
    expect(
      within(card()).getByRole('link', { name: 'An Artist' }),
    ).toHaveAttribute('href', 'https://example.com/art')
    // Clicking it shows the whole picture; closing leaves the card.
    await userEvent.click(
      within(card()).getByRole('button', { name: 'View the whole picture' }),
    )
    const viewer = screen.getByRole('dialog', { name: 'Picture' })
    expect(
      within(viewer).getByRole('img', { name: 'Banners over a burning keep.' }),
    ).toBeInTheDocument()
    expect(
      within(viewer).getByRole('link', { name: 'An Artist' }),
    ).toBeInTheDocument()
    await userEvent.click(
      within(viewer).getByRole('button', { name: 'Close picture' }),
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(card()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next event' })).toBeDisabled()

    const list = within(group).getByRole('list', { name: 'Events' })
    await userEvent.click(within(list).getByRole('button', { name: /Harbour/ }))
    expect(
      within(list).getByRole('button', { name: /Harbour/ }),
    ).toHaveAttribute('aria-current', 'step')
  })

  it('steps with the arrow keys, Home and End', () => {
    const { group, slider } = setup()
    expect(group).toHaveFocus()
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    expect(slider).toHaveValue('1')
    fireEvent.keyDown(group, { key: 'End' })
    expect(slider).toHaveValue('2')
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    expect(slider).toHaveValue('2')
    fireEvent.keyDown(group, { key: 'Home' })
    expect(slider).toHaveValue('0')
    fireEvent.keyDown(group, { key: 'ArrowLeft' })
    expect(slider).toHaveValue('0')
  })

  it('draws only the way so far, the latest leg brightest and guesses dashed', async () => {
    const { group } = setup()
    const svg = group.querySelector('.journey-layers')!
    expect(svg.querySelectorAll('path')).toHaveLength(0)
    expect(svg.querySelectorAll('.journey-dot')).toHaveLength(1)
    await userEvent.click(screen.getByRole('button', { name: 'Next event' }))
    const now = svg.querySelector('.journey-track-now')!
    expect(now).toHaveAttribute('d', 'M100 100 L100 100 L800 400')
    expect(now).toHaveAttribute('stroke-dasharray')
    await userEvent.click(screen.getByRole('button', { name: 'Next event' }))
    expect(svg.querySelectorAll('.journey-track-past')).toHaveLength(1)
    expect(svg.querySelector('.journey-track-now')).toHaveAttribute(
      'd',
      'M800 400 L900 50',
    )
    expect(svg.querySelectorAll('.journey-dot')).toHaveLength(3)
  })

  it('goes back to an event by clicking its point on the map', async () => {
    const { group, slider } = setup()
    const svg = group.querySelector('.journey-layers')!
    // The current event's point isn't a target: it's already shown.
    expect(svg.querySelectorAll('.journey-dot-hit')).toHaveLength(0)
    await userEvent.click(screen.getByRole('button', { name: 'Next event' }))
    await userEvent.click(screen.getByRole('button', { name: 'Next event' }))
    const hits = svg.querySelectorAll('.journey-dot-hit')
    expect(hits).toHaveLength(2)
    // Hovering names it straight away.
    await userEvent.hover(hits[0])
    expect(svg.querySelector('.journey-dot-tip')).toHaveTextContent(/\S/)
    await userEvent.click(hits[0])
    expect(slider).toHaveValue('0')
    expect(svg.querySelector('.journey-dot-tip')).toBeNull()
  })

  it('flies to each stop, or jumps for reduced motion', async () => {
    const { content } = setup()
    // It opens on the whole map and flies in to the first stop.
    expect(content).toHaveClass('is-flying')
    const first = content.style.transform
    await userEvent.click(screen.getByRole('button', { name: 'Next event' }))
    expect(content).toHaveClass('is-flying')
    expect(content.style.transform).not.toBe(first)

    reduced = true
    const before = content.style.transform
    await userEvent.click(screen.getByRole('button', { name: 'Next event' }))
    expect(content).not.toHaveClass('is-flying')
    expect(content.style.transform).not.toBe(before)
  })

  it('plays through to the end, then stops', () => {
    vi.useFakeTimers()
    const { slider } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Play journey' }))
    expect(
      screen.getByRole('button', { name: 'Pause journey' }),
    ).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(2600))
    expect(slider).toHaveValue('1')
    act(() => vi.advanceTimersByTime(2600))
    expect(slider).toHaveValue('2')
    expect(
      screen.getByRole('button', { name: 'Play journey' }),
    ).toBeInTheDocument()
  })

  it('goes full screen with the Fullscreen API, and Escape leaves', async () => {
    const request = vi.fn(function (this: HTMLElement) {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: this,
      })
      document.dispatchEvent(new Event('fullscreenchange'))
      return Promise.resolve()
    })
    const exit = vi.fn(() => {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: null,
      })
      document.dispatchEvent(new Event('fullscreenchange'))
      return Promise.resolve()
    })
    Object.defineProperty(document, 'fullscreenEnabled', {
      configurable: true,
      value: true,
    })
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exit,
    })
    HTMLElement.prototype.requestFullscreen = request
    try {
      const { group } = setup()
      const button = screen.getByRole('button', { name: 'Full screen' })
      await userEvent.click(button)
      expect(request).toHaveBeenCalled()
      expect(group).toHaveClass('is-fullscreen')
      expect(group).not.toHaveClass('is-overlay')
      expect(button).toHaveAttribute('aria-pressed', 'true')
      // The browser takes Escape for itself and leaves full screen.
      await act(() => exit())
      expect(group).not.toHaveClass('is-fullscreen')
      await userEvent.click(button)
      await userEvent.click(
        screen.getByRole('button', { name: 'Exit full screen' }),
      )
      expect(exit).toHaveBeenCalledTimes(2)
      expect(group).not.toHaveClass('is-fullscreen')
    } finally {
      Reflect.deleteProperty(HTMLElement.prototype, 'requestFullscreen')
      Reflect.deleteProperty(document, 'fullscreenEnabled')
      Reflect.deleteProperty(document, 'exitFullscreen')
      Reflect.deleteProperty(document, 'fullscreenElement')
    }
  })

  it('falls back to an overlay without the Fullscreen API', async () => {
    const { group } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Full screen' }))
    expect(group).toHaveClass('is-fullscreen', 'is-overlay')
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(group).not.toHaveClass('is-overlay')
    expect(document.body.style.overflow).toBe('')
  })

  it('zooms into a city map through its pin, and back out from it', () => {
    vi.useFakeTimers()
    const city: AtlasMap = {
      id: 'city',
      title: 'Citytown',
      image: { src: 'city.jpg', width: 800, height: 600, alt: 'City map' },
      credit: { text: 'City map' },
      revealedIn: [],
      parent: { mapId: 'world', at: [500, 250] },
    }
    const nested: ShownJourney = {
      ...journey,
      maps: [map, city],
      stops: [
        { ...journey.stops[0], mapId: 'city', path: [[10, 10]] },
        { ...journey.stops[0], id: 'w', mapId: 'world', path: [[100, 100]] },
      ],
    }
    render(
      <RouterProvider
        router={createMemoryRouter(
          [{ path: '/', element: <JourneyMap name="Hero" journey={nested} /> }],
          { initialEntries: ['/'] },
        )}
      />,
    )
    const heading = () => document.querySelector('.journey-heading')
    const dots = () =>
      [...document.querySelectorAll('.journey-dot')].map((d) => [
        d.getAttribute('cx'),
        d.getAttribute('cy'),
      ])
    // Opens on the world map, flying in to the city before swapping maps.
    expect(heading()).toHaveTextContent('Testland')
    // The city's stop isn't drawn on the world on the way in.
    expect(dots()).toEqual([])
    act(() => vi.advanceTimersByTime(1000))
    expect(heading()).toHaveTextContent('Citytown')
    expect(dots()).toEqual([['10', '10']])
    // Back on the world, the city's event sits on its pin, joined by a line.
    fireEvent.click(screen.getByRole('button', { name: 'Next event' }))
    // The city zooms out first, then the world takes over at its pin.
    expect(heading()).toHaveTextContent('Citytown')
    act(() => vi.advanceTimersByTime(1000))
    expect(heading()).toHaveTextContent('Testland')
    // The way on is drawn only once the world has zoomed out from the city.
    expect(dots()).toEqual([['500', '250']])
    expect(document.querySelector('.journey-track-now')).toBeNull()
    act(() => vi.advanceTimersByTime(1000))
    expect(dots()).toEqual([
      ['500', '250'],
      ['100', '100'],
    ])
    expect(document.querySelector('.journey-track-now')).toHaveAttribute(
      'd',
      'M500 250 L100 100',
    )
  })

  it('credits the data and the map', () => {
    const { group } = setup()
    expect(
      within(group).getByRole('link', { name: 'Data from a fan map' }),
    ).toHaveAttribute('href', 'https://example.com/data')
    expect(
      within(group).getByRole('link', { name: 'Map by someone' }),
    ).toHaveAttribute('href', 'https://example.com/map')
  })
})
