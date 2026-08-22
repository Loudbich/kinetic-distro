#!/usr/bin/env node
/**
 * Offline tests for the sync parsers. No network — runs against fixtures, so
 * regressions surface in CI even when SoundCloud is unreachable.
 *
 *   npm test
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { parseSoundCloudRss, upsizeArtwork } from './lib/rss.mjs';
import { parsePlaylistsFromProfile } from './lib/playlists.mjs';
import { resolveClientId, fetchUserSets, mapSet, hydrateTracklists } from './lib/scapi.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => readFileSync(resolve(__dirname, '__fixtures__', name), 'utf8');

let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}\n    ${err.message}`);
    process.exitCode = 1;
  }
};

const testAsync = async (name, fn) => {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}\n    ${err.message}`);
    process.exitCode = 1;
  }
};

console.log('\nRSS parser');

const { channel, tracks } = parseSoundCloudRss(fixture('sounds.rss'));

test('reads the channel', () => {
  assert.equal(channel.title, 'Broken Shaman');
  assert.equal(channel.link, 'https://soundcloud.com/broken_shaman');
  assert.equal(channel.description, 'The ritual never ended. It only changed form.');
  assert.match(channel.image, /^https:\/\/i1\.sndcdn\.com\/avatars-/);
});

test('reads every item', () => {
  assert.equal(tracks.length, 3);
});

test('sorts newest first', () => {
  assert.deepEqual(
    tracks.map((t) => t.date),
    ['2026-08-22', '2026-08-18', '2026-08-03'],
  );
});

test('extracts the numeric track id from the guid', () => {
  assert.deepEqual(
    tracks.map((t) => t.id),
    ['555', '1234567890', '999'],
  );
});

test('decodes CDATA and HTML entities in titles', () => {
  const titles = tracks.map((t) => t.title);
  assert.ok(titles.includes('Chrome Pulse'));
  assert.ok(titles.includes('Ghost Interface (feat. Jack & Razor)'));
  assert.ok(titles.includes('Suréveillance Bloom'));
});

test('parses mm:ss, hh:mm:ss and raw-seconds durations', () => {
  const byId = Object.fromEntries(tracks.map((t) => [t.id, t.durationSec]));
  assert.equal(byId['1234567890'], 221); // 03:41
  assert.equal(byId['999'], 3727); // 1:02:07
  assert.equal(byId['555'], 221); // raw seconds
});

test('falls back to the channel image when an item has no artwork', () => {
  const ghost = tracks.find((t) => t.id === '999');
  assert.equal(ghost.artwork, channel.image);
});

test('upsizes artwork crops', () => {
  assert.equal(
    upsizeArtwork('https://i1.sndcdn.com/artworks-111-large.jpg'),
    'https://i1.sndcdn.com/artworks-111-t500x500.jpg',
  );
  assert.equal(
    upsizeArtwork('https://i1.sndcdn.com/artworks-555-t67x67.png'),
    'https://i1.sndcdn.com/artworks-555-t500x500.png',
  );
});

test('rejects non-RSS input', () => {
  assert.throws(() => parseSoundCloudRss('<html><body>nope</body></html>'), /Not an RSS document/);
});

console.log('\nPlaylist parser');

const hydration = [
  { hydratable: 'user', data: { id: 1663724420, permalink: 'broken_shaman' } },
  {
    hydratable: 'playlists',
    data: {
      collection: [
        {
          kind: 'playlist',
          id: 42,
          title: 'Chrome Syndicate Dreams',
          permalink_url: 'https://soundcloud.com/broken_shaman/sets/chrome-syndicate-dreams',
          release_date: '2026-08-18T00:00:00Z',
          artwork_url: 'https://i1.sndcdn.com/artworks-42-large.jpg',
          track_count: 10,
          is_album: true,
          set_type: 'album',
          description: 'A full collaboration.',
          tracks: [{ title: 'Data Seduction' }, { title: 'Chrome Pulse' }],
        },
        {
          kind: 'playlist',
          id: 43,
          title: 'Live Rituals',
          permalink_url: 'https://soundcloud.com/broken_shaman/sets/live-rituals',
          created_at: '2026-05-02T00:00:00Z',
          artwork_url: '',
          track_count: 4,
          is_album: false,
        },
      ],
    },
  },
];

const page = `<html><script>window.__sc_hydration = ${JSON.stringify(hydration)};</script></html>`;
const playlists = parsePlaylistsFromProfile(page);

test('finds every playlist in the hydration payload', () => {
  assert.equal(playlists.length, 2);
});

test('sorts playlists newest first', () => {
  assert.deepEqual(
    playlists.map((p) => p.title),
    ['Chrome Syndicate Dreams', 'Live Rituals'],
  );
});

test('maps album metadata', () => {
  const album = playlists[0];
  assert.equal(album.isAlbum, true);
  assert.equal(album.trackCount, 10);
  assert.equal(album.date, '2026-08-18');
  assert.deepEqual(album.tracklist, ['Data Seduction', 'Chrome Pulse']);
  assert.equal(album.artwork, 'https://i1.sndcdn.com/artworks-42-t500x500.jpg');
});

test('survives a page with no hydration block', () => {
  assert.deepEqual(parsePlaylistsFromProfile('<html>nothing here</html>'), []);
});

test('survives malformed JSON without throwing', () => {
  assert.deepEqual(parsePlaylistsFromProfile('<script>window.__sc_hydration = [{"a":;</script>'), []);
});

test('handles brackets inside string values', () => {
  const tricky = `<script>window.__sc_hydration = [{"kind":"playlist","id":7,"title":"Sets [Vol. 1]","permalink_url":"https://soundcloud.com/x/sets/v1","created_at":"2026-01-01T00:00:00Z"}];</script>`;
  const out = parsePlaylistsFromProfile(tricky);
  assert.equal(out.length, 1);
  assert.equal(out[0].title, 'Sets [Vol. 1]');
});

/* -------------------------------------------------------------------------- */

