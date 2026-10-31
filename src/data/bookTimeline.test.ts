import { describe, expect, it } from 'vitest'
import { bookTimeline, layoutBooks } from './bookTimeline'
import { bookSeries } from './books'
import chronology from './chronology.json'
import { systems } from './systems'

const covers = Object.keys(
  import.meta.glob('../../public/timeline/covers/*.webp'),
).map((f) => f.replace('../../public', ''))

describe('bookTimeline', () => {
  const books = new Set(bookSeries.flatMap((s) => s.books.map((b) => b.id)))
  const planets = new Set(systems.flatMap((s) => s.planets.map((p) => p.id)))

  it('uses real book and planet ids, with a cover on disk', () => {
    for (const b of bookTimeline) {
      expect(books, b.id).toContain(b.id)
      expect(planets, b.id).toContain(b.world)
      expect(covers).toContain(b.cover)
      expect(b.end).toBeGreaterThanOrEqual(b.start)
    }
  })

  it('follows the Coppermind chronological order', () => {
    const at = (id: string) => bookTimeline.findIndex((b) => b.id === id)
    const order = [
      'white-sand-1',
      'elantris',
      'emperors-soul',
      'final-empire',
      'warbreaker',
      'shadows-for-silence',
      'way-of-kings',
      'alloy-of-law',
      'fires-of-december',
      'tress',
      'sunlit-man',
      'yumi',
      'isles-of-the-emberdark',
    ]
    expect(order.map(at)).toEqual([...order.map(at)].sort((a, b) => a - b))
  })

  it('puts Mistborn Era 2 after the first Stormlight arc', () => {
    const book = (id: string) => bookTimeline.find((b) => b.id === id)!
    expect(book('allomancer-jak').start).toBeGreaterThan(
      book('wind-and-truth').end,
    )
  })

  it('agrees with the researched chronology on when each book happens', () => {
    // Each book against a turning point of its own in chronology.json (the
    // validated cross-world order): the same order, and within a year.
    const pairs = [
      ['white-sand-3', 'taldain-diem-conspiracy-exposed'],
      ['elantris', 'sel-elantris-restored'],
      ['hero-of-ages', 'scadrial-e1-scadrial-restored'],
      ['warbreaker', 'nalthis-pahn-kahl-rebellion-stopped'],
      ['way-of-kings', 'roshar-wok-dalinar-trades-oathbringer'],
      ['oathbringer', 'roshar-ob-thaylen-field-battle-resolves'],
      ['rhythm-of-war', 'roshar-row-urithiru-captured'],
      ['wind-and-truth', 'roshar-wat-sigzil-receives-dawnshard'],
      ['alloy-of-law', 'scadrial-vanishers-dismantled'],
      ['fires-of-december', 'cosmere-fires-december-crisis-resolved'],
      ['lost-metal', 'scadrial-elendel-attack-stopped'],
      ['tress', 'lumar-tress-reunites-with-charlie'],
      ['sunlit-man', 'canticle-beaconites-leave'],
      ['yumi', 'komashi-yumi-and-painter-part'],
      ['sixth-of-the-dusk', 'first-of-the-sun-dusk-returns-to-patji'],
      [
        'isles-of-the-emberdark',
        'first-of-the-sun-isles-expedition-reaches-the-emberdark',
      ],
    ].map(([id, event]) => ({
      book: bookTimeline.find((b) => b.id === id)!,
      year: chronology.find((e) => e.id === event)!.year,
    }))
    const byBook = [...pairs].sort((a, b) => a.book.start - b.book.start)
    const byEvent = [...pairs].sort((a, b) => a.year - b.year)
    expect(byBook.map((p) => p.book.id)).toEqual(byEvent.map((p) => p.book.id))
    for (const { book, year } of pairs) {
      expect(year, book.id).toBeGreaterThanOrEqual(book.start - 1)
      expect(year, book.id).toBeLessThanOrEqual(book.end + 1)
    }
  })

  it('runs side stories above the main row and shrinks the long gaps', () => {
    const pick = (...ids: string[]) =>
      bookTimeline.filter((b) => ids.includes(b.id))
    const { rows, breaks } = layoutBooks(
      pick(
        'final-empire',
        'secret-history',
        'well-of-ascension',
        'warbreaker',
        'words-of-radiance',
        'elsecaller',
        'edgedancer',
        'king-lopen',
      ),
    )
    const row = (id: string) => rows.find((r) => r.book.id === id)!
    // Secret History runs alongside the Mistborn trilogy, across a cover.
    expect(row('secret-history').side).toBe(true)
    expect(row('well-of-ascension').side).toBe(false)
    expect(row('secret-history').x + row('secret-history').w).toBeGreaterThan(
      row('well-of-ascension').x,
    )
    // The novellas at the end of Words of Radiance get room for their covers.
    const novellas = ['elsecaller', 'edgedancer', 'king-lopen'].map(row)
    for (const [a, b] of [
      [novellas[0], novellas[1]],
      [novellas[1], novellas[2]],
    ])
      expect(b.x - a.x).toBeGreaterThanOrEqual(30)
    // About 250 years to Warbreaker, drawn as one short break.
    expect(breaks[0]).toEqual(expect.objectContaining({ years: 254 }))
    expect(row('warbreaker').x - row('well-of-ascension').x).toBeLessThan(400)
    // Main covers never crowd each other.
    const main = rows.filter((r) => !r.side).map((r) => r.x)
    for (let i = 1; i < main.length; i++)
      expect(main[i] - main[i - 1]).toBeGreaterThanOrEqual(66)
  })

  it('puts a break in the clear space between two covers', () => {
    const { rows, breaks } = layoutBooks(
      bookTimeline.filter((b) => ['lost-metal', 'tress'].includes(b.id)),
    )
    // Covers are 48px wide, centred on their start.
    expect(breaks[0].x).toBeGreaterThan(rows[0].x + 24)
    expect(breaks[0].x).toBeLessThan(rows[1].x - 24)
  })

  it('keeps a side story on the main row when its main book is not shown', () => {
    const { rows } = layoutBooks(
      bookTimeline.filter((b) => b.id === 'secret-history'),
    )
    expect(rows[0].side).toBe(false)
  })
})
