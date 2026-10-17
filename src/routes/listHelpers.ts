/** Helpers shared by the browsable lists (Characters, Locations). */

/** Lower case without accents, for matching typed filters. */
export const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

/** First letter without accents, or "#" for names that start with a digit etc. */
export const letterOf = (name: string) => {
  const letter = name.normalize('NFD').charAt(0).toUpperCase()
  return /[A-Z]/.test(letter) ? letter : '#'
}

/** A sorted list split by first letter; each letter's names arrive together. */
export const byLetter = <T extends { name: string }>(list: T[]) =>
  list.reduce<{ letter: string; items: T[] }[]>((acc, item) => {
    const letter = letterOf(item.name)
    const last = acc.at(-1)
    if (last?.letter === letter) last.items.push(item)
    else acc.push({ letter, items: [item] })
    return acc
  }, [])

/** Id for a group heading, to jump to. */
export const anchorFor = (prefix: string, id: string) =>
  `${prefix}-${id === '#' ? 'other' : fold(id).replace(/[^a-z0-9]+/g, '-')}`

export const plural = (n: number, word: string, many = `${word}s`) =>
  `${n} ${n === 1 ? word : many}`
