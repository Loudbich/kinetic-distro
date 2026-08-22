import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { artists, getArtist } from '../content/site';
import { keyVisualFor, releasesForArtist, syncedFor, tracksForArtist } from '../content/catalog';
import { ArtistTrackFeed } from '../components/TrackFeed';
import Cover from '../components/Cover';
import Marquee from '../components/Marquee';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { artistSeo } from '../lib/seo';
import NotFound from './NotFound';
import { fmtDate } from '../lib/format';

export default function ArtistPage() {
  const { slug = '' } = useParams();
  const artist = getArtist(slug);

  useEffect(() => {
    if (!artist) return;
    const root = document.documentElement;
    const prev = root.style.getPropertyValue('--accent');
    root.style.setProperty('--accent', artist.accent);
    return () => {
      root.style.setProperty('--accent', prev || '#FF4D12');
    };
  }, [artist]);

  if (!artist) return <NotFound />;

  const discography = releasesForArtist(artist.slug);
  const synced = syncedFor(artist.slug);
  const tracks = tracksForArtist(artist.slug, 10);
  const visual = keyVisualFor(artist.slug);
  const index = artists.findIndex((a) => a.slug === artist.slug);
  const next = artists[(index + 1) % artists.length];

  return (
    <>
      <Seo route={artistSeo(artist)} />

      {/* The artist's key visual — the same file the home carousel shows, so a
          slide and the page it leads to can never drift apart. When there is no
          visual the page starts on its hero exactly as before, which is why the
          top padding moves with the banner rather than being duplicated. */}
      {visual && (
        <section className="relative border-b border-white/10 pt-[68px]">
          <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] lg:aspect-[2.39/1]">
            <picture>
              {visual.mobile && <source media="(max-width: 639px)" srcSet={visual.mobile.url} />}
              <img
                src={visual.wide.url}
                alt={`${artist.name} — ${artist.tagline}`}
                width={visual.wide.width}
                height={visual.wide.height}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </picture>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent"
              aria-hidden="true"
            />
          </div>
        </section>
      )}

      {/* HERO */}
      <section
        className={`relative overflow-hidden border-b border-white/10 noise ${visual ? '' : 'pt-[68px]'}`}
      >
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-70" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-[15%] top-0 h-[55vw] w-[55vw] rounded-full opacity-[0.16] blur-[130px]"
          style={{ background: artist.accent }}
          aria-hidden="true"
        />

        <div className="shell relative py-20 lg:py-28">
          <Reveal>
            <Link to="/roster/" className="label link-underline hover:!text-paper">
              ← Roster
            </Link>
          </Reveal>

          <Reveal delay={70}>
            <h1
              className="display mt-10 text-balance break-words text-[11vw] leading-[0.84] sm:text-[9vw] lg:text-[7.5rem]"
              style={{ color: artist.accent }}
            >
              {artist.name}
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-8 max-w-2xl text-balance text-2xl leading-tight lg:text-3xl">
              {artist.tagline}
            </p>
          </Reveal>

          <Reveal delay={200}>
            <dl className="mt-14 grid grid-cols-2 gap-8 border-t border-white/10 pt-8 sm:grid-cols-4">
              {[
                { k: 'Genre', v: artist.genre },
                { k: 'Origin', v: artist.origin },
                { k: 'Signed', v: artist.since },
                { k: 'Releases', v: String(discography.length) },
              ].map((m) => (
                <div key={m.k}>
                  <dt className="label mb-2">{m.k}</dt>
                  <dd className="font-mono text-sm text-paper">{m.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* BIO */}
      <section className="border-b border-white/10 bg-ink-800">
        <div className="shell grid gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
          <Reveal className="lg:col-span-3">
            <p className="label">Profile</p>

            {/* Only artists with a photo get one; the rest keep the plain label
                the column has always shown, with nothing standing in for it. */}
            {artist.image && (
              <figure className="mt-6 border border-white/10">
                <div
                  className="h-[3px] w-full"
                  style={{ background: artist.accent }}
                  aria-hidden="true"
                />
                <img
                  src={artist.image}
                  alt={`${artist.name} — portrait`}
                  width={1000}
                  height={1250}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
              </figure>
            )}
          </Reveal>

          <div className="lg:col-span-6">
            {artist.bio.map((p, i) => (
              <Reveal key={i} delay={i * 80}>
                <p
                  className={`text-chrome ${
                    i === 0 ? 'text-xl leading-relaxed text-paper lg:text-2xl' : 'mt-6 leading-relaxed'
                  }`}
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal className="lg:col-span-3" delay={120}>
            <p className="label mb-5">Signature</p>
            <ul className="space-y-3">
              {artist.traits.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-chrome">
                  <span style={{ color: artist.accent }}>▍</span>
                  {t}
                </li>
              ))}
            </ul>

            <p className="label mb-5 mt-10">Links</p>
            <ul className="space-y-3">
              {artist.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline text-sm text-chrome hover:text-paper"
                  >
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* DISCOGRAPHY */}
      {discography.length > 0 && (
        <section className="border-b border-white/10">
          <div className="shell py-20 lg:py-28">
            <Reveal>
              <p className="label mb-12">Discography</p>
            </Reveal>
            <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {discography.map((r, i) => (
                <Reveal as="li" key={r.slug} delay={i * 70}>
                  <Link to={`/releases/${r.slug}/`} className="group block">
                    <Cover
                      seed={r.slug}
                      accent={artist.accent}
                      image={r.image}
                      label={r.title}
                      className="aspect-square w-full border border-white/10"
                    />
                    <p className="label mt-5">
                      {r.catalog} · {fmtDate(r.date)}
                    </p>
                    <h3
                      className="display-tight mt-2 text-2xl transition-colors"
                      style={{ color: undefined }}
                    >
                      <span className="group-hover:text-[color:var(--accent)] transition-colors">
                        {r.title}
                      </span>
                    </h3>
                    <p className="mt-1.5 font-mono text-[13px] text-chrome-400">{r.artistDisplay}</p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ArtistTrackFeed tracks={tracks} accent={artist.accent} profileUrl={synced?.profileUrl} />

      <Marquee
        items={[artist.name, artist.genre, 'Kinetic Distro']}
        className="display border-b border-white/10 py-5 text-3xl text-white/10 sm:text-4xl"
      />

      {/* NEXT */}
      <section>
        <Link
          to={`/roster/${next.slug}/`}
          className="group block py-20 transition-colors hover:bg-white/[0.03] lg:py-28"
        >
          <div className="shell">
            <p className="label mb-6">Next project</p>
            <h2
              className="display text-balance break-words text-4xl leading-none transition-colors sm:text-6xl lg:text-8xl"
              style={{ color: undefined }}
            >
              <span
                className="transition-colors duration-300 group-hover:text-[color:var(--next)]"
                style={{ ['--next' as string]: next.accent }}
              >
                {next.name}
              </span>
              <span className="ml-6 inline-block text-chrome-400 transition-transform duration-300 group-hover:translate-x-3">
                →
              </span>
            </h2>
          </div>
        </Link>
      </section>
    </>
  );
}
