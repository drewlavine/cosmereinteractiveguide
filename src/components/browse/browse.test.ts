import { describe, expect, it } from 'vitest'
import { buildGroups, TONES, toneOf } from './groups'
import { listHref, readView } from './urls'
import type { Category } from './types'

describe('buildGroups', () => {
  const items = ['a', 'b', 'c', 'd']
  const by = (table: Record<string, Category[]>) => (item: string) =>
    table[item] ?? []

  it('orders groups by their category, then by name', () => {
    const { groups } = buildGroups(
      items,
      by({
        a: [['y', 'Yes', 1]],
        b: [['n', 'Nn', 1]],
        c: [['z', 'Zero', 0]],
        d: [['y', 'Yes', 1]],
      }),
    )
    expect(groups.map((g) => [g.id, g.items])).toEqual([
      ['z', ['c']],
      ['n', ['b']],
      ['y', ['a', 'd']],
    ])
  })

  it('can put the biggest group first, within the same order', () => {
    const table = {
      a: [['x', 'Xx', 0] as Category],
      b: [['y', 'Yy', 0] as Category],
      c: [['y', 'Yy', 0] as Category],
    }
    expect(buildGroups(items, by(table), true).groups.map((g) => g.id)).toEqual(
      ['y', 'x'],
    )
    expect(buildGroups(items, by(table)).groups.map((g) => g.id)).toEqual([
      'x',
      'y',
    ])
  })

  it('returns what falls under no category apart, and lists an item once', () => {
    const { groups, unsorted } = buildGroups(
      items,
      by({
        a: [
          ['x', 'Xx', 0],
          ['x', 'Xx', 0],
        ],
        b: [['x', 'Xx', 0]],
      }),
    )
    expect(groups).toHaveLength(1)
    expect(groups[0].items).toEqual(['a', 'b'])
    expect(unsorted).toEqual(['c', 'd'])
  })
})

describe('toneOf', () => {
  it('gives neighbouring cards different hues, wrapping round, within the palette', () => {
    for (const grouping of ['series', 'world', 'type']) {
      for (let i = 0; i < 20; i++) {
        expect(toneOf(grouping, i)).not.toBe(toneOf(grouping, i + 1))
        expect(toneOf(grouping, i)).toBeLessThan(TONES)
      }
    }
  })
})

describe('readView', () => {
  const groupings = ['series', 'world']
  const view = (search: string) =>
    readView(new URLSearchParams(search), groupings)

  it('shows the cards unless a group, the A–Z list or a filter is asked for', () => {
    expect(view('')).toEqual({ name: 'cards', group: null })
    // An old link to one grouping lands on its cards.
    expect(view('group=world')).toEqual({ name: 'cards', group: 'world' })
    expect(view('group=nonsense')).toEqual({ name: 'cards', group: null })
    expect(view('group=name')).toEqual({ name: 'az' })
    expect(view('q=%20')).toEqual({ name: 'cards', group: null })
    expect(view('group=world&q=ab')).toEqual({ name: 'az' })
  })

  it('opens a group’s members only for a known grouping', () => {
    expect(view('group=series&of=x')).toEqual({
      name: 'members',
      group: 'series',
      of: 'x',
    })
    expect(view('group=nonsense&of=x')).toEqual({ name: 'cards', group: null })
    expect(view('of=x')).toEqual({ name: 'cards', group: null })
  })
})

describe('listHref', () => {
  it('links to the cards, a grouping, or a group', () => {
    expect(listHref('/magic')).toBe('/magic')
    expect(listHref('/magic', { group: 'name' })).toBe('/magic?group=name')
    expect(listHref('/magic', { group: 'type', of: 'a b' })).toBe(
      '/magic?group=type&of=a+b',
    )
    // A group needs its grouping.
    expect(listHref('/magic', { of: 'x' })).toBe('/magic')
  })
})
