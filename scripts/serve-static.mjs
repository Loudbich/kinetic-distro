#!/usr/bin/env node
/**
 * Serves dist/ exactly the way Apache (OVH) or Netlify will:
 *   /roster/grafenberg  →  dist/roster/grafenberg/index.html
 *   unknown URL         →  dist/404.html with a real 404 status
 *
 * Use this rather than `vite preview` to check the built site. `vite preview`
 * applies an SPA fallback that serves dist/index.html for every path, which
 * hides whether the prerendered per-route files are correct — and produces
 * phantom hydration mismatches while it does so.
 *
 *   npm run preview:static
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

const exists = async (p) => {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
};

const send = async (res, file, status = 200) => {
  const body = await readFile(file);
  res.writeHead(status, {
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    'Content-Length': body.length,
  });
  res.end(body);
};

createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const target = join(DIST, safe);

  if (!target.startsWith(DIST)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  const candidates = [target, join(target, 'index.html')];
  for (const candidate of candidates) {
    if (await exists(candidate)) {
      await send(res, candidate);
      return;
    }
  }

  const notFound = join(DIST, '404.html');
  if (await exists(notFound)) {
    await send(res, notFound, 404);
    return;
  }
  res.writeHead(404).end('Not found');
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Serving dist/ like production on http://127.0.0.1:${PORT}`);
});
