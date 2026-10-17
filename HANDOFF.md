# Handoff: 2026-10-16 (updated later the same day)

For the next Copilot session (started from this repo). Read this, then
`AGENTS.md` (engineering) and `~/cig-char-data/AGENTS.md` (content and spoiler
rules) before doing anything. Delete or rewrite this file once it's stale.

## Working with Drew

- Replies: succinct bullets, no long prose.
- **Spoiler safety beats completeness.** Date facts by Coppermind footnotes
  first (see the content AGENTS.md).
- Ask before committing or pushing unless told to. When Drew is unavailable
  (no answer to a question), make a sensible choice, note it, and carry on.
- Private, non-public site for now; licences/permissions only matter if it's
  ever released (keep art credits and the CC BY-NC-ND footer anyway).
- Drew likes seeing screenshots of UI changes (desktop and phone).

## Where things are

- App: this repo, `main`, pushed to origin.
- Content pipeline: `~/cig-char-data` (not a git repo; backup tarball in the
  previous session's folder:
  `~/.copilot/session-state/532e20c7-152e-493e-b050-91485d254e82/files/cig-char-data-backup.tgz`,
  without the re-fetchable `pages/` cache; that folder also has screenshots and checkpoint notes in `checkpoints/`).
- Product plan and history of decisions: `ROADMAP.md` (section 8 is the
  Characters page; read it before character work).

## State of the character pages (35 pilot characters + Felt)

Done and committed:

- **Details** (`src/data/characterDetails.ts`): chapter-dated appearances,
  aliases, species, abilities, nationality, profession, groups, bonds, family.
- **Personas**: Zahel (Vasher), Azure (Vivenna), Ironeyes (Marsh), Wit (Hoid),
  Thaidakar (Kelsier). Own page until the reader can tell who they are.
- **Page layout**: breadcrumb, spoiler notice, name + aliases + intro, tabs,
  and a Key facts infobox (world globe, facts, close family, first appearance,
  Coppermind link) beside the tabs, with per-book art above it.
- **Tabs**: History (Coppermind-style eras in in-world order, each paragraph
  citing its books), Personality (sub-headings **Appearance** and
  **Personality**), Travels (world hoppers only), Appearances. The
  Relationships tab was removed: parents, siblings, spouses and children are in
  Key facts; distant relatives are left to the Coppermind.
- **Art** (`src/data/characterPortraits.ts`, `public/portraits/`): one or more
  pieces per character, each dated by the latest thing it shows; the page
  shows the latest the reader has reached.
- **Travels** (`src/data/travels.ts`, `src/components/TravelMap.tsx`): an
  animated star-map journey (play/pause, step buttons, slider) for **Vasher**
  and **Felt**. Stops can need other reveals (`needs`) and carry a Word of
  Brandon note (`wob`, shown with a badge).
- **Felt** was added as the showcase world hopper (Scadrial spy, Roshar scout,
  linked by Word of Brandon). Decision made while Drew was away: the link shows
  once the reader has met him on both worlds (same as Vasher/Zahel). The Time
  Machine confirms the wiki itself only linked them between 2015 and 2017.
- **Spoiler tooling**: `npm run spoiler:snapshot -- <id>` compares a page with
  the Coppermind Time Machine (see AGENTS.md files).

## Drew's answers (2026-10-16)

All yes: Travels is the right direction; Felt's link once both worlds are
read is fine; Key facts collapse on phones; multi-book items appearing late is
OK.

## Done this session (uncommitted until Drew says)

