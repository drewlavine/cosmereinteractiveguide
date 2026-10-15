import { Link, useParams } from 'react-router'
import { findCharacter } from '../data/characters'
import { NotFound } from './NotFound'

const coppermindUrl = (page: string) =>
  `https://coppermind.net/wiki/${encodeURIComponent(page.replaceAll(' ', '_'))}`

export function CharacterDetail() {
  const { characterId } = useParams()
  const character = findCharacter(characterId)

  if (!character) return <NotFound />

  return (
    <article className="character-detail" aria-labelledby="character-title">
      <h1 id="character-title">{character.name}</h1>
      <p>Details coming soon.</p>
      <p>
        <a
          href={coppermindUrl(character.coppermindPage)}
          target="_blank"
          rel="noreferrer"
        >
          Read about {character.name} on the Coppermind
        </a>
      </p>
      <Link to="/characters">Back to all characters</Link>
    </article>
  )
}
