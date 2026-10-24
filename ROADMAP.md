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

### Facts build up chapter by chapter

Applies to every entry on every tab (characters, places, culture,
abilities, events, ...). An entry appears at the chapter that first names
it, not when that book is finished, and says only what the reader knows at
that point. Each later fact carries its own chapter date and is added once
the reader passes it. For example, a group first seen chasing someone reads
"A mysterious organization chasing Nomad", and the reason why is added only
at the chapter that reveals it. Dating a whole entry by book is a stopgap,
not the finished state.

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
    - [x] Maps on location pages: a place with a map of its own (Luthadel,
          Kholinar…) shows it, with its editions; any other place is
          highlighted on each unlocked map it's marked on ("Where it is",
          with a choice of map). 17 own maps, 186 marked, 3 without a map
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
  spoiler-tagged. These pages also feed the Locations tab (item 12) and the
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
        "3 results hidden based on what you've read so far"
  - [ ] Add new data types to the index as they're added to the guide
        (one `SearchSource` each in `src/search/sources.ts`): systems,
        planets, places and characters are in; magic systems, Shards and
        books need their own pages first
  - Searches page titles and other names only (e.g. "Opelon" finds Sycla),
    not page text, to keep spoilers out. Subtitles show only the kind of
    page and where it is.

### 5. Main navigation tabs

The main sections, in the side nav's order. Each tab's work lives in its own
section; tick a tab here once its section's first version ships.

- [x] Add tabs to the header banner for moving between the main sections of the
      guide. More tabs may be added later.
- [x] Move them into a side nav: an icon rail on the left that slides out to
      show labels on hover, grouped under headings (Explore the Cosmere,
      People & powers, World, History), with a gold marker on the current
      section. The header's menu button pins it open (remembered); on phones
      it opens it as a drawer.
  - [ ] **My Cosmere**: the new starting tab, before Star Map (see 10)
  - [x] **Star Map**: the Cosmere star map, systems and planets (see 0–3)
  - [x] **Books**: every Cosmere book, grouped by series, with a page each
        (see 11)
  - [x] **Characters**: browse and view characters (see 8)
  - [ ] **Locations**: cities, regions and landmarks (list page live;
        location pages to come; see 12)
  - [ ] **Abilities**: magic systems and other abilities (list page live;
        ability pages to come; see 13)
  - [ ] **Culture**: the peoples and societies of the Cosmere (list page
        live; entry pages to come; see 15)
  - [ ] **Timeline**: the Cosmere's history in in-world order (two static
        mockups at `/timeline` to choose a design; see 14)
  - [ ] **Maps**: a gallery of all available maps (shared with planet maps,
        see 1)
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
  - [x] Filter by name (including other names the reader knows), saved in
        the URL (`?q=`)
  - [x] A **Group by** dropdown (replaced the series and sort chips): Name,
        **Series**, **World**, **Species**, **Ability** and **Number of
        books**, using only what the reader knows. Characters without that
        data yet are counted, not listed
  - [x] **Page feature icons**: small icons after a name for the special
        parts of its page the reader can see (Travels; Map on Locations),
        each linking straight to that section, with hover/focus tooltips and
        a legend under the filters. Spoiler-gated by books alone, from the
        same reveal code as the page. One registry
        (`src/data/pageFeatures.ts`), so a new feature is one entry plus
        its icon. **Group by → Page feature** lists entries under each
        feature (and "No special features")
  - [ ] **Book**: characters under each book they appear in, in publication
        order. A character in several books is listed under each.
  - [x] **Species**: e.g. human, singer, spren, kandra, koloss, Shard
  - [x] **Abilities**: e.g. Windrunner, Mistborn, Coinshot, Awakener,
        Elantrian, Lightweaver. A character with several abilities is listed
        under each.
    - [ ] Each ability heading links to its own ability page (see 13)
  - [x] A group-by control on the list, saved in the URL (e.g.
        `/characters?group=series`) so it can be shared
  - [ ] Add each character's books, species and abilities to the data
        (Coppermind infoboxes are the source)
    - [x] Pilot: 34 main characters in `data/characterDetails.ts` (books,
          world, aliases, species, abilities), each fact tagged with the
          chapter it's revealed in and reviewed by hand
    - [ ] The other ~2,100 characters, in small batches with the same
          scripts and overrides; consider lazy-loading the data if the
          bundle grows too large
      - [x] Mistborn Era 1 (183 characters: details and stories; art for
            the 32 with suitable Coppermind art, 54 pieces, persona-safe for
            Breeze, Clubs and the Lord Ruler)
      - [x] The Stormlight Archive (1,017 more characters: details for all,
            stories for all but 11 stub pages; portraits for 100; Time
            Machine checked for the 62 majors only)
