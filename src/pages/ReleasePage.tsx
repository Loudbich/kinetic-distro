import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { artists, getArtist } from '../content/site';
import { allReleases, findRelease } from '../content/catalog';
import Cover from '../components/Cover';
import Player from '../components/Player';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { releaseSeo } from '../lib/seo';
import NotFound from './NotFound';
import { fmtDate } from '../lib/format';

export default function ReleasePage() {
  const { slug = '' } = useParams();
  const release = findRelease(slug);
  const primary = release ? getArtist(release.artistSlugs[0]) : undefined;
  const accent = primary?.accent ?? '#FF4D12';

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.getPropertyValue('--accent');
    root.style.setProperty('--accent', accent);
    return () => root.style.setProperty('--accent', prev || '#FF4D12');
  }, [accent]);

  if (!release) return <NotFound />;

  const idx = allReleases.findIndex((r) => r.slug === release.slug);
  const next = allReleases[(idx + 1) % allReleases.length];
  const credited = release.artistSlugs
    .map((s) => artists.find((a) => a.slug === s))
    .filter(Boolean) as NonNullable<ReturnType<typeof getArtist>>[];

  return (
    <>
      <Seo route={releaseSeo(release)} />

      <section className="relative overflow-hidden border-b border-white/10 pt-[68px] noise">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" aria-hidden="true" />
        <div
          className="pointer-events-none absolute right-0 top-0 h-[50vw] w-[50vw] rounded-full opacity-[0.14] blur-[130px]"
          style={{ background: accent }}
          aria-hidden="true"
        />

        <div className="shell relative grid grid-cols-1 gap-12 py-16 lg:grid-cols-12 lg:gap-16 lg:py-24">
          <Reveal className="lg:col-span-5">
            <Link to="/releases/" className="label link-underline mb-8 inline-block hover:!text-paper">
              ← Catalogue
            </Link>
            <Cover
              seed={release.slug}
              accent={accent}
              image={release.image}
              srcset={release.imageSrcset}
              label={release.title}
              className="aspect-square w-full border border-white/10"
            />
          </Reveal>

          <div className="flex flex-col justify-center lg:col-span-7">
            <Reveal delay={70}>
              <p className="label mb-6 flex flex-wrap items-center gap-x-2 gap-y-2">
                <span>
                  {release.catalog} · {release.type}
                </span>
                {release.upcoming && (
                  <span className="border px-2 py-0.5" style={{ borderColor: accent, color: accent }}>
                    Out {fmtDate(release.date)}
                  </span>
                )}
                {release.freeDownload && (
                  <span
                    className="border px-2 py-0.5"
                    style={{ borderColor: accent, color: accent }}
                  >
                    Free download
                  </span>
                )}
              </p>
              <h1 className="display text-balance break-words text-[9vw] leading-[0.86] sm:text-[7vw] lg:text-[5rem]">
                {release.title}
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-6 flex flex-wrap gap-x-3 font-mono text-sm">
                {credited.map((a, i) => (
                  <span key={a.slug}>
                    <Link
                      to={`/roster/${a.slug}/`}
                      className="link-underline"
                      style={{ color: a.accent }}
                    >
                      {a.name}
                    </Link>
                    {i < credited.length - 1 && <span className="ml-3 text-chrome-400">×</span>}
                  </span>
                ))}
              </p>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-chrome">{release.blurb}</p>
            </Reveal>

            <Reveal delay={200}>
              <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-8 sm:grid-cols-3">
                {[
                  { k: 'Released', v: fmtDate(release.date) },
                  { k: 'Format', v: release.format },
                  { k: 'Catalogue', v: release.catalog },
                ].map((m) => (
                  <div key={m.k}>
                    <dt className="label mb-2">{m.k}</dt>
                    <dd className="font-mono text-sm text-paper">{m.v}</dd>
                  </div>
                ))}
              </dl>

              {/* streamUrl is the record's own SoundCloud set. listenUrl is not
                  usable here: on hand-written entries it points at a profile or
                  an artist's site, which would play the wrong thing. */}
              {release.streamUrl && (
                <Player
                  url={release.streamUrl}
                  title={release.title}
                  accent={accent}
                  variant="set"
                  className="mt-10"
                />
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={release.listenUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-signal"
                >
                  Open on SoundCloud ↗
                </a>
                <a
                  href={release.bandcampUrl ?? 'https://kineticdistro.bandcamp.com'}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-ghost"
                >
                  Buy on Bandcamp ↗
                </a>
                {release.vinylUrl && (
                  <a
                    href={release.vinylUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-ghost"
                  >
                    Vinyl ↗
                  </a>
                )}

              </div>

              {/* Links to this exact record, not to the artist's profile —
                  sending someone from an album page to a profile makes them
                  hunt for the record again. */}
              {release.streamingLinks?.length ? (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="label mb-4">Also on</p>
                  <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {release.streamingLinks.map((l) => (
                      <li key={l.href}>
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
                </div>
              ) : null}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Liner notes — the label's own release text, straight from SoundCloud.
          The opening paragraph is already shown above as the blurb, so it is
          skipped here rather than printed twice. */}
      {release.notes && release.notes.length > 1 && (
        <section className="border-b border-white/10">
          <div className="shell grid grid-cols-1 gap-12 py-20 lg:grid-cols-12 lg:py-24">
            <Reveal className="lg:col-span-3">
              <p className="label">Notes</p>
            </Reveal>
            <div className="lg:col-span-9 lg:max-w-3xl">
              {release.notes.slice(1).map((p, i) => (
                <Reveal key={i} delay={Math.min(i, 6) * 60}>
                  <p className={`leading-relaxed text-chrome ${i === 0 ? '' : 'mt-6'}`}>{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {release.tracklist && (
        <section className="border-b border-white/10 bg-ink-800">
          <div className="shell grid grid-cols-1 gap-12 py-20 lg:grid-cols-12 lg:py-24">
            <Reveal className="lg:col-span-3">
              <p className="label">Tracklist</p>
              <p className="mt-4 font-mono text-sm text-chrome-400">
                {release.tracklist.length} tracks
              </p>
            </Reveal>
            <ol className="lg:col-span-9">
              {release.tracklist.map((t, i) => (
                <Reveal as="li" key={t} delay={Math.min(i, 8) * 45}>
                  <div className="group flex items-baseline gap-6 border-b border-white/10 py-4 transition-colors hover:bg-white/[0.03]">
                    <span className="label w-8 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="display-tight text-xl transition-colors group-hover:text-[color:var(--accent)] sm:text-2xl">
                      {t}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section>
        <Link
          to={`/releases/${next.slug}/`}
          className="group block py-20 transition-colors hover:bg-white/[0.03] lg:py-24"
        >
          <div className="shell">
            <p className="label mb-6">Next in catalogue · {next.catalog}</p>
            <h2 className="display text-balance break-words text-4xl leading-none sm:text-5xl lg:text-7xl">
              {next.title}
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
