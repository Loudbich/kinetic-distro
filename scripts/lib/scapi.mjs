/**
 * SoundCloud internal API (api-v2) client.
 *
 * The profile-page scraper this replaced stopped working: SoundCloud no longer
 * server-renders playlists into `window.__sc_hydration`, so `/sets` hydrates
 * with the user object alone and every profile reported zero albums.
 *
 * The web player itself reads those albums from api-v2, authenticated by a
 * `client_id` that ships in its own JavaScript bundle. We recover that id the
 * same way the player gets it — read the page, read its scripts — and then call
 * the same endpoint. No developer account is involved (SoundCloud closed API
 * registration years ago), and only public data is ever requested.
 *
 * This remains the fragile half of the sync: the id rotates and the endpoint is
 * undocumented. Every function here therefore fails soft, exactly like the
 * scraper did — callers get an empty list and the track sync still succeeds.
 */

/** `client_id:"abc…"`, `client_id="abc…"` and `…?client_id=abc…` all appear. */
const CLIENT_ID_RE = /client_id\s*[:=]\s*["']?([A-Za-z0-9]{32})["']?/;

const SCRIPT_SRC_RE = /src="(https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+\.js)"/g;

/**
 * Recovers a usable client_id from the web player's own bundles.
 *
 * The id lives in one of ~9 chunks and it is never the same chunk twice, so we
 * walk them newest-last-first: in every sample the credentials chunk was among
 * the last emitted, which keeps this to one or two extra requests.
 *
 * @returns {Promise<string|null>} null rather than throwing — see module note.
 */
export async function resolveClientId(get, pageUrl = 'https://soundcloud.com/discover') {
  let html;
  try {
    html = await get(pageUrl);
  } catch {
    return null;
  }

  const scripts = [...html.matchAll(SCRIPT_SRC_RE)].map((m) => m[1]);
  if (!scripts.length) return null;

  for (const url of scripts.reverse()) {
    try {
      const js = await get(url);
      const found = js.match(CLIENT_ID_RE);
      if (found) return found[1];
    } catch {
      // A single unreachable chunk says nothing about the others.
    }
  }
  return null;
}

/**
 * Every set on a profile — albums, EPs and plain playlists alike.
 *
 * `/playlists` is deliberate: `/albums` omits the showcase playlists that carry
 * the artist attribution for records published on the label account, and it
 * misses sets the artist never flagged `is_album`. Filtering happens later,
 * where the caller knows what it is looking at.
 */
export async function fetchUserSets(get, { userId, clientId, pageSize = 50, maxPages = 20 }) {
  const sets = [];
  let url =
    `https://api-v2.soundcloud.com/users/${userId}/playlists` +
    `?client_id=${clientId}&limit=${pageSize}&offset=0&linked_partitioning=1`;

  for (let page = 0; url && page < maxPages; page++) {
    const data = JSON.parse(await get(url));
    sets.push(...(data.collection ?? []));
    // next_href carries the cursor but drops the credentials.
    url = data.next_href ? `${data.next_href}&client_id=${clientId}` : null;
  }

  return sets;
}

/**
 * SoundCloud serves a small crop by default; every size shares one stem, so the
 * larger one is a rename away.
 *
 * 1080 rather than 500: a release page shows its cover around 500 CSS pixels
 * wide, which a 500px file cannot fill on any HiDPI screen — it was visibly
 * soft next to the hand-supplied 1000px artwork. Records with their own cover
 * never reach this; it is the fallback for the ones without.
 */
const upsize = (url) => (url || '').replace(/-(?:large|t\d+x\d+)\.jpg$/, '-t1080x1080.jpg');

/**
 * Normalises an api-v2 set into the shape the site already consumes.
 *
 * `release_date` is almost always null on these records — SoundCloud only fills
 * it when the uploader sets it explicitly — so `display_date` is the field that
 * actually reflects when a record went out.
 */
/**
 * A profile's most-played tracks — the "Popular tracks" shelf on SoundCloud.
 *
 * The endpoint returns its own ranking, which is not play order: on the label
 * account the track with 39k plays comes ninth. Callers sort by play count
 * themselves, which is what "the artist's best" actually means.
 *
 * Fails soft like everything else here: no top tracks is a feed that falls back
 * on recency, not a broken build.
 */
export async function fetchTopTracks(get, { userId, clientId, limit = 30 }) {
  try {
    const data = JSON.parse(
      await get(
        `https://api-v2.soundcloud.com/users/${userId}/toptracks?client_id=${clientId}&limit=${limit}`,
      ),
    );
    return (data.collection ?? [])
      .filter((t) => t && typeof t.title === 'string')
      .map((t) => ({
        id: String(t.id),
        title: t.title,
        url: t.permalink_url,
        date: (t.display_date || t.created_at || '').slice(0, 10) || null,
        durationSec: t.duration ? Math.round(t.duration / 1000) : null,
        artwork: upsize(t.artwork_url || ''),
        plays: t.playback_count ?? 0,
      }));
  } catch {
    return [];
  }
}

export function mapSet(raw) {
  const tracks = Array.isArray(raw.tracks) ? raw.tracks : [];

  return {
    id: String(raw.id ?? raw.permalink_url),
    title: raw.title ?? '',
    url: raw.permalink_url ?? '',
    date: (raw.release_date || raw.display_date || raw.created_at || '').slice(0, 10) || null,
    artwork: upsize(raw.artwork_url || ''),
    trackCount: raw.track_count ?? tracks.length ?? null,
    isAlbum: Boolean(raw.is_album),
    setType: raw.set_type || (raw.is_album ? 'album' : 'playlist'),
    description: typeof raw.description === 'string' ? raw.description : '',
    // api-v2 hydrates only the first five tracks of a set; the rest arrive as
    // id-only stubs. Both are kept: `tracklist` is what is known so far, and
    // `trackIds` preserves the running order so hydrateTracklists can fill the
    // gaps and rebuild the list in the right sequence.
    tracklist: tracks.map((t) => (t && typeof t.title === 'string' ? t.title : null)).filter(Boolean),
    trackIds: tracks.map((t) => (t && t.id != null ? String(t.id) : null)).filter(Boolean),
    // Whether the label is giving the record away. Read from the tracks api-v2
    // hydrated on the set — enough to know a free download is on offer, which
    // is all the site claims.
    freeDownload: tracks.some((t) => t && t.downloadable && t.has_downloads_left),
  };
}

/**
 * Fills in the tracks api-v2 left as stubs.
 *
 * Without this, 67 of 73 records list five tracks out of ten or twelve — and
 * those lists are what become MusicRecording entities in the structured data,
 * so a truncated one is a wrong one rather than merely a short one.
 *
 * Ids are gathered across every set and fetched in batches, which turns roughly
 * seventy requests into a couple. The endpoint answers in its own order, so
 * results are indexed by id and each tracklist is rebuilt from `trackIds`.
 *
 * Fails soft: on error the sets keep the partial lists they already had.
 */
export async function hydrateTracklists(get, sets, { clientId, batchSize = 50 } = {}) {
  const known = new Map();
  const wanted = new Set();

  for (const set of sets) {
    // The hydrated titles are the first N in order, so they pair with the first
    // N ids. Anything past that is a stub that has to be fetched.
    set.tracklist.forEach((title, i) => {
      if (set.trackIds[i]) known.set(set.trackIds[i], title);
    });
    set.trackIds.forEach((id) => {
      if (!known.has(id)) wanted.add(id);
    });
  }

  const ids = [...wanted];
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    try {
      const rows = JSON.parse(
        await get(`https://api-v2.soundcloud.com/tracks?ids=${batch.join(',')}&client_id=${clientId}`),
      );
      for (const row of rows ?? []) {
        if (row && typeof row.title === 'string') known.set(String(row.id), row.title);
      }
    } catch {
      // A failed batch costs those titles, not the sync.
    }
  }

  for (const set of sets) {
    const rebuilt = set.trackIds.map((id) => known.get(id)).filter(Boolean);
    if (rebuilt.length >= set.tracklist.length) set.tracklist = rebuilt;
    delete set.trackIds; // ordering scaffolding — never needed by the site
  }

  return sets;
}
