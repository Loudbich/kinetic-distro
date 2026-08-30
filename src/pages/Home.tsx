import { Link } from 'react-router-dom';
import { artists, site } from '../content/site';
import { allReleases, popularTracks } from '../content/catalog';
import { LabelTrackFeed } from '../components/TrackFeed';
import Cover from '../components/Cover';
import Carousel from '../components/Carousel';
import Marquee from '../components/Marquee';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { homeSeo } from '../lib/seo';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Home() {
  // The section shows the newest record by date. That can be one that has been
  // announced but is not out yet, so the heading and the date line both say so
  // rather than presenting a release date as a thing that already happened.
  // It used to take the first entry flagged `featured` in site.ts, which meant a
  // flag set once in March kept a new album off the home page.
  const featured = allReleases[0];
  const featuredArtist = artists.find((a) => a.slug === featured.artistSlugs[0]);
  const latest = allReleases.slice(0, 10);
  const feed = popularTracks(8);

  return (
    <>
      <Seo route={homeSeo()} />

      {/* The carousel leads the page: the artists are what a visitor should meet
          first. The label's own statement follows immediately underneath, which
          is also where the h1 lives — the slides carry the artist names in
          type, and a second display heading over them would be unreadable. */}
      <Carousel hero />

      {/* ------------------------------------------------------------ IDENTITY */}
      <section className="relative overflow-hidden border-b border-white/10 noise">
        <div className="pointer-events-none absolute inset-0 grid-lines" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-[10%] top-[8%] h-[46vw] w-[46vw] rounded-full opacity-[0.14] blur-[120px]"
          style={{ background: 'var(--accent)' }}
          aria-hidden="true"
        />

        <div className="shell relative py-16 lg:py-20">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="flex items-center gap-2.5">
                <span className="h-2 w-2 animate-flicker accent-bg" />
                <span className="label">Transmitting from {site.location}</span>
              </span>
              <span className="label hidden sm:inline">Est. {site.founded}</span>
              <span className="label hidden sm:inline">{artists.length} projects</span>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="display text-[11vw] leading-[0.82] tracking-tightest sm:text-[9vw] lg:text-[6rem]">
              Kinetic
              <br />
              Distro<span className="accent-text">.</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10 grid grid-cols-1 gap-10 border-t border-white/10 pt-10 lg:grid-cols-12">
              <p className="text-balance text-xl leading-snug lg:col-span-6 lg:text-2xl">
                An independent label and creative distribution platform for artists who arrive with a
                whole world, not just a track.
              </p>
              <div className="lg:col-span-4 lg:col-start-8">
                <p className="text-chrome">{site.manifestoLines[0]}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/roster/" className="btn-signal">
                    See the roster
                  </Link>
                  <Link to="/releases/" className="btn-ghost">
                    The catalogue
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Marquee
          items={artists.map((a) => a.name)}
          className="display border-t border-white/10 py-4 text-2xl text-white/25 sm:text-[2rem]"
        />
      </section>

      {/* ------------------------------------------------- FEATURED RELEASE */}
      <section className="border-b border-white/10 bg-ink-800">
        <div className="shell py-20 lg:py-28">
          <Reveal>
            <div className="mb-12 flex items-end justify-between gap-6">
              <p className="label">{featured.upcoming ? 'Next transmission' : 'Latest transmission'}</p>
              <Link to="/releases/" className="label link-underline hover:!text-paper">
                All releases →
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-6" delay={60}>
              <Link to={`/releases/${featured.slug}/`} className="group block">
                <Cover
                  seed={featured.slug}
                  accent={featuredArtist?.accent ?? '#FF4D12'}
                  label={`${featured.artistDisplay} — ${featured.title}`}
                  image={featured.image}
                  srcset={featured.imageSrcset}
                  className="aspect-square w-full border border-white/10"
                />
              </Link>
            </Reveal>

            <Reveal className="flex flex-col justify-center lg:col-span-6" delay={140}>
              <p className="label mb-5">
                {featured.catalog} · {featured.type} ·{' '}
                {featured.upcoming ? `Out ${fmtDate(featured.date)}` : fmtDate(featured.date)}
              </p>
              {/* `break-words` is a safety net: a release title is data, and this one
                  runs to sixty characters. At 5xl with no break opportunity it
                  scrolled the whole page sideways on a phone. */}
              <h2 className="display text-balance break-words text-4xl leading-[0.9] sm:text-5xl lg:text-7xl">
                {featured.title}
              </h2>
              <p className="mt-5 font-mono text-sm text-chrome">{featured.artistDisplay}</p>
              <p className="mt-8 max-w-lg text-lg leading-relaxed text-chrome">{featured.blurb}</p>

              {featured.tracklist && (
                <ol className="mt-10 grid max-w-lg grid-cols-1 gap-x-10 sm:grid-cols-2">
                  {featured.tracklist.map((t, i) => (
                    <li
                      key={t}
                      className="flex items-baseline gap-3 border-b border-white/10 py-2.5 font-mono text-[13px] text-chrome"
                    >
                      <span className="text-chrome-300">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-paper/90">{t}</span>
                    </li>
                  ))}
                </ol>
              )}

              <div className="mt-10 flex flex-wrap gap-3">
                <a href={featured.listenUrl} target="_blank" rel="noreferrer noopener" className="btn-signal">
                  Listen now ↗
                </a>
                <Link to={`/releases/${featured.slug}/`} className="btn-ghost">
                  Release details
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <LabelTrackFeed tracks={feed} />

      {/* ------------------------------------------------------- MANIFESTO */}
      <section className="border-b border-white/10">
        <div className="shell py-20 lg:py-28">
          <Reveal>
            <p className="label mb-12">What we are</p>
          </Reveal>
          <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-3">
            {site.manifestoLines.map((line, i) => (
              <Reveal key={line} delay={i * 90}>
                <p className="label mb-6 accent-text">0{i + 1}</p>
                <p className="display-tight text-balance text-2xl leading-tight sm:text-3xl">{line}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- ROSTER */}
      <section className="border-b border-white/10 bg-ink-800">
        <div className="shell py-20 lg:py-28">
          <Reveal>
            <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="label mb-6">The roster</p>
                <h2 className="display text-5xl leading-none sm:text-6xl lg:text-7xl">
                  {artists.length} distinct
                  <br />
                  sonic universes
                </h2>
              </div>
              <Link to="/roster/" className="label link-underline hover:!text-paper">
                Full roster →
              </Link>
            </div>
          </Reveal>

          <ul className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((a, i) => (
              <Reveal as="li" key={a.slug} delay={(i % 4) * 70} className="bg-ink-800">
                <Link
                  to={`/roster/${a.slug}/`}
                  className="group relative flex h-full flex-col transition-colors duration-500 hover:bg-ink-700"
                  style={{ ['--accent' as string]: a.accent }}
                >
                  <span
                    className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                    style={{ background: a.accent }}
                    aria-hidden="true"
                  />
                  {/* The portrait, not the carousel key visual: those already
                      lead this page as the hero, and they carry the artist name
                      in type, which would repeat the heading right below them.
                      `focus="top"` keeps the face when the square crop bites,
                      and an artist with no portrait yet falls through to the
                      generative pattern in their own accent rather than a hole
                      in the grid. */}
                  <Cover
                    seed={a.slug}
                    accent={a.accent}
                    image={a.image}
                    label={a.name}
                    focus="top"
                    className="aspect-[4/5] w-full sm:aspect-square"
                  />
                  <span className="flex flex-1 flex-col justify-between gap-8 p-7">
                    <span className="label">{a.genre}</span>
                    <span className="block">
                      <span className="display-tight block text-2xl leading-tight transition-colors duration-300 group-hover:text-[color:var(--accent)] sm:text-[1.75rem]">
                        {a.name}
                      </span>
                      <span className="mt-3 block text-sm leading-snug text-chrome-400">{a.tagline}</span>
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* --------------------------------------------------------- RELEASES */}
      <section className="border-b border-white/10">
        <div className="shell py-20 lg:py-28">
          <Reveal>
            <p className="label mb-12">Recent catalogue</p>
          </Reveal>

          <ul>
            {latest.map((r, i) => {
              const artist = artists.find((a) => a.slug === r.artistSlugs[0]);
              return (
                <Reveal as="li" key={r.slug} delay={i * 60}>
                  {/* Flex on a phone, grid from `sm` up — the same shape the
                      roster rows use. A 12-column grid at this width pushed the
                      title beside the artwork while the artist and date wrapped
                      back to the page margin, leaving each row out of line with
                      itself. */}
                  <Link
                    to={`/releases/${r.slug}/`}
                    className="group flex items-center gap-4 border-b border-white/10 py-4 transition-colors hover:bg-white/[0.03] sm:grid sm:grid-cols-12 sm:py-5"
                  >
                    <Cover
                      seed={r.slug}
                      accent={artist?.accent ?? '#FF4D12'}
                      image={r.image}
                      srcset={r.imageSrcset}
                      label={`${r.artistDisplay} — ${r.title}`}
                      className="h-16 w-16 shrink-0 border border-white/10 sm:col-span-2 lg:col-span-1"
                    />

                    <span className="min-w-0 flex-1 sm:col-span-5 sm:flex sm:items-center sm:gap-4 lg:col-span-5">
                      <span className="label hidden shrink-0 sm:block">{r.catalog}</span>
                      {/* `block` matters: on an inline span `min-w-0` does
                          nothing, the title sized to its content and scrolled
                          the page sideways. Kept truncated until `lg`, where
                          the column is finally wide enough to let a long title
                          wrap without turning the row into a paragraph. */}
                      <span className="block min-w-0">
                        <span className="display-tight block truncate text-xl transition-colors lg:whitespace-normal sm:text-2xl">
                          <span
                            className="transition-colors group-hover:text-[color:var(--accent)]"
                            style={{ ['--accent' as string]: artist?.accent }}
                          >
                            {r.title}
                          </span>
                        </span>
                        {/* On a phone the metadata belongs under the title, on
                            the title's own left edge. */}
                        <span className="mt-1 block truncate font-mono text-[12px] text-chrome-400 sm:hidden">
                          {r.catalog} · {r.artistDisplay} · {fmtDate(r.date)}
                        </span>
                      </span>
                    </span>

                    <span className="hidden font-mono text-[13px] text-chrome sm:col-span-3 sm:block">
                      {r.artistDisplay}
                    </span>
                    <span className="hidden font-mono text-[13px] text-chrome-400 sm:col-span-1 sm:block lg:col-span-2">
                      {fmtDate(r.date)}
                    </span>
                    <span className="shrink-0 text-chrome-400 transition-transform duration-300 group-hover:translate-x-1 sm:col-span-1 sm:flex sm:justify-end">
                      →
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------------- CTA */}
      <section className="relative overflow-hidden">
        <div className="shell py-24 text-center lg:py-32">
          <Reveal>
            <p className="label mb-8">The catalogue</p>
            <h2 className="display mx-auto max-w-4xl text-balance text-5xl leading-[0.9] sm:text-6xl lg:text-8xl">
              Every record,
              <br />
              one frame<span className="accent-text">.</span>
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-lg text-chrome">
              {site.manifestoLines[2]}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link to="/releases/" className="btn-signal">
                Browse the catalogue
              </Link>
              <Link to="/contact/" className="btn-ghost">
                Get in touch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
