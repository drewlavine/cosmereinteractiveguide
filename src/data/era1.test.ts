import { describe, expect, it } from 'vitest'
import { books } from './books'
import { characterPortraits } from './characterPortraits'
import {
  hasMet,
  readerCanSee,
  revealCharacter,
  revealPortrait,
  revealStory,
} from './reveal'
import allrianneStory from './stories/allrianne-cett.json'

// Mistborn Era 1 identity reveals: each is hidden before the chapter that
// makes it clear and shown from that chapter on.
const at = (read: string[], reading: Record<string, string> = {}) =>
  readerCanSee({
    read: new Set(read),
    reading: new Map(Object.entries(reading)),
  })
const page = (id: string, canSee: ReturnType<typeof at>) =>
  JSON.stringify(revealCharacter(id, canSee))
const relativeNames = (id: string, canSee: ReturnType<typeof at>) =>
  revealCharacter(id, canSee).relatives.map((r) => r.name)

const era1 = ['final-empire', 'well-of-ascension', 'hero-of-ages']

describe('Mistborn Era 1 identity reveals', () => {
  it('keeps the Lord Ruler apart from Rashek until the end of TFE', () => {
    const before = at([], { 'final-empire': '37' })
    expect(hasMet('lord-ruler', before)).toBe(true)
    expect(hasMet('rashek', before)).toBe(false)
    expect(page('lord-ruler', before)).not.toMatch(/Rashek|Terris/)
    const after = at([], { 'final-empire': '38' })
    expect(hasMet('rashek', after)).toBe(true)
    expect(hasMet('lord-ruler', after)).toBe(false)
    const rashek = revealCharacter('rashek', after)
    expect(rashek.nationality).toContain('Terris')
    expect(rashek.personas.map((p) => p.name)).toContain('Lord Ruler')
  })

  it("keeps Breeze's real name hidden until Shadows of Self", () => {
    const before = at([...era1, 'alloy-of-law'], { 'shadows-of-self': '18' })
    expect(hasMet('breeze', before)).toBe(true)
    expect(hasMet('edgard-ladrian', before)).toBe(false)
    expect(page('breeze', before)).not.toMatch(/Ladrian|Edgard/)
    expect(relativeNames('allrianne-cett', before)).not.toContain(
      'Edgard Ladrian',
    )
    const after = at([...era1, 'alloy-of-law'], { 'shadows-of-self': '19' })
    expect(hasMet('edgard-ladrian', after)).toBe(true)
    expect(hasMet('breeze', after)).toBe(false)
    expect(relativeNames('allrianne-cett', after)).toContain('Edgard Ladrian')
  })

  it("keeps Clubs's real name hidden until the end of The Hero of Ages", () => {
    const before = at(['final-empire', 'well-of-ascension'], {
      'hero-of-ages': '80',
    })
    expect(hasMet('clubs', before)).toBe(true)
    expect(hasMet('cladent', before)).toBe(false)
    expect(page('clubs', before)).not.toMatch(/Cladent/)
    const after = at(era1)
    expect(hasMet('cladent', after)).toBe(true)
    expect(revealCharacter('cladent', after).personas[0].name).toBe('Clubs')
  })

  it('hides TenSoon until the reader learns who he is', () => {
    expect(hasMet('tensoon', at(['final-empire']))).toBe(false)
    const before = at(['final-empire'], { 'well-of-ascension': '46' })
    expect(hasMet('tensoon', before)).toBe(false)
    expect(hasMet('oreseur', before)).toBe(true)
    const after = at(['final-empire'], { 'well-of-ascension': '47' })
    expect(hasMet('tensoon', after)).toBe(true)
    expect(revealCharacter('tensoon', after).aliases).toContain('OreSeur')
    // OreSeur's own page never names the Lord Renoux disguise in TFE.
    expect(revealCharacter('oreseur', at(['final-empire'])).aliases).toEqual([])
  })

  it('leaves the unnamed Inquisitor of TFE unnamed until Secret History', () => {
    expect(hasMet('bendal', at(era1))).toBe(false)
    expect(hasMet('bendal', at([...era1, 'secret-history']))).toBe(true)
  })

  it("dates Paalm's other identities to Shadows of Self", () => {
    const before = at(['hero-of-ages'], { 'shadows-of-self': '25' })
    const shown = revealCharacter('paalm', before)
    expect(shown.aliases).toContain('Bleeder')
    expect(shown.aliases).not.toContain('Lessie')
    expect(relativeNames('paalm', before)).not.toContain('Waxillium Ladrian')
    const after = at(['hero-of-ages'], { 'shadows-of-self': '26' })
    expect(revealCharacter('paalm', after).aliases).toContain('Lessie')
    expect(relativeNames('paalm', after)).toContain('Waxillium Ladrian')
    // Without The Hero of Ages, she is met only once named as the culprit.
    expect(hasMet('paalm', at([], { 'shadows-of-self': '6' }))).toBe(false)
    expect(hasMet('paalm', at([], { 'shadows-of-self': '7' }))).toBe(true)
  })

  it("dates Demoux's Stormlight alias to Wind and Truth", () => {
    const wok = at(['final-empire', 'way-of-kings'])
    expect(revealCharacter('demoux', wok).aliases).not.toContain('Thinker')
    const wat = at(['final-empire', 'way-of-kings'], {
      'wind-and-truth': 'i-11',
    })
    expect(revealCharacter('demoux', wat).aliases).toContain('Thinker')
  })

  it('meets mentioned-only characters where first named', () => {
    expect(hasMet('alendi', at(['final-empire']))).toBe(false)
    expect(
      hasMet('alendi', at(['final-empire'], { 'well-of-ascension': '12' })),
    ).toBe(true)
    expect(hasMet('leras', at(era1, { 'secret-history': '6-8' }))).toBe(false)
    expect(hasMet('leras', at([...era1, 'secret-history']))).toBe(true)
  })
})

