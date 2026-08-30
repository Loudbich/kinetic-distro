/**
 * SEO + KNOWLEDGE GRAPH LAYER
 * -----------------------------------------------------------------------------
 * One pure function per route returns everything the <head> needs: title,
 * description, canonical, Open Graph, and a schema.org @graph.
 *
 * Used twice:
 *   · at build time by scripts/prerender.mjs, which bakes it into a real static
 *     HTML file per URL (so crawlers and AI agents never have to run JS);
 *   · at runtime by <Seo/>, which keeps the head correct during SPA navigation.
 *
 * Entity design — this is what actually feeds a Knowledge Panel:
 *   · every entity has a stable, absolute @id that never changes;
 *   · entities reference each other by @id instead of being duplicated;
 *   · the label is the hub: albums point at it via recordLabel, artists via
 *     recordLabel, pages via publisher.
 * -----------------------------------------------------------------------------
 */

import { artists, site, type Artist, type Release } from '../content/site';
import brandAssets from '../content/covers.generated.json';
import { allReleases, releasesForArtist } from '../content/catalog';

/**
 * The public origin, from VITE_SITE_URL in .env — the single place to change it.
 * No trailing slash.
 */
export const BASE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://www.kinetic-distro.com').replace(
  /\/+$/,
  '',
);

/**
 * Canonical URL form. Every static host — GitHub Pages included — serves
 * `dist/roster/grafenberg/index.html` at `/roster/grafenberg/` and 301-redirects
 * the slash-less form to it. Emitting the trailing slash everywhere means
 * canonicals, sitemap entries and internal links all point at the URL that
 * actually answers 200, so crawlers never walk a redirect.
 */
