import { Link, useParams } from 'react-router'
import { BookList } from '../components/BookList'
import { SpoilerNotice } from '../components/SpoilerNotice'
import { findCharacter } from '../data/characters'
import { characterDetails } from '../data/characterDetails'
import { revealCharacter } from '../data/reveal'
import { useBooksRead } from '../state/booksRead'
import { useCanSee, useShownSystems } from '../state/reveal'
import { NotFound } from './NotFound'

const coppermindUrl = (page: string) =>
  `https://coppermind.net/wiki/${encodeURIComponent(page.replaceAll(' ', '_'))}`

export function CharacterDetail() {
  const { characterId } = useParams()
  const character = findCharacter(characterId)
  const { viewAnyway } = useBooksRead()
  const canSee = useCanSee()
  const systems = useShownSystems()

  if (!character) return <NotFound />
  const scope = `character:${character.id}`
  const shown = revealCharacter(character.id, canSee, viewAnyway.has(scope))

  // Even the name is a spoiler for a character the reader hasn't met.
  if (!shown.met && !viewAnyway.has(scope))
    return (
      <section className="message-page" aria-labelledby="hidden-title">
        <h1 id="hidden-title">Not met yet</h1>
        <p>You haven’t met this character in the books you’ve read.</p>
        <SpoilerNotice scope={scope} spoilers />
        <Link to="/characters">Back to all characters</Link>
      </section>
    )

  const system = systems.find((s) =>
    s.planets.some((p) => p.id === shown.world),
  )
  const world = system?.planets.find((p) => p.id === shown.world)
  const list = (label: string, items: string[]) =>
    items.length > 0 && (
      <>
        <dt>{label}</dt>
        <dd>{items.join(', ')}</dd>
      </>
    )

  return (
    <article className="character-detail" aria-labelledby="character-title">
      <SpoilerNotice scope={scope} spoilers={shown.spoilers} />
      <h1 id="character-title">{character.name}</h1>
      {shown.aliases.length > 0 && (
        <p className="planet-detail-aka">
          Also known as {shown.aliases.join(', ')}
        </p>
      )}
      {characterDetails[character.id] ? (
        <dl>
          {system && world && (
            <>
              <dt>World</dt>
              <dd>
                <Link to={`/systems/${system.id}/planets/${world.id}`}>
                  {world.name}
                </Link>
              </dd>
            </>
          )}
          {list('Species', shown.species)}
          {list('Abilities', shown.abilities)}
          <BookList label="Appears in" bookIds={shown.appearsIn} />
        </dl>
      ) : (
        <p>Details coming soon.</p>
      )}
      <p>
        <a
          href={coppermindUrl(character.coppermindPage)}
          target="_blank"
          rel="noreferrer"
        >
          Read about {character.name} on the Coppermind
        </a>{' '}
        <span className="spoiler-warning">
          (covers every book, so expect spoilers)
        </span>
      </p>
      <Link to="/characters">Back to all characters</Link>
    </article>
  )
}
