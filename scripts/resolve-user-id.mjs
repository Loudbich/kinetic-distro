#!/usr/bin/env node
/**
 * Resolves a SoundCloud profile URL to its permanent numeric user id.
 *
 *   npm run resolve -- https://soundcloud.com/broken_shaman
 *   → broken_shaman  1663724420
 *
 * Paste the id into src/content/sources.ts. You only ever need to do this once
 * per artist: the id survives profile renames, which is why the sync script
 * relies on it rather than on the handle.
 */

const url = process.argv[2];

if (!url || !/^https?:\/\/(www\.)?soundcloud\.com\//.test(url)) {
  console.error('Usage: npm run resolve -- https://soundcloud.com/<handle>');
  process.exit(1);
}

const handle = url.replace(/\/+$/, '').split('/').pop();

const res = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KineticDistroSiteBot/1.0)' },
});

if (!res.ok) {
  console.error(`Could not load the profile (HTTP ${res.status}).`);
  process.exit(1);
}

const html = await res.text();

const id =
  (html.match(/soundcloud:\/\/users:(\d+)/) || [])[1] ??
  (html.match(/"urn"\s*:\s*"soundcloud:users:(\d+)"/) || [])[1] ??
  (html.match(/soundcloud:users:(\d+)/) || [])[1];

if (!id) {
  console.error('No user id found in the page. The profile may be private, or SoundCloud changed its markup.');
  process.exit(1);
}

console.log(`\n  { slug: '${handle.replace(/_/g, '-')}', handle: '${handle}', userId: ${id} },\n`);