export const canonicalPath = (path: string) => {
  if (path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
};

const abs = (path: string) => `${BASE_URL}${canonicalPath(path)}`;

/**
 * Absolute URL for a file, not a page.
 *
 * `abs` canonicalises to a trailing slash, which is right for routes and wrong
 * for assets: `/artists/grafenberg.png/` is a 404, and a broken `image` is
 * enough for a crawler to drop the whole entity. An already-absolute URL — a
 * SoundCloud artwork, say — is passed through untouched.
 */
const assetUrl = (path: string) =>
  /^https?:\/\//.test(path) ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

/**
 * The image used when a page has none of its own.
 *
 * Falls back to og-cover.svg only if no logo has been supplied, because most
 * social networks — Facebook, LinkedIn, WhatsApp, Slack — silently ignore SVG
 * in share cards and render no image at all.
 */
export const SHARE_IMAGE = (brandAssets.brand as Record<string, string>).logo ?? '/og-cover.svg';

/**
 * The browser tab icon — the mark alone, since a full lockup is unreadable at
 * 16px. Taken from the manifest rather than written into the HTML: the file's
 * extension changes whenever the logo is re-exported in another format, and a
 * hardcoded path silently 404s the moment it does.
 */
export const FAVICON = (brandAssets.brand as Record<string, string>)['logo-seul'] ?? '/og-cover.svg';

/* -------------------------------------------------------------------------- */
/* Stable entity ids                                                           */
/* -------------------------------------------------------------------------- */

export const ID = {
  organization: `${BASE_URL}/#organization`,
  website: `${BASE_URL}/#website`,
  artist: (slug: string) => `${BASE_URL}/roster/${slug}/#artist`,
  album: (slug: string) => `${BASE_URL}/releases/${slug}/#album`,
  page: (path: string) => `${abs(path)}#webpage`,
};

/* -------------------------------------------------------------------------- */
/* Core entities                                                               */
/* -------------------------------------------------------------------------- */

const externalLinks = () =>
  Object.values(site.links).filter((href) => href && href !== '#' && href.startsWith('http'));

/**
 * The label itself. `additionalType` points at the Wikidata concept for a record
 * label — an explicit disambiguation signal for entity reconciliation.
 */
export const organizationEntity = () => ({
  '@type': 'Organization',
  '@id': ID.organization,
  additionalType: 'https://www.wikidata.org/wiki/Q18127',
  name: site.name,
  /**
   * Teopolis Records is the name the label released under before the rename,
   * and it is still the ℗ credit on every record from that period — on the
   * streaming platforms as well as in the SoundCloud metadata. Declaring it
   * here tells a search engine the two names are one entity, so those releases
   * consolidate onto the label instead of forming a second, half-built one.
   */
  alternateName: ['Kinetic Distro Records', 'Teopolis Records'],
  url: `${BASE_URL}/`,
  description: site.shortDescription,
  slogan: site.tagline,
  foundingDate: site.founded,
  logo: {
    '@type': 'ImageObject',
    '@id': `${BASE_URL}/#logo`,
    url: assetUrl(SHARE_IMAGE),
    caption: site.name,
  },
  image: { '@id': `${BASE_URL}/#logo` },
  address: { '@type': 'PostalAddress', addressCountry: 'FR' },
  areaServed: { '@type': 'Place', name: 'Worldwide' },
  knowsAbout: [
    'Independent music distribution',
    'Record label services',
    'Electronic music',
    'Darkwave',
    'Synthwave',
    'Techno',
  ],
  email: site.email,
  sameAs: externalLinks(),
});

export const websiteEntity = () => ({
  '@type': 'WebSite',
  '@id': ID.website,
  url: `${BASE_URL}/`,
  name: site.name,
  description: site.shortDescription,
  inLanguage: 'en',
  publisher: { '@id': ID.organization },
});

/* -------------------------------------------------------------------------- */
/* Artist + album entities                                                     */
/* -------------------------------------------------------------------------- */

const COUNTRIES: [RegExp, string][] = [
  [/France/i, 'FR'],
  [/\bUS\b|United States/i, 'US'],
  [/\bTR\b|Türkiye|Turkey/i, 'TR'],
  [/Scandinavia|Sweden|Norway|Denmark/i, 'SE'],
  [/Belgium|Brussels/i, 'BE'],
  [/England|Britain|British|United Kingdom|\bUK\b/i, 'GB'],
  [/Italy|Italian/i, 'IT'],
  [/China/i, 'CN'],
  [/Transylvania|Romania/i, 'RO'],
];

/**
 * Several artists have a compound origin — "United States / Italy",
 * "Transylvania / China". schema.org takes one founding country, so the one
 * named first wins rather than whichever pattern happens to be listed first
 * here: the label writes the primary origin first.
 */
const countryOf = (origin: string) => {
  let best: { at: number; code: string } | undefined;
  for (const [re, code] of COUNTRIES) {
    const at = origin.search(re);
    if (at !== -1 && (!best || at < best.at)) best = { at, code };
  }
  return best?.code;
};

export const artistEntity = (artist: Artist, { deep = false } = {}) => {
  const country = countryOf(artist.origin);
  const discography = releasesForArtist(artist.slug);

  const entity: Record<string, unknown> = {
    '@type': 'MusicGroup',
    '@id': ID.artist(artist.slug),
    name: artist.name,
    url: abs(`/roster/${artist.slug}`),
    description: artist.bio.join(' '),
    disambiguatingDescription: artist.tagline,
    genre: artist.genre.split('/').map((g) => g.trim()),
    recordLabel: { '@id': ID.organization },
    sameAs: artist.links.map((l) => l.href).filter((h) => h.startsWith('http')),
  };

  if (country) {
    entity.foundingLocation = {
      '@type': 'Place',
      name: artist.origin,
      address: { '@type': 'PostalAddress', addressCountry: country },
    };
  }

  if (artist.members?.length) {
    entity.member = artist.members.map((m) => ({
      '@type': 'OrganizationRole',
      roleName: m.role,
      member: { '@type': 'Person', name: m.name },
    }));
  }

  if (/^\d{4}$/.test(artist.since)) entity.foundingDate = artist.since;
  if (artist.image) entity.image = assetUrl(artist.image);

  if (deep && discography.length) {
    entity.album = discography.map((r) => ({ '@id': ID.album(r.slug) }));
    entity.numberOfItems = discography.length;
  }

  return entity;
};

export const albumEntity = (release: Release, { deep = false } = {}) => {
  const credited = release.artistSlugs
    .map((slug) => artists.find((a) => a.slug === slug))
    .filter(Boolean) as Artist[];

  const entity: Record<string, unknown> = {
    '@type': 'MusicAlbum',
    '@id': ID.album(release.slug),
    name: release.title,
    url: abs(`/releases/${release.slug}`),
    description: release.blurb,
    datePublished: release.date,
    albumProductionType:
      release.type === 'Remix album'
        ? 'https://schema.org/RemixAlbum'
        : release.type === 'Compilation'
          ? 'https://schema.org/CompilationAlbum'
          : 'https://schema.org/StudioAlbum',
    albumReleaseType:
      release.type === 'Single'
        ? 'https://schema.org/SingleRelease'
        : release.type === 'EP'
          ? 'https://schema.org/EPRelease'
          : 'https://schema.org/AlbumRelease',
    byArtist: credited.length
      ? credited.map((a) => ({ '@id': ID.artist(a.slug) }))
      : { '@id': ID.organization },
    recordLabel: { '@id': ID.organization },
    catalogNumber: release.catalog,
    genre: credited.flatMap((a) => a.genre.split('/').map((g) => g.trim())),
    inLanguage: 'en',
  };

  if (release.image) entity.image = assetUrl(release.image);

  // The same record on the streaming services. This is what stops a search
  // engine treating the Spotify, Apple Music and Deezer pages as three separate
  // albums that happen to share a title.
  // Built in one place: a second `entity.sameAs = …` further down used to
  // overwrite this one, leaving every album with a single link.
  const elsewhere = [
    ...(release.streamingLinks?.map((l) => l.href) ?? []),
    release.streamUrl,
    release.listenUrl?.startsWith('http') ? release.listenUrl : undefined,
  ].filter(Boolean) as string[];

  if (elsewhere.length) entity.sameAs = [...new Set(elsewhere)];

  // A pressing is a real product with a real place to buy it — worth declaring,
  // and the only part of a release that search engines can show as an offer.
  if (release.vinylUrl) {
    entity.offers = {
      '@type': 'Offer',
      url: release.vinylUrl,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: { '@id': ID.organization },
    };
    entity.releaseOf = { '@type': 'MusicRelease', musicReleaseFormat: 'https://schema.org/VinylFormat' };
  }
  if (release.tracklist?.length) entity.numTracks = release.tracklist.length;

  if (deep && release.tracklist?.length) {
    entity.track = {
      '@type': 'ItemList',
      numberOfItems: release.tracklist.length,
      itemListElement: release.tracklist.map((title, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'MusicRecording',
          '@id': `${ID.album(release.slug)}-track-${i + 1}`,
          name: title,
          position: i + 1,
          inAlbum: { '@id': ID.album(release.slug) },
          byArtist: credited.map((a) => ({ '@id': ID.artist(a.slug) })),
        },
      })),
    };
  }

  return entity;
};

