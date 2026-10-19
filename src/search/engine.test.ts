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
    // The exact hit isn't counted as hidden (other unmet near-names may be).
    expect(search.search('szeth').hidden).toBe(
      reader('way-of-kings').search('szeth').hidden,
    )
    // Partial names, typos and other names stay hidden.
    for (const query of ['kalad', 'kaladn', 'davar', 'stormblessed', 'zahel'])
      expect(keys(search, query), query).not.toContain('character:kaladin')
    expect(search.search('kalad').hidden).toBeGreaterThan(0)
    // Recent searches and suggestions still leave them out.
    expect(search.get('character:kaladin')).toBeUndefined()
  })

  it('finds Zahel as himself until the reader can tell he is Vasher', () => {
    const stormlight = reader('words-of-radiance')
    expect(keys(stormlight, 'zahel')[0]).toBe('character:zahel')
    expect(keys(stormlight, 'zahel')).not.toContain('character:vasher')
    expect(keys(reader(), 'zahel')).toContain('character:zahel')
    const both = reader('warbreaker', 'words-of-radiance')
    expect(keys(both, 'zahel')[0]).toBe('character:vasher')
    const [hit] = both.search('zahel').groups[0].hits
    expect(hit.title).toBe('Vasher (Zahel)')
    expect(reader('warbreaker').search('vasher').groups[0].hits[0].title).toBe(
      'Vasher',
    )
    expect(keys(both, 'zahel')).not.toContain('character:zahel')
  })

  it('finds Nomad as himself until the reader can tell he is Sigzil', () => {
    const sunlit = reader('sunlit-man')
    expect(keys(sunlit, 'nomad')[0]).toBe('character:nomad')
    // Typing his real name finds only an unmet character, not Nomad.
    const [unmet] = sunlit.search('sigzil').groups[0].hits
    expect(unmet.key).toBe('character:sigzil')
    expect(unmet.subtitle).toBe('Character · not met yet')
    expect(keys(sunlit, 'sigzil')).not.toContain('character:nomad')
    expect(keys(reader('way-of-kings'), 'nomad')).not.toContain(
      'character:sigzil',
    )
    const both = reader('way-of-kings', 'sunlit-man')
    expect(keys(both, 'nomad')[0]).toBe('character:sigzil')
    expect(both.search('nomad').groups[0].hits[0].title).toBe('Sigzil (Nomad)')
    expect(keys(both, 'nomad')).not.toContain('character:nomad')
  })

  it('only looks up entries the reader may see', () => {
    expect(reader().get('planet:sel')).toBeUndefined()
    expect(reader('elantris').get('planet:sel')?.title).toBe('Sel')
  })
})
