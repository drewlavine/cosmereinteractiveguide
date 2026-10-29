import { journeyAtlas } from '../../data/journeyAtlas'
import type { CanSee } from '../../data/reveal'
import type { Reveal } from '../../data/types'
import { systems } from '../../data/systems'
import type { ShownTimeline, ShownTimelineEvent } from '../../data/timeline'
import { assetUrl } from '../../data/assetUrl'
import type { MapPoint } from '../../data/journey'
import { SKY, type WorldMap } from './sky'

/**
 * The map a city's map sits on; none for a world's own map (on the star
 * chart), or while the reader can't see the map it's on.
 */
export const cityOn = (mapId: string, canSee: CanSee) => {
  const parent = journeyAtlas.map(mapId)?.parent
  const on = parent && journeyAtlas.map(parent.mapId)
  return on && !on.overview && canSee(on.revealedIn) ? parent : undefined
}

/** The map a city's map sits on, and the one that sits on, and so on. */
export type Around = {
  map: InsetMap
  at: readonly [number, number]
  parent?: Around
}

/** A map drawn inside or around another, as it's drawn on its own. */
export type InsetMap = WorldMap & {
  inner?: readonly number[]
  tint?: string
}

/** A journey map's image as the explorer draws it. */
export const insetMap = (id: string): InsetMap | undefined => {
  if (id === 'roshar') return ROSHAR_MAP
  const atlas = journeyAtlas.map(id)
  return (
    atlas && {
      src: FLAT[atlas.id] ?? atlas.image.src,
      width: atlas.image.width,
      height: atlas.image.height,
      ...ART[atlas.id],
    }
  )
}

