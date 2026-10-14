# Roadmap

Planned features for the Cosmere Interactive Guide. Tick a box when the
feature ships and note the commit.

## Planned

### 1. Planet maps

- [ ] Add a map to each planet that has one available (e.g. Roshar, Scadrial,
      Sel, Nalthis, Taldain, Threnody, Lumar).
  - [ ] List which planets have maps and where they come from
  - [ ] Store the maps (or links to them) alongside the planet data
  - [ ] Show the map on the planet detail page, with pan and zoom
  - [ ] Credit the source and respect its licence

### 2. Planet appearances

- [ ] Show the books and other works each planet is featured or mentioned in.
  - [ ] Collect appearances for each planet, marked as featured or mentioned
  - [ ] Show them on the planet detail page
  - [ ] Hide appearances from books the reader hasn't marked as read
        (uses the Books Read settings)

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

## Completed

- [x] Books Read settings: header button and a checklist of all 35 published
      Cosmere works, saved in the browser (`134a7bd`)
