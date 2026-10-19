import { describe, expect, it } from 'vitest'
import { hasMet, readerCanSee, revealCharacter } from './reveal'

// The Sunlit Man: names, natures and ties revealed partway through are hidden
// before the chapter that makes them clear and shown from that chapter on.
const at = (read: string[], reading: Record<string, string> = {}) =>
  readerCanSee({
    read: new Set(read),
    reading: new Map(Object.entries(reading)),
  })
const slm = (chapter: string, read: string[] = []) =>
  at(read, { 'sunlit-man': chapter })
const page = (id: string, canSee: ReturnType<typeof at>) =>
  JSON.stringify(revealCharacter(id, canSee))
const relativeNames = (id: string, canSee: ReturnType<typeof at>) =>
  revealCharacter(id, canSee).relatives.map((r) => r.name)

const stormlight = [
  'way-of-kings',
  'words-of-radiance',
  'edgedancer',
  'oathbringer',
  'dawnshard',
  'rhythm-of-war',
]

describe('The Sunlit Man reveals', () => {
  it("keeps the Cinder King under Nomad's nickname until his title is understood", () => {
    expect(hasMet('glowing-eyes', slm('1'))).toBe(false)
    expect(hasMet('glowing-eyes', slm('6'))).toBe(true)
    expect(hasMet('cinder-king', slm('6'))).toBe(false)
    expect(page('glowing-eyes', slm('6'))).not.toMatch(/Cinder King/)
    expect(hasMet('cinder-king', slm('7'))).toBe(true)
    expect(hasMet('glowing-eyes', slm('7'))).toBe(false)
  })

  it('hides people Nomad cannot name until he understands the language', () => {
    for (const id of ['rebeke-salvage', 'elegy-salvage', 'thomos']) {
      expect(hasMet(id, slm('6'))).toBe(false)
      expect(hasMet(id, slm('7'))).toBe(true)
    }
  })

  it("hides Rebeke's later change until its chapter", () => {
    expect(revealCharacter('rebeke-salvage', slm('49')).abilities).toEqual([])
    expect(revealCharacter('rebeke-salvage', slm('50')).abilities).toContain(
      'Charred',
    )
  })

  it('hides the Salvage family ties until each is made clear', () => {
    expect(hasMet('divinity-salvage', slm('7'))).toBe(false)
    expect(relativeNames('rebeke-salvage', slm('7'))).toEqual([])
    expect(relativeNames('rebeke-salvage', slm('8'))).toEqual(['Divinity'])
    expect(relativeNames('elegy-salvage', slm('24'))).toEqual([])
    expect(relativeNames('elegy-salvage', slm('25'))).toContain('Rebeke')
  })

  it('meets mentioned-only characters where they are first named', () => {
    expect(hasMet('zellion', slm('10'))).toBe(false)
    expect(hasMet('zellion', slm('11'))).toBe(true)
    expect(hasMet('haridan', slm('10'))).toBe(false)
    expect(hasMet('haridan', slm('11'))).toBe(true)
  })

  it("keeps Aux's Roshar past off his page until both books make it clear", () => {
    const sunlitOnly = slm('39', stormlight)
    expect(page('auxiliary', sunlitOnly)).not.toMatch(/12124|Szeth|Highspren/)
    const both = at([...stormlight, 'wind-and-truth'], { 'sunlit-man': '39' })
    expect(page('auxiliary', both)).not.toMatch(/12124|Szeth/)
    const after = at([...stormlight, 'wind-and-truth'], { 'sunlit-man': '40' })
    const aux = revealCharacter('auxiliary', after)
    expect(aux.personas.map((p) => p.name)).toContain('12124')
    expect(aux.bonds).toContain('Szeth')
  })

  it("gives Szeth's highspren its own page for Stormlight readers", () => {
    const before = at(stormlight, { 'wind-and-truth': '85' })
    expect(hasMet('12124', before)).toBe(false)
    const met = at(stormlight, { 'wind-and-truth': '86' })
    expect(hasMet('12124', met)).toBe(true)
    expect(hasMet('auxiliary', met)).toBe(false)
    expect(page('12124', met)).not.toMatch(/Aux|Nomad|Canticle/)
  })
})
