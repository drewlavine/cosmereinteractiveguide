import { describe, expect, it } from 'vitest'
import { historyParagraphFor } from './historyMatch'

const paragraphs = [
  { id: 'p1', books: [{ bookId: 'way-of-kings', chapter: '3' }] },
  { id: 'p2', books: [{ bookId: 'way-of-kings', chapter: '8' }] },
  { id: 'p3', books: [{ bookId: 'words-of-radiance', chapter: '8' }] },
]

describe('historyParagraphFor', () => {
  it('finds the paragraph from the same chapter', () => {
    expect(
      historyParagraphFor({ bookId: 'way-of-kings', chapter: '8' }, paragraphs),
    ).toBe('p2')
  })

  it('falls back to the nearest paragraph a few chapters away', () => {
    expect(
      historyParagraphFor({ bookId: 'way-of-kings', chapter: '6' }, paragraphs),
    ).toBe('p2')
  })

  it('finds nothing far away, in another book, or with no date', () => {
    expect(
      historyParagraphFor(
        { bookId: 'way-of-kings', chapter: '40' },
        paragraphs,
      ),
    ).toBeUndefined()
    expect(
      historyParagraphFor({ bookId: 'oathbringer', chapter: '8' }, paragraphs),
    ).toBeUndefined()
    expect(historyParagraphFor(undefined, paragraphs)).toBeUndefined()
  })
})
