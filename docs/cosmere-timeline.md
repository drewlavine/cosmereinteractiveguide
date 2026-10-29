# Cosmere Timeline: plan and proof of concept

The Timeline tab's main view: the history of the Cosmere on one continuous,
zoomable map of the whole Cosmere, with a time bar along the bottom. It is
modelled on the 17th Shard's
[Roshar map](https://roshar.17thshard.com/#/en-US)
([source](https://github.com/Palanaeum/roshar-map), MIT), widened from one
world to all of them. When the story moves to another world, the camera
leaves one planet, rises into the painted sky of the Cosmere and dives into
the next.

The proof of concept is the whole of `/timeline`. The two static mockups
that came before it (Cards and Spine) are removed.

## UX

- **The stage** fills the page below the header, edge to edge of the
  content column. The page is a flex column of `min-height: 100%` inside the
  app's scrolling main area, and the stage takes the rest (`flex: 1`), so
  it is the viewport height minus the header and footer. Its minimum height
  is 30rem on desktop and 32.5rem on phones; below that the page scrolls.
  A "Timeline" title and a one-line intro sit above the map, and a one-line
  credit under it.
  The stage is the explorer: one continuous zoom from
  the constellation painting of the Cosmere, down to a world's globe, and
  on into that world's map. The design and engine are in
  `docs/state-of-my-cosmere.md` §6 (D13–D16).
- **The time bar** runs along the bottom: a slim dark-glass strip. Each
  event has a diamond in its world's colour on a gold line, with its year
  below it. The bar scrolls so the current event sits under a notch in the
  middle (half-width spacers at each end, so any event can be centred).
- **The date tab**, a glass pill floating above the notch, shows the
  current event's date the way
  the 17th Shard's scrubber does: the bare year, then its label, then the
  world. Once the reader knows of the Shattering (Secret History 3-2),
  every event goes by one count, years since the Shattering (`ca. 10958`,
  "after the Shattering"; earlier ones "before the Shattering"), and the
  details panel adds the world's own date (`1167.10 · Rosharan year`) as a
  second line. Before that, each event shows its world's own date. The
  label's tooltip says what the count starts from.
- **The event card**, after the 17th Shard's, is a small dark-glass card
  centred above the date. It shows only the title and a one-line summary
  (`summary`, else the first blurb line), with an inline **More**. The card
  can be closed and reopened.
- **The details panel.** More opens an `aside` on the right (full width on
  phones) without leaving the page. It holds the world and place, title,
  date, the full blurb, badged notes ("Word of Brandon", "Approximate"),
  the characters, and the event's own page (`eventStories`, trimmed by
  `revealEntry`) when it has one, plus a small link to that page. Esc
  closes it first.
- **Centred.** The world stays in the middle of the stage; the card and
  bar may overlap it.
- **Controls on the right**, top to bottom: full screen, zoom in, zoom
  out, and **Reset**, which flies back to the default view of what's being
  looked at (the current event's framing, the explored world's globe, the
  whole Cosmere, or the character being shown). Reset reuses the goal:
  it re-sends it under a fresh key (`…#resetN`), so no new camera code.
- **Tools on the left**, in a column: the planet button (worlds drawer),
  **Shards** and **Notable characters**. One drawer (worlds) and one right
  panel (details, Shards, a Shard or characters) open at a time.
  - **Shards** (`src/data/shards.ts`, hand-maintained): each Shard is a
    list of entries `{from: event id, world, status, revealedIn}`. At the
    selected point a Shard shows its latest entry the reader can see at or
    before it; with none it isn't listed. The Shards button opens a right
    panel like Notable characters, in two groups, each under its heading
    only when it has any: "Location known" (art, name and planet, "On
    Roshar"), then "Location unknown" (art and name). Clicking one opens
    its details panel and moves the camera to its world, or out to the
    whole Cosmere if it has none (the timeline point, `?event=`, stays);
    flying to a world hides the event card until the reader moves on.
    Shards are Cam Kuta's stained-glass art (`public/shards/`), greyed out when an entry is
    `faded` (Splintered, Shattered, dead). Hovering one names it; clicking
    it opens a right panel: the art, **Status**, and **Vessel** (an entry's
    `vessel: {name, id, revealedIn}`, shown only once revealed) as a
    character tile. Preservation, Ruin, Devotion, Dominion, Honor,
    Cultivation, Odium, Endowment, Autonomy, Ambition, Invention, Whimsy,
    Mercy, Valor and Virtuosity so far. Honor's death is dated at Reod, the
    nearest event after the Recreance; Cultivation has no Vessel (no
    character page), nor Endowment (Edgli is only Word of Brandon).
    Ambition's death shows with its wounding (when it died is unknown).
    Shards with no known home (Invention, Whimsy, Mercy, Valor,
    Virtuosity) enter at the Shattering with world `COSMERE`: listed in
    the panel under "Location unknown", never on a world card. Harmony isn't
    modelled: a Shard can't yet combine others.
  - **World card** (`src/components/timeline/WorldCard.tsx`). At a
    world's globe view (`onGlobe` from `ExplorerCanvas`: the planet in,
    the map rolled up), the world's name sits centred just above the globe
    in the gold serif, with a small "Details ›" pill (a self-contained
    `.more` element, so another treatment can drop in). Clicking it opens
    a large dialog over the explorer: **State** (`src/data/worldStates.ts`),
    **Shards** (the world's Shards at this point, as in the Shards panel)
    and **Notable characters** (those on the world now, main characters
    first). The live globe docks smaller at the dialog's right (on phones,
    on top): `Cam.dock` frames the camera with a view offset
    (`setViewOffset`), weighted by the globe view, so the camera's
    position and `limit()` are untouched and the globe still drags.
    Clicking the planet closes the dialog and zooms into the world's map,
    like clicking the globe; Esc, × and the backdrop close it and return
    focus to the title. Leaving the globe view closes it. The card replaces
    the Shards and characters that used to arc around the globe.
  - **Entry style switcher (temporary).** While a style for the way into
    the card is chosen, a small "Try a style" switcher sits over the globe
    view (bottom right; top left on phones; put away while the dialog is
    open) so visitors can compare them. `?title=<id>` picks one (for
    sharing a link), else the last pick (localStorage
    `cosmere-guide:world-title-style`), else `state`. In the title:
    `current` ("Details ›" pill), `name` (the name is the button, with an
    underline and chevron), `line` ("State of the world ›" under the
    name), `icon` (a round ⓘ button), `chip` (planet icon + "Overview"),
    `hover` ("See the state of …" on hover or focus, always on touch).
    Elsewhere, the title is just the name: `state` (a glass chip with the
    world's state and its "Since …" line, left of the globe, under the
    toolbar when there's no room, under the name on phones) and `moon` (a
    node on a gold orbit around the globe, mirrored to ten o'clock when
    two o'clock would hit the zoom buttons or map credit). With no state
    to show, `state` falls back to `name`. The code is marked `ponytail:`
    (`worldTitleStyle.ts`, `TitleStyleSwitcher`, `TitlePlacement`); once a
    style is picked, keep it and remove the rest.
  - **World states** (`src/data/worldStates.ts`, hand-maintained): each is
    `{world, from: event id, label, text, revealedIn}`, one factual
    sentence. A state starts at an event on its own world and is dated no
    earlier than that event (usually the same `revealedIn`, later if its
    words need a later chapter, e.g. "Vengeance Pact" from The Way of
    Kings ch 18). The card shows the latest one the reader can see at or
    before the point, then "Since Gavilar's assassination · 6 years ago"
    (the state's `since` noun phrase, then the years since its event:
    "this year" in the same year, none when the calendars differ; no line
    without a phrase, since bare years say nothing). Worlds with no state
    yet get no State section. Periods with no timeline events (all of Era 2
    so far) get states once they have events.
  - **Character tiles** (`src/components/CharacterTiles.tsx`), after the
    17th Shard's related characters: round art in a gold ring (the latest portrait
    the reader may see, top-aligned; initials otherwise), name below,
    linking to the character's page, with the art credit. Reuse it for
    any list of characters.
  - Each drawer sits in a row with its own button; its padding hangs
    over the row, so its buttons line up with the one that opened it.
  - **Notable characters** (`src/data/timelinePeople.ts`): a right panel
    with a search (names and visible aliases) over the Cosmere Maps notable
    lists plus anyone named on a visible event, met characters only. As of
    the current event each is: not born yet ("Not born for another N
    years", with "Jump to their birth"), dead ("Died this year" / "Died N
    years ago", with "Jump to their death"), or on a world (the last
    visible event naming them). Years are counted only when both dates are
    visible: exactly in one calendar, otherwise "about" N on the timeline's
    own scale (Vin's death from a Rosharan event). Births and deaths are timeline event ids,
    so an unreached one is simply unknown, or a `LifeDate` (a year on the
    timeline's scale with its own `revealedIn`) for one with no event: an
    inexact birth gives the earliest it can be (e.g. no Rosharan before
    1050), an inexact death the latest, and the jump goes to the first
    event at or after it. Whereabouts after a death outrank it (Kelsier as
    a Cognitive Shadow). A `momentary` whereabout holds only at its own
    event, for mortals whose later fate the reader can't know yet (Marsh
    and Spook at the Catacendre). Clicking a located character
    flies to their pin, drawn as their face (`facePortraits` +
    `revealPortrait`), or, without a map or point, to the planet, with a
    "Kaladin is somewhere on Roshar" label at the top. With no data
    (e.g. Mistborn's characters for now) a row shows only the name.
  - **Place flags** (`flags.ts`, placed in `ExplorerCanvas`'s
    `place()`): on a world's map, everyone located shows under **one flag
    per place** (the city map their pin is on, else the place named on the
    pin), not as loose faces. A flag is a ground dot where the place is, a
    stem, and a 34px chip (30px on phones) with up to three overlapping
    faces (the most notable first, whoever the reader asked to see first
    of all), a gold count from 2 people, the place's name in the display
    font and, if the place has its own map the reader may see, a separate
    map button that opens it. Only people already trimmed to what the
    reader may see are grouped, so a count never includes anyone hidden
    and a place whose people are all hidden has no flag.
    - **Placement:** greedy, the event's place first, then by count: the
      first of 8 spots around the place (N, NE, E … NW), at a 14px, then
      40px, then 70px gap, clear of the controls
      over the map, the names painted on the map (`paintedNames.json`,
      keep-out boxes only), other flags and their dots. Failing that, a
      compact flag (one face and the count); failing that, the place
      folds into the nearest flag ("+1 place"), its stem leading there.
      A flag keeps last frame's spot while it still fits. Flags are DOM,
      measured once; each frame only moves them.
    - **Edge flags:** a place off screen gets a dashed flag at the edge,
      with an arrow toward it (up to 4, most crowded first); clicking it
      pans there.
    - **Roster:** clicking a flag opens who's there (a popover beside it;
      a bottom sheet on phones), each face going to that person as from
      the Notable characters panel, with "Open the map of …" when there's
      one. Esc, a second click or a click on the map closes it.
    - **The event's place** gets a pulsing ring on the ground (still
      under reduced motion) and a gold-bordered flag.
    - **Location unknown:** those on the world without a known spot are a
      small dashed chip under the controls ("4 location unknown"), opening
      the same roster.
    - **On a city's map** people show as faces at their spots, fanned out
      around a spot shared by 2–5 (with leader lines back to it); 6 or
      more at one spot get a flag.
- **Full screen.** The top button on the right
  takes the stage full screen with the Fullscreen API, or as a fixed
  overlay where there's none (iPhone Safari). Esc leaves full screen first,
  and only zooms out to the Cosmere when not full screen.
- **Previous / next** buttons sit at each end of the bar. Keys: ← → step,
  Home and End jump to the ends, and Esc zooms out to the Cosmere. Every
  button has a `data-tooltip`. The selected event is kept in the address as
  `?event=<id>`.
- **Flying.** Picking an event flies the camera to its world, then frames
  its map (if it has one) or its pin (if it has a point). Only the
  current event has a pin, and it pulses. A world's map is its top-level
  one (Sel's is Sycla/Opelon, not Arelon), but while the current event is
  in a city with its own map (an event `map.mapId` like `elantris-and-kae`),
  the world unrolls into that city map instead. Era maps work the same way:
  Roshar's events before the Recreance unroll into the Silver Kingdoms map
  (once the reader has finished The Way of Kings; until then Roshar's own).
  A world's founding events (a Shard settling) have no map, so the camera
  stays at the globe with its Shards. Between worlds, the camera rises to a sky view that frames both
  stars, then dives into the next globe.
- **Exploring.** At any time the reader can leave the event and look
  around:
  - drag to pan; a mouse wheel zooms about the cursor, a trackpad's
    two-finger scroll pans, and a pinch (or ctrl-wheel) zooms;
  - zoom out (wheel, pinch, the − button or Esc) from a world to the whole
    Cosmere;
  - **City maps.** A city with its own map (Kholinar, the Warcamps, the
    Elendel Basin, Elendel inside it) is marked on the map it's on, once
    the reader may see it and only while someone is on it (a person's
    whereabouts or the current event, counting the maps those sit on).
    The mark is a glass tag with a map glyph and
    the city's name, plus a dashed gold footprint.
    - Tags show only zoomed in from a world's whole map (`TAGS_H` in
      `drill.ts`; always on a city's own map).
    - The tag's hit area is at least 44 px. A wheel or pinch over it still
      zooms the map.
    - Clicking a tag flies there.
  - Zooming into a city's map is one continuous zoom, with no cut
    (`drill.ts`, `Cam.rebase`).
    - **The inset.** The city's map is drawn small on the map it's on,
      centred on its pin: `INSET_H` = 80 units tall. Its art fades in
      over the footprint as you near it.
    - **The swap.** At the parent map's closest zoom, the camera swaps to
      the city's own units without moving anything on screen.
      `onZoomInEdge` and `onZoomOutEdge` rebase rather than jump, and the
      wheel's glide carries on across the swap.
    - **Around the city.** On the city's map, the map it's on is drawn
      around it, scaled up and dimmed to 35% (and that map's own, for a
      city in a city).
    - **Zooming out.** The city's map zooms out past all of it in view
      (`Cam.fitH`), over the dimmed map around it, out to where that map
      takes over.
    - **Flags.** Each map's flags, stems, leader lines and pins give way
      over the swap (`drillFades`). A city's flags fade in only once all
      of the city's map is in view, also when flying there from the
      Notable characters panel.
    - **Opening.** The city opens at `Cam.fillH`, just filling the
      screen. The Handover component inside the Canvas does the rebase
      and the goal jump, so the camera and the maps change in the same
      frame.
    - **Whole maps.** A map of all of its parent's land, such as the
      Silver Kingdoms, has `parent.whole` in the atlas. It is never drawn
      inside its parent or zoomed into.
  - click a star's label, or a world in the drawer behind the planet
    button at top left, to fly there. Picking a world closes the drawer.

  On another world the event card hides; the name above the timeline
  always names the world on screen (or "The Cosmere" on the sky).
  "↩ Back to the event" returns to the current event (it fades in and out
  over 150 ms).
  Zooming out past a world's farthest view goes straight to the Cosmere
  (17th Shard has nowhere further to go, so this is new). On the sky, the
  furthest zoom-out is where the painting just fills the screen; the
  Cosmere view centres the painting's middle.

- **Phones** (and any stage under 40rem wide, by container query).
  - The bar keeps its height; the card shrinks, and the details panel
    covers the map.
  - The map credit narrows to the right edge, clear of the pin.
  - The worlds drawer wraps onto as many rows as it needs.
  - Pinch zooms and one finger pans (`touch-action: none` on the canvas).
- **No WebGL.** The stage shows a note, and the bar and card still work.
  With reduced motion, every flight is a cut (a city's tag opens its map
  at once), and the pin's pulse and the bar's smooth scrolling are off.
  Wheel and pinch zoom still pass through a city's map continuously.

## Engine

`src/components/explorer/` is a port of the engine prototype
(`files/engine-proto`, Three.js + React Three Fiber + drei +
postprocessing, at the same versions). It is lazy-loaded: `CosmereTimeline`
imports `ExplorerCanvas` with `React.lazy`, so Three.js is a separate chunk
that loads only with this view.

| File                  | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sky.ts`              | The space: field of view, planet radius, the map plane, the painted sky and its star pixels, view heights, crossfades between levels, and map ↔ world units.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `camera.ts`           | `Cam`: centre, height, level (sky / world) and anchor world. It holds the bounds: on the sky, it bisects for the furthest zoom where the art still covers the screen, and the painting's edges hold; on a world, the globe stays in view and the screen's middle stays on the map, so an edge can be panned to the centre. It plans and flies routes leg by leg; between worlds it goes up to a framing sky view, re-centres on the new star (invisible, because no world is drawn on the sky) and dives in. It handles the canvas's gestures: drag pans, a mouse wheel zooms about the cursor, trackpad scroll pans, and pinch (touch, ctrl-wheel or Safari gesture events) zooms. |
| `globe.ts`            | Roshar's globe ↔ map fit from the prototype (`rosharGlobe.json`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `worlds.ts`           | `explorerWorlds(timeline, canSee, current)`: the timeline's worlds plus the other inhabited planets the reader knows, each under its system's painted star, unrolling into the current event's city map when it has one. `explorerPins`: events with a point on their world's map.                                                                                                                                                                                                                                                                                                                                                                                                  |
| `flags.ts`            | Place flags: `placeGroups` (one group per place, from the people shown), `spotFor` (the free spot around a place, compact if need be, kept while it fits), `edgeSpot` (where an off-screen place's flag goes on the edge).                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `ExplorerCanvas.tsx`  | The R3F scene: far stars; the sky (painting shader with a hover glow, plus a live star per known system); the anchor world (Roshar's textured globe unrolling into its map, Yolen's drawn globe, or a shaded noise globe in the world's colour that fades into its map); bloom. Over the canvas, HTML star labels, pins, and +/− buttons are positioned every frame.                                                                                                                                                                                                                                                                                                                |
| `ShatteringBurst.tsx` | The Shattering effect (below): an HTML/SVG overlay, positioned by the canvas each frame.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `drill.ts`            | City maps drawn inside the map they're on: `INSET_H`/`INSET_K` (the footprint's size), `drillFades` (the city's art, the dimmed map around it, and each map's flags, by view height), `tagsFade` (cities' tags only zoomed in).                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `webgl.ts`            | `hasWebGL()` and `reducedMotion()`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

Gotchas from the prototype, kept:

- `<EffectComposer multisampling={0}>`, because ANGLE Metal renders black
  otherwise.
- Camera controls attach to `gl.domElement`, so the HTML buttons keep
  working.
- No drei `Text`, because it fetches fonts from a CDN. Labels are HTML.
- The HTML labels and pins are placed with the CSS `translate` property,
  not `transform`: the pins' diamond `rotate` would otherwise turn the
  whole offset and swing them across the map.
- `Rig` changes `near`/`far` every frame, so it must call
  `updateProjectionMatrix()` (without it nothing draws).

Maps:

- Roshar uses the colour map (`public/explorer/Roshar-colour.jpg`, the same
  frame as the guide's `Roshar.jpg`, so pins hold) and its globe texture.
- Before the Recreance Roshar is drawn as the Silver Kingdoms:
  `Silver-Kingdoms-flat.jpg` (the map's frame) and `Silver-Kingdoms-globe.jpg`.
  Their sea is Roshar's own: Roshar's land is healed away with GIMP's
  Resynthesizer, its mottling faded into an open ocean in the map's own dark
  water, and the Silver Kingdoms' land and title laid on top at the fitted
  affine (`fromRoshar`).
  One-off build, not in the repo.
- Scadrial before the Catacendre (year 10626) is the Final Empire:
  `Scadrial-FE-flat.jpg` (2048×1555, the Coppermind `Final_Empire_Map.jpg`
  frame, so pins hold) and `Scadrial-FE-globe.jpg` (laid on at
  `fromRoshar [2.2526,0,0,2.2526,-1859.34,-1024.59]`). The map's ornamental frame, wings,
  roundels and edge labels are painted out: the land is carried on under
  them to a new ragged coast, about 100 px in, with bays. Parchment and sea
  are patch-quilted from the map itself, and the coast gets the map's
  stippled shore and ripple rings. The sea fades to a flat (105,110,112) at
  the edges, so it meets the globe's ocean without a seam. After the
  Catacendre, Scadrial is drawn by The Lost Metal's world map (atlas
  `scadrial`, `Scadrial_map.png` 640×997, revealed from its prologue):
  `Scadrial-flat.jpg` (2× upscale, frame and title box gone) and
  `Scadrial-globe.jpg` (`fromRoshar [0.5374,0,0,0.5374,-358.13,-222.29]`).
  Land the frame cut is turned to sea along a ragged coast: a
  domain-warped distance to the frame against a noisy threshold, with bays
  and islets, kept off the lettering (`glyph_mask` finds the map's letters
  and keeps their hulls dry), so the coast recedes instead of ending in a
  straight cut.
  The Elendel Basin's map is a city on it, at `[372, 271]`, so zooming in
  there opens it. Before The Lost Metal the Basin's map is the world's own,
  with no globe: `cityOn` only counts a parent map the reader can see, and
  journeys hang the Basin off the star chart until then. One-off build
  (`scadrial.py`, modes `fe`, `world` and `check`), not in the repo.
- Both Scadrial globes share one canon scale, so the eras line up:
  - The Lost Metal's map is drawn on a Mercator grid every 15° (meridians
    134 px apart; parallels at y 95, 241, 377, 512, 657 and 828 for 30°N to
    45°S, spaced as Mercator predicts). Isaac Stewart puts the equator just
    by Elendel and the prime meridian through it
    (https://wob.coppermind.net/entry/15856), and called a reprojection of
    the map onto a globe "close" (https://wob.coppermind.net/entry/16086).
    So the map's own degrees give its size, whatever the planet's radius.
    Scadrial is Earth-sized ("1 cosmere standard", Coppermind Scadrial;
    https://wob.coppermind.net/entry/3073).
  - Roshar's frame is about 1005 Roshar px per radian near the globe's
    front. At the Final Empire's latitude (18.6°N) that gives
    511.9 / (cos 18.6° × 1005) = 0.5374 world px per Roshar px.
  - The Final Empire's map is registered onto the world map by ashmounts and
    lakes (Torinost, Morag, Kalling, Tyrian, the Black Lake; a similarity,
    scale 0.23858, residuals about 2 px). That matches Isaac's overlay of the
    Basin on the old empire, south and southwest of Luthadel
    (https://wob.coppermind.net/entry/13162). So the empire map gets
    0.5374 / 0.23858 = 2.2526 FE px per Roshar px, centred on the globe's
    front, and the world map follows the same registration, so features
    don't jump between eras.
  - That makes the empire about 51° by 39° of arc on the map, its land about
    4,000 km across. That's bigger than Brandon's early "smaller than the
    US" (https://wob.coppermind.net/entry/7877), which predates the scale
    the leatherbound map revisited (entry 13162).
- Past the map a textured globe is drawn by lies the uncharted (`UNCHARTED`
  in `ExplorerCanvas`), shared by the globe and the flat map so it stays
  put through the unroll:
  - One edge field, the distance (in map heights) to the map's frame. Its
    core, where a dashed gold line runs, wanders in lazy lobes from just
    past the frame to 0.06 beyond; the fog is frayed with noise, but only
    outwards from that line. So the fog never covers the map, its islands
    or the line, however the noise falls (shader hash noise differs by
    GPU). Each globe's `edge` in `worlds.ts` sets the band from the line
    to full fog (the Final Empire's pale sea fades over a longer one). Far
    from the map, where the projection folds, it is fog whatever the field
    says.
  - In the fog the sea dims and greys to slate, a faint gold grid replaces
    the blue one, and a soft haze (3D noise on the sphere) drifts slowly.
    With `prefers-reduced-motion` the haze holds still.
  - The flat map uses the same field: it greys and fades out past its
    frame, onto the identically fogged globe beneath.
  - Spoilers: the field only knows the frame of the map the reader can
    see, and the fog looks the same on every world, so it never hints at
    land. City maps (Kholinar, the Elendel Basin) keep their own soft
    `inner` fade; Yolen and the plain globes have no edge.
- Arelon and T'Telir come from the journey atlas (Coppermind images).
- Only the anchor world is mounted. A map that fails to load is dropped.
- A mesh switching between the fog `material` prop and a child material
  must remount (`key`): dropping the prop leaves r3f's default white
  material in place.

### Yolen's globe

No art of Yolen exists: no official map, globe or painting (the
Coppermind's Yolen page has none, and Yolen isn't in Isaac Stewart's
constellation map). So `YolenGlobe` in `ExplorerCanvas.tsx` is drawn in the
style of the other plain globes. Without any feature it is a neutral,
Earth-like world: seas, green and brown land, and clouds. Arcanum Unbounded
makes its gravity and size the cosmere standard, and nothing in it is
specific to Yolen.

Each feature the books describe waits for its book. `explorerWorlds` sets
`yolen: { fain, greatstar }` from `YOLEN_LOOK` in `worlds.ts`, matching
the planet's summary lines in `src/data/systems.ts`:

> Spoilers for The Sunlit Man, Wind and Truth and Isles of the Emberdark.

| Feature                                       | Source                                            | Shown once                                |
| --------------------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| Patches of bone-white fainlife among the land | The Sunlit Man ch. 10 (systems.ts: SLM, WaT)      | The Sunlit Man or Wind and Truth finished |
| The greatstar: a bright glow high in its sky  | Isles of the Emberdark ch. 30 (systems.ts: Isles) | Isles of the Emberdark finished           |

Left out:

- How much of Yolen is fain ("about half"): the Wind and Truth epilogue.
  The patches are drawn modestly whatever the reader has read.
- The dragons' skyways and flying city (Isles of the Emberdark): too little
  is said to draw them.
- Its strange astronomy and "weirdness" of place: Word of Brandon only.
- Shrouded and hidden (Secret History): true long after the Shattering, so
  not drawn on a world shown at it.
- Anything from Dragonsteel or other unpublished books.

The globe itself only ever shows once the Shattering is placed there
(Wind and Truth or Isles of the Emberdark finished), since Yolen isn't
explorable before an event the reader can see happens there.

### The Shattering effect

The 17th Shard Roshar map marks its "Shattering of Adonalsium" event with
a `specialEffect: 'shattering'`: while it's the current event, a
post-processing pass spreads black cracks across the view from the
centre, and the event's highlight is drawn larger (`ShatteringPass.js`;
cosmere.17thshard.com didn't load). We take the idea, not the code or the
crack texture:

- A timeline event can carry `effect: 'shattering'` (only the Shattering
  does). `revealTimeline` passes it through with the event, so it shows
  from Secret History 3-2, like the event.
- `CosmereTimeline` hands the canvas `effect: { kind, world?, key }`. The
  world is set only when the event is on a revealed world; before that,
  `revealTimeline` has it in the open Cosmere, so no world is sent.
- `ShatteringBurst` waits until the camera arrives, then plays: a flash, a
  shockwave ring, sixteen streaks of light (the sixteen Shards, Secret
  History 3-2) flying out in every direction. In open space, jagged cracks
  are drawn out across the view. On Yolen the globe itself cracks
  instead: fissures of light tear across its land from the point facing
  the camera (`YolenGlobe`'s shader, timed by the burst starting), then
  cool to faint glowing scars that turn with the planet while it's the
  current event. The
  streaks point nowhere in particular and all share pale gold tones, so
  they hint at no Shard's home.
- **Before the place is revealed** the burst comes from the middle of the
  clear part of the view, over the painted sky, with no label and no star.
- **Once Wind and Truth is finished** (or Isles of the Emberdark), the
  camera flies to Yolen and the burst comes from its globe.
- **Reduced motion**: nothing moves. The glow, faint rays and cracks (or
  Yolen's scars) are drawn still.
- It is HTML and SVG in the lazy canvas chunk, so jsdom tests can render
  it (`ShatteringBurst.test.tsx`), and screen readers skip it
  (`aria-hidden`); the card says what happened.

## Data model

`src/data/timeline.ts`:

```ts
interface TimelineEvent {
  id: string
  world: string // planet id, or COSMERE
  worldRevealedIn?: Reveal // before this, show it in "The Cosmere"
  year: number // the sheet's Cosmere column (years since the Shattering): order and spacing, and the shared date once the Shattering is known
  date: TimelineDate // in the world's own calendar
  map?: { mapId: string; at?: MapPoint; placeId?: string }
  title: TimelineText[] // later reveals replace earlier ones
  blurb: TimelineText[] // lines, each with its own reveal
  characters: string[]
  revealedIn: Reveal
  wob?: TimelineText // a Word of Brandon note, badged
  approximate?: TimelineText // an "order and timing are approximate" note, badged
  group?: { id: string; label: string } // bracketed on the bar
  more?: { href: string; revealedIn: Reveal }
  sources: string[]
}
interface TimelineDate {
  year: number
  parts?: string[]
  circa?: boolean
  calendar: CalendarId
  revealedIn?: Reveal
}
```

Calendars (`calendars`) each have a label, a note on what they count from,
and their own `revealedIn`:

| Calendar   | Label                | Counts from                          |
| ---------- | -------------------- | ------------------------------------ |
| rosharan   | Rosharan year        | a year a bit longer than Earth's     |
| fe         | FE                   | the Lord Ruler's Ascension           |
| selish     | Selish year          | the Reod                             |
| nalthian   | Nalthian count       | the Pahn Kahl rebellion              |
| taldain    | Taldain count        | the White Sand story                 |
| threnodite | Threnodite count     | Silence's hunt for Chesterton Divide |
| shattering | after the Shattering | the Shattering (the Cosmere column)  |

The zeros for Sel, Nalthis, Taldain and Threnody are the sheet's choices
(rows 32, 56, 17 and 58).

`formatYear` writes 17th Shard's format:

- the bare year with a true minus;
- month, week and day joined by dots;
- `ca. ` in front when the sheet marks the year ESTIMATED or Approximate,
  or when it is converted.

No "N years before X" wording anywhere.

On the bar, events are spaced by `barGap`: at least one marker step apart,
plus `log10(1 + years) / 2`, counted between **shown** events only, so a
gap never hints at a hidden one.

## Spoilers

Everything goes through `revealTimeline(canSee)`, built in the style of
`src/data/reveal.ts`:

- An event is dropped unless `revealedIn` is met. Its title, blurb lines,
  date, calendar label, notes, characters, place and link are each trimmed
  by their own reveal.
- A world shows under the name the reader knows: the planet's name, else
  its map's title (Roshar before WoK 46). A world unknown under either name
  hides its events.
- `worldRevealedIn` puts an event in "The Cosmere" until the book that says
  where it happened. The Shattering stays in the open sky until the reader
  finishes Wind and Truth (or Isles of the Emberdark).
- The explorer draws only `explorerWorlds`: the timeline's worlds and known
  inhabited planets. Yolen isn't in the painting, so its star (a
  placeholder) appears only once an event the reader can see happens there.
- Hidden means hidden: no greyed markers, no "?" worlds, and no gaps sized
  for hidden events. An `?event=` id the reader can't see opens the first
  event instead.

Tests:

- `src/data/timeline.test.ts` pins this at no books, the WoK prelude and
  prologue, WoK 46, Era 1 plus Secret History 3-2, Elantris 4, Drew's point
  (everything before Wind and Truth, plus WaT 17) and WaT finished.
- `src/components/explorer/worlds.test.ts` pins the explorer's worlds and
  pins at the same points.
- `src/components/timeline/CosmereTimeline.test.tsx` covers:
  - the bar, the date tab and the card;
  - keyboard and buttons;
  - the camera goals sent to the (mocked) canvas;
  - zooming out and exploring another world;
  - a hidden `?event=`;
  - the no-WebGL fallback;
  - full screen, and Esc leaving it without zooming out;
  - the Shattering effect sent to the canvas: out in open space at Drew's
    point, and at its world once Wind and Truth is finished.
- `worlds.test.ts` also pins which of Yolen's features show at which
  books, and `ShatteringBurst.test.tsx` the burst's sixteen streaks, its
  wait for the camera and its reduced-motion version.
- `camera.test.ts` covers:
  - re-anchoring keeps the sky still;
  - the sky's zoom-out bound keeps the art covering the screen (desktop and
    phone);
  - the Cosmere view is centred on screen;
  - flights between worlds go by way of the sky;
  - reduced motion cuts;
  - zooming out past a world fires the zoom-out to the Cosmere;
  - a map pans until its edge reaches the middle of the screen.

## Dating across worlds

Sources, in order of trust:

1. **The books**, for every `revealedIn`. Each fact is gated at the book or
   chapter that first tells it (ROADMAP "Dating a fact").
2. **Drew's sheet** (`files/cosmere-timeline-sheet.csv`, 129 rows; ROADMAP
   §14): the cross-world order (its Cosmere column) and each world's own
   year, with its footnotes as sources.
3. **The Coppermind chronology**, User:Fbstj/cosmere/chrono
   (`files/coppermind-fbstj-chrono.wiki`), to cross-check the sheet.
4. **Arcanum (Word of Brandon)**, for facts no book states. These are badged
   "Word of Brandon" on the card and never presented as from a book.
5. **17th Shard events.json** for Roshar's in-world dates and map points
   (Gavilar: `[1167, 10]`).

**Where an event goes on the map.** Use the exact point when a book names
the place (`map.at`). If only the country is known, give its `placeId`
with no point; the pin goes in the middle of that country's traced outline
on the map (`areaCentre` in `maps.ts`). Never guess a town. When the book
names the place later than the event, gate the point with
`map.revealedIn`.

The "Shards settle" run has no dates in the sheet beyond Honor and
Cultivation's (Cosmere 0, about Rosharan −8788). The others sit just after
the Shattering in the sheet's order, each in its world's own calendar,
converted from that row and marked "ca.". Every one carries the note "The
order and timing of the Shards' settling are approximate."

## The proof-of-concept events

The first events of the Cosmere, from the sheet's opening rows, hopping
between worlds. Year is the sheet's Cosmere column, used only for order.

| Year  | World             | Date                   | Event                                  | Shown from                             |
| ----- | ----------------- | ---------------------- | -------------------------------------- | -------------------------------------- |
| −1050 | Roshar            | ca. −9742 Rosharan     | Adonalsium creates Roshar (WoB badge)  | WoR 66 and SH 3-2                      |
| 0     | Cosmere → Yolen   | 0 after the Shattering | Adonalsium is killed → The Shattering  | SH 3-2 (on Yolen once WaT is finished) |
| 1     | Roshar            | ca. −8788 Rosharan     | Honor and Cultivation settle on Roshar | SH 3-2                                 |
| 2     | Scadrial          | ca. −9601 FE           | Ruin and Preservation make Scadrial    | HoA and SH 3-2                         |
| 3     | Sel               | ca. −9101 Selish       | Devotion and Dominion settle on Sel    | AU and SH 3-2                          |
| 4     | Nalthis           | ca. −10826 Nalthian    | Endowment settles on Nalthis           | WB and SH 3-2                          |
| 5     | Taldain           | ca. −8111 Taldain      | Autonomy settles on Taldain            | (AU or White Sand) and SH 3-2          |
| 96    | Roshar            | ca. −8700 Rosharan     | The first thinking spren (WoB badge)   | WoK and SH 3-2                         |
| 1000  | Sel               | ca. −8101 Selish       | Odium splinters Devotion and Dominion  | AU                                     |
| 2000  | Threnody          | ca. −8850 Threnodite   | Odium mortally wounds Ambition         | AU                                     |
| 2159  | Ashyn             | ca. −6825 Rosharan     | (a Wind and Truth event)               | WaT finished                           |
| 2961  | Roshar            | ca. −6096 Rosharan     | Humans arrive on Roshar                | OB 111, AU or SLM                      |
| 2983  | Roshar            | ca. −6076 Rosharan     | The First Desolation                   | WoK                                    |
| 6000  | Roshar            | ca. −3333 Rosharan     | The Heralds abandon the Oathpact       | WoK prelude (date from the prologue)   |
| 9101  | Sel (Arelon map)  | 0 Selish               | Elantris falls (the Reod)              | Elantris prologue                      |
| 10526 | Nalthis (T'Telir) | ca. −300 Nalthian      | The Manywar ends                       | WB 15                                  |
| 10958 | Roshar (Kholinar) | 1167.10 Rosharan       | Gavilar is assassinated                | WoK prologue                           |

Why these events:

- They are the sheet's opening rows, so the timeline starts at the
  beginning.
- The Shards settle one world after another, so the camera visibly jumps
  between planets.
- The last three are well-dated anchors on three worlds, each with a map
  and a pin.

Left out:

- **Frost and Xisis born; Hoid born.** Only Word of Brandon and unpublished
  Dragonsteel date them.
- **Ambition's home.** No book places it before the wounding.
- **Odium "wanders the Cosmere".** No book supports it as a beat.
- **Whimsy, Valor, Mercy, Invention.** No known home.
- **The Recreance.** Cut to keep the count near 15.

The sheet puts the Shattering on Yolen; the planet's own summary gives that
from Wind and Truth (and Isles of the Emberdark). The Yolen
planet is named from Arcanum Unbounded, but the timeline doesn't place the
Shattering there until the later reveal.

## Phases after the proof of concept

1. **Pipeline.** Generate the events file from the sheet plus a reviewed
   overrides file (like `~/cig-char-data`), with a spoiler snapshot per
   event, and cover the whole sheet.
2. **Bar at scale.**
   - Era bands, and clustering for dense runs (17th Shard staggers
     overlapping markers; ours are bracketed for now).
   - A "now" button that jumps to the reader's current chapter.
   - A filter by world.
3. **Event pages** ("More about this event"), linked from character,
   location and book pages (ROADMAP §14, §16).
4. **More worlds' art.** Globe textures for Scadrial, Sel, Nalthis and
   Taldain; their maps on the plane; and city maps one level deeper (the
   prototype's tree of maps, D14).
5. **Journeys on the explorer.** Character journeys drawn as trails on the
   same engine (`docs/state-of-my-cosmere.md`), replacing the SVG
   `StarChart`.

## Open questions

- Should the Yolen star stay a placeholder, or wait for an official
  placement?
- Should the sky label second worlds in a system (Ashyn, Braize) by
  default, or only on hover?
- When an official picture of Yolen appears, should its globe follow it?
- Should Word of Brandon events be optional (a "Show Word of Brandon"
  toggle) rather than badged?

## Credits

- The time bar, date tab, event card and map UX follow the 17th Shard's
  Roshar map (Palanaeum/roshar-map, MIT), and so does the idea of the
  Shattering effect (no code or art taken). Gavilar's date and point come
  from its events.json.
- The constellation map of the Cosmere is Isaac Stewart's, from Arcanum
  Unbounded, via the Coppermind.
- The colour map of Roshar is by Stoneward13, after Isaac Stewart. The
  globe reprojection follows the 17th Shard's "Globe of Roshar".
- The maps of Arelon and T'Telir come via the Coppermind.
- Event order and per-world years come from Drew's timeline sheet,
  cross-checked with the Coppermind chronology.

- **Book timeline data** (`src/data/bookTimeline.ts`): every published book's span on the AS scale, its world (planet id to fly to) and cover (`public/timeline/covers/`, credited). Years follow the timeline sheet; Stormlight dates are converted from Rosharan dates. Mistborn Era 2 sits just after Wind and Truth (Brandon: "not long after Stormlight 5"), not at the sheet's Hero of Ages + 341, which would run it alongside Stormlight. The **Events | Books** switch at the top left swaps the bar for the covers of the books the reader has read or started (no others, not even as gaps). `layoutBooks` lays them out as covers on a time rail: each cover is centred on its book's start, above a capped bar spanning the book on the rail in its world's colour (a diamond if under 0.15 years); main covers stand at least 66 px apart, so dense clusters open up; side stories (`SIDE`: Secret History, the Stormlight novellas, Hope of Elantris) ride a small lane above when the book they run beside is shown; gaps of 3+ years break the rail with `//` and, once the reader knows the calendar, "≈ N years". Picking one flies to its world, or to the whole Cosmere if the reader doesn't know that world yet, and shows its cover, title and world on the card.