console.log('\napi-v2 client');

/** Builds a `get` that answers from a url→body map and records what was asked. */
const fakeGet = (routes) => {
  const seen = [];
  return Object.assign(
    async (url) => {
      seen.push(url);
      const hit = Object.entries(routes).find(([frag]) => url.includes(frag));
      if (!hit) throw new Error(`unexpected request: ${url}`);
      if (hit[1] instanceof Error) throw hit[1];
      return hit[1];
    },
    { seen },
  );
};

const playerPage = `<html>
  <script src="https://a-v2.sndcdn.com/assets/0-aaa.js"></script>
  <script src="https://a-v2.sndcdn.com/assets/9-zzz.js"></script>
</html>`;

await testAsync('recovers the client_id from a player bundle', async () => {
  const get = fakeGet({
    '/discover': playerPage,
    '0-aaa.js': 'no credentials in this chunk',
    '9-zzz.js': 'x,client_application_id:46941,client_id:"abcdefghij0123456789ABCDEFGHIJ12",y',
  });
  assert.equal(await resolveClientId(get), 'abcdefghij0123456789ABCDEFGHIJ12');
});

await testAsync('reads the last-emitted chunk first', async () => {
  const get = fakeGet({
    '/discover': playerPage,
    '0-aaa.js': 'client_id:"00000000000000000000000000000000"',
    '9-zzz.js': 'client_id:"99999999999999999999999999999999"',
  });
  assert.equal(await resolveClientId(get), '99999999999999999999999999999999');
  assert.ok(!get.seen.includes('https://a-v2.sndcdn.com/assets/0-aaa.js'), 'stopped at the first hit');
});

