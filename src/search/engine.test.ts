import { matchRoutes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { readerCanSee } from '../data/reveal'
import { routes } from '../routes'
import { createSearch } from './engine'
import { searchSources } from './sources'

const reader = (...books: string[]) =>
  createSearch(readerCanSee({ read: new Set(books), reading: new Map() }))
const keys = (search: ReturnType<typeof reader>, query: string) =>
  search
    .search(query)
    .groups.flatMap((g) => g.hits)
    .map((h) => h.key)

describe('search', () => {
  it('gives every entry a unique key and a real page', () => {
    const everyone = readerCanSee({ read: new Set(['*']), reading: new Map() })
    const all = searchSources.flatMap((s) => s.entries(everyone))
    expect(new Set(all.map((e) => e.key)).size).toBe(all.length)
    for (const entry of all) {
      const match = matchRoutes(routes, entry.href)?.at(-1)
      expect(match?.route.path, entry.href).not.toBe('*')
    }
  })

  it('finds names by prefix, despite typos, case and accents', () => {
    const search = reader('way-of-kings')
    expect(keys(search, 'kaladin')[0]).toBe('character:kaladin')
    expect(keys(search, 'KALADN')).toContain('character:kaladin')
    expect(keys(search, 'kalad')).toContain('character:kaladin')
  })

  it('ranks whole-name matches first', () => {
    expect(keys(reader('final-empire'), 'vin')[0]).toBe('character:vin')
  })

  it('finds books, even before the reader has read any', () => {
    expect(keys(reader(), 'words of radiance')[0]).toBe(
      'book:words-of-radiance',
    )
    expect(keys(reader(), 'emperors soul')).toContain('book:emperors-soul')
  })

  it('finds places by their other names', () => {
    expect(keys(reader('elantris'), 'opelon')).toContain('place:sycla')
  })

  it('leaves out and counts results from unread books', () => {
    const before = reader().search('sycla')
    expect(before.groups.flatMap((g) => g.hits)).toHaveLength(0)
    expect(before.hidden).toBeGreaterThan(0)

    const after = reader('elantris').search('sycla')
    expect(after.groups[0].hits[0].key).toBe('place:sycla')
    expect(after.hidden).toBe(0)
  })

  it('shows an unmet character only when searched for by exact name', () => {
    const search = reader()
    for (const [query, key] of [
      ['kaladin', 'character:kaladin'],
      ['Shallan Davar', 'character:shallan-davar'],
      ['shallan', 'character:shallan-davar'],
      ['SZETH', 'character:szeth'],
    ])
      expect(keys(search, query), query).toContain(key)
    const [hit] = search.search('kaladin').groups[0].hits
    expect(hit.key).toBe('character:kaladin')
    expect(hit.subtitle).toBe('Character · not met yet')
    expect(search.search('kaladin').hidden).toBe(0)
    // Partial names, typos and other names stay hidden.
    for (const query of ['kalad', 'kaladn', 'davar', 'stormblessed', 'zahel'])
      expect(keys(search, query), query).not.toContain('character:kaladin')
    expect(search.search('kalad').hidden).toBeGreaterThan(0)
    // Recent searches and suggestions still leave them out.
    expect(search.get('character:kaladin')).toBeUndefined()
  })

  it('only looks up entries the reader may see', () => {
    expect(reader().get('planet:sel')).toBeUndefined()
    expect(reader('elantris').get('planet:sel')?.title).toBe('Sel')
  })
})
