#!/usr/bin/env node
/**
 * Regenerates the SCAFFOLD of src/content/attribution.ts from the synced
 * catalogue — a starting point for a file that is maintained by hand after.
 *
 *   node scripts/build-attribution.mjs           report only
 *   node scripts/build-attribution.mjs --write   overwrite attribution.ts
 *
 * WARNING: --write discards hand-made edits. It is for the first run, and for
 * the rare case where the file has to be rebuilt from scratch.
 *
 * A new record does NOT normally need this script. It is credited automatically
 * from the label's showcase-playlist naming (see lib/attribution.mjs), and
 * attribution.ts exists only to override that or to hide something.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'src/content/attribution.ts');
const WRITE = process.argv.includes('--write');

const data = JSON.parse(readFileSync(resolve(root, 'src/content/catalog.generated.json'), 'utf8'));

/** Only records the site would actually list — mirrors are duplicates. */
const records = Object.entries(data.artists ?? {})
  .flatMap(([profile, a]) => (a.playlists ?? []).map((p) => ({ ...p, profile })))
  .filter((p) => !p.isMirror)
  .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

const unresolved = records.filter((r) => !r.credit?.length);

console.log(`[attribution] ${records.length} records · ${unresolved.length} unresolved`);
for (const r of unresolved) console.log(`  ? ${r.date}  ${r.title}  (on ${r.profile})`);

if (!WRITE) {
  console.log('[attribution] report only — pass --write to regenerate the file');
  process.exit(0);
}

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const body = records
  .map((r) => {
    const slugs = r.credit?.length ? `[${r.credit.map(q).join(', ')}]` : 'null';
    const why = r.credit?.length
      ? `credited from the ${r.creditSource}`
      : 'NO CREDIT FOUND — decide by hand';
    return `  {
    // ${r.date} · ${r.trackCount ?? '?'} tracks · ${why}
    id: ${q(r.id)},
    title: ${q(r.title)},
    artistSlugs: ${slugs},
  },`;
  })
  .join('\n');

writeFileSync(
  OUT,
  `/**
 * RECORD CREDITS — hand-maintained overrides.
 * -----------------------------------------------------------------------------
 * \`grafenbergmusik\` is Kinetic Distro's own SoundCloud account, not the artist
 * Grafenberg's, and it hosts a large part of the catalogue. Crediting a record
 * to whichever profile happens to host it would file most of the roster under
 * Grafenberg, so credits are derived from the label's showcase playlists
 * (\`Artist - Title [FULL ALBUM]\`) and corrected here where that falls short.
 *
 * Generated once by \`node scripts/build-attribution.mjs --write\`, then edited
 * by hand. Re-running with --write DISCARDS those edits.
 *
 *   artistSlugs: ['vein-mirror']                 one artist
 *   artistSlugs: ['grafenberg', 'broken-shaman'] a collaboration
 *   artistSlugs: null                            hidden from the site
 *
 * Slugs must match \`artists[].slug\` in site.ts. An entry here always wins over
 * the automatic credit; a record with no entry keeps whatever the sync worked
 * out, so new releases appear without touching this file.
 * -----------------------------------------------------------------------------
 */

export type SetAttribution = {
  /** SoundCloud set id — stable across renames, unlike the title. */
  id: string;
  /** For humans reading this file; the id is what actually matches. */
  title: string;
  /** null hides the record from the site entirely. */
  artistSlugs: string[] | null;
};

export const setAttributions: SetAttribution[] = [
${body}
];

const byId = new Map(setAttributions.map((a) => [a.id, a] as const));

/** undefined = no opinion, keep the synced credit; null = hide the record. */
export const attributionFor = (id: string): string[] | null | undefined =>
  byId.has(id) ? byId.get(id)!.artistSlugs : undefined;
`,
);

console.log(`[attribution] written — ${records.length} entries`);
