import { abilityList } from './abilities'
import { books } from './books'
import { characterDetails } from './characterDetails'
import { cultureList } from './culture'
import { entryAliases } from './entryAliases'
import { entryRevealedIn, shownAliases, type EntryKind } from './entryStories'
import { listedLocations, placeHref, placeRevealedIn } from './listedLocations'
import { people } from './people'
import {
  findPersona,
  hasMet,
  revealCharacter,
  seenThrough,
  type CanSee,
} from './reveal'
import { systems } from './systems'

/** A page that prose may link to, under the names it goes by. */
interface Target {
  /** Same for every name of one page (a persona counts as its character). */
  key: string
  href: string
  /** Its own name; beats another page's alias. */
  names: string[]
  /** Short names, aliases, plurals. */
  aliases: string[]
}

/** One name to look for in prose, and where it leads. */
export interface TextLink {
  name: string
  href: string
  key: string
}

/**
 * Names that are also everyday words, which prose uses capitalized at the
 * start of a sentence or in a book title ("Wind and Truth").
 */
const commonWords = new Set([
  'A',
  'An',
  'The',
  'And',
  'Of',
  'King',
  'Queen',
  'Lord',
  'Lady',
  'Prince',
  'Princess',
  'Father',
  'Mother',
  'Sister',
  'Brother',
  'God',
  'Captain',
  'Light',
  'Dawn',
  'Hope',
  'Wind',
  'Truth',
  'Way',
  'Kings',
  'Words',
  'Radiance',
  'Rhythm',
  'War',
  'Storm',
  'Calling',
  'Shadows',
  'Self',
  'Bands',
  'Mourning',
  'Alloy',
  'Law',
  'Hero',
  'Ages',
  'Well',
  'Ascension',
  'Empire',
  'Final',
  'Lost',
  'Metal',
  'Secret',
  'History',
  'Array',
  'Ash',
  'Beautiful',
  'Bleeder',
  'Blunt',
  'Brightness',
  'Caller',
  'Chain',
  'Citizen',
  'Command',
  'Compassion',
  'Confidence',
  'Connection',
  'Contemplation',
  'Cord',
  'Darkness',
  'Death',
  'Den',
  'Design',
  'Diem',
  'Division',
  'Drifter',
  'Drummer',
  'Dust',
  'Evil',
  'Faith',
  'Farmer',
  'Fay',
  'Fin',
  'First',
  'Fleet',
  'Formless',
  'Fortune',
  'Frost',
  'Gallant',
  'Gift',
  'Grand',
  'Graves',
  'Ham',
  'Hardy',
  'Herald',
  'Hid',
  'Identity',
  'Intent',
  'Ire',
  'Keeper',
  'Laird',
  'Lieutenant',
  'Lifeless',
  'Lordling',
  'Market',
  'May',
  'Merit',
  'Mesh',
  'Moore',
  'Mosaic',
  'Motif',
  'Nameless',
  'Night',
  'Noble',
  'Origin',
  'Ornament',
  'Passion',
  'Prime',
  'Prophet',
  'Purity',
  'Pursuer',
  'Reason',
  'Returned',
  'Ring',
  'Roamer',
  'Rod',
  'Rust',
  'Sand',
  'Scion',
  'Set',
  'She',
  'Sibling',
  'Sixteen',
  'Song',
  'Sorceress',
  'Sovereign',
  'Spark',
  'Spirit',
  'Star',
  'Stone',
  'Sunken',
  'Sunlit',
  'Sword',
  'Tag',
  'Tanner',
  'Tax',
  'Ten',
  'Testament',
  'Thinker',
  'Third',
  'Thrill',
  'Took',
  'Trap',
  'Union',
  'Valley',
  'Voice',
  'Wanderer',
  'Ward',
  'Warren',
  'Watcher',
  'Weeper',
  'Word',
])

const words = (s: string) => s.match(/[\p{L}\p{N}]+/gu) ?? []
const firstWord = (name: string) => name.split(' ')[0]
const titleOnly = (name: string) => name.replace(/\s*\(.*\)$/, '')

const firstWordCounts = new Map<string, number>()
for (const { name } of people)
  firstWordCounts.set(
    firstWord(name),
    (firstWordCounts.get(firstWord(name)) ?? 0) + 1,
  )

/** "Dalinar" for Dalinar Kholin, if no other character starts that way. */
const shortName = (name: string) =>
  name.includes(' ') && firstWordCounts.get(firstWord(name)) === 1
    ? [firstWord(name)]
    : []

const plural = (name: string) =>
  /(s|sh|ch|x|z)$/.test(name) ? `${name}es` : `${name}s`

const planetNames = new Set(
  systems.flatMap((s) => s.planets.map((p) => p.name)),
)

const planetShownBy = (canSee: CanSee) => (planetId: string) =>
  systems.some((s) =>
    s.planets.some((p) => p.id === planetId && canSee(p.revealedIn)),
  )

