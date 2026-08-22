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

/** SoundCloud serves a 100×100 crop by default; every size shares one stem. */
const upsize = (url) => (url || '').replace(/-(?:large|t\d+x\d+)\.jpg$/, '-t500x500.jpg');

/**
 * Normalises an api-v2 set into the shape the site already consumes.
 *
 * `release_date` is almost always null on these records — SoundCloud only fills
 * it when the uploader sets it explicitly — so `display_date` is the field that
 * actually reflects when a record went out.
 */
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
    // Beyond the first page of a long set, api-v2 returns id-only stubs.
    tracklist: tracks.map((t) => (t && typeof t.title === 'string' ? t.title : null)).filter(Boolean),
  };
}
