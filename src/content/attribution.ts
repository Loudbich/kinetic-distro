/**
 * RECORD CREDITS — hand-maintained overrides.
 * -----------------------------------------------------------------------------
 * `grafenbergmusik` is Kinetic Distro's own SoundCloud account, not the artist
 * Grafenberg's, and it hosts a large part of the catalogue. Crediting a record
 * to whichever profile happens to host it would file most of the roster under
 * Grafenberg, so credits are derived from the label's showcase playlists
 * (`Artist - Title [FULL ALBUM]`) and corrected here where that falls short.
 *
 * Generated once by `node scripts/build-attribution.mjs --write`, then edited
 * by hand. Re-running with --write DISCARDS those edits.
 *
 *   artistSlugs: ['vein-mirror']                 one artist
 *   artistSlugs: ['grafenberg', 'broken-shaman'] a collaboration
 *   artistSlugs: null                            hidden from the site
 *
 * Slugs must match `artists[].slug` in site.ts. An entry here always wins over
 * the automatic credit; a record with no entry keeps whatever the sync worked
 * out, so new releases appear without touching this file.
 * -----------------------------------------------------------------------------
 */

export type SetAttribution = {
  /** SoundCloud set id — stable across renames, unlike the title. */
  id: string;
  /** For humans reading this file; the id is what actually matches. */
  title: string;
  /** null hides the record from the site entirely. */
  artistSlugs: string[] | null;
};

