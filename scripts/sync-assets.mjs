#!/usr/bin/env node
/**
 * KINETIC DISTRO — ARTWORK PIPELINE
 * -----------------------------------------------------------------------------
 * Copies hand-supplied artwork out of `assets/` and into `public/`, where a
 * static host can actually serve it, and writes a manifest the catalogue reads.
 *
 *   assets/covers/<Artist>/<Artist> - <Title>.webp   ->  public/covers/<slug>.webp
 *   assets/artists/<Artist>.webp                     ->  public/artists/<slug>.webp
 *
 * Why the two folders instead of dropping files straight into public/:
 * `assets/` is for humans. Names can have capitals, spaces and accents, and are
 * grouped per artist so a folder stays readable at fifty records. This script
 * does the normalising, so nobody has to remember a slug to file a cover.
 *
 * Matching is on the normalised title, not the slug, because a synced record's
 * slug is derived at runtime — the title is what both sides already agree on.
 *
 *   npm run assets            copy and write the manifest
 *   npm run assets -- --check report only, write nothing (used by the audit)
 * -----------------------------------------------------------------------------
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { norm } from './lib/attribution.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(root, 'assets');
const PUBLIC = resolve(root, 'public');
const MANIFEST = resolve(root, 'src/content/covers.generated.json');

const CHECK = process.argv.includes('--check');
const IMAGE_EXT = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif']);

const log = (...a) => console.log('[assets]', ...a);
const warn = (...a) => console.warn('[assets] ⚠ ', ...a);

/* -------------------------------------------------------------------------- */

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const listFiles = (dir) =>
  existsSync(dir) && statSync(dir).isDirectory()
    ? readdirSync(dir, { withFileTypes: true })
    : [];

/**
 * `Grafenberg - No Saints, No Proof.webp` inside `covers/Grafenberg/` names the
 * artist twice. Either spelling is accepted; the part after the separator wins.
 */
const titleFromFilename = (filename, folder) => {
  const stem = filename.slice(0, -extname(filename).length);
  const m = stem.match(/^(.{2,40}?)\s*(?: - | _ | — | – )\s*(.+)$/);
  if (m && norm(m[1]) === norm(folder)) return m[2].trim();
  return m ? m[2].trim() : stem.trim();
};

/* -------------------------------------------------------------------------- */
/* What the site knows about                                                   */
/* -------------------------------------------------------------------------- */

/** Curated titles from site.ts plus every synced record, keyed by normalised title. */
function knownTitles() {
  const titles = new Map();

  const siteTs = readFileSync(resolve(root, 'src/content/site.ts'), 'utf8');
  const releaseBlock = siteTs.slice(siteTs.indexOf('export const releases'), siteTs.indexOf('export const getRelease'));
  for (const [, t] of releaseBlock.matchAll(/\n\s*title:\s*'((?:[^'\\]|\\.)*)'/g)) {
    titles.set(norm(t), t.replace(/\\'/g, "'"));
  }

  const generatedPath = resolve(root, 'src/content/catalog.generated.json');
  if (existsSync(generatedPath)) {
    const data = JSON.parse(readFileSync(generatedPath, 'utf8'));
    for (const artist of Object.values(data.artists ?? {})) {
      for (const p of artist.playlists ?? []) {
        if (!p.isMirror) titles.set(norm(p.title), p.title);
      }
    }
  }

  return titles;
}

/* -------------------------------------------------------------------------- */

function syncCovers(titles) {
  const outDir = join(PUBLIC, 'covers');
  const manifest = {};
  const unmatched = [];
  let copied = 0;

  for (const folder of listFiles(join(SRC, 'covers'))) {
    // Files may sit directly in covers/ or be grouped in a per-artist folder.
    const dir = folder.isDirectory() ? join(SRC, 'covers', folder.name) : join(SRC, 'covers');
    const files = folder.isDirectory() ? listFiles(dir) : [folder];

    for (const file of files) {
      if (file.isDirectory() || !IMAGE_EXT.has(extname(file.name).toLowerCase())) continue;

      const title = titleFromFilename(file.name, folder.isDirectory() ? folder.name : '');
      const key = norm(title);

      if (!titles.has(key)) {
        unmatched.push(`${folder.isDirectory() ? folder.name + '/' : ''}${file.name}  (read as "${title}")`);
        continue;
      }

      const target = `${slugify(titles.get(key))}${extname(file.name).toLowerCase()}`;
      manifest[key] = `/covers/${target}`;

      if (!CHECK) {
        mkdirSync(outDir, { recursive: true });
        copyFileSync(join(dir, file.name), join(outDir, target));
      }
      copied++;
    }
  }

  return { manifest, unmatched, copied };
}

function syncPortraits() {
  const outDir = join(PUBLIC, 'artists');
  const manifest = {};
  let copied = 0;

  for (const file of listFiles(join(SRC, 'artists'))) {
    if (file.isDirectory() || !IMAGE_EXT.has(extname(file.name).toLowerCase())) continue;

    const stem = file.name.slice(0, -extname(file.name).length);
    const target = `${slugify(stem)}${extname(file.name).toLowerCase()}`;
    manifest[slugify(stem)] = `/artists/${target}`;

    if (!CHECK) {
      mkdirSync(outDir, { recursive: true });
      copyFileSync(join(SRC, 'artists', file.name), join(outDir, target));
    }
    copied++;
  }

  return { manifest, copied };
}

/* -------------------------------------------------------------------------- */

const titles = knownTitles();
const covers = syncCovers(titles);
const portraits = syncPortraits();

log(`${covers.copied} cover(s), ${portraits.copied} portrait(s)${CHECK ? ' — check only' : ' copied into public/'}`);

if (covers.unmatched.length) {
  warn(`${covers.unmatched.length} cover(s) match no record — check the spelling against the release title:`);
  covers.unmatched.forEach((f) => console.warn(`      ${f}`));
}

if (!CHECK) {
  mkdirSync(dirname(MANIFEST), { recursive: true });
  writeFileSync(
    MANIFEST,
    JSON.stringify({ covers: covers.manifest, portraits: portraits.manifest }, null, 2) + '\n',
  );
}

// Never fail the build over artwork: a mistyped filename should cost a warning
// and a generative cover, not a deploy.
process.exit(0);
