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

/** What one entry of each type is called, e.g. on its page. */
export const cultureKindNames: Record<ListedCultureKind, string> = {
  house: 'House or family',
  title: 'Rank, title or profession',
  class: 'Social class',
  people: 'People',
  religion: 'Religion or belief',
  organization: 'Organization',
  language: 'Language or script',
  custom: 'Custom, law or holiday',
  literature: 'Literature, song or show',
  myth: 'Myth or legend',
  food: 'Food, drink or drug',
  clothing: 'Clothing',
  currency: 'Currency',
  game: 'Game, sport or fighting style',
  other: 'Other',
}
