import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';
import { allRoutes, canonicalPath, jsonLd, BASE_URL } from './lib/seo';

/** Called once per route by scripts/prerender.mjs. */
export function render(url: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}

/** Route metadata for the prerenderer, with the graph already serialised. */
export function routes() {
  return allRoutes().map((route) => ({
    path: route.path,
    canonical: `${BASE_URL}${canonicalPath(route.path)}`,
    title: route.title,
    description: route.description,
    ogType: route.ogType,
    image: route.image,
    noIndex: route.noIndex,
    jsonLd: jsonLd(route),
    lastmod: route.lastmod,
  }));
}

export const baseUrl = BASE_URL;
