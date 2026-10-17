import { Link, useParams } from 'react-router'
import { BookList } from '../components/BookList'
import { InteractiveMap } from '../components/InteractiveMap'
import { PlanetGlobe } from '../components/PlanetGlobe'
import { PageContents } from '../components/PageSections'
import { PlanetMaps } from '../components/PlanetMaps'
import { SpoilerNotice } from '../components/SpoilerNotice'
import { locations } from '../data/locations'
import { planetMaps, versionUnlocked } from '../data/maps'
import { useBooksRead } from '../state/booksRead'
import { useCanSee, useShownSystem } from '../state/reveal'
import { HiddenPage } from './HiddenPage'
import { NotFound } from './NotFound'

function FactList({ label, items }: { label: string; items: string[] }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{items.length ? items.join(', ') : 'None known'}</dd>
    </>
  )
}

export function PlanetDetail() {
  const { systemId, planetId } = useParams()
  const { hasRead, viewAnyway } = useBooksRead()
  const canSee = useCanSee()
  const system = useShownSystem(systemId)
  const planet = system?.planets.find((p) => p.id === planetId)

  if (!system) return <NotFound />
  if (!planet) {
    const hidden = system.hiddenPlanets.find((p) => p.id === planetId)
    return hidden ? <HiddenPage systemId={system.id} /> : <NotFound />
  }

  const showAll = viewAnyway.has(system.id)
  const unreadMaps = (planetMaps[planet.id] ?? []).some((map) =>
    map.versions.some((v) => !versionUnlocked(v, hasRead)),
  )
  const unseenPlaces = locations.some(
    (l) => l.planetId === planet.id && !canSee(l.revealedIn),
  )
  const spoilers = planet.spoilers || unreadMaps || unseenPlaces

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

      <SpoilerNotice scope={system.id} spoilers={spoilers} />

      <div className="page-layout">
        <div className="page-layout-main">
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
                <p className="planet-detail-aka">
                  Also called {planet.altName}
                </p>
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

          <InteractiveMap
            key={`interactive-${planet.id}`}
            systemId={system.id}
            planetId={planet.id}
            showAll={showAll}
          />
          <PlanetMaps key={planet.id} planetId={planet.id} showAll={showAll} />
        </div>
        <PageContents key={`contents-${planet.id}`} />
      </div>
    </article>
  )
}
