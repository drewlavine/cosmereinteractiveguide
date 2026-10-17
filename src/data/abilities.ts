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
