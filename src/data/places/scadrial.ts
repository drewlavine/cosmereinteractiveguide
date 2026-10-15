import type { Location } from '../types'
import { p, story, wiki } from './helpers'

const EM = 'eleventh-metal'
const TFE = 'final-empire'
const WOA = 'well-of-ascension'
const HOA = 'hero-of-ages'
const SH = 'secret-history'
const AOL = 'alloy-of-law'
const SOS = 'shadows-of-self'
const BOM = 'bands-of-mourning'
const TLM = 'lost-metal'
const AU = 'arcanum-unbounded'

const FE_ONLY = [TFE]
// The Basin and the remade world reveal how Era 1 ends, so tag them with Era 2 only.
const ERA2 = [AOL, SOS, BOM, TLM]

export const scadrialPlaces: Location[] = [
  // Final Empire map (The Final Empire)
  {
    id: 'final-empire',
    name: 'Final Empire',
    planetId: 'scadrial',
    kind: 'nation',
    revealedIn: [TFE, WOA, HOA, SH, AU],
    summary: [
      p(
        'The empire of the Lord Ruler, who has ruled it for a thousand years. Ash falls from the sky, mists cover the land each night, and the skaa toil as slaves under the nobility.',
        ...FE_ONLY,
      ),
      p(
        'It is divided into dominances, with the imperial capital, Luthadel, at its centre.',
        ...FE_ONLY,
      ),
      p(
        'After the Lord Ruler’s fall the empire fractures, and would-be kings seize its dominances.',
        WOA,
      ),
    ],
    settingOf: [story(TFE), story(WOA), story(HOA)],
    coppermindUrl: wiki('Final_Empire'),
  },
  {
    id: 'central-dominance',
    name: 'Central Dominance',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'final-empire',
    revealedIn: [TFE, WOA, HOA],
    summary: [
      p(
        'The heart of the Final Empire, surrounding the capital, Luthadel. Lake Tyrian forms its edge with the Western and Southern Dominances.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Dominance#Central_Dominance'),
  },
  {
    id: 'northern-dominance',
    name: 'Northern Dominance',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'final-empire',
    revealedIn: [TFE, WOA, HOA],
    summary: [
      p(
        'A dominance in the north-east of the Final Empire, between the Central Dominance and the Terris highlands.',
        ...FE_ONLY,
      ),
      p(
        'Its capital is Urteau, from which Straff Venture rules and marches south on Luthadel.',
        WOA,
      ),
    ],
    coppermindUrl: wiki('Dominance#Northern_Dominance'),
  },
  {
    id: 'southern-dominance',
    name: 'Southern Dominance',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'final-empire',
    revealedIn: [TFE, WOA, HOA],
    summary: [
      p(
        'A broad dominance south and south-west of the Central Dominance, watered by the River Channerel.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Dominance#Southern_Dominance'),
  },
  {
    id: 'eastern-dominance',
    name: 'Eastern Dominance',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'final-empire',
    revealedIn: [TFE, WOA, HOA],
    summary: [
      p(
        'A large dominance in the south-east of the Final Empire, reaching from the Black Lake to the Conventical of Seran.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Dominance#Eastern_Dominance'),
  },
  {
    id: 'western-dominance',
    name: 'Western Dominance',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'final-empire',
    revealedIn: [TFE, WOA, HOA],
    summary: [
      p(
        'A large dominance in the north-west of the Final Empire, with the cities of Tremredare and Fadrex in its south.',
        ...FE_ONLY,
      ),
      p(
        'Ashweather Cett claims it as king and leads its army against Luthadel.',
        WOA,
      ),
    ],
    coppermindUrl: wiki('Dominance#Western_Dominance'),
  },
  {
    id: 'farmost-dominance',
    name: 'Farmost Dominance',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'final-empire',
    revealedIn: [TFE, WOA, HOA],
    summary: [
      p(
        'The westernmost dominance of the Final Empire, on its far frontier.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Dominance#Farmost_Dominance'),
  },
  {
    id: 'terris-dominance',
    name: 'Terris Dominance',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'final-empire',
    revealedIn: [TFE, WOA, HOA],
    summary: [
      p(
        'The cold northern homeland of the Terris people. The Lord Ruler’s breeding programs turned many Terrismen into docile stewards for the nobility.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Dominance#Terris_Dominance'),
  },
  {
    id: 'crescent-dominance',
    name: 'Crescent Dominance',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'final-empire',
    revealedIn: [TFE],
    summary: [
      p(
        'A narrow dominance curving along the eastern edge of the Final Empire.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Dominance'),
  },
  // Central Dominance
  {
    id: 'luthadel',
    name: 'Luthadel',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'central-dominance',
    revealedIn: [TFE, WOA, HOA, SH, AU],
    summary: [
      p(
        'The capital of the Final Empire. The Lord Ruler’s palace, Kredik Shaw, rises over the keeps of the great houses and the crowded skaa slums.',
        ...FE_ONLY,
      ),
      p(
        'Kelsier’s crew plots to bring down the empire from within its walls.',
        ...FE_ONLY,
      ),
      p(
        'Three armies besiege the city while Elend Venture tries to hold it as king.',
        WOA,
      ),
    ],
    settingOf: [story(TFE), story(WOA), story(HOA), story(SH, AU)],
    coppermindUrl: wiki('Luthadel'),
  },
  {
    id: 'fellise',
    name: 'Fellise',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'central-dominance',
    revealedIn: [TFE],
    summary: [
      p(
        'A small, prosperous town an hour by carriage from Luthadel, cleaner and less strict than the capital. A line of bronze bars buried in the road lets Allomancers leap quickly between the two.',
        ...FE_ONLY,
      ),
      p(
        'Kelsier sets up the false House Renoux in a mansion here, where Vin lives as Valette Renoux and trains in Allomancy.',
        ...FE_ONLY,
      ),
    ],
    settingOf: [story(TFE)],
    coppermindUrl: wiki('Fellise'),
  },
  {
    id: 'suisna',
    name: 'Suisna',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'central-dominance',
    revealedIn: [TFE, WOA],
    summary: [
      p(
        'A small city a day from Luthadel, in the Central Dominance.',
        ...FE_ONLY,
      ),
      p(
        'A koloss army pillages it during the siege of Luthadel, and its people flee towards the capital.',
        WOA,
      ),
    ],
    mentionedIn: [story(WOA)],
    coppermindUrl: wiki('Suisna'),
  },
  {
    id: 'pits-of-hathsin',
    name: 'Pits of Hathsin',
    altName: 'Hathsin',
    planetId: 'scadrial',
    kind: 'landmark',
    parentId: 'central-dominance',
    revealedIn: [TFE, EM, WOA, HOA, SH, AU, TLM],
    summary: [
      p(
        'Caves and crevasses north-west of Luthadel where prisoners are worked to death mining atium, the Lord Ruler’s most closely guarded secret.',
        ...FE_ONLY,
      ),
      p(
        'Kelsier is the only prisoner known to have survived them, earning the name the Survivor of Hathsin.',
        ...FE_ONLY,
      ),
      p(
        'Hathsin still names the hills north of the Elendel Basin on later maps.',
        TLM,
      ),
    ],
    mentionedIn: [story(TFE), story(EM, AU)],
    coppermindUrl: wiki('Pits_of_Hathsin'),
  },
  {
    id: 'tresting',
    name: 'Tresting Plantation',
    planetId: 'scadrial',
    kind: 'landmark',
    parentId: 'central-dominance',
    revealedIn: [TFE],
    summary: [
      p(
        'Lord Tresting’s plantation north-west of Luthadel, worked by several hundred skaa.',
        ...FE_ONLY,
      ),
      p(
        'The story opens here, when Kelsier visits its skaa and then kills the lord’s men and burns his manor.',
        ...FE_ONLY,
      ),
    ],
    settingOf: [story(TFE)],
    coppermindUrl: wiki('Tresting_plantation'),
  },
  {
    id: 'arguois-caverns',
    name: 'Arguois Caverns',
    planetId: 'scadrial',
    kind: 'landmark',
    parentId: 'central-dominance',
    revealedIn: [TFE],
    summary: [
      p(
        'A vast, easily defended cave system north of Luthadel, between the city and the Pits of Hathsin, entered through rifts in the ground.',
        ...FE_ONLY,
      ),
      p(
        'The skaa rebellion uses the caverns to hide and train its army.',
        ...FE_ONLY,
      ),
    ],
    settingOf: [story(TFE)],
    coppermindUrl: wiki('Arguois_caverns'),
  },
  {
    id: 'haverfrex',
    name: 'Haverfrex',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'central-dominance',
    revealedIn: [TFE, WOA, HOA],
    summary: [
      p('A town in the Central Dominance, north-east of Luthadel.', ...FE_ONLY),
      p(
        'It is home to one of the Lord Ruler’s main canneries. Ashweather Cett holds it during the siege of Luthadel, supplying his army along the Luth-Davn Canal.',
        WOA,
      ),
    ],
    mentionedIn: [story(WOA)],
    coppermindUrl: wiki('Haverfrex'),
  },
  {
    id: 'holstep',
    name: 'Holstep',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'central-dominance',
    revealedIn: [TFE],
    summary: [
      p(
        'A town north of Luthadel. The skaa rebel army attacks its garrison, only to be crushed by soldiers from nearby Valtroux.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Holstep'),
  },
  {
    id: 'valtroux',
    name: 'Valtroux',
    altName: 'Valtroux City',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'central-dominance',
    revealedIn: [TFE],
    summary: [
      p(
        'A city north of Luthadel whose garrison destroys the skaa rebel army after it strikes at Holstep.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Valtroux'),
  },
  // Terris
  {
    id: 'tathingdwen',
    name: 'Tathingdwen',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'terris-dominance',
    revealedIn: [TFE, WOA],
    summary: [
      p(
        'A city in the far north of the Final Empire, in the Terris Dominance.',
        ...FE_ONLY,
      ),
      p(
        'It is the capital of Terris, where men and women are kept apart: women chosen for the Steel Ministry’s breeding programs are confined, while men are trained in steward academies.',
        WOA,
      ),
    ],
    coppermindUrl: wiki('Tathingdwen'),
  },
  // Western Dominance
  {
    id: 'fadrex-city',
    name: 'Fadrex City',
    altName: 'Fadrex',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'western-dominance',
    revealedIn: [TFE, WOA, HOA],
    summary: [
      p(
        'A city in the south of the Western Dominance, just south of Chardees.',
        ...FE_ONLY,
      ),
      p('Ashweather Cett makes it his capital.', WOA),
      p(
        'Its rock shelves make natural walls, and it hides one of the Lord Ruler’s storage caches. Aradan Yomen holds it against Elend’s siege.',
        HOA,
      ),
    ],
    settingOf: [story(HOA)],
    mentionedIn: [story(WOA)],
    coppermindUrl: wiki('Fadrex_City'),
  },
  {
    id: 'tremredare',
    name: 'Tremredare',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'western-dominance',
    revealedIn: [TFE, WOA, HOA],
    summary: [
      p(
        'A large city in the south-west of the Western Dominance, west of Morag and near the foot of a mountain range. Waterways link it to Lake Tyrian.',
        ...FE_ONLY,
      ),
      p(
        'It was the capital of the Western Dominance until Ashweather Cett moved his seat to smaller, more defensible Fadrex.',
        HOA,
      ),
    ],
    coppermindUrl: wiki('Tremredare'),
  },
  {
    id: 'chakath',
    name: 'Chakath',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'western-dominance',
    revealedIn: [TFE],
    summary: [
      p('A city in the Western Dominance known for its wool.', ...FE_ONLY),
      p(
        'In her disguise as Valette Renoux, Vin claims her parents live here.',
        ...FE_ONLY,
      ),
    ],
    mentionedIn: [story(TFE)],
    coppermindUrl: wiki('Chakath'),
  },
  {
    id: 'mantiz',
    name: 'Mantiz',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'western-dominance',
    revealedIn: [TFE],
    summary: [p('A city in the south of the Western Dominance.', ...FE_ONLY)],
    coppermindUrl: wiki('Mantiz'),
  },
  {
    id: 'chardees',
    name: 'Chardees',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'western-dominance',
    revealedIn: [TFE, HOA],
    summary: [
      p(
        'A city just north of Fadrex City, in the south of the Western Dominance, on a waterway that flows into Lake Tyrian.',
        ...FE_ONLY,
      ),
      p(
        'Vin first mistakes the site of the last storage cache for Chardees before Elend points to Fadrex.',
        HOA,
      ),
    ],
    mentionedIn: [story(HOA)],
    coppermindUrl: wiki('Chardees'),
  },
  // Northern Dominance
  {
    id: 'urteau',
    name: 'Urteau',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'northern-dominance',
    revealedIn: [TFE, WOA, HOA],
    summary: [
      p('A city in the Northern Dominance.', ...FE_ONLY),
      p(
        'It is the capital of the Northern Dominance and the seat of House Venture.',
        WOA,
      ),
      p(
        'Spook, Breeze and Sazed travel here to find one of the Lord Ruler’s storage caches, in a city now run by the rebel Citizen.',
        HOA,
      ),
    ],
    settingOf: [story(HOA)],
    mentionedIn: [story(WOA)],
    coppermindUrl: wiki('Urteau'),
  },
  // Southern Dominance
  {
    id: 'austrex',
    name: 'Austrex',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'southern-dominance',
    revealedIn: [TFE, HOA],
    summary: [
      p(
        'A city near the northern edge of the Southern Dominance, where a canal from the Western Dominance meets the River Channerel. Lekal City lies downriver.',
        ...FE_ONLY,
      ),
      p('It is the capital of the Southern Dominance.', HOA),
    ],
    coppermindUrl: wiki('Austrex'),
  },
  {
    id: 'longsfollow',
    name: 'Longsfollow',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'southern-dominance',
    revealedIn: [TFE],
    summary: [
      p(
        'A village on a canal in the north of the Southern Dominance, south-west of Luthadel.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Longsfollow'),
  },
  {
    id: 'lekal-city',
    name: 'Lekal City',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'southern-dominance',
    revealedIn: [TFE],
    summary: [
      p(
        'A city in the Southern Dominance on the River Channerel, downriver from Austrex.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Lekal_City'),
  },
  {
    id: 'vetitan',
    name: 'Vetitan',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'southern-dominance',
    revealedIn: [TFE, HOA],
    summary: [
      p('A small town in the Southern Dominance.', ...FE_ONLY),
      p(
        'Koloss threaten the town, which hides one of the Lord Ruler’s storage caverns.',
        HOA,
      ),
    ],
    settingOf: [story(HOA)],
    coppermindUrl: wiki('Vetitan'),
  },
  {
    id: 'garthwood',
    name: 'Garthwood',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'southern-dominance',
    revealedIn: [TFE, HOA],
    summary: [
      p('A city in the Southern Dominance, south-east of Vetitan.', ...FE_ONLY),
      p(
        'Koloss attack the city, and fewer than a hundred survivors reach Vetitan.',
        HOA,
      ),
    ],
    mentionedIn: [story(HOA)],
    coppermindUrl: wiki('Garthwood'),
  },
  // Eastern Dominance
  {
    id: 'erlac',
    name: 'Erlac',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'eastern-dominance',
    revealedIn: [TFE],
    summary: [
      p(
        'A city in the Eastern Dominance, south-east of the Black Lake and the Ashmount Faleast.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Erlac'),
  },
  {
    id: 'urbene',
    name: 'Urbene',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'eastern-dominance',
    revealedIn: [TFE, WOA],
    summary: [
      p(
        'A small herding village in the Eastern Dominance, about halfway between Erlac and the Conventical of Seran.',
        ...FE_ONLY,
      ),
      p(
        'Sazed passes through on his way to Luthadel and finds its skaa starving, too frightened of the daytime mists to leave their hovels.',
        WOA,
      ),
    ],
    mentionedIn: [story(WOA)],
    coppermindUrl: wiki('Urbene'),
  },
  {
    id: 'conventical-of-seran',
    name: 'Conventical of Seran',
    planetId: 'scadrial',
    kind: 'landmark',
    parentId: 'eastern-dominance',
    revealedIn: [TFE, WOA, HOA],
    summary: [
      p(
        'A remote Steel Ministry fortress in the far south of the Eastern Dominance.',
        ...FE_ONLY,
      ),
      p('An ancient inscription by Kwaan is kept there.', WOA),
      p('It is where new Inquisitors are made.', HOA),
    ],
    coppermindUrl: wiki('Conventical_of_Seran'),
  },
  // Ashmounts
  {
    id: 'tyrian',
    name: 'Tyrian',
    planetId: 'scadrial',
    kind: 'landmark',
    revealedIn: [TFE],
    summary: [
      p(
        'One of the Ashmounts, the volcanoes whose ash falls across the Final Empire. It lies west of Luthadel, ringed by Lake Tyrian.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Ashmounts'),
  },
  {
    id: 'torinost',
    name: 'Torinost',
    planetId: 'scadrial',
    kind: 'landmark',
    revealedIn: [TFE, TLM],
    summary: [
      p(
        'One of the Ashmounts, the volcanoes whose ash falls across the Final Empire. It lies in the north of the empire.',
        ...FE_ONLY,
      ),
      p(
        'Later maps still mark Torinost as a peak north of the Elendel Basin.',
        TLM,
      ),
    ],
    coppermindUrl: wiki('Ashmounts'),
  },
  {
    id: 'kalling',
    name: 'Kalling',
    planetId: 'scadrial',
    kind: 'landmark',
    revealedIn: [TFE, TLM],
    summary: [
      p(
        'One of the Ashmounts, the volcanoes whose ash falls across the Final Empire. It lies in the north of the empire.',
        ...FE_ONLY,
      ),
      p(
        'Later maps still mark Kalling as a peak north-east of the Elendel Basin.',
        TLM,
      ),
    ],
    coppermindUrl: wiki('Ashmounts'),
  },
  {
    id: 'morag',
    name: 'Morag',
    planetId: 'scadrial',
    kind: 'landmark',
    revealedIn: [TFE, TLM],
    summary: [
      p(
        'One of the Ashmounts, the volcanoes whose ash falls across the Final Empire. It lies in the north-west of the empire.',
        ...FE_ONLY,
      ),
      p(
        'Later maps still mark Morag as a peak north-west of the Elendel Basin.',
        TLM,
      ),
    ],
    coppermindUrl: wiki('Ashmounts'),
  },
  {
    id: 'zerinah',
    name: 'Zerinah',
    planetId: 'scadrial',
    kind: 'landmark',
    revealedIn: [TFE, TLM],
    summary: [
      p(
        'One of the Ashmounts, the volcanoes whose ash falls across the Final Empire. It lies in the south-west of the empire.',
        ...FE_ONLY,
      ),
      p(
        'On later maps, Zerinah names the land west of the Elendel Basin, along the Sea of Yomend.',
        TLM,
      ),
    ],
    coppermindUrl: wiki('Ashmounts'),
  },
  {
    id: 'faleast',
    name: 'Faleast',
    planetId: 'scadrial',
    kind: 'landmark',
    revealedIn: [TFE, TLM],
    summary: [
      p(
        'One of the Ashmounts, the volcanoes whose ash falls across the Final Empire. It lies in the south-east of the empire.',
        ...FE_ONLY,
      ),
      p(
        'On later maps, Faleast names the highlands just east of the Elendel Basin.',
        TLM,
      ),
    ],
    coppermindUrl: wiki('Ashmounts'),
  },
  {
    id: 'doriel',
    name: 'Doriel',
    planetId: 'scadrial',
    kind: 'landmark',
    revealedIn: [TFE],
    summary: [
      p(
        'One of the Ashmounts, the volcanoes whose ash falls across the Final Empire. It lies in the south of the empire.',
        ...FE_ONLY,
      ),
    ],
    coppermindUrl: wiki('Ashmounts'),
  },
  // Elendel Basin map (The Alloy of Law)
  {
    id: 'elendel-basin',
    name: 'Elendel Basin',
    altName: 'the Basin',
    planetId: 'scadrial',
    kind: 'region',
    revealedIn: ERA2,
    summary: [
      p(
        'A lush, fertile basin, cut off from the Roughs by mountain ranges and open to the sea. Most of the population lives here, around the great city of Elendel.',
        ...ERA2,
      ),
      p('Railways and canals tie its outer cities to the capital.', ...ERA2),
    ],
    settingOf: [story(AOL), story(SOS), story(BOM), story(TLM)],
    coppermindUrl: wiki('Elendel_Basin'),
  },
  {
    id: 'northern-roughs',
    name: 'Northern Roughs',
    altName: 'the Roughs',
    planetId: 'scadrial',
    kind: 'region',
    revealedIn: ERA2,
    summary: [
      p(
        'The frontier beyond the mountains north and east of the Elendel Basin, the larger part of the Roughs. The Irongate River roughly divides it from the Southern Roughs.',
        ...ERA2,
      ),
      p(
        'Its towns are sparse and lag behind the Basin, and rail and mining companies post bounties on outlaws. Waxillium Ladrian spent twenty years as a lawman here.',
        ...ERA2,
      ),
    ],
    settingOf: [story(AOL)],
    coppermindUrl: wiki('Roughs'),
  },
  {
    id: 'southern-roughs',
    name: 'Southern Roughs',
    altName: 'the Roughs',
    planetId: 'scadrial',
    kind: 'region',
    revealedIn: ERA2,
    summary: [
      p(
        'The frontier beyond the mountains south-east of the Elendel Basin, the southern part of the Roughs.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Roughs'),
  },
  {
    id: 'elendel',
    name: 'Elendel',
    altName: 'Elendel City',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p(
        'The capital of the Basin and by far its largest city, home to millions, at the mouth of the Irongate River. Rail lines and roads radiate from it, and it is divided into octants.',
        ...ERA2,
      ),
      p(
        'Many high noble houses live here, including Houses Ladrian and Tekiel. Waxillium Ladrian returns from the Roughs to lead House Ladrian.',
        ...ERA2,
      ),
    ],
    settingOf: [story(AOL), story(SOS), story(BOM), story(TLM)],
    coppermindUrl: wiki('Elendel'),
  },
  {
    id: 'weathering',
    name: 'Weathering',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'northern-roughs',
    revealedIn: ERA2,
    summary: [
      p(
        'A remote town in the Northern Roughs, west of Covingtar and north-east of Feltrel, where Waxillium Ladrian served as a lawman.',
        ...ERA2,
      ),
    ],
    mentionedIn: [story(AOL)],
    coppermindUrl: wiki('Weathering'),
  },
  {
    id: 'bilming',
    name: 'Bilming',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p(
        'A port and industrial city on the coast west of Elendel, the only other major port in the Basin.',
        ...ERA2,
      ),
      p(
        'It has grown into the one city that can rival Elendel, and becomes the base of the Set.',
        TLM,
      ),
    ],
    settingOf: [story(TLM)],
    coppermindUrl: wiki('Bilming'),
  },
  {
    id: 'doriel-town',
    name: 'Doriel',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p(
        'A city south-east of Elendel with a railway interchange; one branch runs south to Tarier.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Doriel_(city)'),
  },
  {
    id: 'tathingdwel',
    name: 'Tathingdwel',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p(
        'A city in the north-west of the Basin, south of the Channerel Range.',
        ...ERA2,
      ),
      p(
        'Most of its people are Terris, and it is governed by their Synod.',
        TLM,
      ),
    ],
    coppermindUrl: wiki('Tathingdwel'),
  },
  {
    id: 'drypost',
    name: 'Drypost',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p(
        'A city far to the north-east of Elendel, on the railway into the Northern Roughs.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Drypost'),
  },
  {
    id: 'feltrel',
    name: 'Feltrel',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'northern-roughs',
    revealedIn: ERA2,
    summary: [
      p(
        'A ghost town in a dry, red-clay corner of the Northern Roughs, south-west of Weathering.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Feltrel'),
  },
  {
    id: 'dryport',
    name: 'Dryport',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p(
        'A city a short way east of Elendel on the Irongate River, with its own branch railway.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Dryport'),
  },
  {
    id: 'steinel',
    name: 'Steinel',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p('A city due east of Elendel, along the Irongate River.', ...ERA2),
    ],
    coppermindUrl: wiki('Steinel'),
  },
  {
    id: 'vindiel-cameux',
    name: 'Vindiel-Cameux',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [p('A town just south of Elendel.', ...ERA2)],
    coppermindUrl: wiki('Vindiel-Cameux'),
  },
  {
    id: 'doxonar',
    name: 'Doxonar',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [p('A city south of Elendel.', ...ERA2)],
    coppermindUrl: wiki('Doxonar'),
  },
  {
    id: 'tarier',
    name: 'Tarier',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p(
        'A city in the south of the Basin, south of Doriel and south-east of Doxonar.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Tarier'),
  },
  {
    id: 'elmsdel',
    name: 'Elmsdel',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p(
        'One of the outer cities in the south-east of the Basin, north-west of Garmet and not far from the Seran Range.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Elmsdel'),
  },
  {
    id: 'garmet',
    name: 'Garmet',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p(
        'A city in the far south-east of the Basin, beside the Seran Range.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Garmet'),
  },
  {
    id: 'rashekin',
    name: 'Rashekin',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p(
        'A city in the north-east of the Basin, on the railway from Elendel towards the Faleast Range.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Rashekin'),
  },
  {
    id: 'alendel',
    name: 'Alendel',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p('A city in the middle of the Basin, north-east of Elendel.', ...ERA2),
    ],
    coppermindUrl: wiki('Alendel'),
  },
  {
    id: 'wyllion',
    name: 'Wyllion',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [p('A city in the west of the Basin.', ...ERA2)],
    coppermindUrl: wiki('Wyllion'),
  },
  {
    id: 'dazarlomue',
    name: 'Dazarlomue',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p(
        'A city in the north-west of the Basin, west of Alendel and south of Tathingdwel.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Dazarlomue'),
  },
  {
    id: 'mycondwel',
    name: 'Mycondwel',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'elendel-basin',
    revealedIn: ERA2,
    summary: [
      p(
        'A city on the north-western edge of the Basin, along the Channerel Range.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Mycondwel'),
  },
  {
    id: 'covingtar',
    name: 'Covingtar',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'northern-roughs',
    revealedIn: ERA2,
    summary: [
      p(
        'A town in the Northern Roughs, between Weathering and True Madil.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Covingtar'),
  },
  {
    id: 'true-madil',
    name: 'True Madil',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'northern-roughs',
    revealedIn: ERA2,
    summary: [p('A town in the Northern Roughs.', ...ERA2)],
    coppermindUrl: wiki('True_Madil'),
  },
  {
    id: 'callingfale',
    name: 'Callingfale',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'northern-roughs',
    revealedIn: ERA2,
    summary: [
      p(
        'A town in the far north of the Roughs, north of True Madil and east of the Tyrian Sea.',
        ...ERA2,
      ),
    ],
    coppermindUrl: wiki('Callingfale'),
  },
  {
    id: 'isaeucs-bend',
    name: 'Isaeuc’s Bend',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'northern-roughs',
    revealedIn: ERA2,
    summary: [
      p('A town in the Northern Roughs, north-east of True Madil.', ...ERA2),
    ],
    coppermindUrl: wiki("Isaeuc's_Bend"),
  },
  {
    id: 'far-dorest',
    name: 'Far Dorest',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'northern-roughs',
    revealedIn: ERA2,
    summary: [p('A large town in the Roughs, north of Faradana.', ...ERA2)],
    coppermindUrl: wiki('Far_Dorest'),
  },
  {
    id: 'faradana',
    name: 'Faradana',
    planetId: 'scadrial',
    kind: 'city',
    parentId: 'northern-roughs',
    revealedIn: ERA2,
    summary: [
      p('A town in the east of the Roughs, south of Far Dorest.', ...ERA2),
    ],
    coppermindUrl: wiki('Faradana'),
  },
  // Scadrial map (The Lost Metal)
  {
    id: 'scadrial-northern-continent',
    name: 'Northern continent',
    planetId: 'scadrial',
    kind: 'continent',
    revealedIn: [TLM],
    summary: [
      p(
        'The northern landmass on the Elendel Cartographic Collective’s map, around the Elendel Basin and the Roughs.',
        TLM,
      ),
    ],
    coppermindUrl: wiki('Scadrial'),
  },
  {
    id: 'old-terris',
    name: 'Old Terris',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'scadrial-northern-continent',
    revealedIn: [TLM],
    summary: [
      p('A mountainous region along the far northern edge of the map.', TLM),
    ],
    coppermindUrl: wiki('Terris'),
  },
  {
    id: 'farmost',
    name: 'Farmost',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'scadrial-northern-continent',
    revealedIn: [TLM],
    summary: [p('Mountainous country on the north-west coast.', TLM)],
    coppermindUrl: wiki('Scadrial'),
  },
  {
    id: 'channerel',
    name: 'Channerel',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'scadrial-northern-continent',
    revealedIn: [TLM],
    summary: [
      p('Highlands north-east of the Elendel Basin, near the Tyrian Sea.', TLM),
    ],
    coppermindUrl: wiki('Scadrial'),
  },
  {
    id: 'lost-doriel',
    name: 'Lost Doriel',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'scadrial-northern-continent',
    revealedIn: [TLM],
    summary: [p('Rugged land east of the Southern Roughs.', TLM)],
    coppermindUrl: wiki('Scadrial'),
  },
  {
    id: 'northern-crescent',
    name: 'Northern Crescent',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'scadrial-northern-continent',
    revealedIn: [TLM],
    summary: [p('A region along the north-east coast.', TLM)],
    coppermindUrl: wiki('Scadrial'),
  },
  {
    id: 'southern-crescent',
    name: 'Southern Crescent',
    planetId: 'scadrial',
    kind: 'region',
    parentId: 'scadrial-northern-continent',
    revealedIn: [TLM],
    summary: [
      p('A region along the east coast, east of the Elendel Basin.', TLM),
    ],
    coppermindUrl: wiki('Scadrial'),
  },
  {
    id: 'scadrial-southern-continent',
    name: 'Southern continent',
    planetId: 'scadrial',
    kind: 'continent',
    revealedIn: [BOM, TLM],
    summary: [
      p(
        'The lands far to the south of the Elendel Basin, home to southern peoples who had no contact with the Basin for centuries.',
        BOM,
        TLM,
      ),
      p(
        'The Basin’s map of it draws on Malwish maps; the Malwish Consortium spans most of it.',
        TLM,
      ),
    ],
    mentionedIn: [story(BOM), story(TLM)],
    coppermindUrl: wiki('Southern_Scadrian'),
  },
  {
    id: 'malwish-consortium',
    name: 'Malwish Consortium',
    altName: 'the Malwish',
    planetId: 'scadrial',
    kind: 'nation',
    parentId: 'scadrial-southern-continent',
    revealedIn: [BOM, TLM],
    summary: [
      p(
        'The Malwish are a southern people whose airships astonish the people of the Basin.',
        BOM,
        TLM,
      ),
      p('Their Consortium spans most of the southern continent.', TLM),
    ],
    mentionedIn: [story(BOM), story(TLM)],
    coppermindUrl: wiki('Southern_Scadrian#Malwish'),
  },
  {
    id: 'the-maskless',
    name: 'The Maskless',
    planetId: 'scadrial',
    kind: 'region',
    revealedIn: [TLM],
    summary: [
      p(
        'Lands in the far south-east of the map, beyond a strait from the southern continent.',
        TLM,
      ),
    ],
    coppermindUrl: wiki('Scadrial'),
  },
  {
    id: 'southern-islands',
    name: 'Southern Islands',
    planetId: 'scadrial',
    kind: 'region',
    revealedIn: [TLM],
    summary: [
      p(
        'A long chain of islands between the Sea of Yomend and the Sea of Lennes, south-west of the Elendel Basin. Little is known about them.',
        TLM,
      ),
    ],
    coppermindUrl: wiki('Southern_Islands'),
  },
  {
    id: 'shrouded-isles',
    name: 'Shrouded Isles',
    planetId: 'scadrial',
    kind: 'region',
    revealedIn: [TLM],
    summary: [
      p(
        'Remote islands in the ocean west of the northern continent, similar in size to the Southern Islands. Very little is known about them.',
        TLM,
      ),
    ],
    coppermindUrl: wiki('Shrouded_Isles'),
  },
]
