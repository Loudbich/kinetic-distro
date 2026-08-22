/**
 * Working out who a record is actually by.
 *
 * `grafenbergmusik` is Kinetic Distro's own SoundCloud account rather than the
 * artist Grafenberg's, and about half the catalogue is published there. Taking
 * the hosting profile as the credit would file most of the roster's records
 * under Grafenberg.
 *
 * The label does leave the attribution in plain sight: every record it hosts is
 * mirrored as a showcase playlist named `Artist - Title [FULL ALBUM]`. Reading
 * that prefix credits 25 of 30 correctly; the rest are corrected by hand in
 * src/content/attribution.ts.
 *
 * Node-only — the sync bakes the result into catalog.generated.json so the
 * browser bundle never has to do any of this.
 */

import { readFileSync } from 'node:fs';

/** The roster slug whose SoundCloud profile is really the label account. */
export const LABEL_PROFILE_SLUG = 'grafenberg';

export const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '');

/** `(Full Album)`, `[FULL EP]` and friends are decoration, not part of a title. */
export const stripDecorations = (title) =>
  String(title)
    .replace(/\s*[([](?:full\s*album|full\s*ep|album\s*complet|complete\s*album)[)\]]\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Splits `Artist - Title` into its two halves.
 *
 * The label is inconsistent about the separator — ` - `, ` _ `, ` — `, ` : `
 * all occur — and the artist half is short, which is what stops a title
 * containing a dash from being mistaken for a credit.
 */
export function creditOf(rawTitle) {
  const title = stripDecorations(rawTitle);
  const m = title.match(/^(.{2,40}?)\s*(?: - | _ | — | – | : )\s*(.+)$/);
  return m ? { who: m[1].trim(), title: m[2].trim() } : { who: null, title };
}

/**
 * Like `creditOf`, but only believes the prefix when it names someone on the
 * roster.
 *
 * Titles carry separators of their own — `RELICS FROM ANOTHER EARTH - VOL. 2`,
 * `Love and venom taste the same : Evolved` — and a naive split turns half the
 * title into a fictitious artist, which then fails to match its own showcase
 * playlist. Requiring the prefix to resolve makes the split self-checking.
 */
export function creditOfKnown(rawTitle, roster) {
  const split = creditOf(rawTitle);
  if (split.who && resolveCredit(split.who, roster)) return split;
  return { who: null, title: stripDecorations(rawTitle) };
}

/** SoundCloud flags albums inconsistently; EPs and singles count as records too. */
export const isAlbumLike = (set) =>
  Boolean(set.isAlbum) || ['album', 'ep', 'single'].includes(set.setType);

/* -------------------------------------------------------------------------- */
/* Roster lookup                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Reads slug/name pairs straight out of site.ts, the same trick readSources()
 * uses for sources.ts. Deriving the table from the roster rather than hardcoding
 * it means renaming an artist cannot silently break their credits.
 */
export function readRoster(siteTsPath) {
  const src = readFileSync(siteTsPath, 'utf8');
  // Scanned over the whole file rather than a named block: a `slug` immediately
  // followed by a `name` only ever occurs in an artist entry — a release
  // follows its slug with `catalog` — so this survives the array being renamed
  // or moved, which a slice between two marker strings does not.
  const roster = [...src.matchAll(/slug:\s*'([^']+)',\s*\n\s*name:\s*'([^']+)'/g)].map(([, slug, name]) => ({
    slug,
    name,
  }));

  if (!roster.length) throw new Error(`no artists found in ${siteTsPath} — the roster parser needs updating`);
  return roster;
}

/** How the label writes a credit vs. how the roster spells the name. */
const ALIASES = {
  veinmirror: 'vein-mirror',
  nosferadisco: 'nosfera-disco-club',
  kineticdistro: null, // the label itself is not an artist
};

/**
 * `Grafenberg x Broken Shaman`, `Chromabone presents Broken Shaman` and
 * `A & B` all describe a shared credit, so the separator list is deliberately
 * generous — an unknown name simply drops out.
 */
export function resolveCredit(who, roster) {
  if (!who) return null;

  const bySlug = new Map(roster.map((a) => [norm(a.name), a.slug]));

  const slugs = who
    .split(/\s+(?:x|×|vs\.?|feat\.?|featuring|presents|and|&|\+)\s+/i)
    .map((part) => {
      const key = norm(part);
      if (key in ALIASES) return ALIASES[key];
      return bySlug.get(key) ?? roster.find((a) => norm(a.slug) === key)?.slug ?? null;
    })
    .filter(Boolean);

  return slugs.length ? [...new Set(slugs)] : null;
}

/* -------------------------------------------------------------------------- */

/**
 * Annotates every profile's sets with a credit and a mirror flag.
 *
 * This has to run across the whole catalogue rather than profile by profile,
 * because a label-hosted album carries no credit of its own — `The touch era`
 * is just that on the album record. The credit lives on the separate showcase
 * playlist, `Nosfera Disco Club - the touch era [FULL ALBUM]`, so the two have
 * to be matched on title before either can be resolved.
 *
 * The same index also identifies mirrors: 41 of the label's 50 playlists
 * duplicate a record that already exists as an album on the artist's own
 * profile, and listing those would double half the catalogue.
 *
 * @param artists  slug -> { playlists } as stored in catalog.generated.json
 * @returns the same map with each set annotated
 */
export function annotateCatalogue(artists, roster) {
  const entries = Object.entries(artists);

  // Every album title anywhere in the catalogue.
  const albumTitleKeys = new Set(
    entries.flatMap(([, a]) =>
      (a.playlists ?? []).filter(isAlbumLike).map((p) => norm(creditOfKnown(p.title, roster).title)),
    ),
  );

  // Title -> credit, harvested from the label's showcase playlists.
  const creditByTitle = new Map();
  for (const p of artists[LABEL_PROFILE_SLUG]?.playlists ?? []) {
    if (isAlbumLike(p)) continue;
    const { who, title } = creditOfKnown(p.title, roster);
    const slugs = resolveCredit(who, roster);
    if (slugs) creditByTitle.set(norm(title), slugs);
  }

  const annotate = (set, profileSlug) => {
    const own = creditOfKnown(set.title, roster);
    const key = norm(own.title);
    const album = isAlbumLike(set);
    const isLabel = profileSlug === LABEL_PROFILE_SLUG;

    const fromShowcase = creditByTitle.get(key) ?? null;
    const fromTitle = resolveCredit(own.who, roster);

    let credit;
    let creditSource;

    if (isLabel) {
      // Nothing about the hosting profile implies Grafenberg here.
      credit = fromShowcase ?? fromTitle;
      creditSource = fromShowcase ? 'showcase' : fromTitle ? 'title' : 'unresolved';
    } else {
      // The artist's own profile is itself the credit; a showcase may add a
      // collaborator the profile alone would not reveal.
      const extra = fromShowcase ?? fromTitle ?? [];
      credit = [...new Set([profileSlug, ...extra])];
      creditSource = extra.length ? 'profile+showcase' : 'profile';
    }

    return {
      ...set,
      // `Broken Shaman - Piano in the Snow` becomes `Piano in the Snow`: the
      // credit is displayed separately, so leaving it in the title repeats the
      // artist in every heading, URL and <title> tag. Only a prefix that
      // resolved to a roster artist is removed — see creditOfKnown.
      title: own.title,
      credit,
      creditSource,
      isMirror: !album && albumTitleKeys.has(key),
    };
  };

  return Object.fromEntries(
    entries.map(([slug, artist]) => [
      slug,
      { ...artist, playlists: (artist.playlists ?? []).map((p) => annotate(p, slug)) },
    ]),
  );
}
