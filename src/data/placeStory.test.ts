import { describe, expect, it } from 'vitest'
import alethkar from './locationStories/alethkar.json'
import { hasLocationStory } from './locationStories'
import { placeCultureArt } from './placeCultureArt'
import {
  readerCanSee,
  revealLocationStory,
  revealLocationTimeline,
  revealPlaceCultureArt,
} from './reveal'
import type { LocationStory } from './types'

const at = (read: string[], reading: Record<string, string> = {}) =>
  readerCanSee({
    read: new Set(read),
    reading: new Map(Object.entries(reading)),
  })
const wok = (chapter: string) => [{ book: 'way-of-kings', chapter }]

// A nation's Culture section, its About copies, its Metro-line timeline and
// its Culture pictures, each shown from the chapter that reveals it.
describe('place culture and timeline reveals', () => {
  const story: LocationStory = {
    intro: [],
    description: [
      { text: 'Rocky plains.', revealedIn: wok('3') },
      {
        text: 'Men may not read.',
        revealedIn: wok('8'),
        fromCulture: 'language',
      },
      { text: 'Women write.', revealedIn: wok('8') },
    ],
    culture: [
      {
        title: [{ text: 'Letters', revealedIn: wok('8') }],
        topic: 'language',
        items: [
          { text: 'Men may not read.', revealedIn: wok('8') },
          { text: 'Women write.', revealedIn: wok('8') },
        ],
      },
      {
        title: [{ text: 'Dress', revealedIn: wok('20') }],
        topic: 'dress',
        items: [{ text: 'Havahs.', revealedIn: wok('20') }],
      },
    ],
    history: [],
  }

  it('shows Culture items from their chapter and About copies never', () => {
    const before = revealLocationStory(story, at([], { 'way-of-kings': '7' }))
    expect(before.description).toEqual(['Rocky plains.'])
    expect(before.culture).toEqual([])
    expect(before.spoilers).toBe(true)

    const after = revealLocationStory(story, at([], { 'way-of-kings': '8' }))
    expect(after.description).toEqual(['Rocky plains.'])
    expect(after.culture).toEqual([
      expect.objectContaining({ title: 'Letters', topic: 'language' }),
    ])
    expect(after.culture[0].items.map((i) => i.text)).toEqual([
      'Men may not read.',
      'Women write.',
    ])
    expect(
      revealLocationStory(story, at(['way-of-kings'])).culture,
    ).toHaveLength(2)
  })

  it('shows a Culture picture only beside a shown subsection of its topic', () => {
    const [picture] = placeCultureArt.alethkar.filter(
      (a) => a.topic === 'society',
    )
    const shown = (canSee: ReturnType<typeof at>, topics: string[]) =>
      revealPlaceCultureArt([picture], topics, canSee).art
    expect(shown(at([], { 'way-of-kings': '15' }), ['society'])).toEqual([])
    expect(shown(at([], { 'way-of-kings': '16' }), ['society'])).toEqual([
      picture,
    ])
    expect(shown(at(['way-of-kings']), ['dress'])).toEqual([])
  })

  it('tells a nation timeline moment from its chapter, retold later', () => {
    const moment = (canSee: ReturnType<typeof at>) =>
      revealLocationTimeline(alethkar as LocationStory, canSee)
        .eras.flatMap((e) => e.moments)
        .find((m) => m.id === 'human-conquest')
    const early = ['way-of-kings', 'words-of-radiance', 'edgedancer']
    expect(moment(at(early, { oathbringer: '112' }))).toBeUndefined()

    const ob = moment(at(early, { oathbringer: '113' }))!
    expect(ob.title).toBe('Humans take the land')
    expect(ob.places).toEqual([])
    expect(ob.versions).toHaveLength(1)

    const read = [...early, 'oathbringer', 'dawnshard']
    const row = moment(at(read, { 'rhythm-of-war': '111' }))!
    expect(row.versions).toHaveLength(2)
    expect(row.places.map((p) => p.id)).toEqual(['shinovar'])
  })

  it('hides later moments and unknown places, and says so', () => {
    const read = at([
      'way-of-kings',
      'words-of-radiance',
      'edgedancer',
      'oathbringer',
      'dawnshard',
      'rhythm-of-war',
    ])
    const shown = revealLocationTimeline(alethkar as LocationStory, read)
    expect(shown.eras.flatMap((e) => e.moments.map((m) => m.id))).not.toContain(
      'althmen',
    )
    expect(shown.spoilers).toBe(true)

    const place = (id: string) => {
      const t = revealLocationTimeline(
        {
          intro: [],
          description: [],
          history: [],
          timeline: [
            {
              id: 'e',
              title: 'Era',
              tone: '#000000',
              moments: ['a', 'b', 'c'].map((m) => ({
                id: m,
                kind: 'war',
                told: [
                  { revealedIn: wok('1'), title: m, text: m, places: [id] },
                ],
              })),
            },
          ],
        },
        read,
      )
      return { places: t.eras[0].moments[0].places, spoilers: t.spoilers }
    }
    expect(place('no-such-place').places).toEqual([])
    expect(place('no-such-place').spoilers).toBe(false)
  })

  it('hides a moment’s place and art until their chapters, and says so', () => {
    const moment = (canSee: ReturnType<typeof at>) =>
      revealLocationTimeline(
        {
          intro: [],
          description: [],
          history: [],
          timeline: [
            {
              id: 'e',
              title: 'Era',
              tone: '#000000',
              moments: [
                {
                  id: 'a',
                  kind: 'war',
                  told: [
                    {
                      revealedIn: wok('1'),
                      title: 'a',
                      text: 'a',
                      places: ['kholinar'],
                      art: 'character:kaladin',
                    },
                  ],
                },
              ],
            },
          ],
        },
        canSee,
      )
    const early = moment(at([], { 'way-of-kings': '1' }))
    expect(early.eras[0].moments[0].places).toEqual([])
    expect(early.eras[0].moments[0].art).toBeUndefined()
    expect(early.spoilers).toBe(true)
    const late = moment(at(['way-of-kings', 'words-of-radiance']))
    expect(late.eras[0].moments[0].places.map((p) => p.id)).toEqual([
      'kholinar',
    ])
    expect(late.eras[0].moments[0].art).toBeDefined()
  })

  it('finds Rira’s story for its map place', () => {
    expect(hasLocationStory('rira')).toBe(true)
  })
})
