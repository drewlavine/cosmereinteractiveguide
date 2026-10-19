import { Link, useParams } from 'react-router'
import { PanZoom } from '../components/PanZoom'
import { BinarySystemChart } from '../components/BinarySystemChart'
import { SpoilerNotice } from '../components/SpoilerNotice'
import { SystemChart } from '../components/SystemChart'
import { UnchartedChart } from '../components/UnchartedChart'
import { useShownSystem } from '../state/reveal'
import { HiddenPage } from './HiddenPage'
import { NotFound } from './NotFound'

export function SystemView() {
  const { systemId } = useParams()
  const system = useShownSystem(systemId)

  if (!system) return <NotFound />
  if (!system.planets.length) return <HiddenPage systemId={system.id} />

  const dwarfs = system.planets.filter((p) => p.dwarf).length

  return (
    <section className="system-view" aria-labelledby="system-title">
      <PanZoom label={`${system.name} map`}>
        {system.uncharted ? (
          <UnchartedChart system={system} />
        ) : system.binary ? (
          <BinarySystemChart system={system} />
        ) : (
          <SystemChart system={system} />
        )}
      </PanZoom>

      <Link to="/" className="system-back">
        <span aria-hidden="true">←</span> Star map
      </Link>

      <aside className="system-info" aria-label="System information">
        <details>
          <summary>
            <h1 id="system-title">{system.name}</h1>
          </summary>
          <div className="system-info-body">
            <dl>
              {system.star && (
                <>
                  <dt>
                    {system.companionStar || system.uncharted
                      ? 'Stars'
                      : 'Star'}
                  </dt>
                  <dd>{system.star}</dd>
                  {system.companionStar && <dd>{system.companionStar}</dd>}
                </>
              )}
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
            {system.summary && <p>{system.summary}</p>}
            <a href={system.coppermindUrl} target="_blank" rel="noreferrer">
              Read more on the Coppermind
            </a>
          </div>
        </details>
      </aside>

      <SpoilerNotice scope={system.id} spoilers={system.spoilers} />
    </section>
  )
}
