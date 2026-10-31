// The hidden Spanish Civil War page (routes/SpanishCivilWar.tsx): Wikipedia's
// "Spanish Civil War" and the articles it links, summarised in our own words.
// Photos (public/spanish-civil-war/<moment id>.webp) and maps are from
// Wikimedia Commons, credited below. Nothing here is Cosmere or spoiler-gated.

export type ScwKind = 'politics' | 'war' | 'terror' | 'abroad' | 'exile'

export interface ScwMoment {
  id: string
  title: string
  /** As shown, e.g. "3–8 February 1937". */
  date: string
  /** yyyy-mm-dd, for picking the map nearest in time. */
  iso: string
  kind: ScwKind
  /** x, y: pixels on the 900×725 maps; none when it's off them. */
  place?: { name: string; x?: number; y?: number }
  text: string
  facts?: [string, string][]
  /** Its photo is /spanish-civil-war/<id>.webp; credit in scwCredits. */
  photo: { alt: string; caption: string }
  /** English Wikipedia article title. */
  wiki: string
}

export interface ScwEra {
  id: string
  title: string
  when: string
  tone: string
  moments: ScwMoment[]
}

export const scwKinds: Record<ScwKind, string> = {
  politics: 'Politics',
  war: 'War',
  terror: 'Terror',
  abroad: 'Abroad',
  exile: 'Exile',
}

// Places that come up again and again, on the maps' own city dots.
const madrid = { name: 'Madrid', x: 368, y: 316 }
const barcelona = { name: 'Barcelona', x: 748, y: 233 }
const seville = { name: 'Seville', x: 222, y: 564 }
const burgos = { name: 'Burgos', x: 368, y: 153 } // no dot of its own

