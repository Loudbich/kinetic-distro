/**
 * Best-effort extraction of a SoundCloud profile's playlists ("sets" = albums, EPs).
 *
 * The RSS feed only carries individual tracks, never playlists. SoundCloud has no
 * open API for new applications, so the only public source for a set list is the
 * server-rendered profile page, which embeds its state in a
 * `window.__sc_hydration = [...]` array.
 *
 * This is the fragile half of the sync — SoundCloud can change its markup at any
 * time. It therefore NEVER throws: on failure it returns an empty list, the track
 * sync still succeeds, and the previously generated data is retained.
 */

import { upsizeArtwork } from './rss.mjs';

const findHydration = (html) => {
  const marker = '__sc_hydration =';
  const start = html.indexOf(marker);
  if (start === -1) return null;

  // The payload is a JSON array terminated by `;` before the closing script tag.
  const from = html.indexOf('[', start);
  if (from === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = from; i < html.length; i++) {
    const ch = html[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(from, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
};

const collectPlaylists = (node, out, seen = new Set()) => {
  if (!node || typeof node !== 'object' || seen.has(node)) return;
  seen.add(node);

  if (Array.isArray(node)) {
    node.forEach((n) => collectPlaylists(n, out, seen));
    return;
  }

  const isPlaylist =
    node.kind === 'playlist' && typeof node.title === 'string' && typeof node.permalink_url === 'string';

  if (isPlaylist) {
    out.set(String(node.id ?? node.permalink_url), {
      id: String(node.id ?? node.permalink_url),
      title: node.title,
      url: node.permalink_url,
      date: (node.release_date || node.display_date || node.created_at || '').slice(0, 10) || null,
      artwork: upsizeArtwork(node.artwork_url || ''),
      trackCount: node.track_count ?? (Array.isArray(node.tracks) ? node.tracks.length : null),
      isAlbum: Boolean(node.is_album),
      setType: node.set_type || (node.is_album ? 'album' : 'playlist'),
      description: typeof node.description === 'string' ? node.description : '',
      tracklist: Array.isArray(node.tracks)
        ? node.tracks.map((t) => (t && typeof t.title === 'string' ? t.title : null)).filter(Boolean)
        : [],
    });
  }

  Object.values(node).forEach((v) => {
    if (v && typeof v === 'object') collectPlaylists(v, out, seen);
  });
};

export function parsePlaylistsFromProfile(html) {
  const hydration = findHydration(html);
  if (!hydration) return [];

  const found = new Map();
  collectPlaylists(hydration, found);

  return [...found.values()].sort((a, b) => ((b.date ?? '') > (a.date ?? '') ? 1 : -1));
}
