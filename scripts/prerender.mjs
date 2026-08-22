#!/usr/bin/env node
/**
 * STATIC PRERENDER
 * -----------------------------------------------------------------------------
 * Turns the SPA into a set of real HTML files — one per URL — each with its own
 * <title>, meta, canonical, Open Graph and schema.org @graph baked in, plus the
 * fully rendered page body.
 *
 * Why it matters: Googlebot renders JavaScript, but entity extraction for the
 * Knowledge Graph, social crawlers (Facebook, LinkedIn, Slack, Discord) and the
 * crawlers behind AI assistants mostly do NOT. A single index.html with
 * JS-injected meta means all of them see the same generic homepage for all 25
 * URLs. This fixes that.
 *
 * Runs automatically as part of `npm run build`.
 * -----------------------------------------------------------------------------
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const DIST = resolve(root, 'dist');
const SSR = resolve(root, 'dist-ssr');

const log = (...a) => console.log('[prerender]', ...a);

/* -------------------------------------------------------------------------- */

const escapeAttr = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** JSON-LD must never be able to close its own <script> tag. */
const escapeJsonLd = (s) => s.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

function headFor(route, base, shareImage) {
  const url = route.canonical;
  const image = route.image
    ? route.image.startsWith('http')
      ? route.image
      : base + route.image
    : base + shareImage;

  const tags = [
    `<title>${escapeAttr(route.title)}</title>`,
    `<meta name="description" content="${escapeAttr(route.description)}" />`,
    `<meta name="robots" content="${route.noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}" />`,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
    `<meta property="og:type" content="${route.ogType}" />`,
    `<meta property="og:site_name" content="Kinetic Distro" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta property="og:title" content="${escapeAttr(route.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(route.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta property="og:image" content="${escapeAttr(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(route.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(route.description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(image)}" />`,
    `<script type="application/ld+json" data-seo-graph>${escapeJsonLd(route.jsonLd)}</script>`,
  ];

  return tags.map((t) => '    ' + t).join('\n');
}

function outPathFor(routePath) {
  if (routePath === '/') return join(DIST, 'index.html');
  if (routePath === '/404') return join(DIST, '404.html');
  return join(DIST, routePath.replace(/^\//, ''), 'index.html');
}

function sitemapFor(routes, base) {
  const today = new Date().toISOString().slice(0, 10);
  const priority = (p) =>
    p === '/' ? '1.0' : p === '/roster' || p === '/releases' ? '0.9' : p.includes('/') && p.split('/').length > 2 ? '0.8' : '0.7';
  const freq = (p) => (p === '/' || p === '/roster' || p === '/releases' ? 'weekly' : 'monthly');

  const urls = routes
    .filter((r) => !r.noIndex)
    .map(
      (r) => `  <url>
    <loc>${r.canonical}</loc>
    <lastmod>${r.lastmod ?? today}</lastmod>
    <changefreq>${freq(r.path)}</changefreq>
    <priority>${priority(r.path)}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/* -------------------------------------------------------------------------- */

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('[prerender] dist/index.html missing — run `vite build` first.');
    process.exit(1);
  }

  const entry = pathToFileURL(join(SSR, 'entry-server.js')).href;
  const { render, routes: getRoutes, baseUrl, shareImage } = await import(entry);

  const template = readFileSync(join(DIST, 'index.html'), 'utf8');

  if (!template.includes('<!--app-html-->') || !template.includes('<!--seo-start-->')) {
    console.error('[prerender] index.html is missing its <!--app-html--> / <!--seo-start--> markers.');
    process.exit(1);
  }

  const routes = getRoutes();
  let written = 0;

  for (const route of routes) {
    const url = route.path === '/404' ? '/__not_found__' : route.path;
    let html;
    try {
      html = render(url);
    } catch (err) {
      console.error(`[prerender] failed to render ${route.path}: ${err.message}`);
      process.exit(1);
    }

    const page = template
      .replace(/ *<!--seo-start-->[\s\S]*?<!--seo-end-->/, headFor(route, baseUrl, shareImage))
      .replace('<!--app-html-->', html);

    const out = outPathFor(route.path);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, page);
    written++;
  }

  writeFileSync(join(DIST, 'sitemap.xml'), sitemapFor(routes, baseUrl));

  // Generated rather than static so the sitemap URL can never drift from the
  // configured origin.
  writeFileSync(
    join(DIST, 'robots.txt'),
    `User-agent: *
Allow: /

# Answer engines and AI assistants are welcome — the structured data is for them too.
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`,
  );

  // GitHub Pages runs Jekyll unless told not to; Jekyll silently drops files and
  // folders whose names begin with an underscore.
  writeFileSync(join(DIST, '.nojekyll'), '');

  // The SSR bundle is a build artifact, not something to deploy.
  rmSync(SSR, { recursive: true, force: true });

  log(`${written} static pages + sitemap.xml (${routes.filter((r) => !r.noIndex).length} indexable URLs)`);
}

main().catch((err) => {
  console.error('[prerender]', err);
  process.exit(1);
});
