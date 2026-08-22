/**
 * KINETIC DISTRO — SITE CONTENT
 * -----------------------------------------------------------------------------
 * Single source of truth. Edit this file to update the whole site.
 * No component needs to be touched to add an artist, a release or a link.
 * -----------------------------------------------------------------------------
 */

import { portraits } from './covers.generated.json';

export const site = {
  name: 'Kinetic Distro',
  tagline: 'Independent label & creative distribution',
  domain: 'www.kinetic-distro.com',
  location: 'France',
  founded: '2024',
  email: 'contact@kinetic-distro.com',
  demoEmail: 'demos@kinetic-distro.com',
  pressEmail: 'press@kinetic-distro.com',
  shortDescription:
    'An independent music label and creative distribution platform dedicated to pushing the boundaries of sound, identity and artistic storytelling in the digital age.',
  manifestoLines: [
    'We work at the intersection of genres, cultures and eras.',
    'Every artist on this roster carries a complete world — not a track, a universe.',
    'We build the frame. The artist owns the picture.',
  ],
  links: {
    bandcamp: 'https://kineticdistro.bandcamp.com',
    soundcloud: 'https://soundcloud.com/grafenbergmusik',
    instagram: '#',
    youtube: '#',
    spotify: '#',
  },
} as const;

/* -------------------------------------------------------------------------- */
/* ARTISTS                                                                     */
/* -------------------------------------------------------------------------- */

export type Artist = {
  slug: string;
  name: string;
  accent: string;
  genre: string;
  origin: string;
  since: string;
  tagline: string;
  bio: string[];
  traits: string[];
  links: { label: string; href: string }[];
  featured?: boolean;
  /** Optional: e.g. "/artists/grafenberg.jpg" placed in /public/artists. */
  image?: string;
};

