import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { findBook } from '../data/books'
import { locationDetails } from '../data/locationDetails'
import {
  cachedLocationStory,
  hasLocationStory,
  loadLocationStory,
} from '../data/locationStories'
import {
  findListed,
  listedLocations,
  placeHref,
  placeRevealedIn,
} from '../data/listedLocations'
import { findPerson } from '../data/people'
import {
  revealLocationDetails,
  revealLocationStory,
  type ShownLocationDetails,
} from '../data/reveal'
import type { ListedLocation, LocationPerson } from '../data/types'
import { useCanSee, useShownSystems } from '../state/reveal'
import { PageContents, PageSection, PageSubsection } from './PageSections'
import { slugs } from './pageSlugs'
import { LocationMaps } from './LocationMaps'
import { SpoilerNotice } from './SpoilerNotice'

const listedByName = new Map<string, ListedLocation | null>()
for (const l of listedLocations)
  listedByName.set(l.name, listedByName.has(l.name) ? null : l)
/** The only listed place with this name, if just one. */
const byName = (name: string) => listedByName.get(name) ?? undefined

const relationLabels: Record<LocationPerson['relation'], string> = {
  resident: 'resident',
  born: 'born here',
  citizen: 'citizen',
}

/** A place's story, loaded on demand; `loading` until it arrives. */
function useLocationStory(id: string) {
  const [, setLoaded] = useState<string>()
  const story = cachedLocationStory(id)
  useEffect(() => {
    let live = true
    if (!cachedLocationStory(id))
      void loadLocationStory(id).then(() => live && setLoaded(id))
    return () => {
      live = false
    }
  }, [id])
  return { story, loading: hasLocationStory(id) && !story }
}

export interface Crumb {
  name: string
  href: string
}

/**
 * Every place page sits under the Locations tab, so its trail is
 * Locations / world / parent places / the place, however the reader got
 * there.
 */
export function PlaceBreadcrumb({
  trail,
  current,
}: {
  trail: Crumb[]
  current: string
}) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <Link to="/locations">Locations</Link> /{' '}
      {trail.map((crumb) => (
        <Fragment key={crumb.href}>
          <Link to={crumb.href}>{crumb.name}</Link> /{' '}
        </Fragment>
      ))}
      <span aria-current="page">{current}</span>
    </nav>
  )
}

export interface PlacePageProps {
  id: string
  name: string
  altName?: string
  /** What "Show anyway" covers (see SpoilerNotice). */
  scope: string
  showAll: boolean
  breadcrumb: ReactNode
  /** e.g. "City"; shown as Key facts' Type row. */
  kind: string
  /** The place it's in, if the reader can see it. */
  parent?: Crumb
  /** Intro when the place has no story yet. */
  summary?: string
  /** Whether the caller hid anything of its own. */
  spoilers: boolean
  /** Planet id when the place is on its maps. */
  planetId?: string
  /** World line at the top of Key facts. */
  world?: { name: string; href: string }
  /** More Key facts rows (dt/dd pairs). */
  extraFacts?: ReactNode
  coppermindUrl: string
}

/**
 * A place's page: Key facts beside its intro, description, history, people
 * and maps, each trimmed to the reader's books. Map places and listed places
 * share it.
 */
