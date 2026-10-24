import type { Portrait } from './characterPortraits'

/**
 * Art set into a part of a character's page, as the Coppermind does, with a
 * caption. Credited and dated like portraits (see characterPortraits): by
 * the latest thing it, its alt text or its caption shows.
 */
export interface Figure extends Portrait {
  caption: string
}

/**
 * Figures by page id, then by the part they illustrate: `<part>/<key>`,
 * where the part is `description`, `abilities`, `history` or
 * `relationships`, and the key is the section's first title as written in
 * its story (`Appearance` and `Personality` for those Description parts).
 * A section shows every figure the reader may see, in this order.
 */
export const characterFigures: Record<string, Record<string, Figure[]>> = {
  'shallan-davar': {
    'description/Veil': [
      {
        // Veil's white hat and coat; shown once Veil is out and about in Urithiru.
        src: '/figures/shallan-davar-veil.webp',
        caption: 'Veil',
        alt: 'Veil, a darkeyed woman in a white hat and a white coat buttoned to the collar',
        artist: 'LittleGreyDragon',
        artistUrl:
          'https://coppermind.net/wiki/Coppermind:Artists/LittleGreyDragon',
        revealedIn: [{ book: 'oathbringer', chapter: '13' }],
      },
    ],
    'description/Radiant': [
      {
        // Radiant as a blonde swordswoman, as she sees herself by RoW.
        src: '/figures/shallan-davar-radiant.webp',
        caption: 'Shallan between Veil and Radiant',
        alt: 'Shallan in a blue havah between Veil, in a white hat and coat, and a tall blonde Radiant holding a Shardblade',
        artist: 'Katie Payne',
        artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Katie_Payne',
        revealedIn: [{ book: 'rhythm-of-war', chapter: '20' }],
      },
    ],
    'abilities/Shardplate': [
      {
        // Official WaT interior art; Plate and Testament as a Blade both come in WaT 13.
        src: '/figures/shallan-davar-sketchbook.webp',
        caption:
          "Shallan's sketchbook: her Shardplate, with Pattern and Testament as Blades",
        alt: 'A sketchbook page of a suit of Shardplate beside two Shardblades, one curling and ornate, with handwritten notes about adding a cape',
        artist: 'Ben McSweeney',
        artistUrl:
          'https://coppermind.net/wiki/Coppermind:Artists/Ben_McSweeney',
        revealedIn: [{ book: 'wind-and-truth', chapter: '13' }],
      },
    ],
    'history/Petitioning Jasnah Kholin': [
      {
        // Official GraphicAudio cover; she studies in the Palanaeum from WoK 7-8.
        src: '/figures/shallan-davar-palanaeum.webp',
        caption: 'Shallan in the Palanaeum',
        alt: "Shallan, red-haired, holding a book among the Palanaeum's shelves",
        artist: 'Alex Allen',
        artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Alex_Allen',
        revealedIn: [{ book: 'way-of-kings', chapter: '8' }],
      },
    ],
    'history/Heart of a thief': [
      {
        // Kabsal brings bread and jam for a picnic in WoK 42.
        src: '/figures/shallan-davar-picnic.webp',
        caption: "Shallan and Kabsal's picnic",
        alt: 'Shallan and the ardent Kabsal sharing bread and jam on a picnic among plants',
        artist: 'Marie Seeberger',
        artistUrl:
          'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
        revealedIn: [{ book: 'way-of-kings', chapter: '42' }],
      },
    ],
    'history/Questions and answers': [
      {
        // The symbolheads follow her in Kharbranth; no Cryptic name in the text, as that's a WoR reveal.
        src: '/figures/shallan-davar-cryptics.webp',
        caption: 'Shallan fleeing the symbol-headed figures',
        alt: 'Shallan running past a fire, clutching her sketches, a glowing figure with a symbol for a head behind her',
        artist: 'Petar Penev',
        artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Petar_Penev',
        revealedIn: [{ book: 'way-of-kings', chapter: '45' }],
      },
    ],
    'history/Cutting the thorns': [
      {
        // Her brothers, Helaran among them, in the WoR flashbacks from chapter 19.
        src: '/figures/shallan-davar-siblings.webp',
        caption: 'The Davar siblings',
        alt: 'Shallan, young, sitting with her four brothers and an axehound',
        artist: 'Marie Seeberger',
        artistUrl:
          'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
        revealedIn: [{ book: 'words-of-radiance', chapter: '19' }],
      },
    ],
    "history/The Wind's Pleasure": [
      {
        // She is lowered to see the santhid in WoR 1.
        src: '/figures/shallan-davar-santhid.webp',
        caption: 'Shallan meeting the santhid',
        alt: "Shallan, lowered over a ship's side, face to face with a huge santhid under the water",
        artist: 'Ashley Coad',
        artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ashley_Coad',
        revealedIn: [{ book: 'words-of-radiance', chapter: '1' }],
      },
    ],
    'history/Lost in the chasms': [
      {
        // Lost in the chasms with Kaladin, WoR 68-75; before the chasmfiend.
        src: '/figures/shallan-davar-chasms.webp',
        caption: 'Kaladin and Shallan in the chasms',
        alt: 'Kaladin with a spear and Shallan in a blue havah in a dark chasm, a Cryptic pattern on her skirt',
        artist: 'Ralf Melevo',
        artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Ralf_Melevo',
        revealedIn: [{ book: 'words-of-radiance', chapter: '71' }],
      },
    ],
    'history/The march to Narak': [
      {
        // She activates the Oathgate during the Battle of Narak, WoR 86.
        src: '/figures/shallan-davar-oathgate.webp',
        caption: 'Shallan opening the Oathgate',
        alt: 'Shallan, with Adolin, at the glowing heart of the Oathgate on the Shattered Plains',
        artist: 'pekgna',
        artistUrl:
          'https://coppermind.net/wiki/File:Shallan_activating_the_Stormseat_Oathgate_by_pekgna.png',
        revealedIn: [{ book: 'words-of-radiance', chapter: '86' }],
      },
    ],
    "history/Hunting the tower's killer": [
      {
        // The confrontation is OB 29-31; named the Midnight Mother by OB 32.
        src: '/figures/shallan-davar-midnight-mother.webp',
        caption: 'Shallan facing the Midnight Mother',
        alt: "Shallan's light against a mass of dark, shifting shapes deep beneath Urithiru",
        artist: 'Petar Penev',
        artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Petar_Penev',
        revealedIn: [{ book: 'oathbringer', chapter: '32' }],
      },
    ],
    'history/Siege of Kholinar': [
      {
        // Wit's Mishim story in OB 74.
        src: '/figures/shallan-davar-mishim.webp',
        caption: 'Wit telling the tale of Mishim',
        alt: 'Shallan, cloaked, watching Wit perform for a crowd in a ruined street at night',
        artist: 'Casta',
        artistUrl: 'https://coppermind.net/wiki/Coppermind:Artists/Casta',
        revealedIn: [{ book: 'oathbringer', chapter: '74' }],
      },
    ],
    'history/Journey through Shadesmar': [
      {
        // The group sails with Ico's crew in OB 99-102.
        src: '/figures/shallan-davar-honors-path.webp',
        caption: 'Aboard ship in Shadesmar',
        alt: "Shallan, Adolin, Kaladin and their spren on a ship's deck under Shadesmar's strange sky",
        artist: 'Marie Seeberger',
        artistUrl:
          'https://coppermind.net/wiki/Coppermind:Artists/Marie_Seeberger',
        revealedIn: [{ book: 'oathbringer', chapter: '102' }],
      },
    ],
    'history/Lasting Integrity': [
      {
        // Adolin brings Shallan and Pattern into the fortress at the end of RoW 36.
        src: '/figures/shallan-davar-lasting-integrity.webp',
        caption: 'Inside Lasting Integrity',
        alt: 'Shallan and Pattern among honorspren inside the fortress of Lasting Integrity',
        artist: 'Connor Chamberlain',
        artistUrl:
          'https://coppermind.net/wiki/Coppermind:Artists/Connor_Chamberlain',
        revealedIn: [{ book: 'rhythm-of-war', chapter: '36' }],
      },
    ],
    'relationships/Adolin Kholin': [
      {
        // The wedding, OB 122.
        src: '/figures/shallan-davar-wedding.webp',
        caption: 'Shallan on her wedding day',
        alt: 'Shallan in an ornate headdress, looking into a mirror',
        artist: 'Starling Illu',
        artistUrl:
          'https://coppermind.net/wiki/Coppermind:Artists/Starling_Illu',
        revealedIn: [{ book: 'oathbringer', chapter: '122' }],
      },
    ],
    'relationships/Wit': [
      {
        // The hug on the Shattered Plains, WoR 55.
        src: '/figures/shallan-davar-wit.webp',
        caption: 'Shallan hugging Wit',
        alt: 'Shallan hugging a startled Wit',
        artist: 'ToastSamurai',
        artistUrl:
          'https://coppermind.net/wiki/Coppermind:Artists/ToastSamurai',
        revealedIn: [{ book: 'words-of-radiance', chapter: '55' }],
      },
    ],
  },
}
