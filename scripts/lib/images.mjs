/**
 * IMAGE ENCODING — one place where every published image is sized.
 * -----------------------------------------------------------------------------
 * Artwork arrives at whatever size the export dialog produced: 3840px carousel
 * visuals, a 1254px logo shown at 28, a 5000px cover. Copying those verbatim
 * shipped megabytes for pictures the layout draws a few hundred pixels wide.
 *
 * Every asset is served as WebP at a width the design actually uses, and never
 * enlarged — a small source stays small rather than being blown up into a
 * bigger, blurrier file.
 *
 * At its own full width a WebP source is copied untouched — re-encoding it is a
 * second lossy pass over an image that has been through one already: visible
 * softening for no gain, and in one measured case a 202 kB cover came out at
 * 227 kB, larger AND worse. Smaller variants beside it are genuinely resized.
 *
 * The widths go up to what the source can supply, not to what seems enough. A
 * full-bleed 3840px visual capped at 1920 was being upscaled twofold on any
 * HiDPI desktop, which looks exactly like bad compression and is not.
 *
 * Sources are left untouched. `assets/` remains the archive; only what the site
 * serves is reduced.
 * -----------------------------------------------------------------------------
 */

import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

/**
 * Widths per kind of asset, chosen from how large the layout ever draws them.
 *
 * Several widths mean a srcset: the carousel runs full-bleed, so a phone would
 * otherwise download the same file a 4K display needs. One width means the
 * element is small enough that a second file would cost more in requests than
 * it saves in bytes.
 */
export const PRESETS = {
  /** Full-bleed hero — the only image whose display width really varies. */
  carousel: { widths: [768, 1280, 1920, 2560, 3840], quality: 88 },
  /** Portrait crop for phones; never wider than a large phone at 3x. */
  carouselMobile: { widths: [640, 1080, 1440], quality: 88 },
  /** Drawn at ~700px on a wide screen, ~380 on a phone. 1000 covers both at 2x. */
  cover: { widths: [1000], quality: 90 },
  /** A column image, never more than ~400px wide. */
  portrait: { widths: [800], quality: 88 },
  /** The footer lockup, drawn at 208px. */
  logo: { widths: [640], quality: 92 },
  /** The header mark, drawn at 28px — and the favicon. */
  mark: { widths: [256], quality: 92 },
};

/**
 * Encodes one source into every width of a preset.
 *
 * The widest variant is returned as `primary` and is what `src` should point
 * at, so a browser that ignores srcset still gets a usable file.
 *
 * @returns {Promise<{primary: {url, width, height}, srcset?: string, bytes: number}>}
 */
export async function emit(source, { outDir, publicPath, baseName, preset }) {
  const { widths, quality } = PRESETS[preset];
  mkdirSync(outDir, { recursive: true });

  const meta = await sharp(source).metadata();
  const sourceWidth = meta.width ?? 0;
  const sourceIsWebp = /\.webp$/i.test(source);

  // Which widths this source can actually supply. Anything at or above its own
  // width collapses onto the source size — enlarging would only produce a
  // heavier blur — and duplicates are dropped.
  const targets = [...new Set(widths.map((w) => Math.min(w, sourceWidth) || w))].sort((x, y) => x - y);
  const multi = targets.length > 1;

  const variants = [];
  let bytes = 0;

  for (const width of targets) {
    const file = `${baseName}${multi ? `-${width}` : ''}.webp`;
    const out = join(outDir, file);

    // At full size a WebP source is its own best variant: re-encoding it is a
    // second lossy pass over an image that has been through one already, and on
    // an efficient file it can even come out heavier. Below full size there is
    // real work to do, so it is encoded.
    if (sourceIsWebp && width === sourceWidth) {
      copyFileSync(source, out);
      bytes += statSync(source).size;
      variants.push({ url: `${publicPath}/${file}`, width, height: meta.height });
      continue;
    }

    const info = await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toFile(out);

    bytes += info.size;
    variants.push({ url: `${publicPath}/${file}`, width: info.width, height: info.height });
  }

  const primary = variants[variants.length - 1];
  return {
    primary,
    srcset: multi ? variants.map((v) => `${v.url} ${v.width}w`).join(', ') : undefined,
    bytes,
  };
}

export const kb = (n) => `${Math.round(n / 1024)} kB`;
