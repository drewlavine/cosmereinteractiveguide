import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { PortraitArt } from '../components/ArtViewer'
import { SourceMark } from '../components/SourceMark'
import { Link, Navigate, useLocation, useParams } from 'react-router'
import {
  PageContents,
  PageSection,
  PageSubsection,
} from '../components/PageSections'
import { slugs } from '../components/pageSlugs'
import { PlanetGlobe } from '../components/PlanetGlobe'
import { TravelMap } from '../components/TravelMap'
import { JourneyPreview } from '../components/journey/JourneyPreview'
import { useJourneyPacks } from '../components/journey/useJourneyPacks'
import { SpoilerNotice } from '../components/SpoilerNotice'
import { useLinkText } from '../components/LinkedText'
import { findBook, seriesOf } from '../data/books'
import { findPerson } from '../data/people'
import { findListed, placeHref, placeRevealedIn } from '../data/listedLocations'
import { characterDetails } from '../data/characterDetails'
import { characterPortraits } from '../data/characterPortraits'
import { cachedStory, hasStory, loadStory } from '../data/characterStories'
import { journeyAtlas, journeyMapPlanet } from '../data/journeyAtlas'
import { historyParagraphFor } from '../data/historyMatch'
import { journeyIndex } from '../data/journeyIndex'
import { chapterLabel } from '../data/progress'
import {
  findPersona,
  hasMet,
  revealCharacter,
  journeyByWorld,
  journeyIds,
  revealCharacterJourney,
  revealCharacterTravels,
  revealPortrait,
  revealStory,
  type ShownJourneyStop,
} from '../data/reveal'
import { useBooksRead } from '../state/booksRead'
import { useCanSee, useShownSystems } from '../state/reveal'
import { NotFound } from './NotFound'

/** A section of a character page. */
interface Part {
  id: string
  title: string
  className?: string
  show: boolean
  body: ReactNode
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
  const { hash } = useLocation()
  const character = findPerson(characterId)
  const persona = findPersona(characterId)
  const { viewAnyway } = useBooksRead()
  const canSee = useCanSee()
  const systems = useShownSystems()
  const prose = useStory(persona?.characterId ?? character?.id)
  const journeyPacks = useJourneyPacks(
    journeyIndex,
    character ? journeyIds(character.id, canSee) : [],
  )
  // Only phones collapse the key facts (see the stylesheet).
  const [factsOpen, setFactsOpen] = useState(false)
  const selfKey = `character:${persona?.characterId ?? character?.id}`
  const link = useLinkText(selfKey)

  if (!character) return <NotFound />
  // Once the reader can tell who a persona is, it's the character's page.
  if (persona && canSee(persona.identityRevealedIn))
    return (
      <Navigate
        to={{
          pathname: `/characters/${persona.characterId}`,
          hash: tab ?? hash,
        }}
        replace
      />
    )
  // The page was once split into tabs, each at its own URL; those now open
  // the one page at that section, if it's there.
  if (tab)
    return (
      <Navigate
        to={{ pathname: `/characters/${character.id}`, hash: tab }}
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
        <p>Not met yet based on what you’ve read so far.</p>
        <SpoilerNotice scope={scope} spoilers />
        <Link to="/characters">Back to all characters</Link>
      </section>
    )

