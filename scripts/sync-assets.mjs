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
import { emit, kb } from './lib/images.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(root, 'assets');
const PUBLIC = resolve(root, 'public');
const MANIFEST = resolve(root, 'src/content/covers.generated.json');

const CHECK = process.argv.includes('--check');
const IMAGE_EXT = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif']);

const log = (...a) => console.log('[assets]', ...a);
const warn = (...a) => console.warn('[assets] ⚠ ', ...a);

/**
 * Files that could not be read as images at all.
 *
 * One bad file should cost its own slot and nothing else. A 46 MB WAV saved
 * with a .webp extension took the whole build down before this existed, which
 * is a deploy lost to a drag-and-drop slip.
 */
const unusable = [];

async function tryEmit(source, options, label) {
  try {
    return await emit(source, options);
  } catch (err) {
    unusable.push(`${label} — ${err.message}`);
    return null;
  }
}

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

  // Export suffixes an image editor leaves behind — `…_Artwork`, `…-cover`,
  // `… final`. Stripped as an extra candidate rather than in place, so a record
  // genuinely called "Artwork" is unaffected.
  for (const c of [...out]) {
    const trimmed = c.replace(/[\s_-]*(artwork|cover|final|master|v\d+)$/i, '').trim();
    if (trimmed && trimmed !== c) out.push(trimmed);
  }

  return [...new Set(out)];
};

/* -------------------------------------------------------------------------- */
/* What the site knows about                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A title with every parenthesised or bracketed aside removed.
 *
 * A record is published as `The city watches her leave (feat. Nehir Sedef)
 * Chromabone remixes` while its artwork file is named without the guest credit.
 * Neither spelling is wrong, so the aside is dropped for a second look.
 */
const looseKey = (title) => norm(String(title).replace(/[([][^)\]]*[)\]]/g, ' '));

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

/**
 * Loose key -> the records that share it, used only when an exact match fails.
 *
 * A key claimed by more than one record is dropped rather than guessed at:
 * `X` and `X (Remastered)` collapse together here, and attaching one record's
 * artwork to the other is worse than reporting the file as unmatched.
 */
function looseIndex(titles) {
  const byLoose = new Map();
  for (const title of titles.values()) {
    const k = looseKey(title);
    if (!k) continue;
    byLoose.set(k, byLoose.has(k) ? null : title);
  }
  return byLoose;
}

/* -------------------------------------------------------------------------- */