/* -------------------------------------------------------------------------- */
/* Page scaffolding                                                            */
/* -------------------------------------------------------------------------- */

const breadcrumb = (trail: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  '@id': `${abs(trail[trail.length - 1].path)}#breadcrumb`,
  itemListElement: trail.map((step, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: step.name,
    item: abs(step.path),
  })),
});

const webPage = (
  path: string,
  name: string,
  description: string,
  extra: Record<string, unknown> = {},
) => ({
  '@type': 'WebPage',
  '@id': ID.page(path),
  url: abs(path),
  name,
  description,
  isPartOf: { '@id': ID.website },
  about: { '@id': ID.organization },
  inLanguage: 'en',
  ...extra,
});

/* -------------------------------------------------------------------------- */
/* Route metadata                                                              */
/* -------------------------------------------------------------------------- */

export type RouteSeo = {
  path: string;
  title: string;
  description: string;
  ogType: 'website' | 'profile' | 'music.album';
  image?: string;
  graph: unknown[];
  /** Excluded from the sitemap when true. */
  noIndex?: boolean;
  /** Real content date for <lastmod>, so crawlers can prioritise what changed. */
  lastmod?: string;
};

const HOME = { name: 'Home', path: '/' };

/**
 * Keeps a <title> inside the ~75 characters Google will actually render.
 *
 * Most of the catalogue is synced from SoundCloud, where a record can be called
 * `The Hush Beneath the Static [Kinetic Resonance Remaster]`. Adding the artist
 * and the label to that overflows, and an overflowing title is truncated by the
 * search engine at whatever point it likes. Dropping the suffixes in order —
 * label first, then artist — keeps the record's own name intact, which is the
 * part a reader is scanning for.
 */
