// Where each published Cosmere book falls in time, for the timeline's book
// view. Years are on the same After-the-Shattering scale as `timeline.ts`
// (Drew's timeline sheet), checked against the Coppermind's chronological
// order (Cosmere#Chronological_Order). Stormlight dates come from the books'
// Rosharan dates, using the sheet's anchors: 1167 = 10958 AS, 1.1 AS per
// Rosharan year. Only the main narrative counts, not prologues, flashbacks or
// frame stories.
//
// A book's title, world and cover are publisher-level facts, so every
// published book is listed whatever the reader has read. Don't add anything
// learned inside a book (other worlds it visits, epilogues) without a
// `revealedIn`.

export interface BookSpan {
  /** Book id from `books.ts`. */
  id: string
  /** Planet id from `systems.ts`; the timeline flies here. */
  world: string
  start: number
  end: number
  /** The sheet marks the date as an estimate, or Brandon hasn't fixed it. */
  circa?: true
  /** Path under `public/`. */
  cover: string
  coverArtist: string
  /** Coppermind file page the cover came from. */
  coverSource: string
}

const r = (y: number) => Math.round((10958 + (y - 1167) * 1.1) * 100) / 100
// Mistborn Era 2 is "not long after Stormlight 5" (Arcanum 15278, 2021;
// the Coppermind's chronological order agrees), not alongside Stormlight as
// Hero of Ages + 341 years on the sheet would put it. Brandon hasn't tied
// the two calendars together, so shift the whole era to just after Wind and
// Truth, keeping its own spacing.
const e2 = (y: number) => Math.round((y + 1.1) * 100) / 100

// prettier-ignore
const rows: [string, string, number, number, boolean, string, string][] = [
  ['white-sand-1', 'taldain', 8111, 8111.01, true, 'Julius Gopez', 'White_Sand_v1_Cover_Art.jpg'],
  ['white-sand-2', 'taldain', 8111.01, 8111.03, true, 'Julius Gopez', 'White_Sand_v2_Cover_Art.jpg'],
  ['white-sand-3', 'taldain', 8111.03, 8111.04, true, 'Fritz Casas', 'White_Sand_v3_Cover_Art.jpg'],
  ['elantris', 'sel', 9111, 9111.2, true, 'Stephan Martinière', 'Elantris_thumb.jpg'],
  ['hope-of-elantris', 'sel', 9111.1, 9111.1, true, 'Stephan Martinière', 'Hope_of_Elantris_website_cover.jpg'],
  ['emperors-soul', 'sel', 9301, 9301.3, true, 'Alexander Nanitchkov', 'The_Emperors_Soul.jpg'],
  ['eleventh-metal', 'scadrial', 10620, 10620, false, 'Jon Foster', 'Eleventh_Metal_website_cover.jpg'],
  ['final-empire', 'scadrial', 10622, 10623, false, 'Jon Foster', 'TFE_US_1st_Cover.jpeg'],
  ['secret-history', 'scadrial', 10623, 10626, false, 'Miranda Meeks', 'Secret_History_Cover_Art.jpg'],
  ['well-of-ascension', 'scadrial', 10624, 10625, false, 'Jon Foster', 'WOA_US_1st_cover.jpg'],
  ['hero-of-ages', 'scadrial', 10626, 10626.2, false, 'Jon Foster', 'HOA_US_1st_cover.jpg'],
  ['warbreaker', 'nalthis', 10826, 10826.2, true, 'Dan dos Santos', 'Warbreaker_Cover.jpeg'],
  ['shadows-for-silence', 'threnody', 10850, 10850, true, 'Miranda Meeks', 'Shadows_for_Silence_Cover_Art.jpg'],
  ['way-of-kings', 'roshar', r(1173), r(1173.78), false, 'Michael Whelan', 'TheWayOfKings.png'],
  ['words-of-radiance', 'roshar', r(1173.8), r(1174.01), false, 'Michael Whelan', 'Words_of_Radiance.jpg'],
  ['elsecaller', 'roshar', r(1173.83), r(1174), false, 'Erion Makuo', 'Cover-Elsecaller.png'],
  ['edgedancer', 'roshar', r(1173.9), r(1174), false, 'Isaac Stewart & Ben McSweeney', 'Edgedancer_Cover.jpg'],
  ['king-lopen', 'roshar', r(1174), r(1174.01), false, 'Marie Seeberger', 'Cover-King-Lopen.png'],
  ['oathbringer', 'roshar', r(1174.01), r(1174.26), false, 'Michael Whelan', 'Oathbringer_US_Hardcover.jpg'],
  ['dawnshard', 'roshar', r(1174.7), r(1174.9), false, 'Ben McSweeney & Isaac Stewart', 'Dawnshard_cover.jpg'],
  ['allomancer-jak', 'scadrial', e2(10966), e2(10966), true, 'Ben McSweeney', 'AU_Allomancer_Jak.jpeg'],
  ['rhythm-of-war', 'roshar', r(1175), r(1175.2), false, 'Michael Whelan', 'RoW_US_cover.jpg'],
  ['wind-and-truth', 'roshar', r(1175.21), r(1175.24), false, 'Michael Whelan', 'WaT_US_Cover.jpg'],
  ['alloy-of-law', 'scadrial', e2(10967), e2(10967), true, 'Chris McGrath', 'The_Alloy_of_Law_Cover.jpg'],
  ['shadows-of-self', 'scadrial', e2(10968), e2(10968), true, 'Chris McGrath', 'Shadows_of_Self_US_Hardcover.jpg'],
  ['bands-of-mourning', 'scadrial', e2(10968.1), e2(10968.1), true, 'Chris McGrath', 'Bands_of_Mourning_US_Hardcover.jpg'],
  ['lost-metal', 'scadrial', e2(10974), e2(10974), true, 'Chris McGrath', 'TLM_US_Cover.jpg'],
  ['fires-of-december', 'miral', 11000, 11000.2, true, 'Dragonsteel Entertainment', 'Fires_of_December_Prerelease_Cover.png'],
  ['tress', 'lumar', 15879, 15879.3, true, 'Howard Lyon', 'Tress_US_Cover.jpg'],
  ['sunlit-man', 'canticle', 15884, 15884, true, 'Ernanda Souza', 'The_Sunlit_Man_US_Cover.jpg'],
  ['yumi', 'komashi', 15894, 15894.2, true, 'Aliya Chen', 'Yumi_US_Cover.jpg'],
  ['sixth-of-the-dusk', 'first-of-the-sun', 15919, 15919, true, 'Jorge Jacinto', 'Sixth_of_the_Dusk.jpg'],
  ['isles-of-the-emberdark', 'first-of-the-sun', 15924, 15924.1, true, 'Rebecca Sorge Jensen', 'IotE_US_Cover.webp'],
]

