import {
  act,
  cleanup,
  fireEvent,
  getByText,
  render,
} from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routes } from '../../routes'
import { BOOKS_READ_KEY } from '../../state/booksRead'
import type { ExplorerCanvasProps } from '../explorer/ExplorerCanvas'

const webgl = vi.hoisted(() => ({ ok: true }))
vi.mock('../explorer/webgl', () => ({
  hasWebGL: () => webgl.ok,
  reducedMotion: () => true,
}))
// jsdom has no WebGL: a stand-in shows where the camera was sent.
vi.mock('../explorer/ExplorerCanvas', () => ({
  default: (p: ExplorerCanvasProps) => (
    <div
      data-testid="explorer"
      data-goal={JSON.stringify(p.goal)}
      data-worlds={p.worlds.map((w) => w.id).join()}
      data-pins={p.pins.map((x) => x.id).join()}
      data-effect={p.effect && JSON.stringify(p.effect)}
      data-placed={p.people?.flatMap((o) => (o.at ? [o.id] : [])).join()}
      data-people={p.people?.map((o) => `${o.id}@${o.world}`).join()}
    >
      {p.children}
      {p.shards?.map((s) => (
        <button
          key={s.id}
          type="button"
          data-shard={s.id}
          data-faded={s.faded || undefined}
          onClick={() => p.onShard?.(s.id)}
        >
          {s.name}
        </button>
      ))}
      <button type="button" onClick={p.onBackground}>
        click the map
      </button>
      <button type="button" onClick={() => p.onExplore(undefined)}>
        zoom out past the world
      </button>
      <button
        type="button"
        onClick={() => p.onView?.({ world: 'scadrial', level: 'world' })}
      >
        fly to Scadrial
      </button>
      <button
        type="button"
        onClick={() => p.onView?.({ world: 'scadrial', level: 'sky' })}
      >
        rise to the sky
      </button>
      {p.onReset && (
        <button type="button" aria-label="Reset the view" onClick={p.onReset} />
      )}
    </div>
  ),
}))

const renderAt = (
  path: string,
  read: string[] = [],
  reading: Record<string, string | null> = {},
) => {
  localStorage.setItem(
    BOOKS_READ_KEY,
    JSON.stringify({ version: 2, read, reading }),
  )
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return { ...render(<RouterProvider router={router} />), router }
}

const BEFORE_WAT = [
  'elantris',
  'final-empire',
  'well-of-ascension',
  'hero-of-ages',
  'secret-history',
  'warbreaker',
  'way-of-kings',
  'words-of-radiance',
  'oathbringer',
  'rhythm-of-war',
  'shadows-for-silence',
  'white-sand-omnibus',
  'arcanum-unbounded',
  'sunlit-man',
]

const markers = (c: HTMLElement) =>
  [...c.querySelectorAll('ol[aria-label="Events, earliest first"] button')].map(
    (b) => b.getAttribute('aria-label'),
  )
const cardTitle = (c: HTMLElement) => c.querySelector('section h2')?.textContent
const indicator = (c: HTMLElement) =>
  c.querySelector('p[aria-live]')?.textContent
const worldsToggle = (c: HTMLElement) =>
  c.querySelector('nav[aria-label="Worlds"] button[aria-expanded]')!
const openWorlds = (c: HTMLElement) => {
  if (worldsToggle(c).getAttribute('aria-expanded') === 'false')
    click(worldsToggle(c))
}
const worldButtons = (c: HTMLElement) => {
  openWorlds(c)
  return [
    ...c.querySelectorAll(
      'nav[aria-label="Worlds"] button:not([aria-expanded])',
    ),
  ].map((b) => b.textContent)
}
const goal = async (find: (id: string) => Promise<HTMLElement>) =>
  JSON.parse((await find('explorer')).dataset.goal!)
const effect = async (find: (id: string) => Promise<HTMLElement>) => {
  const e = (await find('explorer')).dataset.effect
  return e && JSON.parse(e)
}
const press = (el: Element, key: string) =>
  act(() => {
    fireEvent.keyDown(el, { key })
  })
const click = (el: Element | null) =>
  act(() => {
    fireEvent.click(el!)
  })

afterEach(() => {
  cleanup()
  localStorage.clear()
  webgl.ok = true
})

