/**
 * Offline stub for `fetch`, used to exercise the full sync script without
 * touching the network:
 *
 *   node --import ./scripts/__fixtures__/fetch-stub.mjs scripts/sync-soundcloud.mjs --dry
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const rss = readFileSync(resolve(here, 'sounds.rss'), 'utf8');

const hydration = [
  {
    hydratable: 'playlists',
    data: {
      collection: [
        {
          kind: 'playlist',
          id: 42,
          title: 'Stub Set',
          permalink_url: 'https://soundcloud.com/stub/sets/stub-set',
          release_date: '2026-08-18T00:00:00Z',
          artwork_url: 'https://i1.sndcdn.com/artworks-42-large.jpg',
          track_count: 3,
          is_album: true,
          description: 'Fixture album.',
          tracks: [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }],
        },
      ],
    },
  },
];

const profileHtml = `<html><script>window.__sc_hydration = ${JSON.stringify(hydration)};</script></html>`;

globalThis.fetch = async (url) => {
  const body = String(url).includes('sounds.rss') ? rss : profileHtml;
  return { ok: true, status: 200, text: async () => body };
};