  // Brief, as each story is a small local file; waiting keeps the page (and
  // its Contents) from jumping as the story arrives.
  if (prose.loading || journeyPacks.loading)
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
  const travels = revealCharacterTravels(
    character.id,
    canSee,
    viewAnyway.has(scope),
  )
  const journey = revealCharacterJourney(
    character.id,
    journeyPacks.packs.flatMap((p) => p.events),
    journeyAtlas,
    canSee,
    {
      viewAnyway: viewAnyway.has(scope),
      credits: journeyPacks.packs.flatMap((p) => p.credits),
    },
  )
  const worldJourneys = journeyByWorld(journey, journeyMapPlanet)
  const system = systems.find((s) =>
    s.planets.some((p) => p.id === shown.world),
  )
  const world = system?.planets.find((p) => p.id === shown.world)
  const fact = (label: string, items: string[]) =>
    items.length > 0 && (
      <>
        <dt>{label}</dt>
        <dd>
          {items.map((item, i) => (
            <Fragment key={item}>
              {i > 0 && ', '}
              {link(item)}
            </Fragment>
          ))}
        </dd>
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

  // A birthplace links to its page once the reader may see the place.
  const birthplace = (() => {
    const place = findListed(shown.born?.placeId)
    if (!place) return undefined
    const planetShown = (id: string) =>
      systems.some((s) => s.planets.some((p) => p.id === id))
    return {
      name: place.name,
      href: canSee(placeRevealedIn(place))
        ? placeHref(place, planetShown)
        : undefined,
    }
  })()
  const historyIds = slugs(
    'history',
    story.history.map((h) => h.title ?? ''),
  )
  const paragraphs = story.history.flatMap(({ items }, i) =>
    items.map(({ books }, j) => ({ id: `history-${i}-${j}`, books })),
  )
  const more = (where: ShownJourneyStop['where']) =>
    historyParagraphFor(where, paragraphs)
  const description = (
    [
      ['Appearance', story.appearance],
      ['Personality', story.personality],
    ] as const
  ).filter(([, items]) => items.length > 0)

  const parts: Part[] = [
    {
      id: 'travels',
      title: 'Travels',
      show: travels.stops.length > 0,
      body: (
        <>
          <TravelMap
            characterId={character.id}
            name={character.name}
            worldJourneys={worldJourneys}
            selfKey={selfKey}
            more={more}
            stops={travels.stops}
            systems={systems}
          />
        </>
      ),
    },
    {
      id: 'journey',
      title: 'Journey',
      className: 'character-journey',
      // A world-hopper's journeys open from their travels, world by world.
      show: journey.stops.length > 0 && travels.stops.length === 0,
      body: (
        <JourneyPreview
          name={character.name}
          journey={journey}
          selfKey={selfKey}
          more={more}
        />
      ),
    },
    {
      id: 'history',
      title: 'History',
      className: 'character-story',
      show: story.history.length > 0,
      body: (
        <>
          {story.history.map(({ title, items }, i) => {
            const linked = new Set<string>()
            const paragraphs = items.map(({ text, books }, j) => (
              <p key={text} id={`history-${i}-${j}`}>
                {link(text, linked)}
                <SourceMark books={books} />
              </p>
            ))
            return title ? (
              <PageSubsection
                key={historyIds[i]}
                id={historyIds[i]}
                title={title}
              >
                {paragraphs}
              </PageSubsection>
            ) : (
              <Fragment key={`untitled-${i}`}>{paragraphs}</Fragment>
            )
          })}
        </>
      ),
    },
    {
      id: 'description',
      title: 'Description',
      className: 'character-story',
      show: description.length > 0,
      body: (
        <>
          {description.map(([heading, items]) => {
            const linked = new Set<string>()
            return (
              <PageSubsection
                key={heading}
                id={`description-${heading.toLowerCase()}`}
                title={heading}
              >
                {items.map((text) => (
                  <p key={text}>{link(text, linked)}</p>
                ))}
              </PageSubsection>
            )
          })}
        </>
      ),
    },
    {
      id: 'appearances',
      title: 'Appearances',
      show: shown.appearsIn.length > 0,
      body: (
        <>
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
        </>
      ),
    },
  ].filter((p) => p.show)
  const anySection = parts.length > 0

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
        {shown.age && (
          <>
            <dt>Age</dt>
            <dd>
              {shown.age.name}{' '}
              <span className="fact-note">
                in <cite>{findBook(shown.age.bookId)?.title}</cite>
              </span>
              <SourceMark sources={shown.age.sources} />
            </dd>
          </>
        )}
        {fact('Species', shown.species)}
        {fact('Nationality', shown.nationality)}
        {fact('Profession', shown.profession)}
        {fact('Abilities', shown.abilities)}
        {fact('Groups', shown.groups)}
        {fact('Bonded with', shown.bonds)}
        {shown.born && (
          <>
            <dt>Born</dt>
            <dd>
              {shown.born.name}
              {birthplace && (
                <>
                  {shown.born.name && ', '}
                  {birthplace.href ? (
                    <Link to={birthplace.href}>{birthplace.name}</Link>
                  ) : (
                    birthplace.name
                  )}
                </>
              )}
              {/* One mark for the line, saying which source backs which part. */}
              <SourceMark
                parts={[
                  ...(shown.born.name
                    ? [{ about: 'date', sources: shown.born.sources }]
                    : []),
                  ...(birthplace
                    ? [{ about: 'place', books: shown.born.placeBooks }]
                    : []),
                ].filter((p) => p.sources?.length || p.books?.length)}
              />
            </dd>
          </>
        )}
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
      {story.intro && <p className="character-intro">{link(story.intro)}</p>}
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
          shown.spoilers ||
          story.spoilers ||
          art.spoilers ||
          travels.spoilers ||
          journey.spoilers
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
              <PortraitArt
                src={art.portrait.src}
                alt={art.portrait.alt}
                artist={art.portrait.artist}
                artistUrl={art.portrait.artistUrl}
              />
            )}
            {infobox}
          </div>
          <div className="character-main">
            {!anySection ? (
              <p>Nothing to show yet based on what you’ve read so far.</p>
            ) : (
              parts.map((p) => (
                <PageSection
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  className={p.className}
                >
                  {p.body}
                </PageSection>
              ))
            )}
          </div>
          {anySection && <PageContents />}
        </div>
      )}
    </article>
  )
}
