import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { PlanetGlobe } from '../components/PlanetGlobe'
import { TravelMap } from '../components/TravelMap'
import { SpoilerNotice } from '../components/SpoilerNotice'
import { findBook, seriesOf } from '../data/books'
import { findPerson } from '../data/people'
import { characterDetails } from '../data/characterDetails'
import { characterPortraits } from '../data/characterPortraits'
import { cachedStory, hasStory, loadStory } from '../data/characterStories'
import { chapterLabel } from '../data/progress'
import { characterTravels } from '../data/travels'
import {
  findPersona,
  hasMet,
  revealCharacter,
  revealPortrait,
  revealStory,
  revealTravels,
} from '../data/reveal'
import { useBooksRead } from '../state/booksRead'
import { useCanSee, useShownSystems } from '../state/reveal'
import { NotFound } from './NotFound'

interface CharacterTab {
  id: string
  label: string
  content: ReactNode
}

/**
 * Close family shown in the key facts, in order, as [one, several]. More
 * distant relatives are left to the Coppermind.
 */
const familyLabels: [string, [string, string]][] = [
  ['parent', ['Parent', 'Parents']],
  ['sibling', ['Sibling', 'Siblings']],
  ['spouse', ['Spouse', 'Spouses']],
  ['child', ['Child', 'Children']],
]

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
  // Only phones collapse the key facts (see the stylesheet).
  const [factsOpen, setFactsOpen] = useState(false)

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
  const travels = revealTravels(
    character.id,
    characterTravels[persona?.characterId ?? character.id],
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

  const family = familyLabels.flatMap(([relation, [one, several]]) => {
    const people = shown.relatives.filter((r) => r.relation === relation)
    return people.length > 0
      ? [{ relation, label: people.length > 1 ? several : one, people }]
      : []
  })

  const tabs: CharacterTab[] = details
    ? [
        {
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
                              <cite>{findBook(bookId)?.title ?? bookId}</cite>
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
        },
        {
          id: 'description',
          label: 'Description',
          content: (story.appearance.length > 0 ||
            story.personality.length > 0) && (
            <div className="character-story">
              {(
                [
                  ['Appearance', story.appearance],
                  ['Personality', story.personality],
                ] as const
              ).map(
                ([heading, items]) =>
                  items.length > 0 && (
                    <section key={heading}>
                      <h2>{heading}</h2>
                      {items.map((text) => (
                        <p key={text}>{text}</p>
                      ))}
                    </section>
                  ),
              )}
            </div>
          ),
        },
        {
          id: 'travels',
          label: 'Travels',
          content: travels.stops.length > 0 && (
            <TravelMap
              characterId={character.id}
              stops={travels.stops}
              systems={systems}
            />
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
    <aside
      className={`character-infobox${factsOpen ? '' : ' collapsed'}`}
      aria-label="Key facts"
    >
      <button
        type="button"
        className="character-infobox-toggle"
        aria-expanded={factsOpen}
        onClick={() => setFactsOpen((open) => !open)}
      >
        Key facts
      </button>
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
        {family.map(({ relation, label, people }) => (
          <Fragment key={relation}>
            <dt>{label}</dt>
            <dd>
              {people.map((r, i) => (
                <Fragment key={r.name}>
                  {i > 0 && ', '}
                  {/* An unmet relative's page would only say "not met yet". */}
                  {r.characterId && hasMet(r.characterId, canSee) ? (
                    <Link to={`/characters/${r.characterId}`}>{r.name}</Link>
                  ) : (
                    r.name
                  )}
                </Fragment>
              ))}
            </dd>
          </Fragment>
        ))}
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
          {[
            ...new Set(
              books.map((b) => {
                const series = seriesOf(b)
                // A standalone is named by its own title, not "Standalones".
                return series?.id === 'standalones'
                  ? (findBook(b)?.title ?? b)
                  : (series?.name ?? b)
              }),
            ),
          ].map((series, i) => (
            <span key={series}>
              {i > 0 && ', '}
              <cite>{series}</cite>
            </span>
          ))}
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
        spoilers={
          shown.spoilers || story.spoilers || art.spoilers || travels.spoilers
        }
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
