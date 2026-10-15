import type { Passage, Story } from '../types'

export const wiki = (page: string) => `https://coppermind.net/wiki/${page}`

// Spoiler tags work as in systems.ts: book ids, earliest published first.
export const p = (text: string, ...revealedIn: string[]): Passage => ({
  text,
  revealedIn,
})
export const story = (bookId: string, ...alsoIn: string[]): Story => ({
  bookId,
  revealedIn: [bookId, ...alsoIn],
})
