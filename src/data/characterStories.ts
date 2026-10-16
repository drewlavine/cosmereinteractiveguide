import type { CharacterStory } from './types'

/**
 * Short spoiler-tagged text about characters, adapted from the Coppermind.
 * Generated into stories/<id>.json by ~/cig-char-data/emit_story.py; each item
 * is dated by the footnotes of the Coppermind paragraphs it draws on. Each
 * file is its own chunk, loaded when its page opens, so the text for
 * thousands of characters stays out of the main bundle.
 */
const files = import.meta.glob<CharacterStory>('./stories/*.json', {
  import: 'default',
})
const path = (id: string) => `./stories/${id}.json`
const loaded = new Map<string, CharacterStory>()

export const storyIds = Object.keys(files).map((f) =>
  f.slice('./stories/'.length, -'.json'.length),
)

export const hasStory = (id: string) => path(id) in files

/** The story if it's already loaded; undefined while loading or if none. */
export const cachedStory = (id: string) => loaded.get(id)

export async function loadStory(id: string) {
  const load = files[path(id)]
  if (!load) return undefined
  const story = loaded.get(id) ?? (await load())
  loaded.set(id, story)
  return story
}