const fitTitle = (name: string, ...suffixes: string[]) => {
  const MAX = 75;

  // A label compilation is credited to the label, so `Title — Kinetic Distro —
  // Kinetic Distro` would be the natural build. Anything already said is
  // dropped rather than repeated.
  const parts: string[] = [name];
  for (const s of suffixes) {
    if (s && !parts.some((p) => p.toLowerCase() === s.toLowerCase())) parts.push(s);
  }

  for (let keep = parts.length; keep > 1; keep--) {
    const candidate = parts.slice(0, keep).join(' — ');
    if (candidate.length <= MAX) return candidate;
  }
  return name;
};

export function homeSeo(): RouteSeo {
  return {
    path: '/',
    title: 'Kinetic Distro — Independent Label & Creative Distribution',
    description: site.shortDescription,
    ogType: 'website',
    graph: [
      organizationEntity(),
      websiteEntity(),
      webPage('/', `${site.name} — ${site.tagline}`, site.shortDescription, {
        primaryImageOfPage: { '@id': `${BASE_URL}/#logo` },
      }),
      {
        '@type': 'ItemList',
        '@id': `${BASE_URL}/#roster`,
        name: 'Kinetic Distro roster',
        numberOfItems: artists.length,
        itemListElement: artists.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: { '@id': ID.artist(a.slug), '@type': 'MusicGroup', name: a.name, url: abs(`/roster/${a.slug}`) },
        })),
      },
    ],
  };
}

export function rosterSeo(): RouteSeo {
  return {
    path: '/roster',
    title: `Roster — ${artists.length} artists on Kinetic Distro`,
    description: `The ${artists.length} projects signed to Kinetic Distro: ${artists
      .slice(0, 5)
      .map((a) => a.name)
      .join(', ')} and more — from dark synthwave and ritual electronics to thrash metal and Scandinavian pop.`,
    ogType: 'website',
    graph: [
      organizationEntity(),
      websiteEntity(),
      {
        ...webPage('/roster', 'Roster', 'Every artist signed to Kinetic Distro.'),
        '@type': 'CollectionPage',
      },
      breadcrumb([HOME, { name: 'Roster', path: '/roster' }]),
      {
        '@type': 'ItemList',
        '@id': `${abs('/roster')}#list`,
        numberOfItems: artists.length,
        itemListOrder: 'https://schema.org/ItemListUnordered',
        itemListElement: artists.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: artistEntity(a),
        })),
      },
    ],
  };
}

export function artistSeo(artist: Artist): RouteSeo {
  const discography = releasesForArtist(artist.slug);
  const path = `/roster/${artist.slug}`;

  return {
    path,
    title: fitTitle(artist.name, artist.genre, 'Kinetic Distro'),
    description: `${artist.tagline} ${artist.bio[0]}`.slice(0, 300),
    ogType: 'profile',
    image: artist.image,
    lastmod: discography[0]?.date,
    graph: [
      organizationEntity(),
      websiteEntity(),
      {
        ...webPage(path, artist.name, artist.tagline),
        '@type': 'ProfilePage',
        mainEntity: { '@id': ID.artist(artist.slug) },
      },
      breadcrumb([HOME, { name: 'Roster', path: '/roster' }, { name: artist.name, path }]),
      artistEntity(artist, { deep: true }),
      ...discography.map((r) => albumEntity(r)),
    ],
  };
}

