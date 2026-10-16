// Spoiler check against the Coppermind's Time Machine
// (https://coppermind.net/wiki/Special:TimeMachine): for each snapshot, shows
// what a character's page tells a reader who has read every book out by then,
// next to the Coppermind page as it was then. Anything we show that the wiki
// didn't know yet came from a later book: a spoiler.
//
// Usage: npm run spoiler:snapshot -- <character-id> [snapshot-date ...]
// Writes data/raw/timemachine/<id>/<date>.{ours.txt,wiki} (git-ignored; a
// persona's page goes to <character-id>/<date>.<persona>.ours.txt) and
// prints, per snapshot, capitalised terms we use that the old page never
// mentions. Those are leads to read, not verdicts: the old page may just be
// shorter than ours. Fetches through headless Chrome (~/cig-characters/fetch.sh),
// as the Coppermind's Cloudflare blocks plain requests.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { books } from '../src/data/books.ts'
import { findPerson } from '../src/data/people.ts'
import {
  findPersona,
  readerCanSee,
  revealCharacter,
  revealStory,
  revealTravels,
} from '../src/data/reveal.ts'
import { characterTravels } from '../src/data/travels.ts'
import type { CharacterStory } from '../src/data/types.ts'

/**
 * The Time Machine's Cosmere snapshots: each is taken just before the books
 * in `notYet` came out. Other books of the same year count as out.
 */
const snapshots = [
  {
    date: '2014-03-01',
    notYet: ['words-of-radiance', 'allomancer-jak', 'sixth-of-the-dusk'],
  },
  { date: '2015-10-04', notYet: ['shadows-of-self'] },
  { date: '2017-11-12', notYet: ['oathbringer'] },
  { date: '2020-11-01', notYet: ['dawnshard', 'rhythm-of-war'] },
  { date: '2022-11-13', notYet: ['lost-metal'] },
  { date: '2022-12-31', notYet: [] },
  { date: '2023-06-30', notYet: ['yumi', 'sunlit-man'] },
  { date: '2023-09-30', notYet: ['sunlit-man'] },
  { date: '2024-12-05', notYet: ['wind-and-truth'] },
  {
    date: '2025-06-30',
    notYet: ['isles-of-the-emberdark', 'elsecaller', 'king-lopen'],
  },
  { date: '2026-09-14', notYet: ['fires-of-december'] },
]

const FETCH = join(homedir(), 'cig-characters', 'fetch.sh')
const API = 'https://coppermind.net/w/api.php'
const ROOT = join(import.meta.dirname, '..')

const [id, ...dates] = process.argv.slice(2)
const person = findPerson(id)
if (!id || !person) {
  console.error('usage: npm run spoiler:snapshot -- <character-id> [date ...]')
  process.exit(1)
}
const characterId = findPersona(id)?.characterId ?? id
const page = (findPerson(characterId) ?? person).coppermindPage
const storyFile = join(ROOT, 'src/data/stories', `${characterId}.json`)
// Characters with Key facts but no story yet are still worth checking.
const story: CharacterStory = existsSync(storyFile)
  ? JSON.parse(readFileSync(storyFile, 'utf8'))
  : { intro: [], history: [], appearance: [], personality: [] }

