# State of My Cosmere: architecture plan

A draft to fill in as we go. Status: nothing built (October 2026).

Each decision is written as **Decision**, **Why** and **Instead of** (the
options turned down, and why). If a reason stops being true, revisit that
decision.

## 1. What it is

A new tab, **State of My Cosmere**, whose first tool is the **Explorer**: a
zoomable map of the whole Cosmere at a moment the reader picks.

- Pick a moment on a time bar. Every world shows its state at that moment,
  and every character is placed where they were.
- Zoom from the star map into a world, then into its map, then into a city
  map.
- Search for a character and the view flies to them. If they aren't born
  yet, have died, or nobody knows where they are, it says so.
- A list of characters beside the map, filtered by what's in view.
- Spoiler-safe like the rest of the guide.

### D1. One tab that holds several tools

- **Decision:** the tab is a shell (`/state`) with its own sub-navigation,
  time bar and reader progress, shared by every tool in it. The Explorer is
  the first tool; more can follow (section 10).
- **Why:** every tool idea so far (worlds, Shards, who's alive) asks the
  same question, "what is true at this moment, for this reader?". Answering
  it once, with one shared time bar, means a moment chosen in one tool
  carries over to the next, and each new tool is mostly a view.
- **Instead of:**
  - _The Explorer as its own tab_: the next tool would need another tab and
    its own time bar, and the two moments could disagree.
  - _Adding it to the Star Map tab_: the Star Map shows what is (systems,
    planets); this shows **when**. Mixing them would crowd a simple page and
    change behaviour readers already know.

## 2. What we already have

| Need                                        | Already in the app                                                                                                                                                          | Gap                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Where characters are, on maps               | Journeys (`src/data/journey.ts`, `journeys/*.json`): events with map points, in-world `order`, `revealedIn`. About 560 events for about 40 characters (Scadrial and Roshar) | Most characters have no journey                                       |
| A map engine                                | `MapEngine` interface + `SvgMapEngine` + `PanZoom` (pan, pinch, wheel, `flyTo`), used by journeys, the star map and interactive maps                                        | 2D, one map at a time; the Explorer gets its own WebGL renderer (D13) |
| Which world a character is on               | Travels (`travels.ts`): worlds visited, in order, dated                                                                                                                     | Only worldhoppers                                                     |
| Who is at a place                           | Place pages' Characters lists (chapter-dated)                                                                                                                               | No start or end time, only "seen here"                                |
| Map tree (star map > world > region > city) | `AtlasMap.parent` in `journey.ts`, hotspots in `maps.ts`                                                                                                                    | Child maps need their outline on the parent, not just a point         |
| Spoiler gating                              | `Reveal`, `reveal.ts`, `BooksReadProvider`                                                                                                                                  | Needs a gated "when it happened" too (D5)                             |
| In-world dates                              | Timeline sheet + Coppermind chronology (ROADMAP 14)                                                                                                                         | No date per book, chapter or event yet                                |
| Births and deaths                           | Free text in History only                                                                                                                                                   | No structured data                                                    |
| World states                                | Planned for My Cosmere (ROADMAP 10)                                                                                                                                         | Not built                                                             |
| Map images                                  | 46 Coppermind maps, hot-linked; the largest is 2,560 × 1,600 px                                                                                                             | Used as WebGL textures; the Coppermind sends the needed CORS header   |

The hard part of this feature is the **data** (sections 3 and 4), not the
drawing.

## 3. Time

There are two clocks:

- **Reading clock**: how far the reader has read. Already exists; it
  decides what may be shown.
- **In-world clock**: when something happened. New; it decides where
  things sit on the time bar.

### D2. One shared scale: years since the Shattering

- **Decision:** every in-world time is stored as years since the Shattering
  (fractions for months and days). Each world's calendar converts to and
  from it; the time bar shows local dates ("1174, Vorin calendar").
- **Why:** the Explorer puts every world on one time bar, so the times must
  be comparable. The timeline sheet and the Coppermind chronology already
  use this scale, so their numbers drop straight in.
- **Instead of:**
  - _Each world's own calendar only_: Scadrial and Roshar times couldn't be
    compared, which is the whole point of "the Cosmere at this moment".
  - _Reading order_ (journeys' `order`): it's per pack and counts events,
    not time; flashbacks, and two worlds at the same moment, can't be lined
    up with it.
  - _Real dates_ (`Date`): JavaScript dates can't hold 1,000s of years before
    year 0 cleanly, and the Cosmere has no Earth calendar.

### D3. Times are ranges with a reason

```ts
interface CosmereTime {
  from: number // years since the Shattering
  to: number // = from when exact
  basis: 'stated' | 'derived' | 'interpolated' | 'book-span'
}
```

- **Decision:** a time is a range plus how it was worked out. Filled in from
  best to worst: dates the books state (anchors) > book and chapter spans >
  an event's chapter position inside its book.
- **Why:** the books rarely give exact dates. A range is honest ("about
  1174") and still lets the time bar place things. `basis` lets the UI say
  "about", and lets us find weak dates to improve later.
- **Instead of:**
  - _Exact points only_: we'd have to make up precision we don't have, and
    readers would trust it.
  - _Order only (no times)_: it can't place two worlds side by side, and
    the time bar would have no scale.

### D4. Dates come from a timeline pipeline, checked against the books

- **Decision:** a pipeline (`~/cig-timeline-data`, already planned in
  ROADMAP 14) builds the chronology: calendars, anchors, and each book's and
  chapter's span. The timeline sheet and the Coppermind chronology give the
  order; the books give the dating.
- **Why:** this follows the project's rule (content is generated by a
  pipeline, not hand-edited), and the Timeline tab needs the same
  chronology, so it's built once for both.
- **Instead of:**
  - _Hand-writing dates in the app_: breaks the "don't hand-edit generated
    data" rule, and the Timeline tab would get a second copy.
  - _Using the fan sources as they are_: they include unpublished works and
    Words of Brandon, which the guide leaves out.

### D5. Dates can be spoilers, so they're gated

- **Decision:** an event or status change can have `timeRevealedIn` (like
  the existing `placeRevealedIn`). Until then it's placed at the time of
  the chapter where the reader learns about it.
- **Why:** when something happened can give things away (how old Hoid is,
  when Vasher was born). The app's rule is that every fact carries its own
  reveal, and a date is a fact.
- **Instead of:** _treating dates as harmless_: it would leak, for example
  by placing a character's birth centuries back before the reader learns
  they're that old.

### D6. The time bar stops at the reader's point

- **Decision:** the time bar opens at the in-world moment of the reader's
  current chapter. It can't go later than the latest in-world moment the
  reader has reached; beyond that it's greyed out with no labels. It starts
  at the earliest revealed date.
- **Why:** the guide hides everything the reader hasn't reached. A bar
  that runs on, even empty, shows how much story is left and roughly when.
- **Instead of:** _a full bar with later parts empty_: the length alone is
  a hint, and readers would scrub into blank space wondering why.

## 4. Data

### D7. Where characters are: presence ranges, built by a pipeline

```ts
/** Where a character is, for a stretch of in-world time. */
interface Presence {
  characterId: string
  time: CosmereTime
  where: {
    planetId: string
    mapId?: string
    placeId?: string
    point?: MapPoint
  }
  precision: 'point' | 'place' | 'map' | 'planet'
  revealedIn: Reveal
  placeRevealedIn?: Reveal
  timeRevealedIn?: Reveal
  source: 'journey' | 'travels' | 'place' | 'facts'
}

/** Born, died, Returned, became a Cognitive Shadow... */
interface StatusChange {
  characterId: string
  status: 'born' | 'died' | 'returned' | 'cognitive-shadow' | 'other'
  label?: string
  time: CosmereTime
  where?: Presence['where']
  revealedIn: Reveal
  timeRevealedIn?: Reveal
}

/** A world-changing state (ROADMAP 10), e.g. "Ash falls". */
interface WorldState {
  planetId: string
  time: CosmereTime
  title: string
  text: Passage[]
  look?: { tint?: string; overlay?: string }
  revealedIn: Reveal
}
```

- **Decision:** a new pipeline `~/cig-state-data` merges the existing
  sources into presence ranges, most precise first: journeys (map points) >
  place Characters lists (the place, over the chapters they're seen there) >
  Travels (the world, per stay) > Key facts (homeworld, as a last resort).
  Where two overlap, the more precise wins.
- **Why:**
  - It reuses data that's already dated and checked, instead of writing
    positions from scratch.
  - Merging is fiddly (overlaps, gaps, conflicts). Done in the pipeline, it
    runs once per data change with its own checks, and the app just reads
    the result.
  - Ranges ("here from A to B") answer "where at time T?" directly; events
    ("arrived at A") would need replaying the whole history every time.
- **Instead of:**
  - _Merging at runtime in the browser_: the same fiddly logic would run on
    every visit, and mistakes would surface as spoiler bugs in the app.
  - _Hand-writing every character's positions first_: about 2,000 characters
    is years of work before anything ships. Positions improve book by book
    instead, the way journeys did.

### D8. Show rough positions honestly instead of hiding them

- **Decision:** characters known only at place or world level still appear:
  a halo at the place, or listed on the planet without a dot. The marker
  style shows how precise the position is.
- **Why:** most characters will only have place or world precision for a
  long time. Hiding them would make the Explorer look empty and make
  "every character" untrue. Showing precision visually keeps it honest.
- **Instead of:** _only exact positions_: about 40 characters would show,
  and searching for anyone else would just say "unknown".

### D9. Births and deaths: a separate status list

- **Decision:** `StatusChange` records (born, died, Returned, Cognitive
  Shadow, etc.), from History footnotes in the character pipeline, each with
  its own reveal and gated date.
- **Why:** "not born yet" and "dead" are what search must say, and they
  aren't positions. Statuses beyond alive or dead are common in the Cosmere
  (Returned, Cognitive Shadows, Sleepless), so the list can't just be two
  dates.
- **Instead of:** _`born` and `died` fields on the character_: they can't
  carry their own reveals or the Cosmere's other statuses, and a character
  can die and come back.

### D10. Files split per world, loaded when needed

- `chronology.json`: calendars, anchors, book and chapter spans. Small;
  loaded with the tab.
- `index.ts`: per character, their worlds, reveals and status changes.
  Small; loaded with the tab (search and the list need everyone).
- `<planet>.json`: that world's presences and world states. Loaded when the
  view reaches that world.

- **Decision:** as above.
- **Why:** it's the pattern journeys already use (a small eager index plus
  lazy packs), and the reader is usually looking at one world at a time.
- **Instead of:**
  - _One big file_: the reader would download every world's data just to
    look at one.
  - _One file per character_: hundreds of requests for a single crowded
    map.

## 5. The "state at a moment" engine

```ts
type CharacterState =
  | { kind: 'here'; where; precision; since: CosmereTime }
  | { kind: 'last-seen'; where; at: CosmereTime }
  | { kind: 'not-born'; bornAt: CosmereTime } // only once revealed
  | { kind: 'dead'; diedAt: CosmereTime; where? } // only once revealed
  | { kind: 'unknown' } // met, but nothing places them here

function stateAt(t: number, progress: ReaderProgress): CosmereState
```

### D11. Plain functions, trimming first

- **Decision:** `stateAt` is plain TypeScript with no React or drawing. It
  trims the data to what the reader may see (`reveal.ts`) **before**
  working anything out.
- **Why:**
  - Trimming first is the app's spoiler rule: nothing worked out (a gap, a
    lifespan, a count) can then come from hidden data.
  - Plain functions are quick to test at set chapters, like `reveal.test.ts`
    does now, and every tool in the tab can share them.
- **Instead of:** _working it out inside components_: spoiler logic would
  be spread over UI code, where it's harder to test and easy to get wrong
  in one place.

### D12. Simple lookups, no clever indexing

- **Decision:** one array of presences per character, sorted by time, and a
  binary search.
- **Why:** about 2,000 characters × a few dozen presences each is tiny.
  This answers "everyone at time T" in well under a millisecond, fast enough
  to rerun on every move of the time bar.
- **Instead of:** _interval trees, a web worker or a server_: extra code
  and moving parts for no speed a reader would notice. Revisit only if
  profiling says so.

### "Last seen" rule

If a character's last known presence ended a while ago, the state is "last
seen at X", not "is at X". The cut-off is a per-world setting. Without it,
the map would claim people are still where we last saw them years later.

## 6. Drawing the map

### D13. WebGL with Three.js and React Three Fiber

- **Decision:** the Explorer draws with **Three.js** through **React Three
  Fiber** (R3F), plus `@react-three/drei` (text, helpers) and
  `@react-three/postprocessing` (glow). The time bar, list, search and
  panels stay ordinary HTML around the canvas. The rest of the guide keeps
  its SVG `MapEngine`.
- **Why:**
  - **The goal is a smooth, seamless, beautiful experience**, not just a
    working map. That needs smooth flights from the stars down to a
    city, cross-fades between maps, glow, a turning globe, and later routes
    and "play". All of these are cheap on the GPU and hard or slow in SVG.
  - **Real 3D where it counts.** Worlds are actual spheres with lighting and
    an atmosphere, and the camera has perspective, so zooming in feels like
    flying in rather than scaling a picture.
  - **Room to grow.** Animating every character at once, trails, weather
    or Shardic effects drawn with shaders, and a 3D star map all fit the
    same engine without a rewrite.
  - **It fits a React app.** In R3F the scene is written as React
    components, driven by the same state, hooks and URL as the rest of the
    guide, and spoiler-trimmed data goes in as props.
  - **Tested in a prototype** (October 2026; built against PixiJS, below):
    - Both engines held a steady 60 fps on an M4 Pro at desktop, retina
      and phone sizes.
    - Three's real globe and depth looked clearly better.
    - Under software rendering (a stand-in for a weak phone), Three managed
      24–31 fps between stops, against Pixi's 27–37.
    - Animating 2,000 markers in JavaScript dropped Three to 15 fps. The
      fix is to animate them on the GPU (D16).
  - **Costs, accepted:**
    - About 310 KB more JavaScript (gzipped), loaded only by this tab
      (`React.lazy`).
    - Accessibility has to be added by hand (D16, D18).
    - jsdom can't render it (section 8).
- **Instead of:**
  - _SVG on the existing `MapEngine`_ (this plan's first draft): simplest,
    and it has accessibility and tests for free. But it can't zoom
    seamlessly between maps, has no real globe, and effects and "play" are
    slow. It's a fine map, not the experience we want.
  - _PixiJS_: smaller (about 180 KB) and a little faster in the weak-phone
    test, but 2D only. The globe had to be faked with a disc, depth with
    parallax layers, and each new 3D idea would mean another trick.
  - _deck.gl_: excellent for huge geographic datasets, but built around
    latitude and longitude and map tiles, and weak at styled art like
    globes and glows.
  - _Babylon.js_: as capable as Three, but larger and less used with React,
    with a smaller ecosystem for this kind of work.
  - _Raw WebGL or a home-made engine_: total control, but we would rebuild
    cameras, text, picking and effects that Three already has.

### D14. A tree of maps; click to go in, zoom freely within one

```
Cosmere (painted sky) > world (globe, then its map) > region map > city map
```

- **Decision:**
  - Data stays a tree: each map keeps its own pixel coordinates, as
    journeys already use. The pipeline adds each child map's **outline on
    its parent** (`parent.bounds` on `AtlasMap`).
  - You're always on one **level** (one map). Scrolling, pinching and
    dragging move around that level only. You go **in** by clicking: a
    star in the sky, or a hotspot on a map. You go **out** with a Back
    button (and the breadcrumb). Scrolling never changes level.
  - **Each level has edges.** You can pan and zoom freely but never off the
    map: dragging stops at its edges, zooming out stops once it fills the
    screen, and zooming in stops before the art blurs.
    - Sky: zoom out until the painting fills the screen, in to about 2×.
    - World: zoom out to the whole globe, in to just above city size, so
      cities need a click. Out in space, the globe can't be dragged out of
      view.
    - City: always fills the screen.
  - The move between levels is a short flight (about a second): the camera
    flies to the target while the old map cross-fades into the new one. A
    flight lands inside the new map's edges, so nothing snaps on arrival.
    Input waits until it lands.
  - Drawing is one scene. Each child map is a textured plane placed on its
    outline in the parent, so the flight is one smooth move.
  - Only the current map, its parent and its visible children are loaded.
  - The camera re-centres on the current map, so deep zooms keep numbers
    precise (no jittering markers).
- **Why:**
  - **Clicking to go in is predictable.** In the first prototype, scrolling
    on the sky slid you into Roshar and pulled the view toward it. You
    should decide when to enter a world, not trip into it.
  - **Edges keep you oriented.** There's nothing past a map's edge, and
    drifting into empty space only loses your place.
  - **Flights keep it seamless.** You still see where you came from and
    where you're going, which a hard cut loses.
  - A tree of maps keeps journey coordinates as they are; loading by
    distance keeps memory low on phones.
- **Instead of:**
  - _One continuous zoom, where scrolling flows from map to map_ (the first
    prototype): smooth, but you enter worlds by accident, and the edges of
    two maps fight during the hand-off.
  - _Separate scenes with a cut between them_: simpler, but you see the
    join and lose your sense of place.
  - _One big plane with everything converted to it_: every coordinate
    converted, every map loaded at once, and numbers too imprecise at city
    zoom.

### D14a. The sky is Isaac Stewart's constellation painting

- **Decision:**
  - The top level is the Cosmere constellation map from Arcanum Unbounded
    (Coppermind, credited to Isaac Stewart), with its painted names
    removed. Our own labels and glowing stars sit on each system, only for
    systems the reader has met.
  - Hovering a star lights up its constellation; clicking it flies in.
  - The painting sits behind the worlds and moves more slowly than them
    (parallax), so flying in feels like depth. Roshar's star becomes its
    globe.
- **Why:**
  - It's official art that readers know and love, and far more beautiful
    than dots on black.
  - Painting out the names and drawing our own keeps the sky spoiler-safe
    (a painted name can't be hidden) and lets labels stay sharp at any
    zoom.
- **Costs, accepted:**
  - Worlds newer than the painting aren't in it; they need a star added.
  - The art's positions differ from the Star Map's, so the Explorer uses
    the art's.
  - The painted-out names need a hand touch-up, and the constellation
    lines for hover need tracing by hand.
- **Instead of:**
  - _A generated starfield_: always up to date, but plain.
  - _The painting with its names_: simplest, but it names worlds the reader
    hasn't met.

### D15. Worlds are 3D globes; maps stay flat

- **Decision:**
  - From space, each world is a lit sphere with an atmosphere glow. Its
    texture is, in order of preference: wrapped art if it exists, else the
    world map, else a simple shader-drawn look from `WorldState.look`
    (colour, clouds, highstorm and so on).
  - Zooming in turns the globe to face you, then cross-fades to the flat
    map.
  - The existing SVG `PlanetGlobe` stays on the Star Map and world pages.
- **Why:** a globe that turns and catches the light is what makes space feel
  real (the clearest difference in the prototype). The art we have is flat
  maps, so the flat map is where readers actually look things up. A shader
  look covers worlds with no map.
- **Instead of:**
  - _Flat discs for worlds_: they read as stickers (Pixi prototype).
  - _Wrapped textures for every world_: they don't exist for most worlds,
    and making them would mean inventing geography.

### D16. Layers, merging crowded places, and making markers usable

Layers in each map, bottom to top: the map image > world-state tint >
places (hotspots from `maps.ts`; ones with a child map pulse as a zoom-in
cue) > character markers > labels. Routes and "play" come later.

- **Decision:**
  - **Markers:** one instanced mesh per layer, kept the same size on screen
    whatever the zoom. Moving markers ("play") get their positions in a
    shader from start and end points and a time value, so the CPU does no
    work per marker each frame.
  - **Labels:** sharp SDF text (drei `Text`). Labels that would overlap are
    hidden, highest-priority first (selected > searched > main characters).
  - **Glow:** bloom only on things brighter than white (stars, markers,
    hotspots), so map art keeps its true colours. Turn off the composer's
    MSAA (it rendered black on Metal in the prototype).
  - **Merging:** characters at the same place merge into one marker with a
    count ("72") that opens the list. Exact points that overlap on screen
    merge using a simple screen grid.
  - **Keyboard and screen readers:** a layer of real, focusable HTML
    buttons sits over the canvas for the visible markers and places, moved
    each frame to match. It has names and focus rings, and gives the same
    actions as clicking.
  - **Reduced motion and no WebGL:** with reduced motion on, fly-tos become
    short fades and twinkle and pulses stop. Without WebGL, the tab shows
    the list (D18) and says the map needs WebGL.
- **Why:**
  - Instancing and GPU animation are what make thousands of markers cheap
    (the prototype's slow spot).
  - Merging by place costs nothing, because most rough positions already
    share a place.
  - The button layer gives readers using a keyboard or screen reader the
    same map, not only the list.
- **Instead of:**
  - _One mesh per marker_: thousands of draw calls.
  - _A clustering library (for example supercluster)_: built for huge
    geographic datasets, while ours is small and mostly grouped by place
    already.
  - _No overlay, list only_: keyboard and screen-reader users would lose
    the map entirely.

### Proof of concept (October 2026)

A throwaway prototype tested the decisions above. It's rough and needs a lot
of refinement, but the approach works and it's the starting point for the
real build.

- **What it has:**
  - The painted sky (D14a), with names painted out, our own labels, the
    `?read=` filter for systems the reader has met, and hover glow.
  - Click Roshar's star to fly in: the painting falls away behind (parallax)
    and the star grows into a lit, turning globe with an atmosphere.
  - The globe cross-fades into the flat Roshar map. Click the Shattered
    Plains hotspot to fly into its city map.
  - Levels with edges and zoom limits, click to go in, a Back button to
    go out (D14).
  - 218 dummy markers with labels, and 2,000 moving ones for "play".
  - Glow on stars, markers and the hotspot (D16).
- **What it proved:**
  - Three.js and R3F give the smooth, deep experience we want (D13).
  - 60 fps on an M4 Pro at desktop, retina and phone sizes, all the way
    from sky to city and while playing.
  - The sky painting works as a spoiler-safe, clickable map.
  - Clicking to go in, plus edges on each level, feels in control.
- **Needs refinement** (known so far):
  - **Sky:** a few specks left from painting out the names need a hand
    touch-up. The hover glow is guessed from colour and should follow
    hand-traced constellation lines. On phones you see a narrow slice of
    the painting.
  - **Flights:** Back to the sky lands off-centre when the star is near
    the painting's edge. Starting a new flight mid-flight jumps the fade.
  - **Maps:** the Roshar map is soft at full zoom; a sharper source or
    tiles are needed. Only Roshar and the Shattered Plains exist; other
    stars just zoom the painting.
  - **Speed on weak phones:** under software rendering, 2,000 markers
    moved in JavaScript drop to 15 fps. They need GPU animation (D16).
  - **Not built yet:** real data and spoiler trimming, the time bar,
    list, search, breadcrumbs, labels that avoid each other, keyboard and
    screen-reader access, reduced motion, and the no-WebGL fallback.
- **Not kept.** The real build starts from scratch, following this plan
  (data from the pipelines, spoiler trimming, the map tree, routes). The
  prototype skipped all of that, so reworking it would cost more than
  writing it fresh. What's worth carrying over is below.
- **Lessons to carry over:**
  - **Composer MSAA off.** With `@react-three/postprocessing`'s default
    multisampling the whole scene rendered black on Metal. Use
    `<EffectComposer multisampling={0}>`.
  - **Bloom only on bright things:** luminance threshold about 0.97, and
    `toneMapped={false}` on map art so its colours stay true.
  - **Attach drag and zoom handlers to the canvas** (`gl.domElement`), not
    a wrapper. Pointer capture on a wrapper swallowed clicks on HTML
    buttons over the map.
  - **A ring's hole doesn't take clicks;** put an invisible filled disc
    under each ring-shaped hotspot.
  - **Custom shaders on sRGB art** need `#include <colorspace_fragment>`,
    or the colours wash out.
  - **Sky parallax:** the painting sits on a plane behind the worlds and
    grows as `30 × (h / 43000)^0.6` world units per art pixel (h is the
    view height). It's pinned so its Roshar star stays on the planet. The
    camera centre showing art point L is then `scale(h) × L`. The edge
    clamp has to allow for the far plane covering more of the art.
  - **Edges:** clamp each axis so a view of half-size `half` stays inside
    `[lo, hi]`, or centre it if the map is smaller than the view. Skip the
    clamp mid-flight and clamp the flight's target instead.
  - **Star positions in the painting** (art pixels, 2300 × 1737): Roshar
    606,1277; Scadrial 942,1025; Nalthis 819,1501; Sel 643,1536; First of
    the Sun 1533,1393; Taldain 302,867; Threnody 144,167.
  - **Painting out the names:** OpenCV, masking the gold label text,
    keeping round yellow dots (real stars) out of the mask, then two
    passes of Telea inpainting. Good enough to see the idea; the real
    image needs a hand touch-up.

## 7. The tab and its UI

### D17. Routes and the URL hold the state

```
/state             -> layout: sub-navigation + time bar
/state/explorer    -> the Explorer (default)
/state/<tool>      -> later tools (section 10)
```

`/state/explorer?t=1174.3&map=shattered-plains&focus=kaladin`

- **Decision:** each tool is a nested route under one layout; the moment,
  map and focus live in the URL.
- **Why:** it's how the rest of the app works (list groupings are in the
  URL). Links and the back button then do the expected thing, and the
  moment carries between tools.
- **Instead of:** _component state only_: refresh or share loses your
  place, and back leaves the tab instead of undoing the last move.

### D18. The list is the accessible way in

- **Decision:** a full HTML list beside the map (in view / this world /
  everyone; group; alive), synced with the map. On phones it's a bottom
  sheet over a full-screen map.
- **Why:** a map is hard to use with a screen reader or keyboard, and
  "who's here" is often easier to scan as a list anyway. It also works
  before the map does (D21).
- **Instead of:** _map only_: shuts out some readers, and crowded places
  are hard to read on a map alone.

### D19. Search reuses the app's search

- **Decision:** the Explorer's search uses the existing search engine
  (characters only, met only) and adds an action on a pick:
  - **Here**: fly there and select them.
  - **Last seen**: fly to the last place; "Last seen here in <date>".
  - **Not born yet**: "Not born yet at this time"; "Go to their birth"
    (only if that date is revealed).
  - **Dead**: "Died in <date>"; "Go to their last days" (only if revealed).
  - **Unknown**: "Nobody knows where they are at this time", with the
    nearest known moments before and after.
- **Why:** the existing search already handles names, personas and "not
  met yet", with tests. A second search would drift from it.
- **Instead of:** _a separate search for the Explorer_: two sets of rules
  for spoilers and names to keep in step.

### D20. Code follows the app's existing layout

```
src/data/state/              generated data, loaders, stateAt, time model
src/components/explorer/     scenes, layers, list, inspector, time bar
src/routes/state/            StateLayout, ExplorerPage, later tools
```

- **Decision:** as above, with the tab loaded on demand (`React.lazy`).
- **Why:** pure data logic already lives in `src/data` (`reveal.ts`,
  `journey.ts`), components in `src/components`, pages in `src/routes`.
  Following that keeps it familiar. Lazy loading keeps the rest of the
  guide from loading this tab's code.
- **Instead of:** _a new `features/` folder_: a second way of organising
  code in one small app.

## 8. Testing

- **Engine:** `stateAt` tests at set chapters for each state, gaps,
  precision, and that hidden dates and deaths never show. They pin spoiler
  behaviour, like `reveal.test.ts`.
- **UI:** list, search, time bar and the marker button layer (D16) tested in
  jsdom, as usual.
- **Scene:** the R3F scene is checked with `@react-three/test-renderer`,
  which builds the scene without WebGL. The spoiler tests assert what goes
  into it (which markers, labels and maps exist at a chapter), not pixels.
  The WebGL canvas itself is mocked in jsdom.
- **Visual:** headless Chrome screenshots, desktop and phone, at fixed
  camera stops (`?stop=`), using both the GPU and software rendering
  (SwiftShader), since the prototype showed they can differ.
- **Speed:** a scripted tour (fly every stop, then play) records fps and the
  slowest 5% of frames. Targets: 60 fps on desktop, 30 fps on a mid-range
  phone and under software rendering.

## 9. Order of work

### D21. Data and list first, map second

1. **Chronology** (D2–D6): calendars, anchors, book and chapter spans.
2. **Presences and statuses** (D7–D9) from existing data; `stateAt` with
   spoiler tests (D11).
3. **Tab shell** (D17–D19): route, time bar, list and search, without a
   map. Already useful: "where was everyone at this moment".
4. **Explorer map** (D13–D16): scenes, markers, merging, search-to-fly,
   clickable city maps.
5. **Coverage**: more exact positions book by book; world states.
6. **Polish**: routes and play, phone sheet, speed and accessibility checks.

- **Why:** the data is the risky part. If the dates or positions don't hold
  up, a finished map has nothing true to show. A list proves the data first
  and ships something readers can use early.
- **Instead of:** _map first_: a polished map of mostly "unknown", and any
  data surprises found last.

## 10. Other tools the tab could hold

All use the same time bar and `stateAt` (D1): **Worlds** (each world's state
as cards; ROADMAP 10's world chapters fit here), **Shards** (who holds which,
Splinterings), **Who's alive** (a roster at the moment), **Side by side**
(two worlds at one moment).

## 11. Open questions

1. **My Cosmere (ROADMAP 10):** merge it into this tab as the start page,
   or keep it as a separate home page? Its "per world states" data is the
   same as `WorldState` here.
2. **Precision (D8):** OK to show most characters at place or world level
   at first?
3. **Time bar (D6):** OK to stop it at the reader's point?
4. **Phones:** equal priority, or desktop first?
5. **Route name:** `/state`, or something else?