- [ ] Spoiler filter: leave out characters the reader hasn't met yet
  - [x] Tag each character with where the reader first meets them (book
        and chapter; pilot characters only so far, the rest count as met)
  - [ ] Hide unmet characters from the list, the groupings, character pages,
        and search, and say how many were hidden, e.g. "12 characters hidden
        based on what you've read so far"
    - [x] List, character pages ("Not met yet") and search. Searching a
          character's exact name (or unique first name) still finds them,
          marked "not met yet", since the reader is looking for them; their
          page shows the name only, until Show anyway
    - [x] Groupings
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
      (linked once the reader has met them)
    - [x] Names of visible characters, places, planets, Magic and Culture
          entries in page prose link to their pages automatically
    - **Appearance & Personality**
    - **Travels**: the world-hopper timeline (below); only for world
      hoppers
    - **Appearances**: each book they appear in, and the first chapter
    - **Quotes**: memorable lines, each tagged by book and chapter
  - [x] First pass: tab bar with the data we have (Overview: world,
        species and abilities; Appearances with each book's first chapter).
        Other names stay above the tabs. Switching tabs is instant (no page
        transition within one page)
  - [x] Coppermind sidebar facts for the pilot characters: nationality,
        profession, groups and bonds in Overview, and a **Relationships**
        tab (parents, siblings, spouse, children, other relatives,
        ancestors). A relative links to their page once the reader has met
        them. Each tie is dated by a footnoted sentence that names both the
        person and the relation (e.g. "married"), not by the name alone;
        engagements don't count as marriages; both sides of a tie (e.g.
        husband and wife) share one date. Nameless relatives ("her mother")
        are left out
  - [x] Rechecked every hand-set date against the footnotes (e.g.
        Stormblessed now from The Way of Kings chapter 2, Lift's
        Edgedancer order from Words of Radiance Interlude 9)
  - [x] **Personas** for characters who go by another name in other books
        (Vasher as Zahel in the Stormlight Archive). Until the reader has read
        the character's own books **and** reached the persona's first
        appearance, the persona gets its own page, list entry and search
        result with only what its books reveal, and the character's page
        leaves those books out. Past that point (stated in the books or not)
        the persona page turns into the character's, which shows the other
        name up top ("Known as Zahel in The Stormlight Archive") apart from
        minor aliases, and search titles it "Vasher (Zahel)". Built on "all
        of" reveal points (reached once every part is)
  - [x] Same treatment for the rest of the pilot: Vivenna as Azure
        (Oathbringer), Marsh as Ironeyes (The Alloy of Law; Era 1 readers
        already know the nickname), Kelsier as Thaidakar (Wind and Truth),
        Hoid as Wit (The Stormlight Archive, The Sunlit Man). The header
        names only series the reader has reached
  - [x] Sigzil, with **Nomad** as his persona in The Sunlit Man: details,
        History, art and Travels. A Sunlit Man-only reader may never have met
        Sigzil, so the identity needs both series. A standalone book is named
        by its title in the header ("Known as Nomad in The Sunlit Man")
  - [x] Unnamed cameos (e.g. Hoid as a beggar or coachman in Mistborn) count
        only once the reader has met the character by name in another book
        and reached the cameo
  - [x] Redesign: breadcrumb, then name, other names and a short
        spoiler-safe summary up top; a **Key facts** infobox beside the tabs
        (above them on phones) with world, species, nationality, profession,
        abilities, groups, bonds, first appearance and the Coppermind link;
        tabs **Story**, **Personality**, **Relationships**, **Appearances**
  - [x] Wiki-style layout (after Tolkien Gateway): tabs replaced by one
        scrolling page of collapsible sections (History with a part per
        heading, Description, Travels, Appearances), text filling the
        window, and a sticky **Contents** panel that marks the section being
        read (the clicked one, or the last one at the bottom of the page).
        Hidden sections never appear in Contents. Old tab URLs redirect to
        `#section`. Same layout on place and planet pages
  - [x] Choose between sections and tabs: sections chosen; the trial
        switch and the tabbed layout are gone
  - [x] **Story** and **Personality** for the pilot: short paraphrased items
        under each book, written from the Coppermind's History sections, each
        dated by the footnotes of the paragraphs it draws on (so it appears
        only once the reader reaches that chapter). The summary up top is the
        latest one the reader can see. Persona pages tell only the persona's
        story. Checks catch items that name a persona's real name or a fact
        the footnotes date later
  - [x] Story text lives in one small JSON file per character
        (`data/stories/`), loaded when the page opens, so it stays out of
        the main bundle as more characters are added
  - [x] **History** instead of Story, like the Coppermind's: their life in
        in-world order (flashbacks take their place), under era headings,
        each paragraph citing its book. Headings are written by hand, never
        the Coppermind's own (e.g. "Death", "Apparent Death" would spoil),
        and have dated versions that grow with the section (Kaladin's
        "Kholinar" becomes "Kholinar, Shadesmar and Thaylen City"); checks
        make sure a heading always shows with its paragraphs
    - [x] Pilot: Kaladin and Vasher (persona headings: Zahel's readers see
          "Ardent and swordmaster", not "On Roshar")
    - [x] The other 32 pilot characters (all 34 now use History)
    - [x] Remove the old Story format from the app and pipeline
  - [x] Close family (parents, siblings, spouses, children) moved into the
        Key facts infobox, linked once met; the Relationships tab is gone
        (its old URL opens the first tab). Distant relatives and ancestors
        are left to the Coppermind
  - [x] Personality tab split under **Appearance** and **Personality**
        headings (styled like History's); items that mixed both were split.
        The tab is now called **Description** (`/description`)
  - [x] Key facts collapse behind a "Key facts" toggle on phones
  - [x] Character page overhaul, piloted on Shallan: Journey (or Travels)
        first, then Description, Abilities, History, Relationships and
        Appearances; optional titled Description/Abilities/Relationships
        sections from the story pipeline; captioned, dated art set into the
        sections like the Coppermind's (`src/data/characterFigures.ts`)
  - [ ] Roll the overhaul (more sections, in-section art) out to the other
        characters
  - [ ] Story/History and Personality for the other characters
  - [ ] Check for personas and cameos when scaling to every character
        (e.g. Khriss)
  - [ ] Leave out of tabs: Coppermind's Trivia, Development and Speculation
        sections, and Words of Brandon (out of the books, and hard to date
        for spoilers); keep the Coppermind link for those
- [ ] **Character art** above Key facts, credited and dated like a fact
      (art can spoil: Shardplate, a scar, a sword)
  - [x] Portrait slot (`data/characterPortraits.ts`, images in
        `public/portraits/`): latest art the reader may see, "Art by" link
  - [x] One portrait per book, changing as the reader progresses (Kaladin:
        WoK bridgeman → WoR uniform → OB Windrunner → RoW Shardplate → WaT
        Shinovar; Vasher: Warbreaker → Zahel teaching Adolin (WoR) → Zahel
        with laundry (RoW), and the same Zahel art on his persona page)
  - [x] Art for the other pilot characters (1–5 pieces each), and
        persona-safe art for Wit, Azure and Ironeyes. Thaidakar has none:
        every piece shows Kelsier's face
  - [x] Gaps: Syl as a Shardblade, Venli before stormform, Moash as a
        bridgeman; Dalinar's logo piece replaced
  - [ ] Gap: Hoid before Wit is named (Elantris, Warbreaker); no suitable
        Coppermind art yet
  - [x] Private site for now: art is taken from the Coppermind galleries,
        credited and linked
  - [ ] **Before any public release:** get each artist's (or Dragonsteel's /
        Brotherwise's) permission, or remove their art. The Coppermind's
        images are "only to be used with their permission"
- [x] Check the footer license: the Coppermind's text is CC BY-NC-ND (no
      derivatives), not BY-NC-SA. The footer and README now say so, and that
      the site is private
  - [ ] **Before any public release:** ask 17th Shard (contact on the
        Coppermind Copyrights page) about our paraphrased summaries
