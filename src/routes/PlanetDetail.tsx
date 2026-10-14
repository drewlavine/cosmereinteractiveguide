import { Link, useParams } from 'react-router'
import { PlanetGlobe } from '../components/PlanetGlobe'
import { PlanetMaps } from '../components/PlanetMaps'
import { getPlanet, getSystem } from '../data/systems'
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
  const system = getSystem(systemId)
  const planet = getPlanet(systemId, planetId)

  if (!system || !planet) return <NotFound />

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
          <p>{planet.summary}</p>
          <dl>
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

      <PlanetMaps key={planet.id} planetId={planet.id} />
    </article>
  )
}
