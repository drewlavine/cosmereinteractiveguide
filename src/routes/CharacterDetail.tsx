import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { PlanetGlobe } from '../components/PlanetGlobe'
import { SpoilerNotice } from '../components/SpoilerNotice'
import { findBook, seriesOf } from '../data/books'
import { findPerson } from '../data/people'
import { characterDetails } from '../data/characterDetails'
import { characterPortraits } from '../data/characterPortraits'
import { cachedStory, hasStory, loadStory } from '../data/characterStories'
import { chapterLabel } from '../data/progress'
import {
  findPersona,
  hasMet,
  revealCharacter,
  revealPortrait,
  revealStory,
} from '../data/reveal'
import { useBooksRead } from '../state/booksRead'
import { useCanSee, useShownSystems } from '../state/reveal'
import { NotFound } from './NotFound'

interface CharacterTab {
  id: string
  label: string
  content: ReactNode
}

/** Headings for family ties, in the order they're listed. */
const relationLabels: Record<string, string> = {
  parent: 'Parents',
  sibling: 'Siblings',
  spouse: 'Spouse',
  child: 'Children',
  relative: 'Other relatives',
  ancestor: 'Ancestors',
}

const relationLabel = (relation: string) =>
  relationLabels[relation] ??
  relation.charAt(0).toUpperCase() + relation.slice(1)

const coppermindUrl = (page: string) =>
  `https://coppermind.net/wiki/${encodeURIComponent(page.replaceAll(' ', '_'))}`

/** A character's story, loaded on demand; `loading` until it arrives. */
function useStory(id: string | undefined) {
  const [, setLoaded] = useState<string>()
  const story = id ? cachedStory(id) : undefined
  useEffect(() => {
    let live = true
    if (id && !cachedStory(id))
      void loadStory(id).then(() => live && setLoaded(id))
    return () => {
      live = false
    }
  }, [id])
  return { story, loading: !!id && hasStory(id) && !story }
}

