# Cosmere Interactive Guide

An interactive star map of Brandon Sanderson's Cosmere. Click a system to zoom into its planets, then click a planet for details.

## Stack

- **React 19 + TypeScript**, bundled with **Vite**
- **React Router** for deep links (`/systems/:systemId/planets/:planetId`)
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

| Command              | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Start the dev server                      |
| `npm run build`      | Typecheck and build to `dist/`            |
| `npm run preview`    | Serve the production build                |
| `npm run typecheck`  | TypeScript only                           |
| `npm run lint`       | oxlint                                    |
| `npm run format`     | Prettier (write)                          |
| `npm test`           | Vitest in watch mode (`test:run` for CI)  |
| `npm run data:fetch` | Pull raw wikitext from the Coppermind API |

## Project layout

```
src/
  components/Layout.tsx   App shell and animated route transitions
  routes/                 StarMap, SystemView, PlanetDetail, NotFound, RouteError
  routes.tsx              Route table (shared by app and tests)
  data/types.ts           StarSystem / Planet schema
  data/systems.ts         Curated system and planet data
  styles/index.css        Global styles
scripts/
  fetch-coppermind.ts     Coppermind API fetcher → data/raw/ (git-ignored)
```

## Data

`src/data/systems.ts` holds hand-written seed data for the 9 known systems (Drominad, Nalthian, Rosharan, Scadrian, Selish, Taldain, Threnodite, UTol and Yolish), with one key planet each where known. Map positions are stylized, not canonical.

To pull source material, run `npm run data:fetch` (or `npm run data:fetch -- Page_Name ...`) and curate the output into `systems.ts`.

> The Coppermind API is behind a Cloudflare bot challenge and may return 403 to scripts. If that happens, export pages manually via [Special:Export](https://coppermind.net/wiki/Special:Export) or ask the Coppermind team about API access.

## Licensing

- Wiki content is adapted from [the Coppermind](https://coppermind.net) under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Derived content must keep attribution, stay non-commercial and use the same license.
- Do not use official Cosmere artwork. This is an unofficial fan project, not affiliated with Dragonsteel.
# cosmereinteractiveguide
