import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NavigationPanel } from './components/look-d/PageNavigation'
import type { PageNavigation } from './components/look-d/usePageNavigation'
import * as stories from './data/locationStories'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const KHOLINAR = '/systems/rosharan/planets/roshar/locations/kholinar'
const ALETHKAR = '/systems/rosharan/planets/roshar/locations/alethkar'
const THROUGH_WOR = ['way-of-kings', 'words-of-radiance', 'edgedancer']
type Mode = 'contents' | 'map'
let router: ReturnType<typeof createBrowserRouter> | undefined
let release: (() => void) | undefined
let entry = 0

function mount(
  path: string,
  mode: Mode,
  read: string[] = [],
  reading: Record<string, string> = {},
) {
  localStorage.setItem('placeLook', 'd')
  localStorage.setItem('placeNavigation', mode)
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({ version: 2, read, reading }),
  )
  const state = {
    idx: 0,
    key: `entry-${++entry}`,
    usr: { from: 'initial' },
    extra: 'preserve',
  }
  history.replaceState(state, '', path)
  router = createBrowserRouter(routes)
  render(<RouterProvider router={router} />)
  return { router, state }
}

/** Delay the real story request, without changing its content or reveal data. */
function delayStory(id: string) {
  const cached = stories.cachedLocationStory
  const load = stories.loadLocationStory
  let blocked = true
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  vi.spyOn(stories, 'cachedLocationStory').mockImplementation((storyId) =>
    storyId === id && blocked ? undefined : cached(storyId),
  )
  vi.spyOn(stories, 'loadLocationStory').mockImplementation(async (storyId) => {
    if (storyId === id) {
      await gate
      blocked = false
    }
    return load(storyId)
  })
}

async function navigation(mode: Mode) {
  const plate = await screen.findByRole('complementary', { name: 'Plate' })
  return within(plate).findByRole('navigation', {
    name: mode === 'contents' ? 'On this page' : 'Page map',
  })
}

async function parts(nav: HTMLElement, section: string) {
  const summary = within(nav).queryByText(
    'Browse all sections, topics and eras',
  )
  if (summary && !summary.closest('details')?.open)
    await userEvent.click(summary)
  const button = within(nav).getByRole('button', {
    name: new RegExp(`^(Show|Hide) ${section} (topics|eras|parts)$`),
  })
  if (button.getAttribute('aria-expanded') === 'false')
    await userEvent.click(button)
  return document.getElementById(button.getAttribute('aria-controls')!)!
}

async function backToInitial(
  current: ReturnType<typeof createBrowserRouter>,
  path: string,
  initialKey: string,
) {
  await act(async () =>
    current.navigate(`${path}#about`, { state: { from: 'about' } }),
  )
  const laterState = structuredClone(history.state)
  expect(location.hash).toBe('')
  await act(async () => history.back())
  await waitFor(() => expect(history.state.key).toBe(initialKey))
  expect(location.hash).toBe('')
  await act(async () => history.forward())
  await waitFor(() => expect(history.state.key).toBe(laterState.key))
  expect(location.hash).toBe('')
  await act(async () => history.back())
  await waitFor(() => expect(history.state.key).toBe(initialKey))
  expect(location.hash).toBe('')
  return laterState
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === '(min-width: 1024px)',
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
})

afterEach(() => {
  release?.()
  release = undefined
  cleanup()
  router?.dispose()
  router = undefined
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
  history.replaceState(null, '', '/')
})

