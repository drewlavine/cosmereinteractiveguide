# Book page: chapter-by-chapter map (plan)

A cosmeremaps.com-style map and timeline at the top of each book page. The reader steps
through the book one chapter at a time and sees where everyone is and what is happening.
The rest of the book page stays as it is until this ships.

## 1. What cosmeremaps.com does (researched)

- Source: `altonchaney/cosmere-maps` (MIT). It is a CRA app on top of the author's own
  `character-journey-map` package, which uses **Leaflet + react-leaflet** with
  `react-range` for the chapter slider.
- **Data** (`src/data/*.ts`):
  - per series: one map image (Roshar is 1000×1720, Stoneward13), with an alternate
    Shadesmar image
  - chapter lists with parts and interludes (e.g. `11.1` = Interlude 1)
  - characters with a colour and their first appearance
  - locations with the chapters they appear in
  - **paths**: `{character, installment, chapter, confirmed, coordinates[]}`, meaning a
    character moves along this line in this chapter
- **Coverage** (number of paths): Stormlight 358 (Way of Kings 8, Words of Radiance 34,
  Edgedancer 4, Oathbringer 95, Dawnshard 24, Rhythm of War 61, Wind and Truth 132);
  Mistborn Era 1 84; Era 2 52.
- **UX:** pick a series, then filter by book, character and a chapter range. It draws
  each character's paths in their colour. There's no spoiler gating; the reader just
  avoids moving the slider too far.

## 2. What we want (UX)

- **Map** at the top of `BookDetail`: about 60vh on desktop, 50vh on phones, full width.
- **Chapter scrubber** under the map:
  - ticks for parts and interludes (labels from `chapters.ts`)
  - Prev / Next / Play buttons; ← → keys
  - the chapter is kept in the URL (`?ch=12`) so a link opens at the same point
- **On the map at chapter N:**
  - each character in this chapter: a **portrait marker**, never a blank dot (see
    "Markers" below)
  - this chapter's route drawn solid, earlier routes faded (trail: "this chapter / last
    5 / whole book")
  - characters not in this chapter: a dimmed marker at their last known spot, or hidden
    (the "Others" toggle)
  - the view fits the chapter's characters and routes; on a region map, a marker
    standing for an inner map (a city) opens that map when clicked
- **"This chapter" panel** (beside the map on desktop, below it on phones): POV
  characters, place, and a one-line, factual reminder of what happens (journey-event
  rules in `STORY_GUIDE.md`), with links to the character pages.
- **Character chips** to filter: picking one or more follows just them (markers,
  routes and the view); "Show everyone" clears it. Each chip has a small link to the
  character's page. They are also the **legend**: each chip shows the same portrait,
  ring colour and name as the marker.
- **Markers:**
  - a round crop of the character's portrait, with a thick ring in their colour
  - the portrait comes from `revealPortrait` at the shown chapter, so the art is never
    later than the reader
  - no portrait: initials on a fill of their colour
  - routes are drawn in the same colour
  - dimmed (not in this chapter): greyscale portrait, faded, dashed ring
  - dimmed markers are drawn smaller and underneath, so the chapter's characters stay
    on top
  - several characters at one spot: a honeycomb fan around the spot, a fixed size on
    screen at every zoom, with the place's name below it
  - colour is never the only cue: each marker has a tooltip with the character's name,
    and since the map is decorative (`aria-hidden`), the chip list is the accessible
    equivalent, naming who is "not in this chapter" or "on another map"
- **Colours:**
  - a fixed categorical palette, about 12 colours, readable on the parchment maps and
    picked to stay distinct for colour-blind readers
  - assigned per book, in order of first appearance in that book, so a character keeps
    the same colour from chapter to chapter
  - the palette lives in one place (a CSS Module or token file), not per component
- **Several maps:** the map changes automatically when this chapter's scene is on another
  map (Shadesmar, Braize, a city map). City scenes zoom in using the existing parent and
  child maps (`AtlasMap.parent`).
- **Flashbacks** (e.g. Dalinar's in Oathbringer, Shallan's in Words of Radiance): drawn
  as a separate "flashback" marker and don't move the present-day marker.

## 3. Spoiler rules (non-negotiable)

