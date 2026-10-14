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
"Spoilers hidden for (books)" notice with a **View anyway** button, so readers
can choose to see that system in full (and **Hide again**). Facts known only
from Words of Brandon are hidden behind the book they would spoil, choosing
the later book when unsure.

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
  - [ ] Clicking a region opens a page for that place, or opens a regional map
        if one exists
  - [ ] Only show regions, and information about them, from books the reader
        has marked as read

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

- [ ] Add a search bar to the header banner that searches every kind of data
      in the guide (systems, planets, characters, locations, shards, magic
      systems, books, etc.).
  - [ ] Build one search index covering all data types
  - [ ] Show results as you type, grouped by type, and link each one to its
        page
  - [ ] Support keyboard use (shortcut to focus, arrow keys, Enter, Escape)
  - [ ] Leave out results, and text in result snippets, from books the reader
        hasn't marked as read
  - [ ] Add new data types to the index as they're added to the guide

### 5. Main navigation tabs

- [ ] Add tabs to the header banner for moving between the main sections of the
      guide. More tabs may be added later.
  - [ ] **Star Chart**: the current Cosmere star map, systems and planets
  - [ ] **Characters**: browse and view characters
  - [ ] **Locations**: browse and view locations (cities, regions, landmarks)
  - [ ] **Maps**: a gallery of all available maps (shared with planet maps, 1)
  - [ ] Give each tab its own URL and show which tab is active
  - [ ] Keep every tab spoiler-free for the books the reader has marked as read

## Completed

- [x] Books Read settings: header button and a checklist of all 35 published
      Cosmere works, saved in the browser (`134a7bd`)
