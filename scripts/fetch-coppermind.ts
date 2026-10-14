// Downloads raw wikitext for Cosmere pages from the Coppermind MediaWiki API.
// Output goes to data/raw/ (git-ignored). Curate it into src/data/systems.ts.
// Usage: npm run data:fetch [-- Page_One Page_Two]
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const API = 'https://coppermind.net/w/api.php'
const OUT_DIR = join(import.meta.dirname, '..', 'data', 'raw')
const DEFAULT_PAGES = [
  'Rosharan_system',
  'Scadrian_system',
  'Nalthian_system',
  'Roshar',
  'Ashyn',
  'Braize',
  'Scadrial',
  'Nalthis',
]

interface ParseResponse {
  parse?: { title: string; wikitext: string }
  error?: { info: string }
}

const pages = process.argv.slice(2).length
  ? process.argv.slice(2)
  : DEFAULT_PAGES

await mkdir(OUT_DIR, { recursive: true })

for (const page of pages) {
  const url = new URL(API)
  url.search = new URLSearchParams({
    action: 'parse',
    page,
    prop: 'wikitext',
    redirects: '1',
    format: 'json',
    formatversion: '2',
  }).toString()

  const res = await fetch(url, {
    headers: { 'User-Agent': 'cosmere-interactive-guide (fan project)' },
  })
  if (!res.headers.get('content-type')?.includes('application/json')) {
    console.error(
      `✗ ${page}: got ${res.status} non-JSON response (likely a Cloudflare bot challenge). ` +
        'Try again later, or export pages manually via https://coppermind.net/wiki/Special:Export.',
    )
    process.exitCode = 1
    break
  }
  const body = (await res.json()) as ParseResponse
  if (!res.ok || !body.parse) {
    console.error(`✗ ${page}: ${body.error?.info ?? res.statusText}`)
    process.exitCode = 1
    continue
  }

  await writeFile(
    join(OUT_DIR, `${page}.json`),
    JSON.stringify(
      {
        title: body.parse.title,
        fetchedAt: new Date().toISOString(),
        wikitext: body.parse.wikitext,
      },
      null,
      2,
    ),
  )
  console.log(`✓ ${page}`)
  // Be polite to the wiki.
  await new Promise((r) => setTimeout(r, 500))
}
