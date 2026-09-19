/**
 * NAMES THE LABEL HAS RETIRED
 * -----------------------------------------------------------------------------
 * Three acts were renamed and one left the roster. SoundCloud still carries the
 * old names — in record titles, tracklists ("feat. Nyla Vey" alone is on a
 * dozen tracks) and descriptions — and the sync mirrors SoundCloud every night.
 *
 * The rewrite happens here, before catalog.generated.json is written, rather
 * than when the site renders it: that file is imported by the client bundle,
 * so anything left in it is downloaded by every visitor even if no page shows
 * it. Once the records are renamed at the source this becomes a no-op.
 *
 * Permalinks are left alone. They are addresses: rewriting one breaks the link
 * or the player it feeds, so those only change when SoundCloud's do.
 * -----------------------------------------------------------------------------
 */

export const RETIRED_NAMES = [
  [/Nyla Vey/gi, 'Nyla Corvey'],
  [/Hollow Static/gi, 'Residual Bloom'],
  [/Love Cult/gi, 'Somerval'],
];

/** Credits are slugs, and a credit array holding an old one must follow the rename. */
export const RETIRED_SLUGS = {
  'nyla-vey': 'nyla-corvey',
  'hollow-static': 'residual-bloom',
  'love-cult': 'somerval',
};

/** "HOLLOW STATIC" in a shouted description becomes "RESIDUAL BLOOM", not "Residual Bloom". */
const matchCase = (found, next) => (found === found.toUpperCase() ? next.toUpperCase() : next);

const isUrl = (s) => /^https?:\/\//.test(s);

export const retireNames = (value) => {
  if (typeof value === 'string') {
    if (RETIRED_SLUGS[value]) return RETIRED_SLUGS[value];
    if (isUrl(value)) return value;
    return RETIRED_NAMES.reduce((s, [re, to]) => s.replace(re, (m) => matchCase(m, to)), value);
  }
  if (Array.isArray(value)) return value.map(retireNames);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, retireNames(v)]));
  }
  return value;
};