describe('Cosmere Timeline page', () => {
  it('shows no event before the reader starts a book', async () => {
    const { container, findByText } = renderAt('/timeline')
    expect(await findByText(/Nothing on the timeline yet/)).toBeInTheDocument()
    expect(markers(container)).toEqual([])
  })

  it('shows only the prelude, undated, at the start of The Way of Kings', async () => {
    const { container, findByRole, findByTestId } = renderAt('/timeline', [], {
      'way-of-kings': 'prelude',
    })
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    expect(markers(container)).toEqual([
      'The Heralds abandon the Oathpact, on Roshar',
    ])
    expect(cardTitle(container)).toBe('The Heralds abandon the Oathpact')
    expect(indicator(container)).toBe('UndatedRoshar')
    expect(worldButtons(container)).toEqual(['✦ The Cosmere', 'Roshar'])
    expect(await goal(findByTestId)).toEqual({
      world: 'roshar',
      view: 'map',
      key: 'event:oathpact-abandoned',
    })
    expect(stage.textContent).not.toMatch(/Gavilar|Shattering|Elantris|Sel/)
  })

  it("steps through Drew's timeline, flying to each event's world", async () => {
    const { container, findByRole, findByTestId } = renderAt(
      '/timeline',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    expect(cardTitle(container)).toBe('Adonalsium creates Roshar')
    // One count for every world, once the reader knows of the Shattering.
    expect(indicator(container)).toBe('ca. 1050before the ShatteringRoshar')
    // The card keeps to one line; the rest is under More.
    expect(container.querySelector('section')?.textContent).not.toMatch(
      /Word of Brandon/,
    )
    click(container.querySelector('section button[aria-expanded]'))
    expect(container.querySelector('aside')?.textContent).toMatch(
      /Word of Brandon/,
    )
    // The world's own date, too.
    expect(container.querySelector('aside')?.textContent).toMatch(
      /ca\. \u22129742 · Rosharan year/,
    )
    press(stage, 'Escape')
    expect(container.querySelector('aside')).toBeNull()

    press(stage, 'ArrowRight')
    expect(cardTitle(container)).toBe('The Shattering of Adonalsium')
    expect(await goal(findByTestId)).toEqual({ key: 'event:shattering' })
    // The burst plays out in open space, pointing at no world.
    expect(await effect(findByTestId)).toEqual({
      kind: 'shattering',
      key: 'effect:shattering',
    })
    press(stage, 'ArrowRight')
    expect(await effect(findByTestId)).toBeUndefined()

    press(stage, 'End')
    expect(cardTitle(container)).toBe('Gavilar is assassinated')
    expect(indicator(container)).toBe('ca. 10958after the ShatteringRoshar')
    expect(await goal(findByTestId)).toEqual({
      world: 'roshar',
      view: 'pin',
      pin: [1936, 796],
      key: 'event:gavilar-assassinated',
    })

    click(container.querySelector('[aria-label="Previous event"]'))
    expect(cardTitle(container)).toBe('Kaladin is born')
    click(container.querySelector('[aria-label="Previous event"]'))
    expect(cardTitle(container)).toBe('Dalinar Kholin is born')
    click(container.querySelector('[aria-label="Previous event"]'))
    expect(cardTitle(container)).toBe('The Manywar ends')
    expect(container.textContent).toMatch(/The Shards settle/)
    // Nothing from past chapter 17 of Wind and Truth, anywhere.
    expect(stage.textContent).not.toMatch(/Yolen/)
    expect(markers(container)).toHaveLength(18)
    expect((await findByTestId('explorer')).dataset.worlds).not.toMatch(/yolen/)
  })

  it('bursts the Shattering from its world once Wind and Truth is finished', async () => {
    const { findByRole, findByTestId } = renderAt('/timeline', [
      ...BEFORE_WAT,
      'wind-and-truth',
    ])
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    press(stage, 'ArrowRight')
    expect(await goal(findByTestId)).toEqual({
      world: 'yolen',
      view: 'globe',
      key: 'event:shattering',
    })
    expect(await effect(findByTestId)).toEqual({
      kind: 'shattering',
      world: 'yolen',
      key: 'effect:shattering',
    })
  })

  it('zooms out to the Cosmere and looks in on another world', async () => {
    const { container, findByRole, findByTestId, findByText } = renderAt(
      '/timeline',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    await findByRole('group', { name: 'Cosmere Timeline' })
    // The worlds start tucked away behind the planet button.
    expect(container.querySelector('#timeline-worlds')).toBeNull()
    click(await findByText('zoom out past the world'))
    expect(await goal(findByTestId)).toEqual({ key: 'cosmere' })
    expect(worldButtons(container)).toContain('↩ Back to the event')

    openWorlds(container)
    const scadrial = [
      ...container.querySelectorAll('nav[aria-label="Worlds"] button'),
    ].find((b) => b.textContent === 'Scadrial')
    click(scadrial!)
    expect(worldsToggle(container)).toHaveAttribute('aria-expanded', 'false')
    expect(container.querySelector('#timeline-worlds')).toBeNull()
    expect(await goal(findByTestId)).toEqual({
      world: 'scadrial',
      view: 'globe',
      key: 'world:scadrial',
    })
    // Off on another world: no event card, just the world's name.
    expect(container.querySelector('section')).toBeNull()

    click(container.querySelector('[aria-label="Next event"]'))
    expect(cardTitle(container)).toBe('The Shattering of Adonalsium')
    expect(worldButtons(container)).not.toContain('↩ Back to the event')
  })

  it('never opens a hidden event from the address', async () => {
    const { container, findByRole } = renderAt(
      '/timeline?event=gavilar-assassinated',
      [],
      { 'way-of-kings': 'prelude' },
    )
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    expect(cardTitle(container)).toBe('The Heralds abandon the Oathpact')
    expect(stage.textContent).not.toMatch(/Gavilar/)
  })

  it('keeps the timeline working without WebGL', async () => {
    webgl.ok = false
    const { container, findByRole, queryByTestId } = renderAt('/timeline', [], {
      'way-of-kings': 'prologue',
    })
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    expect(stage.textContent).toMatch(/needs WebGL/)
    expect(queryByTestId('explorer')).toBeNull()
    expect(cardTitle(container)).toBe('The Heralds abandon the Oathpact')
  })

  it('goes full screen, and Escape leaves it without zooming out', async () => {
    const { findByRole, findByTestId } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    const button = stage.querySelector('[aria-label="Full screen"]')!
    const before = await goal(findByTestId)
    click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    press(stage, 'Escape')
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(await goal(findByTestId)).toEqual(before)
  })

  it("reads an event's page in place, without leaving the timeline", async () => {
    const { container, findByRole } = renderAt(
      '/timeline?event=oathpact-abandoned',
      ['way-of-kings', 'words-of-radiance', 'oathbringer'],
    )
    await findByRole('group', { name: 'Cosmere Timeline' })
    const card = container.querySelector('section')!
    expect(card.textContent).toMatch(/Heralds leave their Honorblades/)
    expect(card.textContent).not.toMatch(/Kalak/)
    click(card.querySelector('button[aria-expanded]'))
    const details = container.querySelector('aside')!
    expect(details.textContent).toMatch(/Kalak and Jezrien meet/)
    // The Last Desolation's own page, loaded into the panel.
    // The story loads lazily, slower under the full suite.
    await vi.waitFor(
      () => expect(details.textContent).toMatch(/Vorin tradition says mankind/),
      { timeout: 5000 },
    )
    expect(details.textContent).not.toMatch(/Wind and Truth/)
    // Moving to another event closes the panel.
    click(container.querySelector('[aria-label="Next event"]'))
    expect(container.querySelector('aside')).toBeNull()
  })

  it('names the world on screen, wherever the reader flies', async () => {
    const { container, findByRole, getByText } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    await findByRole('group', { name: 'Cosmere Timeline' })
    const on = () =>
      container.querySelector('[data-tooltip="Where the map is"]')
    expect(on()?.textContent).toBe('Roshar')
    click(getByText('fly to Scadrial'))
    expect(on()?.textContent).toBe('Scadrial')
    click(getByText('rise to the sky'))
    expect(on()?.textContent).toBe('The Cosmere')
  })

  it("tiles an event's characters in its panel", async () => {
    const { container, findByRole } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    await findByRole('group', { name: 'Cosmere Timeline' })
    click(container.querySelector('section button[aria-expanded]'))
    const details = container.querySelector('aside')!
    expect(getByText(details, 'Characters').tagName).toBe('H3')
    expect(
      details.querySelector('a[href="/characters/szeth"]')?.textContent,
    ).toMatch(/Szeth/)
  })

  it('resets the view to the default for what the reader is looking at', async () => {
    const { findByRole, findByTestId } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    await findByRole('group', { name: 'Cosmere Timeline' })
    const explorer = await findByTestId('explorer')
    // Full screen sits with the zoom and reset buttons, on top.
    expect(explorer.querySelector('[aria-label="Full screen"]')).not.toBeNull()
    click(explorer.querySelector('[aria-label="Reset the view"]'))
    expect(await goal(findByTestId)).toEqual({
      world: 'roshar',
      view: 'pin',
      pin: [1936, 796],
      key: 'event:gavilar-assassinated#reset1',
    })
  })

  it('lists the Shards only once the reader knows them', async () => {
    const before = renderAt('/timeline', ['way-of-kings', 'hero-of-ages'])
    await before.findByRole('group', { name: 'Cosmere Timeline' })
    expect(before.container.querySelector('[aria-label="Shards"]')).toBeNull()
    cleanup()

    const { container, findByRole, findByTestId, router } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    await findByRole('group', { name: 'Cosmere Timeline' })
    click(container.querySelector('[aria-label="Shards"]'))
    const [list, unknown] = container.querySelectorAll('#timeline-shards ul')
    const names = (ul: Element) =>
      [...ul.querySelectorAll('button > span')].map(
        (n) => n.firstChild?.textContent,
      )
    expect(names(list)).toEqual([
      'Preservation',
      'Ruin',
      'Devotion',
      'Dominion',
      'Honor',
      'Cultivation',
      'Odium',
      'Endowment',
      'Autonomy',
      'Ambition',
    ])
    // Honor is dead by now: greyed out over Roshar.
    expect(
      container
        .querySelector('[data-shard="honor"]')
        ?.hasAttribute('data-faded'),
    ).toBe(true)
    expect(list.previousElementSibling?.textContent).toBe('Location known')
    // Each row: the Shard's art, name and planet.
    expect(list.querySelector('li')?.textContent).toBe(
      'PreservationOn Scadrial',
    )
    // Shards with no known home come last, under their own heading.
    expect(unknown.previousElementSibling?.textContent).toBe('Location unknown')
    expect(names(unknown)).toEqual(['Invention', 'Whimsy', 'Mercy', 'Valor'])
    expect(unknown.querySelector('li')?.textContent).toBe('Invention')
    // One zooms out to the whole Cosmere and opens its details.
    click(unknown.querySelector('button'))
    expect(container.querySelector('#timeline-shard h2')?.textContent).toBe(
      'Invention',
    )
    expect(await goal(findByTestId)).toEqual({ key: 'cosmere' })
    expect(container.querySelector('#timeline-shards')).toBeNull()
    click(container.querySelector('[aria-label="Shards"]'))
    click(
      container.querySelector('#timeline-shards button[data-tooltip^="Fly"]'),
    )
    // It flies there and opens the Shard's details.
    expect(container.querySelector('#timeline-shard h2')?.textContent).toBe(
      'Preservation',
    )
    expect(await goal(findByTestId)).toEqual({
      world: 'scadrial',
      view: 'globe',
      key: 'world:scadrial',
    })
    // Only the camera moves: the timeline stays where it was.
    expect(router.state.location.search).toBe('?event=gavilar-assassinated')
    // Just the Shards: no event card over the world.
    expect(container.querySelector('section[aria-live]')).toBeNull()
    expect(container.querySelector('[data-shard="devotion"]')).toHaveAttribute(
      'data-faded',
    )
    // Clicking one opens its details on the right.
    const open = (id: string) => {
      click(container.querySelector(`[data-shard="${id}"]`))
      return container.querySelector('#timeline-shard')!.textContent
    }
    expect(open('preservation')).toBe(
      '×PreservationArt: Cam KutaStatusSettled on Scadrial, with Ruin' +
        'VesselLerasArt: Nino Vecia',
    )
    expect(
      container.querySelector(
        '#timeline-shard a[href="/characters/leras"] img',
      ),
    ).toHaveAttribute('src', expect.stringContaining('leras-preservation'))
    // Splintered; Aona's name and art wait for Wind and Truth.
    expect(open('devotion')).toBe(
      '×DevotionArt: Cam KutaStatusSplintered by Odium',
    )
    // Any other move brings the event card back.
    click(container.querySelector('button[aria-label="Worlds"]'))
    click(container.querySelector('#timeline-worlds button'))
    expect(container.querySelector('section[aria-live]')).not.toBeNull()
  })

  it('floats the notable characters alive at this point over their world', async () => {
    const { findByTestId } = renderAt(
      '/timeline?event=gavilar-assassinated',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    const people = (await findByTestId('explorer')).dataset.people!.split(',')
    // Only those alive, with known whereabouts, by Gavilar's death.
    expect(people).toEqual([
      'dalinar-kholin@roshar',
      'jezrien@roshar',
      'kaladin@roshar',
      'kalak@roshar',
      'szeth@roshar',
    ])
  })

  it('finds a notable character and where they are at this point', async () => {
    const { container, findByRole, findByTestId } = renderAt(
      '/timeline?event=oathpact-abandoned',
      BEFORE_WAT,
      { 'wind-and-truth': '17' },
    )
    const stage = await findByRole('group', { name: 'Cosmere Timeline' })
    const panel = () => container.querySelector('#timeline-people')!
    const rows = () =>
      [...panel().querySelectorAll('li')].map((li) => li.textContent)
    // Moving to another event closes the panel, so each search reopens it.
    const find = (value: string) => {
      if (!panel())
        click(container.querySelector('[aria-label="Notable characters"]'))
      act(() => {
        fireEvent.change(panel().querySelector('input')!, { target: { value } })
      })
    }
    find('kal')
    expect(rows()).toEqual([
      'KaladinNot born for about another 4486 yearsJump to their birth',
      'KalakOn Roshar',
    ])
    click(panel().querySelector('li button:last-child'))
    expect(cardTitle(container)).toBe('Kaladin is born')
    expect(panel()).toBeNull()
    find('kal')
    click(panel().querySelector('li button'))
    expect(await goal(findByTestId)).toEqual({
      world: 'roshar',
      view: 'pin',
      pin: [1922, 631],
      key: 'person:kaladin',
    })
    expect(container.textContent).toMatch(/Kaladin is here on Roshar/)
    // Clicking elsewhere on the map closes it.
    click(getByText(container, 'click the map'))
    expect(container.textContent).not.toMatch(/Kaladin is here/)

    press(stage, 'End')
    find('gavilar')
    expect(rows()).toEqual([
      expect.stringMatching(/Gavilar KholinDied this yearJump to their death$/),
    ])
    find('szeth')
    click(panel().querySelector('li button'))
    expect(await goal(findByTestId)).toMatchObject({
      view: 'pin',
      pin: [1936, 796],
      key: 'person:szeth',
    })
    // On the map with everyone else whose spot is known, picked or not.
    expect((await findByTestId('explorer')).dataset.placed!.split(',')).toEqual(
      expect.arrayContaining(['szeth', 'kaladin']),
    )
  })

  it("never lists a character the reader hasn't met", async () => {
    const { container, findByRole } = renderAt('/timeline', [], {
      'way-of-kings': 'prologue',
    })
    await findByRole('group', { name: 'Cosmere Timeline' })
    click(container.querySelector('[aria-label="Notable characters"]'))
    const text = container.querySelector('#timeline-people')!.textContent
    expect(text).toMatch(/Szeth/)
    expect(text).not.toMatch(/Kaladin|Vin|Shallan/)
  })

  it('pins only the current event', async () => {
    const pins = async (event: string) => {
      const { findByTestId } = renderAt(`/timeline?event=${event}`, [
        'way-of-kings',
      ])
      const ids = (await findByTestId('explorer')).dataset.pins!.split(',')
      cleanup()
      return ids
    }
    expect(await pins('dalinar-born')).toEqual(['dalinar-born'])
    expect(await pins('gavilar-assassinated')).toEqual(['gavilar-assassinated'])
  })
})
