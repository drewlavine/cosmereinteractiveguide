import { describe, expect, it } from 'vitest'
import { books } from './books'
import { chapters } from './chapters'
import { hasReached } from './progress'

const progress = (
  read: string[],
  reading: Record<string, string | null> = {},
) => ({ read: new Set(read), reading: new Map(Object.entries(reading)) })
const wok = (chapter: string) => ({ book: 'way-of-kings', chapter })

describe('reading progress', () => {
  it('needs a book finished for whole-book tags', () => {
    expect(hasReached(progress([]), 'way-of-kings')).toBe(false)
    expect(
      hasReached(progress([], { 'way-of-kings': '34' }), 'way-of-kings'),
    ).toBe(false)
    expect(hasReached(progress(['way-of-kings']), 'way-of-kings')).toBe(true)
  })

  it('reveals chapter tags up to and including the last chapter finished', () => {
    const reader = progress([], { 'way-of-kings': '34' })
    expect(hasReached(reader, wok('prologue'))).toBe(true)
    expect(hasReached(reader, wok('34'))).toBe(true)
    expect(hasReached(reader, wok('35'))).toBe(false)
    expect(hasReached(reader, wok('epilogue'))).toBe(false)
    expect(hasReached(progress(['way-of-kings']), wok('epilogue'))).toBe(true)
  })

  it('needs every part of an all-of tag', () => {
    const both = { all: ['warbreaker', wok('34')] }
    expect(hasReached(progress(['warbreaker']), both)).toBe(false)
    expect(hasReached(progress([], { 'way-of-kings': '40' }), both)).toBe(false)
    expect(
      hasReached(progress(['warbreaker'], { 'way-of-kings': '40' }), both),
    ).toBe(true)
  })

  it('reveals nothing before the first chapter is finished', () => {
    const reader = progress([], { 'way-of-kings': null })
    expect(hasReached(reader, wok('prologue'))).toBe(false)
    expect(hasReached(progress([]), wok('1'))).toBe(false)
  })

  it('keeps unknown chapters hidden', () => {
    expect(
      hasReached(progress([], { 'way-of-kings': '34' }), wok('no-such')),
    ).toBe(false)
    expect(
      hasReached(progress([], { 'way-of-kings': 'no-such' }), wok('1')),
    ).toBe(false)
  })

  it('lists chapters only for real books, with unique ids and labels', () => {
    const bookIds = new Set(books.map((b) => b.id))
    for (const [bookId, list] of Object.entries(chapters)) {
      expect(bookIds).toContain(bookId)
      expect(list.length).toBeGreaterThan(0)
      expect(new Set(list.map((c) => c.id)).size).toBe(list.length)
      expect(new Set(list.map((c) => c.label)).size).toBe(list.length)
    }
  })
})