/** The page's latest wikitext from before `date`, via headless Chrome. */
function revisionBefore(title: string, date: string) {
  const url = new URL(API)
  url.search = new URLSearchParams({
    action: 'query',
    prop: 'revisions',
    titles: title,
    rvstart: `${date}T00:00:00Z`,
    rvdir: 'older',
    rvlimit: '1',
    rvprop: 'ids|timestamp|content',
    rvslots: 'main',
    format: 'json',
    formatversion: '2',
  }).toString()
  const out = join(tmpdir(), `cig-tm-${process.pid}.html`)
  execFileSync(FETCH, [url.toString(), out], { stdio: 'ignore', cwd: tmpdir() })
  const dom = readFileSync(out, 'utf8')
  const json = dom
    .replace(/^[\s\S]*?<pre[^>]*>/, '')
    .replace(/<\/pre>[\s\S]*$/, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
  const rev = JSON.parse(json).query?.pages?.[0]?.revisions?.[0]
  return rev
    ? { id: rev.revid as number, text: rev.slots.main.content as string }
    : undefined
}

/**
 * The wikitext from before `date`, following redirects and, for a
 * disambiguation page (e.g. Felt before the wiki knew his two worlds' Felts
 * were one man), every page it lists.
 */
function wikitextBefore(title: string, date: string, depth = 0): string {
  const rev = revisionBefore(title, date)
  if (!rev) return ''
  const redirect = rev.text.match(/^#REDIRECT\s*\[\[([^\]|#]+)/i)
  if (redirect && depth < 2) return wikitextBefore(redirect[1], date, depth + 1)
  if (/\{\{disambig/i.test(rev.text) && depth < 2)
    return [
      rev.text,
      ...[...rev.text.matchAll(/^\*\s*\[\[([^\]|#]+)/gm)].map((m) =>
        wikitextBefore(m[1], date, depth + 1),
      ),
    ].join('\n')
  return rev.text
}

/** Everything the page shows this reader, as plain lines. */
function ours(read: Set<string>) {
  const canSee = readerCanSee({ read, reading: new Map() })
  const persona = findPersona(id)
  const pageId =
    persona && canSee(persona.identityRevealedIn) ? characterId : id
  const shown = revealCharacter(pageId, canSee)
  if (!shown.met) return []
  const prose = revealStory(pageId, story, canSee)
  const travels = revealTravels(pageId, characterTravels[characterId], canSee)
  return [
    `page: ${pageId}`,
    `aliases: ${shown.aliases.join(', ')}`,
    `species: ${shown.species.join(', ')}`,
    `nationality: ${shown.nationality.join(', ')}`,
    `profession: ${shown.profession.join(', ')}`,
    `abilities: ${shown.abilities.join(', ')}`,
    `groups: ${shown.groups.join(', ')}`,
    `bonds: ${shown.bonds.join(', ')}`,
    `family: ${shown.relatives.map((r) => `${r.name} (${r.relation})`).join(', ')}`,
    `intro: ${prose.intro ?? ''}`,
    ...prose.history.flatMap((s) => [
      `## ${s.title ?? ''}`,
      ...s.items.map((i) => i.text),
    ]),
    ...prose.appearance,
    ...prose.personality,
    ...travels.stops.flatMap((s) => [
      `travel: ${s.planetId} ${s.place ?? ''}`,
      ...[s.uncertain, s.wob].filter((t) => t !== undefined),
      ...s.events.map((e) => e.text),
    ]),
  ]
}

const dir = join(ROOT, 'data/raw/timemachine', characterId)
mkdirSync(dir, { recursive: true })
for (const { date, notYet } of snapshots) {
  if (dates.length > 0 && !dates.includes(date)) continue
  const year = Number(date.slice(0, 4))
  const read = new Set(
    books
      .filter(
        (b) => b.year < year || (b.year === year && !notYet.includes(b.id)),
      )
      .map((b) => b.id),
  )
  const lines = ours(read)
  if (lines.length === 0) {
    console.log(`${date}: not met yet`)
    continue
  }
  const wikiFile = join(dir, `${date}.wiki`)
  let wiki = existsSync(wikiFile) ? readFileSync(wikiFile, 'utf8') : undefined
  if (wiki === undefined) {
    wiki = wikitextBefore(page, date)
    if (!wiki)
      console.log(`${date}: no Coppermind page yet; check every line by hand`)
    writeFileSync(wikiFile, wiki)
  }
  const oursName = id === characterId ? date : `${date}.${id}`
  writeFileSync(join(dir, `${oursName}.ours.txt`), lines.join('\n') + '\n')
  const known = wiki.toLowerCase()
  // Capitalised words, possessives dropped, skipping each sentence's first.
  const terms = [
    ...new Set(
      lines.flatMap((line) =>
        line
          .replace(/^[\w ]+: /, '')
          .split(/(?<=[.!?:])\s+|^## /)
          .flatMap((sentence) =>
            sentence
              .split(/\s+/)
              .slice(1)
              .map((w) => w.replace(/[’']s$|[^\w'’-]/g, ''))
              .filter((w) => /^[A-Z]/.test(w)),
          ),
      ),
    ),
  ].filter((t) => !known.includes(t.toLowerCase()))
  console.log(
    `${date} (read ${read.size} books): ${terms.length} terms not on the old page` +
      (terms.length ? `\n  ${terms.join(', ')}` : ''),
  )
}
console.log(`files in ${dir}`)
