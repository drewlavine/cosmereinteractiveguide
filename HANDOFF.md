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

## Known doubts to mention

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
