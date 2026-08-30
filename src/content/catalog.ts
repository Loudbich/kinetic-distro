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
import { artists, releases, site, streaming, vinyl, type Release } from './site';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Only the fields a view actually renders. The sync drops the rest — the stream
 * URL above all, which is long and unused because playback runs in SoundCloud's
 * own widget — and caps the list, because this file is imported by the client
 * bundle and anything kept here is downloaded by every visitor.
 */
export type SyncedTrack = {
  id: string;
  title: string;
  url: string;
  date: string | null;
  durationSec: number | null;
  artwork: string;
  /** Play count, on tracks that came from the most-played list. */
  plays?: number;
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
  /** True when SoundCloud is offering the record as a free download. */
  freeDownload?: boolean;
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
  /** The account's most-played tracks, in SoundCloud's own ranking. */
  topTracks: SyncedTrack[];
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

/** The roster slug whose SoundCloud account is really the label's. */
const LABEL_PROFILE = 'grafenberg';

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
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');

/**
 * A hand-supplied cover always beats SoundCloud's, which is capped at 500px and
 * often carries the platform's own framing.
 */
type CoverAsset = { url: string; srcset?: string };

const coverFor = (title: string): CoverAsset | undefined =>
  (art.covers as Record<string, CoverAsset>)[artKey(title)];

export const portraitFor = (slug: string): string | undefined =>
  (art.portraits as Record<string, string>)[slug];

export type KeyVisual = { url: string; width?: number; height?: number; srcset?: string };

/**
 * The artist's wide key visual — the same file the home carousel shows, so a
 * slide and an artist page can never drift apart.
 */
export const keyVisualFor = (slug: string): { wide: KeyVisual; mobile?: KeyVisual } | undefined => {
  const entry = (art.carousel as Record<string, { wide?: KeyVisual; mobile?: KeyVisual }>)[slug];
  return entry?.wide ? { wide: entry.wide, mobile: entry.mobile } : undefined;
};

/**
 * Who a record is credited to, in order of authority: a hand-written entry in
 * attribution.ts, then the credit the sync derived.
 *
 * Three outcomes:
 *   ['grafenberg']  credited to those artists
 *   []              a label release — a compilation across the roster, which
 *                   belongs to no single artist but still belongs on the site
 *   null            not listed at all
 *
 * The empty array only ever comes from a deliberate hand-written entry. A
 * credit the sync could not resolve stays null, because a release pointing at
 * an artist page that does not exist is worse than one that is missing.
 */
const creditFor = (playlist: SyncedPlaylist): string[] | null => {
  const override = attributionFor(playlist.id);
  if (override === null) return null;
  if (override) return override.length ? override.filter((s) => rosterSlugs.has(s)) : [];

  const synced = playlist.credit?.filter((s) => rosterSlugs.has(s)) ?? [];
  return synced.length ? synced : null;
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

/**
 * A SoundCloud description split into paragraphs.
 *
 * These run to a couple of thousand characters across several paragraphs, so
 * rendering the raw string in one <p> ran them together into a wall of text.
 * Blank lines separate paragraphs; single newlines are line breaks inside one
 * and are left as spaces.
 */
const toParagraphs = (description: string): string[] | undefined => {
  const paragraphs = description
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
  return paragraphs.length ? paragraphs : undefined;
};

/** Synced records by normalised title, so a curated entry can find its own notes. */
const syncedByTitle = new Map(
  Object.values(data.artists ?? {})
    .flatMap((a) => a.playlists ?? [])
    .filter((p) => !p.isMirror)
    .map((p) => [norm(p.title), p] as const),
);

/**
 * SoundCloud's classification mapped onto the site's vocabulary.
 *
 * `setType` is the signal that matters: `isAlbum` is also true for EPs, so
 * reading it alone filed every EP in the catalogue as an album.
 */
const releaseType = (playlist: SyncedPlaylist): Release['type'] => {
  if (playlist.setType === 'ep') return 'EP';
  if (playlist.setType === 'single') return 'Single';
  if (/\bremix(es)?\b/i.test(playlist.title)) return 'Remix album';
  return playlist.isAlbum ? 'Album' : 'Compilation';
};

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
    const notes = toParagraphs(playlist.description ?? '');
    // No credited artist means a label release \u2014 a roster-wide compilation.
    const display = slugs.length
      ? slugs.map((s) => nameFor(s, playlist.title)).join(' \u00D7 ')
      : site.name;
    return {
      slug: slugify(playlist.title) || `set-${playlist.id}`,
      catalog: `SC-${String(autoIndex).padStart(3, '0')}`,
      title: playlist.title,
      artistSlugs: slugs,
      artistDisplay: display,
      date: playlist.date ?? new Date().toISOString().slice(0, 10),
      format: playlist.trackCount ? `Digital \u00B7 ${playlist.trackCount} tracks` : 'Digital',
      type: releaseType(playlist),
      // The opening paragraph is the summary; the whole description becomes the
      // liner notes. Using the full text as the blurb turned every card and
      // every meta description into a two-thousand-character block.
      blurb: notes?.[0] || `${playlist.title} \u2014 published by ${display} on SoundCloud.`,
      notes,
      tracklist: playlist.tracklist?.length ? playlist.tracklist : undefined,
      listenUrl: playlist.url,
      streamUrl: playlist.url,
      vinylUrl: vinyl[slugify(playlist.title) || `set-${playlist.id}`],
      streamingLinks: streaming[slugify(playlist.title) || `set-${playlist.id}`],
      image: coverFor(playlist.title)?.url ?? playlist.artwork ?? undefined,
      imageSrcset: coverFor(playlist.title)?.srcset,
      freeDownload: playlist.freeDownload,
    } satisfies Release;
  });

