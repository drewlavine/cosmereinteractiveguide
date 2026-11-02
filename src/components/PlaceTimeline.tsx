import { findListed, placeHref, systemOfPlanet } from '../data/listedLocations'
import type { ShownEra } from '../data/planetHistory'
import { revealSystem } from '../data/reveal'
import { useCanSee, useShownSystems } from '../state/reveal'
import { Metro } from './history/ScrubLooks'
import { useLinkText } from './LinkedText'
import { PageSection } from './PageSections'

/** A place's History section as a Metro-line timeline of its eras. */
export function PlaceTimeline({
  id,
  eras,
  planetId,
  showAll,
}: {
  id: string
  eras: ShownEra[]
  planetId?: string
  showAll: boolean
}) {
  const canSee = useCanSee()
  const systems = useShownSystems()
  const link = useLinkText(`place:${id}`)
  const world = planetId ?? findListed(id)?.world
  const system = world ? systemOfPlanet.get(world) : undefined
  const planet =
    system &&
    revealSystem(system, canSee, showAll).planets.find((p) => p.id === world)
  const planetShown = (p: string) =>
    systems.some((s) => s.planets.some((x) => x.id === p))
  const href = (placeId: string) => {
    const place = findListed(placeId)
    return place ? placeHref(place, planetShown) : `/locations/${placeId}`
  }
  return (
    <PageSection id="history" title="History">
      <Metro
        eras={eras}
        planet={planet}
        showAll={showAll}
        link={link}
        placeHref={href}
      />
    </PageSection>
  )
}