- [ ] **Travels** tab for world hoppers (e.g. Hoid, Vasher, Vivenna, Khriss,
      Nazh, Tress, Felt): a visual timeline of the planets they've visited,
      in the Cosmere's in-world order (not publication order), each stop
      linked to its planet page
  - [x] Pilot: Vasher (`data/travels.ts`, `revealTravels`,
        `components/TravelMap.tsx`): an interactive star map of the worlds
        visited, joined by glowing arrowed arcs in visit order, with
        play/step controls and a slider that walk the journey one stop at a
        time; a card under the map lists that stay's events, cited like
        History, with a link to History. Unread stops and legs are hidden
        entirely. Not on persona pages (it would give Zahel away)
  - [x] Sigzil (five stops; Stormlight-only readers see no Travels tab
        until they know he's Nomad)
  - [ ] Iterate on the map after review (see **Ideas** below)
  - [x] Show each stop only once the reader reaches the chapter that
        reveals it (a stop shows once any of its events does)
  - [x] A stay whose order among the stops is known but whose date isn't
        (Vasher on Miral: before or after the Manywar?) is shown with a
        "Timing uncertain" note. A stay whose order is unknown is left out
  - [x] Stops known only from outside the books (e.g. Words of Brandon,
        like Vasher's early visit to Roshar) are left out, as in History;
        epigraphs and Arcanum Unbounded essays count as in the books
  - [x] Source the order from the Coppermind's Cosmere timeline and the
        characters' History sections
  - [x] Felt (added to the pilot as a showcase): Scadrial → Roshar. The
        books never say the Roshar Felt is the Mistborn one (only Brandon
        has), so, as with Vasher/Zahel, a stop's `needs` holds it back until
        the reader has met him on both worlds, and the card notes it's Word
        of Brandon
  - [x] Roll out to the other world hoppers in the pilot: **Vivenna**
        (Nalthis → Roshar as Azure, once she can be recognized) and
        **Hoid** (Ashyn, Roshar, Taldain, Sel, Scadrial, Nalthis, Threnody,
        Roshar, Scadrial, Miral, Lumar, Komashi), in his Coppermind History's
        order, each event dated like its History paragraph. Left out: Yolen
        (not in the books), Canticle (only an illusion), the Dynamic (no
        world, order unknown). Kelsier, Marsh, Sazed, Tress, Nikaro and Yumi
        stay on one world in the books, so they get no Travels
  - [x] Worlds that would overlap on the map (Ashyn and Roshar) are set
        side by side
  - [x] The map opens on the first stop (in-world order), with the rest of
        the route drawn faintly ahead, ready to play
  - [ ] The rest of the world hoppers (Khriss, Nazh, ...) as they're added

### 9. Look and feel polish

Make the app feel designed and cohesive rather than generic or
AI-generated.

- [ ] Design audit: screenshot every page (desktop and phone) and list
      inconsistencies in spacing, type, colour and components
- [ ] Visual identity: a deliberate palette, type pairing (display and
      body), and Cosmere-flavoured touches (e.g. subtle Shardic or
      world-specific accents) instead of default-looking UI
- [ ] Design tokens: one set of CSS variables for colour, spacing, radius,
      shadow and type scale; replace one-off values in `index.css`
- [ ] Shared components: consistent buttons, tabs, cards, chips, notices
      and empty states
- [ ] Layout and hierarchy: clearer page headers, rhythm and whitespace;
      tame dense infoboxes and lists
- [ ] Motion and states: restrained transitions, and real hover, focus,
      loading and error states
- [ ] Phone pass: thumb-friendly targets, no cramped tables, tidy nav
- [ ] Accessibility: contrast, focus rings, reduced-motion support

### 10. My Cosmere

The reader's own home page and starting point for exploring the guide. Drew
is still shaping it (October 2026); nothing is built yet. Mockup: session
`files/mock/my-cosmere.html`.

**How it differs from the other tabs.** Every other tab is the whole
Cosmere, trimmed to what the reader may see; the Timeline tab (14) is its
history in order. My Cosmere is only about the reader: where they are, what
just happened, what changed since they last moved their place, and where to
go next. It answers "where am I?", not "what is there?". It never lists:
each panel is a short summary that links into the other tabs.

Not a dashboard of numbers: an illustrated, readable page that teaches the
universe the reader is investing in (mockup v4):

- **The Cosmere, as far as you've read**: a short plain intro (the
  Shattering, the Shards) and a small sky of the worlds the reader has
  reached; tap one to jump to it.
- **A chapter per world**, current world first:
  - a one-line lede on what the world is like and where things stand;
  - its map, with "you are here"; places named in the text light up on
    the map when pointed at;
  - **The story so far** (current book only): a few plain paragraphs up to
    the reader's chapter, names and places linked;
  - **Worth knowing**: three or four questions a reader would ask at this
    point ("What are highstorms?"), each opening a one- or two-sentence
    answer and a link to the full page;
  - **People to know**: portraits with a one-line who-they-are at the
    reader's point.
- **Keep exploring**: links to the Timeline and Star Map.

**Keep it high level.** Only universe-changing facts make the state
(Shards changing hands, a world remade, a world's order overturned).
Personal arcs and battles belong on character and journey pages.

- [ ] Data: per world, a list of states, each dated with `revealedIn`; the
      page shows the latest one reached and nothing beyond it
- [ ] Worth knowing: per world, questions with short answers, each
      dated, so they change as the reader goes on
- [ ] Book recaps: per book, short recap sections each dated to the
      chapter where they end; the panel shows those the reader has passed
- [ ] Add the tab as the first in the header and make it the home page
      (the Star Map moves to its own URL and keeps its tab)
- [ ] A friendly empty state for new readers (pick books to begin)

### 11. Book pages

- [x] Every Cosmere book, grouped by series, with a page each (names,
      series, kind and year only for now). Read books are marked, and books
      are searchable.
  - [ ] Book details (setting, worlds and places, previous/next in series)
  - [ ] Publication order view (the Coppermind's Cosmere bibliography
        lists every book in order, including within a year)
  - [ ] Tabs on each book page for everything in that book: Characters,
        Locations, Events, Abilities, plus others that fit (e.g. Worlds,
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

### 12. Locations

- [ ] A Locations tab to browse and view locations (cities, regions,
      landmarks), built on the location pages from 1b
  - [x] A list across every world, grouped like the Characters list (A–Z,
        Type, World, Series, Inside), with the choice saved in the URL.
        684 places from the Coppermind's location categories
        (`~/cig-loc-data/build.py`, from the wiki snapshot), merged with the
        map's places
  - [x] Hidden until reached, like everything else (spoiler rule): a place
        shows once the reader has finished the earliest book its page cites
        (maps count as the book they're printed in; world guides, Arcanum and
        comics don't). Map places keep their hand-checked tags
  - [x] Map icons on the list (see 8, page feature icons), linking to the
        place's map or "Where it is", and a planet's interactive map; Group
        by → Page feature
  - [ ] Refine the "Other places" type (valleys, deserts, Shadesmar
        features…) and let Drew adjust the type groups
  - [x] A page for every listed place (`/locations/:id`); places with a map
        page (and planets) go there instead. Every list entry links
  - [x] Place pages share one layout with the character pages: Key facts
        box, intro, About, History, Characters and Map, each item spoiler-tagged
        (pipeline: `~/cig-loc-data/loc_parse.py` → `loc_story_src.py` →
        stories by agents (`LOC_STORY_GUIDE.md`, `loc_story_check.py`) →
        `loc_facts.py` (+ reviewed overrides) → `loc_emit.py`)
  - [x] Mistborn Era 1 content: 63 places with stories, 58 with Key facts
        or Characters (5 Era 1 places have no dated Coppermind text yet)
  - [x] The Stormlight Archive: 70 Roshar places
  - [ ] The other series' places
  - [x] Place art beside Key facts, credited and dated like character art
        (`entryArt.ts`, `place:<id>`); first: Urithiru
  - [ ] Art for more places
  - [x] Places with more than 10 characters show "Notable characters" (the 8
        most prominent) with a See all button
  - [ ] Visitors (from Travels) alongside residents in Characters

### 13. Abilities

- [ ] A Magic tab (was Abilities; `/abilities/*` redirects): the magic systems and other abilities of the
      Cosmere and how they work
  - [x] The list page (`/magic`): 141 entries from the Coppermind's
        Magic category (systems, powers, metals, orders, users, bonds,
        Investiture, Invested objects, concepts), each listed once the
        reader has finished the earliest book its page cites (later by hand
        where the name is a spoiler); Group by Type, Magic system, World,
        Shard and Series, with ties to systems and Shards dated separately.
        Pipeline: `~/cig-abil-data/abil_build.py`
  - [ ] A page per magic system (e.g. Allomancy, Surgebinding) and per
        ability (e.g. Windrunner, Mistborn, Coinshot, Awakener), with what
        it does, its world, and the characters known to have it
    - [x] Shared entry page (`/magic/:id`) with chapter-dated intro,
          about, history, key facts and people. Pipeline:
          `~/cig-entry-data` (see its `ENTRY_STORY_GUIDE.md`); an entry
          with a page shows from its earliest intro's chapter
    - [x] **Users** section (all named users, alphabetical, each dated by
          the first block showing the use; personas by the name the reader
          knows). Abilities with ranks group users by the highest rank seen:
          Misting/Mistborn, Ferring/Feruchemist, and Radiants by Ideal
          (Squire to Fifth Ideal) on the ten order pages, Knights Radiant,
          Surgebinding and the Nahel bond; users with no stated level show
          under **Other users**; Heightenings still to do
    - [x] Art for each Radiant order: Isaac Stewart's glyph, then Steve
          Argyle's painting once it's safe
    - [x] Radiant order pages follow their Coppermind page's layout:
          Philosophy, **Ideals of the <Order>** (a subsection per Ideal,
          its words in a quote box dated to where the reader first reads
          them, "as spoken by" each speaker from the chapter they say
          them), Abilities (a subsection per Surge, Resonance...), History,
          then the order's members by Ideal. Pages can now carry such
          `sections` and rename About and Users (`aboutTitle`,
          `peopleTitle`)
    - [x] Members from character pages: anyone whose dated group or title
          facts link to an entry (Bridge Four, Highprince, Herald, the
          orders...) is listed on it once the reader sees they belong,
          even on entries with no written page
          (`~/cig-char-data/members.py`, run by `emit.py`)
    - [x] Fuller system pages: a **How it works** section (titled
          subsections, no cap) and spoiler-dated **tables** (rows can cite
          another page's lines, e.g. a metal's; later row versions replace
          earlier ones as more is revealed), cross-referenced section by
          section against the Coppermind. Done for Metallic Arts, Allomancy,
    - [x] Radiant order pages follow their Coppermind page's layout:
          Philosophy, **Ideals of the <Order>** (a subsection per Ideal,
          its words in a quote box dated to where the reader first reads
          them, "as spoken by" each speaker from the chapter they say
          them), Abilities (a subsection per Surge, Resonance...), History,
          then the order's members by Ideal. Pages can now carry such
          `sections` and rename About and Users (`aboutTitle`,
          `peopleTitle`)
    - [x] Members from character pages: anyone whose dated group or title
          facts link to an entry (Bridge Four, Highprince, Herald, the
          orders...) is listed on it once the reader sees they belong,
          even on entries with no written page
          (`~/cig-char-data/members.py`, run by `emit.py`)
          Feruchemy, Hemalurgy and Compounding
    - [x] Ars Arcanum facts show from a book's first chapter (the appendix
          spoils nothing); the entry pipeline dates its citations that way
    - [ ] Written so far: The Sunlit Man's abilities (15) and every ability
          first revealed in Mistborn Era 1 (23), and The Stormlight
          Archive's (23); the rest to do
  - [ ] Gated like everything else: an ability (and who has it) only
        shows once the reader has reached where it's revealed
    - [ ] Stopgap to replace: list entries are dated by book and carry no
          text. Date them by chapter, with facts that build up (see "Facts
          build up chapter by chapter")
  - [ ] Linked from the Characters list's **Group by → Ability** headings
        and from abilities on character pages (see 8)
  - [x] Add abilities to search (4)
  - [ ] Add magic systems to search (4)

### 14. Timeline

The Cosmere's history across every world, in in-world order, trimmed to
what the reader may see. Tab live at `/timeline` (replaced the hidden Events
tab, October 2026). It shows two static mockups, toggled at the top
(`?view=spine` for the second): **Cards** (era sections and an "at a glance"
strip) and **Spine** (a gold horizontal spine with dated badges, pictures and
a details modal). Their sample data in `src/data/timelineMock.ts` is not
spoiler-gated; replace both with the chosen design and pipeline data.

The fan spreadsheet has rows for Dragonsteel and Yolen. Check each row on its
merits instead of dropping whole worlds: row 6 is the Shattering (year 0),
which Secret History reveals.

Sources, for ordering only (verify each entry against the Coppermind, date
it by the book that reveals it, skip unpublished works, credit them):

- A fan spreadsheet
  (docs.google.com/spreadsheets/d/1JJtJhHwpKdow01n2-bsT3scVvqJd6lZh4uvpNwcslv8):
  about 94 events on one cross-world year scale with per-world years. Its
  Books column says where an event happens, not where the reader learns it.
- storyorder.guide/guides/cosmere: 34 stories in in-world order, for placing
  each book on the timeline.
- The Coppermind draft User:Fbstj/cosmere/chrono: book order plus event
  lists for Sel, Scadrial, Nalthis and Roshar, with Word of Brandon
  citations (a user page, so cross-check the main articles).

Cosmere-level facts (the Shattering, Shards) surface piecemeal across books
and Ars Arcanums, so their dating needs extra care.

- [x] A Timeline tab in the header (placeholder page)
- [x] Two static design mockups on the tab, with a toggle
- [ ] Events in in-world order, each with a scope (Cosmere or a world), an
      in-world time, plain text and `revealedIn`
- [ ] Books placed on the timeline where their stories happen
- [ ] Filter by world; jump to "now" for the reader's current book
- [ ] A page per event, linked from character, location and book pages

### 15. Culture

- [ ] A Culture tab: the peoples and societies of the Cosmere
  - [x] Populate it from the Coppermind's Culture category: political
        houses and families, noble ranks, titles and honorifics,
        nations, religions, orders and organizations, social classes,
        customs, languages, and anything else found there. 458 entries
        from Category:Culture plus Groups' noble houses, families and
        armies; places, characters and magic orders already on other tabs
        are left out, as are events (Timeline tab) and pages no book cites.
        Pipeline: `~/cig-cult-data/cult_build.py`
  - [ ] A page per entry (what it is, its world, the books it's in, and
        the characters linked to it), linked from character pages where
        they mention it (e.g. a character's house or title)
    - [x] Shared entry page (`/culture/:id`), linked from the list; same
          pipeline as abilities (`~/cig-entry-data`)
    - [ ] Written so far: The Sunlit Man's entries plus Bridge Four (10);
          the rest to do
    - [ ] Linked from character pages
  - [x] A list that can be grouped, like the Characters list, with the
        choice saved in the URL: **Type** (house, rank, title, religion,
        ...), **A–Z**, **Book**, **World** and **Series**, plus a name
        filter
  - [ ] Follows the spoiler rule like everything else: an entry, and
        every fact on its page, only shows once the reader has reached
        where it's revealed (dated by footnotes down to the chapter);
        unreached entries are hidden from lists and search with no
        placeholders
    - [x] On the list: each entry shows once the reader has finished
          the earliest book its page cites (later by hand where the name
          is a spoiler, after an independent review); unmet entries are
          hidden with no placeholders
    - [ ] Stopgap to replace: entries are dated by book and carry no text.
          Give each entry facts dated by chapter (see "Facts build up
          chapter by chapter"), starting with organizations (e.g. Bridge
          Four, the Night Brigade)
  - [x] Add culture entries to search (4)

### 16. Journey map

Where a character goes, stop by stop, on our maps, following their in-world
timeline (not grouped by book), each stop dated to its own chapter. One
reusable `JourneyMap` component with no series-specific logic, so the app
can become a template for other series. Data from importers in
`~/cig-journey-data` (see its README and `ARCHITECTURE.md` 5.9).

- [x] Proof of concept: Kaladin in The Way of Kings, on our Roshar map, from
      the 17th Shard's Roshar map data (MIT; data only, never their art or
      prose; credited by the map and in the footer)
  - [x] A **Journey** section at the top of the character page: a blurred,
        zoomed-out map with an **Explore journey** button, which lazy-loads
        the full map; it opens on the whole map and flies to event 1
  - [x] Each event has a hand-written title and summary (`revealAt` dates
        it no earlier than any fact it tells), shown in a popup card over
        the map that can be hidden; the map centres the event in the clear
        part beside or below the card, above the timeline
  - [x] Fan art per event where a piece shows that event and is safe at
        its chapter (credited; click for the whole picture). **Ask the
        artists before any public release.**
  - [x] Timeline with play/pause, previous/next, a slider and a list of
        stops; the map flies to each stop (no animation with reduced
        motion); the path so far drawn, earlier legs dimmed, approximate
        legs dashed
  - [x] Full screen (Fullscreen API, with a fixed overlay where it's
        missing), Esc exits; keyboard (arrow keys, Home/End) and touch
  - [x] Every stop gated by its chapter; places named only once the reader
        may see them; unknown chapters hidden mid-book
  - [x] A **Journey** page feature (icon on the Characters list)
  - [x] A **birth** event first whenever anything about it is known, each
        part shown only once read: the date (a Word of Brandon is fine if
        it spoils nothing; its source behind a small book mark, also used
        for the **Born** and **Age** key facts and History/Travels sources), the parents (linked once met), and the place
        (no marker until then). Nothing known: the journey starts at the
        first known event
  - [x] Click a past event's point on the map to go back to it
  - [x] **Age** key fact as of the reader's book, and **Born** (when, then
        where) above the parents
- [x] Vin in Mistborn Era 1 (37 hand-written events, `import_hand.py`), on
      the Final Empire map with city maps of Luthadel and Fadrex City: the
      map zooms into the city for city stops and back out to the world map,
      drawing the next leg only once it has zoomed out
- [x] Era 1 journeys for 24 characters (278 events), with event art on
      44 of them (`hand/art/<book>.json`), each piece showing that event
      and safe at its chapter
- [x] Dalinar, The Way of Kings to Rhythm of War (29 events); a shared
      event can tell each character's side (`byCharacter`)
- [x] Every event names where it happens (a listed place, linked once
      revealed, or a hand-written name such as Keep Venture)
- [x] Verification pass over Vin's and Dalinar's events against the
      Coppermind's chapter summaries (dates, places, wording)
- [ ] Mistborn Era 2 (and routes) via a cosmere-maps importer
      (altonchaney/cosmere-maps, MIT), which also has per-chapter routes
- [x] The later Stormlight books for Kaladin (Words of Radiance to Rhythm
      of War: 39 events, each hand-written and dated)
- [x] The other Roshar characters: 13 more (Shallan to Rysn), 221 events
      including Wind and Truth for 9
- [x] Shallan hand-written across all five books (60 events) on Roshar's
      city maps: Kharbranth, the warcamps, Shattered Plains, Frostlands,
      Kholinar, Thaylen City, Narak, and Shadesmar's Sea of Lost Lights and
      Sea of Souls; each map gated where nothing printed on it spoils.
      Moving between two cities zooms out and back in
- [x] "Show on world map" / "See location view" to see a city event on its
      world map and back
- [x] Shallan's events rewritten as plain in-world facts in chronological
      order (65 events, starting with her birth), with text that grows as
      later books reveal more and art on 22 events
- [x] Reminder-style events (after the 17th Shard): a title stating what
      happens and a one-sentence blurb with the why, for Shallan, Wit and
      Hoid; "More in History" jumps to the matching History paragraph
- [ ] The same reminder-style rewrite for the other journeys
- [ ] The same city-map treatment for the other Stormlight characters
- [ ] Routes between stops rather than straight lines (e.g. cosmere-maps'
      Stormlight paths)
- [x] Travels first on the page; a traveller's stop zooms into that
      world's journey (journey maps added for T'Telir, Arelon, Elantris
      and Kae, the Elendel Basin, Dayside and Kingseat)
- [x] Journey events for Hoid (as Wit on Roshar), so his Travels stops
      zoom in; reworked to the turning-point model on every world. Lumar,
      Komashi, Threnody and Ashyn stay Travels-only: the Coppermind has no
      surface map for them
- [ ] Journey events for the other world-hoppers (Sigzil, Vasher,
      Vivenna, Felt)
- [ ] Book and series pages: everyone's journeys in reading order
- [ ] An all-characters map (like cosmeremaps.com)
- [ ] Extract the journey model, engine and importers as a template for
      other series

### 17. Events

An Events tab beside Timeline: battles, wars, Desolations, eras and
gatherings, one entry per Coppermind event page, each dated by the book
that reveals it. Pipeline: `~/cig-event-data/event_build.py` (crawl,
fetch, hand kinds and dates in `kinds.json` and `overrides.json`); pages
are written with the entry pipeline (`~/cig-entry-data`, kind `event`).

- [x] An Events tab and list (58 events), filterable and grouped like
      Culture, and searchable
- [x] A page for Aharietiam (the Last Desolation), with its other names
- [ ] Pages for the other events
- [ ] Link events from the Timeline once it lists them

### 18. Lifeforms

A Lifeforms tab beside Culture: spren, species, creatures and plants, moved
out of Culture. Built by `~/cig-cult-data/cult_build.py` (kinds in
`kinds.json`); spren types the Coppermind covers only as sections of its
Spren article get pages from `spren_sections.py`. Pages are written with the
entry pipeline (`~/cig-entry-data`, kind `lifeform`).

- [x] A Lifeforms tab and list, grouped like Culture and searchable; old
      `/culture/<id>` links to moved entries redirect
- [x] Spren split into true spren (sapient, able to bond) and lesser spren
- [x] A page for each spren type with enough to say, and the general Spren
      page
- [x] Spren art from the Coppermind, credited and dated by what it shows
      (`src/data/entryArt.ts`)
- [x] Lesser spren share one Lesser spren page (`/lifeforms/lesser-spren`):
      a card per kind with its art (or a "No art yet" placeholder) beside its
      name, text and characters; search and in-text links go to its card, and
      old `/lifeforms/<id>` links redirect there; cards are grouped into
      emotion, nature and other spren under an About section
- [x] The Coppermind's Spren article split across pages: the Spren page
      keeps Characteristics, Classification, Bonds, Enlightened spren and
      Myths; True spren (`/lifeforms/true-spren`) and Unique spren
      (`/lifeforms/unique-spren`) get an About section and a summary card per
      kind linking to its page; the Unmade move to Unique spren
- [x] Clicking any portrait or entry art opens it in a centred viewer
- [ ] Pages for species, creatures and plants

## Ideas

Not planned yet; come back to these if wanted.

- **Travels map**
  - Passport stamps: a stamp per world visited, collected as the reader
    progresses
  - Shadesmar crossings: draw Cognitive-Realm trips differently from
    physical ones
  - Compare two travellers on one map (e.g. Hoid and Vasher on Nalthis)

## Stretch goals

Only if the guide takes off.

- **Move data out of the app bundle**, in stages:
  - Static JSON per entity, loaded on demand (as character stories already
    are), with a schema (e.g. zod) to validate it
  - A database (SQLite via Cloudflare D1/Turso, or Postgres via Supabase)
    behind a small API. The pipeline stays the only writer; the API trims
    spoilers server-side with the same shared `reveal.ts` code, so spoilers
    never reach the browser. Responses cached per entity and reading point;
    search via Postgres full-text or Meilisearch, filtered the same way
  - Optional accounts to sync reading progress across devices
  - One rule throughout: all spoiler trimming goes through one shared
    function, so server and tests can't disagree

## Completed

- [x] Books Read settings: header button and a checklist of all 35 published
      Cosmere works, saved in the browser (`134a7bd`)