async function syncCovers(titles) {
  const outDir = join(PUBLIC, 'covers');
  const manifest = {};
  const unmatched = [];
  let copied = 0;
  let bytes = 0;

  const loose = looseIndex(titles);

  for (const file of walkImages(join(SRC, 'covers'))) {
    const candidates = titleCandidates(file.name);

    // Both spellings of each candidate, matched against both indexes. The two
    // sides bracket differently — the file writes `(Chromabone remixes)` where
    // the record leaves it bare and parenthesises a guest credit instead — so
    // the file's exact key can land on a record's loose one and vice versa.
    const keys = candidates.flatMap((c) => [norm(c), looseKey(c)]).filter(Boolean);
    const title =
      keys.map((k) => titles.get(k)).find(Boolean) ??
      keys.map((k) => loose.get(k)).find(Boolean);

    if (!title) {
      unmatched.push(`${file.rel}  (read as "${candidates[0]}")`);
      continue;
    }

    const baseName = slugify(title);
    if (CHECK) {
      manifest[norm(title)] = { url: `/covers/${baseName}.webp` };
    } else {
      const out = await tryEmit(
        file.path,
        { outDir, publicPath: '/covers', baseName, preset: 'cover' },
        file.rel,
      );
      if (!out) continue;
      manifest[norm(title)] = { url: out.primary.url, srcset: out.srcset };
      bytes += out.bytes;
    }
    copied++;
  }

  return { manifest, unmatched, copied, bytes };
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
 * Brand files land at the root of the site, under their own name, because they
 * are referenced from the structured data and from share cards — URLs that
 * should stay put across redeploys rather than move with a content slug.
 *
 * The same logo often exists in several formats. They compete for one name, so
 * the best one is chosen rather than whichever the filesystem happens to list
 * last: transparency first, then the smaller file.
 */
async function syncBrand() {
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
  let bytes = 0;

  for (const [slug, file] of best) {
    manifest[slug] = `/${slug}.webp`;
    if (!file.alpha) opaque.push(slug);

    if (CHECK) continue;

    // The mark is drawn at 28px and doubles as the favicon; the lockup at 208.
    const out = await tryEmit(
      file.path,
      {
        outDir: PUBLIC,
        publicPath: '',
        baseName: slug,
        preset: slug.includes('seul') || slug.includes('mark') ? 'mark' : 'logo',
      },
      `brand/${file.name}`,
    );
    if (!out) continue;
    manifest[slug] = out.primary.url;
    sizes[slug] = { width: out.primary.width, height: out.primary.height };
    bytes += out.bytes;
  }

  return { manifest, opaque, sizes, copied: best.size, bytes, chosen: [...best.entries()] };
}

/**
 * Home-page carousel slides — one wide key visual per artist, matched to a
 * roster slug by filename exactly like a portrait.
 *
 *   assets/Caroussel/VEIN MIRROR.webp          the wide slide
 *   assets/Caroussel/mobile/VEIN MIRROR.webp   optional portrait crop
 *
 * The wide art is around 2.39:1, which on a phone becomes a letterbox strip a
 * few centimetres tall. A file dropped in `mobile/` is used below the `sm`
 * breakpoint instead; without one the wide crop is simply reused.
 *
 * Where several files claim the same slug, the smallest wins — the folder also
 * accumulates 23 MB PNG masters and upscaler output beside the exported webp,
 * and none of that belongs on a web page.
 */
async function syncCarousel(rosterSlugs) {
  const outDir = join(PUBLIC, 'carousel');
  const slides = {};
  const unmatched = [];

  // The root of the folder also holds PSDs, PNG masters and upscaler output, so
  // only the export formats count there — matching the rest would report a
  // dozen files as errors on every build, which is the fastest way to teach
  // everyone to ignore warnings. `mobile/` holds nothing but slides, so it
  // takes any image format.
  const ROOT_EXT = new Set(['.webp', '.avif']);

  const collect = (dir, kind) => {
    const allowed = kind === 'mobile' ? IMAGE_EXT : ROOT_EXT;
    for (const file of listFiles(dir)) {
      if (file.isDirectory() || !allowed.has(extname(file.name).toLowerCase())) continue;

      // `grafenberg-mobile.webp` and `Grafenberg.png` name the same artist; the
      // folder already says which crop this is, so the suffix is redundant and
      // is dropped rather than being required either way.
      const stem = file.name.slice(0, -extname(file.name).length);
      const slug = slugify(stem).replace(/-mobile$/, '');
      if (!rosterSlugs.has(slug)) {
        unmatched.push(`${kind === 'mobile' ? 'mobile/' : ''}${file.name}  (read as "${slug}")`);
        continue;
      }

      const path = join(dir, file.name);
      const size = statSync(path).size;
      const held = slides[slug]?.[kind];
      if (held && held.size <= size) continue;

      slides[slug] = { ...slides[slug], [kind]: { path, name: file.name, size } };
    }
  };

  collect(join(SRC, 'Caroussel'), 'wide');
  collect(join(SRC, 'Caroussel', 'mobile'), 'mobile');

  const manifest = {};
  let bytes = 0;

  for (const [slug, variants] of Object.entries(slides)) {
    if (!variants.wide) continue; // a mobile crop alone is not a slide
    manifest[slug] = {};

    // Wide first, and abandon the slug if it fails: a portrait crop with no
    // landscape counterpart cannot be shown anywhere, so encoding it would only
    // publish a file nothing links to.
    for (const [kind, file] of [['wide', variants.wide], ['mobile', variants.mobile]].filter(([, f]) => f)) {
      const baseName = `${slug}${kind === 'mobile' ? '-mobile' : ''}`;

      if (CHECK) {
        manifest[slug][kind] = { url: `/carousel/${baseName}.webp` };
        continue;
      }

      const out = await tryEmit(
        file.path,
        {
          outDir,
          publicPath: '/carousel',
          baseName,
          preset: kind === 'mobile' ? 'carouselMobile' : 'carousel',
        },
        `Caroussel/${kind === 'mobile' ? 'mobile/' : ''}${file.name}`,
      );
      if (!out) {
        if (kind === 'wide') break;
        continue;
      }
      manifest[slug][kind] = { ...out.primary, srcset: out.srcset };
      bytes += out.bytes;
    }
  }

  // An entry with no wide variant is not a slide; drop it so nothing downstream
  // has to keep re-checking for one.
  for (const [slug, entry] of Object.entries(manifest)) {
    if (!entry.wide) delete manifest[slug];
  }

  return { manifest, unmatched, copied: Object.keys(manifest).length, bytes };
}

/**
 * Portraits are matched to a roster slug by filename — `Broken Shaman.webp`
 * belongs to `broken-shaman`. A file that matches nobody is reported and left
 * where it is: copying it would publish a stray image that no page can ever
 * show, which is how an accidental drop ends up deployed forever.
 */
async function syncPortraits(rosterSlugs) {
  const outDir = join(PUBLIC, 'artists');
  const manifest = {};
  const unmatched = [];
  let copied = 0;
  let bytes = 0;

  for (const file of listFiles(join(SRC, 'artists'))) {
    if (file.isDirectory() || !IMAGE_EXT.has(extname(file.name).toLowerCase())) continue;

    const stem = file.name.slice(0, -extname(file.name).length);
    const slug = slugify(stem);

    if (!rosterSlugs.has(slug)) {
      unmatched.push(`${file.name}  (read as "${slug}")`);
      continue;
    }

    if (CHECK) {
      manifest[slug] = `/artists/${slug}.webp`;
    } else {
      const out = await tryEmit(
        join(SRC, 'artists', file.name),
        { outDir, publicPath: '/artists', baseName: slug, preset: 'portrait' },
        `artists/${file.name}`,
      );
      if (!out) continue;
      manifest[slug] = out.primary.url;
      bytes += out.bytes;
    }
    copied++;
  }

  return { manifest, unmatched, copied, bytes };
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
  rmSync(join(PUBLIC, 'carousel'), { recursive: true, force: true });

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
const rosterSlugs = new Set(readRoster(resolve(root, 'src/content/site.ts')).map((a) => a.slug));

const covers = await syncCovers(titles);
const portraits = await syncPortraits(rosterSlugs);
const carousel = await syncCarousel(rosterSlugs);
const brand = await syncBrand();

const totalBytes = covers.bytes + portraits.bytes + carousel.bytes + brand.bytes;

log(
  `${covers.copied} cover(s), ${portraits.copied} portrait(s), ${carousel.copied} carousel slide(s), ${brand.copied} brand file(s)` +
    `${CHECK ? ' — check only' : ` encoded into public/ — ${kb(totalBytes)} total`}`,
);

for (const [slug, file] of brand.chosen) {
  log(`brand/${slug}: ${file.name} (${file.alpha ? 'transparent' : 'opaque, matte dissolved'}, ${Math.round(file.size / 1024)} kB)`);
}

if (unusable.length) {
  warn(`${unusable.length} file(s) could not be read as an image — not published:`);
  unusable.forEach((f) => console.warn(`      ${f}`));
}

if (carousel.unmatched.length) {
  warn(`${carousel.unmatched.length} carousel file(s) match no artist — not copied:`);
  carousel.unmatched.forEach((f) => console.warn(`      ${f}`));
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
        carousel: carousel.manifest,
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