describe('Mistborn Era 1 fact dating', () => {
  const everything = at(books.map((b) => b.id))

  it('dates the kandra family tie to where TenSoon names it', () => {
    const before = at(['final-empire', 'well-of-ascension'], {
      'hero-of-ages': '23',
    })
    expect(relativeNames('tensoon', before)).not.toContain('MeLaan')
    const after = at(['final-empire', 'well-of-ascension'], {
      'hero-of-ages': '24',
    })
    expect(relativeNames('tensoon', after)).toContain('MeLaan')
  })

  it('never shows facts sourced only outside the books', () => {
    expect(relativeNames('tevidian-tekiel', everything)).not.toContain(
      'Kale Tekiel',
    )
    expect(relativeNames('kale-tekiel', everything)).not.toContain('Vin')
    expect(relativeNames('vin', everything)).not.toContain('Kale Tekiel')
    expect(revealCharacter('aslydin', everything).abilities).not.toContain(
      'Worldhopper',
    )
    expect(revealCharacter('bahmen', everything).groups).not.toContain(
      'Venture army',
    )
  })

  it("dates Camon's crew to the opening of TFE on Vin's page", () => {
    const c = at([], { 'final-empire': '1' })
    expect(revealCharacter('vin', c).groups).toContain("Camon's crew")
    expect(revealCharacter('reen', c).groups).toContain("Camon's crew")
  })

  it("dates Paalm's Replar Innate alias to where it is clear", () => {
    const shown = (ch: string) =>
      revealCharacter('paalm', at(['hero-of-ages'], { 'shadows-of-self': ch }))
        .aliases
    expect(shown('21')).not.toContain('Replar Innate')
    expect(shown('22')).toContain('Replar Innate')
  })

  it("dates Demoux's rank of general to The Hero of Ages", () => {
    const woa = at(['final-empire', 'well-of-ascension'])
    expect(revealCharacter('demoux', woa).profession).not.toContain('General')
    const hoa = at(['final-empire', 'well-of-ascension'], {
      'hero-of-ages': '8',
    })
    expect(revealCharacter('demoux', hoa).profession).toContain('General')
  })

  it('keeps later-era place names out of Era 1 story text', () => {
    const story = revealStory(
      'allrianne-cett',
      allrianneStory as Parameters<typeof revealStory>[1],
      at(era1),
    )
    expect(JSON.stringify(story)).not.toMatch(/Elendel/)
  })
})

describe('Mistborn Era 1 art', () => {
  const art = (id: string, canSee: ReturnType<typeof at>) =>
    revealPortrait(characterPortraits[id], canSee).portrait?.src

  it('shows the Lord Ruler from his first appearance, Rashek only after', () => {
    expect(art('lord-ruler', at([], { 'final-empire': '33' }))).toBeUndefined()
    expect(art('lord-ruler', at([], { 'final-empire': '34' }))).toBeDefined()
    expect(art('rashek', at([], { 'final-empire': '37' }))).toBeUndefined()
    expect(art('rashek', at([], { 'final-empire': '38' }))).toBeDefined()
  })

  it('puts Breeze and Clubs art on their persona pages until their names are out', () => {
    const tfe = at([], { 'final-empire': '4' })
    expect(art('breeze', tfe)).toBeDefined()
    expect(art('clubs', tfe)).toBeDefined()
    expect(art('edgard-ladrian', at(era1))).toBeUndefined()
    expect(
      art('cladent', at(['final-empire', 'well-of-ascension'])),
    ).toBeUndefined()
    expect(art('cladent', at(era1))).toBeDefined()
  })
})
