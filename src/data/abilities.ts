import type { ListedAbilityKind } from './types'

export { abilityList } from './abilityList'

/** Type labels for the Abilities list, in the order its groups appear. */
export const abilityKindLabels: Record<ListedAbilityKind, string> = {
  system: 'Magic systems',
  power: 'Powers',
  metal: 'Metals',
  order: 'Orders',
  user: 'Users and Invested beings',
  bond: 'Bonds',
  investiture: 'Investiture',
  item: 'Invested objects',
  concept: 'Concepts',
}

/** What one entry of each type is called, e.g. on its page. */
export const abilityKindNames: Record<ListedAbilityKind, string> = {
  system: 'Magic system',
  power: 'Power',
  metal: 'Metal',
  order: 'Order',
  user: 'User or Invested being',
  bond: 'Bond',
  investiture: 'Investiture',
  item: 'Invested object',
  concept: 'Concept',
}
