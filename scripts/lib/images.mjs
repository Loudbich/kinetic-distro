/**
 * IMAGE ENCODING — one place where every published image is sized.
 * -----------------------------------------------------------------------------
 * Artwork arrives at whatever size the export dialog produced: 3840px carousel
 * visuals, a 1254px logo shown at 28, a 5000px cover. Copying those verbatim
 * shipped megabytes for pictures the layout draws a few hundred pixels wide.
 *
 * Every asset is re-encoded to WebP at a width the design actually uses, and
 * never enlarged — a small source stays small rather than being blown up into a
 * bigger, blurrier file.
 *
 * Sources are left untouched. `assets/` remains the archive; only what the site
 * serves is reduced.
 * -----------------------------------------------------------------------------
 */

import { mkdirSync } from 'node:fs';
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
  carousel: { widths: [768, 1280, 1920], quality: 78 },
  /** Portrait crop for phones; never wider than a large phone at 3x. */
  carouselMobile: { widths: [640, 960], quality: 78 },
  /** Drawn at ~700px on a wide screen, ~380 on a phone. 1000 covers both at 2x. */
  cover: { widths: [1000], quality: 82 },
  /** A column image, never more than ~400px wide. */
  portrait: { widths: [800], quality: 82 },
  /** The footer lockup, drawn at 208px. */
  logo: { widths: [640], quality: 88 },
  /** The header mark, drawn at 28px — and the favicon. */
  mark: { widths: [256], quality: 90 },
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
  const variants = [];
  let bytes = 0;

  for (const target of widths) {
    // Never enlarge: a 200px source asked for at 768 would just be a heavier
    // blur. The suffix is dropped on the only-width case so URLs stay tidy.
    const width = Math.min(target, meta.width ?? target);
    const suffix = widths.length > 1 ? `-${width}` : '';
    const file = `${baseName}${suffix}.webp`;

    const info = await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toFile(join(outDir, file));

    bytes += info.size;
    variants.push({ url: `${publicPath}/${file}`, width: info.width, height: info.height });

    if (width < target) break; // the source ran out; wider entries would duplicate it
  }

  const primary = variants[variants.length - 1];
  return {
    primary,
    srcset: variants.length > 1 ? variants.map((v) => `${v.url} ${v.width}w`).join(', ') : undefined,
    bytes,
  };
}

export const kb = (n) => `${Math.round(n / 1024)} kB`;
