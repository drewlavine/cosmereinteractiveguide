import type { ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { SpoilerNotice } from '../components/SpoilerNotice'
import { findBook } from '../data/books'
import { findCharacter } from '../data/characters'
import { characterDetails } from '../data/characterDetails'
import { chapterLabel } from '../data/progress'
import { revealCharacter } from '../data/reveal'
import { useBooksRead } from '../state/booksRead'
import { useCanSee, useShownSystems } from '../state/reveal'
import { NotFound } from './NotFound'

interface CharacterTab {
  id: string
  label: string
  content: ReactNode
}

const coppermindUrl = (page: string) =>
  `https://coppermind.net/wiki/${encodeURIComponent(page.replaceAll(' ', '_'))}`

export function CharacterDetail() {
  const { characterId, tab } = useParams()
  const character = findCharacter(characterId)
  const { viewAnyway } = useBooksRead()
  const canSee = useCanSee()
  const systems = useShownSystems()

  if (!character) return <NotFound />
  const scope = `character:${character.id}`
  const shown = revealCharacter(character.id, canSee, viewAnyway.has(scope))

  // Unmet characters are only reached by name (search or URL), so the name
  // is known, but nothing else is shown.
  if (!shown.met && !viewAnyway.has(scope))
    return (
      <section className="message-page" aria-labelledby="hidden-title">
        <h1 id="hidden-title">{character.name}</h1>
        <p>Not met yet in the books you’ve read.</p>
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

  const tabs: CharacterTab[] = characterDetails[character.id]
    ? [
        {
          id: 'overview',
          label: 'Overview',
          content: ((system && world) ||
            shown.species.length > 0 ||
            shown.abilities.length > 0) && (
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
            </dl>
          ),
        },
        {
          id: 'appearances',
          label: 'Appearances',
          content: shown.appearsIn.length > 0 && (
            <ul className="character-appearances">
              {shown.appearsIn.map(({ bookId, chapter }) => {
                const label = chapter && chapterLabel(bookId, chapter)
                return (
                  <li key={bookId}>
                    <Link to={`/books/${bookId}`}>
                      <cite>{findBook(bookId)?.title ?? bookId}</cite>
                    </Link>
                    {label && (
                      <span className="character-first-chapter">
                        {' '}
                        · first appears in {label}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          ),
        },
      ].filter((t) => t.content)
    : []

  // Tabs with nothing to show are left out, and their URLs go to the first
  // tab, so a hidden tab looks the same as one that doesn't exist.
  const active = tab ? tabs.find((t) => t.id === tab) : tabs[0]
  if (tab && !active)
    return <Navigate to={`/characters/${character.id}`} replace />

  return (
    <article className="character-detail" aria-labelledby="character-title">
      <SpoilerNotice scope={scope} spoilers={shown.spoilers} />
      <h1 id="character-title">{character.name}</h1>
      {shown.aliases.length > 0 && (
        <p className="planet-detail-aka">
          Also known as {shown.aliases.join(', ')}
        </p>
      )}
      {!characterDetails[character.id] ? (
        <p>Details coming soon.</p>
      ) : active ? (
        <>
          <nav
            className="character-tabs"
            aria-label={`About ${character.name}`}
          >
            <ul>
              {tabs.map((t) => (
                <li key={t.id}>
                  <Link
                    to={
                      t === tabs[0]
                        ? `/characters/${character.id}`
                        : `/characters/${character.id}/${t.id}`
                    }
                    className={t === active ? 'main-tab is-active' : 'main-tab'}
                    aria-current={t === active ? 'page' : undefined}
                    preventScrollReset
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <section className="character-tab-panel" aria-label={active.label}>
            {active.content}
          </section>
        </>
      ) : (
        <p>Nothing to show yet for the books you’ve read.</p>
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
