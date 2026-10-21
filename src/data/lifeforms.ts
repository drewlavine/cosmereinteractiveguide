import type { ListedLifeformKind } from './types'

export { lifeformList } from './lifeformList'

/** Type labels for the Lifeforms list, in the order its groups appear. */
export const lifeformKindLabels: Record<ListedLifeformKind, string> = {
  spren: 'Spren',
  'true-spren': 'True spren',
  'lesser-spren': 'Lesser spren',
  species: 'Species and beings',
  creature: 'Animals and creatures',
  plant: 'Plants and fungi',
}

/** What one entry of each type is called, e.g. on its page. */
export const lifeformKindNames: Record<ListedLifeformKind, string> = {
  spren: 'Spren',
  'true-spren': 'True spren',
  'lesser-spren': 'Lesser spren',
  species: 'Species or being',
  creature: 'Animal or creature',
  plant: 'Plant or fungus',
}