- **Journey map proof of concept (2026-10-17): Kaladin, The Way of Kings.**
  Uncommitted. See ROADMAP 16, ARCHITECTURE 5.9 and
  `~/cig-journey-data/README.md`.
  - Generic model `src/data/journey.ts`, packs `src/data/journeys/*.json`
    (generated), index `journeyIndex.ts` (generated), atlas
    `journeyAtlas.ts`, trimming `revealJourney`/`revealCharacterJourney`/
    `journeyShown` in `reveal.ts`.
  - UI in `src/components/journey/`; `PanZoom` gained `flyTo`/`reset`
    (maths in `fitTransform.ts`). Journey section is first on Kaladin's
    page; Journey page feature on the Characters list.
  - Pipeline `~/cig-journey-data` (not a git repo): roshar-map importer
    (17thshard/roshar-map, MIT, numbers only), affine fit over 23 shared
    city pins (RMS 4.3 px, max 8.4 px), 19 Way of Kings events emitted (11
    Kaladin's). Re-running it reproduces the app files byte for byte.
  - Credit by the map: "Journey data adapted from the 17th Shard's Roshar
    map (MIT)"; the footer says "the 17th Shard" (no world name, as every
    reader sees the footer).
  - Later: blurred start with Explore journey; event titles and summaries
    in a popup card; Full screen and Close on the map; centring in the
    clear area (`fitTransform` `inset`); fan art per event (7 pieces, in
    `public/journey-art/`, via `text/roshar-map.json`) with a lightbox.
    **Art permission needed before any public release.**
  - Screenshots in this session's `files/journey-*.png`, `j3-*.png`.

- Travels for **Vivenna** and **Hoid** (12 stops, Lumar/Komashi flagged
  "timing uncertain"). Kelsier, Marsh, Sazed, Tress, Nikaro, Yumi: one world
  in the books, so no Travels. Time Machine: travel leads all false alarms.
- Map sets overlapping worlds (Ashyn/Roshar) side by side.
- Travels map opens on the first stop, not the last.
- Personality tab renamed **Description** (`/description`).
- Key facts collapse behind a toggle on phones (<760px).
- Screenshots: `~/.copilot/session-state/249c4643-7828-45de-8cc7-b2b80b8ed4c4/files/`.
- Headless Chrome can't go below 500px wide; use 500 for phone shots.
- **Sigzil** added (36 characters now) with the **Nomad** persona (The Sunlit
  Man). Identity needs all of The Way of Kings plus Sunlit Man ch 39. Story
  (12 History sections, 9 intros), 4 portraits (1 persona-safe), 5 Travels
  stops, tests for the persona, search and travels. Time Machine: one real
  lead (an infobox title dated to the wrong ref, fixed in overrides); the
  rest were false alarms. Screenshots in `files/spoilers-sigzil/`.
- Persona header names a standalone book by its title, not "Standalones".
- **Mistborn Era 1 batch: details and stories done, art still to do.**
  177 stories written (6 stub pages skipped: cadon, cobble, dedri-vasting,
  sev, shum, lord-hue). Writer-flagged dating issues triaged (10 fixed via
  overrides, out-of-book facts dropped); Time Machine re-run on the 24
  majors with stories, 1 real leak fixed. Tests pinned in
  `src/data/era1.test.ts`. 183 characters
  (`~/cig-char-data/batch-era1*.txt`: 24 major, 107 minor, 52 mentioned
  only), so 219 have details now. Includes 1 from The Eleventh Metal and 9
  that the batch builder missed because they're linked through redirects.
  Overrides cover 78 more ids (decisions recorded in `era1_overrides.py` and
  `era1_fix_mentions.py`); mentioned-only characters are met where first
  named. 11 identity cases handled (3 as persona pages; ids listed in
  `src/data/era1.test.ts`, not here, to keep this file spoiler-free).
  Time Machine on the 24 majors and 3 personas:
  15 lead terms, all dated correctly (wiki pages lagged), no real leaks.
  `spoiler:snapshot` now works for characters without a story yet.
- **Locations list** (`/locations`): 684 places (635 from the Coppermind's
  location categories, plus map places with no page of their own). Pipeline
  `~/cig-loc-data` (`crawl_cats.py` → `titles.txt` → `snapshot.py crawl
--only` → `fetch_files.py` → `file_books.json` → `build.py`, which writes
  `src/data/locationList.ts`; `src/data/listedLocations.ts` merges map
  places). Dating: earliest book the page cites, limited to the page's own
  series; maps count as their book; world guides, Arcanum, comics and
  broadsheets don't (24 such pages left out). Checked: no Era 2 place dated
  to Era 1. Group by A–Z, Type, World, Series, Inside; types are a first
  guess for Drew to adjust ("Other places" is broad). Tests in
  `src/locations.test.tsx` and `src/data/locationList.test.ts`.
