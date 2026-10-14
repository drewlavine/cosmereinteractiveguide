import { Fragment } from 'react'
import { Link, useParams } from 'react-router'
import { PlanetGlobe } from '../components/PlanetGlobe'
import { PlanetMaps } from '../components/PlanetMaps'
import { SpoilerNotice } from '../components/SpoilerNotice'
import { books } from '../data/books'
import { planetMaps } from '../data/maps'
import { spoilerBooks } from '../data/reveal'
import { useBooksRead } from '../state/booksRead'
import { useShownSystem } from '../state/reveal'
import { HiddenPage } from './HiddenPage'
import { NotFound } from './NotFound'

const bookTitle = (bookId: string) =>
  books.find((b) => b.id === bookId)?.title ?? bookId

function FactList({ label, items }: { label: string; items: string[] }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{items.length ? items.join(', ') : 'None known'}</dd>
    </>
  )
}

/** A row of book titles, left out when the reader has read none of them. */
function BookList({ label, bookIds }: { label: string; bookIds: string[] }) {
  if (!bookIds.length) return null
  return (
    <>
      <dt>{label}</dt>
      <dd>
        {bookIds.map((id, i) => (
          <Fragment key={id}>
            {i > 0 && ', '}
            <cite>{bookTitle(id)}</cite>
          </Fragment>
        ))}
      </dd>
    </>
  )
}

export function PlanetDetail() {
  const { systemId, planetId } = useParams()
  const { hasRead, viewAnyway } = useBooksRead()
  const system = useShownSystem(systemId)
  const planet = system?.planets.find((p) => p.id === planetId)

  if (!system) return <NotFound />
  if (!planet) {
    const hidden = system.hiddenPlanets.find((p) => p.id === planetId)
    return hidden ? (
      <HiddenPage
        systemId={system.id}
        spoilers={spoilerBooks([hidden.revealedIn])}
      />
    ) : (
      <NotFound />
    )
  }

  const showAll = viewAnyway.has(system.id)
  const unreadMaps = (planetMaps[planet.id] ?? []).flatMap((map) =>
    map.versions.filter((v) => !hasRead(v.bookId)).map((v) => [v.bookId]),
  )
  const spoilers = spoilerBooks([
    ...planet.spoilers.map((id) => [id]),
    ...unreadMaps,
  ])

  const moonNames = planet.moons.flatMap((m) => (m.name ? [m.name] : []))
  const unnamedMoons = planet.moons.length - moonNames.length
  if (unnamedMoons)
    moonNames.push(
      `${unnamedMoons} ${moonNames.length ? 'more ' : ''}unnamed moon${unnamedMoons > 1 ? 's' : ''}`,
    )

  return (
    <article className="planet-detail" aria-labelledby="planet-title">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/">Star map</Link> /{' '}
        <Link to={`/systems/${system.id}`}>{system.name}</Link> /{' '}
        <span aria-current="page">{planet.name}</span>
      </nav>

      <SpoilerNotice systemId={system.id} spoilers={spoilers} />

      <div className="planet-detail-body">
        <svg
          className="planet-detail-globe"
          viewBox="-200 -200 400 400"
          aria-hidden
        >
          <PlanetGlobe
            planet={planet}
            cx={0}
            cy={0}
            r={planet.rings ? 100 : 120}
          />
        </svg>
        <div>
          <h1 id="planet-title">{planet.name}</h1>
          {planet.altName && (
            <p className="planet-detail-aka">Also called {planet.altName}</p>
          )}
          {planet.summary && <p>{planet.summary}</p>}
          <dl>
            <BookList label="Stories set here" bookIds={planet.settingOf} />
            <BookList label="Mentioned in" bookIds={planet.mentionedIn} />
            <FactList label="Shards" items={planet.shards} />
            <FactList label="Magic systems" items={planet.magicSystems} />
            <FactList label="Moons" items={moonNames} />
            {planet.rings && (
              <>
                <dt>Rings</dt>
                <dd>Yes</dd>
              </>
            )}
          </dl>
          <a href={planet.coppermindUrl} target="_blank" rel="noreferrer">
            Read more on the Coppermind
          </a>
        </div>
      </div>

      <PlanetMaps key={planet.id} planetId={planet.id} showAll={showAll} />
    </article>
  )
}
