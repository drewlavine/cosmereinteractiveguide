import type { LocationStory } from './types'

/**
 * Short spoiler-tagged text about places, adapted from the Coppermind.
 * Generated into locationStories/<id>.json by ~/cig-loc-data/loc_emit.py;
 * each file is its own chunk, loaded when its page opens.
 */
const files = import.meta.glob<LocationStory>('./locationStories/*.json', {
  import: 'default',
})
const path = (id: string) => `./locationStories/${id}.json`
const loaded = new Map<string, LocationStory>()

export const hasLocationStory = (id: string) => path(id) in files

/** The story if it's already loaded; undefined while loading or if none. */
export const cachedLocationStory = (id: string) => loaded.get(id)

export async function loadLocationStory(id: string) {
  const load = files[path(id)]
  if (!load) return undefined
  const story = loaded.get(id) ?? (await load())
  loaded.set(id, story)
  return story
}
