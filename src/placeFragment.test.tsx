import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as stories from './data/locationStories'
import { routes } from './routes'
import { BOOKS_READ_KEY } from './state/booksRead'

const KHOLINAR = '/systems/rosharan/planets/roshar/locations/kholinar'
const ALETHKAR = '/systems/rosharan/planets/roshar/locations/alethkar'
const THROUGH_WOR = ['way-of-kings', 'words-of-radiance', 'edgedancer']
let router: ReturnType<typeof createBrowserRouter> | undefined
let release: (() => void) | undefined
let entry = 0

function mount(
  path: string,
  read: string[] = [],
  reading: Record<string, string> = {},
) {
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

async function navigation() {
  const plate = await screen.findByRole('complementary', { name: 'Plate' })
  return within(plate).findByRole('navigation', { name: 'On this page' })
}

async function parts(nav: HTMLElement, section: string) {
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
  const { idx, key, usr } = history.state
  const laterState = structuredClone({ idx, key, usr })
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
  it('leaves other routes unchanged', () => {
    const state = { key: 'other', usr: { from: 'test' } }
    history.replaceState(state, '', '/books?comparison=on#section')
    expect(location.pathname + location.search + location.hash).toBe(
      '/books?comparison=on#section',
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
      history.replaceState(null, '', `${path}?comparison=on#history-occupation`)
      expect(location.hash).toBe('')
      mount(
        `${path}?comparison=on#history-occupation`,
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
      await navigation()
      await waitFor(() =>
        expect(location.hash).toBe(visible ? '#history-occupation' : ''),
      )
      expect(location.search).toBe('?comparison=on')
    },
  )

  it.each([
    ['43', false],
    ['i-4', true],
  ] as const)(
    'quarantines a prose link during loading at chapter %s',
    async (chapter, visible) => {
      delayStory('kholinar')
      const path = `${KHOLINAR}?comparison=on`
      const { router: current, state } = mount(
        `${path}#history-occupation`,
        [...THROUGH_WOR, 'oathbringer'],
        { 'rhythm-of-war': chapter },
      )
      expect(document.querySelector('article[aria-busy="true"]')).toBeTruthy()
      expect(location.hash).toBe('')
      expect(history.state).toMatchObject(state)
      expect(current.state.location.state).toEqual(state.usr)
      expect(location.search).toBe('?comparison=on')

      const laterState = await backToInitial(current, path, state.key)
      expect(history.state).toMatchObject(state)
      await act(async () => release?.())
      const nav = await navigation()
      if (visible) {
        await waitFor(() => expect(location.hash).toBe('#history-occupation'))
        await waitFor(() =>
          expect(
            screen.getByRole('heading', { name: 'Occupation' }),
          ).toBeVisible(),
        )
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

  it('keeps unkeyed native entries distinct without the Navigation API', async () => {
    vi.stubGlobal('navigation', undefined)
    delayStory('kholinar')
    const path = `${KHOLINAR}?comparison=on`
    mount(path, [...THROUGH_WOR, 'oathbringer'], {
      'rhythm-of-war': 'i-4',
    })
    history.pushState(null, '', `${path}#history-occupation`)
    expect(location.hash).toBe('')
    history.pushState(null, '', `${path}#about`)
    expect(location.hash).toBe('')

    await act(async () => {
      const popped = new Promise<void>((resolve) =>
        window.addEventListener('popstate', () => resolve(), { once: true }),
      )
      history.back()
      await popped
    })
    expect(location.hash).toBe('')
    await act(async () => release?.())
    const nav = await navigation()
    await waitFor(() => expect(location.hash).toBe('#history-occupation'))
    const historyParts = await parts(nav, 'History')
    await waitFor(() =>
      expect(
        within(historyParts).getByRole('link', { name: 'Occupation' }),
      ).toHaveAttribute('aria-current', 'location'),
    )
    expect(history.state).toBeNull()

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
    [
      KHOLINAR,
      'kholinar',
      [...THROUGH_WOR, 'oathbringer'],
      { 'rhythm-of-war': 'i-4' },
      '#history-occupation',
    ],
    [
      '/locations/akak',
      'akak',
      ['way-of-kings'],
      { oathbringer: '52' },
      '#history-alethi-conquest',
    ],
  ] as const)(
    'does not revive a replaced fragment-free entry on %s',
    async (route, storyId, read, reading, fragment) => {
      delayStory(storyId)
      const path = `${route}?comparison=on`
      const { state } = mount(`${path}${fragment}`, [...read], reading)
      expect(location.hash).toBe('')
      history.replaceState(history.state, '', path)
      expect(location.hash).toBe('')
      await act(async () => release?.())
      await navigation()
      expect(location.hash).toBe('')
      expect(location.search).toBe('?comparison=on')
      expect(history.state).toEqual(state)
    },
  )

  it.each([
    undefined,
    null,
    false,
    7,
    12n,
    'reader state',
    new Date('2024-01-01T00:00:00.000Z'),
    new Map([['reader', 'state']]),
    new Set(['reader', 'state']),
    new Uint8Array([1, 2, 3]),
    ['reader', 'state'],
    {
      idx: 4,
      key: 'reader-key',
      usr: { source: 'reader' },
      extra: { untouched: true },
      __cosmereGuidePendingFragment: 'a user field',
    },
  ])('restores user-owned native state %s after validation', async (state) => {
    delayStory('kholinar')
    const path = `${KHOLINAR}?comparison=on`
    mount(path, [...THROUGH_WOR, 'oathbringer'], {
      'rhythm-of-war': 'i-4',
    })
    const original = structuredClone(state)
    history.pushState(state, '', `${path}#history-occupation`)
    expect(location.hash).toBe('')
    if (Array.isArray(state)) expect([...history.state]).toEqual(state)
    else if (
      state &&
      typeof state === 'object' &&
      Object.getPrototypeOf(state) === Object.prototype
    )
      expect(history.state).toMatchObject(state)
    if (state instanceof Uint8Array)
      expect([...state]).toEqual([...(original as Uint8Array)])
    else expect(state).toEqual(original)
    await act(async () => release?.())
    await navigation()
    await waitFor(() => expect(location.hash).toBe('#history-occupation'))
    if (state instanceof Uint8Array) {
      expect(history.state.constructor.name).toBe('Uint8Array')
      expect([...history.state]).toEqual([...state])
    } else expect(history.state).toEqual(original)
    expect(location.search).toBe('?comparison=on')
  })

  it('preserves cyclic native state without mutating the caller', async () => {
    delayStory('kholinar')
    const path = `${KHOLINAR}?comparison=on`
    mount(path, [...THROUGH_WOR, 'oathbringer'], {
      'rhythm-of-war': 'i-4',
    })
    const state: { usr: string; self?: unknown } = { usr: 'reader' }
    state.self = state
    history.pushState(state, '', `${path}#history-occupation`)
    expect(state.self).toBe(state)
    expect(Object.keys(state)).toEqual(['usr', 'self'])
    expect(history.state.self).toBe(history.state)
    await act(async () => release?.())
    await navigation()
    await waitFor(() => expect(location.hash).toBe('#history-occupation'))
    expect(history.state.usr).toBe('reader')
    expect(history.state.self).toBe(history.state)
  })

  it.each([
    ['replaceState', undefined],
    ['replaceState', null],
    ['replaceState', ''],
    ['pushState', undefined],
    ['pushState', null],
    ['pushState', ''],
  ] as const)(
    'preserves a pending destination through %s with URL %j',
    async (operation, url) => {
      delayStory('kholinar')
      const path = `${KHOLINAR}?comparison=on`
      const { state } = mount(
        `${path}#history-occupation`,
        [...THROUGH_WOR, 'oathbringer'],
        { 'rhythm-of-war': 'i-4' },
      )
      history[operation](
        { ...history.state, usr: { from: 'updated' }, extra: 'updated' },
        '',
        url,
      )
      expect(location.hash).toBe('')
      await act(async () => release?.())
      await navigation()
      await waitFor(() => expect(location.hash).toBe('#history-occupation'))
      expect(history.state).toEqual({
        ...state,
        usr: { from: 'updated' },
        extra: 'updated',
      })
      expect(location.search).toBe('?comparison=on')
    },
  )

  it.each([
    ['43', false],
    ['i-4', true],
  ] as const)(
    'preserves and quarantines an aliased place link',
    async (chapter, visible) => {
      delayStory('kholinar')
      const { router: current, state } = mount(
        '/locations/kholinar?comparison=on#history-occupation',
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
      await navigation()
      await waitFor(() =>
        expect(location.hash).toBe(visible ? '#history-occupation' : ''),
      )
      expect(location.search).toBe('?comparison=on')
      expect(history.state.usr).toEqual(state.usr)
    },
  )

  it('does not copy alias state over a newer navigation', async () => {
    delayStory('kholinar')
    const { router: current } = mount(
      '/locations/kholinar?comparison=on#history-occupation',
      [...THROUGH_WOR, 'oathbringer'],
      { 'rhythm-of-war': 'i-4' },
    )
    await act(async () =>
      current.navigate(`${KHOLINAR}?comparison=on#about`, {
        replace: true,
        state: { from: 'newer' },
      }),
    )
    await waitFor(() => expect(location.pathname).toBe(KHOLINAR))
    expect(location.hash).toBe('')
    expect(history.state.usr).toEqual({ from: 'newer' })
    expect(history.state.extra).toBeUndefined()
    await act(async () => release?.())
    await navigation()
    await waitFor(() => expect(location.hash).toBe('#about'))
    expect(history.state.extra).toBeUndefined()
  })

  it.each([
    ['43', false],
    ['i-4', true],
  ] as const)(
    'quarantines a route push before the destination mounts',
    async (chapter, visible) => {
      delayStory('kholinar')
      const { router: current } = mount(
        '/locations',
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
        await navigation()
        await waitFor(() =>
          expect(location.hash).toBe(visible ? '#history-occupation' : ''),
        )
      } finally {
        unsubscribe()
      }
    },
  )

  it.each([
    ['43', false],
    ['i-4', true],
  ] as const)(
    'quarantines Back before a place route mounts',
    async (chapter, visible) => {
      delayStory('kholinar')
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
        expect(history.state).toMatchObject(target)
        await act(async () => release?.())
        await navigation()
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
    ['43', false],
    ['i-4', true],
  ] as const)(
    'retains a quarantined link across route unmount at chapter %s',
    async (chapter, visible) => {
      delayStory('kholinar')
      const path = `${KHOLINAR}?comparison=on`
      const { router: current, state } = mount(
        `${path}#history-occupation`,
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
      expect(history.state).toMatchObject(state)
      await act(async () => release?.())
      const nav = await navigation()
      if (visible) {
        await waitFor(() => expect(location.hash).toBe('#history-occupation'))
        await waitFor(() =>
          expect(
            screen.getByRole('heading', { name: 'Occupation' }),
          ).toBeVisible(),
        )
      } else {
        expect(location.hash).toBe('')
        expect(nav).not.toHaveTextContent('Occupation')
      }
      expect(history.state).toEqual(state)
      expect(location.search).toBe('?comparison=on')
    },
  )

  it.each([
    ['112', false],
    ['113', true],
  ] as const)(
    'quarantines an era link during loading at chapter %s',
    async (chapter, visible) => {
      mount(ALETHKAR, THROUGH_WOR, { oathbringer: '113' })
      const initialNav = await navigation()
      const href = within(await parts(initialNav, 'History'))
        .getByRole('link', { name: 'Long ago' })
        .getAttribute('href')!
      cleanup()
      router?.dispose()
      router = undefined

      delayStory('alethkar')
      const path = `${ALETHKAR}?comparison=on`
      const { router: current, state } = mount(`${path}${href}`, THROUGH_WOR, {
        oathbringer: chapter,
      })
      expect(document.querySelector('article[aria-busy="true"]')).toBeTruthy()
      expect(location.hash).toBe('')
      expect(history.state).toMatchObject(state)
      const laterState = await backToInitial(current, path, state.key)
      await act(async () => release?.())
      const nav = await navigation()
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
    [KHOLINAR, KHOLINAR, 'Not yet charted'],
    ['/locations/kholinar', KHOLINAR, 'Not yet charted'],
    ['/locations/akak', '/locations/akak', 'Not reached yet'],
  ] as const)(
    'clears hidden-place fragments on %s',
    async (path, destination, fallback) => {
      const user = userEvent.setup()
      const { router: current } = mount(
        `${path}?comparison=on#history-occupation`,
      )
      expect(
        await screen.findByRole('heading', { name: fallback }),
      ).toBeInTheDocument()
      expect(location.hash).toBe('')
      expect(location.pathname).toBe(destination)
      expect(location.search).toBe('?comparison=on')
      expect(history.state.usr).toEqual({ from: 'initial' })
      await user.click(screen.getByRole('button', { name: 'Show anyway' }))
      const nav = await navigation()
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