export const scwEras: ScwEra[] = [
  {
    id: 'republic',
    title: 'The Second Republic',
    when: '1931–1936',
    tone: '#d4a640',
    moments: [
      {
        id: 'republic-proclaimed',
        title: 'The Republic is proclaimed',
        date: '14 April 1931',
        iso: '1931-04-14',
        kind: 'politics',
        place: madrid,
        text: 'Republican parties sweep the cities in local elections, and King Alfonso XIII leaves Spain without abdicating. The Second Spanish Republic is declared amid celebrations, promising land reform, a smaller army and the separation of church and state.',
        facts: [
          ['The king', 'Alfonso XIII goes into exile'],
          ['Provisional head', 'Niceto Alcalá-Zamora'],
        ],
        photo: {
          alt: 'An allegorical poster of the Republic, a woman holding its flag',
          caption: 'Allegory of the Republic, by Teodoro Andreu',
        },
        wiki: 'Second Spanish Republic',
      },
      {
        id: 'constitution',
        title: 'A new constitution',
        date: '9 December 1931',
        iso: '1931-12-09',
        kind: 'politics',
        place: madrid,
        text: 'The Cortes adopts a constitution that makes Spain a secular, democratic republic. Women get the vote, divorce is legalised and the regions may seek self-rule, but religious orders are barred from teaching, which turns many Catholics against the new state.',
        facts: [['Women first vote', 'November 1933']],
        photo: {
          alt: 'The printed cover of the 1931 constitution',
          caption: 'The Constitution of the Spanish Republic',
        },
        wiki: 'Spanish Constitution of 1931',
      },
      {
        id: 'sanjurjada',
        title: 'Sanjurjo’s failed coup',
        date: '10 August 1932',
        iso: '1932-08-10',
        kind: 'war',
        place: seville,
        text: 'General José Sanjurjo seizes Seville in a bid to topple the government, but finds little support and the rising collapses within a day. He is sentenced to death, reprieved, and later exiled to Portugal, from where he is meant to lead the coup of 1936.',
        facts: [
          ['Dates', '10–11 August 1932'],
          ['Result', 'Government victory'],
        ],
        photo: {
          alt: 'Officers in uniform gathered in Seville',
          caption: 'Leaders of the rising in Seville, 10 August 1932',
        },
        wiki: 'Sanjurjada',
      },
      {
        id: 'right-wins',
        title: 'The right wins',
        date: '19 November 1933',
        iso: '1933-11-19',
        kind: 'politics',
        text: 'In the first general election in which women vote, the Catholic right-wing CEDA, led by José María Gil-Robles, becomes the largest party. The centrist Radicals govern with its backing and undo many of the Republic’s reforms; the left calls these years the “black two years”.',
        facts: [
          ['Largest party', 'CEDA'],
          ['Prime minister', 'Alejandro Lerroux (Radical)'],
        ],
        photo: {
          alt: 'Portrait of José María Gil-Robles',
          caption: 'José María Gil-Robles, leader of the CEDA',
        },
        wiki: '1933 Spanish general election',
      },
      {
        id: 'asturias',
        title: 'Revolution in Asturias',
        date: '5–19 October 1934',
        iso: '1934-10-05',
        kind: 'war',
        place: { name: 'Oviedo', x: 238, y: 72 },
        text: 'When the CEDA enters the government, socialists and anarchists call a general strike. In Asturias armed miners take over the province and much of Oviedo. The army, directed from Madrid by General Francisco Franco and including troops from Morocco, crushes the rising in two weeks.',
        facts: [
          ['Government dead', 'about 450'],
          ['Rebel dead', '1,500–2,000'],
          ['Arrested', '15,000–30,000'],
        ],
        photo: {
          alt: 'A column of Civil Guards on a mountain road',
          caption: 'A Civil Guard column during the revolution, Brañosera',
        },
        wiki: 'Revolution of 1934',
      },
      {
        id: 'popular-front',
        title: 'The Popular Front wins',
        date: '16 February 1936',
        iso: '1936-02-16',
        kind: 'politics',
        place: madrid,
        text: 'A left-wing alliance, the Popular Front, narrowly wins a bitterly fought election. Political prisoners are freed and Manuel Azaña returns to power, becoming president in May. Through the spring, strikes, land seizures, church burnings and street killings by left and right deepen the crisis.',
        facts: [
          ['Winner', 'Popular Front'],
          ['President from May', 'Manuel Azaña'],
        ],
        photo: {
          alt: 'Voters queueing at a glass ballot box',
          caption: 'Voting in Madrid; ballot boxes had to be made of glass',
        },
        wiki: '1936 Spanish general election',
      },
      {
        id: 'calvo-sotelo',
        title: 'Calvo Sotelo is murdered',
        date: '13 July 1936',
        iso: '1936-07-13',
        kind: 'terror',
        place: madrid,
        text: 'The day after a left-wing officer of the Assault Guards, Lieutenant José Castillo, is shot by far-right gunmen, a group of Assault Guards and socialist militants take the monarchist leader José Calvo Sotelo from his home and kill him. Officers still undecided about the coup being planned now join it.',
        facts: [['The coup begins', 'four days later']],
        photo: {
          alt: 'Portrait of José Calvo Sotelo',
          caption: 'José Calvo Sotelo in 1936',
        },
        wiki: 'José Calvo Sotelo',
      },
    ],
  },
  {
    id: 'coup',
    title: 'The coup',
    when: 'July 1936',
    tone: '#e0604a',
    moments: [
      {
        id: 'rising',
        title: 'The army rises',
        date: '17 July 1936',
        iso: '1936-07-17',
        kind: 'war',
        place: { name: 'Melilla, Spanish Morocco' },
        text: 'The coup planned by General Emilio Mola begins in Spanish Morocco and spreads to the mainland the next day. General Francisco Franco flies from the Canary Islands to command the Army of Africa. Its intended leader, General Sanjurjo, dies on 20 July when his plane crashes leaving Portugal.',
        facts: [
          ['Planner', 'General Emilio Mola'],
          ['Result', 'Spain split in two'],
        ],
        photo: {
          alt: 'A painted portrait of General José Sanjurjo in uniform',
          caption: 'General José Sanjurjo, the rising’s figurehead',
        },
        wiki: 'Spanish coup of July 1936',
      },
      {
        id: 'seville',
        title: 'Seville falls to the rebels',
        date: '18 July 1936',
        iso: '1936-07-18',
        kind: 'war',
        place: seville,
        text: 'General Gonzalo Queipo de Llano takes Seville with a small force and a great deal of bluff, then crushes resistance in its working-class districts. His nightly radio broadcasts become a weapon of terror, and the city gives troops from Africa a foothold in Spain.',
        facts: [
          ['Fighting', '18–22 July 1936'],
          ['Result', 'Nationalist victory'],
        ],
        photo: {
          alt: 'A barricade of paving stones across a street',
          caption: 'A barricade in Seville’s Macarena district, 1936',
        },
        wiki: 'July 1936 military uprising in Seville',
      },
      {
        id: 'barcelona-rising',
        title: 'Barcelona holds',
        date: '19–20 July 1936',
        iso: '1936-07-19',
        kind: 'war',
        place: barcelona,
        text: 'Troops marching into Barcelona’s centre are met by Assault Guards, the Civil Guard and armed anarchist workers. After two days of street fighting the rising is beaten and its leader, General Manuel Goded, is captured. The anarchist CNT becomes the real power in the city.',
        facts: [
          ['Result', 'Republican victory'],
          ['Rebel leader', 'General Manuel Goded, captured'],
        ],
        photo: {
          alt: 'Soldiers and Assault Guards with rifles at windows',
          caption:
            'Republican soldiers and Assault Guards in the Telefónica building',
        },
        wiki: 'July 1936 military uprising in Barcelona',
      },
      {
        id: 'montana',
        title: 'Storming the Montaña Barracks',
        date: '20 July 1936',
        iso: '1936-07-20',
        kind: 'war',
        place: madrid,
        text: 'In Madrid the rebels shut themselves in the Montaña Barracks. Crowds armed by the government and backed by Assault Guards storm it, and many defenders are killed after it falls. With Madrid and Barcelona held, the coup has failed to take the country, and a civil war begins.',
        facts: [
          ['Siege', '18–20 July 1936'],
          ['Result', 'Republican victory'],
        ],
        photo: {
          alt: 'Guards and civilians crouching in a street with rifles',
          caption: 'The assault on the Montaña Barracks, Madrid',
        },
        wiki: 'Siege of the Montaña Barracks',
      },
      {
        id: 'airlift',
        title: 'An army by air',
        date: 'July–October 1936',
        iso: '1936-07-25',
        kind: 'abroad',
        place: seville,
        text: 'Crews loyal to the Republic hold most of the navy and block the Strait of Gibraltar, stranding Franco’s veteran Army of Africa in Morocco. German and Italian transport planes fly it to Seville in one of the first large military airlifts in history, giving the rebels their best troops.',
        facts: [['Aircraft', 'German Ju 52s, Italian SM.81s']],
        photo: {
          alt: 'Soldiers climbing into a three-engined transport plane',
          caption: 'Moroccan troops boarding a German Ju 52, 1936',
        },
        wiki: 'Spanish airlift of 1936',
      },
      {
        id: 'revolution',
        title: 'Revolution and terror in the Republic',
        date: 'Summer 1936',
        iso: '1936-07-28',
        kind: 'politics',
        place: barcelona,
        text: 'Where the coup fails, unions and parties form their own militias, and factories and farms are taken over and run collectively, above all in Catalonia and Aragon. In the chaos, militias and patrols kill thousands of priests, landowners and suspected rebels, in what becomes known as the Red Terror.',
        facts: [['Clergy killed', 'nearly 7,000 in the war']],
        photo: {
          alt: 'Women militia members with rifles',
          caption: 'CNT-FAI militiawomen in Barcelona, July 1936',
        },
        wiki: 'Spanish Revolution of 1936',
      },
    ],
  },
  {
    id: 'madrid',
    title: 'The road to Madrid',
    when: '1936',
    tone: '#d98a3d',
    moments: [
      {
        id: 'badajoz',
        title: 'Badajoz and the White Terror',
        date: '14 August 1936',
        iso: '1936-08-14',
        kind: 'terror',
        place: { name: 'Badajoz', x: 165, y: 431 },
        text: 'Franco’s columns march north from Seville, killing as they go. When they take Badajoz, on the Portuguese border, thousands of prisoners are shot, many in the bullring. Across rebel Spain, mass executions of trade unionists, teachers and Republican officials are used to crush any resistance.',
        facts: [['Commander', 'Lieutenant Colonel Juan Yagüe']],
        photo: {
          alt: 'Women pleading with soldiers in a village street',
          caption:
            'Women plead with rebel soldiers for prisoners’ lives, Constantina, 1936',
        },
        wiki: 'Badajoz massacre',
      },
      {
        id: 'irun',
        title: 'Irún falls',
        date: '5 September 1936',
        iso: '1936-09-05',
        kind: 'war',
        place: { name: 'Irún', x: 493, y: 75 },
        text: 'Rebel troops from Navarre take Irún, partly burned by its retreating defenders. Its fall cuts the Basque Country and the rest of the Republican north off from France, and refugees flee across the border bridge.',
        facts: [
          ['Battle', '19 August – 5 September 1936'],
          ['Result', 'Nationalist victory'],
        ],
        photo: {
          alt: 'Armed civilians with rifles behind a wall',
          caption: 'Armed Republican civilians during the battle of Irún',
        },
        wiki: 'Battle of Irún',
      },
      {
        id: 'non-intervention',
        title: 'The world stays out, on paper',
        date: 'September 1936',
        iso: '1936-09-09',
        kind: 'abroad',
        place: { name: 'London' },
        text: 'Britain and France lead 27 countries in agreeing not to arm either side, and a Non-Intervention Committee meets in London. Germany and Italy sign but keep sending Franco planes, tanks and men. From October the Soviet Union arms the Republic, paid for with Spain’s gold reserves; Mexico helps too.',
        facts: [
          ['Committee first meets', '9 September 1936'],
          ['Signatories', '27 countries'],
        ],
        photo: {
          alt: 'A three-engined Italian bomber in flight',
          caption: 'An Italian Savoia-Marchetti SM.81, a type sent to Franco',
        },
        wiki: 'Non-intervention in the Spanish Civil War',
      },
      {
        id: 'alcazar',
        title: 'The Alcázar is relieved',
        date: '27 September 1936',
        iso: '1936-09-27',
        kind: 'war',
        place: { name: 'Toledo', x: 345, y: 358 },
        text: 'For two months, about a thousand Civil Guards, soldiers and Falangists, with hundreds of women and children, hold out in Toledo’s fortress under constant attack. Franco turns aside from Madrid to relieve them: a propaganda triumph, but it also gives Madrid time to prepare.',
        facts: [
          ['Siege', '21 July – 27 September 1936'],
          ['Commander', 'Colonel José Moscardó'],
          ['Defenders killed', '48–65'],
        ],
        photo: {
          alt: 'People in the courtyard of the damaged fortress',
          caption: 'In the courtyard of the Alcázar, autumn 1936',
        },
        wiki: 'Siege of the Alcázar',
      },
      {
        id: 'caudillo',
        title: 'Franco takes command',
        date: '1 October 1936',
        iso: '1936-10-01',
        kind: 'politics',
        place: burgos,
        text: 'The rebel generals make Franco commander-in-chief and head of state, and he is installed at Burgos. In April 1937 he merges the Falange and the Carlists into a single party under his control. He will rule as “Caudillo” for almost forty years.',
        facts: [
          ['Titles', 'Generalísimo, head of state'],
          ['Seat', 'Burgos'],
        ],
        photo: {
          alt: 'Posed portrait of Francisco Franco',
          caption: 'Francisco Franco',
        },
        wiki: 'Francisco Franco',
      },
      {
        id: 'brigades',
        title: 'The International Brigades',
        date: 'October 1936',
        iso: '1936-10-14',
        kind: 'abroad',
        place: { name: 'Albacete', x: 488, y: 435 },
        text: 'Volunteers from around fifty countries, recruited mostly by communist parties, gather at their base in Albacete. Many are workers or refugees from fascism; others are students and writers. The first brigade goes into action defending Madrid in November.',
        facts: [['Volunteers', 'about 32,000–35,000 in all']],
        photo: {
          alt: 'Volunteers resting outside a stone hut',
          caption:
            'Command post of the Etkar André Battalion, a German unit of the Brigades',
        },
        wiki: 'International Brigades',
      },
      {
        id: 'madrid',
        title: '“¡No pasarán!” Madrid holds',
        date: '8–23 November 1936',
        iso: '1936-11-08',
        kind: 'war',
        place: madrid,
        text: 'As Franco’s columns reach the city’s edge, the government leaves for Valencia. A defence council under General José Miaja, militias, the first International Brigades and new Soviet tanks and planes stop the assault in the University City. Madrid stays besieged and bombed until the end of the war.',
        facts: [
          ['Assault', '8–23 November 1936'],
          ['Siege', 'until 28 March 1939'],
        ],
        photo: {
          alt: 'Children crouched in a sewer tunnel',
          caption:
            'Children shelter in a sewer during the bombing of Madrid, 1937',
        },
        wiki: 'Siege of Madrid',
      },
      {
        id: 'paracuellos',
        title: 'The Paracuellos massacres',
        date: 'November–December 1936',
        iso: '1936-11-15',
        kind: 'terror',
        place: { name: 'Paracuellos', x: 380, y: 307 },
        text: 'As the front nears Madrid, Republican authorities move prisoners out of the city’s jails. Thousands, many of them army officers, priests and right-wing politicians, are taken to Paracuellos de Jarama and Torrejón and shot: the largest massacre on the Republican side.',
        facts: [['Killed', 'about 2,000–3,000 (estimates vary)']],
        photo: {
          alt: 'A hillside cemetery with a large cross',
          caption: 'The cemetery at Paracuellos de Jarama, 2007',
        },
        wiki: 'Paracuellos massacres',
      },
      {
        id: 'durruti',
        title: 'Durruti’s funeral',
        date: '23 November 1936',
        iso: '1936-11-23',
        kind: 'politics',
        place: barcelona,
        text: 'The anarchist leader Buenaventura Durruti, who brought a militia column to defend Madrid, is shot there and dies on 20 November; how it happened is still disputed. Hundreds of thousands follow his coffin through Barcelona.',
        facts: [
          ['Shot', '19 November 1936, Madrid'],
          ['Died', '20 November 1936'],
        ],
        photo: {
          alt: 'A coffin beneath wreaths of flowers, with mourners',
          caption: 'Durruti lying in state at the CNT building, Barcelona',
        },
        wiki: 'Death and funeral of Buenaventura Durruti',
      },
    ],
  },
  {
    id: '1937',
    title: '1937: The war in the north',
    when: '1937',
    tone: '#9a7fd1',
    moments: [
      {
        id: 'malaga',
        title: 'Málaga and the road to Almería',
        date: '3–8 February 1937',
        iso: '1937-02-08',
        kind: 'war',
        place: { name: 'Málaga', x: 328, y: 618 },
        text: 'Nationalist and Italian troops take Málaga almost unopposed. Tens of thousands of civilians flee east along the coast road to Almería and are shelled from the sea and bombed from the air. Thousands of those left behind are executed in the weeks that follow.',
        facts: [['Result', 'Nationalist victory']],
        photo: {
          alt: 'Drawing of refugees walking along a road',
          caption: 'An artist’s view of refugees fleeing to Almería',
        },
        wiki: 'Battle of Málaga (1937)',
      },
      {
        id: 'jarama',
        title: 'Jarama',
        date: '6–27 February 1937',
        iso: '1937-02-06',
        kind: 'war',
        place: { name: 'Jarama', x: 381, y: 330 },
        text: 'Franco tries to cut the road linking Madrid with Valencia. In three weeks of fighting along the Jarama river, International Brigades including the British and American Lincoln battalions suffer terrible losses. The front barely moves and the road stays open.',
        facts: [['Result', 'Indecisive']],
        photo: {
          alt: 'Volunteers posing with a company banner',
          caption: 'The Tom Mooney Company of the Lincoln Battalion, Jarama',
        },
        wiki: 'Battle of Jarama',
      },
      {
        id: 'guadalajara',
        title: 'Guadalajara',
        date: '8–23 March 1937',
        iso: '1937-03-08',
        kind: 'war',
        place: { name: 'Guadalajara', x: 403, y: 294 },
        text: 'Mussolini’s expeditionary corps attacks north-east of Madrid, hoping for a quick victory. Sleet, mud, Republican counter-attacks and air raids rout it, embarrassing Fascist Italy. Franco gives up on taking Madrid and turns to the north.',
        facts: [
          ['Result', 'Republican victory'],
          ['Attackers', 'Italian Corpo Truppe Volontarie'],
        ],
        photo: {
          alt: 'A gun crew working a field gun on open ground',
          caption: 'Artillery at the battle of Guadalajara',
        },
        wiki: 'Battle of Guadalajara',
      },
      {
        id: 'guernica',
        title: 'Guernica',
        date: '26 April 1937',
        iso: '1937-04-26',
        kind: 'terror',
        place: { name: 'Guernica', x: 435, y: 75 },
        text: 'German Condor Legion and Italian bombers attack the Basque town of Guernica for hours, leaving much of it in flames. The raid causes outrage around the world and inspires Picasso’s painting. Estimates of the dead range from about 150 to over 1,600; recent studies put it at a few hundred.',
        facts: [
          ['Attackers', 'Condor Legion, Italian Aviazione Legionaria'],
          ['Dead', 'estimates 150–1,654'],
        ],
        photo: {
          alt: 'The shells of burnt-out buildings',
          caption: 'The ruins of Guernica',
        },
        wiki: 'Bombing of Guernica',
      },
      {
        id: 'may-days',
        title: 'Barcelona’s May Days',
        date: '3–8 May 1937',
        iso: '1937-05-03',
        kind: 'war',
        place: barcelona,
        text: 'When police try to take the Telefónica exchange from the anarchists, Barcelona erupts into fighting between the government and communists on one side and anarchists and the POUM on the other; George Orwell, with the POUM, describes it in Homage to Catalonia. Juan Negrín becomes prime minister, and the POUM is banned.',
        facts: [
          ['Dead', '500–1,000'],
          ['Result', 'Government control restored'],
        ],
        photo: {
          alt: 'A crowd with banners at a demonstration',
          caption: 'A POUM and FAI demonstration, 1937',
        },
        wiki: 'May Days',
      },
      {
        id: 'basque-children',
        title: 'The Basque children',
        date: '21 May 1937',
        iso: '1937-05-21',
        kind: 'exile',
        place: { name: 'Santurtzi', x: 413, y: 75 },
        text: 'With Bilbao under siege, about 4,000 Basque children sail for England aboard the old liner SS Habana and are taken in by families and charities across Britain. Thousands more children are evacuated to France, Belgium, Mexico and the Soviet Union; some never return.',
        facts: [
          ['Ship', 'SS Habana, to Southampton'],
          ['Children', 'about 4,000'],
        ],
        photo: {
          alt: 'A group of children, some raising clenched fists',
          caption: 'Children waiting to be evacuated',
        },
        wiki: 'Evacuation of children in the Spanish Civil War',
      },
      {
        id: 'mola',
        title: 'Mola is killed',
        date: '3 June 1937',
        iso: '1937-06-03',
        kind: 'war',
        place: { name: 'Alcocero', x: 382, y: 135 },
        text: 'General Emilio Mola, who planned the coup and commands the campaign in the north, dies when his plane crashes in bad weather near Burgos. With Sanjurjo and Mola both gone, no one is left to rival Franco.',
        photo: {
          alt: 'Portrait of General Emilio Mola',
          caption: 'General Emilio Mola',
        },
        wiki: 'Emilio Mola',
      },
      {
        id: 'bilbao',
        title: 'Bilbao falls',
        date: '19 June 1937',
        iso: '1937-06-19',
        kind: 'war',
        place: { name: 'Bilbao', x: 420, y: 81 },
        text: 'Nationalist troops break through Bilbao’s “Iron Ring” of fortifications, whose plans an engineer had taken over to them, and enter the city. Basque forces fall back towards Santander, and Spain’s heavy industry passes to Franco.',
        facts: [
          ['Battle', '12–19 June 1937'],
          ['Result', 'Nationalist victory'],
        ],
        photo: {
          alt: 'Small tanks and armoured cars in a city square',
          caption:
            'Nationalist tanks and armoured cars in Bilbao, 19 June 1937',
        },
        wiki: 'Battle of Bilbao',
      },
      {
        id: 'brunete',
        title: 'Brunete',
        date: '6–25 July 1937',
        iso: '1937-07-06',
        kind: 'war',
        place: { name: 'Brunete', x: 349, y: 316 },
        text: 'To draw Franco’s forces away from the north, the Republic launches its largest offensive yet, west of Madrid. It takes Brunete in the first days, then stalls in the summer heat, and counter-attacks win back much of the ground at great cost to both armies.',
        facts: [['Result', 'Indecisive']],
        photo: {
          alt: 'Map of the fronts west of Madrid before and after the battle',
          caption: 'Map of the battle west of Madrid',
        },
        wiki: 'Battle of Brunete',
      },
      {
        id: 'santander',
        title: 'Santander falls',
        date: '14–26 August 1937',
        iso: '1937-08-26',
        kind: 'war',
        place: { name: 'Santander', x: 363, y: 65 },
        text: 'Nationalist and Italian troops overrun Cantabria in under two weeks. Cut-off Basque units surrender to the Italians at Santoña on the promise of safe conduct, which Franco does not honour.',
        facts: [
          ['Result', 'Nationalist victory'],
          ['Prisoners', 'about 60,000'],
        ],
        photo: {
          alt: 'A concrete machine-gun post above a beach',
          caption: 'A wartime machine-gun nest at Santander, today',
        },
        wiki: 'Battle of Santander',
      },
      {
        id: 'belchite',
        title: 'Belchite',
        date: '24 August – 7 September 1937',
        iso: '1937-08-24',
        kind: 'war',
        place: { name: 'Belchite', x: 559, y: 242 },
        text: 'A Republican offensive in Aragon aims at Zaragoza but bogs down at the small town of Belchite, taken after house-to-house fighting. Franco later leaves its ruins standing as a memorial and builds a new town beside them.',
        facts: [['Result', 'Belchite taken; Zaragoza not reached']],
        photo: {
          alt: 'Volunteers firing from cover',
          caption: 'Volunteers of the XI International Brigade at Belchite',
        },
        wiki: 'Battle of Belchite (1937)',
      },
      {
        id: 'gijon',
        title: 'The north is lost',
        date: '21 October 1937',
        iso: '1937-10-21',
        kind: 'war',
        place: { name: 'Gijón', x: 250, y: 54 },
        text: 'Asturias, the last Republican pocket in the north, falls when Nationalist troops enter Gijón. Escape by sea is cut off, and the Condor Legion sinks the destroyer Císcar as the evacuation begins. Franco now has the north’s mines, factories and ports, and can turn his whole army east.',
        facts: [['Asturias Offensive', '1 September – 21 October 1937']],
        photo: {
          alt: 'A destroyer at sea',
          caption: 'The destroyer Císcar, sunk at Gijón',
        },
        wiki: 'Asturias Offensive',
      },
    ],
  },
  {
    id: '1938',
    title: '1938: The Republic cut in two',
    when: '1938',
    tone: '#3fb5a3',
    moments: [
      {
        id: 'teruel',
        title: 'Teruel',
        date: '15 December 1937 – 22 February 1938',
        iso: '1937-12-15',
        kind: 'war',
        place: { name: 'Teruel', x: 536, y: 318 },
        text: 'In a bitter winter, the Republic attacks and captures Teruel, the only provincial capital it takes in the war. Franco throws in his reserves and, after two months of fighting in snow and freezing cold, retakes the city, wrecking the Republic’s best units.',
        facts: [['Result', 'Nationalist victory']],
        photo: {
          alt: 'Soldiers advancing through snow among ruined houses',
          caption: 'Republican troops closing in on Teruel',
        },
        wiki: 'Battle of Teruel',
      },
      {
        id: 'aragon',
        title: 'Franco reaches the sea',
        date: '7 March – 15 April 1938',
        iso: '1938-04-15',
        kind: 'war',
        place: { name: 'Vinaròs', x: 640, y: 312 },
        text: 'Straight after Teruel, Nationalist troops with German and Italian air support break through in Aragon and drive to the Mediterranean, reaching it at Vinaròs. The Republic is cut in two, Catalonia apart from Madrid and Valencia.',
        facts: [['Reached the sea', '15 April 1938']],
        photo: {
          alt: 'A tank on open ground with a fighter plane overhead',
          caption: 'A Republican T-26 tank on the Aragon front',
        },
        wiki: 'Aragon Offensive',
      },
      {
        id: 'barcelona-bombing',
        title: 'Barcelona bombed',
        date: '16–18 March 1938',
        iso: '1938-03-16',
        kind: 'terror',
        place: barcelona,
        text: 'On Mussolini’s orders, Italian bombers based in Majorca raid Barcelona around the clock for three days. Around a thousand civilians are killed, in one of the first sustained bombings of a city, condemned around the world.',
        facts: [
          ['Killed', '1,000–1,300 civilians'],
          ['Attackers', 'Italian Aviazione Legionaria'],
        ],
        photo: {
          alt: 'Aerial view of bomb blasts over a city',
          caption: 'Bombs on Barcelona, 17 March 1938, from an Italian plane',
        },
        wiki: 'Bombing of Barcelona',
      },
      {
        id: 'xyz',
        title: 'The XYZ Line holds',
        date: '18–24 July 1938',
        iso: '1938-07-18',
        kind: 'war',
        place: { name: 'XYZ Line', x: 571, y: 358 },
        text: 'Franco’s push south towards Valencia runs into a deep line of trenches and bunkers in the mountains north of the city. Dug-in Republican troops beat back attack after attack, and Valencia is saved.',
        facts: [['Result', 'Republican defensive victory']],
        photo: {
          alt: 'A crowd of soldiers and townspeople in a village square',
          caption: 'Nationalist troops take Rubielos de Mora, July 1938',
        },
        wiki: 'XYZ Line',
      },
      {
        id: 'ebro',
        title: 'The Battle of the Ebro',
        date: '25 July – 16 November 1938',
        iso: '1938-07-25',
        kind: 'war',
        place: { name: 'River Ebro', x: 640, y: 254 },
        text: 'In a surprise night crossing, the Republican army crosses the Ebro and drives towards Gandesa, hoping to reunite its two halves and hold out until a European war. It becomes the longest and largest battle of the war; after nearly four months under heavy bombing, the Republicans are pushed back across the river, their army spent.',
        facts: [['Result', 'Nationalist victory']],
        photo: {
          alt: 'Gunners beside artillery pieces on a hillside',
          caption: 'A Czechoslovak volunteer artillery battery, 1938',
        },
        wiki: 'Battle of the Ebro',
      },
      {
        id: 'munich',
        title: 'Munich',
        date: '30 September 1938',
        iso: '1938-09-30',
        kind: 'abroad',
        place: { name: 'Munich, Germany' },
        text: 'Britain and France let Hitler take part of Czechoslovakia rather than fight. The Republic’s hope that a wider war would bring it allies collapses, and Stalin begins to scale back his help.',
        facts: [['Signed by', 'Germany, Italy, Britain, France']],
        photo: {
          alt: 'Five men in suits and uniforms standing in a room',
          caption:
            'Chamberlain, Daladier, Hitler, Mussolini and Ciano at Munich',
        },
        wiki: 'Munich Agreement',
      },
      {
        id: 'farewell',
        title: 'The Brigades say goodbye',
        date: '28 October 1938',
        iso: '1938-10-28',
        kind: 'abroad',
        place: barcelona,
        text: 'Hoping to press Germany and Italy into withdrawing their own troops, Prime Minister Negrín sends the International Brigades home. Crowds line Barcelona’s streets for their farewell parade, where Dolores Ibárruri, “La Pasionaria”, tells them: “You are history. You are legend.”',
        facts: [['Announced', '21 September 1938, League of Nations']],
        photo: {
          alt: 'Volunteers raising their hands in an oath',
          caption:
            'Polish volunteers of the Dąbrowski Brigade take an oath before leaving',
        },
        wiki: 'International Brigades',
      },
      {
        id: 'catalonia',
        title: 'The offensive on Catalonia',
        date: '23 December 1938',
        iso: '1938-12-23',
        kind: 'war',
        place: { name: 'Catalonia', x: 713, y: 204 },
        text: 'Two days before Christmas, Franco attacks Catalonia with overwhelming numbers of men, guns and planes. The exhausted Republican army, short of everything after the Ebro, cannot hold; Tarragona falls on 15 January.',
        facts: [
          ['Offensive', '23 December 1938 – 10 February 1939'],
          ['Prisoners', 'about 60,000'],
        ],
        photo: {
          alt: 'Soldiers marching along a country road',
          caption: 'Navarrese troops north of Tarragona, January 1939',
        },
        wiki: 'Catalonia Offensive',
      },
    ],
  },
  {
    id: '1939',
    title: '1939: The end',
    when: '1939',
    tone: '#c85a5a',
    moments: [
      {
        id: 'barcelona-falls',
        title: 'Barcelona falls',
        date: '26 January 1939',
        iso: '1939-01-26',
        kind: 'war',
        place: barcelona,
        text: 'Nationalist troops enter Barcelona almost without a fight as the government flees north towards France. Some residents come out to welcome them; many others have already joined the columns of refugees heading for the border.',
        facts: [['Result', 'Nationalist victory']],
        photo: {
          alt: 'Women cheering in a city street',
          caption: 'Women welcome the Nationalist entry into Barcelona',
        },
        wiki: 'Fall of Barcelona',
      },
      {
        id: 'retirada',
        title: 'La Retirada',
        date: 'January–February 1939',
        iso: '1939-02-05',
        kind: 'exile',
        place: { name: 'French border', x: 794, y: 146 },
        text: 'About half a million Republican soldiers and civilians cross the Pyrenees into France in winter, many on foot. France, unprepared, interns most of them in barbed-wire camps on the beaches.',
        facts: [['Refugees', 'about 500,000']],
        photo: {
          alt: 'A mounted soldier watching a long line of refugees',
          caption: 'Spahis watch a line of refugees, February 1939',
        },
        wiki: 'La Retirada',
      },
      {
        id: 'recognition',
        title: 'Britain and France recognise Franco',
        date: '27 February 1939',
        iso: '1939-02-27',
        kind: 'abroad',
        place: { name: 'London and Paris' },
        text: 'Britain and France recognise Franco’s government, and President Manuel Azaña, already in France, resigns. Prime Minister Negrín still wants to fight on, hoping a European war will come in time.',
        photo: {
          alt: 'Portrait of Manuel Azaña',
          caption: 'Manuel Azaña, 1933',
        },
        wiki: 'Manuel Azaña',
      },
      {
        id: 'casado',
        title: 'The Casado coup',
        date: '5 March 1939',
        iso: '1939-03-05',
        kind: 'politics',
        place: madrid,
        text: 'Colonel Segismundo Casado seizes power in Madrid, ousting Negrín, and forms a National Defence Council to seek peace. Communist units resist, and for a week Republicans fight each other in the city. Franco will accept nothing but unconditional surrender.',
        facts: [['Fighting in Madrid', '5–13 March 1939']],
        photo: {
          alt: 'A group of men in coats walking along a platform',
          caption:
            'Casado (front left) and members of his council reach Britain, April 1939',
        },
        wiki: 'National Defence Council (Spain)',
      },
      {
        id: 'madrid-falls',
        title: 'Madrid surrenders',
        date: '28 March 1939',
        iso: '1939-03-28',
        kind: 'war',
        place: madrid,
        text: 'After almost two and a half years of siege, Madrid surrenders and Nationalist troops march in unopposed. Across what is left of the Republic, the front simply dissolves as soldiers head home or to the ports.',
        facts: [
          ['Final offensive', '26 March – 1 April 1939'],
          ['Prisoners', 'about 150,000'],
        ],
        photo: {
          alt: 'A Madrid street with people walking',
          caption: 'A street in Madrid, early 1939',
        },
        wiki: 'Final offensive of the Spanish Civil War',
      },
      {
        id: 'war-over',
        title: '“The war is over”',
        date: '1 April 1939',
        iso: '1939-04-01',
        kind: 'politics',
        place: burgos,
        text: 'Thousands of Republicans waiting at Alicante for ships that never come are captured. From his headquarters in Burgos, Franco issues his last war report: “Today, with the Red Army captive and disarmed, the Nationalist troops have reached their final objectives. The war is over.” The United States recognises him the same day.',
        facts: [['Franco rules', 'until his death in 1975']],
        photo: {
          alt: 'A handwritten communiqué signed by Franco',
          caption: 'Franco’s last war communiqué, 1 April 1939',
        },
        wiki: 'Spanish Civil War',
      },
    ],
  },
  {
    id: 'after',
    title: 'Aftermath',
    when: '1939–1975',
    tone: '#8a9aa6',
    moments: [
      {
        id: 'repression',
        title: 'The victors’ justice',
        date: 'From April 1939',
        iso: '1939-04-02',
        kind: 'terror',
        text: 'Peace brings no amnesty. Military courts try hundreds of thousands of Republicans; tens of thousands are executed and many more sent to prisons, camps and labour battalions. Many of the dead still lie in unmarked mass graves that Spain has only recently begun to map and open.',
        photo: {
          alt: 'Map of Spain dotted with the locations of mass graves',
          caption: 'The Ministry of Justice’s map of known Civil War graves',
        },
        wiki: 'White Terror (Spain)',
      },
      {
        id: 'camps',
        title: 'The camps in France',
        date: '1939–1940s',
        iso: '1939-04-28',
        kind: 'exile',
        place: { name: 'Argelès-sur-Mer', x: 804, y: 139 },
        text: 'Refugees in France are held in camps such as Argelès-sur-Mer, Saint-Cyprien and Gurs, with little shelter, food or water at first. Many go back to Spain; others emigrate to Mexico and Latin America or join the French army and, later, the Resistance. Spanish Republicans of “La Nueve” are among the first Allied troops into Paris in August 1944.',
        photo: {
          alt: 'Huts and tents crowded on a beach',
          caption: 'The camp at Argelès-sur-Mer, 28 April 1939',
        },
        wiki: 'Gurs internment camp',
      },
      {
        id: 'mauthausen',
        title: 'Spaniards in Mauthausen',
        date: '1940–1945',
        iso: '1940-08-06',
        kind: 'exile',
        place: { name: 'Mauthausen, Austria' },
        text: 'After Germany conquers France, thousands of Spanish Republicans taken prisoner in French uniform or labour companies are sent to the Mauthausen concentration camp in Austria. 4,427 of them die there.',
        facts: [['Spaniards who died there', '4,427']],
        photo: {
          alt: 'Prisoners at forced labour in a quarry',
          caption:
            'Spanish Republican prisoners at forced labour, Mauthausen, 1942',
        },
        wiki: 'Mauthausen concentration camp',
      },
      {
        id: 'val-daran',
        title: 'Invasion of the Val d’Aran',
        date: 'October 1944',
        iso: '1944-10-19',
        kind: 'war',
        place: { name: 'Val d’Aran', x: 661, y: 127 },
        text: 'As the Germans retreat from France, several thousand Republican veterans of the French Resistance cross the Pyrenees into the Val d’Aran, hoping to spark a rising against Franco. None comes, and they are driven back within ten days.',
        photo: {
          alt: 'A tomb with a cross and flowers',
          caption: 'The tomb of guerrillas killed in the invasion, Vielha',
        },
        wiki: "Invasion of Val d'Aran",
      },
      {
        id: 'maquis',
        title: 'The maquis',
        date: '1939–1965',
        iso: '1947-01-01',
        kind: 'war',
        text: 'Bands of guerrillas fight on in the mountains for years after the war, from Galicia and Asturias to Andalusia and Aragon. Hunted by the Civil Guard, with reprisals against the villagers who help them, they dwindle in the 1950s; the last are killed in the 1960s.',
        facts: [['Active', '1939–1965']],
        photo: {
          alt: 'Map of Spain with areas of guerrilla activity shaded',
          caption: 'Where the guerrillas were active',
        },
        wiki: 'Spanish Maquis',
      },
      {
        id: 'dictatorship',
        title: 'Franco’s Spain',
        date: '1939–1975',
        iso: '1975-11-20',
        kind: 'politics',
        text: 'Franco rules as dictator until his death on 20 November 1975, staying out of the Second World War and later allying with the United States. Within a few years Spain is a democracy again; how to remember the war and its dead is still argued over today.',
        facts: [
          ['Franco dies', '20 November 1975'],
          ['New constitution', '1978'],
        ],
        photo: {
          alt: 'A car escorted by mounted guards through a cheering crowd',
          caption:
            'Franco, escorted by his Moorish Guard, in San Sebastián, 1939',
        },
        wiki: 'Francoist Spain',
      },
    ],
  },
]