export function PlacePage(props: PlacePageProps) {
  const { id, name, scope, showAll } = props
  const canSee = useCanSee()
  const systems = useShownSystems()
  const prose = useLocationStory(id)
  const [factsOpen, setFactsOpen] = useState(false)

  if (prose.loading)
    return <article className="character-detail place-page" aria-busy="true" />

  const planetShown = (planetId: string) =>
    systems.some((s) => s.planets.some((p) => p.id === planetId))
  const placeShown = (placeId: string) => {
    const l = findListed(placeId)
    return !!l && canSee(placeRevealedIn(l))
  }
  const story = revealLocationStory(prose.story, canSee, showAll)
  const details = revealLocationDetails(
    locationDetails[id],
    canSee,
    placeShown,
    showAll,
  )
  const intro = story.intro ?? props.summary

  const value = (
    v: ShownLocationDetails['facts'][number]['values'][number],
  ) => {
    // Some values name a map place the Coppermind has no page for.
    const place =
      findListed(v.placeId) ?? (!v.characterId ? byName(v.name) : undefined)
    if (place && (showAll || placeShown(place.id)))
      return <Link to={placeHref(place, planetShown)}>{v.name}</Link>
    if (v.characterId && findPerson(v.characterId))
      return <Link to={`/characters/${v.characterId}`}>{v.name}</Link>
    return v.name
  }

  const historyIds = slugs(
    'history',
    story.history.map((h) => h.title ?? ''),
  )

  const people = details.people
    .map((p) => ({ ...p, name: findPerson(p.characterId)?.name }))
    .filter((p): p is typeof p & { name: string } => !!p.name)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <article
      className="character-detail location-detail place-page"
      aria-labelledby="location-title"
    >
      {props.breadcrumb}
      <SpoilerNotice
        scope={scope}
        spoilers={props.spoilers || story.spoilers || details.spoilers}
      />
      <div className="character-body">
        <header className="character-header">
          <h1 id="location-title">{name}</h1>
          {props.altName && (
            <p className="planet-detail-aka">Also called {props.altName}</p>
          )}
          {intro && <p className="character-intro">{intro}</p>}
        </header>
        <div className="character-side">
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
            <dl>
              {!details.facts.some((f) => f.label === 'Type') && (
                <>
                  <dt>Type</dt>
                  <dd>{props.kind}</dd>
                </>
              )}
              {props.world && (
                <>
                  <dt>World</dt>
                  <dd>
                    <Link to={props.world.href}>{props.world.name}</Link>
                  </dd>
                </>
              )}
              {props.parent &&
                props.parent.name !== props.world?.name &&
                !details.facts.some((f) =>
                  f.values.some((v) => v.name === props.parent?.name),
                ) && (
                  <>
                    <dt>Located in</dt>
                    <dd>
                      <Link to={props.parent.href}>{props.parent.name}</Link>
                    </dd>
                  </>
                )}
              {details.facts.map(({ label, values }) => (
                <Fragment key={label}>
                  <dt>{label}</dt>
                  <dd>
                    {values.map((v, i) => (
                      <Fragment key={v.name}>
                        {i > 0 && ', '}
                        {value(v)}
                      </Fragment>
                    ))}
                  </dd>
                </Fragment>
              ))}
              {props.extraFacts}
            </dl>
            <p className="character-infobox-source">
              <a href={props.coppermindUrl} target="_blank" rel="noreferrer">
                {name} on the Coppermind
              </a>
              <span className="spoiler-warning">
                {' '}
                (covers every book, so expect spoilers)
              </span>
            </p>
          </aside>
        </div>
        <div className="character-main character-story">
          {story.description.length > 0 && (
            <PageSection id="about" title="About">
              {story.description.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </PageSection>
          )}
          {story.history.length > 0 && (
            <PageSection id="history" title="History">
              {story.history.map(({ title, items }, i) => {
                const paragraphs = items.map(({ text, books }) => (
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
            </PageSection>
          )}
          {people.length > 0 && (
            <PageSection id="people" title="People">
              <ul className="place-people">
                {people.map((p) => (
                  <li key={p.characterId}>
                    <Link to={`/characters/${p.characterId}`}>{p.name}</Link>{' '}
                    <span className="place-people-tie">
                      {p.relations.map((r) => relationLabels[r]).join(', ')}
                    </span>
                  </li>
                ))}
              </ul>
            </PageSection>
          )}
          {props.planetId && (
            <LocationMaps
              planetId={props.planetId}
              locationId={id}
              name={name}
              showAll={showAll}
            />
          )}
        </div>
        <PageContents />
      </div>
    </article>
  )
}
