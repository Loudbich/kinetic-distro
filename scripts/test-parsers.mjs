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

console.log(`\n${passed} passed${process.exitCode ? ' — with failures' : ''}\n`);
