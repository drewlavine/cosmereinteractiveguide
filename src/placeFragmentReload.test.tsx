import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BOOKS_READ_KEY } from './state/booksRead'

const KHOLINAR = '/systems/rosharan/planets/roshar/locations/kholinar'
const ALETHKAR = '/systems/rosharan/planets/roshar/locations/alethkar'
const THROUGH_WOR = ['way-of-kings', 'words-of-radiance', 'edgedancer']
let router: ReturnType<typeof createBrowserRouter> | undefined
let release: (() => void) | undefined

/** Re-import the app as a new document while retaining native history state. */
async function startDocument(storyId: string) {
  const stories = await import('./data/locationStories')
  const cached = stories.cachedLocationStory
  const load = stories.loadLocationStory
  let blocked = true
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  vi.spyOn(stories, 'cachedLocationStory').mockImplementation((id) =>
    id === storyId && blocked ? undefined : cached(id),
  )
  vi.spyOn(stories, 'loadLocationStory').mockImplementation(async (id) => {
    if (id === storyId) {
      await gate
      blocked = false
    }
    return load(id)
  })
  const { routes } = await import('./routes')
  router = createBrowserRouter(routes)
  render(<RouterProvider router={router} />)
  await waitFor(() =>
    expect(document.querySelector('article[aria-busy="true"]')).toBeTruthy(),
  )
}

async function reloadDocument(storyId: string) {
  cleanup()
  router?.dispose()
  router = undefined
  await act(async () => release?.())
  release = undefined
  vi.restoreAllMocks()
  history.pushState = History.prototype.pushState
  history.replaceState = History.prototype.replaceState
  vi.resetModules()
  await startDocument(storyId)
}

async function navigation() {
  const plate = await screen.findByRole('complementary', { name: 'Plate' })
  return within(plate).findByRole('navigation', {
    name: 'On this page',
  })
}

beforeEach(() => {
  history.pushState = History.prototype.pushState
  history.replaceState = History.prototype.replaceState
  vi.resetModules()
  vi.stubGlobal('navigation', undefined)
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
  history.pushState = History.prototype.pushState
  history.replaceState = History.prototype.replaceState
  history.replaceState(null, '', '/')
})

