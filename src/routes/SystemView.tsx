import { useParams } from 'react-router'
import { PanZoom } from '../components/PanZoom'
import { BinarySystemChart } from '../components/BinarySystemChart'
import { SystemChart } from '../components/SystemChart'
import { getSystem } from '../data/systems'
import { NotFound } from './NotFound'

export function SystemView() {
  const { systemId } = useParams()
  const system = getSystem(systemId)

  if (!system) return <NotFound />

  const dwarfs = system.planets.filter((p) => p.dwarf).length

  return (
    <section className="system-view" aria-labelledby="system-title">
      <PanZoom label={`${system.name} map`}>
        {system.companionStar ? (
          <BinarySystemChart system={system} />
        ) : (
          <SystemChart system={system} />
        )}
      </PanZoom>

      <aside className="system-info" aria-label="System information">
        <details>
          <summary>
            <h1 id="system-title">{system.name}</h1>
          </summary>
          <div className="system-info-body">
            <dl>
              <dt>{system.companionStar ? 'Stars' : 'Star'}</dt>
              <dd>{system.star}</dd>
              {system.companionStar && <dd>{system.companionStar}</dd>}
              <dt>Known planets</dt>
              <dd>
                {system.planets.length - dwarfs}
                {dwarfs > 0 &&
                  ` (plus ${dwarfs} dwarf planet${dwarfs > 1 ? 's' : ''})`}
              </dd>
              {system.asteroidBelt && (
                <>
                  <dt>Asteroid belt</dt>
                  <dd>{system.asteroidBelt.description}</dd>
                </>
              )}
              {system.cometBelt && (
                <>
                  <dt>Comet belt</dt>
                  <dd>{system.cometBelt.description}</dd>
                </>
              )}
            </dl>
            <p>{system.summary}</p>
            <a href={system.coppermindUrl} target="_blank" rel="noreferrer">
              Read more on the Coppermind
            </a>
          </div>
        </details>
      </aside>
    </section>
  )
}
