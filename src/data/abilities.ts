import type { ListedAbilityKind } from './types'

export { abilityList } from './abilityList'

/** Type labels for the Abilities list, in the order its groups appear. */
export const abilityKindLabels: Record<ListedAbilityKind, string> = {
  system: 'Magic systems',
  metal: 'Metals',
  order: 'Orders',
  user: 'Users and Invested beings',
  bond: 'Bonds',
  investiture: 'Investiture',
  item: 'Objects and materials',
  concept: 'Concepts',
}

/** What one entry of each type is called, e.g. on its page. */
export const abilityKindNames: Record<ListedAbilityKind, string> = {
  system: 'Magic system',
  metal: 'Metal',
  order: 'Order',
  user: 'User or Invested being',
  bond: 'Bond',
  investiture: 'Investiture',
  item: 'Object or material',
  concept: 'Concept',
}
