import { useEffect } from 'react';
import { BASE_URL, SHARE_IMAGE, canonicalPath, jsonLd, type RouteSeo } from '../lib/seo';

/**
 * Keeps <head> correct during client-side navigation.
 *
 * The same metadata is already baked into the static HTML by
 * scripts/prerender.mjs — crawlers never depend on this component. It exists so
 * that a visitor moving between pages in the SPA still gets the right title,
 * canonical and structured data (and so that any crawler that *does* only
 * evaluate the live DOM sees the same graph).
 */

const upsert = <T extends HTMLElement>(
  selector: string,
  create: () => T,
  apply: (el: T) => void,
) => {
  let el = document.head.querySelector<T>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  apply(el);
};

const meta = (key: 'name' | 'property', value: string, content: string) =>
  upsert<HTMLMetaElement>(
    `meta[${key}="${value}"]`,
    () => {
      const el = document.createElement('meta');
      el.setAttribute(key, value);
      return el;
    },
    (el) => el.setAttribute('content', content),
  );

export default function Seo({ route }: { route: RouteSeo }) {
  useEffect(() => {
    const url = `${BASE_URL}${canonicalPath(route.path)}`;
    const image = route.image
      ? route.image.startsWith('http')
        ? route.image
        : BASE_URL + route.image
      : BASE_URL + SHARE_IMAGE;

    document.title = route.title;

    meta('name', 'description', route.description);
    meta('name', 'robots', route.noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large');

    meta('property', 'og:type', route.ogType);
    meta('property', 'og:title', route.title);
    meta('property', 'og:description', route.description);
    meta('property', 'og:url', url);
    meta('property', 'og:image', image);

    meta('name', 'twitter:card', 'summary_large_image');
    meta('name', 'twitter:title', route.title);
    meta('name', 'twitter:description', route.description);
    meta('name', 'twitter:image', image);

    upsert<HTMLLinkElement>(
      'link[rel="canonical"]',
      () => {
        const el = document.createElement('link');
        el.rel = 'canonical';
        return el;
      },
      (el) => (el.href = url),
    );

    upsert<HTMLScriptElement>(
      'script[data-seo-graph]',
      () => {
        const el = document.createElement('script');
        el.type = 'application/ld+json';
        el.setAttribute('data-seo-graph', '');
        return el;
      },
      (el) => (el.textContent = jsonLd(route)),
    );
  }, [route]);

  return null;
}
