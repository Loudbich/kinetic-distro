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
 * A source that is already WebP and already small enough is copied untouched.
 * Re-encoding it would be a second lossy pass over an image that has been
 * through one already: visible softening for no gain, and in one measured case
 * a 202 kB cover came out at 227 kB — larger AND worse.
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
  carousel: { widths: [768, 1280, 1920], quality: 88 },
  /** Portrait crop for phones; never wider than a large phone at 3x. */
  carouselMobile: { widths: [640, 960], quality: 88 },
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

  // Already the right format at roughly the right size: copy it. A second lossy
  // pass would only soften an image that has been through one already, and on a
  // WebP that is already efficient it can come out heavier — a 1080px slide
  // re-encoded to 960 measured 239 kB against the source's 189.
  //
  // The tolerance is what makes this useful rather than pedantic: an export at
  // 1080 for a 960 target is the right file, and shipping the extra 120px costs
  // nothing next to re-compressing it.
  const widest = widths[widths.length - 1] * 1.25;
  if (/\.webp$/i.test(source) && (meta.width ?? 0) <= widest) {
    mkdirSync(outDir, { recursive: true });
    const file = `${baseName}.webp`;
    copyFileSync(source, join(outDir, file));
    return {
      primary: { url: `${publicPath}/${file}`, width: meta.width, height: meta.height },
      bytes: statSync(source).size,
      passthrough: true,
    };
  }

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
