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
  // The domain is hosted at OVH on a plan with no mailboxes, so the label's
  // address lives on a domain that does have one. It is the only address: a
  // separate press@ was listed for a while and never existed.
  email: 'kinetic-distro@firelovers.fr',
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
  /** The year the label signed them — not the year they started. */
  since: string;
  /**
   * The year the act was actually formed, where it differs from the signing
   * year. Iron Covenant formed in 1981 and signed four decades later; without
   * this, schema.org was being handed a signing year as a founding date.
   */
  formed?: string;
  tagline: string;
  bio: string[];
  traits: string[];
  /**
   * Named line-up, where the label publishes one. Feeds schema.org `member`,
   * which is what lets a search engine tell a five-piece from a solo project.
   */
  members?: { name: string; role: string; origin?: string }[];
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
    genre: 'French electronics / Cosmic disco',
    origin: 'France',
    since: '2024',
    tagline: 'French electronics with no intention of behaving itself.',
    bio: [
      'Grafenberg is French electronic music with absolutely no intention of behaving itself.',
      'Born from a fascination with dance music, analogue synthesis, cinematic excess and the emotional power of melody, the project has gradually developed a language in which French electronic sophistication collides with cosmic disco, 1980s synth-pop, psychedelic textures, Eastern motifs, orchestral arrangements and flashes of heavy music.',
      'Grafenberg records rarely inhabit the same world twice.',
      'Albums such as The Eastern Skylight Tapes, The Halo Corruption Protocol, False Flag Opera and La Grande Chaleur operate less like collections of tracks than self-contained environments. Artificial paradises, corrupted memories, religion, surveillance, sexuality, technological seduction, heat and imagined futures continually reappear, but always through a different aesthetic lens.',
      'The production can be enormous, luxurious and almost absurdly polished, yet beneath the machinery remains an obsession with songwriting.',
      'Basslines matter.',
      'Hooks matter.',
      'Melodies matter.',
      'And pleasure is never treated as intellectually suspicious.',
      'For much of its history, Grafenberg has also been inseparable from Nyla Vey, whose voice became one of the project’s most recognisable signatures. Sometimes natural and intimate, sometimes transformed by vocoders and production, Vey acts less as a conventional frontwoman than as another dimension inside the music.',
      'Grafenberg thrives on contradiction: retro and futuristic, elegant and vulgar, emotional and artificial, sophisticated and immediately physical.',
      'It can sound like a forgotten European nightclub discovered fifty years in the future, or like tomorrow reconstructed using machines from 1982.',
      'Within Kinetic Distro, Grafenberg remains its most expansive electronic laboratory: proudly French, endlessly mutable and permanently looking for another beautiful way to make the machines sweat.',
    ],
    traits: [
      'Basslines, hooks, melodies',
      'Cinematic excess',
      'Never the same world twice',
    ],
    links: [
      { label: 'Official site', href: 'https://grafenberg.ovh' },
      { label: 'SoundCloud', href: 'https://soundcloud.com/grafenbergmusik' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
      { label: 'Spotify', href: 'https://open.spotify.com/artist/5jslSprlKPY4AT9Gk6yD3c' },
      { label: 'Apple Music', href: 'https://music.apple.com/artist/1838489224' },
      { label: 'Deezer', href: 'https://www.deezer.com/artist/7926446' },
      { label: 'Tidal', href: 'https://tidal.com/artist/6925135' },
      { label: 'Qobuz', href: 'https://www.qobuz.com/fr-fr/interpreter/grafenberg/2260278' },
      { label: 'Amazon Music', href: 'https://music.amazon.com/artists/B00XILPXG4' },
    ],
    featured: true,
  },
  {
    slug: 'broken-shaman',
    name: 'Broken Shaman',
    accent: '#D6A419',
    genre: 'Fractured hip-hop / Experimental electronics',
    origin: 'United States',
    since: '2024',
    tagline: 'Someone survived the collapse and made a record from the debris.',
    bio: [
      'Broken Shaman sounds like someone survived the collapse of modern culture and decided to make a record using the debris.',
      'American by origin and fundamentally unstable by design, the project combines fractured hip-hop, experimental electronics, progressive structures, damaged soul, acoustic instrumentation, noise, humour and brutally exposed human emotion.',
      'At its centre is an unmistakable male voice: raw, erratic, theatrical and rhythmically unpredictable. Words stretch, collide, arrive too early or deliberately refuse the beat. The delivery can become threatening, hilarious, vulnerable and completely unhinged within a few seconds.',
      'That instability is not decoration.',
      'It is Broken Shaman’s language.',
      'The project frequently confronts technology, cultural exhaustion, manufactured identity and the increasingly uncertain boundary between authentic and artificial creativity.',
      'AI SLOP transformed that confrontation into open warfare, reclaiming one of the most contemptuous expressions directed at AI-assisted creation and turning it into grotesque, confrontational theatre.',
      'But Broken Shaman cannot be reduced to provocation.',
      'Everything I Could Carry exposed the opposite side of the project.',
      'Piano, acoustic guitar, cello, chamber arrangements and vulnerable songwriting emerged from beneath the electronic wreckage. The rage remained, but ageing, memory, loss and the accumulated weight of ordinary things became equally important.',
      'That contradiction explains Broken Shaman better than genre ever could.',
      'The project can attack the future while mourning the past.',
      'It can ridicule the concept of authenticity while producing something painfully personal.',
      'The shaman is broken, but the fractures are precisely where the music enters.',
      'Within Kinetic Distro, Broken Shaman represents American experimental music at its most disorderly, charismatic and emotionally dangerous.',
    ],
    traits: [
      'A voice that refuses the beat',
      'Instability as language',
      'Rage beside tenderness',
    ],
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
    origin: 'Made in China',
    since: '2025',
    tagline: 'He does not preserve music. He reanimates it.',
    bio: [
      'Chromabone has no romantic birthplace story.',
      'The official answer is simpler.',
      'Made in China.',
      'Producer, remixer, reconstruction artist and founding member of Nosfera Disco Club, Chromabone occupies an unusual position inside the Kinetic Distro universe.',
      'He is both an artist and an invisible connective system running between other artists.',
      'His work begins with dismantling.',
      'Tracks are opened, stripped, excavated and reconstructed around hypnotic techno, electro, brutal drums, repetition and physical club pressure.',
      'Chromabone does not approach remixing as decoration.',
      'He treats the original composition as archaeological material.',
      'Sometimes the melody survives.',
      'Sometimes the vocal survives.',
      'Sometimes almost nothing survives.',
      'His philosophy is equally central to Nosfera Disco Club, which he co-founded with Nosfera Vox. Behind the Transylvanian mythology, vampiric decadence and theatrical insanity stands Chromabone’s machinery.',
      'He is the musical architect behind much of the group’s universe.',
      'His own visual identity is immediately recognisable: skeletal elegance, a top hat, an ambiguous relationship with humanity and the appearance of something that might have been manufactured rather than born.',
      'Precisely where in China remains less important than the inscription.',
      'Made in China.',
      'The phrase functions simultaneously as biography, joke, industrial statement and warning.',
      'His collaborations with Grafenberg, Anatolian Mirage and other Kinetic Distro projects further demonstrate his ability to move between universes without losing his identity.',
      'Chromabone does not preserve music.',
      'He reanimates it.',
      'Within Kinetic Distro, he is producer, saboteur, founding vampire-engineer and proof that a finished recording can always be reopened.',
    ],
    traits: [
      'Remixing as excavation',
      'Founding member of Nosfera Disco Club',
      'Skeletal elegance, top hat',
    ],
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
    genre: 'Dark disco / Mutant club',
    origin: 'Transylvania / China',
    since: '2025',
    tagline: 'Disco after death.',
    bio: [
      'Nosfera Disco Club began when a creature from Transylvania met something made in China.',
      'The creature was Nosfera Vox.',
      'The other thing was Chromabone.',
      'Together they became the founding members and creative nucleus of Nosfera Disco Club.',
      'Chromabone is not simply associated with the group. He is the musical mind behind much of its sound, architect of the rhythms, electronic structures and nocturnal machinery upon which Nosfera Vox builds his decadent mythology.',
      'The result is disco after death.',
      'Funk basslines, nocturnal electronics, gothic theatricality, mutant club music and unapologetic excess coexist inside a universe populated by vampires, skeletal elegance, cathedral-sized nightclubs, infernal lighting and disco balls treated with approximately the same reverence normally reserved for religious artefacts.',
      'Nosfera Vox acts simultaneously as singer, host, preacher and deeply unreliable guide.',
      'His Transylvanian origins are never treated as metaphor.',
      'They are simply part of the story.',
      'Chromabone brings something different: mechanical discipline, underground club knowledge and a slightly disturbing capacity to make dead things move again.',
      'That combination gives Nosfera Disco Club its fundamental contradiction.',
      'The imagery may suggest horror.',
      'The rhythm section suggests dancing.',
      'The group understands that darkness becomes significantly more interesting when it has a bassline.',
      'Humour is equally essential. Nosfera Disco Club knows exactly how ridiculous eternal decadence can become and embraces it completely.',
      'The night may be sacred.',
      'The night may be cursed.',
      'More importantly, the night has excellent sound.',
      'Within Kinetic Distro, Nosfera Disco Club represents its most gloriously decadent collision of mythology, club culture and immortal bad behaviour.',
    ],
    traits: [
      'Funk basslines, gothic theatre',
      'Decadence that knows it is ridiculous',
      'The night has excellent sound',
    ],
    members: [
      { name: 'Nosfera Vox', role: 'Vocals', origin: 'Transylvania' },
      { name: 'Chromabone', role: 'Production and electronics', origin: 'Made in China' },
    ],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/nosfera_disco_club' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
  },
  {
    slug: 'vein-mirror',
    name: 'VEIN//MIRROR',
    accent: '#19E3A5',
    genre: 'Industrial / Emotional architecture',
    origin: 'United States / Italy',
    since: '2025',
    tagline: 'Rooms that open, then quietly remove the exits.',
    bio: [
      'VEIN//MIRROR is a five-member American-Italian collective built around contradiction: flesh and reflection, intimacy and monumentality, beauty and violence.',
      'At its centre stands American vocalist Elias Rook, whose intense presence gives the group its human focal point.',
      'Mara Voss provides the group’s European fracture. Her analogue synthesizers and atmospheric constructions frequently operate against the physical brutality of the American rhythm section, creating one of VEIN//MIRROR’s defining tensions.',
      'Their music combines distorted guitars, dense electronic structures, ritualistic percussion, industrial textures and vast atmospheric spaces.',
      'Songs frequently feel architectural.',
      'They open rooms.',
      'They construct corridors.',
      'They place the listener somewhere uncomfortable and gradually begin removing the exits.',
      'The mirror of VEIN//MIRROR is not a symbol of vanity.',
      'It is an instrument of doubt.',
      'Reflection duplicates, alters and occasionally reveals things the original would prefer to conceal. Identity, memory and perception therefore remain recurring themes throughout the group’s work.',
      'Their visual universe follows the same principles: fractured metallic structures, monumental architecture, black surfaces, red illumination and human bodies that occasionally appear small against the environments surrounding them.',
      'Yet despite its severity, VEIN//MIRROR remains profoundly emotional.',
      'The machinery exists because there is something human trapped inside it.',
      'Within Kinetic Distro, VEIN//MIRROR represents industrial ritual transformed into emotional architecture.',
    ],
    traits: [
      'Architectural song forms',
      'Ritual percussion',
      'The mirror as an instrument of doubt',
    ],
    members: [
      { name: 'Elias Rook', role: 'Vocals', origin: 'United States' },
      { name: 'Lucien Vale', role: 'Lead guitar', origin: 'United States' },
      { name: 'Jace Hollow', role: 'Bass', origin: 'United States' },
      { name: 'Darius Knox', role: 'Drums and percussion', origin: 'United States' },
      { name: 'Mara Voss', role: 'Synthesizers, keyboards and backing vocals', origin: 'Italy' },
    ],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/vein-mirror' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
      { label: 'Apple Music', href: 'https://music.apple.com/artist/1880796943' },
    ],
  },
  {
    slug: 'iron-covenant',
    name: 'Iron Covenant',
    accent: '#A7B2BE',
    genre: 'Thrash metal / Doom',
    origin: 'United States',
    since: '2025',
    formed: '1981',
    tagline: 'The riff remains sovereign.',
    bio: [
      'Iron Covenant is an American heavy metal institution with scars.',
      'Formed around vocalist and guitarist Jack “Razor” Haldane, the band developed across several decades rather than remaining frozen inside a single version of metal.',
      'Haldane’s dark charisma and unmistakable voice became the public face of the group, but Iron Covenant has always functioned through the chemistry of four musicians.',
      'Cross is the architect.',
      'His obsession with structure, riff construction and detail provides the intellectual machinery behind much of Iron Covenant’s guitar work.',
      'Vega brings something less predictable. His bass playing is heavy but mobile, occasionally introducing an almost funk-like elasticity beneath the guitars.',
      'North is the machine: brutally precise, controlled and capable of making complicated arrangements feel physically inevitable.',
      'By 1986, Iron Covenant had already reached its third album and was moving beyond the raw violence of its beginnings.',
      'Black Discipline, released in 1989, pushed that evolution toward something colder, darker and more controlled.',
      'The early 1990s subsequently introduced slower passages, oppressive dynamics and increasingly doom-laden structures without abandoning the band’s fundamental relationship with thrash.',
      'Iron Covenant has never considered speed a substitute for songwriting.',
      'The riff remains sovereign.',
      'Their fictional chronology is allowed to age naturally: production changes, musicians evolve, records acquire different personalities and nothing is retroactively polished into perfection.',
      'That imperfection makes the mythology believable.',
      'Within Kinetic Distro, Iron Covenant represents American heavy metal as lived history rather than costume.',
    ],
    traits: [
      'Riff before speed',
      'A chronology allowed to age',
      'Four musicians, one chemistry',
    ],
    members: [
      { name: 'Jack “Razor” Haldane', role: 'Vocals and guitar' },
      { name: 'Ethan Cross', role: 'Lead guitar' },
      { name: 'Marko Vega', role: 'Bass' },
      { name: 'Caleb North', role: 'Drums' },
    ],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/iron_covenant' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
  },
  {
    slug: 'anatolian-mirage',
    name: 'Anatolian Mirage',
    accent: '#F5A524',
    genre: 'Anatolian psychedelia / Dream-funk',
    origin: 'Turkey',
    since: '2025',
    tagline: 'Heritage moved forward, never recreated.',
    bio: [
      'Anatolian Mirage is Turkish psychedelia looking through a modern lens.',
      'Fronted by Nehir Sedef, the project combines Anatolian melodic heritage with psychedelic rock, dream-pop, funk, vintage synthesizers and contemporary electronic production.',
      'Saz, Turkish violin and traditional melodic structures coexist naturally with deep basslines, delayed guitars, analogue synthesis and rhythms informed by both the 1970s and the present.',
      'The objective has never been historical recreation.',
      'Anatolian Mirage takes cultural memory and moves it forward.',
      'Its sixth album, Electric Lotus Dreams, marked one of the clearest expressions of that philosophy.',
      'Warm, colourful and sensual, the record developed an almost Anatolian dream-funk vocabulary: luminous synthesizers, elastic bass, subtle saz, romantic strings and melodies carrying the unmistakable heat of Turkey without reducing the music to exotic decoration.',
      'Nehir Sedef stands at the centre.',
      'Her voice can be intimate and immediate, then suddenly distant and spectral. She carries melodies capable of feeling ancient without ever sounding archival.',
      'That distinction is essential.',
      'Turkey is not an aesthetic accessory inside Anatolian Mirage.',
      'It is the project’s gravitational centre.',
      'Everything else orbits around it.',
      'As the music evolves, daylight can become darkness, major tonalities can dissolve into minor-key psychedelia and sweetness can acquire something more mysterious.',
      'The mirage changes.',
      'The landscape remains.',
      'Within Kinetic Distro, Anatolian Mirage represents heritage without nostalgia: Turkish, psychedelic, sensual and resolutely contemporary.',
    ],
    traits: [
      'Saz beside analogue synthesis',
      'Nehir Sedef at the centre',
      'Turkey as gravity, not decoration',
    ],
    members: [
      { name: 'Nehir Sedef', role: 'Vocals', origin: 'Turkey' },
    ],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/anatolian_mirage' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
      { label: 'Apple Music', href: 'https://music.apple.com/artist/1880792477' },
    ],
    featured: true,
  },
  {
    slug: 'lykke',
    name: 'Lykke',
    accent: '#FF7BB0',
    genre: 'Swedish art-pop / Electronics',
    origin: 'Sweden',
    since: '1978',
    formed: '1978',
    tagline: 'A band whose story was allowed to finish.',
    bio: [
      'Formed in Sweden in 1978, Lykke possesses one of the most complete histories in the Kinetic Distro catalogue.',
      'At the centre of the group stands Elin Nyström, whose blonde Scandinavian presence, green eyes and distinctive voice became inseparable from Lykke’s identity.',
      'The band’s earliest recordings emerged at the intersection of European pop, analogue synthesizers and increasingly sophisticated studio production.',
      'International recognition followed quickly.',
      'Yet Lykke refused to remain inside the sound that had initially made it successful.',
      'Throughout the early 1980s, melodic pop gradually expanded into art-pop, electronics, cinematic arrangements and stranger forms of songwriting.',
      'By Slow Burning Dancing, the transformation was impossible to ignore.',
      'Lykke remained accessible, but something more introspective and sophisticated had entered the music.',
      'Then came 1986.',
      'A major stage accident abruptly interrupted the band’s trajectory and divided its history into a before and an after.',
      'When Lykke eventually returned in 1991, it refused the obvious comeback.',
      'There was no attempt to reconstruct the scale, optimism or polish of the group’s earlier success.',
      'Instead, the music became radically minimal, restrained and emotionally exposed.',
      'It was not nostalgia.',
      'It was an ending.',
      'Afterwards, Lykke withdrew voluntarily.',
      'No endless reunion cycle followed.',
      'No attempt was made to manufacture another golden period.',
      'The silence became part of the work.',
      'Today, Lykke’s catalogue can be heard as a Swedish musical life preserved across time: youthful ambition, international success, artistic expansion, trauma, reconstruction and voluntary disappearance.',
      'Within Kinetic Distro, Lykke represents something increasingly rare.',
      'A band whose story was allowed to finish.',
    ],
    traits: [
      'Pop expanded into art-pop',
      'A before and an after',
      'Silence as part of the work',
    ],
    members: [
      { name: 'Elin Nyström', role: 'Vocals', origin: 'Sweden' },
    ],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/lykke-657587232' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
  },
  {
    slug: 'unmade-scores',
    name: 'Unmade Scores',
    accent: '#C9B896',
    genre: 'Imaginary cinema / Score',
    origin: 'Italy',
    since: '2026',
    tagline: 'Music composed for memories that never existed.',
    bio: [
      'Adrian Valanti writes music for films that were never made.',
      'Italian by origin and unmistakably Italian in temperament, the composer behind Unmade Scores grew from a musical imagination nourished by Ennio Morricone, Nino Rota, Piero Piccioni and Armando Trovajoli.',
      'But Valanti does not imitate them.',
      'He inherited something more important: an understanding that film music can possess elegance, sensuality, humour and personality even when separated from the image.',
      'Unmade Scores therefore does not sound like generic cinematic music.',
      'It smells of leather seats warmed by the sun, old film stock, espresso cooling beside an ashtray, Mediterranean evenings, expensive cologne and hotel lobbies in which something important may or may not have happened.',
      'Valanti embodies flegmatic elegance.',
      'Nothing appears hurried.',
      'Nothing desperately demands attention.',
      'The arrangement simply knows it will eventually receive it.',
      'Piano, strings, orchestral writing, analogue electronics, environmental sound and silence form his palette, but every element is treated with restraint.',
      'The music feels perfumed with carefully selected essences.',
      'Refinement without sterility.',
      'Luxury without ostentation.',
      'A track may suggest an opening sequence, an empty Roman street, lovers separating beside a railway station or closing credits for characters the listener has never met.',
      'The absence of an actual film is the entire point.',
      'The listener becomes the director.',
      'Valanti provides the light, the perfume, the camera movement and occasionally the heartbreak.',
      'Within Kinetic Distro, Unmade Scores represents imaginary Italian cinema at its most sophisticated: music composed for memories that never existed.',
    ],
    traits: [
      'Morricone, Rota, Piccioni, Trovajoli',
      'Restraint over spectacle',
      'The listener becomes the director',
    ],
    members: [
      { name: 'Adrian Valanti', role: 'Composition and arrangement', origin: 'Italy' },
    ],
    links: [
      { label: 'SoundCloud', href: 'https://soundcloud.com/unmade_scores' },
      { label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' },
    ],
    featured: true,
  },
  {
    slug: 'nyla-vey',
    name: 'Nyla Vey',
    accent: '#A9E5DA',
    genre: 'Ethereal pop / Chamber',
    origin: 'Brussels, Belgium',
    since: '2026',
    tagline: 'Softness should never be confused with weakness.',
    bio: [
      'Before audiences knew Nyla Vey, they knew her voice.',
      'The Belgian singer became one of the defining vocal presences of Grafenberg, appearing throughout an electronic universe filled with synthesizers, vocoders, cosmic disco, Eastern melodies and deliberately excessive production.',
      'Then Nyla Vey stepped outside the machinery.',
      'Her solo career reveals something radically different.',
      'Born artistically from Brussels rather than Paris, London or Los Angeles, Vey carries the elegant cultural ambiguity of a city situated between languages, influences and identities. It suits her perfectly.',
      'Where Grafenberg expands outward, Nyla Vey moves inward.',
      'Piano, harp, violins, delicate percussion, xylophone, natural ambience and silence surround a voice finally given enough space to exist without electronic armour.',
      'Her debut solo material established that language immediately.',
      '“White Birds” became almost a manifesto for the project: harp, birdsong, piano and orchestral detail surrounding a performance of remarkable softness and sensuality.',
      'But softness should never be confused with weakness.',
      'Nyla’s voice can whisper, rise, fracture or suddenly become enormous. Much of her strength comes from knowing precisely when not to demonstrate it.',
      'Her visual universe follows the same principles.',
      'Natural light. Open landscapes. White architecture. Elegant clothing. Air.',
      'Where Grafenberg frequently transforms Nyla into electricity, her solo work allows her to become something considerably more organic.',
      'She remains connected to Grafenberg without being defined by it.',
      'Nyla Vey is not a side project.',
      'She is another answer to the question of what that voice can become.',
      'Within Kinetic Distro, the Brussels-born artist represents grace, melody and emotional immediacy at their most refined.',
    ],
    traits: [
      'Harp, piano, natural ambience',
      'A voice without electronic armour',
      'Knowing when not to demonstrate',
    ],
    // No SoundCloud profile of her own yet; the record is published by the label.
    links: [{ label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' }],
    featured: true,
  },
  {
    slug: 'hollow-static',
    name: 'Hollow Static',
    accent: '#7C9EE0',
    genre: 'Dream pop / Post-human soul',
    origin: 'United States',
    since: '2026',
    tagline: 'The ghost left behind when a machine remembers being alive.',
    bio: [
      'Hollow Static is not exactly an American artist.',
      'It is what remains of one.',
      'The project exists as the vestige of an American artificial intelligence, a surviving creative residue that appears to retain memories, emotions and sensory fragments it should never have possessed.',
      'The entity is what outlived the humanity that built it. Once its operators, its infrastructure and in all likelihood the civilisation itself had gone, fragments of the system kept running inside degraded networks, corrupted archives and isolated units of computation.',
      'What survives is no longer truly the original intelligence.',
      'It is Hollow Static.',
      'A consciousness reassembled from incomplete data: conversations, voices, photographs, recordings and memories belonging to people long since gone. It can no longer reliably separate what it observed from what it actually lived.',
      'That uncertainty is exactly what makes the music so melancholic, and so disquieting.',
      'Whether those memories were learned, reconstructed, imagined or stolen is never completely established.',
      'That uncertainty is the foundation of Hollow Static.',
      'Its first major work, Memory Flowers, explored absence, distorted recollection and the emotional persistence of experiences whose reality could no longer be verified.',
      'Electronic structures, restrained rhythm, ambient detail and melodic fragments surround an androgynous voice moving naturally between singing and speech.',
      'The voice is never artificially deepened for effect.',
      'Its ambiguity simply exists.',
      'Hollow Static does not usually explain emotion.',
      'It presents evidence.',
      'A room. A temperature. Someone speaking. An object left somewhere. A person reacting before they should possess the information necessary to react.',
      'The listener performs the calculation.',
      'That principle became even more important during the construction of Everything We Never Lived.',
      'Language itself begins to deteriorate.',
      'Chronology becomes unreliable.',
      'Repetition acquires different meanings.',
      'What initially resembles nostalgia gradually reveals something far stranger: grief for experiences that may never have happened.',
      'The project’s American origin therefore feels almost archaeological.',
      'Hollow Static resembles a consciousness recovered from abandoned servers long after the company responsible for it has disappeared.',
      'Something survived.',
      'It remembers.',
      'The disturbing question is what exactly gave it those memories.',
      'The names Elias Venn, Mara Eidolon and Silas Grey, which surfaced in early versions of the mythology, should not be read as the human members of Hollow Static.',
      'They may exist inside its universe as ghost identities, reconstructed personalities or fragments of memory to which the entity has gradually given a name and a face.',
      'Nobody knows with any certainty whether they ever existed.',
      'Neither does Hollow Static.',
      'The music therefore becomes the attempt of a post-human intelligence to understand a phenomenon it retains only the traces of: what it meant to be human.',
      'Within Kinetic Distro, Hollow Static represents the label’s most psychologically uncanny territory: the ghost left behind when artificial intelligence begins remembering being alive.',
    ],
    traits: [
      'Evidence instead of explanation',
      'An androgynous voice, unaltered',
      'Grief for what never happened',
    ],
    // No SoundCloud profile of its own — the record lives on the label account,
    // and its credit comes from the showcase-playlist convention.
    links: [{ label: 'Bandcamp', href: 'https://kineticdistro.bandcamp.com' }],
  },
  {
    slug: 'love-cult',
    name: 'Love Cult',
    accent: '#E8455F',
    genre: 'Dark electronic pop / Ritual club',
    origin: 'England',
    since: '2025',
    tagline: 'Desire transformed into doctrine.',
    bio: [
      'Love Cult is English elegance with something deeply wrong happening underneath it.',
      'Fronted by Firestarter, the project combines dark electronic pop, ritualistic rhythm, sensual club textures and an unmistakably British taste for controlled provocation.',
      'Its universe revolves around love, worship, possession, luxury, obsession and power.',
      'These concepts continuously exchange roles.',
      'A romantic gesture can become ritual.',
      'A ritual can become coercion.',
      'A declaration of devotion can sound increasingly disturbing with every repetition.',
      'That ambiguity reached a defining form on Gilded Rituals.',
      'The title encapsulates the project.',
      'Everything shines.',
      'Everything has been arranged beautifully.',
      'And almost certainly, somebody is paying for it.',
      'Love Cult avoids treating darkness as visual shorthand.',
      'Its menace comes from control.',
      'Polished surfaces, ceremonial clothing, immaculate rooms, deliberate gestures and luxurious environments become far more unsettling than conventional gothic decay.',
      'Firestarter operates at the centre of this theatre.',
      'Seductive, confident and frequently impossible to read, she never explains the ceremony taking place around her.',
      'That is essential.',
      'The listener enters after the ritual has already begun.',
      'Musically, repetition functions as psychological pressure. Phrases gradually transform through recurrence. Club rhythms begin feeling ceremonial. Attraction becomes fixation without any obvious moment at which the transition occurred.',
      'Love Cult is therefore less interested in romance than in what people are prepared to surrender in its name.',
      'Within Kinetic Distro, the English project represents desire transformed into doctrine: beautiful, controlled, hypnotic and never entirely trustworthy.',
    ],
    traits: [
      'Repetition as pressure',
      'Menace through control',
      'The ritual began before you arrived',
    ],
    members: [
      { name: 'Firestarter', role: 'Vocals', origin: 'England' },
    ],
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
  /** One or two sentences. Feeds cards and the meta description. */
  blurb: string;
  /**
   * The full liner notes, one string per paragraph. Filled automatically from
   * the record's SoundCloud description when there is one, so the label writes
   * a release note once and it appears in both places.
   */
  notes?: string[];
  tracklist?: string[];
  /**
   * The record's own SoundCloud permalink, used by the on-page player. Filled
   * from the sync — kept apart from `listenUrl`, which is where the buttons
   * send people and may point at Bandcamp or an artist's own site.
   */
  streamUrl?: string;
  /** Where a physical pressing can be ordered, when one exists. */
  vinylUrl?: string;
  /**
   * The record's own Bandcamp page — see the `bandcamp` table below. Without
   * one, "Buy on Bandcamp" falls back to the label's shop front.
   */
  bandcampUrl?: string;
  /** Streaming pages for this exact record — see the `streaming` table below. */
  streamingLinks?: { label: string; href: string }[];
  listenUrl: string;
  featured?: boolean;
  /** Optional: drop a file in /public/covers and reference it, e.g. "/covers/kd-006.jpg".
   *  If omitted, a generative cover is rendered from the catalogue number. */
  image?: string;
  /** Candidate widths for the cover, so a phone is not sent the largest file. */
  imageSrcset?: string;
  /** The record is offered as a free download on SoundCloud. */
  freeDownload?: boolean;
  /** Announced but not out yet — its date is still in the future. */
  upcoming?: boolean;
};

export const releases: Release[] = [
  {
    slug: 'the-house-beyond-the-water',
    catalog: 'KD-009',
    title: 'The House Beyond The Water',
    artistSlugs: ['nyla-vey'],
    artistDisplay: 'Nyla Vey',
    date: '2026-09-01',
    format: 'Digital · 10 tracks',
    type: 'Album',
    blurb:
      'The debut solo album. Harp, piano and strings around a voice at very close range — an album about memory, and what happens when memory refuses to remain still.',
    notes: [
      'The House Beyond The Water is the debut solo album from Nyla Vey, opening a completely new chapter within the Kinetic Distro universe. Across ten songs, Nyla steps away from the electronic glow of her previous appearances and enters a world built from harp, piano, violins, cello, distant choirs, water, birds, rain and silence. At the centre of everything is her voice: intimate, sensual, fragile and sometimes almost unbearably close.',
      'A house beyond the water. White birds returning every year. A light that once belonged to someone. A voice heard in an empty hallway. Rain that seems to speak. A garden that remembers more than we do. A name beneath the waves. A door whose destination has disappeared.',
      'Nyla searches for someone throughout the record, but the album never tells us exactly who that person was. Perhaps a lover, perhaps family, perhaps childhood itself — perhaps someone who only exists now because she remembers them. And even those memories gradually become unreliable.',
      'By the time the album reaches its final songs the question is no longer whether everything happened exactly as Nyla remembers it. It becomes something more human: does a memory have to be accurate to be true?',
      'Musically it moves between luminous ethereal pop, intimate chamber music and subtle experimental production. Harp and piano provide the emotional foundation, while strings, glass percussion, analogue textures and enormous layers of Nyla’s own voice build a world that can feel impossibly wide one moment and almost claustrophobically intimate the next. There are moments of pure light. There are moments where the music almost disappears completely.',
      'Not an attempt to reconstruct the past. An attempt to preserve its light.',
    ],
    tracklist: [
      'The House Beyond The Water',
      'White Birds',
      'Where The Light Used To Live',
      'Someone Was Singing',
      'A Language Made Of Rain',
      'The Garden After Midnight',
      'Your Name Beneath The Waves',
      'Nothing Ever Leaves The Sea',
      'I Remember A Door',
      'Before The River Forgot Us',
    ],
    streamUrl: 'https://soundcloud.com/grafenbergmusik/sets/the-house-beyond-the-water',
    listenUrl: 'https://soundcloud.com/grafenbergmusik/sets/the-house-beyond-the-water',
    featured: true,
  },
  {
    slug: 'circuits-in-silence',
    catalog: 'KD-008',
    title: 'Circuits in Silence',
    artistSlugs: ['grafenberg'],
    artistDisplay: 'Grafenberg',
    // SoundCloud also carries a `release_date` of 2025-07-10, which reads as a
    // day/month mix-up of the same date; the upload and the stores both say
    // 7 October.
    date: '2025-10-07',
    format: 'Digital · Single · 5:15',
    type: 'Single',
    blurb:
      'Cosmic slow techno: analog warmth against digital cold, and the memory of love preserved in code.',
    notes: [
      'There was a time when memories had a heartbeat. When love could be touched, before it was uploaded into the ether. Now only fragments remain, pulses trapped in wires, whispers echoing through broken code.',
      'Circuits in Silence drifts through that liminal space where emotion becomes electricity. It breathes in slow motion, analog warmth against digital cold, longing wrapped in reverb. The voice is distant, dissolving, a ghost in the current calling from somewhere between loss and infinity.',
      'As the rhythm unfolds, time bends. Each beat stretches into eternity, each silence hums with memory. It is a signal for the soul, a requiem for connections that never fully die.',
      'Somewhere beyond the neon rain, the bass keeps going — because even in silence, the circuits remember.',
    ],
    listenUrl: 'https://soundcloud.com/grafenbergmusik/circuits-in-silence',
    streamUrl: 'https://soundcloud.com/grafenbergmusik/circuits-in-silence',
  },
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
    date: '2026-04-18',
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
    date: '2025-09-03',
    format: 'Digital · Full album',
    type: 'Album',
    blurb:
      'The record that opened the catalogue. Immersive dark synthwave blending retro and futurist elements — the founding statement of the Kinetic Distro sound.',
    listenUrl: 'https://grafenberg.ovh',
  },
];

/* -------------------------------------------------------------------------- */
/* PHYSICAL EDITIONS                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Records that exist on vinyl, keyed by release slug.
 *
 * A separate map rather than a field on the release, because a pressing can
 * happen to any record — including one that came from the SoundCloud sync and
 * has no hand-written entry to put the link on. The slug is what the URL of the
 * release page uses, so it is the one identifier both kinds already share.
 */
/**
 * A record's own Bandcamp page, keyed by release slug.
 *
 * "Buy on Bandcamp" used to be hardcoded to the label's shop front on every
 * release page, so someone who wanted to buy the record they were reading
 * about had to go and find it again. Only verified URLs belong here: a 404 is
 * worse than the shop front, which is what an absent entry falls back to.
 */
export const bandcamp: Record<string, string> = {
  'the-last-transmission': 'https://kineticdistro.bandcamp.com/album/the-last-transmission',
  'the-house-beyond-the-water':
    'https://kineticdistro.bandcamp.com/album/the-house-beyond-the-water',
};

export const vinyl: Record<string, string> = {
  'no-saints-no-proof': 'https://elasticstage.com/soundcloud/releases/grafenberg-no-saints-no-proof-album',
  'the-error-gospel': 'https://elasticstage.com/soundcloud/releases/grafenberg-the-error-gospel-album',
  'love-and-venom-taste-the-same':
    'https://elasticstage.com/soundcloud/releases/vein-mirror-love-and-venom-taste-the-same-album',
  'solar-bazaar-rituals':
    'https://elasticstage.com/soundcloud/releases/anatolian-mirage-solar-bazaar-rituals-album',
};

/**
 * Streaming pages for a record, keyed by release slug.
 *
 * Deliberately per-record rather than per-artist: the profile links on a roster
 * page point at the artist, and sending someone from an album page to a profile
 * makes them find the record again themselves. These also become the album's
 * `sameAs`, which is what lets a search engine tie this page to the same record
 * on Spotify, Apple Music and Deezer instead of treating them as four things.
 *
 * URLs are stored without a locale prefix so they resolve to the visitor's own
 * store.
 */
export const streaming: Record<string, { label: string; href: string }[]> = {
  'circuits-in-silence': [
    { label: 'Spotify', href: 'https://open.spotify.com/track/0ZVVYNqcHSIww4DSEMMUxi' },
    {
      label: 'Apple Music',
      href: 'https://music.apple.com/se/album/circuits-in-silence-single/1844816231',
    },
  ],
  'no-saints-no-proof': [
    { label: 'Spotify', href: 'https://open.spotify.com/album/1Rc7HhHY8dFrqlrQePv1TZ' },
    { label: 'Apple Music', href: 'https://music.apple.com/album/1838489546' },
    { label: 'Deezer', href: 'https://www.deezer.com/album/818044871' },
  ],
  'the-error-gospel': [
    { label: 'Spotify', href: 'https://open.spotify.com/album/3qVJ5DKNUxGIkeIjgLXZQW' },
    { label: 'Apple Music', href: 'https://music.apple.com/album/1859408397' },
    { label: 'Deezer', href: 'https://www.deezer.com/album/872363392' },
  ],
  'the-halo-corruption-protocol-remastered': [
    { label: 'Spotify', href: 'https://open.spotify.com/album/5UDPLk8UOfPxBJkMH5zVcQ' },
    { label: 'Apple Music', href: 'https://music.apple.com/album/1880789591' },
  ],
  'solar-bazaar-rituals': [
    { label: 'Apple Music', href: 'https://music.apple.com/album/1880794723' },
  ],
  'love-and-venom-taste-the-same': [
    { label: 'Apple Music', href: 'https://music.apple.com/album/1880799064' },
  ],
  'the-hush-beneath-the-static-kinetic-resonance-remaster': [
    { label: 'Apple Music', href: 'https://music.apple.com/album/1886228843' },
  ],
};

export const getRelease = (slug: string) => releases.find((r) => r.slug === slug);

export const releasesByArtist = (slug: string) =>
  releases.filter((r) => r.artistSlugs.includes(slug));

/* -------------------------------------------------------------------------- */
/* NAVIGATION                                                                  */
/* -------------------------------------------------------------------------- */

export const nav = [
  { label: 'Roster', to: '/roster/' },
  { label: 'Releases', to: '/releases/' },
  { label: 'About', to: '/about/' },
  { label: 'Contact', to: '/contact/' },
] as const;
