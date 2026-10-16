# Cosmere Interactive Guide

An interactive star map of Brandon Sanderson's Cosmere. Click a system to zoom into its planets, then click a planet for details.

## Stack

- **React 19 + TypeScript**, bundled with **Vite**
- **React Router** for deep links (`/systems/:systemId/planets/:planetId`, `/characters/:characterId`)
- **Motion** (`motion/react`) for zoom transitions and hover effects (respects `prefers-reduced-motion`)
- **Vitest + Testing Library** for tests
- **oxlint + Prettier** for linting and formatting

## Getting started

Requires Node 22.22+ (see `.nvmrc`).

```sh
npm install
npm run dev
```

## Scripts

| Command                            | Purpose                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `npm run dev`                      | Start the dev server                                                         |
| `npm run build`                    | Typecheck and build to `dist/`                                               |
| `npm run preview`                  | Serve the production build                                                   |
| `npm run typecheck`                | TypeScript only                                                              |
| `npm run lint`                     | oxlint                                                                       |
| `npm run format`                   | Prettier (write)                                                             |
| `npm test`                         | Vitest in watch mode (`test:run` for CI)                                     |
| `npm run data:fetch`               | Pull raw wikitext from the Coppermind API                                    |
| `npm run spoiler:snapshot -- <id>` | Check a character page against the Coppermind Time Machine (see `AGENTS.md`) |

## Project layout

```
src/
  components/Layout.tsx   App shell and animated route transitions
  navigation.ts           Main header tabs; add tabs here (`comingSoon` = placeholder page)
  routes/                 StarMap, SystemView, PlanetDetail, LocationDetail, CharacterList, CharacterDetail, Books, BookDetail, SearchPage, ComingSoon, NotFound, RouteError
  routes.tsx              Route table (shared by app and tests)
  data/types.ts           StarSystem / Planet / Character schema
  data/systems.ts         Curated system and planet data
  data/characters.ts      Every Cosmere character's name (generated from the Coppermind)
  data/characterDetails.ts  Spoiler-tagged facts per character (books, world, aliases, species, abilities); pilot set
  data/places/            Places on each planet, one file per planet
  data/books.ts           Every Cosmere book, grouped by series
  data/chapters.ts        Chapters of each book in reading order (ids match Coppermind footnotes)
  data/progress.ts        Reader progress and spoiler checks: a tag is a book id or { book, chapter }
  search/sources.ts       What search covers; add a SearchSource to make new data searchable
  styles/index.css        Global styles
scripts/
  fetch-coppermind.ts     Coppermind API fetcher → data/raw/ (git-ignored)
```

## Data

**Cosmere only:** every piece of data in the guide must come from Brandon Sanderson's Cosmere. Leave out his other works (Skyward, The Reckoners, Alcatraz, etc.) even though the Coppermind covers them. See the Cosmere-only rule in [ROADMAP.md](ROADMAP.md).

`src/data/systems.ts` holds hand-written seed data for the 9 known systems (Drominad, Nalthian, Rosharan, Scadrian, Selish, Taldain, Threnodite, UTol and Yolish), with one key planet each where known. Map positions are stylized, not canonical.

To pull source material, run `npm run data:fetch` (or `npm run data:fetch -- Page_Name ...`) and curate the output into `systems.ts`.

> The Coppermind API is behind a Cloudflare bot challenge and may return 403 to scripts. If that happens, export pages manually via [Special:Export](https://coppermind.net/wiki/Special:Export) or ask the Coppermind team about API access.

## Licensing

- Wiki content is based on [the Coppermind](https://coppermind.net), whose text is licensed [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) (attribution, non-commercial, no derivatives). This is a private site for now; before any public release, ask 17th Shard (see the Coppermind's Copyrights page) about our paraphrased summaries.
- Do not use official Cosmere artwork. This is an unofficial fan project, not affiliated with Dragonsteel.

# cosmereinteractiveguide
