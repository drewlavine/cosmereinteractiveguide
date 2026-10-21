import { cultureKindLabels, cultureList } from '../data/culture'
import { EntryList } from './EntryList'

export function CultureList() {
  return (
    <EntryList
      kind="culture"
      list={cultureList}
      kindLabels={cultureKindLabels}
      title="Culture"
      path="culture"
      noun="culture"
    />
  )
}