describe('fragment reload during loading', { timeout: 20000 }, () => {
  it.each([
    [
      KHOLINAR,
      'kholinar',
      [...THROUGH_WOR, 'oathbringer'],
      'rhythm-of-war',
      '43',
      '#history-occupation',
      false,
    ],
    [
      KHOLINAR,
      'kholinar',
      [...THROUGH_WOR, 'oathbringer'],
      'rhythm-of-war',
      'i-4',
      '#history-occupation',
      true,
    ],
    [
      '/locations/kholinar',
      'kholinar',
      [...THROUGH_WOR, 'oathbringer'],
      'rhythm-of-war',
      '43',
      '#history-occupation',
      false,
    ],
    [
      '/locations/kholinar',
      'kholinar',
      [...THROUGH_WOR, 'oathbringer'],
      'rhythm-of-war',
      'i-4',
      '#history-occupation',
      true,
    ],
    [
      '/locations/akak',
      'akak',
      ['way-of-kings'],
      'oathbringer',
      '52',
      '#history-alethi-conquest',
      true,
    ],
  ] as const)(
    'restores only an allowed target after reloading %s',
    async (path, storyId, read, book, chapter, hash, visible) => {
      localStorage.setItem(
        BOOKS_READ_KEY,
        JSON.stringify({ version: 2, read, reading: { [book]: chapter } }),
      )
      const state: {
        idx: number
        key: string
        usr: { from: string }
        extra: { untouched: boolean }
        __cosmereGuidePendingFragment: string
        self?: unknown
      } = {
        idx: 0,
        key: 'reload',
        usr: { from: 'initial' },
        extra: { untouched: true },
        __cosmereGuidePendingFragment: 'a user field',
      }
      state.self = state
      history.replaceState(state, '', `${path}?comparison=on${hash}`)
      await startDocument(storyId)
      expect(location.hash).toBe('')
      expect(location.search).toBe('?comparison=on')
      expect(history.state.usr).toEqual(state.usr)
      expect(history.state.extra).toEqual(state.extra)
      expect(history.state.__cosmereGuidePendingFragment).toBe('a user field')
      expect(history.state.self).toBe(history.state)

      await reloadDocument(storyId)
      expect(location.hash).toBe('')
      expect(location.search).toBe('?comparison=on')
      expect(history.state.usr).toEqual(state.usr)
      expect(history.state.extra).toEqual(state.extra)
      expect(history.state.__cosmereGuidePendingFragment).toBe('a user field')
      expect(history.state.self).toBe(history.state)
      await act(async () => release?.())
      const nav = await navigation()
      await waitFor(() => expect(location.hash).toBe(visible ? hash : ''))
      if (!visible) expect(nav).not.toHaveTextContent('Occupation')
      expect(location.search).toBe('?comparison=on')
      expect(history.state.usr).toEqual(state.usr)
      expect(history.state.extra).toEqual(state.extra)
      expect(history.state.__cosmereGuidePendingFragment).toBe('a user field')
      expect(history.state.self).toBe(history.state)
    },
  )

  it.each([null, false, 'reader'] as const)(
    'retains a pending native entry with %j state through reload',
    async (state) => {
      localStorage.setItem(
        BOOKS_READ_KEY,
        JSON.stringify({
          version: 2,
          read: [...THROUGH_WOR, 'oathbringer'],
          reading: { 'rhythm-of-war': 'i-4' },
        }),
      )
      const path = `${KHOLINAR}?comparison=on`
      history.replaceState({ idx: 0 }, '', path)
      await startDocument('kholinar')
      history.pushState(state, '', `${path}#history-occupation`)
      expect(location.hash).toBe('')
      await reloadDocument('kholinar')
      expect(location.hash).toBe('')
      await act(async () => release?.())
      await navigation()
      await waitFor(() => expect(location.hash).toBe('#history-occupation'))
      // React Router assigns its index when it boots on an unkeyed entry.
      const expected: Record<string, unknown> = { idx: 0 }
      if (typeof state === 'string') Object.assign(expected, state)
      expect(history.state).toEqual(expected)
      expect(location.search).toBe('?comparison=on')
    },
  )

  it.each([
    ['112', false],
    ['113', true],
  ] as const)(
    'validates an era link after reload at chapter %s',
    async (chapter, visible) => {
      localStorage.setItem(
        BOOKS_READ_KEY,
        JSON.stringify({
          version: 2,
          read: THROUGH_WOR,
          reading: { oathbringer: '113' },
        }),
      )
      history.replaceState({ idx: 0, key: 'era' }, '', ALETHKAR)
      const { routes } = await import('./routes')
      router = createBrowserRouter(routes)
      render(<RouterProvider router={router} />)
      const nav = await navigation()
      const summary = within(nav).queryByText(
        'Browse all sections, topics and eras',
      )
      if (summary) fireEvent.click(summary)
      const toggle = within(nav).getByRole('button', {
        name: /^(Show|Hide) History eras$/,
      })
      if (toggle.getAttribute('aria-expanded') === 'false')
        fireEvent.click(toggle)
      const parts = document.getElementById(
        toggle.getAttribute('aria-controls')!,
      )!
      const hash = within(parts)
        .getByRole('link', { name: 'Long ago' })
        .getAttribute('href')!
      cleanup()
      router.dispose()
      router = undefined
      localStorage.setItem(
        BOOKS_READ_KEY,
        JSON.stringify({
          version: 2,
          read: THROUGH_WOR,
          reading: { oathbringer: chapter },
        }),
      )
      history.replaceState(
        { idx: 0, key: 'era', usr: { from: 'initial' } },
        '',
        `${ALETHKAR}?comparison=on${hash}`,
      )
      await startDocument('alethkar')
      expect(location.hash).toBe('')
      await reloadDocument('alethkar')
      expect(location.hash).toBe('')
      await act(async () => release?.())
      const reloaded = await navigation()
      await waitFor(() => expect(location.hash).toBe(visible ? hash : ''))
      if (visible) {
        const metro = within(
          screen.getByRole('region', { name: 'History' }),
        ).getByRole('group', { name: 'Jump to an era' })
        await waitFor(() =>
          expect(
            within(metro).getByRole('button', { name: 'Long ago' }),
          ).toHaveAttribute('aria-pressed', 'true'),
        )
      } else expect(reloaded).not.toHaveTextContent('Long ago')
      expect(location.search).toBe('?comparison=on')
      expect(history.state.usr).toEqual({ from: 'initial' })
    },
  )
})
