#!/usr/bin/env node
/**
 * KINETIC DISTRO — SOUNDCLOUD SYNC
 * -----------------------------------------------------------------------------
 * Pulls every roster artist's public catalogue from SoundCloud and writes it to
 *   src/content/catalog.generated.json
 * which the site reads at build time. Curated entries in src/content/site.ts
 * always take priority — this file only ever ADDS what isn't already described
 * by hand.
 *
 *   npm run sync              full sync
 *   npm run sync -- --dry     fetch and report, write nothing
 *   npm run sync -- --tracks  skip playlist scraping (RSS only, most reliable)
 *
 * SAFETY: this script never fails a build. Any network or parsing error is
 * reported and the previously generated file is kept as-is. Exit code stays 0
 * unless you pass --strict (used by the scheduled job so failures are visible).
 * -----------------------------------------------------------------------------
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSoundCloudRss } from './lib/rss.mjs';
import { parsePlaylistsFromProfile } from './lib/playlists.mjs';
import { resolveClientId, fetchUserSets, mapSet } from './lib/scapi.mjs';
import { annotateCatalogue, readRoster } from './lib/attribution.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const OUT = resolve(root, 'src/content/catalog.generated.json');

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const TRACKS_ONLY = args.includes('--tracks');
const STRICT = args.includes('--strict');

const UA =
  'Mozilla/5.0 (compatible; KineticDistroSiteBot/1.0; +https://kineticdistro.com) build-time catalogue sync';

/* -------------------------------------------------------------------------- */

const log = (...a) => console.log('[sync]', ...a);
const warn = (...a) => console.warn('[sync] ⚠ ', ...a);

