#!/usr/bin/env node
/**
 * KINETIC DISTRO — ARTWORK PIPELINE
 * -----------------------------------------------------------------------------
 * Copies hand-supplied artwork out of `assets/` and into `public/`, where a
 * static host can actually serve it, and writes a manifest the catalogue reads.
 *
 *   assets/covers/<any folders>/<Artist> - <Title>.webp
 *                                             ->  public/covers/<slug>.webp
 *   assets/artists/<Artist>.webp              ->  public/artists/<slug>.webp
 *   assets/brand/logo.webp                    ->  public/logo.webp
 *
 * Why not drop files straight into public/: `assets/` is for humans. Names can
 * have capitals, spaces and accents, and covers can be nested however suits
 * whoever files them — this script does the normalising, so nobody has to
 * remember a slug to file a cover.
 *
 * Covers are matched on the normalised title rather than the slug, because a
 * synced record's slug is derived at runtime; the title is what both sides
 * already agree on. Folder names are ignored entirely.
 *
 * public/covers and public/artists are wholly owned by this script and cleared
 * on every run, so a renamed source file cannot leave a stale copy behind.
 *
 *   npm run assets            copy and write the manifest
 *   npm run assets -- --check report only, write nothing (used by the audit)
 * -----------------------------------------------------------------------------
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { norm, readRoster } from './lib/attribution.mjs';

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

/** Every image under a directory, at any depth. */
const walkImages = (dir, base = dir) => {
  const out = [];
  for (const entry of listFiles(dir)) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkImages(full, base));
    else if (IMAGE_EXT.has(extname(entry.name).toLowerCase())) {
      out.push({ path: full, name: entry.name, rel: full.slice(base.length + 1) });
    }
  }
  return out;
};

/**
 * The candidate titles a filename could be naming, best first.
 *
 * Files are filed however suits the person filing them — `Grafenberg/…` one
 * artist deep, `Broken Shaman/01 - Dirt temple/…` two deep — so folders are
 * ignored entirely and only the filename is read. `Artist - Title.webp` is the
 * house convention, but the separator also appears inside real titles, so the
 * whole stem is offered as a fallback and whichever matches a record wins.
 */
const titleCandidates = (filename) => {
  const stem = filename.slice(0, -extname(filename).length).trim();
  const out = [];

  // The tidy form first, then a dash with the spacing gone astray
  // (`Broken Shaman -A Choir…`), then the stem untouched. Being generous costs
  // nothing: a candidate is only accepted if it matches an actual record, so a
  // bad split simply falls through to the next one.
  const spaced = stem.match(/^(.{2,40}?)\s*(?: - | _ | — | – )\s*(.+)$/);
  if (spaced) out.push(spaced[2].trim());

  const loose = stem.match(/^(.{2,40}?)\s*[-_—–]\s*(.+)$/);
  if (loose) out.push(loose[2].trim());

  out.push(stem);
  return [...new Set(out)];
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

  for (const file of walkImages(join(SRC, 'covers'))) {
    const candidates = titleCandidates(file.name);
    const key = candidates.map(norm).find((k) => titles.has(k));

    if (!key) {
      unmatched.push(`${file.rel}  (read as "${candidates[0]}")`);
      continue;
    }

    const target = `${slugify(titles.get(key))}${extname(file.name).toLowerCase()}`;
    manifest[key] = `/covers/${target}`;

    if (!CHECK) {
      mkdirSync(outDir, { recursive: true });
      copyFileSync(file.path, join(outDir, target));
    }
    copied++;
  }

  return { manifest, unmatched, copied };
}

/**
 * Whether an image carries an alpha channel.
 *
 * This decides how the logo is painted: a cut-out drops straight onto the page,
 * while one matted on black needs `mix-blend-mode: screen` to dissolve the
 * matte. Reading it from the file means re-exporting a logo with transparency
 * fixes the rendering on its own, with no code change — and that a file only
 * *believed* to be transparent cannot quietly ship a black rectangle.
 *
 * Unknown formats are reported as opaque, which is the safe assumption: the
 * blend is harmless on artwork that has no matte to remove.
 */
