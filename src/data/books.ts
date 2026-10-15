// Published Cosmere works, from the Coppermind's Cosmere bibliography.
// Grouped by series; books within a series are in series order.

export type BookKind =
  'Novel' | 'Novella' | 'Short story' | 'Graphic novel' | 'Anthology'

export interface Book {
  id: string
  title: string
  year: number
  kind: BookKind
  /** Place in its series, e.g. "2.5" for Edgedancer. */
  number?: string
}

export interface BookSeries {
  id: string
  name: string
  books: Book[]
}

export const bookSeries: BookSeries[] = [
  {
    id: 'elantris',
    name: 'Elantris',
    books: [
      {
        id: 'elantris',
        title: 'Elantris',
        year: 2005,
        kind: 'Novel',
        number: '1',
      },
      {
        id: 'hope-of-elantris',
        title: 'The Hope of Elantris',
        year: 2006,
        kind: 'Short story',
        number: '1.5',
      },
    ],
  },
  {
    id: 'mistborn-era-1',
    name: 'Mistborn (Era 1)',
    books: [
      {
        id: 'eleventh-metal',
        title: 'The Eleventh Metal',
        year: 2011,
        kind: 'Short story',
        number: '0.5',
      },
      {
        id: 'final-empire',
        title: 'Mistborn: The Final Empire',
        year: 2006,
        kind: 'Novel',
        number: '1',
      },
      {
        id: 'well-of-ascension',
        title: 'The Well of Ascension',
        year: 2007,
        kind: 'Novel',
        number: '2',
      },
      {
        id: 'hero-of-ages',
        title: 'The Hero of Ages',
        year: 2008,
        kind: 'Novel',
        number: '3',
      },
      {
        id: 'secret-history',
        title: 'Mistborn: Secret History',
        year: 2016,
        kind: 'Novella',
        number: '3.5',
      },
    ],
  },
  {
    id: 'mistborn-era-2',
    name: 'Mistborn (Era 2)',
    books: [
      {
        id: 'alloy-of-law',
        title: 'The Alloy of Law',
        year: 2011,
        kind: 'Novel',
        number: '1',
      },
      {
        id: 'allomancer-jak',
        title: 'Allomancer Jak and the Pits of Eltania',
        year: 2014,
        kind: 'Short story',
        number: '1.5',
      },
      {
        id: 'shadows-of-self',
        title: 'Shadows of Self',
        year: 2015,
        kind: 'Novel',
        number: '2',
      },
      {
        id: 'bands-of-mourning',
        title: 'The Bands of Mourning',
        year: 2016,
        kind: 'Novel',
        number: '3',
      },
      {
        id: 'lost-metal',
        title: 'The Lost Metal',
        year: 2022,
        kind: 'Novel',
        number: '4',
      },
    ],
  },
  {
    id: 'stormlight',
    name: 'The Stormlight Archive',
    books: [
      {
        id: 'way-of-kings',
        title: 'The Way of Kings',
        year: 2010,
        kind: 'Novel',
        number: '1',
      },
      {
        id: 'words-of-radiance',
        title: 'Words of Radiance',
        year: 2014,
        kind: 'Novel',
        number: '2',
      },
      {
        id: 'edgedancer',
        title: 'Edgedancer',
        year: 2016,
        kind: 'Novella',
        number: '2.5',
      },
      {
        id: 'elsecaller',
        title: 'Elsecaller',
        year: 2025,
        kind: 'Short story',
        number: '2.6',
      },
      {
        id: 'king-lopen',
        title: 'King Lopen the First of Alethkar',
        year: 2025,
        kind: 'Short story',
        number: '2.7',
      },
      {
        id: 'oathbringer',
        title: 'Oathbringer',
        year: 2017,
        kind: 'Novel',
        number: '3',
      },
      {
        id: 'dawnshard',
        title: 'Dawnshard',
        year: 2020,
        kind: 'Novella',
        number: '3.5',
      },
      {
        id: 'rhythm-of-war',
        title: 'Rhythm of War',
        year: 2020,
        kind: 'Novel',
        number: '4',
      },
      {
        id: 'wind-and-truth',
        title: 'Wind and Truth',
        year: 2024,
        kind: 'Novel',
        number: '5',
      },
    ],
  },
  {
    id: 'white-sand',
    name: 'White Sand',
    books: [
      {
        id: 'white-sand-1',
        title: 'White Sand Volume 1',
        year: 2016,
        kind: 'Graphic novel',
        number: '1',
      },
      {
        id: 'white-sand-2',
        title: 'White Sand Volume 2',
        year: 2018,
        kind: 'Graphic novel',
        number: '2',
      },
      {
        id: 'white-sand-3',
        title: 'White Sand Volume 3',
        year: 2019,
        kind: 'Graphic novel',
        number: '3',
      },
      {
        id: 'white-sand-omnibus',
        title: 'White Sand Omnibus',
        year: 2022,
        kind: 'Graphic novel',
      },
    ],
  },
  {
    id: 'hoids-travails',
    name: 'Hoid’s Travails',
    books: [
      {
        id: 'tress',
        title: 'Tress of the Emerald Sea',
        year: 2023,
        kind: 'Novel',
      },
      {
        id: 'yumi',
        title: 'Yumi and the Nightmare Painter',
        year: 2023,
        kind: 'Novel',
      },
      {
        id: 'fires-of-december',
        title: 'The Fires of December',
        year: 2026,
        kind: 'Novel',
      },
    ],
  },
  {
    id: 'standalones',
    name: 'Standalones',
    books: [
      { id: 'warbreaker', title: 'Warbreaker', year: 2009, kind: 'Novel' },
      {
        id: 'emperors-soul',
        title: 'The Emperor’s Soul',
        year: 2012,
        kind: 'Novella',
      },
      {
        id: 'shadows-for-silence',
        title: 'Shadows for Silence in the Forests of Hell',
        year: 2013,
        kind: 'Novella',
      },
      {
        id: 'sixth-of-the-dusk',
        title: 'Sixth of the Dusk',
        year: 2014,
        kind: 'Novella',
      },
      {
        id: 'sunlit-man',
        title: 'The Sunlit Man',
        year: 2023,
        kind: 'Novel',
      },
      {
        id: 'isles-of-the-emberdark',
        title: 'Isles of the Emberdark',
        year: 2025,
        kind: 'Novel',
      },
    ],
  },
  {
    id: 'collections',
    name: 'Collections',
    books: [
      {
        id: 'arcanum-unbounded',
        title: 'Arcanum Unbounded',
        year: 2016,
        kind: 'Anthology',
      },
    ],
  },
]

export const books: Book[] = bookSeries.flatMap((series) => series.books)

const seriesByBook = new Map(
  bookSeries.flatMap((series) => series.books.map((b) => [b.id, series])),
)

export const findBook = (bookId?: string) =>
  bookId ? books.find((b) => b.id === bookId) : undefined

export const seriesOf = (bookId: string) => seriesByBook.get(bookId)

/** "Book 2.5 · Novella · 2016", or without the number for standalones. */
export const bookMeta = (book: Book) =>
  [book.number && `Book ${book.number}`, book.kind, book.year]
    .filter(Boolean)
    .join(' · ')