async function get(url, { as = 'text', timeoutMs = 20000, retries = 2 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': UA, Accept: as === 'text' ? '*/*' : 'application/json' },
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      clearTimeout(timer);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  return null;
}

/** Reads the sources list straight out of the TS file — no transpiler needed. */
function readSources() {
  const src = readFileSync(resolve(root, 'src/content/sources.ts'), 'utf8');
  const block = src.slice(src.indexOf('export const soundcloudSources'), src.indexOf('export const labelSource'));
  const entries = [...block.matchAll(/\{[^{}]*slug:\s*'([^']+)'[^{}]*handle:\s*'([^']+)'[^{}]*userId:\s*(\d+)[^{}]*\}/g)];
  return entries.map(([raw, slug, handle, userId]) => ({
    slug,
    handle,
    userId: Number(userId),
    alsoCredits: [...raw.matchAll(/alsoCredits:\s*\[([^\]]*)\]/g)]
      .flatMap(([, list]) => [...list.matchAll(/'([^']+)'/g)].map((m) => m[1])),
  }));
}

/* -------------------------------------------------------------------------- */

/**
 * Sets come from api-v2 when a client_id could be recovered, and from the old
 * profile scraper otherwise. The scraper is kept purely as a fallback: as of
 * the last check it returns nothing, because SoundCloud no longer ships
 * playlists in the server-rendered page — but if api-v2 closes and the markup
 * comes back, the sync keeps working without a code change.
 */
async function fetchSets(source, clientId) {
  if (clientId) {
    try {
      const raw = await fetchUserSets(get, { userId: source.userId, clientId });
      return raw.map(mapSet);
    } catch (err) {
      warn(`${source.slug}: api-v2 sets failed (${err.message}) — trying the profile page`);
    }
  }

  try {
    const html = await get(`https://soundcloud.com/${source.handle}/sets`);
    return parsePlaylistsFromProfile(html);
  } catch (err) {
    warn(`${source.slug}: sets unavailable (${err.message}) — tracks still synced`);
    return [];
  }
}

async function syncArtist(source, clientId) {
  const rssUrl = `https://feeds.soundcloud.com/users/soundcloud:users:${source.userId}/sounds.rss`;
  const profileUrl = `https://soundcloud.com/${source.handle}`;

  const xml = await get(rssUrl);
  const { channel, tracks } = parseSoundCloudRss(xml);

  const playlists = TRACKS_ONLY ? [] : await fetchSets(source, clientId);

  return {
    slug: source.slug,
    handle: source.handle,
    userId: source.userId,
    profileUrl,
    rssUrl,
    displayName: channel.title || source.handle,
    description: channel.description || '',
    avatar: channel.image || '',
    alsoCredits: source.alsoCredits ?? [],
    trackCount: tracks.length,
    latestDate: tracks[0]?.date ?? null,
    tracks,
    playlists,
  };
}

/* -------------------------------------------------------------------------- */

async function main() {
  const sources = readSources();
  log(`${sources.length} sources — ${DRY ? 'dry run' : 'writing ' + OUT.replace(root + '/', '')}`);

  const clientId = TRACKS_ONLY ? null : await resolveClientId(get);
  if (!TRACKS_ONLY) {
    log(clientId ? 'api-v2 client_id resolved' : 'no client_id — falling back to the profile scraper');
  }

  const results = [];
  const failures = [];

  for (const source of sources) {
    try {
      const data = await syncArtist(source, clientId);
      results.push(data);
      log(
        `${data.slug.padEnd(20)} ${String(data.trackCount).padStart(3)} tracks · ` +
          `${String(data.playlists.length).padStart(2)} sets · latest ${data.latestDate ?? '—'}`,
      );
    } catch (err) {
      failures.push({ slug: source.slug, error: err.message });
      warn(`${source.slug}: ${err.message}`);
    }
  }

  if (!results.length) {
    warn('nothing fetched — keeping the existing generated file untouched');
    process.exit(STRICT ? 1 : 0);
  }

  // Who each record is by — resolved here, at build time, so the browser bundle
  // never carries the matching logic. See lib/attribution.mjs for the why.
  const roster = readRoster(resolve(root, 'src/content/site.ts'));
  const annotated = annotateCatalogue(
    Object.fromEntries(results.map((a) => [a.slug, a])),
    roster,
  );

  const sets = Object.values(annotated).flatMap((a) => a.playlists);
  const unresolved = sets.filter((p) => p.creditSource === 'unresolved' && !p.isMirror);
  log(
    `credits — ${sets.filter((p) => !p.isMirror).length} records, ` +
      `${sets.filter((p) => p.isMirror).length} label mirrors skipped, ` +
      `${unresolved.length} unresolved`,
  );
  unresolved.forEach((p) => warn(`no credit for "${p.title}" — add it to src/content/attribution.ts`));

  // The generated file is imported by the client bundle, so everything kept
  // here is downloaded by every visitor. The site shows at most 10 tracks on an
  // artist page and 2 per artist in the home feed, so a dozen is already more
  // than any view can display — the other 630 were pure weight. `trackCount`
  // still reports the real total.
  const MAX_TRACKS = 12;
  for (const artist of Object.values(annotated)) {
    // Mirrors have done their job: they were only ever evidence for who a
    // record is by, and that credit is now baked into the album itself. The
    // site filters them out, so shipping them would be dead weight.
    artist.playlists = artist.playlists.filter((p) => !p.isMirror);

    artist.tracks = artist.tracks.slice(0, MAX_TRACKS).map(({ id, title, url, date, durationSec }) => ({
      id,
      title,
      url,
      date,
      durationSec,
      // `artwork` and `audio` are dropped: no view renders a per-track image,
      // and playback happens on SoundCloud, not here.
    }));
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: 'soundcloud-rss + api-v2',
    artistCount: results.length,
    // Totals describe the catalogue, not the trimmed file: trackCount is every
    // track the artists have published, playlistCount every record kept.
    trackCount: results.reduce((n, a) => n + a.trackCount, 0),
    playlistCount: Object.values(annotated).reduce((n, a) => n + a.playlists.length, 0),
    failures,
    artists: annotated,
  };

  if (DRY) {
    log('dry run — no file written');
    log(JSON.stringify({ ...payload, artists: Object.keys(payload.artists) }, null, 2));
  } else {
    mkdirSync(dirname(OUT), { recursive: true });
    // Only rewrite when something actually changed, so scheduled jobs don't
    // produce empty commits.
    const next = JSON.stringify(payload, null, 2) + '\n';
    const prev = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
    const stripStamp = (s) => s.replace(/"generatedAt": "[^"]*",?\n/, '');
    if (stripStamp(prev) === stripStamp(next)) {
      log('no changes');
    } else {
      writeFileSync(OUT, next);
      log(`written — ${payload.playlistCount} records, ${payload.trackCount} tracks published`);
    }
  }

  if (failures.length && STRICT) process.exit(1);
}

main().catch((err) => {
  warn(err.stack || err.message);
  process.exit(STRICT ? 1 : 0);
});
