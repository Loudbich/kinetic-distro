/**
 * CATALOGUE — curated content merged with the SoundCloud sync.
 * -----------------------------------------------------------------------------
 * `site.ts` is hand-written and authoritative. `catalog.generated.json` is
 * produced by `npm run sync` from the artists' public SoundCloud feeds.
 *
 * Rules:
 *  · A curated release always wins over a synced one with the same title.
 *  · Synced playlists that match nothing curated appear as "auto" releases.
 *  · Synced tracks feed the "Latest on SoundCloud" modules.
 *
 * The site builds fine with an empty generated file — the sync is an
 * enhancement, never a dependency.
 * -----------------------------------------------------------------------------
 */

import generated from './catalog.generated.json';
import { artists, releases, type Release } from './site';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type SyncedTrack = {
  id: string;
  title: string;
  url: string;
  date: string | null;
  artwork: string;
  durationSec: number | null;
  audio: string;
};

export type SyncedPlaylist = {
  id: string;
  title: string;
  url: string;
  date: string | null;
  artwork: string;
  trackCount: number | null;
  isAlbum: boolean;
  setType: string;
  description: string;
  tracklist: string[];
};

export type SyncedArtist = {
  slug: string;
  handle: string;
  userId: number;
  profileUrl: string;
  rssUrl: string;
  displayName: string;
  description: string;
  avatar: string;
  alsoCredits: string[];
  trackCount: number;
  latestDate: string | null;
  tracks: SyncedTrack[];
  playlists: SyncedPlaylist[];
};

type Generated = {
  generatedAt: string | null;
  artistCount: number;
  trackCount: number;
  playlistCount: number;
  artists: Record<string, SyncedArtist>;
};

const data = generated as unknown as Generated;

/* -------------------------------------------------------------------------- */
/* Accessors                                                                   */
/* -------------------------------------------------------------------------- */

export const syncMeta = {
  generatedAt: data.generatedAt,
  isLive: Boolean(data.generatedAt) && data.artistCount > 0,
  trackCount: data.trackCount ?? 0,
  playlistCount: data.playlistCount ?? 0,
};

export const syncedFor = (slug: string): SyncedArtist | undefined => {
  const direct = data.artists?.[slug];
  if (direct) return direct;
  // Aliases (e.g. Chromabone lives under Nosfera Disco Club).
  return Object.values(data.artists ?? {}).find((a) => a.alsoCredits?.includes(slug));
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Titles already described by hand — synced equivalents are skipped. */
const curatedTitles = new Set(releases.map((r) => norm(r.title)));

/* -------------------------------------------------------------------------- */
/* Derived releases                                                            */
/* -------------------------------------------------------------------------- */

let autoIndex = 0;

type PlaylistEntry = { artist: SyncedArtist; playlist: SyncedPlaylist };

/** Same set published on two profiles (a collaboration) -> one release, two credits. */
const mergePlaylists = (entries: PlaylistEntry[]) => {
  const byTitle = new Map<string, { playlist: SyncedPlaylist; slugs: string[] }>();

  entries.forEach(({ artist, playlist }) => {
    const key = norm(playlist.title);
    const existing = byTitle.get(key);
    if (existing) {
      if (!existing.slugs.includes(artist.slug)) existing.slugs.push(artist.slug);
      // Keep whichever copy carries the richer metadata.
      if ((playlist.tracklist?.length ?? 0) > (existing.playlist.tracklist?.length ?? 0)) {
        existing.playlist = playlist;
      }
    } else {
      byTitle.set(key, { playlist, slugs: [artist.slug] });
    }
  });

  return [...byTitle.values()];
};

const nameFor = (slug: string, fallback: string) =>
  artists.find((a) => a.slug === slug)?.name ?? fallback;

const derived: Release[] = mergePlaylists(
  Object.values(data.artists ?? {}).flatMap((artist) =>
    (artist.playlists ?? []).map((playlist) => ({ artist, playlist })),
  ),
)
  .filter(({ playlist }) => !curatedTitles.has(norm(playlist.title)))
  .sort((a, b) => ((b.playlist.date ?? '') > (a.playlist.date ?? '') ? 1 : -1))
  .map(({ playlist, slugs }) => {
    autoIndex += 1;
    const display = slugs.map((s) => nameFor(s, playlist.title)).join(' \u00D7 ');
    return {
      slug: slugify(playlist.title) || `set-${playlist.id}`,
      catalog: `SC-${String(autoIndex).padStart(3, '0')}`,
      title: playlist.title,
      artistSlugs: slugs,
      artistDisplay: display,
      date: playlist.date ?? new Date().toISOString().slice(0, 10),
      format: playlist.trackCount ? `Digital \u00B7 ${playlist.trackCount} tracks` : 'Digital',
      type: playlist.isAlbum ? 'Album' : 'Compilation',
      blurb:
        playlist.description?.trim() ||
        `${playlist.title} \u2014 published by ${display} on SoundCloud.`,
      tracklist: playlist.tracklist?.length ? playlist.tracklist : undefined,
      listenUrl: playlist.url,
      image: playlist.artwork || undefined,
    } satisfies Release;
  });

/** Everything the site should list: curated first, then anything new from SoundCloud. */
export const allReleases: Release[] = [...releases, ...derived].sort((a, b) =>
  b.date > a.date ? 1 : b.date < a.date ? -1 : 0,
);

export const isAutoRelease = (release: Release) => release.catalog.startsWith('SC-');

export const findRelease = (slug: string) => allReleases.find((r) => r.slug === slug);

export const releasesForArtist = (slug: string) =>
  allReleases.filter((r) => r.artistSlugs.includes(slug));

/* -------------------------------------------------------------------------- */
/* Latest tracks                                                               */
/* -------------------------------------------------------------------------- */

export type FeedTrack = SyncedTrack & { artistSlug: string; artistName: string; accent: string };

export const latestTracks = (limit = 8, perArtist = 2): FeedTrack[] =>
  Object.values(data.artists ?? {})
    .flatMap((artist) => {
      const rosterEntry = artists.find((a) => a.slug === artist.slug);
      // Cap each artist so one prolific week cannot swallow the whole feed.
      return (artist.tracks ?? []).slice(0, perArtist).map((track) => ({
        ...track,
        artistSlug: artist.slug,
        artistName: rosterEntry?.name ?? artist.displayName,
        accent: rosterEntry?.accent ?? '#FF4D12',
      }));
    })
    .sort((a, b) => ((b.date ?? '') > (a.date ?? '') ? 1 : -1))
    .slice(0, limit);

export const tracksForArtist = (slug: string, limit = 10): SyncedTrack[] =>
  (syncedFor(slug)?.tracks ?? []).slice(0, limit);
