import { Link, useParams } from 'react-router'
import { BookList } from '../components/BookList'
import { PlaceBreadcrumb, PlacePage } from '../components/PlacePage'
import { ancestorTrail } from '../data/ancestors'
import { childLocations, findLocation, kindLabels } from '../data/locations'
import { revealLocation } from '../data/reveal'
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
  if (!planet || !shown) return <HiddenPage systemId={system.id} />

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
    <PlacePage
      id={location.id}
      name={shown.name}
      altName={shown.altName}
      scope={system.id}
      showAll={showAll}
      spoilers={shown.spoilers}
      breadcrumb={
        <PlaceBreadcrumb
          trail={[
            {
              name: planet.name,
              href: `/systems/${system.id}/planets/${planet.id}`,
            },
            ...ancestorTrail(location, visible).map((p) => ({
              name: p.name,
              href: href(p.id),
            })),
          ]}
          current={shown.name}
        />
      }
      kind={kind}
      parent={parent && { name: parent.name, href: href(parent.id) }}
      summary={shown.summary || undefined}
      planetId={planet.id}
      world={{
        name: planet.name,
        href: `/systems/${system.id}/planets/${planet.id}`,
      }}
      extraFacts={
        <>
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
        </>
      }
      coppermindUrl={shown.coppermindUrl}
    />
  )
}