/** Every page prose may link to that `canSee` shows, with its names. */
function targets(canSee: CanSee): Target[] {
  const out: Target[] = []
  for (const c of people) {
    const persona = findPersona(c.id)
    const realId = persona?.characterId ?? c.id
    if (!characterDetails[realId]) continue
    // Once seen through, a persona's name leads to the character instead.
    if (persona && seenThrough(persona, canSee)) continue
    if (!hasMet(c.id, canSee)) continue
    const shown = persona ? undefined : revealCharacter(c.id, canSee)
    out.push({
      key: `character:${realId}`,
      href: `/characters/${c.id}`,
      names: [titleOnly(c.name)],
      aliases: [
        ...shortName(c.name),
        ...(shown?.personas.map((p) => p.name) ?? []),
        ...(shown?.aliases ?? []),
      ],
    })
  }
  const planetShown = planetShownBy(canSee)
  for (const l of listedLocations)
    if (canSee(placeRevealedIn(l)))
      out.push({
        key: `place:${l.id}`,
        href: placeHref(l, planetShown),
        // "Roshar" is the planet before the continent.
        names: planetNames.has(l.name) ? [] : [l.name, plural(l.name)],
        aliases: planetNames.has(l.name) ? [l.name] : [],
      })
  for (const s of systems)
    for (const p of s.planets)
      if (canSee(p.revealedIn))
        out.push({
          key: `place:${p.id}`,
          href: `/systems/${s.id}/planets/${p.id}`,
          names: [p.name],
          aliases:
            p.altName && canSee(p.altName.revealedIn) ? [p.altName.text] : [],
        })
  const entries = (
    kind: EntryKind,
    list: typeof abilityList | typeof cultureList,
    path: string,
  ) => {
    for (const e of list)
      if (canSee(entryRevealedIn(kind, e)))
        out.push({
          key: `${kind}:${e.id}`,
          href: `/${path}/${e.id}`,
          names: [e.name, plural(e.name)],
          aliases: shownAliases(kind, e, canSee).flatMap((a) => [
            a.name,
            plural(a.name),
          ]),
        })
  }
  entries('ability', abilityList, 'magic')
  entries('culture', cultureList, 'culture')
  return out
}

/**
 * The one page each name leads to in any book: the page it names, else the
 * one page it's an alias of. Names two pages share (two Sivis) lead nowhere,
 * so prose never guesses between them.
 */
const owner = (() => {
  const all = () => true
  const own = new Map<string, Set<string>>()
  const alias = new Map<string, Set<string>>()
  const add = (map: typeof own, name: string, key: string) =>
    map.set(name, (map.get(name) ?? new Set()).add(key))
  for (const t of targets(all)) {
    for (const n of t.names) add(own, n, t.key)
    for (const n of t.aliases) add(alias, n, t.key)
  }
  // Aliases revealed in any book count too.
  for (const kind of ['ability', 'culture'] as const)
    for (const [id, aliases] of Object.entries(entryAliases[kind]))
      for (const a of aliases) add(alias, a.name, `${kind}:${id}`)
  const only = (keys?: Set<string>) =>
    keys?.size === 1 ? [...keys][0] : undefined
  return (name: string) =>
    own.has(name) ? only(own.get(name)) : only(alias.get(name))
})()

/**
 * The names prose may link for a reader, longest first: only pages they can
 * see, never a name two pages share, never an everyday word.
 */
export function textLinks(canSee: CanSee): TextLink[] {
  const links: TextLink[] = []
  const seen = new Set<string>()
  for (const t of targets(canSee)) {
    for (const name of [...t.names, ...t.aliases]) {
      if (
        seen.has(name) ||
        name.length < 3 ||
        owner(name) !== t.key ||
        commonWords.has(name) ||
        !/^\p{Lu}/u.test(name)
      )
        continue
      seen.add(name)
      links.push({ name, href: t.href, key: t.key })
    }
  }
  return links.sort((a, b) => b.name.length - a.name.length)
}

/** A run of prose: plain text, or a name to link. */
export type TextPart = string | { text: string; href: string }

const isWordChar = (c: string | undefined) => !!c && /[\p{L}\p{N}]/u.test(c)

// Book titles stay plain: "The Sunlit Man" isn't a mention of anyone.
const titles = books
  .flatMap((b) => [b.title, b.title.replace(/^The /, '')])
  .sort((a, b) => b.length - a.length)

/** Where book titles sit in `text`, as [start, end) pairs. */
function titleSpans(text: string) {
  const spans: [number, number][] = []
  for (const t of titles) {
    let at = text.indexOf(t)
    while (at >= 0) {
      spans.push([at, at + t.length])
      at = text.indexOf(t, at + t.length)
    }
  }
  return spans
}

/**
 * Splits `text` into plain runs and linked names. Each page is linked once
 * per `linked` set (pass one set per section), never itself (`selfKey`).
 */
export function linkText(
  text: string,
  index: Map<string, TextLink[]>,
  linked: Set<string>,
  selfKey?: string,
): TextPart[] {
  const parts: TextPart[] = []
  const spans = titleSpans(text)
  let last = 0
  for (const m of text.matchAll(/[\p{L}\p{N}]+/gu)) {
    const at = m.index
    if (at < last || isWordChar(text[at - 1])) continue
    if (spans.some(([from, to]) => at >= from && at < to)) continue
    const hit = index
      .get(m[0])
      ?.find(
        (l) =>
          text.startsWith(l.name, at) &&
          !isWordChar(text[at + l.name.length]) &&
          !linked.has(l.key) &&
          l.key !== selfKey,
      )
    if (!hit) continue
    linked.add(hit.key)
    if (at > last) parts.push(text.slice(last, at))
    parts.push({ text: hit.name, href: hit.href })
    last = at + hit.name.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

/** Links grouped by their first word, longest name first. */
export function linkIndex(links: TextLink[]) {
  const index = new Map<string, TextLink[]>()
  for (const l of links) {
    const first = words(l.name)[0]
    if (!first) continue
    index.set(first, [...(index.get(first) ?? []), l])
  }
  return index
}
