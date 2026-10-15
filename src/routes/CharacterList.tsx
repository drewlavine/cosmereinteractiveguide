import { useMemo } from 'react'
import { Link } from 'react-router'
import { characters } from '../data/characters'
import { hasMet } from '../data/reveal'
import type { Character } from '../data/types'
import { useCanSee } from '../state/reveal'

// First letter without accents, or "#" for names that start with a digit etc.
const letterOf = (name: string) => {
  const letter = name.normalize('NFD').charAt(0).toUpperCase()
  return /[A-Z]/.test(letter) ? letter : '#'
}

// The list is already sorted, so each letter's names arrive together.
const byLetter = (list: Character[]) =>
  list.reduce<{ letter: string; items: Character[] }[]>((acc, character) => {
    const letter = letterOf(character.name)
    const last = acc.at(-1)
    if (last?.letter === letter) last.items.push(character)
    else acc.push({ letter, items: [character] })
    return acc
  }, [])

const anchor = (letter: string) =>
  `characters-${letter === '#' ? 'other' : letter.toLowerCase()}`

export function CharacterList() {
  const canSee = useCanSee()
  const met = useMemo(
    () => characters.filter((c) => hasMet(c.id, canSee)),
    [canSee],
  )
  const groups = useMemo(() => byLetter(met), [met])
  const hidden = characters.length - met.length

  return (
    <article className="character-list" aria-labelledby="characters-title">
      <h1 id="characters-title">Characters</h1>
      <p className="character-count">
        {met.length} characters
        {hidden > 0 && ` · ${hidden} hidden based on books you've read`}
      </p>

      <nav aria-label="Jump to letter" className="letter-index">
        {groups.map(({ letter }) => (
          <a key={letter} href={`#${anchor(letter)}`}>
            {letter}
          </a>
        ))}
      </nav>

      {groups.map(({ letter, items }) => (
        <section
          key={letter}
          className="character-group"
          aria-labelledby={anchor(letter)}
        >
          <h2 id={anchor(letter)}>{letter}</h2>
          <ul>
            {items.map((character) => (
              <li key={character.id}>
                <Link to={`/characters/${character.id}`}>{character.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
