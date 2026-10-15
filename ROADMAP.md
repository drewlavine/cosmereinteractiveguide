# Roadmap

Planned features for the Cosmere Interactive Guide. Tick a box when the
feature ships and note the commit.

## Spoiler rule

Applies to every feature, current and future. Nothing is shown until the
reader has marked as read the book that first reveals it. For example, a
planet's Shard, magic systems, moons, summary text, maps and locations each
stay hidden until their revealing book is ticked in Books Read. Hide content
completely rather than blurring it or showing a placeholder that gives away
that something exists.

The one exception: a system or planet page with hidden content shows a
"Some information hidden due to spoilers." notice with a **Show anyway**
button, so readers can choose to see that system in full (and **Hide again**).
The notice never names the books, since that alone can be a spoiler. Facts known only
from Words of Brandon are hidden behind the book they would spoil, choosing
the later book when unsure.

### Dating a fact

Always use the Coppermind's footnotes first to find the book and chapter
where something happens: the footnote on the sentence stating the fact, on
the character's (or place's) own page. Fall back to the chapter summaries
only when there's no footnote, and to the last book the subject appears in
when neither gives an answer. If a footnote cites a chapter where the fact is
only clear in hindsight (e.g. Kaladin unknowingly drawing arrows in The Way of
Kings chapter 6), use the first footnoted chapter where the book makes it
clear instead (chapter 57).

## Cosmere-only rule

Applies to all data, current and future: characters, places, books, magic,
events and anything else. Add only things from Brandon Sanderson's Cosmere.
Leave out his non-Cosmere works (e.g. Skyward, The Reckoners, Alcatraz, The
Rithmatist, Legion, Frugal Wizard, The Dark One) even when the Coppermind
covers them. When pulling from the Coppermind, a page counts only if it's in
Category:Cosmere; check anything unclear by hand.

## Planned

### 0. Spoiler-tag existing data

- [x] Tag everything already in the guide with the book that first reveals it,
      and hide it until that book is read.
  - [x] Systems and stars on the Cosmere star map
  - [x] Planets, including their names, summaries and chart positions
  - [x] Shards for each planet
  - [x] Magic systems for each planet
  - [x] Moons
  - [x] A shared helper (`revealSystem` / `useShownSystems`) used by every component

### 1. Planet maps

- [x] Add a map to each planet that has one available: Roshar, Scadrial, Sel,
      Nalthis, Taldain and Miral. (No official maps found for Threnody, First of
      the Sun, Lumar, Komashi, Canticle or the others; their books' endpapers
      are illustrations.)
  - [x] Roshar proof of concept: a thumbnail strip to switch between maps,
        each labelled with its name and source book, with edition pills for
        maps that changed between books
  - [x] List which planets have maps and where they come from
  - [x] Store the maps (or links to them) alongside the planet data
  - [x] Show the map on the planet detail page, with pan and zoom
  - [x] Hide maps from unread books; default to the newest map the reader has
        unlocked
  - [x] Group maps of the same place by era (e.g. Scadrial Era 1 vs Era 2)
  - [x] Credit the source and respect its licence

### 1b. Clickable map regions

