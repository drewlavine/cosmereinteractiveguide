import { Link, Navigate, useParams } from 'react-router'
import { BookList } from '../components/BookList'
import { PlaceBreadcrumb, PlacePage } from '../components/PlacePage'
import { ancestorTrail } from '../data/ancestors'
import { SpoilerNotice } from '../components/SpoilerNotice'
import {
  findListed,
  listedKindNames,
  listedLocations,
  placeHref,
  placeRevealedIn,
  systemOfPlanet,
} from '../data/listedLocations'
import { useBooksRead } from '../state/booksRead'
import { useCanSee, useShownSystems } from '../state/reveal'
import { NotFound } from './NotFound'

const coppermindUrl = (page: string) =>
  `https://coppermind.net/wiki/${encodeURIComponent(page.replaceAll(' ', '_'))}`

/**
 * A place from the Locations list without a map page of its own; places
 * with one (and planets) go to that page instead.
 */
export function ListedLocationDetail() {
  const { locationId } = useParams()
  const { viewAnyway } = useBooksRead()
  const canSee = useCanSee()
  const systems = useShownSystems()
  const place = findListed(locationId)
  if (!place) return <NotFound />

  const planetShown = (id: string) =>
    systems.some((s) => s.planets.some((p) => p.id === id))
  const href = placeHref(place, planetShown)
  if (href !== `/locations/${place.id}`) return <Navigate to={href} replace />

  const system = place.world ? systemOfPlanet.get(place.world) : undefined
  const scope = system?.id ?? `location:${place.id}`
  const showAll = viewAnyway.has(scope)
  if (!showAll && !canSee(placeRevealedIn(place)))
    return (
      <section className="message-page" aria-labelledby="hidden-title">
        <h1 id="hidden-title">Not reached yet</h1>
        <p>Your Books Read don’t reach this place yet.</p>
        <SpoilerNotice scope={scope} spoilers />
        <Link to="/locations">Back to all locations</Link>
      </section>
    )

  const shownPlace = (id?: string) => {
    const l = findListed(id)
    return l && (showAll || canSee(placeRevealedIn(l))) ? l : undefined
  }
  const parent = shownPlace(place.parentId)
  const planet = systems
    .flatMap((s) => s.planets)
    .find((p) => p.id === place.world)
  const world = planet &&
    system && {
      name: planet.name,
      href: `/systems/${system.id}/planets/${planet.id}`,
    }
  const children = listedLocations.filter(
    (l) => l.parentId === place.id && shownPlace(l.id),
  )
  const books = place.books.filter((b) => canSee([b]))
  const kind = listedKindNames[place.kind]

  return (
    <PlacePage
      id={place.id}
      name={place.name}
      scope={scope}
      showAll={showAll}
      spoilers={books.length < place.books.length}
      breadcrumb={
        <PlaceBreadcrumb
          trail={[
            ...(world ? [world] : []),
            ...ancestorTrail(place, shownPlace)
              .filter((p) => !world || p.id !== place.world)
              .map((p) => ({ name: p.name, href: placeHref(p, planetShown) })),
          ]}
          current={place.name}
        />
      }
      kind={kind}
      parent={
        parent && { name: parent.name, href: placeHref(parent, planetShown) }
      }
      world={world || undefined}
      extraFacts={
        <>
          <BookList label="Appears in" bookIds={books} />
          {children.length > 0 && (
            <>
              <dt>Places here</dt>
              <dd>
                <ul className="location-children">
                  {children.map((child) => (
                    <li key={child.id}>
                      <Link to={placeHref(child, planetShown)}>
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}
        </>
      }
      coppermindUrl={coppermindUrl(place.coppermindPage)}
    />
  )
}