export function CharacterDetail() {
  const { characterId, tab } = useParams()
  const character = findPerson(characterId)
  const persona = findPersona(characterId)
  const { viewAnyway } = useBooksRead()
  const canSee = useCanSee()
  const systems = useShownSystems()
  const prose = useStory(persona?.characterId ?? character?.id)

  if (!character) return <NotFound />
  // Once the reader can tell who a persona is, it's the character's page.
  if (persona && canSee(persona.identityRevealedIn))
    return (
      <Navigate
        to={`/characters/${persona.characterId}${tab ? `/${tab}` : ''}`}
        replace
      />
    )
  const details = characterDetails[persona?.characterId ?? character.id]
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

  // Brief, as each story is a small local file; waiting avoids the tabs
  // jumping, and an existing tab being taken for an unknown one.
  if (prose.loading)
    return <article className="character-detail" aria-busy="true" />

  const story = revealStory(
    character.id,
    prose.story,
    canSee,
    viewAnyway.has(scope),
  )
  const art = revealPortrait(
    characterPortraits[character.id],
    canSee,
    viewAnyway.has(scope),
  )
  const system = systems.find((s) =>
    s.planets.some((p) => p.id === shown.world),
  )
  const world = system?.planets.find((p) => p.id === shown.world)
  const fact = (label: string, items: string[]) =>
    items.length > 0 && (
      <>
        <dt>{label}</dt>
        <dd>{items.join(', ')}</dd>
      </>
    )
  const first = shown.appearsIn[0]
  const firstChapter =
    first?.chapter && chapterLabel(first.bookId, first.chapter)

  const relationOrder = Object.keys(relationLabels)
  const relations = [...new Set(shown.relatives.map((r) => r.relation))].sort(
    (a, b) =>
      (relationOrder.indexOf(a) + 1 || 99) -
      (relationOrder.indexOf(b) + 1 || 99),
  )

  const tabs: CharacterTab[] = details
    ? [
        story.history
          ? {
              id: 'history',
              label: 'History',
              content: story.history.length > 0 && (
                <div className="character-story">
                  {story.history.map(({ title, items }, i) => (
                    <section key={`${title}-${i}`}>
                      {title && <h2>{title}</h2>}
                      {items.map(({ text, books }) => (
                        <p key={text}>
                          {text}{' '}
                          <span className="character-story-source">
                            {books.map((bookId, j) => (
                              <Fragment key={bookId}>
                                {j > 0 && ', '}
                                <Link to={`/books/${bookId}`}>
                                  <cite>
                                    {findBook(bookId)?.title ?? bookId}
                                  </cite>
                                </Link>
                              </Fragment>
                            ))}
                          </span>
                        </p>
                      ))}
                    </section>
                  ))}
                </div>
              ),
            }
          : {
              id: 'story',
              label: 'Story',
              content: story.story.length > 0 && (
                <div className="character-story">
                  {story.story.map(({ bookId, items }, i) => (
                    <section key={`${bookId}-${i}`}>
                      <h2>
                        <Link to={`/books/${bookId}`}>
                          <cite>{findBook(bookId)?.title ?? bookId}</cite>
                        </Link>
                      </h2>
                      {items.map((text) => (
                        <p key={text}>{text}</p>
                      ))}
                    </section>
                  ))}
                </div>
              ),
            },
        {
          id: 'personality',
          label: 'Personality',
          content: story.personality.length > 0 && (
            <div className="character-story">
              {story.personality.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          ),
        },
        {
          id: 'relationships',
          label: 'Relationships',
          content: relations.length > 0 && (
            <dl className="character-relations">
              {relations.map((relation) => (
                <div key={relation}>
                  <dt>{relationLabel(relation)}</dt>
                  <dd>
                    <ul className="character-relatives">
                      {shown.relatives
                        .filter((r) => r.relation === relation)
                        .map((r) => (
                          <li key={r.name}>
                            {/* An unmet relative's page would only say "not met yet". */}
                            {r.characterId && hasMet(r.characterId, canSee) ? (
                              <Link to={`/characters/${r.characterId}`}>
                                {r.name}
                              </Link>
                            ) : (
                              r.name
                            )}
                          </li>
                        ))}
                    </ul>
                  </dd>
                </div>
              ))}
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

  const infobox = details && (
    <aside className="character-infobox" aria-label="Key facts">
      {system && world && (
        <Link
          to={`/systems/${system.id}/planets/${world.id}`}
          className="character-infobox-world"
          aria-hidden
          tabIndex={-1}
        >
          <svg viewBox="-60 -60 120 120" aria-hidden>
            <PlanetGlobe planet={world} cx={0} cy={0} r={48} />
          </svg>
        </Link>
      )}
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
        {fact('Species', shown.species)}
        {fact('Nationality', shown.nationality)}
        {fact('Profession', shown.profession)}
        {fact('Abilities', shown.abilities)}
        {fact('Groups', shown.groups)}
        {fact('Bonded with', shown.bonds)}
        {first && (
          <>
            <dt>First appears</dt>
            <dd>
              <Link to={`/books/${first.bookId}`}>
                <cite>{findBook(first.bookId)?.title ?? first.bookId}</cite>
              </Link>
              {firstChapter && `, ${firstChapter}`}
            </dd>
          </>
        )}
      </dl>
      <p className="character-infobox-source">
        <a
          href={coppermindUrl(character.coppermindPage)}
          target="_blank"
          rel="noreferrer"
        >
          {character.name} on the Coppermind
        </a>
        <span className="spoiler-warning">
          {' '}
          (covers every book, so expect spoilers)
        </span>
      </p>
    </aside>
  )

  const header = (
    <header className="character-header">
      <h1 id="character-title">{character.name}</h1>
      {shown.personas.map(({ name, books }) => (
        <p key={name} className="character-persona">
          Known as <strong>{name}</strong> in{' '}
          {[...new Set(books.map((b) => seriesOf(b)?.name ?? b))].map(
            (series, i) => (
              <span key={series}>
                {i > 0 && ', '}
                <cite>{series}</cite>
              </span>
            ),
          )}
        </p>
      ))}
      {shown.aliases.length > 0 && (
        <p className="planet-detail-aka">
          Also known as {shown.aliases.join(', ')}
        </p>
      )}
      {story.intro && <p className="character-intro">{story.intro}</p>}
    </header>
  )

  return (
    <article className="character-detail" aria-labelledby="character-title">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/characters">Characters</Link> /{' '}
        <span aria-current="page">{character.name}</span>
      </nav>
      <SpoilerNotice
        scope={scope}
        spoilers={shown.spoilers || story.spoilers || art.spoilers}
      />
      {!details && header}
      {!details ? (
        <>
          <p>Details coming soon.</p>
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
        </>
      ) : (
        <div className="character-body">
          {header}
          <div className="character-side">
            {art.portrait && (
              <figure className="character-portrait">
                <img src={art.portrait.src} alt={art.portrait.alt} />
                <figcaption>
                  Art by{' '}
                  {art.portrait.artistUrl ? (
                    <a
                      href={art.portrait.artistUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {art.portrait.artist}
                    </a>
                  ) : (
                    art.portrait.artist
                  )}
                </figcaption>
              </figure>
            )}
            {infobox}
          </div>
          <div className="character-main">
            {active ? (
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
                          className={
                            t === active ? 'main-tab is-active' : 'main-tab'
                          }
                          aria-current={t === active ? 'page' : undefined}
                          preventScrollReset
                        >
                          {t.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <section
                  className="character-tab-panel"
                  aria-label={active.label}
                >
                  {active.content}
                </section>
              </>
            ) : (
              <p>Nothing to show yet for the books you’ve read.</p>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
