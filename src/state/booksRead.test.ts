import { beforeEach, describe, expect, it } from 'vitest'
import { BOOKS_READ_KEY, loadBooksRead, saveBooksRead } from './booksRead'

const store = (value: unknown) =>
  localStorage.setItem(BOOKS_READ_KEY, JSON.stringify(value))

describe('saved reading progress', () => {
  beforeEach(() => localStorage.clear())

  it('is null until the reader has chosen', () => {
    expect(loadBooksRead()).toBeNull()
  })

  it('still loads the old list of finished books', () => {
    store(['elantris', 'way-of-kings'])
    expect(loadBooksRead()).toEqual({
      read: ['elantris', 'way-of-kings'],
      reading: {},
    })
  })

  it('saves and loads books being read', () => {
    saveBooksRead({ read: ['elantris'], reading: { 'way-of-kings': '34' } })
    expect(JSON.parse(localStorage.getItem(BOOKS_READ_KEY)!)).toMatchObject({
      version: 2,
    })
    expect(loadBooksRead()).toEqual({
      read: ['elantris'],
      reading: { 'way-of-kings': '34' },
    })
  })

  it('ignores anything it does not recognise', () => {
    store({ version: 2, read: ['elantris', 3], reading: { a: 5, b: null } })
    expect(loadBooksRead()).toEqual({
      read: ['elantris'],
      reading: { b: null },
    })
    localStorage.setItem(BOOKS_READ_KEY, '{oops')
    expect(loadBooksRead()).toBeNull()
  })
})
