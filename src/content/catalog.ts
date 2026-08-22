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
import art from './covers.generated.json';
import { attributionFor } from './attribution';
import { artists, releases, type Release } from './site';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Only the fields a view actually renders. The sync deliberately drops the rest
 * (per-track artwork, stream URLs) and caps the list — this file is imported by
 * the client bundle, so anything kept here is downloaded by every visitor.
 */
export type SyncedTrack = {
  id: string;
  title: string;
  url: string;
  date: string | null;
  durationSec: number | null;
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
  /**
   * Roster slugs this record is by — worked out at sync time, because the
   * hosting profile is not the credit: `grafenbergmusik` is the label's own
   * account and carries most of the catalogue. See scripts/lib/attribution.mjs.
   */
  credit: string[];
  /** How that credit was reached — 'unresolved' means nobody could be matched. */
  creditSource: 'showcase' | 'title' | 'profile' | 'profile+showcase' | 'unresolved';
  /**
   * A label showcase playlist duplicating a record that already exists as an
   * album on the artist's own profile. Listing these would double the catalogue.
   */
  isMirror: boolean;
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

const rosterSlugs = new Set(artists.map((a) => a.slug));

/**
 * Artwork key. Deliberately NOT `norm` — that one strips bracketed text so a
 * `[Remaster]` suffix cannot stop a synced record matching its curated twin,
 * which would make two different records collide on the same cover. Kept in
 * step with `norm` in scripts/lib/attribution.mjs, which writes the manifest.
 */
const artKey = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '');

/**
 * A hand-supplied cover always beats SoundCloud's, which is capped at 500px and
 * often carries the platform's own framing.
 */
const coverFor = (title: string): string | undefined =>
  (art.covers as Record<string, string>)[artKey(title)];

export const portraitFor = (slug: string): string | undefined =>
  (art.portraits as Record<string, string>)[slug];

/**
 * Who a record is credited to, in order of authority: a hand-written entry in
 * attribution.ts, then the credit the sync derived, then nothing.
 *
 * Returns null when the record should not be listed at all — either hidden on
 * purpose, or credited to nobody the roster knows about, which would otherwise
 * produce a release with no artist page behind it.
 */
const creditFor = (playlist: SyncedPlaylist): string[] | null => {
  const override = attributionFor(playlist.id);
  const slugs = override === undefined ? playlist.credit : override;
  if (!slugs?.length) return null;

  const known = slugs.filter((s) => rosterSlugs.has(s));
  return known.length ? known : null;
};

/* -------------------------------------------------------------------------- */
/* Derived releases                                                            */
/* -------------------------------------------------------------------------- */

let autoIndex = 0;

/** Same record published on two profiles (a collaboration) -> one release, two credits. */
const mergePlaylists = (playlists: SyncedPlaylist[]) => {
  const byTitle = new Map<string, { playlist: SyncedPlaylist; slugs: string[] }>();

  playlists.forEach((playlist) => {
    const key = norm(playlist.title);
    const slugs = creditFor(playlist);
    if (!slugs) return; // explicitly hidden in attribution.ts

    const existing = byTitle.get(key);
    if (existing) {
      slugs.forEach((s) => {
        if (!existing.slugs.includes(s)) existing.slugs.push(s);
      });
      // Keep whichever copy carries the richer metadata.
      if ((playlist.tracklist?.length ?? 0) > (existing.playlist.tracklist?.length ?? 0)) {
        existing.playlist = playlist;
      }
    } else {
      byTitle.set(key, { playlist, slugs: [...slugs] });
    }
  });

  return [...byTitle.values()];
};

const nameFor = (slug: string, fallback: string) =>
  artists.find((a) => a.slug === slug)?.name ?? fallback;

const derived: Release[] = mergePlaylists(
  Object.values(data.artists ?? {})
    .flatMap((artist) => artist.playlists ?? [])
    // Label showcase duplicates of records that exist on the artist's own page.
    .filter((playlist) => !playlist.isMirror),
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
      image: coverFor(playlist.title) ?? playlist.artwork ?? undefined,
    } satisfies Release;
  });

/**
 * Curated entries keep everything they declare, but pick up a cover from the
 * artwork manifest when they do not name one — so dropping a file in
 * assets/covers/ is enough, with no edit to site.ts.
 */
const curated: Release[] = releases.map((r) => ({ ...r, image: r.image ?? coverFor(r.title) }));

/** Everything the site should list: curated first, then anything new from SoundCloud. */
export const allReleases: Release[] = [...curated, ...derived].sort((a, b) =>
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