function hasAlpha(path) {
  const b = readFileSync(path);

  // PNG: colour type 4 (grey+alpha) and 6 (RGBA) carry alpha; palette and
  // truecolour images can declare transparency with a tRNS chunk instead.
  if (b.length > 26 && b.toString('ascii', 1, 4) === 'PNG') {
    const colorType = b[25];
    if (colorType === 4 || colorType === 6) return true;

    // Walk the chunk headers rather than searching the raw bytes: in a
    // megabyte of compressed pixel data the four characters "tRNS" turn up by
    // chance, and a plain buffer search reported an opaque logo as a cut-out.
    for (let off = 8; off + 8 <= b.length; ) {
      const length = b.readUInt32BE(off);
      const type = b.toString('ascii', off + 4, off + 8);
      if (type === 'tRNS') return true;
      if (type === 'IDAT' || type === 'IEND') break; // tRNS always precedes IDAT
      off += 12 + length;
    }
    return false;
  }

  // WebP: the extended (VP8X) header flags alpha; the lossless (VP8L) form
  // carries its own alpha bit.
  if (b.length > 30 && b.toString('ascii', 8, 12) === 'WEBP') {
    const format = b.toString('ascii', 12, 16);
    if (format === 'VP8X') return Boolean(b[20] & 0b0001_0000);
    if (format === 'VP8L') return Boolean(b[24] & 0b0001_0000);
    return false; // plain VP8 is always opaque
  }

  return false;
}

/**
 * Intrinsic pixel size, so the markup can declare an aspect ratio instead of
 * hardcoding one. Re-exporting a logo at another size then cannot introduce a
 * layout shift that nobody thinks to look for.
 *
 * Returns null for anything it cannot read; the caller simply omits the hint.
 */
function imageSize(path) {
  const b = readFileSync(path);

  if (b.length > 24 && b.toString('ascii', 1, 4) === 'PNG') {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }

  if (b.length > 30 && b.toString('ascii', 8, 12) === 'WEBP') {
    const format = b.toString('ascii', 12, 16);
    if (format === 'VP8X') {
      return {
        width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)),
        height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)),
      };
    }
    if (format === 'VP8 ') {
      return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    }
    if (format === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }

  return null;
}

/**
 * Brand files land at the root of the site, under their own name, because they
 * are referenced from the structured data and from share cards — URLs that
 * should stay put across redeploys rather than move with a content slug.
 *
 * The same logo often exists in several formats. They compete for one name, so
 * the best one is chosen rather than whichever the filesystem happens to list
 * last: transparency first, then the smaller file.
 */
function syncBrand() {
  const manifest = {};
  const opaque = [];
  const best = new Map();

  for (const file of listFiles(join(SRC, 'brand'))) {
    if (file.isDirectory() || !IMAGE_EXT.has(extname(file.name).toLowerCase())) continue;

    const path = join(SRC, 'brand', file.name);
    const stem = file.name.slice(0, -extname(file.name).length);
    const slug = slugify(stem);
    const candidate = {
      path,
      name: file.name,
      alpha: hasAlpha(path),
      size: statSync(path).size,
    };

    const held = best.get(slug);
    if (!held || (candidate.alpha && !held.alpha) || (candidate.alpha === held.alpha && candidate.size < held.size)) {
      best.set(slug, candidate);
    }
  }

  const sizes = {};

  for (const [slug, file] of best) {
    const target = `${slug}${extname(file.name).toLowerCase()}`;
    manifest[slug] = `/${target}`;
    if (!file.alpha) opaque.push(slug);

    const size = imageSize(file.path);
    if (size) sizes[slug] = size;

    if (!CHECK) copyFileSync(file.path, join(PUBLIC, target));
  }

  return { manifest, opaque, sizes, copied: best.size, chosen: [...best.entries()] };
}