/**
 * The maps, each shown for moments nearest its date: Commons' "Map of the
 * Spanish Civil War in <from>", the first and last recoloured to show no
 * front.
 */
export const scwMaps = [
  {
    file: 'map-1931',
    iso: '1931-04-14',
    from: 'July 1936',
    label: 'Spain before the war',
  },
  {
    file: 'map-1936-07',
    iso: '1936-07-25',
    from: 'July 1936',
    label: 'Front lines, July 1936',
  },
  {
    file: 'map-1936-09',
    iso: '1936-09-15',
    from: 'September 1936',
    label: 'Front lines, September 1936',
  },
  {
    file: 'map-1937-03',
    iso: '1937-03-15',
    from: 'March 1937',
    label: 'Front lines, March 1937',
  },
  {
    file: 'map-1937-10',
    iso: '1937-10-15',
    from: 'October 1937',
    label: 'Front lines, October 1937',
  },
  {
    file: 'map-1938-07',
    iso: '1938-07-15',
    from: 'July 1938',
    label: 'Front lines, July 1938',
  },
  {
    file: 'map-1939-02',
    iso: '1939-02-15',
    from: 'February 1939',
    label: 'Front lines, February 1939',
  },
  {
    file: 'map-1939-04',
    iso: '1939-04-01',
    from: 'February 1939',
    label: 'Spain after the war',
  },
]