/** Every published book with a place in time, earliest first. */
export const bookTimeline: BookSpan[] = rows
  .map(([id, world, start, end, circa, coverArtist, file]) => ({
    id,
    world,
    start,
    end,
    ...(circa ? { circa: true as const } : {}),
    cover: `/timeline/covers/${id}.webp`,
    coverArtist,
    coverSource: `https://coppermind.net/wiki/File:${file}`,
  }))
  .sort((a, b) => a.start - b.start)

/**
 * Stories told alongside a main book: when the book they run beside is on
 * the bar too, they ride a lane above it instead of taking a cover slot.
 */
const SIDE = new Set([
  'hope-of-elantris',
  'secret-history',
  'elsecaller',
  'edgedancer',
  'king-lopen',
])

/**
 * A book placed on the bar: `x` and `w` in pixels. `side` books run above
 * the main row; `point` books are too short to draw as a span.
 */
export interface BookRow {
  book: BookSpan
  x: number
  w: number
  side: boolean
  point: boolean
}

/**
 * The books on one scale: time runs at `pxPerYear`, but main covers stand
 * at least `step` apart and side covers `sideStep`, and gaps of `minGap`
 * years or more shrink to a `riftPx` break clear of the covers, each `cover` wide and
 * centred on its start (`breaks`,
 * with the years skipped), so a dense cluster opens up and the eras fit on one bar.
 */
export function layoutBooks(
  books: readonly BookSpan[],
  {
    pxPerYear = 110,
    step = 66,
    sideStep = 30,
    riftPx = 80,
    cover = 48,
    sideCover = 22,
    minGap = 3,
    minSpan = 0.15,
  } = {},
) {
  const sorted = [...books].sort((a, b) => a.start - b.start)
  const side = (b: BookSpan) =>
    SIDE.has(b.id) &&
    sorted.some((m) => !SIDE.has(m.id) && b.start < m.end && m.start < b.end)
  const events = sorted
    .flatMap((book, i) => [
      { t: book.start, i, start: true, side: side(book) },
      { t: book.end, i, start: false, side: false },
    ])
    .sort((a, b) => a.t - b.t || +a.start - +b.start)
  const breaks: { from: number; to: number; x: number; years: number }[] = []
  const at = sorted.map(() => [0, 0])
  const pts: [number, number][] = []
  let px = 0
  let prev = events[0]?.t ?? 0
  let lastMain = -Infinity
  let lastSide = -Infinity
  for (const e of events) {
    const gap = e.t - prev
    if (gap >= minGap) {
      // The break sits in the clear space between the covers, each centred
      // on its start.
      px = Math.max(px, lastMain + cover / 2, lastSide + sideCover / 2)
      breaks.push({ from: prev, to: e.t, x: px + riftPx / 2, years: gap })
      px += riftPx + cover / 2
    } else px += gap * pxPerYear
    if (e.start && e.side) px = lastSide = Math.max(px, lastSide + sideStep)
    else if (e.start) px = lastMain = Math.max(px, lastMain + step)
    at[e.i][e.start ? 0 : 1] = px
    pts.push([e.t, px])
    prev = e.t
  }
  /** Where a moment falls on the bar. */
  const x = (t: number) => {
    const i = pts.findIndex(([pt]) => pt >= t)
    if (i <= 0) return pts[Math.max(i, 0)]?.[1] ?? 0
    const [t0, x0] = pts[i - 1]
    const [t1, x1] = pts[i]
    return x0 + ((t - t0) / (t1 - t0)) * (x1 - x0)
  }
  const rows: BookRow[] = sorted.map((book, i) => ({
    book,
    x: at[i][0],
    w: Math.max(0, at[i][1] - at[i][0]),
    side: events.some((e) => e.i === i && e.side),
    point: book.end - book.start < minSpan,
  }))
  return { rows, breaks, width: px + step, x }
}