await testAsync('accepts the query-string spelling of client_id', async () => {
  const get = fakeGet({
    '/discover': playerPage,
    '9-zzz.js': '"https://api-v2.soundcloud.com/me?client_id=qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"',
    '0-aaa.js': '',
  });
  assert.equal(await resolveClientId(get), 'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
});

await testAsync('a dead chunk does not abort the search', async () => {
  const get = fakeGet({
    '/discover': playerPage,
    '9-zzz.js': new Error('HTTP 404'),
    '0-aaa.js': 'client_id:"11111111111111111111111111111111"',
  });
  assert.equal(await resolveClientId(get), '11111111111111111111111111111111');
});

await testAsync('returns null rather than throwing when nothing matches', async () => {
  const get = fakeGet({ '/discover': '<html>no player here</html>' });
  assert.equal(await resolveClientId(get), null);
});

await testAsync('returns null when the page itself is unreachable', async () => {
  const get = fakeGet({ '/discover': new Error('ECONNREFUSED') });
  assert.equal(await resolveClientId(get), null);
});

await testAsync('follows next_href across pages and re-attaches the client_id', async () => {
  const page1 = JSON.stringify({
    collection: [{ id: 1, title: 'One', permalink_url: 'u1' }],
    next_href: 'https://api-v2.soundcloud.com/users/7/playlists?offset=50',
  });
  const page2 = JSON.stringify({ collection: [{ id: 2, title: 'Two', permalink_url: 'u2' }], next_href: null });
  let call = 0;
  const get = async (url) => {
    call++;
    if (call === 1) return page1;
    assert.ok(url.includes('client_id=KEY'), 'cursor url carries the credentials');
    return page2;
  };

  const sets = await fetchUserSets(get, { userId: 7, clientId: 'KEY' });
  assert.deepEqual(
    sets.map((s) => s.title),
    ['One', 'Two'],
  );
});

await testAsync('stops paginating at maxPages', async () => {
  const endless = JSON.stringify({
    collection: [{ id: 1, title: 'Loop', permalink_url: 'u' }],
    next_href: 'https://api-v2.soundcloud.com/next',
  });
  const get = async () => endless;
  const sets = await fetchUserSets(get, { userId: 7, clientId: 'KEY', maxPages: 3 });
  assert.equal(sets.length, 3);
});

test('maps an api-v2 set onto the site shape', () => {
  const out = mapSet({
    id: 2285385039,
    title: 'CHROME SYNDICATE DREAMS',
    permalink_url: 'https://soundcloud.com/grafenbergmusik/sets/chrome-syndicate-dreams',
    release_date: null,
    display_date: '2026-08-18T10:22:43Z',
    artwork_url: 'https://i1.sndcdn.com/artworks-upyLB-large.jpg',
    track_count: 11,
    is_album: true,
    set_type: 'album',
    description: 'Some connections were never meant to survive.',
    tracks: [{ title: 'Switch//ON' }, { title: 'Boot Sequence' }],
  });

  assert.equal(out.id, '2285385039');
  assert.equal(out.date, '2026-08-18', 'falls back to display_date when release_date is null');
  assert.equal(out.artwork, 'https://i1.sndcdn.com/artworks-upyLB-t500x500.jpg');
  assert.equal(out.isAlbum, true);
  assert.equal(out.setType, 'album');
  assert.deepEqual(out.tracklist, ['Switch//ON', 'Boot Sequence']);
});

test('drops the id-only track stubs api-v2 returns past the first page', () => {
  const out = mapSet({
    id: 1,
    title: 'Long set',
    permalink_url: 'u',
    display_date: '2026-01-01T00:00:00Z',
    track_count: 40,
    tracks: [{ title: 'Real' }, { id: 99 }, null],
  });
  assert.deepEqual(out.tracklist, ['Real']);
  assert.equal(out.trackCount, 40, 'the count still reflects the whole set');
});

await testAsync('fills in stub tracks and restores the running order', async () => {
  const set = {
    tracklist: ['One', 'Two'],
    trackIds: ['1', '2', '3', '4'],
  };
  // The endpoint answers in its own order — deliberately not the requested one.
  const get = async (url) => {
    assert.ok(url.includes('ids=3,4'), 'only the unknown ids are requested');
    return JSON.stringify([
      { id: 4, title: 'Four' },
      { id: 3, title: 'Three' },
    ]);
  };

  await hydrateTracklists(get, [set], { clientId: 'KEY' });
  assert.deepEqual(set.tracklist, ['One', 'Two', 'Three', 'Four']);
  assert.equal(set.trackIds, undefined, 'ordering scaffolding is stripped');
});

await testAsync('batches ids across every set at once', async () => {
  const sets = [
    { tracklist: [], trackIds: ['1', '2'] },
    { tracklist: [], trackIds: ['3'] },
  ];
  let calls = 0;
  const get = async () => {
    calls++;
    return JSON.stringify([
      { id: 1, title: 'A' },
      { id: 2, title: 'B' },
      { id: 3, title: 'C' },
    ]);
  };

  await hydrateTracklists(get, sets, { clientId: 'KEY' });
  assert.equal(calls, 1, 'one request, not one per set');
  assert.deepEqual(sets[0].tracklist, ['A', 'B']);
  assert.deepEqual(sets[1].tracklist, ['C']);
});

await testAsync('a failed batch keeps the titles already known', async () => {
  const set = { tracklist: ['One'], trackIds: ['1', '2'] };
  const get = async () => {
    throw new Error('HTTP 500');
  };

  await hydrateTracklists(get, [set], { clientId: 'KEY' });
  assert.deepEqual(set.tracklist, ['One'], 'partial list survives');
});

console.log(`\n${passed} passed${process.exitCode ? ' — with failures' : ''}\n`);
