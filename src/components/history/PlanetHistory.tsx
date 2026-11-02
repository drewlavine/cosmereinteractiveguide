import type { ShownEra } from '../../data/planetHistory'
import type { ShownPlanet } from '../../data/reveal'
import { useLinkText } from '../LinkedText'
import { PageSection } from '../PageSections'
import { Chronicle } from './Chronicle'
import { historyStyles, useHistoryStyle } from './historyLook'
import { Chapters, Dial, Metro, StarChart } from './ScrubLooks'
import { Scrubber } from './Scrubber'
import s from './history.module.css'

const views = {
  chronicle: Chronicle,
  scrubber: Scrubber,
  chapters: Chapters,
  metro: Metro,
  stars: StarChart,
  dial: Dial,
}

/**
 * A planet's History section: its eras and moments, already trimmed to what
 * the reader may see, told in the style picked below.
 */
export function PlanetHistory({
  eras,
  systemId,
  planet,
  showAll,
}: {
  eras: ShownEra[]
  systemId: string
  planet: ShownPlanet
  showAll: boolean
}) {
  const [style, pick] = useHistoryStyle()
  const link = useLinkText(`place:${planet.id}`)
  const View = views[style]
  return (
    <PageSection id="history" title="History">
      {/* ponytail: temporary, to compare history styles; see historyLook.ts. */}
      <div className={s.try} role="group" aria-label="Try a history style">
        <span className={s.tryLabel} aria-hidden>
          Try a style
        </span>
        {historyStyles.map((o) => (
          <button
            key={o.id}
            type="button"
            className={s.tryOption}
            aria-pressed={o.id === style}
            title={o.tip}
            onClick={() => pick(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className={s.tip}>{historyStyles.find((o) => o.id === style)?.tip}.</p>
      <View
        eras={eras}
        planet={planet}
        showAll={showAll}
        link={link}
        placeHref={(id) =>
          `/systems/${systemId}/planets/${planet.id}/locations/${id}`
        }
      />
    </PageSection>
  )
}
