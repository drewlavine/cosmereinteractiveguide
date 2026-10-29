/**
 * Journeys: where characters go, as events on maps, each gated by the chapter
 * that reveals it. Nothing here is specific to one book series, so the same
 * model serves any series (a Middle-earth map with regional child maps works
 * the same as the Cosmere star map with planet maps).
 *
 * Data flow:
 *   source (a fan map's data, hand-written lists...)
 *     -> an importer in ~/cig-journey-data (converts to JourneyEvent)
 *     -> src/data/journeys/<pack>.json, loaded lazily (journeyPacks.ts)
 *        + src/data/journeyIndex.ts, small and eager (who has a journey)
 *     -> revealJourney (reveal.ts) trims it to what the reader may see
 *     -> components render only the trimmed result.
 *
 * Maps and places come from an Atlas, which a series supplies (for this app,
 * journeyAtlas.ts adapts maps.ts and the Locations list).
 */
import type { Reveal } from './types'

/** A point in a map image's own pixels, [x, y] from the top left. */
export type MapPoint = readonly [number, number]

/** A sentence about an event, revealed by its own points. */
export interface JourneyPassage {
  text: string
  revealedIn: Reveal
  /** Hidden once a fuller version of it is revealed here. */
  supersededIn?: Reveal
  /** Where an out-of-book fact comes from, e.g. a Word of Brandon. */
  cite?: { text: string; url?: string }
  /** Names in `text` to link to their character pages, once met. */
  links?: readonly { text: string; characterId: string }[]
}

/**
 * Something that happens somewhere: a stay (one point) or a route walked
 * (several points), for one or more characters.
 *
 * Events of a world hop sit on a top-level map (e.g. a star map, with
 * `placeId` the planet); events within a world sit on that world's map or a
 * child map of it. The renderer joins each character's events in `order`.
 */
export interface JourneyEvent {
  /** Unique in its pack. Neutral: never shown, and must not name the event. */
  id: string
  /** Ids of the characters it belongs to. */
  characters: readonly string[]
  /** Id of the Atlas map its `path` is drawn on. */
  mapId: string
  /** Map image pixels: the route walked, or a single point for a stay. */
  path: readonly MapPoint[]
  /** The place it happens at; named only once the place is revealed. */
  placeId?: string
  /**
   * Hand-written name of where it happens, safe at the event's chapter: for
   * places not in the Locations list (a keep, a camp), or while `placeId`'s
   * own name is still hidden.
   */
  placeName?: string
  /**
   * Where the reader learns where it happened, if later than the event
   * itself (e.g. a birth date known before the birthplace). Until then the
   * event has no point on the map and no place.
   */
  placeRevealedIn?: Reveal
  /** Where the event is revealed, usually one chapter. */
  revealedIn: Reveal
  /**
   * Position on the timeline: in-world order where the source knows it (so
   * flashbacks fall into place), else reading order. Shared by every
   * character in a pack, so packs can be merged.
   */
  order: number
  /**
   * The chapter that shows it happening, in reading order: where a book's
   * chapter map puts it. Set on book scenes (`bookScenes/`); `revealedIn`
   * stays the spoiler gate.
   */
  happensIn?: { book: string; chapter: string }
  /** Shown as a memory or flashback, not where the character is now. */
  flashback?: boolean
  /**
   * Book scenes: characters not drawn after this (they die or leave the
   * book's maps), so they aren't left dimmed at their last spot.
   */
  leaves?: readonly string[]
  /**
   * Book scenes: what someone the chapter's text doesn't name does in it,
   * by character id; a short fragment, revealed with the event.
   */
  roles?: Readonly<Record<string, string>>
  /** The position or route is a best guess: drawn dashed. */
  approximate?: boolean
  /**
   * How the character is there when not in body, e.g. "In the Cognitive
   * Realm" or "Through a seon"; shown as a label with the event.
   */
  presence?: string
  /** In the Cognitive Realm: the map is drawn misty. */
  realm?: 'cognitive'
  /** Short hand-written name of what happens, revealed with the event. */
  title?: string
  /** Hand-written text, if any; never copied from a source's prose. */
  summary?: JourneyPassage[]
  /** A picture of it, revealed with the event; picked to show nothing later. */
  art?: JourneyArt
  /** Id of the importer that made it, for credits and debugging. */
  source?: string
}

/** Fan art for an event, always credited to its artist. */
export interface JourneyArt {
  /** Path under `public/`, named by the event id, e.g. `/journey-art/rm-1.webp`. */
  src: string
  alt: string
  credit: { text: string; url?: string }
  /** CSS `object-position` for the card's crop, e.g. "50% 30%". */
  position?: string
}

export interface JourneyCredit {
  text: string
  url: string
  /** The importer it credits; credited only when its events are shown. */
  source?: string
}

/** One data pack: the events from one or more sources, loaded together. */
export interface JourneyPack {
  id: string
  credits: JourneyCredit[]
  events: JourneyEvent[]
}

/**
 * character id -> each pack and map with their events, and every point that
 * reveals one of those events (generated, see journeyIndex.ts).
 */
export type JourneyIndex = Record<
  string,
  readonly { pack: string; mapId: string; revealedIn: Reveal }[]
>

/** A map a journey can be drawn on. */
export interface AtlasMap {
  id: string
  title: string
  image: {
    src: string
    /** A small copy for previews. */
    thumb?: string
    width: number
    height: number
    alt: string
  }
  credit: { text: string; url?: string }
  /** When the reader may see the map itself. */
  revealedIn: Reveal
  /**
   * A drawn overview of the whole series (the Cosmere's star chart): always
   * shown, its image drawn by the page rather than loaded. Never the map a
   * journey zooms out to on its own: only stops on it go there.
   */
  overview?: boolean
  /**
   * Where the map sits on a bigger one (a region on its continent, a world on
   * the star map), for drilling down. Top maps have none. `whole`: a map of
   * all of that map's land (another era's), not a place on it, so it's never
   * drawn inside it or zoomed into from it.
   */
  parent?: { mapId: string; placeId?: string; at?: MapPoint; whole?: boolean }
}

/** A place an event can name. */
export interface AtlasPlace {
  id: string
  name: string
  revealedIn: Reveal
  /** Its page in the app, if it has one. */
  href?: string
}

/** Looks up maps and places by id; supplied by the series' data. */
export interface Atlas {
  map(id: string): AtlasMap | undefined
  place(id: string): AtlasPlace | undefined
}
