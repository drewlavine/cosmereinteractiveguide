import type { ListedCultureKind } from './types'

export { cultureList } from './cultureList'

/** Type labels for the Culture list, in the order its groups appear. */
export const cultureKindLabels: Record<ListedCultureKind, string> = {
  house: 'Houses and families',
  title: 'Ranks, titles and professions',
  class: 'Social classes',
  people: 'Peoples',
  religion: 'Religions and beliefs',
  organization: 'Organizations',
  language: 'Languages and scripts',
  custom: 'Customs, laws and holidays',
  literature: 'Literature, songs and shows',
  myth: 'Myths and legends',
  food: 'Food, drink and drugs',
  clothing: 'Clothing',
  currency: 'Currency',
  game: 'Games, sports and fighting styles',
  other: 'Other',
}
