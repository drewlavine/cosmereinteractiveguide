import { Link, useParams } from 'react-router'
import { BookList } from '../components/BookList'
import { SpoilerNotice } from '../components/SpoilerNotice'
import { childLocations, findLocation, kindLabels } from '../data/locations'
import { revealLocation, spoilerBooks } from '../data/reveal'
import { useBooksRead } from '../state/booksRead'
import { useCanSee, useShownSystem } from '../state/reveal'
import { HiddenPage } from './HiddenPage'
import { NotFound } from './NotFound'

/** A place on a planet: a nation, city or landmark from its interactive map. */
export function LocationDetail() {
  const { systemId, planetId, locationId } = useParams()
  const { viewAnyway } = useBooksRead()
  const canSee = useCanSee()
  const system = useShownSystem(systemId)
  const planet = system?.planets.find((p) => p.id === planetId)
  const location = findLocation(planetId, locationId)

  if (!system || !location) return <NotFound />
  const showAll = viewAnyway.has(system.id)
  const shown = revealLocation(location, canSee, showAll)
  if (!planet || !shown)
    return (
      <HiddenPage
        systemId={system.id}
        spoilers={spoilerBooks([location.revealedIn])}
      />
    )

  const visible = (id?: string) => {
    const place = findLocation(planet.id, id)
    return place && (showAll || canSee(place.revealedIn)) ? place : undefined
  }
  const parent = visible(location.parentId)
  const children = childLocations(location.id).filter((l) => visible(l.id))
  const href = (id: string) =>
    `/systems/${system.id}/planets/${planet.id}/locations/${id}`
  const [kind] = kindLabels[location.kind]

  return (
    <article
      className="planet-detail location-detail"
      aria-labelledby="location-title"
    >
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/">Star map</Link> /{' '}
        <Link to={`/systems/${system.id}`}>{system.name}</Link> /{' '}
        <Link to={`/systems/${system.id}/planets/${planet.id}`}>
          {planet.name}
        </Link>{' '}
        / <span aria-current="page">{shown.name}</span>
      </nav>

      <SpoilerNotice systemId={system.id} spoilers={shown.spoilers} />

      <p className="location-kind">
        {kind} {parent ? 'in' : 'on'}{' '}
        <Link
          to={
            parent
              ? href(parent.id)
              : `/systems/${system.id}/planets/${planet.id}`
          }
        >
          {parent?.name ?? planet.name}
        </Link>
      </p>
      <h1 id="location-title">{shown.name}</h1>
      {shown.altName && (
        <p className="planet-detail-aka">Also called {shown.altName}</p>
      )}
      {shown.summary && <p>{shown.summary}</p>}
      <dl>
        <BookList label="Stories set here" bookIds={shown.settingOf} />
        <BookList label="Mentioned in" bookIds={shown.mentionedIn} />
        {children.length > 0 && (
          <>
            <dt>Places here</dt>
            <dd>
              <ul className="location-children">
                {children.map((child) => (
                  <li key={child.id}>
                    <Link to={href(child.id)}>{child.name}</Link>
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>
      <a href={shown.coppermindUrl} target="_blank" rel="noreferrer">
        Read more on the Coppermind
      </a>
    </article>
  )
}
