# Agent guide: engineering

Cosmere Interactive Guide: a private, unofficial, spoiler-safe fan guide to
Brandon Sanderson's Cosmere. Vite + React 19 + TypeScript. Content comes from
the Coppermind (text CC BY-NC-ND 4.0, art credited per piece; keep the
licence footer).

**Spoilers come first.** The canonical spoiler and dating rules, and the
content pipeline that writes `src/data/characterDetails.ts` and
`src/data/stories/`, live in `~/cig-char-data/AGENTS.md`. Read it before
touching any content. `ROADMAP.md` ("Spoiler rule", "Dating a fact",
"Cosmere-only rule") holds the product-level version.

## Working rules

- Ask before committing or pushing. Commits end with
  `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`.
- Never stage `personal_sshkey*` (also git-ignored).
- Tick `ROADMAP.md` items when a feature ships; keep README's scripts table
  current.
- Don't hand-edit generated files (`characterDetails.ts`, `stories/*.json`):
  change the pipeline input and re-emit.

## Checks

Run before reporting any change:

```sh
npx tsc -b && npm run lint && npx vitest run && npm run build
```

For any content change, also run the Coppermind Time Machine check for each
character touched:

```sh
npm run spoiler:snapshot -- <character-id>
```

It shows what each character page tells a reader at each Time Machine
snapshot, next to the Coppermind page as it was then, and lists terms the old
page never mentions. Read every lead, starting with the intro, Key facts,
History headings, art and Travels. It's a safety net for book-level slips,
not a replacement for footnote dating, and old pages are only for comparison,
never a source (the content guide has the full method). It
fetches through headless Chrome (`~/cig-characters/fetch.sh`) and writes to
`data/raw/timemachine/` (git-ignored).

## How spoilers work in the app

- Every fact carries `revealedIn: Reveal`: an any-of list of points, each a
  book id (finished), `{book, chapter}` (reached), or `{all: [...]}`.
- `src/data/reveal.ts` trims data to what the reader may see (`revealCharacter`,
  `revealStory`, `revealPortrait`, `revealTravels`); components only render
  the trimmed result. Hide completely: no placeholders that hint something
  exists.
- The only exception is the **Show anyway** notice ("Some information hidden
  due to spoilers."), which never names the hidden books.
- Unmet characters are hidden from lists and search; personas get their own
  page until the reader can tell who they are, then redirect.
- Unknown chapter ids stay hidden rather than risk a spoiler.

Tests in `src/characters.test.tsx` and `src/data/*.test.ts` pin spoiler
behaviour at specific chapters; add one for every new kind of reveal.

## Screenshots

To look at a page as a reader at a given point:

1. `npm run build && cp scripts/screenshot-seed.html dist/seed.html`
2. `npx vite preview --port 5198 --strictPort` (in the background)
3. Headless Chrome with a fresh `--user-data-dir`, `--virtual-time-budget=6000`,
   `--window-size=1280,1100` (390,844 for phones), `--screenshot=<file>` on
   `http://localhost:5198/seed.html?read=<url-encoded JSON book ids>&reading=<url-encoded {"book": "chapter"}>&to=<url-encoded path>`.
4. Afterwards stop the server (`lsof -ti tcp:5198`, then `kill <pid>`) and
   delete `dist/seed.html`.

Check phones as well as desktop.