export function releasesSeo(): RouteSeo {
  return {
    path: '/releases',
    title: `Releases — the full Kinetic Distro catalogue`,
    description: `All ${allReleases.length} releases on Kinetic Distro, from ${
      allReleases[allReleases.length - 1]?.title ?? ''
    } to ${allReleases[0]?.title ?? ''} — albums, remix collections and EPs.`,
    ogType: 'website',
    lastmod: allReleases[0]?.date,
    graph: [
      organizationEntity(),
      websiteEntity(),
      {
        ...webPage('/releases', 'Releases', 'The complete Kinetic Distro catalogue.'),
        '@type': 'CollectionPage',
      },
      breadcrumb([HOME, { name: 'Releases', path: '/releases' }]),
      {
        '@type': 'ItemList',
        '@id': `${abs('/releases')}#list`,
        numberOfItems: allReleases.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: allReleases.map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: albumEntity(r),
        })),
      },
      ...artists.map((a) => artistEntity(a)),
    ],
  };
}

export function releaseSeo(release: Release): RouteSeo {
  const path = `/releases/${release.slug}`;
  const credited = release.artistSlugs
    .map((slug) => artists.find((a) => a.slug === slug))
    .filter(Boolean) as Artist[];

  return {
    path,
    title: fitTitle(release.title, release.artistDisplay, 'Kinetic Distro'),
    description: `${release.artistDisplay} — ${release.title} (${release.catalog}, ${release.date.slice(
      0,
      4,
    )}). ${release.blurb}`.slice(0, 300),
    ogType: 'music.album',
    image: release.image,
    lastmod: release.date,
    graph: [
      organizationEntity(),
      websiteEntity(),
      {
        ...webPage(path, release.title, release.blurb),
        '@type': 'ItemPage',
        mainEntity: { '@id': ID.album(release.slug) },
      },
      breadcrumb([HOME, { name: 'Releases', path: '/releases' }, { name: release.title, path }]),
      albumEntity(release, { deep: true }),
      ...credited.map((a) => artistEntity(a)),
    ],
  };
}

export function aboutSeo(): RouteSeo {
  return {
    path: '/about',
    title: 'About Kinetic Distro — independent label based in France',
    description:
      'Kinetic Distro is an independent label and creative distribution platform founded in France, built around narrative-driven releases and artist-owned masters.',
    ogType: 'website',
    graph: [
      organizationEntity(),
      websiteEntity(),
      {
        ...webPage('/about', 'About Kinetic Distro', 'The label, its principles and how it works.'),
        '@type': 'AboutPage',
        mainEntity: { '@id': ID.organization },
      },
      breadcrumb([HOME, { name: 'About', path: '/about' }]),
    ],
  };
}

export function contactSeo(): RouteSeo {
  return {
    path: '/contact',
    title: 'Contact Kinetic Distro — label and press',
    description:
      'Get in touch with Kinetic Distro for label enquiries, demo submissions, press, sync and licensing.',
    ogType: 'website',
    graph: [
      organizationEntity(),
      websiteEntity(),
      {
        ...webPage('/contact', 'Contact', 'How to reach Kinetic Distro.'),
        '@type': 'ContactPage',
      },
      breadcrumb([HOME, { name: 'Contact', path: '/contact' }]),
      {
        '@type': 'Organization',
        '@id': ID.organization,
        contactPoint: [
          { '@type': 'ContactPoint', contactType: 'general enquiries', email: site.email, availableLanguage: ['en', 'fr'] },
        ],
      },
    ],
  };
}

export function notFoundSeo(): RouteSeo {
  return {
    path: '/404',
    title: 'Signal lost — 404 | Kinetic Distro',
    description:
      'This page is not part of the Kinetic Distro catalogue. Browse the roster, the releases or head back to the homepage.',
    ogType: 'website',
    noIndex: true,
    graph: [organizationEntity(), websiteEntity()],
  };
}

/* -------------------------------------------------------------------------- */
/* Every indexable route, for the prerenderer and the sitemap                   */
/* -------------------------------------------------------------------------- */

export function allRoutes(): RouteSeo[] {
  return [
    homeSeo(),
    rosterSeo(),
    releasesSeo(),
    aboutSeo(),
    contactSeo(),
    ...artists.map(artistSeo),
    ...allReleases.map(releaseSeo),
    notFoundSeo(),
  ];
}

/** Wraps a route's entities in the envelope crawlers expect. */
export const jsonLd = (route: RouteSeo) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': route.graph });
