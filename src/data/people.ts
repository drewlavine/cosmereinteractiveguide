import { characters, findCharacter } from './characters'
import { findPersona, personas } from './reveal'
import type { Character } from './types'

/**
 * Every character, plus the other names some go by in other books (see
 * Persona), sorted by name.
 */
export const people: Character[] = [...characters]
for (const { id, name, coppermindPage } of personas) {
  const at = people.findIndex((c) => c.name.localeCompare(name) > 0)
  people.splice(at < 0 ? people.length : at, 0, { id, name, coppermindPage })
}

/** A character or persona by id. */
export const findPerson = (id?: string): Character | undefined =>
  findCharacter(id) ?? findPersona(id)
