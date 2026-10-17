import type { JourneyPack } from './journey'

/**
 * Journey packs (generated into journeys/<pack>.json by
 * ~/cig-journey-data/emit.py). Each is its own chunk, loaded when a page
 * needs it, like character stories.
 */
const files = import.meta.glob<JourneyPack>('./journeys/*.json', {
  import: 'default',
})
const path = (id: string) => `./journeys/${id}.json`
const loaded = new Map<string, JourneyPack>()

export const hasPack = (id: string) => path(id) in files

/** The pack if it's already loaded; undefined while loading or if none. */
export const cachedPack = (id: string) => loaded.get(id)

export async function loadPack(id: string) {
  const load = files[path(id)]
  if (!load) return undefined
  const pack = loaded.get(id) ?? (await load())
  loaded.set(id, pack)
  return pack
}