- **Location maps**: `LocationMaps.tsx` shows a place's own map (Luthadel),
  or highlights it on each unlocked map it's marked on ("Where it is").
- **Place pages** (`PlacePage.tsx`, shared by map places and the new
  `/locations/:id` route in `ListedLocationDetail.tsx`): Key facts, intro,
  About, History, People, Map. Data: `src/data/locationStories/<id>.json`
  (lazy, like character stories) and `src/data/locationDetails.ts`;
  `revealLocationStory` / `revealLocationDetails` in `reveal.ts`. Pipeline
  in `~/cig-loc-data`: `loc_parse.py` → `loc_story_src.py` → agent-written
  `story/<id>.json` (`LOC_STORY_GUIDE.md`, `loc_story_check.py`) →
  `loc_facts.py` (facts dated by the earliest cited body statement, parent
  places with the place, else latest cited book; people from character
  Residence/Birthplace/Nationality via the character Dater, never Died;
  overrides in `review/*.json`, `facts_overrides.json`,
  `people_overrides.json`) → `loc_emit.py`. Era 1 done (63 stories), plus an
  independent spoiler review. Tests: `src/data/locationContent.test.ts`,
  "place pages" in `src/locations.test.tsx`.
- `scripts/screenshot-seed.html` now switches off the page fade-in; headless
  Chrome never ran it, so earlier screenshots came out dim.
- Main JS chunk is now ~1,167 kB (308 kB gzip); the >500 kB warning was
  already there. Not lazy-loaded: `reveal.ts` needs the details
  synchronously for the list, group-by, search and first-met. Revisit
  (e.g. JSON split by series) as more batches land.

- **Wiki-style sections** (`src/components/PageSections.tsx`,
  `pageSlugs.ts`): character, place and planet pages are one scrolling page
  of collapsible `PageSection`s with a sticky `PageContents` (scroll spy on
  `.app-main`; a click pins the highlight until the reader scrolls; bottom of
  page marks the last section). Contents reads the DOM, so spoiler-hidden
  sections never show. `/characters/:id/:tab` redirects to `#tab`.
- **Layout decided**: Drew chose sections over tabs; the Kaladin trial
  switch and tabbed layout were removed.
- Headless Chrome fires no scroll events or rAF in screenshots, so the
  Contents highlight can't be verified that way; check by hand.

- **Abilities list** (`/abilities`, tab renamed from Magic): pipeline
  `~/cig-abil-data` (`crawl_cats.py` → `titles.txt`; hand classification in
  `kinds.json`, Shard ties in `shard_ties.json`, spoiler fixes in
  `overrides.json` incl. `revealedIn`, `dropSystems`, `systemRevealedIn`;
  `abil_build.py` writes `src/data/abilityList.ts`). Dating = earliest cited
  book; an independent review added 29 later dates. No ability pages yet.

- **Culture list** (`/culture`, placeholder replaced): pipeline
  `~/cig-cult-data` (`python3 crawl_cats.py` → `cat_pages.json`/`titles.txt`;
  `python3 fetch_pages.py` fetches pages missing from the snapshot via
  fetch.sh into `raw/pages/`; `~/.cig-venv/bin/python cult_build.py` writes
  `src/data/cultureList.ts`). Type from `kinds.json`, then "House …", then
  category rules; spoiler fixes in `overrides.json` (`revealedIn`, `kind`
  incl. `skip`, `name`, `world`, `why`) on top of `review/*.json` from an
  independent review (`review_sheet.py` makes the sheets). Dating = earliest
  cited book, as for abilities; uncited pages are left out. Group by Type,
  Book, World, Series; A–Z default. Not in search (Abilities aren't
  either). No entry pages yet. Tests: `src/culture.test.tsx`,
  `src/data/cultureList.test.ts`.

- **Page feature icons** on the Characters and Locations lists
  (`src/data/pageFeatures.ts` registry, `src/components/PageFeatures.tsx`
  icons/links/legend): Travels (characters) and Map (places: own map,
  "Where it is", or a planet's interactive map / maps). Each icon links to
  `<page>#<section>`; tooltips from `data-tip` via CSS; legend under the
  filters; **Group by → Page feature**. Gated by books alone with the
  page's own reveal helpers (`revealCharacterTravels`, `placeMaps`,
  `interactiveMaps` were extracted for this). Hash links now keep the
  section in view while the page fades in; in Kaladin's tabbed trial the
  hash picks the tab. Tests: `src/pageFeatures.test.tsx`,
  `src/data/pageFeatures.test.ts`. Icons are a first go; Drew may want
  changes.