/**
 * Curated entries keep everything they declare, but pick up a cover from the
 * artwork manifest when they do not name one — so dropping a file in
 * assets/covers/ is enough, with no edit to site.ts.
 */
const curated: Release[] = releases.map((r) => ({
  ...r,
  image: r.image ?? coverFor(r.title)?.url,
  imageSrcset: r.imageSrcset ?? coverFor(r.title)?.srcset,
  freeDownload: r.freeDownload ?? syncedByTitle.get(norm(r.title))?.freeDownload,
  // The hand-written blurb stays — it is the short form the cards want. The
  // liner notes come from the record's SoundCloud description, so a release
  // note written once shows up in both places.
  notes: r.notes ?? toParagraphs(syncedByTitle.get(norm(r.title))?.description ?? ''),
  // The hand-written listenUrl points wherever the label wants people sent —
  // an artist's own site, a profile. The player needs the record itself, so it
  // gets the matched SoundCloud set instead of guessing from that link.
  streamUrl: r.streamUrl ?? syncedByTitle.get(norm(r.title))?.url,
  // Same inheritance as the notes: a curated entry that does not spell out its
  // tracklist takes the synced one rather than showing none. Four records were
  // silently dropping a complete tracklist this way — and with it their
  // MusicRecording entities and numTracks.
  tracklist: r.tracklist ?? syncedByTitle.get(norm(r.title))?.tracklist,
  vinylUrl: r.vinylUrl ?? vinyl[r.slug],
  streamingLinks: r.streamingLinks ?? streaming[r.slug],
}));

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

export type FeedTrack = SyncedTrack & {
  artistSlug: string;
  artistName: string;
  accent: string;
  /** The record this track is taken from, when it belongs to one. */
  releaseTitle?: string;
  releaseSlug?: string;
  /** Candidate widths for the artwork, when it comes from a supplied cover. */
  artworkSrcset?: string;
};

/**
 * Which artist a track belongs to, taken from the record that contains it.
 *
 * A loose track on the label account says nothing about who made it — `She
 * accepts (feat. Nehir Sedef)` could be anyone's — but it appears in the
 * tracklist of a release whose credit is already settled, hand-written
 * overrides included. That is why this lives here and not in the sync: at sync
 * time the overrides in attribution.ts have not been applied yet, so a track
 * would inherit the credit its record had *before* correction.
 *
 * Keyed with `artKey`, which keeps parenthesised text: `norm` would collapse
 * `(feat. Nehir Sedef)` and `(Chromabone Neon Exit Remix)` onto one key and
 * hand a remix to the artist being remixed.
 */
const releaseByTrack = new Map<string, Release>();
for (const release of allReleases) {
  // A label compilation credits nobody, so it cannot say who made a track — and
  // being recent it would otherwise claim every track it gathers and strip them
  // all of an artist. Kinetic Distro Essentials alone swallowed 54 of them.
  if (!release.artistSlugs.length) continue;

  for (const title of release.tracklist ?? []) {
    const key = artKey(title);
    // `allReleases` is newest first, so the newest claimant keeps the title. A
    // remix can genuinely sit on two records — its own single and a later
    // compilation — and the recent one is the more useful answer.
    if (!releaseByTrack.has(key)) releaseByTrack.set(key, release);
  }
}

/**
 * The newest tracks, grouped by the artist they are credited to.
 *
 * Not by hosting profile: `grafenbergmusik` is the label's account and carries
 * most of the roster, so grouping by profile put a Chromabone remix under
 * Grafenberg's name and let it push his own album out of the feed entirely.
 *
 * A track nobody can be credited for is left out rather than filed under
 * whoever happens to host it.
 */
/**
 * Each artist's most-played track.
 *
 * Sorted on play count rather than the order SoundCloud returns: its "Popular
 * tracks" shelf has a ranking of its own, and on the label account the track
 * with 39k plays sits ninth in it. Play count is what "the artist's best"
 * means to anyone reading the page.
 *
 * Credit comes from the record containing the track, as everywhere else, so an
 * artist with no SoundCloud account of their own still gets their best track
 * out of the label's list.
 */
export const popularTracks = (limit = 8): FeedTrack[] => {
  const best = new Map<string, FeedTrack>();

  for (const profile of Object.values(data.artists ?? {})) {
    for (const track of profile.topTracks ?? []) {
      const release = releaseByTrack.get(artKey(track.title));
      const slugs =
        release?.artistSlugs ?? (profile.slug === LABEL_PROFILE ? [] : [profile.slug]);

      for (const slug of slugs) {
        const artist = artists.find((a) => a.slug === slug);
        if (!artist) continue;

        const held = best.get(slug);
        if (held && (held.plays ?? 0) >= (track.plays ?? 0)) continue;

        best.set(slug, {
          ...track,
          artistSlug: artist.slug,
          artistName: artist.name,
          accent: artist.accent,
          releaseTitle: release?.title,
          releaseSlug: release?.slug,
          // The record's own cover, which is the supplied 1000–1500px artwork
          // where there is one. SoundCloud's per-track image is capped well
          // below what this module draws and showed visibly soft.
          artwork: release?.image ?? track.artwork,
          artworkSrcset: release?.imageSrcset,
        });
      }
    }
  }

  return [...best.values()].sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0)).slice(0, limit);
};

export const tracksForArtist = (slug: string, limit = 10): SyncedTrack[] =>
  (syncedFor(slug)?.tracks ?? []).slice(0, limit);
