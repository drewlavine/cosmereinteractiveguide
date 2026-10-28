import { journeyAtlas } from '../../data/journeyAtlas'
import type { CanSee } from '../../data/reveal'
import type { Reveal } from '../../data/types'
import { systems } from '../../data/systems'
import type { ShownTimeline, ShownTimelineEvent } from '../../data/timeline'
import { assetUrl } from '../../data/assetUrl'
import { SKY, type WorldMap } from './sky'

/** A world the explorer may draw, trimmed to what the reader knows. */
export interface ExplorerWorld {
  id: string
  name: string
  color: string
  /** Its system's star in the painted sky. */
  star: readonly [number, number]
  /** The journey map it unrolls into, and that map's image. */
  mapId?: string
  map?: WorldMap & { title: string; credit: string }
  /**
   * Drawn as a textured globe that unrolls into this map (Roshar). The
   * texture is laid out by Roshar's map; `fromRoshar` is the affine
   * [a, b, c, d, e, f] taking its pixels to this map's, if it's another.
   */
  globe?: WorldMap & { texture: string; fromRoshar?: readonly number[] }
  /** Yolen's own globe, with each feature only once a book shows it. */
  yolen?: YolenLook
}

/** What Yolen's globe shows; a neutral, Earth-like world without any. */
export interface YolenLook {
  /** Bone-white patches of fainlife among its green lands. */
  fain: boolean
  /** The greatstar, a glow high in its atmosphere. */
  greatstar: boolean
}

/**
 * When each of Yolen's features shows, matching the planet's summary lines
 * in src/data/systems.ts. Word of Brandon and unpublished books add none.
 */
export const YOLEN_LOOK: Record<keyof YolenLook, Reveal> = {
  fain: ['sunlit-man', 'wind-and-truth'],
  greatstar: ['isles-of-the-emberdark'],
}

/** An event's place on a world's map, in map pixels. */
export interface ExplorerPin {
  id: string
  world: string
  at: readonly [number, number]
  title: string
}

/**
 * Roshar's map in colour (Stoneward13, after Isaac Stewart), warped onto
 * the frame of Roshar.jpg so the guide's pins on that map still hold.
 */
const ROSHAR_MAP: ExplorerWorld['map'] = {
  src: assetUrl('/explorer/Roshar-colour.jpg'),
  width: 2560,
  height: 1600,
  title: 'Roshar',
  credit: 'Map by Stoneward13 after Isaac Stewart',
}

const ROSHAR_GLOBE = {
  ...ROSHAR_MAP,
  texture: assetUrl('/explorer/Roshar-globe.jpg'),
}

/**
 * Before the Recreance (in years since the Shattering), Roshar is drawn as
 * the Silver Kingdoms: their map (Isaac Stewart) reprojected onto the globe
 * the same way, and where its pixels fall on Roshar's (fitted coastlines).
 */
const RECREANCE = 8906.6
const SILVER_KINGDOMS = journeyAtlas.map('silver-kingdoms')
const SILVER_KINGDOMS_GLOBE = {
  texture: assetUrl('/explorer/Silver-Kingdoms-globe.jpg'),
  fromRoshar: [0.46184, -0.00267, 0.00137, 0.46425, 27.72, 11.22],
}

/**
 * Worlds to explore beyond the timeline's: the inhabited planets of systems
 * painted in the sky. Yolen isn't painted, so it only appears once an event
 * the reader can see happens there.
 */
const EXPLORABLE = new Set([
  'roshar',
  'ashyn',
  'braize',
  'scadrial',
  'nalthis',
  'sel',
  'taldain',
  'threnody',
  'first-of-the-sun',
])

/**
 * The worlds the reader has met, each under its system's star: every world
 * on the shown timeline, and the other inhabited planets the books have
 * revealed. Nothing the reader hasn't reached is listed, so the sky never
 * hints at it. While the current event is in a city with its own map (a
 * map inside the world's), its world unrolls into that map instead.
 */
export function explorerWorlds(
  timeline: ShownTimeline,
  canSee: CanSee,
  current?: ShownTimelineEvent,
): ExplorerWorld[] {
  return systems.flatMap((system) => {
    const star = SKY.stars[system.id]
    if (!star) return []
    return system.planets.flatMap((planet): ExplorerWorld[] => {
      const shown = timeline.worlds.find((w) => w.id === planet.id)
      if (!shown && !(EXPLORABLE.has(planet.id) && canSee(planet.revealedIn)))
        return []
      const era =
        planet.id === 'roshar' &&
        shown?.mapId &&
        current &&
        current.year < RECREANCE &&
        SILVER_KINGDOMS &&
        canSee(SILVER_KINGDOMS.revealedIn)
          ? SILVER_KINGDOMS.id
          : undefined
      const mapId =
        current?.world.id === planet.id && current.map
          ? current.map.mapId
          : (era ?? shown?.mapId)
      const atlas = mapId ? journeyAtlas.map(mapId) : undefined
      const map =
        mapId === 'roshar'
          ? ROSHAR_MAP
          : atlas && {
              // Without its frame, fading into the globe's sea around it.
              src:
                mapId === 'silver-kingdoms'
                  ? assetUrl('/explorer/Silver-Kingdoms-flat.jpg')
                  : atlas.image.src,
              width: atlas.image.width,
              height: atlas.image.height,
              title: atlas.title,
              credit: atlas.credit.text,
            }
      return [
        {
          id: planet.id,
          name: shown?.name ?? planet.name,
          color: planet.color,
          star,
          ...(map && { mapId, map }),
          ...(planet.id === 'roshar' &&
            shown?.mapId && {
              globe:
                mapId === 'silver-kingdoms' && map
                  ? { ...map, ...SILVER_KINGDOMS_GLOBE }
                  : ROSHAR_GLOBE,
            }),
          ...(planet.id === 'yolen' && {
            yolen: {
              fain: canSee(YOLEN_LOOK.fain),
              greatstar: canSee(YOLEN_LOOK.greatstar),
            },
          }),
        },
      ]
    })
  })
}

/** The shown events with a point on their world's map. */
export const explorerPins = (
  timeline: ShownTimeline,
  worlds: ExplorerWorld[],
): ExplorerPin[] =>
  timeline.events.flatMap((e) => {
    const world = worlds.find((w) => w.id === e.world.id)
    return e.map?.at && world?.map && e.map.mapId === world.mapId
      ? [{ id: e.id, world: world.id, at: e.map.at, title: e.title }]
      : []
  })