- Screenshots: use chrome-headless-shell
  (`~/.cig-headless/chrome-headless-shell/*/chrome-headless-shell-*/chrome-headless-shell --headless`),
  never Google Chrome.app (it steals focus); phone shots at 500 wide.

## Known doubts to mention

- Journey map:
  - Several events share the Shattered Plains point; a drill-down map
    would separate them. Hearthstone's point is slightly off.
  - "Drawing in Stormlight" has no art: none found that shows it.
  - The Roshar map shows from the Way of Kings prelude (it's printed front
    matter); its labels name places the reader hasn't met yet.
  - Places on the map are dated per book, so mid-book readers see "Stop N"
    rather than names (fails closed).
  - A stop whose chapter id we don't know shows once the book is finished
    (as with other facts), never mid-book.
  - Refs naming several chapters use the latest. Many Way of Kings stops are
    the same Shattered Plains point, so the map doesn't move between them;
    Hearthstone's source point sits near Mourn's Vault on our map.
  - Shadesmar stops (no map yet) and undated events are dropped.

- Culture: scope, types and groupings are my defaults. Types are first
  guesses (myths include creatures the Coppermind files as myths); 34 pages
  cited only by world guides or Words of Brandon are left out; a handful of
  late dates from the review were marked unsure (see
  `~/cig-cult-data/review/*.json`).

- Abilities: scope, groupings and dating were my defaults while Drew was away.
  Least sure of first-naming books for Hemalurgy, Malatium, Lerasium,
  Nicrosil, Compounding (dated late, maybe one book too late). The ten Surges
  have no Coppermind pages, so they aren't listed.

- Art gaps filled: Dalinar's logo piece replaced; Syl as a Shardblade, Venli
  before stormform and Moash as a bridgeman added (provenance in
  `~/cig-char-data/art/gaps.json`). Still open: Hoid before Wit is named (no
  suitable Coppermind art).
- Appearance text added for Spook, Wayne and Yumi. Marasi still has none: her
  Coppermind page has no physical description.
- Vasher's and Vivenna's Travels tabs show to readers of only one of their
  books, hinting they're world hoppers (Sigzil's uses `needs` to avoid that).
- Persona pages link "<persona> on the Coppermind", which redirects to the
  real character's page (Zahel, Nomad); the link already warns of spoilers.
- The "Preservers" group has no clear in-book source: dropped for Vin, Elend
  and Sazed; dated to The Lost Metal for Spook and Wind and Truth for Kelsier
  and Marsh (when their wiki pages gained it). Revisit if a footnote turns up.

## Suggested next steps

1. (Done 2026-10-16) Time Machine sweep over all 36 characters and the six
   persona pages; log in `~/cig-char-data/audit-2026-10-16.md`. Persona
   snapshots now write `<date>.<persona>.ours.txt`. Remember `date.py` before
   `emit.py` after editing overrides.
2. Optionally improve the snapshot check: flag terms absent before book X but
   present just after it (points at the book they came from; fewer false
   alarms).
3. Travels for new world hoppers (Khriss, Nazh...) as they're added.
4. Scale details and stories to the other ~2,100 characters in small batches
   (ROADMAP section 8), with the Time Machine check per batch.
5. (Done 2026-10-16) Old "Story" format removed from the app and pipeline;
   every story is a History (`story_check` rejects "story"; `make_history.py`
   and `HISTORY_TASK.md` are gone).
6. Journey map (ROADMAP 16): Kaladin now runs WoK to RoW (39 events,
   birth first: year from a WoB at WoK 1, parents and Hearthstone at WoK
   16). Next: Drew's review, other Roshar characters, Era 1/2 via a
   cosmere-maps importer, routes between stops, a Shadesmar map (3 Kaladin
   events dropped for now), drill-down maps where events stack (Shattered
   Plains, Urithiru), and merging Travels into Journey.