/** Peace-time moments get the plain or all-Nationalist map; others the nearest. */
export function scwMapFor(iso: string) {
  if (iso < '1936-07-17') return scwMaps[0]
  if (iso >= '1939-04-01') return scwMaps.at(-1)!
  const t = Date.parse(iso)
  const war = scwMaps.slice(1, -1)
  return war.reduce((a, b) =>
    Math.abs(Date.parse(b.iso) - t) < Math.abs(Date.parse(a.iso) - t) ? b : a,
  )
}

export interface ScwCredit {
  by: string
  licence: string
  /** Its Wikimedia Commons page. */
  page: string
}

/** Photo credits by moment id, from each file’s Wikimedia Commons page. */
export const scwCredits: Record<string, ScwCredit> = {
  'republic-proclaimed': {
    by: 'Teodoro Andreu, photo by Noulas',
    licence: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Rep%C3%BAblica_Espa%C3%B1ola_1931,_Teodoro_Andreu.jpg',
  },
  constitution: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Cubierta_constitucion1931.jpg',
  },
  sanjurjada: {
    by: 'Unknown author (ABC)',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Sanjurjada_(10_de_agosto_de_1932).jpg',
  },
  'right-wins': {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Jos%C3%A9_Mar%C3%ADa_Gil-Robles_(cropped).jpg',
  },
  asturias: {
    by: 'Illustrated Daily Courier archive',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Column_of_Guardias_Civiles_during_the_1934_Asturian_Revolution,_Bra%C3%B1osera.jpg',
  },
  'popular-front': {
    by: 'Videa',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Madrid,_February_1936_elections.jpg',
  },
  'calvo-sotelo': {
    by: 'Vida Gallega, 1936',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Jos%C3%A9_Calvo_Sotelo,_retrato_en_Vida_Gallega_1936.jpg',
  },
  rising: {
    by: 'Unknown author',
    licence: 'CC0',
    page: 'https://commons.wikimedia.org/wiki/File:Retrato_fotogr%C3%A1fico_del_%C3%B3leo_del_general_Jos%C3%A9_Sanjurjo_Sacanell.jpg',
  },
  seville: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:San_Marco_barricade,_Macarena,_Seville,_1936.jpg',
  },
  'barcelona-rising': {
    by: 'Illustrated Daily Courier archive',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Republican_troops_during_the_July_1936_uprising_in_Barcelona.jpg',
  },
  montana: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Monta%C3%B1a_barracks,_July_1936.jpg',
  },
  airlift: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Moroccan_troops_boarding_Ju-52.jpg',
  },
  revolution: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Milicianas_CNT-FAI.png',
  },
  badajoz: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Women_pleading_with_Rebels_for_Lives_of_Prisioners,_Constantina,_Seville_-_Google_Art_Project.jpg',
  },
  irun: {
    by: 'Unknown author',
    licence: 'CC0',
    page: 'https://commons.wikimedia.org/wiki/File:Republican_forces_during_the_Battle_of_Ir%C3%BAn.jpg',
  },
  'non-intervention': {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Savoia-Marchetti_SM.81.jpg',
  },
  alcazar: {
    by: 'Ahtsgdf',
    licence: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:En_el_patio_del_Alc%C3%A1zar_de_Toledo_septiembre_octubre_1936.jpg',
  },
  caudillo: {
    by: 'Unknown author',
    licence: 'CC0',
    page: 'https://commons.wikimedia.org/wiki/File:Francisco_Franco_posed_portrait_photograph.jpg',
  },
  brigades: {
    by: 'Bundesarchiv, Bild 183-H28510',
    licence: 'CC BY-SA 3.0 de',
    page: 'https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild_183-H28510,_Spanien,_Gefechtsstand_des_Etkar_Andr%C3%A9_Bataillons.jpg',
  },
  madrid: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Children_during_the_Madrid_bombing.jpg',
  },
  paracuellos: {
    by: 'Mr. Tickle',
    licence: 'CC BY 2.5',
    page: 'https://commons.wikimedia.org/wiki/File:20070519_-_Vista_del_cementerio_de_Paracuellos.jpg',
  },
  durruti: {
    by: 'Pablo Luís Torrents',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Durruti_funeral,_Via_Laietana.jpg',
  },
  malaga: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Carretera_M%C3%A1laga_1937.jpg',
  },
  jarama: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Lincoln_Battalion.jpg',
  },
  guadalajara: {
    by: 'Bundesarchiv, Bild 183-2006-1204-510 / H. G. von Studnitz',
    licence: 'CC BY-SA 3.0 de',
    page: 'https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild_183-2006-1204-510,_Spanien,_Schlacht_um_Guadalajara.jpg',
  },
  guernica: {
    by: 'Bundesarchiv, Bild 183-H25224',
    licence: 'CC BY-SA 3.0 de',
    page: 'https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild_183-H25224,_Guernica,_Ruinen.jpg',
  },
  'may-days': {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:POUM_FAI.jpg',
  },
  'basque-children': {
    by: 'Locospotter',
    licence: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Spanish_War_Children_(restored).png',
  },
  mola: {
    by: 'Jalón Ángel',
    licence: 'CC0',
    page: 'https://commons.wikimedia.org/wiki/File:Emilio_Mola_(3x4_cropped).jpg',
  },
  bilbao: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Bilbao_w_trakcie_hiszpa%C5%84skiej_wojny_domowej_(1-E-6825-2).jpg',
  },
  brunete: {
    by: 'PACO and Gamecock',
    licence: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Battle_of_Brunete.png',
  },
  santander: {
    by: "L'irlandés",
    licence: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Nido_de_ametralladoras_de_Piqu%C3%ADo_(Santander).jpg',
  },
  belchite: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:%D0%98%D1%81%D0%BF%D0%B0%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_11_%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B1%D1%80%D0%B8%D0%B3%D0%B0%D0%B4%D0%B0_%D0%B2_%D0%B1%D0%BE%D1%8E_%D0%BF%D0%BE%D0%B4_%D0%91%D0%B5%D0%BB%D1%8C%D1%87%D0%B8%D1%82%D0%B5._1937-edit.jpg',
  },
  gijon: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Destructor_Ciscar_(CR).jpg',
  },
  teruel: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Closing_in_on_trapped_Rebels_at_Teruel_-_Google_Art_Project.jpg',
  },
  aragon: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Bro%C5%84_pancerna_armii_republika%C5%84skiej_(1-E-6728).jpg',
  },
  'barcelona-bombing': {
    by: 'Italian Air Force',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Barcelona_bombing_(1938).jpg',
  },
  xyz: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Rubielos_de_Mora_1938.jpg',
  },
  ebro: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Gottwaldova_d%C4%9Blost%C5%99eleck%C3%A1_baterie.jpg',
  },
  munich: {
    by: 'Bundesarchiv, Bild 183-R69173',
    licence: 'CC BY-SA 3.0 de',
    page: 'https://commons.wikimedia.org/wiki/File:Munich_Agreement_Bundesarchiv_Bild_183-R69173.jpg',
  },
  farewell: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Dabrowszczacy_przysiegaja_wiernosc_sprawie_Republiki.jpg',
  },
  catalonia: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Navarrese_north_of_Tarragona.jpg',
  },
  'barcelona-falls': {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Females_celebrate_Nationalist_entry_to_Barcelona,_Jan_1939.jpg',
  },
  retirada: {
    by: 'Auguste Chauvin',
    licence: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:22NUM27FI73_(Les_spahis_surveillent_la_file_des_r%C3%A9fugi%C3%A9s.).jpg',
  },
  recognition: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Manuel_Aza%C3%B1a,_1933.jpg',
  },
  casado: {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Los_l%C3%ADderes_del_Consejo_Nacional_de_Defensa_a_su_llegada_al_Reino_Unido.jpg',
  },
  'madrid-falls': {
    by: 'Unknown author',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Street_scene_in_Madrid,_early_1939.jpg',
  },
  'war-over': {
    by: 'Francisco Franco',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Spain_final-guerra-civil.jpg',
  },
  repression: {
    by: 'Ministerio de Justicia de España',
    licence: 'CC BY 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Mapadefosas-mjusticia-es.jpg',
  },
  camps: {
    by: 'Auguste Chauvin',
    licence: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:22NUM27FI167_A_Argel%C3%A8s-sur-Mer_(%C2%AB_La_D%C3%A9fense_%C2%BB,_28_avril_1939_)_(vue_g%C3%A9n%C3%A9rale_du_camp,_avec_la_mer_en_arri%C3%A8re-plan.).jpg',
  },
  mauthausen: {
    by: 'Paul Ricken',
    licence: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Spanish_Republican_prisoners_at_Mauthausen.jpg',
  },
  'val-daran': {
    by: 'Panotxa',
    licence: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Tomba_dels_guerrillers_caiguts_a_la_invasi%C3%B3_de_la_Vall_d%27Aran,_Vielha_1944.JPG',
  },
  maquis: {
    by: 'P4K1T0',
    licence: 'CC0',
    page: 'https://commons.wikimedia.org/wiki/File:Mapa_maquis.svg',
  },
  dictatorship: {
    by: 'Pascual Marín',
    licence: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Francisco_Franco_escoltado_por_la_Guardia_Mora_visita_San_Sebasti%C3%A1n_una_vez_finalizada_la_guerra_(8_de_8)_-_Fondo_Mar%C3%ADn-Kutxa_Fototeka.jpg',
  },
}