/** A world the explorer may draw, trimmed to what the reader knows. */
export interface ExplorerWorld {
  id: string
  name: string
  color: string
  /** Its system's star in the painted sky. */
  star: readonly [number, number]
  /** The journey map it unrolls into, and that map's image. */
  mapId?: string
  map?: WorldMap & {
    title: string
    credit: string
    /** The art inside its frame (image pixels): the rest fades away. */
    inner?: readonly number[]
    /** Multiplied in, e.g. to wash a black and white map to parchment. */
    tint?: string
    /** A city's map inside the world's: the globe fades as it unrolls. */
    city?: boolean
    /** For a city: the map it sits on, and where (that map's pixels). */
    /** The map it's on, and that map's own, each where it sits on the next. */
    parent?: Around
  }
  /**
   * Drawn as a textured globe that unrolls into this map (Roshar, Scadrial). The
   * texture is laid out by Roshar's map; `fromRoshar` is the affine
   * [a, b, c, d, e, f] taking its pixels to this map's, if it's another.
   */
  globe?: WorldMap & {
    texture: string
    fromRoshar?: readonly number[]
    /**
     * Where the uncharted begins, past this map's frame: [start, full] in
     * map heights out from its edge (ExplorerCanvas's UNCHARTED).
     */
    edge?: readonly [number, number]
  }
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
const ROSHAR_MAP: NonNullable<ExplorerWorld['map']> = {
  src: assetUrl('/explorer/Roshar-colour.jpg'),
  width: 2560,
  height: 1600,
  title: 'Roshar',
  credit: 'Map by Stoneward13 after Isaac Stewart',
}

/**
 * Past the map a globe is drawn by lies the uncharted: the same on every
 * world, and set only by that map's frame, so it never hints at land the
 * reader hasn't seen. It starts at the frame and is full a little beyond.
 */
const EDGE = [0.01, 0.08] as const

const ROSHAR_GLOBE = {
  ...ROSHAR_MAP,
  texture: assetUrl('/explorer/Roshar-globe.jpg'),
  edge: EDGE,
}

/**
 * Before the Recreance (in years since the Shattering), Roshar is drawn as
 * the Silver Kingdoms: their map (Isaac Stewart) reprojected onto the globe
 * the same way, and where its pixels fall on Roshar's (fitted coastlines).
 */
const RECREANCE = 8906.6
const SILVER_KINGDOMS = journeyAtlas.map('silver-kingdoms')
/**
 * Scadrial is drawn by the Final Empire's map until the Catacendre, then by
 * The Lost Metal's map of the world, or before it the Elendel Basin's.
 */
const CATACENDRE = 10626

/** The map a world is drawn by in an era, if not its own. */
const eraMap = (planet: string, year: number, canSee: CanSee) =>
  planet === 'roshar' && year < RECREANCE
    ? SILVER_KINGDOMS
    : planet === 'scadrial'
      ? (year < CATACENDRE ? ['final-empire'] : ['scadrial', 'elendel-basin'])
          .map((id) => journeyAtlas.map(id))
          .find((m) => m && canSee(m.revealedIn))
      : undefined

/**
 * Where a pin on one journey map falls on another: itself, or, for a city
 * inside it, the city's own pin.
 */
export function pointOn(
  mapId: string | undefined,
  pin: { mapId: string; at: MapPoint } | undefined,
): MapPoint | undefined {
  if (!mapId || !pin) return undefined
  if (pin.mapId === mapId) return pin.at
  for (
    let m = journeyAtlas.map(pin.mapId);
    m?.parent;
    m = journeyAtlas.map(m.parent.mapId)
  )
    if (m.parent.mapId === mapId) return m.parent.at
  return undefined
}

const SILVER_KINGDOMS_GLOBE = {
  texture: assetUrl('/explorer/Silver-Kingdoms-globe.jpg'),
  fromRoshar: [0.46184, -0.00267, 0.00137, 0.46425, 27.72, 11.22],
  edge: EDGE,
}

/**
 * Scadrial's globes, laid out the same way (globe-work/scadrial.py in the
 * session files). Before the Catacendre, the Final Empire's map (Isaac
 * Stewart). After, The Lost Metal's map of the Basin and the Southern
 * Continent, washed to colour; the Elendel Basin's map is a city on it.
 *
 * Both share one scale, set by The Lost Metal map's own graticule: a Mercator
 * grid every 15° (134 px between meridians), equator just south of Elendel
 * and prime meridian through it (Isaac Stewart, wob.coppermind.net/entry/15856;
 * the reprojection he called "close", /entry/16086). Taken at the Final
 * Empire's latitude (18.6°N), that is 511.9 / (cos 18.6° × 1005 Roshar px per
 * radian) = 0.5374 world px per Roshar px. The Final Empire's map is
 * registered onto the world map (ashmounts and lakes, scale 0.23858; Isaac's
 * overlay of the Basin on it, /entry/13162), so it gets 0.5374 / 0.23858 =
 * 2.2526, centred on the globe's front, and the world map is placed so that
 * both eras' features coincide. That makes the Final Empire about 4,000 km
 * across, on an Earth-sized world (/entry/3073).
 */
const FINAL_EMPIRE_GLOBE = {
  texture: assetUrl('/explorer/Scadrial-FE-globe.jpg'),
  fromRoshar: [2.2526, 0, 0, 2.2526, -1859.34, -1024.59],
  // Its pale grey sea needs a longer fade into the dim than a blue one.
  edge: [0.01, 0.2] as const,
}
const SCADRIAL_GLOBE = {
  texture: assetUrl('/explorer/Scadrial-globe.jpg'),
  fromRoshar: [0.5374, 0, 0, 0.5374, -358.13, -222.29],
  edge: EDGE,
}

/** Maps drawn from a copy without their frame, fading into their own sea. */
const FLAT: Record<string, string> = {
  'silver-kingdoms': assetUrl('/explorer/Silver-Kingdoms-flat.jpg'),
  'final-empire': assetUrl('/explorer/Scadrial-FE-flat.jpg'),
  scadrial: assetUrl('/explorer/Scadrial-flat.jpg'),
}

/**
 * Each map's art inside its frame, border and caption (image pixels): on
 * the explorer the rest fades into space, as Roshar's sea does. Black and
 * white maps are washed to parchment, so they don't glare.
 */
const PARCHMENT = '#e9d9b6'
const ART: Record<string, { inner: readonly number[]; tint?: string }> = {
  warcamps: { inner: [80, 45, 1130, 722], tint: PARCHMENT },
  'shattered-plains': { inner: [40, 30, 1160, 712], tint: PARCHMENT },
  'narak-defenses': { inner: [15, 15, 2030, 1330] },
  azimir: { inner: [95, 150, 1245, 1620] },
  'elendel-basin': { inner: [45, 45, 755, 1158], tint: PARCHMENT },
  elendel: { inner: [52, 52, 1537, 1148] },
  'new-seran': { inner: [0, 32, 488, 762], tint: PARCHMENT },
  't-telir': { inner: [28, 25, 996, 585], tint: PARCHMENT },
  opelon: { inner: [105, 105, 1535, 2335] },
  arelon: { inner: [110, 110, 1530, 2330] },
  'elantris-and-kae': { inner: [15, 15, 2310, 1700] },
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
  /** A map to unroll a world into instead, e.g. a city a person is in. */
  focus?: { world: string; mapId: string },
): ExplorerWorld[] {
  return systems.flatMap((system) => {
    const star = SKY.stars[system.id]
    if (!star) return []
    return system.planets.flatMap((planet): ExplorerWorld[] => {
      const shown = timeline.worlds.find((w) => w.id === planet.id)
      if (!shown && !(EXPLORABLE.has(planet.id) && canSee(planet.revealedIn)))
        return []
      const eraAtlas = current && eraMap(planet.id, current.year, canSee)
      const era =
        eraAtlas &&
        (planet.id !== 'roshar' || shown?.mapId) &&
        canSee(eraAtlas.revealedIn)
          ? eraAtlas.id
          : undefined
      const mapId =
        focus?.world === planet.id
          ? focus.mapId
          : current?.world.id === planet.id && current.map
            ? current.map.mapId
            : (era ?? shown?.mapId)
      const around = (id: string): Around | undefined => {
        const on = cityOn(id, canSee)
        if (on?.whole) return undefined
        const map = on?.at && insetMap(on.mapId)
        return map && on.at
          ? { map, at: on.at, parent: around(on.mapId) }
          : undefined
      }
      const mapOf = (id: string | undefined) => {
        const atlas = id ? journeyAtlas.map(id) : undefined
        const on = atlas && cityOn(atlas.id, canSee)
        const parent = atlas && around(atlas.id)
        return id === 'roshar'
          ? ROSHAR_MAP
          : atlas && {
              ...insetMap(atlas.id)!,
              title: atlas.title,
              credit: atlas.credit.text,
              ...(on && { city: true }),
              ...(parent && { parent }),
            }
      }
      const map = mapOf(mapId)
      // Scadrial's globe unrolls into its own map, under any city's.
      const own = era ?? shown?.mapId
      const ownMap = mapOf(own)
      const globe =
        planet.id === 'roshar'
          ? shown?.mapId &&
            (mapId === 'silver-kingdoms' && map
              ? { ...map, ...SILVER_KINGDOMS_GLOBE }
              : ROSHAR_GLOBE)
          : planet.id === 'scadrial' && ownMap
            ? own === 'final-empire'
              ? { ...ownMap, ...FINAL_EMPIRE_GLOBE }
              : own === 'scadrial'
                ? { ...ownMap, ...SCADRIAL_GLOBE }
                : undefined
            : undefined
      return [
        {
          id: planet.id,
          name: shown?.name ?? planet.name,
          color: planet.color,
          star,
          ...(map && { mapId, map }),
          ...(globe && { globe }),
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
