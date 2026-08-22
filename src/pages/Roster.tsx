import { useState } from 'react';
import { Link } from 'react-router-dom';
import { artists } from '../content/site';
import { releasesForArtist } from '../content/catalog';
import Cover from '../components/Cover';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { rosterSeo } from '../lib/seo';

export default function Roster() {
  const [active, setActive] = useState<string | null>(null);

  const list = artists;

  return (
    <>
      <Seo route={rosterSeo()} />

      <PageHeader
        eyebrow="The roster"
        title={
          <>
            {artists.length} worlds,
            <br />
            one frame<span className="accent-text">.</span>
          </>
        }
        intro="Kinetic Distro is not a genre label. What the roster shares is intent: every project arrives with its own logic, its own imagery and its own reason to exist."
        meta={[
          { k: 'Projects', v: String(artists.length) },
          { k: 'Genres', v: 'Synthwave → Thrash' },
          { k: 'Base', v: 'France' },
        ]}
      />

      <div className="sticky top-[68px] z-30 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
        <div className="shell flex items-center justify-between py-4">
          <p className="label">{list.length} projects</p>
          <Link to="/releases/" className="label link-underline hover:!text-paper">
            Catalogue →
          </Link>
        </div>
      </div>

      <section className="border-b border-white/10">
        <ul>
          {list.map((a, i) => {
            const count = releasesForArtist(a.slug).length;
            const isActive = active === a.slug;
            return (
              <Reveal as="li" key={a.slug} delay={Math.min(i, 5) * 50}>
                <Link
                  to={`/roster/${a.slug}/`}
                  onMouseEnter={() => setActive(a.slug)}
                  onMouseLeave={() => setActive(null)}
                  className="group relative block border-b border-white/10 transition-colors duration-500"
                  style={{
                    ['--accent' as string]: a.accent,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.03)' : undefined,
                  }}
                >
                  <span
                    className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 transition-transform duration-500 group-hover:scale-y-100"
                    style={{ background: a.accent }}
                    aria-hidden="true"
                  />
                  {/* Below `sm` this is a plain two-column flex — picture, then
                      everything else — because the 12-column grid put the name
                      after the picture while the genre and the count wrapped
                      back to the page margin, leaving each row misaligned with
                      itself. From `sm` up there is room for the real grid. */}
                  <div className="shell flex items-center gap-4 py-6 sm:grid sm:grid-cols-12 sm:py-8 lg:py-10">
                    <Cover
                      seed={a.slug}
                      accent={a.accent}
                      image={a.image}
                      label={a.name}
                      focus="top"
                      className="h-16 w-16 shrink-0 border border-white/10 sm:col-span-2 sm:h-16 sm:w-16 lg:col-span-1"
                    />

                    <span className="min-w-0 flex-1 sm:col-span-5 sm:flex sm:items-center sm:gap-4 lg:col-span-5">
                      <span className="label hidden sm:block">{String(i + 1).padStart(2, '0')}</span>
                      <span
                        className="display block truncate text-2xl leading-none transition-colors duration-300 sm:whitespace-normal sm:text-4xl lg:text-5xl"
                        style={{ color: isActive ? a.accent : undefined }}
                      >
                        {a.name}
                      </span>
                      {/* On a phone the metadata belongs under the name, on the
                          name's own left edge — not back at the page margin. */}
                      <span className="mt-1.5 block font-mono text-[12px] text-chrome-400 sm:hidden">
                        {a.genre} · {count} release{count === 1 ? '' : 's'}
                      </span>
                    </span>

                    <span className="hidden font-mono text-[13px] text-chrome sm:col-span-3 sm:block">
                      {a.genre}
                    </span>

                    <span className="hidden text-sm leading-snug text-chrome-400 sm:col-span-1 sm:block lg:col-span-2">
                      {count} release{count === 1 ? '' : 's'}
                    </span>

                    <span className="shrink-0 text-chrome-400 transition-transform duration-300 group-hover:translate-x-1.5 sm:col-span-1 sm:flex sm:justify-end">
                      →
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

    </>
  );
}