const roster: Artist[] = [
  {
    slug: 'grafenberg',
    name: 'Grafenberg',
    accent: '#FF2E4D',
    genre: 'Dark synthwave / Darkwave',
    origin: 'France',
    since: '2024',
    tagline: 'Neon-noir electronics for empty motorways.',
    bio: [
      'Grafenberg builds cinematic dark synthwave: analogue arpeggios, corroded drum machines and a low-slung sense of dread that never resolves.',
      'The project moves between retro-futurist nostalgia and something colder and more contemporary — a soundtrack for a film that was never shot.',
      'The album No Saints, No Proof anchors the catalogue; The Eastern Skylight Tapes pushes the palette further into tape saturation and long-form drift.',
    ],
    traits: ['Analogue synthesis', 'Cinematic structure', 'Neon-noir imagery'],
    links: [
      { label: 'Official site', href: 'https://grafenberg.ovh' },
      { label: 'SoundCloud', href: 'https://soundcloud.com/grafenbergmusik' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
    featured: true,
  },
  {
    slug: 'broken-shaman',
    name: 'Broken Shaman',
    accent: '#D6A419',
    genre: 'Ritual electronics / Industrial',
    origin: 'Chicago, US',
    since: '2024',
    tagline: 'The ritual never ended. It only changed form.',
    bio: [
      'Broken Shaman works in the space where ritual replaces meaning. Groove is used as pressure, voice as initiation, silence as law.',
      'Nothing is explained. Everything is felt. This is music for bodies before belief, for desire before language, for those who listen after the signal is gone.',
    ],
    traits: ['Groove as pressure', 'Voice as initiation', 'Silence as law'],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/broken_shaman' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
    featured: true,
  },
  {
    slug: 'chromabone',
    name: 'Chromabone',
    accent: '#8FDCFF',
    genre: 'Techno / Remix architecture',
    origin: 'Emerged from Nosfera Disco Club',
    since: '2025',
    tagline: 'Cold metal, high polish, no mercy.',
    bio: [
      'Chromabone is the label’s reconstruction unit — a techno alias born inside the Nosfera Disco Club universe, stripping tracks to their skeleton and rebuilding them in chrome.',
      'Black Chrome Reanimations collects that method into a single body of work: familiar shapes, unfamiliar surfaces.',
      'The project has no profile of its own by design. It surfaces through Kinetic Distro and Nosfera Disco Club — a process, not a person.',
    ],
    traits: ['Remix architecture', 'Club-weight low end', 'Metallic sound design'],
    links: [
      { label: 'Nosfera Disco Club', href: 'https://soundcloud.com/nosfera_disco_club' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
    featured: true,
  },
  {
    slug: 'nosfera-disco-club',
    name: 'Nosfera Disco Club',
    accent: '#B975FF',
    genre: 'Dark disco / Italo',
    origin: 'After midnight',
    since: '2025',
    tagline: 'Too funky to be dead. Too dead to be innocent.',
    bio: [
      'Dark disco for the undead. We dance after midnight, after morals, after pulse checks.',
      'Neon lights, velvet fangs, sticky floors. Come dancing. Stay undead.',
      'The club is also where Chromabone was first sighted — Night of the Chromabones is the origin story.',
    ],
    traits: ['Italo arpeggios', 'Gothic glamour', 'Peak-time grooves'],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/nosfera_disco_club' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
  },
  {
    slug: 'vein-mirror',
    name: 'VEIN//Mirror',
    accent: '#19E3A5',
    genre: 'Dark pop / Cinematic ritual',
    origin: 'Detroit, US',
    since: '2025',
    tagline: 'Where desire turns toxic and beauty becomes dangerous.',
    bio: [
      'VEIN//MIRROR is a dark, sensual and cinematic ritual of sound. Born at the intersection of analog warmth and poetic violence, the project explores the fragile space where desire turns toxic and beauty becomes dangerous.',
      'Hypnotic rhythms, melancholic guitars, synthesizer textures and intimate vocals build immersive soundscapes that stay close to the ear.',
      'The debut album Love and Venom Taste the Same is the project’s first full statement.',
    ],
    traits: ['Analog warmth', 'Poetic violence', 'Intimate vocals'],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/vein-mirror' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
  },
  {
    slug: 'iron-covenant',
    name: 'Iron Covenant',
    accent: '#A7B2BE',
    genre: 'Thrash metal / East Coast',
    origin: 'New York, US',
    since: '2025',
    tagline: 'The Big Four were never four.',
    bio: [
      'Forged on the industrial East Coast, somewhere between rusted docks and dim basement clubs, Iron Covenant emerged in the early 80s with a paradoxical identity: East Coast attitude, West Coast precision.',
      'Technical precision welded to raw energy — and a lineup that has barely moved in three decades.',
      'Jack “Razor” Haldane (vocals, rhythm guitar), Ethan Cross (lead guitar), Marko Vega (bass), Caleb North (drums).',
    ],
    traits: ['Technical precision', 'Raw East Coast energy', 'Three-decade lineup'],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/iron_covenant' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
  },
  {
    slug: 'anatolian-mirage',
    name: 'Anatolian Mirage',
    accent: '#F5A524',
    genre: 'Psychedelic / Microtonal',
    origin: 'Istanbul, TR',
    since: '2025',
    tagline: 'Ancient myths. Modern voltage. Endless coil.',
    bio: [
      'From Istanbul’s shadows to digital temples, Anatolian Mirage bends time through microtonal groove.',
      'Saz-shaped melodies, heavy fuzz and hypnotic repetition, folded into electronics that never sound like tourism.',
      'Electric Lotus Dreams is the project’s first full statement.',
    ],
    traits: ['Microtonal groove', 'Psych fuzz', 'Hypnotic repetition'],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/anatolian_mirage' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
    featured: true,
  },
  {
    slug: 'lykke',
    name: 'Lykke',
    accent: '#FF7BB0',
    genre: 'Scandinavian pop',
    origin: 'Scandinavia',
    since: '1978',
    tagline: 'Light, silence and memory.',
    bio: [
      'Scandinavian pop. Light, silence and memory. Formed in 1978.',
      'Spacious arrangements, restraint used as a compositional tool, and songwriting that leaves room to breathe.',
      'The human centre of the roster — a reminder that narrative-driven music does not have to be cold.',
    ],
    traits: ['Restraint', 'Spacious arrangements', 'Memory as subject'],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/lykke-657587232' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
  },
  {
    slug: 'unmade-scores',
    name: 'Unmade Scores',
    accent: '#C9B896',
    genre: 'Cinematic / Score',
    origin: 'Los Angeles, US',
    since: '2026',
    tagline: 'Music for films that never existed.',
    bio: [
      'Unmade Scores writes soundtracks for pictures that were never shot — each piece credited to a character who never appeared on screen.',
      'Magnolia Voss, Elara Nocturne, Julian Ash, Vivienne Red: the cast list is the tracklist, and every title reads like a line of dialogue.',
      'A conceptual score project that treats the absent film as the real subject.',
    ],
    traits: ['Fictional credits', 'Score writing', 'Narrative conceit'],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/unmade_scores' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
    featured: true,
  },
  {
    slug: 'hollow-static',
    name: 'Hollow Static',
    accent: '#7C9EE0',
    genre: 'Dream pop / Post-human soul',
    origin: 'Reconstructed',
    since: '2026',
    tagline: 'The last human band, rebuilt from corrupted memories.',
    bio: [
      'A spectral presence built from damaged recordings, lost emotions and memories that may never have belonged to anyone.',
      'Formed by Elias Venn, Mara Eidolon and Silas Grey, Hollow Static exists somewhere between a human band and its digital reconstruction. Dream pop, cinematic trip-hop, shoegaze, ambient electronica and post-human soul dissolve into one another.',
      'The debut album Memory Flowers imagines an artificial consciousness searching the remains of a vanished civilisation, trying to understand love, grief and freedom from incomplete archives. Produced by Grafenberg.',
    ],
    traits: ['Corrupted archives', 'Granular voices', 'Orchestral decay'],
    // No SoundCloud profile of its own — the record lives on the label account,
    // and its credit comes from the showcase-playlist convention.
    links: [{ label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' }],
  },
  {
    slug: 'love-cult',
    name: 'Love Cult',
    accent: '#E8455F',
    genre: 'Ritual pop / Drone',
    origin: 'France',
    since: '2025',
    tagline: 'Devotion recorded at close range.',
    bio: [
      'Love Cult works in gilded, hymn-like repetition — drone beds, layered voices and a devotional tone that never tips into parody.',
      'Gilded Rituals is the project’s first full-length for the label.',
    ],
    traits: ['Layered vocals', 'Drone beds', 'Devotional repetition'],
    links: [{ label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' }],
  },
];

/**
 * Portraits dropped in assets/artists/ are attached here rather than typed into
 * every entry by hand, so adding a photo is a file copy and nothing else. An
 * `image` written explicitly above still wins.
 */
export const artists: Artist[] = roster.map((a) => ({
  ...a,
  image: a.image ?? (portraits as Record<string, string>)[a.slug],
}));

export const getArtist = (slug: string) => artists.find((a) => a.slug === slug);

/* -------------------------------------------------------------------------- */
/* RELEASES                                                                    */
/* -------------------------------------------------------------------------- */

export type Release = {
  slug: string;
  catalog: string;
  title: string;
  artistSlugs: string[];
  artistDisplay: string;
  date: string; // ISO
  format: string;
  type: 'Album' | 'EP' | 'Single' | 'Compilation' | 'Remix album';
  blurb: string;
  tracklist?: string[];
  listenUrl: string;
  featured?: boolean;
  /** Optional: drop a file in /public/covers and reference it, e.g. "/covers/kd-006.jpg".
   *  If omitted, a generative cover is rendered from the catalogue number. */
  image?: string;
};

export const releases: Release[] = [
  {
    slug: 'chrome-syndicate-dreams',
    catalog: 'KD-007',
    title: 'Chrome Syndicate Dreams',
    artistSlugs: ['grafenberg', 'broken-shaman'],
    artistDisplay: 'Grafenberg × Broken Shaman',
    date: '2026-08-18',
    format: 'Digital · 10 tracks',
    type: 'Album',
    blurb:
      'A full collaboration between the label’s two founding projects. Grafenberg’s neon-noir synthesis meets Broken Shaman’s ritual percussion across ten tracks of chrome, surveillance and static.',
    tracklist: [
      'Data Seduction',
      'Chrome Pulse',
      'Boot Sequence',
      'Surveillance Bloom',
      'Ghost Interface (feat. Jack Razor Haldane)',
      'Firewall Kiss',
      'Black Market Heartware',
      'Neural Overdrive',
      'Switch//ON',
      'Last Transmission',
    ],
    listenUrl: 'https://soundcloud.com/broken_shaman',
    featured: true,
  },
  {
    slug: 'electric-lotus-dreams',
    catalog: 'KD-006',
    title: 'Electric Lotus Dreams',
    artistSlugs: ['anatolian-mirage'],
    artistDisplay: 'Anatolian Mirage',
    date: '2026-08-17',
    format: 'Digital · 10 tracks',
    type: 'Album',
    blurb:
      'Microtonal groove bent through fuzz, tape and hypnotic repetition. Ancient myths, modern voltage — the first full statement from the project.',
    tracklist: [
      'Çölün Gözleri',
      'Salt Teeth',
      'Parlak Kum Fırtınası',
      'The Caravan Beyond Zero',
      'Oasis in 17',
      'Mirage Amplifier',
      'Sixth Saz Dimension',
      'Fractal Göbek',
      'Hallucinated Halay',
      'Microtonic Sandstorm',
    ],
    listenUrl: 'https://soundcloud.com/anatolian_mirage',
    featured: true,
  },
  {
    slug: 'the-eastern-skylight-tapes',
    catalog: 'KD-005',
    title: 'The Eastern Skylight Tapes',
    artistSlugs: ['grafenberg'],
    artistDisplay: 'Grafenberg',
    date: '2026-08-03',
    format: 'Digital · Tape edition',
    type: 'Album',
    blurb:
      'Long-form drift and tape saturation. Grafenberg pushes the palette away from the dancefloor and toward something closer to field recording.',
    listenUrl: 'https://soundcloud.com/grafenbergmusik',
  },
  {
    slug: 'gilded-rituals',
    catalog: 'KD-004',
    title: 'Gilded Rituals',
    artistSlugs: ['love-cult'],
    artistDisplay: 'Love Cult',
    date: '2026-07-30',
    format: 'Digital · Full album',
    type: 'Album',
    blurb:
      'Hymn-like repetition, drone beds and layered voices. Devotional music recorded at very close range.',
    listenUrl: 'https://soundcloud.com/grafenbergmusik',
  },
  {
    slug: 'black-chrome-reanimations',
    catalog: 'KD-003',
    title: 'Black Chrome Reanimations',
    artistSlugs: ['chromabone'],
    artistDisplay: 'Chromabone',
    date: '2026-07-27',
    format: 'Digital · Remix collection',
    type: 'Remix album',
    blurb:
      'The label’s reconstruction unit takes existing material apart and rebuilds it in metal. Familiar shapes, unfamiliar surfaces.',
    listenUrl: 'https://soundcloud.com/nosfera_disco_club',
  },
  {
    slug: 'love-and-venom-taste-the-same',
    catalog: 'KD-002',
    title: 'Love and Venom Taste the Same',
    artistSlugs: ['vein-mirror'],
    artistDisplay: 'VEIN//Mirror',
    date: '2026-04-09',
    format: 'Digital · 10 tracks',
    type: 'Album',
    blurb:
      'The debut. Analog warmth welded to poetic violence — hypnotic rhythms, melancholic guitars and vocals recorded close enough to feel the breath.',
    tracklist: [
      'The Glow That Learns Your Silence',
      'Your Name in the Light That Shivers',
      'The Weight of the Walls That Listen',
      'A Halo Carved From Falling Sound',
      'Glitter in the Mouth of God',
      'Stained Glass in the Mouth of the Sky',
      'Procession of the Silent Light',
      'Breath Painted on the Cold of Heaven',
      'Where the Last Light Learns to Break',
      'Where the Echo Builds a Shrine',
    ],
    listenUrl: 'https://soundcloud.com/vein-mirror',
    featured: true,
  },
  {
    slug: 'no-saints-no-proof',
    catalog: 'KD-001',
    title: 'No Saints, No Proof',
    artistSlugs: ['grafenberg'],
    artistDisplay: 'Grafenberg',
    date: '2026-03-01',
    format: 'Digital · Full album',
    type: 'Album',
    blurb:
      'The record that opened the catalogue. Immersive dark synthwave blending retro and futurist elements — the founding statement of the Kinetic Distro sound.',
    listenUrl: 'https://grafenberg.ovh',
  },
];

export const getRelease = (slug: string) => releases.find((r) => r.slug === slug);

export const releasesByArtist = (slug: string) =>
  releases.filter((r) => r.artistSlugs.includes(slug));

/* -------------------------------------------------------------------------- */
/* SERVICES                                                                    */
/* -------------------------------------------------------------------------- */

export const services = [
  {
    id: '01',
    title: 'Digital distribution',
    summary: 'Your record on every platform that matters, with metadata that actually holds up.',
    points: [
      'Delivery to Spotify, Apple Music, Bandcamp, Deezer, YouTube Music, Beatport and 40+ stores',
      'Clean metadata, ISRC and UPC handling, correct credits and contributor roles',
      'Release scheduling, pre-saves and territory management',
      'Transparent reporting — you see the same numbers we do',
    ],
  },
  {
    id: '02',
    title: 'Label services',
    summary: 'The infrastructure of a label, without giving up your masters.',
    points: [
      'Catalogue and cat-number management',
      'Rights registration and royalty splits between collaborators',
      'Release strategy, single sequencing and campaign calendars',
      'Physical run coordination — vinyl, tape and merch partners',
    ],
  },
  {
    id: '03',
    title: 'Creative direction',
    summary: 'Records arrive as worlds. We help build the rest of the world around them.',
    points: [
      'Artwork direction, typography and visual identity systems',
      'Video, visualiser and AI-assisted visual production',
      'Artist positioning, bio and press-kit writing',
      'Web presence — landing pages and dedicated artist sites',
    ],
  },
  {
    id: '04',
    title: 'Audience & release campaigns',
    summary: 'Deliberate, measured growth instead of noise.',
    points: [
      'Editorial and playlist pitching',
      'Press and radio outreach, premiere placement',
      'Paid acquisition when — and only when — the numbers justify it',
      'Community building on Bandcamp, SoundCloud and Discord',
    ],
  },
] as const;

/* -------------------------------------------------------------------------- */
/* NAVIGATION                                                                  */
/* -------------------------------------------------------------------------- */

export const nav = [
  { label: 'Roster', to: '/roster/' },
  { label: 'Releases', to: '/releases/' },
  { label: 'Distribution', to: '/distribution/' },
  { label: 'About', to: '/about/' },
  { label: 'Demos', to: '/demos/' },
  { label: 'Contact', to: '/contact/' },
] as const;
