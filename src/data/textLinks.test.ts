import { describe, expect, it } from 'vitest'
import { readerCanSee } from './reveal'
import { linkIndex, linkText, textLinks } from './textLinks'

const at = (read: string[], reading: Record<string, string> = {}) =>
  readerCanSee({
    read: new Set(read),
    reading: new Map(Object.entries(reading)),
  })
const parts = (text: string, canSee = at([]), selfKey?: string) =>
  linkText(text, linkIndex(textLinks(canSee)), new Set(), selfKey)
const hrefs = (text: string, canSee = at([]), selfKey?: string) =>
  parts(text, canSee, selfKey).flatMap((p) =>
    typeof p === 'string' ? [] : [p.href],
  )

describe('links in prose', () => {
  it('links a character only once the reader has met them', () => {
    const text = 'Kaladin trusted Teft.'
    expect(hrefs(text, at([], { 'way-of-kings': '10' }))).not.toContain(
      '/characters/teft',
    )
    expect(hrefs(text, at([], { 'way-of-kings': '11' }))).toContain(
      '/characters/teft',
    )
  })

  it('links each page once per set and never the page itself', () => {
    const canSee = at(['way-of-kings'])
    const index = linkIndex(textLinks(canSee))
    const linked = new Set<string>()
    const first = linkText(
      'Teft and Kaladin.',
      index,
      linked,
      'character:kaladin',
    )
    const second = linkText('Teft again.', index, linked)
    expect(first).toEqual([
      { text: 'Teft', href: '/characters/teft' },
      ' and Kaladin.',
    ])
    expect(second).toEqual(['Teft again.'])
  })

  it('keeps the text intact and matches whole words only', () => {
    const canSee = at(['way-of-kings'])
    const text = "Teft's squad met Tefty at Teft."
    const out = parts(text, canSee)
    expect(out.map((p) => (typeof p === 'string' ? p : p.text)).join('')).toBe(
      text,
    )
    expect(out[0]).toEqual({ text: 'Teft', href: '/characters/teft' })
  })

  it('links magic and culture pages the reader has reached', () => {
    const canSee = at(['way-of-kings'])
    expect(hrefs('He used Surgebinding.', canSee)).toContain(
      '/magic/surgebinding',
    )
    expect(hrefs('He used Surgebinding.', at([]))).toEqual([])
  })

  it("prefers a page's own name over another page's alias", () => {
    const canSee = at(['way-of-kings'])
    expect(hrefs('On Roshar.', canSee)[0]).toMatch(/\/planets\/roshar$/)
    expect(hrefs('A Highprince.', canSee)).toEqual(['/culture/highprince'])
  })

  it('leaves book titles alone', () => {
    const canSee = at(['sunlit-man'])
    expect(hrefs('Nomad, in The Sunlit Man.', canSee)).toEqual([
      '/characters/nomad',
    ])
  })

  it('never links everyday words', () => {
    expect(hrefs('First, Wind and Truth.', at(['way-of-kings']))).toEqual([])
  })
})