describe('place fragment safety', { timeout: 20000 }, () => {
  it('leaves other routes and the original page design unchanged', () => {
    const state = { key: 'other', usr: { from: 'test' } }
    localStorage.setItem('placeLook', 'd')
    history.replaceState(state, '', '/books?comparison=on#section')
    expect(location.pathname + location.search + location.hash).toBe(
      '/books?comparison=on#section',
    )
    expect(history.state).toEqual(state)
    localStorage.setItem('placeLook', 'a')
    history.pushState(state, '', `${KHOLINAR}?comparison=on#history-example`)
    expect(location.pathname + location.search + location.hash).toBe(
      `${KHOLINAR}?comparison=on#history-example`,
    )
    expect(history.state).toEqual(state)
  })

  const equivalentRoutes = [
    '/SYSTEMS/rosharan/PLANETS/roshar/LOCATIONS/kholinar///',
    '/s%79stems/rosharan/planets/roshar/l%6fcations/kholinar',
    '/LOCATIONS/kholinar',
    '/l%6fcations/kholinar',
  ]
  it.each(
    equivalentRoutes.flatMap((path) =>
      (
        [
          ['43', false],
          ['i-4', true],
        ] as const
      ).map(([chapter, visible]) => [path, chapter, visible] as const),
    ),
  )(
    'quarantines route-equivalent place URL %s at chapter %s',
    async (path, chapter, visible) => {
      delayStory('kholinar')
      localStorage.setItem('placeLook', 'd')
      history.replaceState(null, '', `${path}?comparison=on#history-occupation`)
      expect(location.hash).toBe('')
      mount(
        `${path}?comparison=on#history-occupation`,
        'contents',
        [...THROUGH_WOR, 'oathbringer'],
        { 'rhythm-of-war': chapter },
      )
      expect(location.hash).toBe('')
      await waitFor(() =>
        expect(
          document.querySelector('article[aria-busy="true"]'),
        ).toBeTruthy(),
      )
      expect(location.hash).toBe('')
      await act(async () => release?.())
      await navigation('contents')
      await waitFor(() =>
        expect(location.hash).toBe(visible ? '#history-occupation' : ''),
      )
      expect(location.search).toBe('?comparison=on')
    },
  )

  it.each([
    ['contents', '43', false],
    ['contents', 'i-4', true],
    ['map', '43', false],
    ['map', 'i-4', true],
  ] as const)(
    '%s quarantines a prose link during loading at chapter %s',
    async (mode, chapter, visible) => {
      delayStory('kholinar')
      const path = `${KHOLINAR}?comparison=on`
      const { router: current, state } = mount(
        `${path}#history-occupation`,
        mode,
        [...THROUGH_WOR, 'oathbringer'],
        { 'rhythm-of-war': chapter },
      )
      expect(document.querySelector('article[aria-busy="true"]')).toBeTruthy()
      expect(location.hash).toBe('')
      expect(history.state).toEqual(state)
      expect(current.state.location.state).toEqual(state.usr)
      expect(location.search).toBe('?comparison=on')

      const laterState = await backToInitial(current, path, state.key)
      expect(history.state).toEqual(state)
      await act(async () => release?.())
      const nav = await navigation(mode)
      if (visible) {
        await waitFor(() => expect(location.hash).toBe('#history-occupation'))
        expect(
          screen.getByRole('heading', { name: 'Occupation' }),
        ).toBeVisible()
      } else {
        expect(location.hash).toBe('')
        expect(nav).not.toHaveTextContent('Occupation')
        expect(screen.queryByRole('heading', { name: 'Occupation' })).toBeNull()
      }
      expect(history.state).toEqual(state)
      expect(current.state.location.state).toEqual(state.usr)
      await act(async () => history.forward())
      await waitFor(() => expect(location.hash).toBe('#about'))
      expect(location.search).toBe('?comparison=on')
      expect(history.state).toEqual(laterState)
      expect(current.state.location.state).toEqual(laterState.usr)
    },
  )

  it('keeps native history entries with the same state distinct while loading', async () => {
    const navigationEntry = { key: 'initial' }
    vi.stubGlobal('navigation', { currentEntry: navigationEntry })
    delayStory('kholinar')
    const path = `${KHOLINAR}?comparison=on`
    mount(path, 'contents', [...THROUGH_WOR, 'oathbringer'], {
      'rhythm-of-war': 'i-4',
    })
    navigationEntry.key = 'first'
    history.pushState(null, '', `${path}#history-occupation`)
    expect(location.hash).toBe('')
    navigationEntry.key = 'second'
    history.pushState(null, '', `${path}#about`)
    expect(location.hash).toBe('')

    navigationEntry.key = 'first'
    await act(async () => {
      const popped = new Promise<void>((resolve) =>
        window.addEventListener('popstate', () => resolve(), { once: true }),
      )
      history.back()
      await popped
    })
    expect(location.hash).toBe('')
    expect(history.state).toBeNull()
    await act(async () => release?.())
    const nav = await navigation('contents')
    await waitFor(() => expect(location.hash).toBe('#history-occupation'))
    const historyParts = await parts(nav, 'History')
    await waitFor(() =>
      expect(
        within(historyParts).getByRole('link', { name: 'Occupation' }),
      ).toHaveAttribute('aria-current', 'location'),
    )

    navigationEntry.key = 'second'
    await act(async () => {
      const popped = new Promise<void>((resolve) =>
        window.addEventListener('popstate', () => resolve(), { once: true }),
      )
      history.forward()
      await popped
    })
    await waitFor(() => expect(location.hash).toBe('#about'))
    await waitFor(() =>
      expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute(
        'aria-current',
        'location',
      ),
    )
    expect(history.state).toBeNull()
    expect(location.search).toBe('?comparison=on')
  })

  it.each([
    ['contents', '43', false],
    ['map', 'i-4', true],
  ] as const)(
    '%s preserves and quarantines an aliased place link',
    async (mode, chapter, visible) => {
      delayStory('kholinar')
      const { router: current, state } = mount(
        '/locations/kholinar?comparison=on#history-occupation',
        mode,
        [...THROUGH_WOR, 'oathbringer'],
        { 'rhythm-of-war': chapter },
      )
      expect(location.hash).toBe('')
      await waitFor(() => expect(location.pathname).toBe(KHOLINAR))
      await waitFor(() =>
        expect(
          document.querySelector('article[aria-busy="true"]'),
        ).toBeTruthy(),
      )
      expect(location.hash).toBe('')
      expect(location.search).toBe('?comparison=on')
      expect(history.state.usr).toEqual(state.usr)
      expect(current.state.location.state).toEqual(state.usr)
      await act(async () => release?.())
      await navigation(mode)
      await waitFor(() =>
        expect(location.hash).toBe(visible ? '#history-occupation' : ''),
      )
      expect(location.search).toBe('?comparison=on')
      expect(history.state.usr).toEqual(state.usr)
    },
  )

  it.each([
    ['contents', '43', false],
    ['map', 'i-4', true],
  ] as const)(
    '%s quarantines a route push before the destination mounts',
    async (mode, chapter, visible) => {
      delayStory('kholinar')
      const { router: current } = mount(
        '/locations',
        mode,
        [...THROUGH_WOR, 'oathbringer'],
        { 'rhythm-of-war': chapter },
      )
      await screen.findByRole('heading', { name: 'Locations' })
      const observed: string[] = []
      const unsubscribe = current.subscribe(() => {
        if (location.pathname === KHOLINAR) observed.push(location.hash)
      })
      try {
        await act(async () =>
          current.navigate(`${KHOLINAR}?comparison=on#history-occupation`, {
            state: { from: 'outside' },
          }),
        )
        expect(observed.length).toBeGreaterThan(0)
        expect(observed).not.toContain('#history-occupation')
        await waitFor(() =>
          expect(
            document.querySelector('article[aria-busy="true"]'),
          ).toBeTruthy(),
        )
        expect(location.hash).toBe('')
        expect(history.state.usr).toEqual({ from: 'outside' })
        await act(async () => release?.())
        await navigation(mode)
        await waitFor(() =>
          expect(location.hash).toBe(visible ? '#history-occupation' : ''),
        )
      } finally {
        unsubscribe()
      }
    },
  )

  it.each([
    ['contents', '43', false],
    ['map', 'i-4', true],
  ] as const)(
    '%s quarantines Back before a place route mounts',
    async (mode, chapter, visible) => {
      delayStory('kholinar')
      localStorage.setItem('placeLook', 'd')
      localStorage.setItem('placeNavigation', mode)
      localStorage.setItem(
        BOOKS_READ_KEY,
        JSON.stringify({
          version: 2,
          read: [...THROUGH_WOR, 'oathbringer'],
          reading: { 'rhythm-of-war': chapter },
        }),
      )
      const target = { idx: 0, key: `entry-${++entry}`, usr: { from: 'back' } }
      history.replaceState(target, '', `${KHOLINAR}?comparison=on`)
      location.hash = 'history-occupation'
      history.replaceState(target, '', location.href)
      history.pushState({ idx: 1, key: `entry-${++entry}` }, '', '/locations')
      router = createBrowserRouter(routes)
      render(<RouterProvider router={router} />)
      await screen.findByRole('heading', { name: 'Locations' })
      const observed: string[] = []
      const onPop = () => observed.push(location.hash)
      window.addEventListener('popstate', onPop)
      try {
        await act(async () => history.back())
        await waitFor(() => expect(observed.length).toBeGreaterThan(0))
        expect(observed).not.toContain('#history-occupation')
        await waitFor(() =>
          expect(
            document.querySelector('article[aria-busy="true"]'),
          ).toBeTruthy(),
        )
        expect(location.hash).toBe('')
        expect(history.state).toEqual(target)
        await act(async () => release?.())
        await navigation(mode)
        await waitFor(() =>
          expect(location.hash).toBe(visible ? '#history-occupation' : ''),
        )
        expect(history.state).toEqual(target)
        expect(location.search).toBe('?comparison=on')
      } finally {
        window.removeEventListener('popstate', onPop)
      }
    },
  )

  it.each([
    ['contents', '43', false],
    ['contents', 'i-4', true],
    ['map', '43', false],
    ['map', 'i-4', true],
  ] as const)(
    '%s retains a quarantined link across route unmount at chapter %s',
    async (mode, chapter, visible) => {
      delayStory('kholinar')
      const path = `${KHOLINAR}?comparison=on`
      const { router: current, state } = mount(
        `${path}#history-occupation`,
        mode,
        [...THROUGH_WOR, 'oathbringer'],
        { 'rhythm-of-war': chapter },
      )
      expect(location.hash).toBe('')
      await act(async () => current.navigate('/locations'))
      await screen.findByRole('heading', { name: 'Locations' })
      await act(async () => history.back())
      await waitFor(() => expect(history.state.key).toBe(state.key))
      await waitFor(() =>
        expect(
          document.querySelector('article[aria-busy="true"]'),
        ).toBeTruthy(),
      )
      expect(location.hash).toBe('')
      expect(history.state).toEqual(state)
      await act(async () => release?.())
      const nav = await navigation(mode)
      if (visible) {
        await waitFor(() => expect(location.hash).toBe('#history-occupation'))
        expect(
          screen.getByRole('heading', { name: 'Occupation' }),
        ).toBeVisible()
      } else {
        expect(location.hash).toBe('')
        expect(nav).not.toHaveTextContent('Occupation')
      }
      expect(history.state).toEqual(state)
      expect(location.search).toBe('?comparison=on')
    },
  )

  it.each([
    ['contents', '112', false],
    ['contents', '113', true],
    ['map', '112', false],
    ['map', '113', true],
  ] as const)(
    '%s quarantines an era link during loading at chapter %s',
    async (mode, chapter, visible) => {
      mount(ALETHKAR, mode, THROUGH_WOR, { oathbringer: '113' })
      const initialNav = await navigation(mode)
      const href = within(await parts(initialNav, 'History'))
        .getByRole('link', { name: 'Long ago' })
        .getAttribute('href')!
      cleanup()
      router?.dispose()
      router = undefined

      delayStory('alethkar')
      const path = `${ALETHKAR}?comparison=on`
      const { router: current, state } = mount(
        `${path}${href}`,
        mode,
        THROUGH_WOR,
        { oathbringer: chapter },
      )
      expect(document.querySelector('article[aria-busy="true"]')).toBeTruthy()
      expect(location.hash).toBe('')
      expect(history.state).toEqual(state)
      const laterState = await backToInitial(current, path, state.key)
      await act(async () => release?.())
      const nav = await navigation(mode)
      if (visible) {
        await waitFor(() => expect(location.hash).toBe(href))
        const metro = within(
          screen.getByRole('region', { name: 'History' }),
        ).getByRole('group', { name: 'Jump to an era' })
        await waitFor(() =>
          expect(
            within(metro).getByRole('button', { name: 'Long ago' }),
          ).toHaveAttribute('aria-pressed', 'true'),
        )
      } else {
        expect(location.hash).toBe('')
        expect(nav).not.toHaveTextContent('Long ago')
      }
      expect(history.state).toEqual(state)
      expect(current.state.location.state).toEqual(state.usr)
      await act(async () => history.forward())
      await waitFor(() => expect(location.hash).toBe('#about'))
      expect(history.state).toEqual(laterState)
      expect(location.search).toBe('?comparison=on')
    },
  )

  it.each([
    ['contents', KHOLINAR, KHOLINAR, 'Not yet charted'],
    ['map', KHOLINAR, KHOLINAR, 'Not yet charted'],
    ['contents', '/locations/kholinar', KHOLINAR, 'Not yet charted'],
    ['map', '/locations/kholinar', KHOLINAR, 'Not yet charted'],
    ['contents', '/locations/akak', '/locations/akak', 'Not reached yet'],
    ['map', '/locations/akak', '/locations/akak', 'Not reached yet'],
  ] as const)(
    '%s clears hidden-place fragments on %s',
    async (mode, path, destination, fallback) => {
      const user = userEvent.setup()
      const { router: current } = mount(
        `${path}?comparison=on#history-occupation`,
        mode,
      )
      expect(
        await screen.findByRole('heading', { name: fallback }),
      ).toBeInTheDocument()
      expect(location.hash).toBe('')
      expect(location.pathname).toBe(destination)
      expect(location.search).toBe('?comparison=on')
      expect(history.state.usr).toEqual({ from: 'initial' })
      await user.click(screen.getByRole('button', { name: 'Show anyway' }))
      const nav = await navigation(mode)
      const topics = await parts(nav, 'History')
      await user.click(within(topics).getAllByRole('link').at(-1)!)
      expect(location.hash).toMatch(/^#history-/)
      const topicState = structuredClone(history.state)
      await user.click(within(nav).getByRole('link', { name: 'About' }))
      const aboutState = structuredClone(history.state)
      await user.click(screen.getByRole('button', { name: 'Hide again' }))
      expect(
        screen.getByRole('heading', { name: fallback }),
      ).toBeInTheDocument()
      expect(location.hash).toBe('')
      expect(location.pathname).toBe(destination)
      expect(location.search).toBe('?comparison=on')
      expect(history.state).toEqual(aboutState)
      expect(current.state.location.state).toEqual(aboutState.usr)
      await act(async () => history.back())
      await waitFor(() => expect(history.state.key).toBe(topicState.key))
      expect(location.hash).toBe('')
      expect(history.state).toEqual(topicState)
      await act(async () => history.forward())
      await waitFor(() => expect(history.state.key).toBe(aboutState.key))
      expect(location.hash).toBe('')
      expect(history.state).toEqual(aboutState)
      expect(location.search).toBe('?comparison=on')
    },
  )
})

it('chooses a visible map label rather than a nearby suppressed marker', () => {
  vi.stubGlobal('PointerEvent', MouseEvent)
  const visible = { id: 'culture-first', title: 'First topic' }
  const suppressed = { id: 'culture-second', title: 'Second topic' }
  const section = {
    id: 'culture',
    title: 'Culture',
    parts: [visible, suppressed],
  }
  const jump = vi.fn()
  const nav: PageNavigation = {
    sections: [section],
    current: { section: 'culture', part: visible.id, era: 0 },
    geometry: {
      segments: [{ id: 'culture', start: 0, size: 1 }],
      markers: [
        { section: 'culture', start: 0 },
        { section: 'culture', part: visible.id, start: 0.5 },
        { section: 'culture', part: suppressed.id, start: 0.51 },
      ],
      viewStart: 0.2,
      viewSize: 0.2,
      progress: 0.25,
    },
    jump,
    seek: vi.fn(),
    onEraChange: vi.fn(),
  }
  render(<NavigationPanel nav={nav} mode="map" onMode={vi.fn()} />)
  const slider = screen.getByRole('slider', { name: 'Page position' })
  slider.getBoundingClientRect = () =>
    ({ top: 100, height: 400, bottom: 500 }) as DOMRect
  const label = within(slider).getByText('First topic')
  expect(within(slider).queryByText('Second topic')).toBeNull()
  fireEvent.pointerDown(label, { clientY: 305, pointerId: 1, buttons: 1 })
  fireEvent.pointerUp(slider, { clientY: 305, pointerId: 1 })
  expect(jump).toHaveBeenCalledWith(section, visible)

  jump.mockClear()
  fireEvent.pointerDown(label, { clientY: 305, pointerId: 1, buttons: 1 })
  fireEvent.pointerMove(slider, { clientY: 340, pointerId: 1, buttons: 1 })
  fireEvent.pointerUp(slider, { clientY: 340, pointerId: 1 })
  expect(nav.seek).toHaveBeenCalled()
  expect(jump).not.toHaveBeenCalled()
  fireEvent.keyDown(slider, { key: 'End' })
  expect(nav.seek).toHaveBeenLastCalledWith(1)
})