- **Scrubber limit:**
  - a finished book: every chapter
  - the current book: up to the reader's chapter, and nothing after it
  - an unread book: no map at all (the page says nothing about what's in it)
- Everything shown goes through a new pure function in `reveal.ts`,
  `revealBookChapters(book, canSee, …)`. Components never see untrimmed data.
- **Characters:**
  - unmet characters don't exist on the map, in the chips or in the panel
  - personas show the persona's name and marker until the identity is revealed
  - a persona gets **its own colour and portrait**, never the real character's
    (a shared colour would give the twist away)
  - colours are assigned only from what the reader can see (met characters, in order of
    first appearance), so a gap in the palette never hints that someone is hidden
- **Places:** unnamed places use `placeName`, or "Unknown place" if there's none.
- **Chapters:** unknown chapter ids are hidden; interludes follow `chapters.ts` order.
- **Later facts:** text, art and routes are all revealed at **the chapter they show**,
  never later. A route that is only explained later is drawn approximate (dashed).
- **Show anyway:** "Show anyway" behaves as it does elsewhere, with the same generic
  notice.

## 4. Data: the real cost of this feature

The map is only as good as the per-chapter data. There are three sources:

| | A. Derive from our journeys | B. Import cosmere-maps | C. New per-chapter "scenes" |
|---|---|---|---|
| What it is | Reuse `journeys/*.json` events | Importer in `~/cig-journey-data` | Hand-built table: chapter → POV, place, route, line |
| Coverage | Thin: Way of Kings 46 events in 31 of about 90 chapters; Wind and Truth 28 chapters | Uneven: Way of Kings 8 paths; Wind and Truth 132; no Secret History | Complete, by construction |
| Fits "chapter N"? | **No.** Events are dated by *when they're revealed*, so backstory sits in the chapter that reveals it (e.g. "Shallan is born", Way of Kings 45) | **Yes.** Keyed to the chapter where the movement happens | **Yes** |
| Work | Small | Medium: reproject their map's pixels onto ours (control points + affine/TPS), map chapter ids, re-check every point | Large: about 90 chapters × 5 Stormlight books + Mistborn |
| Risk | Misleading map | Their points have no spoiler dating; their location prose has later-book spoilers (never import prose) | Effort and accuracy |

**Recommendation: B + C together, on our existing model.**
- Add two fields to `JourneyEvent`; don't create a new model, so `revealJourney`, the
  atlas and packs are all reused:
  - `happensIn?: {book, chapter}`: where the scene is *shown*, in reading order. This is
    what the book map steps through, while `revealedIn` stays the spoiler gate.
  - `flashback?: true`
- **Importer** (`~/cig-journey-data/import_cosmere_maps.py`): their paths → events with
  `happensIn`, coordinates reprojected, `confirmed: false` → `approximate`, and
  `source: "cosmere-maps"` with credit and an MIT notice.
- **Fill the gaps (C)** in the existing pipeline: POV and setting per chapter from the
  Coppermind chapter summaries (facts only, no prose copied), with a hand-written line
  per scene following STORY_GUIDE.
- **Generated checks:**
  - every chapter of a covered book has at least one scene
  - no `revealedIn` later than `happensIn` without an `approximate` flag
  - character ids exist
  - points fall inside the map

## 5. Rendering: three options

| | **A. SVG/DOM: extend `SvgMapEngine`** | **B. WebGL: Three.js + R3F** | **C. Leaflet (`CRS.Simple`)** |
|---|---|---|---|
| Reuse | Same engine, `MapEngine` interface, journey layers and geometry as the character journey map | The globe and colour-map prototype; the engine already chosen for the Explorer (D13) | What cosmeremaps uses; nothing of ours |
| Bundle | About 0 KB extra | About 180 KB gz (three + fiber + drei), lazy-loaded | About 45 KB gz (leaflet + react-leaflet v5) |
| Load per chapter (10–30 markers, a few routes) | Easy | Overkill | Easy |
| Animation (play, markers moving) | CSS transforms or rAF on `<g>`, smooth at this scale | Best: shaders, glow, globe | OK (marker transitions are fiddly) |
| Big or tiled maps, deep zoom | Single image; fine for our maps | Textures; fine | **Best**: tiles, mature pan and pinch |
| Accessibility | Real DOM: focusable markers, names and roles | Needs a parallel DOM layer | DOM markers, decent |
| Testing (jsdom + RTL) | Works today | Needs `@react-three/test-renderer` and screenshots | Partly; Leaflet needs layout mocks |
| Phones | Good (already used on character pages) | Good, but the GPU costs battery | Good |
| Consistency | Looks identical to the character journeys | Matches the future Explorer | A second look and a second engine to maintain |

**Recommendation: A (SVG)**, behind the existing `MapEngine` interface.
- It's the cheapest path, and accessible and testable today.
- It matches the character journey maps, and the marker count per chapter is small.
- The engine interface means a Three.js engine (B) can be swapped in later when the
  Explorer ships, without touching the data or reveal layers.
- C only wins on deep tiled zoom, which we don't need: city maps are separate child
  maps.

## 6. Delivery phases

1. **Pilot data** for one finished, single-map book. Pick between:
   - **The Final Empire**: our densest data (86 events) plus 27 cosmere-maps paths
   - **The Way of Kings**: weakest data, most interest
   
   Includes the `happensIn`/`flashback` fields, the importer, reprojection, checks, and
   a Time Machine spoiler check.
2. **`revealBookChapters` + tests**, pinned at chapter boundaries: the scrubber limit,
   unmet characters, personas, places, flashbacks, Show anyway.
3. **`BookChapterMap` component** (CSS Module): engine plus scrubber plus the "This
   chapter" panel, with URL state. Component tests by role and text.
4. **Play, trails, filters, map switching, city zoom, phone layout**, with screenshots
   at several reader points on desktop and phone.
5. **Roll out book by book.** Tick `ROADMAP` §11 and §16; update README and
   ARCHITECTURE 5.9.

## 7. Decisions (Drew)

- **Engine:** A, SVG on the existing `MapEngine`.
- **Pilot:** The Final Empire.
- **Characters not in the chapter:** dimmed at their last known spot.
- **cosmere-maps credit:** footer credits only.
- **Markers:** the character's portrait in a ring of their colour, never a blank dot;
  the chips double as the legend.
- **Built (phases 1–4):** `src/components/bookMap/` (`BookChapterMap`, CSS Module,
  `markers.ts`, `useBookScenes.ts`), `revealBookChapters` in `reveal.ts`, data in
  `src/data/bookScenes/`, written by `~/cig-journey-data` (`hand/scenes/`,
  `import_scenes.py`). Play is 2.6 s per chapter and stops at the reader's chapter.

## 8. Risks

- **Data effort** is about 90% of the work; the UI is small by comparison.
- **Reprojection error** between their map and ours: needs about 10 control points per
  map and a visual check.
- **Our chapter ids vs theirs** (`11.1` vs `interlude-1`): needs a mapping table and a
  check.
