/**
 * SOUNDCLOUD SOURCES
 * -----------------------------------------------------------------------------
 * Maps each roster slug to its SoundCloud profile.
 *
 * `userId` is SoundCloud's internal numeric id. It never changes, even if the
 * artist renames their profile URL — which is why we store it rather than
 * re-resolving it on every sync. It is used to build the public RSS feed:
 *
 *   https://feeds.soundcloud.com/users/soundcloud:users:<userId>/sounds.rss
 *
 * To add a new artist: run `npm run resolve -- https://soundcloud.com/<handle>`
 * and paste the id it prints here.
 * -----------------------------------------------------------------------------
 */

export type SoundCloudSource = {
  slug: string;
  handle: string;
  userId: number;
  /** Tracks under this profile are credited to these roster slugs (side projects, aliases). */
  alsoCredits?: string[];
};

export const soundcloudSources: SoundCloudSource[] = [
  { slug: 'grafenberg', handle: 'grafenbergmusik', userId: 50014017 },
  { slug: 'broken-shaman', handle: 'broken_shaman', userId: 1663724420 },
  { slug: 'anatolian-mirage', handle: 'anatolian_mirage', userId: 1658602607 },
  { slug: 'iron-covenant', handle: 'iron_covenant', userId: 1682088095 },
  // Chromabone has no profile of its own — it lives under Nosfera Disco Club.
  { slug: 'nosfera-disco-club', handle: 'nosfera_disco_club', userId: 1652866139, alsoCredits: ['chromabone'] },
  { slug: 'vein-mirror', handle: 'vein-mirror', userId: 1656504467 },
  { slug: 'lykke', handle: 'lykke-657587232', userId: 1662240176 },
  { slug: 'unmade-scores', handle: 'unmade_scores', userId: 1662861584 },
];

/** The label profile — its playlists are the canonical album list. */
export const labelSource = {
  handle: 'grafenbergmusik',
  userId: 50014017,
};