/**
 * Portraits are matched to a roster slug by filename — `Broken Shaman.webp`
 * belongs to `broken-shaman`. A file that matches nobody is reported and left
 * where it is: copying it would publish a stray image that no page can ever
 * show, which is how an accidental drop ends up deployed forever.
 */
function syncPortraits(rosterSlugs) {
  const outDir = join(PUBLIC, 'artists');
  const manifest = {};
  const unmatched = [];
  let copied = 0;

  for (const file of listFiles(join(SRC, 'artists'))) {
    if (file.isDirectory() || !IMAGE_EXT.has(extname(file.name).toLowerCase())) continue;

    const stem = file.name.slice(0, -extname(file.name).length);
    const slug = slugify(stem);

    if (!rosterSlugs.has(slug)) {
      unmatched.push(`${file.name}  (read as "${slug}")`);
      continue;
    }

    const target = `${slug}${extname(file.name).toLowerCase()}`;
    manifest[slug] = `/artists/${target}`;

    if (!CHECK) {
      mkdirSync(outDir, { recursive: true });
      copyFileSync(join(SRC, 'artists', file.name), join(outDir, target));
    }
    copied++;
  }

  return { manifest, unmatched, copied };
}

/* -------------------------------------------------------------------------- */

/**
 * Clears what a previous run wrote, so a renamed or deleted source file does
 * not leave its old copy behind to be deployed forever. `covers/` and
 * `artists/` are wholly generated and can go as a whole; brand files sit at the
 * root next to hand-maintained ones (CNAME, favicon.svg), so only the exact
 * files the last manifest recorded are removed.
 */
function clearPrevious() {
  if (CHECK) return;

  rmSync(join(PUBLIC, 'covers'), { recursive: true, force: true });
  rmSync(join(PUBLIC, 'artists'), { recursive: true, force: true });

  if (!existsSync(MANIFEST)) return;
  try {
    const previous = JSON.parse(readFileSync(MANIFEST, 'utf8'));
    for (const url of Object.values(previous.brand ?? {})) {
      rmSync(join(PUBLIC, String(url).replace(/^\//, '')), { force: true });
    }
  } catch {
    // An unreadable manifest is not a reason to stop; worst case a stale brand
    // file survives, and the next successful run removes it.
  }
}

clearPrevious();

const titles = knownTitles();
const covers = syncCovers(titles);
const portraits = syncPortraits(new Set(readRoster(resolve(root, 'src/content/site.ts')).map((a) => a.slug)));
const brand = syncBrand();

log(
  `${covers.copied} cover(s), ${portraits.copied} portrait(s), ${brand.copied} brand file(s)` +
    `${CHECK ? ' — check only' : ' copied into public/'}`,
);

for (const [slug, file] of brand.chosen) {
  log(`brand/${slug}: ${file.name} (${file.alpha ? 'transparent' : 'opaque, matte dissolved'}, ${Math.round(file.size / 1024)} kB)`);
}

if (portraits.unmatched.length) {
  warn(`${portraits.unmatched.length} portrait(s) match no artist in the roster — not copied:`);
  portraits.unmatched.forEach((f) => console.warn(`      ${f}`));
}

if (covers.unmatched.length) {
  warn(`${covers.unmatched.length} cover(s) match no record — check the spelling against the release title:`);
  covers.unmatched.forEach((f) => console.warn(`      ${f}`));
}

if (!CHECK) {
  mkdirSync(dirname(MANIFEST), { recursive: true });
  writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        covers: covers.manifest,
        portraits: portraits.manifest,
        brand: brand.manifest,
        /** Brand files with no alpha channel — these need the matte dissolved. */
        brandOpaque: brand.opaque,
        /** Intrinsic size per brand file, so the markup declares a real ratio. */
        brandSize: brand.sizes,
      },
      null,
      2,
    ) + '\n',
  );
}

// Never fail the build over artwork: a mistyped filename should cost a warning
// and a generative cover, not a deploy.
process.exit(0);