export const setAttributions: SetAttribution[] = [
  {
    // 2026-08-18 · 11 tracks · credited from the showcase
    id: '2285385039',
    title: 'CHROME SYNDICATE DREAMS',
    artistSlugs: ['grafenberg', 'broken-shaman'],
  },
  {
    // 2026-08-18 · 11 tracks · credited from the profile+showcase
    id: '2285377158',
    title: 'Chrome Syndicate Dreams',
    artistSlugs: ['broken-shaman', 'grafenberg'],
  },
  {
    // 2026-08-17 · 12 tracks · credited from the showcase
    id: '2284865199',
    title: 'Electric Lotus Dreams',
    artistSlugs: ['anatolian-mirage'],
  },
  {
    // 2026-08-03 · 10 tracks · credited from the showcase
    id: '2278046102',
    title: 'The Eastern skylight tapes',
    artistSlugs: ['grafenberg'],
  },
  {
    // 2026-07-30 · 10 tracks · credited from the showcase
    id: '2276067293',
    title: 'Gilded Rituals',
    artistSlugs: ['love-cult'],
  },
  {
    // 2026-07-27 · 12 tracks · credited from the showcase
    id: '2274549347',
    title: 'BLACK CHROME REANIMATIONS',
    artistSlugs: ['chromabone'],
  },
  {
    // 2026-07-27 · 11 tracks · credited from the showcase
    id: '2274539654',
    title: 'Memory Flowers',
    artistSlugs: ['hollow-static'],
  },
  {
    // 2026-07-24 · 54 tracks · NO CREDIT FOUND — decide by hand
    id: '2273020805',
    title: 'Kinetic Distro Essentials Vol. I',
    // decided by hand: label compilation - a way in to the whole roster, by no single artist
    artistSlugs: [],
  },
  {
    // 2026-07-24 · 10 tracks · credited from the showcase
    id: '2272990337',
    title: 'The touch era',
    artistSlugs: ['nosfera-disco-club'],
  },
  {
    // 2026-07-16 · 10 tracks · credited from the showcase
    id: '2268778409',
    title: 'After the impact',
    artistSlugs: ['chromabone', 'broken-shaman'],
  },
  {
    // 2026-07-16 · 10 tracks · credited from the profile+showcase
    id: '2268778397',
    title: 'After the impact',
    artistSlugs: ['broken-shaman', 'chromabone'],
  },
  {
    // 2026-07-14 · 10 tracks · credited from the showcase
    id: '2267767475',
    title: 'The Hush Beneath the Static [Kinetic Resonance Remaster]',
    artistSlugs: ['vein-mirror'],
  },
  {
    // 2026-07-08 · 2 tracks · credited from the title
    id: '2265085661',
    title: 'Piano in the snow (Chromabone Remixes)',
    // decided by hand: a Chromabone remix - credited to Chromabone, not the source artist
    artistSlugs: ['chromabone'],
  },
  {
    // 2026-07-08 · 10 tracks · credited from the profile
    id: '2264956823',
    title: 'A Choir For The Ones Who Disappeared',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-06-27 · 10 tracks · credited from the profile
    id: '2259495761',
    title: 'Primordial transmission',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-06-25 · 10 tracks · credited from the title
    id: '2258698208',
    title: 'Where the center collapse',
    // decided by hand: hidden: same record as 'Where the Centers Collapse', published twice
    artistSlugs: null,
  },
  {
    // 2026-06-25 · 10 tracks · NO CREDIT FOUND — decide by hand
    id: '2258697887',
    title: 'Where the Centers Collapse',
    // decided by hand: kept: the album, correctly titled, at the clean permalink
    artistSlugs: ['vein-mirror'],
  },
  {
    // 2026-06-22 · 11 tracks · credited from the profile
    id: '2256819041',
    title: 'Tha last disco preacher',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-06-19 · 10 tracks · credited from the showcase
    id: '2253818876',
    title: 'Necropolis Nocturna',
    artistSlugs: ['nosfera-disco-club'],
  },
  {
    // 2026-06-16 · 3 tracks · NO CREDIT FOUND — decide by hand
    id: '2254020032',
    title: 'The Night That Ate The Stars [Chromabone Remixes]',
    // decided by hand: a Chromabone remix - credited to Chromabone, not the source artist
    artistSlugs: ['chromabone'],
  },
  {
    // 2026-06-13 · 11 tracks · credited from the showcase
    id: '2252355512',
    title: 'Parallel sin theory',
    artistSlugs: ['grafenberg'],
  },
  {
    // 2026-06-12 · 10 tracks · credited from the profile
    id: '2252162957',
    title: 'We don\'t fade',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-06-04 · 10 tracks · credited from the showcase
    id: '2247789899',
    title: 'RELICS FROM ANOTHER EARTH - VOL. 2',
    artistSlugs: ['chromabone'],
  },
  {
    // 2026-05-27 · 11 tracks · credited from the showcase
    id: '2243641103',
    title: 'THE WOUNDS OF TOMORROW',
    artistSlugs: ['grafenberg'],
  },
  {
    // 2026-05-24 · 10 tracks · credited from the showcase
    id: '2241798845',
    title: 'DANCE LIKE YOU SURVIVED',
    artistSlugs: ['chromabone', 'broken-shaman'],
  },
  {
    // 2026-05-24 · 10 tracks · credited from the profile+showcase
    id: '2241798827',
    title: 'DANCE LIKE YOU SURVIVED',
    artistSlugs: ['broken-shaman', 'chromabone'],
  },
  {
    // 2026-05-22 · 6 tracks · credited from the showcase
    id: '2241072377',
    title: 'Teopolis Recoded EP',
    artistSlugs: ['grafenberg'],
  },
  {
    // 2026-05-21 · 10 tracks · credited from the showcase
    id: '2240592305',
    title: 'Relics from Another Earth vol.I',
    artistSlugs: ['chromabone'],
  },
  {
    // 2026-05-21 · 10 tracks · credited from the showcase
    id: '2240563637',
    title: 'Love and venom taste the same : Evolved',
    artistSlugs: ['vein-mirror'],
  },
  {
    // 2026-05-21 · 10 tracks · credited from the profile
    id: '2240699321',
    title: 'Time Leaks Through Hands',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-05-07 · 10 tracks · credited from the showcase
    id: '2233691414',
    title: 'In Memory of What Never Was',
    artistSlugs: ['vein-mirror'],
  },
  {
    // 2026-05-07 · 10 tracks · credited from the profile+showcase
    id: '2233386932',
    title: 'Lost Transmissions',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-04-30 · 10 tracks · credited from the showcase
    id: '2229917573',
    title: 'Ghost Frequencies for Lost Machines',
    artistSlugs: ['grafenberg'],
  },
  {
    // 2026-04-29 · 12 tracks · credited from the showcase
    id: '2229614282',
    title: 'Serpent Cosmopolis',
    artistSlugs: ['anatolian-mirage'],
  },
  {
    // 2026-04-29 · 10 tracks · credited from the profile+showcase
    id: '2229669821',
    title: 'Signals From a Burning Planet',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-04-24 · 10 tracks · credited from the showcase
    id: '2227018907',
    title: 'The Mirror Era',
    artistSlugs: ['nosfera-disco-club'],
  },
  {
    // 2026-04-18 · 10 tracks · credited from the showcase
    id: '2224344200',
    title: 'No Saints, No Proof revisited',
    artistSlugs: ['chromabone'],
  },
  {
    // 2026-04-18 · 10 tracks · credited from the showcase
    id: '2224039148',
    title: 'Die with style VOL.2',
    artistSlugs: ['unmade-scores'],
  },
  {
    // 2026-04-18 · 0 tracks · credited from the showcase
    id: '2224019063',
    title: 'Love and venom taste the same',
    artistSlugs: ['vein-mirror'],
  },
  {
    // 2026-04-18 · 0 tracks · credited from the showcase
    id: '2224013906',
    title: 'Solar Bazaar Rituals',
    artistSlugs: ['anatolian-mirage'],
  },
  {
    // 2026-04-18 · 10 tracks · credited from the showcase
    id: '2224002737',
    title: 'The halo corruption protocol',
    artistSlugs: ['grafenberg'],
  },
  {
    // 2026-04-16 · 10 tracks · credited from the profile
    id: '2223101135',
    title: 'Cold Calculus',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-04-09 · 12 tracks · credited from the profile
    id: '2219293229',
    title: 'Microtonic oasis collapse',
    artistSlugs: ['anatolian-mirage'],
  },
  {
    // 2026-04-09 · 10 tracks · credited from the profile
    id: '2219681087',
    title: 'Zero Cathedral',
    artistSlugs: ['vein-mirror'],
  },
  {
    // 2026-04-01 · 10 tracks · credited from the showcase
    id: '2215500449',
    title: 'AFTERIMAGE',
    artistSlugs: ['grafenberg', 'broken-shaman'],
  },
  {
    // 2026-04-01 · 10 tracks · credited from the profile+showcase
    id: '2215500548',
    title: 'AFTERIMAGE',
    artistSlugs: ['broken-shaman', 'grafenberg'],
  },
  {
    // 2026-04-01 · 9 tracks · credited from the profile
    id: '2215328573',
    title: 'Black Discipline',
    artistSlugs: ['iron-covenant'],
  },
  {
    // 2026-03-31 · 8 tracks · credited from the profile+showcase
    id: '2214702557',
    title: 'Slow burn dancing',
    artistSlugs: ['lykke'],
  },
  {
    // 2026-03-24 · 8 tracks · credited from the profile+showcase
    id: '2211127622',
    title: 'Cathedrals of Noise',
    artistSlugs: ['iron-covenant'],
  },
  {
    // 2026-03-19 · 8 tracks · credited from the profile+showcase
    id: '2208616985',
    title: 'Ashes & Wires',
    artistSlugs: ['iron-covenant'],
  },
  {
    // 2026-03-18 · 10 tracks · credited from the profile
    id: '2208297173',
    title: 'Velvet Predator',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-03-18 · 5 tracks · credited from the profile+showcase
    id: '2207856089',
    title: 'Forged in concrete',
    artistSlugs: ['iron-covenant'],
  },
  {
    // 2026-03-18 · 10 tracks · credited from the profile
    id: '2208135908',
    title: 'Veins of Light, Veins of Rust',
    artistSlugs: ['vein-mirror'],
  },
  {
    // 2026-03-05 · 11 tracks · credited from the profile+showcase
    id: '2201748836',
    title: 'No armor',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-03-05 · 12 tracks · credited from the profile
    id: '2201414639',
    title: 'Velvet sun empire',
    artistSlugs: ['anatolian-mirage'],
  },
  {
    // 2026-02-26 · 10 tracks · credited from the profile+showcase
    id: '2197824665',
    title: 'Iron Monk Execution',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-02-20 · 10 tracks · credited from the profile+showcase
    id: '2194392311',
    title: 'You were born ready',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-02-20 · 8 tracks · credited from the profile+showcase
    id: '2194366568',
    title: 'Shadows in motion',
    artistSlugs: ['lykke'],
  },
  {
    // 2026-02-17 · 10 tracks · credited from the profile
    id: '2193091826',
    title: 'Die with style (volume II)',
    artistSlugs: ['unmade-scores'],
  },
  {
    // 2026-02-15 · 10 tracks · credited from the profile+showcase
    id: '2191826207',
    title: 'Songs for standing back up',
    artistSlugs: ['unmade-scores'],
  },
  {
    // 2026-02-14 · 8 tracks · credited from the profile+showcase
    id: '2191669898',
    title: 'After the feed',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-02-10 · 0 tracks · credited from the profile+showcase
    id: '2189421362',
    title: 'The Hush Beneath The Static',
    artistSlugs: ['vein-mirror'],
  },
  {
    // 2026-02-09 · 10 tracks · credited from the profile+showcase
    id: '2188839578',
    title: 'Fire & Ice',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-02-06 · 13 tracks · credited from the profile+showcase
    id: '2187183308',
    title: 'The ghouls of midnight',
    artistSlugs: ['nosfera-disco-club'],
  },
  {
    // 2026-02-01 · 9 tracks · credited from the profile+showcase
    id: '2184275999',
    title: 'Dirt Temple',
    artistSlugs: ['broken-shaman'],
  },
  {
    // 2026-01-30 · 8 tracks · credited from the profile+showcase
    id: '2183108693',
    title: 'Northern Lights',
    artistSlugs: ['lykke'],
  },
  {
    // 2026-01-30 · 11 tracks · credited from the profile+showcase
    id: '2183144897',
    title: 'Die with style',
    artistSlugs: ['unmade-scores'],
  },
  {
    // 2026-01-25 · 11 tracks · credited from the showcase
    id: '2180509844',
    title: 'Erebion\'s dominion',
    artistSlugs: ['grafenberg'],
  },
  {
    // 2026-01-20 · 25 tracks · credited from the showcase
    id: '2177951426',
    title: 'Visions',
    artistSlugs: ['grafenberg'],
  },
  {
    // 2026-01-08 · 10 tracks · credited from the profile+showcase
    id: '2171365244',
    title: 'Red veins on the dancefloor',
    artistSlugs: ['nosfera-disco-club'],
  },
  {
    // 2025-12-13 · 10 tracks · credited from the showcase
    id: '2152862006',
    title: 'The error gospel',
    artistSlugs: ['grafenberg'],
  },
  {
    // 2025-09-03 · 10 tracks · credited from the showcase
    id: '2075448189',
    title: 'No Saints, No Proof',
    artistSlugs: ['grafenberg'],
  },
  {
    // 2025-08-30 · 2 tracks · NO CREDIT FOUND — decide by hand
    id: '2073582450',
    title: 'Chaos, I bleed Ep',
    // decided by hand: a Grafenberg EP
    artistSlugs: ['grafenberg'],
  },
];

const byId = new Map(setAttributions.map((a) => [a.id, a] as const));

/** undefined = no opinion, keep the synced credit; null = hide the record. */
export const attributionFor = (id: string): string[] | null | undefined =>
  byId.has(id) ? byId.get(id)!.artistSlugs : undefined;
