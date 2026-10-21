import type { ListedEventKind } from './types'

export { eventList } from './eventList'

/** Type labels for the Events list, in the order its groups appear. */
export const eventKindLabels: Record<ListedEventKind, string> = {
  cataclysm: 'Desolations and cataclysms',
  battle: 'Battles and sieges',
  war: 'Wars, campaigns and uprisings',
  era: 'Eras',
  gathering: 'Festivals, parties and gatherings',
  other: 'Other events',
}

/** What one entry of each type is called, e.g. on its page. */
export const eventKindNames: Record<ListedEventKind, string> = {
  cataclysm: 'Desolation or cataclysm',
  battle: 'Battle or siege',
  war: 'War, campaign or uprising',
  era: 'Era',
  gathering: 'Festival, party or gathering',
  other: 'Event',
}
