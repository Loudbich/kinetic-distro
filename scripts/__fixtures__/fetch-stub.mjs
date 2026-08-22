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

/* The api-v2 path — the one the sync actually takes now. The scraper fixtures
   above are still served, so a run with SC_STUB_NO_API=1 exercises the fallback. */

const useApi = !process.env.SC_STUB_NO_API;

const playerPage =
  '<html><script src="https://a-v2.sndcdn.com/assets/50-stub.js"></script></html>';

const playerBundle = 'client_application_id:46941,client_id:"stubstubstubstubstubstubstub1234"';

const apiSets = JSON.stringify({
  collection: [
    {
      id: 42,
      kind: 'playlist',
      title: 'Stub Set',
      permalink_url: 'https://soundcloud.com/stub/sets/stub-set',
      display_date: '2026-08-18T00:00:00Z',
      artwork_url: 'https://i1.sndcdn.com/artworks-42-large.jpg',
      track_count: 3,
      is_album: true,
      set_type: 'album',
      description: 'Fixture album.',
      tracks: [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }],
    },
  ],
  next_href: null,
});

globalThis.fetch = async (url) => {
  const u = String(url);
  let body;

  if (u.includes('sounds.rss')) body = rss;
  else if (u.includes('api-v2.soundcloud.com')) body = apiSets;
  else if (u.includes('a-v2.sndcdn.com')) body = playerBundle;
  else if (u.includes('/discover')) body = useApi ? playerPage : '<html>no player</html>';
  else body = profileHtml;

  return { ok: true, status: 200, text: async () => body };
};
