#!/usr/bin/env node
/**
 * SEO AUDIT — runs against the built dist/, no network, no browser.
 *
 * Checks what a crawler that does not execute JavaScript would actually receive:
 * a unique title and description per URL, a canonical, one valid JSON-LD graph,
 * exactly one <h1>, real body copy, and no dangling @id references.
 *
 *   npm run audit
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');

const problems = [];
const fail = (url, msg) => problems.push(`${url} — ${msg}`);

/* -------------------------------------------------------------------------- */

const htmlFiles = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (name.endsWith('.html')) htmlFiles.push(full);
  }
};
walk(DIST);

const urlFor = (file) => {
  const rel = relative(DIST, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel === '404.html') return '/404';
  return '/' + rel.replace(/\/index\.html$/, '');
};

const attrOf = (html, re) => (html.match(re) || [])[1];
const stripTags = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/* -------------------------------------------------------------------------- */

const titles = new Map();
const descriptions = new Map();
const allIds = new Set();
const referencedIds = [];

const collectIds = (node, url) => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.forEach((n) => collectIds(n, url));
  const keys = Object.keys(node);
  if (node['@id']) {
    // A bare { "@id": ... } is a reference; anything else is a definition.
    if (keys.length === 1) referencedIds.push({ id: node['@id'], url });
    else allIds.add(node['@id']);
  }
  Object.values(node).forEach((v) => collectIds(v, url));
};

console.log(`\nAuditing ${htmlFiles.length} static pages\n`);

for (const file of htmlFiles.sort()) {
  const url = urlFor(file);
  const html = readFileSync(file, 'utf8');

  /* --- head --- */
  const title = attrOf(html, /<title>([\s\S]*?)<\/title>/);
  const description = attrOf(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attrOf(html, /<link rel="canonical" href="([^"]*)"/);
  const robots = attrOf(html, /<meta name="robots" content="([^"]*)"/);
  const ogTitle = attrOf(html, /<meta property="og:title" content="([^"]*)"/);
  const ogImage = attrOf(html, /<meta property="og:image" content="([^"]*)"/);

  if (!title) fail(url, 'no <title>');
  if (!description) fail(url, 'no meta description');
  if (!canonical) fail(url, 'no canonical');
  if (!robots) fail(url, 'no robots directive');
  if (!ogTitle) fail(url, 'no og:title');
  if (!ogImage) fail(url, 'no og:image');

  // A canonical that does not match the URL the host serves without a redirect
  // sends every crawler through a 301. Directory pages must end in a slash.
  if (canonical && url !== '/404') {
    const want = url === '/' ? '/' : url + '/';
    const got = new URL(canonical).pathname;
    if (got !== want) fail(url, `canonical path is "${got}", expected "${want}"`);
  }

  const noIndex = /noindex/.test(robots ?? '');

  if (!noIndex && title && (title.length < 20 || title.length > 75)) {
    fail(url, `title length ${title.length} (aim 20–75)`);
  }
  if (!noIndex && description && (description.length < 70 || description.length > 320)) {
    fail(url, `description length ${description.length} (aim 70–320)`);
  }

  if (title) {
    if (titles.has(title)) fail(url, `duplicate title, shared with ${titles.get(title)}`);
    else titles.set(title, url);
  }
  if (description) {
    if (descriptions.has(description)) {
      fail(url, `duplicate description, shared with ${descriptions.get(description)}`);
    } else descriptions.set(description, url);
  }

  /* --- structured data --- */
  const ld = attrOf(html, /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  if (!ld) {
    fail(url, 'no JSON-LD');
  } else {
    try {
      const parsed = JSON.parse(ld);
      if (parsed['@context'] !== 'https://schema.org') fail(url, 'JSON-LD @context is not schema.org');
      if (!Array.isArray(parsed['@graph']) || !parsed['@graph'].length) fail(url, 'JSON-LD @graph empty');
      collectIds(parsed['@graph'], url);
    } catch (err) {
      fail(url, `JSON-LD does not parse: ${err.message}`);
    }
  }

  /* --- body, as seen without JavaScript --- */
  const body = html.slice(html.indexOf('<body'));
  const h1Count = (body.match(/<h1[\s>]/g) || []).length;
  if (h1Count !== 1) fail(url, `${h1Count} <h1> (expected exactly 1)`);

  const text = stripTags(body);
  if (!noIndex && text.length < 600) fail(url, `only ${text.length} chars of text rendered without JS`);

  const internalLinks = (body.match(/<a [^>]*href="\/[^"]*"/g) || []).length;
  if (internalLinks < 5) fail(url, `only ${internalLinks} internal links in static HTML`);

  const status = problems.some((p) => p.startsWith(url + ' ')) ? '✗' : '✓';
  console.log(
    `  ${status} ${url.padEnd(42)} title ${String(title?.length ?? 0).padStart(3)} · ` +
      `desc ${String(description?.length ?? 0).padStart(3)} · ` +
      `${String(text.length).padStart(5)} chars · ${internalLinks} links`,
  );
}

/* --- cross-page reference integrity --- */
const dangling = referencedIds.filter(({ id }) => !allIds.has(id));
if (dangling.length) {
  const unique = [...new Set(dangling.map((d) => d.id))];
  unique.forEach((id) => fail(dangling.find((d) => d.id === id).url, `@id referenced but never defined: ${id}`));
}

/* --- sitemap --- */
try {
  const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const trim = (u) => u.replace(/\/+$/, '');
  const indexable = htmlFiles.map(urlFor).filter((u) => u !== '/404');
  const missing = indexable.filter(
    (u) => !locs.some((loc) => trim(new URL(loc).pathname) === trim(u === '/' ? '' : u)),
  );
  if (missing.length) fail('sitemap.xml', `missing URLs: ${missing.join(', ')}`);
  console.log(`\n  sitemap.xml — ${locs.length} URLs`);
} catch {
  fail('sitemap.xml', 'not found');
}

/* --- deployment files --- */
for (const [file, why] of [
  ['robots.txt', 'crawler directives + sitemap pointer'],
  ['.nojekyll', 'stops GitHub Pages from running Jekyll'],
  ['CNAME', 'custom domain for GitHub Pages'],
]) {
  try {
    readFileSync(join(DIST, file));
  } catch {
    fail(file, `missing from dist/ (${why})`);
  }
}

console.log(`  entities defined — ${allIds.size} unique @id`);
console.log(`  entity references — ${referencedIds.length}, dangling ${dangling.length}`);

/* -------------------------------------------------------------------------- */

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n`);
  problems.forEach((p) => console.error('  ✗ ' + p));
  console.error('');
  process.exit(1);
}

console.log('\nAll checks passed.\n');
