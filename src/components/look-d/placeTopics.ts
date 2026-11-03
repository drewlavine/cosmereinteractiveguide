import type { ShownLocationStory } from '../../data/reveal'
import type { CultureTopic } from '../../data/types'
import { OPEN } from '../pageOpen'
import { slugs } from '../pageSlugs'

/** A titled Culture topic as the page shows it, from revealed data only. */
export interface ShownTopic {
  id: string
  title: string
  topic?: CultureTopic
  /** How many notes the reader can see. */
  count: number
}

/**
 * Takes the reader to a part of the page, opening its section if folded,
 * and puts it in the URL like the Contents does.
 */
export function jumpTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.closest('[data-toc]')?.dispatchEvent(new Event(OPEN))
  const frame = requestAnimationFrame(() =>
    el.scrollIntoView?.({ block: 'start' }),
  )
  history.replaceState(history.state, '', `#${id}`)
  return frame
}

/** Each Culture subsection's id (as its PageSubsection), in order. */
export const cultureIds = (culture: ShownLocationStory['culture']) =>
  slugs(
    'culture',
    culture.map((c) => c.title ?? ''),
  )

/** The titled Culture topics, which the page navigation lists. */
export function shownTopics(
  culture: ShownLocationStory['culture'],
): ShownTopic[] {
  const ids = cultureIds(culture)
  return culture.flatMap(({ title, topic, items }, i) =>
    title ? [{ id: ids[i], title, topic, count: items.length }] : [],
  )
}
