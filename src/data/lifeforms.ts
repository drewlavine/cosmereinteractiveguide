import { books } from './books'
import { entryRevealedIn } from './entryStories'
import { lifeformList } from './lifeformList'
import type { ListedLifeform, ListedLifeformKind } from './types'

export { lifeformList }

/** Type labels for the Lifeforms list, in the order its groups appear. */
export const lifeformKindLabels: Record<ListedLifeformKind, string> = {
  spren: 'Spren',
  'true-spren': 'True spren',
  'unique-spren': 'Unique spren',
  'lesser-spren': 'Lesser spren',
  species: 'Species and beings',
  creature: 'Animals and creatures',
  plant: 'Plants and fungi',
}

/** What one entry of each type is called, e.g. on its page. */
export const lifeformKindNames: Record<ListedLifeformKind, string> = {
  spren: 'Spren',
  'true-spren': 'True spren',
  'unique-spren': 'Unique spren',
  'lesser-spren': 'Lesser spren',
  species: 'Species or being',
  creature: 'Animal or creature',
  plant: 'Plant or fungus',
}

/** Lesser spren share one page, each kind a part of it. */
export const lesserSpren = lifeformList
  .filter((e) => e.kind === 'lesser-spren')
  .sort((a, b) => a.name.localeCompare(b.name))

/**
 * The lesser spren page's groups, in order: what draws each kind. Kinds in
 * neither list go under the last.
 */
export const lesserSprenGroups: {
  id: string
  title: string
  ids?: string[]
}[] = [
  {
    id: 'emotion-spren',
    title: 'Emotion spren',
    ids: [
      'agonyspren',
      'alespren',
      'angerspren',
      'anguishspren',
      'anticipationspren',
      'anxietyspren',
      'awespren',
      'betrayalspren',
      'captivityspren',
      'concentrationspren',
      'confusionspren',
      'disgustspren',
      'exhaustionspren',
      'fearspren',
      'gloomspren',
      'gloryspren',
      'hungerspren',
      'irritationspren',
      'joyspren',
      'laughterspren',
      'logicspren',
      'painspren',
      'passionspren',
      'persuasionspren',
      'shamespren',
      'shockspren',
      'sincerityspren',
      'solemnityspren',
    ],
  },
  {
    id: 'nature-spren',
    title: 'Nature spren',
    ids: [
      'coldspren',
      'deathspren',
      'decayspren',
      'flamespren',
      'gravitationspren',
      'groundspren',
      'lifespren',
      'luckspren',
      'mandra',
      'plaguespren',
      'rainspren',
      'riverspren',
      'rotspren',
      'starspren',
      'stormstriders',
      'wavespren',
      'windspren',
    ],
  },
  { id: 'other-spren', title: 'Other lesser spren' },
]

/** True spren with pages of their own, summed up on the True spren page. */
export const trueSpren = lifeformList
  .filter((e) => e.kind === 'true-spren')
  .sort((a, b) => a.name.localeCompare(b.name))

const bookOrder = books.map((b) => b.id)
const spren = lifeformList.find((e) => e.id === 'spren')!

/** A page for a group of spren, shown once any of them is. */
const groupEntry = (
  id: string,
  name: string,
  members: ListedLifeform[],
): ListedLifeform => ({
  id,
  name,
  kind: 'spren',
  world: 'roshar',
  revealedIn: members.flatMap((e) => entryRevealedIn('lifeform', e)),
  books: bookOrder.filter((b) => members.some((e) => e.books.includes(b))),
  coppermindPage: 'Spren',
})

/** The shared page, shown once any lesser spren is. */
export const lesserSprenEntry = groupEntry(
  'lesser-spren',
  'Lesser spren',
  lesserSpren,
)

/** An overview of the true spren, shown once any of them is. */
export const trueSprenEntry = groupEntry('true-spren', 'True spren', trueSpren)

/** One-of-a-kind spren; shown once its own intro is (entryReveals). */
export const uniqueSprenEntry: ListedLifeform = {
  ...groupEntry('unique-spren', 'Unique spren', [spren]),
  revealedIn: [],
}

/** The pages for groups of spren, listed with Spren. */
export const sprenGroupEntries = [
  lesserSprenEntry,
  trueSprenEntry,
  uniqueSprenEntry,
]

/** Where an entry's page is: a lesser spren's is its part of the shared page. */
export const lifeformHref = (e: { id: string; kind: ListedLifeformKind }) =>
  e.kind === 'lesser-spren'
    ? `/lifeforms/${lesserSprenEntry.id}#${e.id}`
    : `/lifeforms/${e.id}`

/** The Lifeforms tab's list, with the lesser spren as their one page. */
export const listedLifeforms: ListedLifeform[] = [
  ...lifeformList.filter((e) => e.kind !== 'lesser-spren'),
  ...sprenGroupEntries,
]