- [ ] Make countries and cities on each map clickable, opening a page with
      information about that place.
  - [ ] Draw clickable outlines for countries and cities on each map
    - [x] Sel: nation outlines on Opelon (Original) and pins on Arelon
          (Original), with 23 spoiler-tagged places
    - [x] Roshar: Roshar (31 nations and regions, 24 cities) and the Silver
          Kingdoms (10 kingdoms)
    - [x] Scadrial: the Final Empire (8 dominances, 31 cities), the Elendel
          Basin (3 regions, 25 towns) and the Lost Metal map of Scadrial
          (8 regions, 14 pins)
    - [x] Nalthis (T'Telir), Taldain (Dayside, Kezare) and Threnody
          (Kingseat)
    - [ ] Later editions of each map, and the regional and city maps
    - [ ] Places with no dot or border printed (e.g. the Reshi Isles, the
          Horneater Peaks), seas, rivers and small islands
    - [ ] Check the summaries and spoiler tags written without the
          Coppermind (it blocked the tracing agents)
  - [ ] Clicking a region opens a page for that place, or opens a regional map
        if one exists
    - [x] Location pages, with parent place, places within, "Stories set
          here" and "Mentioned in"
    - [ ] Jump to a regional map, e.g. from Arelon's outline to the Arelon map
  - [x] Only show regions, and information about them, from books the reader
        has marked as read
  - [x] Dev-only tracing tool ("Trace (dev)" under the interactive map)
  - [ ] Polished regions from hand-painted masks (later, after the MVP)
    - [ ] Drew paints one mask layer per region over each map in a photo
          editor and exports them as PNGs at the map's full size
    - [ ] Turn each mask into a smooth outline that follows the art exactly,
          replacing the hand-traced points
    - [ ] Optional: a soft glow or inner shadow on hover, cut from the same
          masks

**Plan (chosen): shaded regions + city pins**

- Draw on top of each map with an SVG overlay inside the existing pan/zoom
  frame, so it zooms and pans with the map (no map library needed).
- Countries and regions are outlines that highlight on hover or focus; cities
  are pins. Each opens its location page.
- Outlines and pins are stored separately for each map version, because every
  version is different art. Coordinates are in image pixels.
- Add a dev-only drawing tool: click points on the map to trace an outline or
  drop a pin, then copy the result as data.
- Each location carries its own `revealedIn` tag. A shape shows only when its
  map version is unlocked and its location is revealed.
- Add an "Interactive map" section above the existing "Maps" gallery, with a
  keyboard-friendly list of places beside the map.
- Location pages at `/systems/:system/planets/:planet/locations/:location`,
  with a summary, parent place, "Stories set here" and "Mentioned in", all
  spoiler-tagged. These pages also feed the Locations tab (item 5) and the
  universal search (item 4).
- Coppermind has no clickable-map data to reuse, so all shapes are traced by
  hand. Coppermind articles are the source for location page content.
- Proof of concept: Sel. Do the Opelon continent map (Original) with nation
  outlines first, then the Arelon map (Original) with city pins.

### 2. Planet appearances

- [ ] Show the books and other works each planet is featured or mentioned in.
  - [x] Collect appearances for each planet, marked as featured or mentioned
  - [x] Show them on the planet detail page
  - [x] Hide appearances from books the reader hasn't marked as read
        (uses the Books Read settings)
  - [ ] Verify the medium- and low-confidence mentions (see the review table
        from the first pass)

### 3. Planet tabs

- [ ] Split each planet detail page into tabs, each showing a different kind
      of information. All of it must be spoiler-free for the books the reader
      has marked as read.
  - [ ] Decide on the tabs (e.g. Overview, Map, Appearances, Magic, People,
        Places)
  - [ ] Add a tab bar to the planet page, with each tab at its own URL
  - [ ] Tag every piece of planet data with the book that first reveals it
  - [ ] Hide content, and whole tabs, that only come from unread books
  - [ ] Move planet maps (1) and appearances (2) into their own tabs

### 4. Universal search

- [ ] Search every kind of data in the guide (systems, planets, characters,
      locations, shards, magic systems, books, etc.) from a centered search
      modal, like a ⌘K command palette.
  - [x] Header button: a pill that reads "Search the Cosmere… ⌘K" on wide
        screens, shrinking to a search icon on phones. Clicking it opens the
        modal.
  - [x] Modal: centered panel in the guide's gold-framed style over a dimmed,
        blurred backdrop, with the search box focused on open
  - [x] Build one search index covering all data types, with fuzzy matching
        so typos still match (e.g. "Kaladn"). A small client-side library
        such as MiniSearch is enough.
  - [x] Show results as you type, grouped by type (Characters, Places,
        Planets, Books…), each with an icon and a one-line snippet, linking
        to its page
  - [x] Keyboard use: ⌘K / Ctrl+K or "/" opens it from anywhere; arrow keys
        move, Enter opens, Escape closes
  - [x] When the box is empty, show recent searches and a few suggestions
  - [x] A `/search?q=…` page with all results, so searches can be shared
        and the modal can link to "See all results"
  - [x] Leave out results, and text in result snippets, from books the reader
        hasn't marked as read, and say how many were left out, e.g.
        "3 results hidden based on books you've read"
  - [ ] Add new data types to the index as they're added to the guide
        (one `SearchSource` each in `src/search/sources.ts`): systems,
        planets, places and characters are in; magic systems, Shards and
        books need their own pages first
  - Searches page titles and other names only (e.g. "Opelon" finds Sycla),
    not page text, to keep spoilers out. Subtitles show only the kind of
    page and where it is.

### 5. Main navigation tabs

- [x] Add tabs to the header banner for moving between the main sections of the
      guide. More tabs may be added later.
  - [x] **Star Map**: the current Cosmere star map, systems and planets
  - [x] **Characters**: browse and view characters (list and page skeleton,
        names only for now)
    - The character list is not yet spoiler-filtered
  - [x] **Books**: every Cosmere book, grouped by series, with a page each
        (names, series, kind and year only for now). Read books are marked,
        and books are searchable.
    - [ ] Book details (setting, worlds and places, previous/next in series)
    - [ ] Publication order view (the Coppermind's Cosmere bibliography
          lists every book in order, including within a year)
    - [ ] Tabs on each book page for everything in that book: Characters,
          Locations, Events, Magic, plus others that fit (e.g. Worlds,
          Shards, Items, Organizations). Each entry links to its own page.
      - Gated by the spoiler rule, down to the chapter once item 7 lands:
        a reader partway through a book only sees what they've reached.
        Unread books show nothing in these tabs, only the hidden-content
        notice.
      - Source: the Coppermind. Its footnotes cite the book and chapter
        for almost every fact (e.g. "The Way of Kings chapter 34"), so
        use those to tag each fact, and each appearance, with the chapter
        it's revealed in. Where a fact has no footnote, fall back to the
        page's infobox (books it appears in) and the chapter-by-chapter
        summary pages (first chapter it's linked in). Anything still
        unclear needs a manual check.
  - [ ] **Locations**: browse and view locations (cities, regions, landmarks)
        (placeholder tab added)
  - [ ] **Magic**: the magic systems and how they work (placeholder tab
        added)
  - [ ] **Events**: key events across the Cosmere, in order (placeholder tab
        added)
  - [ ] **Maps**: a gallery of all available maps (shared with planet maps, 1)
  - [x] Give each tab its own URL and show which tab is active
  - [ ] Keep every tab spoiler-free for the books the reader has marked as read

### 6. Saved settings on this device

- [x] Remember the reader's settings in the browser (localStorage), so they
      don't have to set them up again on each visit from the same device.
  - [x] Books Read (already saved under `cosmere-guide:books-read`)
  - [x] Recent searches (from item 4), with a way to clear them
        (`cosmere-guide:recent-searches`)
  - [x] Reading progress (from item 7), saved with Books Read
  - [x] Keep one versioned settings format, so older saved settings still
        load after updates (Books Read is now `{ version: 2, read, reading }`;
        the old plain list still loads)

### 7. Reading progress by chapter

- [x] Let the reader mark each book as **Read** or **Reading**, and for a
      book they're reading, choose the chapter they're on. Spoilers then
      follow their exact place in the book: e.g. a character page shows
      everything up to that chapter and nothing after.
  - [x] Books Read settings: each book can be Unread, Reading or Read, with
        a "Last chapter finished" picker for Reading (numbers and labels
        only, grouped by part; chapter titles are left out as they can spoil)
  - [x] Add chapter lists for each book (`src/data/chapters.ts`, from the
        Coppermind; ids match its footnotes, e.g. `34`, `prologue`, `i-3`,
        `epilogue`, `day-12`). 25 books so far.
    - [ ] Books without chapters on the Coppermind can only be Unread or
          Read: Hope of Elantris, The Eleventh Metal, Allomancer Jak,
          Elsecaller, King Lopen, Sixth of the Dusk
    - [ ] White Sand Volumes 1-3: chapters are only listed for the
          omnibus, as the Coppermind doesn't say which volume holds which
          part
    - [ ] Footnotes citing back matter (e.g. "Ars Arcanum") have no
          chapter; treat them as "finished the book"
  - [x] Extend spoiler tags so a fact can be revealed at a chapter, e.g.
        `{ book: 'way-of-kings', chapter: '34' }`, not just a whole book.
        Plain book tags keep meaning "revealed by the end of the book"
  - [x] Treat a book as read up to the chosen chapter, everywhere spoilers
        are checked (planets, maps, locations, characters and search). Note
        that existing data is tagged by whole book, so a book being read
        reveals nothing from it until data gets chapter tags
  - [ ] Tag character facts by chapter first, since that's where it matters
        most, then other data as needed. Take chapters from the Coppermind
        footnotes, falling back to its chapter summaries (see Books above)
  - [x] Show the reader's place somewhere visible: the Books list shows
        e.g. "Reading · up to Chapter 34"
  - [ ] Improve the UI/UX of reading progress (works for now, but could be
        smoother). Ideas:
    - A Reading button on every book row is busy; consider a single
      Unread / Reading / Read control, or only offering Reading on hover
      or focus
    - Update your place without opening the Books Read dialog, e.g. from
      the book's page or the Books list, with a quick "Next chapter" step
    - Show books in progress in the header, not just the read count
    - A faster way to find a chapter in long books (Wind and Truth has
      169 entries), e.g. pick the part first

### 8. Characters page

- [ ] Group and sort the character list in different ways. More groupings
      can be added later.
  - [x] A–Z (the current list)
  - [ ] **Book**: characters under each book they appear in, in publication
        order. A character in several books is listed under each.
  - [ ] **Species**: e.g. human, singer, spren, kandra, koloss, Shard
  - [ ] **Abilities**: e.g. Windrunner, Mistborn, Coinshot, Awakener,
        Elantrian, Lightweaver. A character with several abilities is listed
        under each.
  - [ ] A group-by control on the list, saved in the URL (e.g.
        `/characters?group=book`) so it can be shared
  - [ ] Add each character's books, species and abilities to the data
        (Coppermind infoboxes are the source)
    - [x] Pilot: 34 main characters in `data/characterDetails.ts` (books,
          world, aliases, species, abilities), each fact tagged with the
          chapter it's revealed in and reviewed by hand
    - [ ] The other ~2,100 characters, in small batches with the same
          scripts and overrides; consider lazy-loading the data if the
          bundle grows too large
- [ ] Spoiler filter: leave out characters the reader hasn't met yet
  - [x] Tag each character with where the reader first meets them (book
        and chapter; pilot characters only so far, the rest count as met)
  - [ ] Hide unmet characters from the list, the groupings, character pages,
        and search, and say how many were hidden, e.g. "12 characters hidden
        based on books you've read"
    - [x] List, character pages ("Not met yet") and search. Searching a
          character's exact name (or unique first name) still finds them,
          marked "not met yet", since the reader is looking for them; their
          page shows the name only, until Show anyway
    - [ ] Groupings, once they exist
  - [ ] Hide references to unmet characters elsewhere too, e.g. in other
        characters' summaries, location pages and planet pages
  - [x] Tag species and abilities by when they're revealed, so grouping
        never spoils a twist (e.g. a character who turns out not to be human,
        or who secretly has a power)
  - [ ] Setting for facts that can't be dated from footnotes or chapter
        summaries: **Strict** (hidden until the last book the character
        appears in is read; the default) or **Lenient** (shown once the
        reader has met the character). The data will need to mark which
        facts fell back to strict
- [x] Spoiler-safe notice on character pages: when information is hidden,
      say only "Some information hidden due to spoilers", without naming the
      books, since naming them can itself be a spoiler (e.g. revealing a
      character returns in a later book)
  - [x] A "Show anyway" button that reveals the hidden information on that
        page, and a way to hide it again
  - [x] Same wording on system, planet and location pages, with a "Show
        anyway" button; no spoiler UI names an unread book
- [ ] Split each character page into tabs, so the reader can pick what to
      read. Each tab is at its own URL (e.g. `/characters/kaladin/family`),
      and a tab with nothing left after spoiler filtering is hidden, without
      saying why. Every fact is tagged with the chapter that reveals it.
  - [ ] Decide on the tabs. Proposed, based on the Coppermind's character
        pages (infobox, then History, Appearance and Personality,
        Attributes and Abilities, Relationships, Quotes, Trivia):
    - Above the tabs, always shown: name, other names, and a short
      spoiler-safe summary (a few sentences)
    - **Overview**: key facts: titles, world, nationality, species,
      abilities (magic, bonds such as spren or Shardblades, other skills),
      profession and groups (e.g. Bridge Four, the Ghostbloods)
    - **Story**: what happens to them, split by book in reading order and
      cut off at the reader's chapter
    - **Relationships**: family (parents, siblings, spouse, children,
      ancestors) and key relationships, linking to other characters' pages
      (unmet characters hidden)
    - **Appearance & Personality**
    - **Travels**: the world-hopper timeline (below); only for world
      hoppers
    - **Appearances**: each book they appear in, and the first chapter
    - **Quotes**: memorable lines, each tagged by book and chapter
  - [x] First pass: tab bar with the data we have (Overview: world,
        species and abilities; Appearances with each book's first chapter).
        Other names stay above the tabs. Switching tabs is instant (no page
        transition within one page)
  - [ ] Leave out of tabs: Coppermind's Trivia, Development and Speculation
        sections, and Words of Brandon (out of the books, and hard to date
        for spoilers); keep the Coppermind link for those
- [ ] **Travels** tab for world hoppers (e.g. Hoid, Vasher, Vivenna, Khriss,
      Nazh, Tress, Felt): a visual timeline of the planets they've visited,
      in the Cosmere's in-world order (not publication order), each stop
      linked to its planet page
  - [ ] Show each stop only once the reader reaches the chapter that
        reveals it. Where a stop's in-world date is unknown, leave it out
        rather than guess
  - [ ] Decide what to do with stops known only from outside the books
        (e.g. from Words of Brandon); epigraphs and Arcanum Unbounded essays
        count as in the books
  - [ ] Source the order from the Coppermind's Cosmere timeline and the
        characters' History sections

## Completed

- [x] Books Read settings: header button and a checklist of all 35 published
      Cosmere works, saved in the browser (`134a7bd`)
