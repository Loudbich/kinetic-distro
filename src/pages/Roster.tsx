import { useState } from 'react';
import { Link } from 'react-router-dom';
import { artists } from '../content/site';
import { releasesForArtist } from '../content/catalog';
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
                  <div className="shell grid grid-cols-12 items-center gap-4 py-8 lg:py-10">
                    <span className="label col-span-2 sm:col-span-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span className="col-span-10 sm:col-span-5">
                      <span
                        className="display block text-3xl leading-none transition-colors duration-300 sm:text-4xl lg:text-5xl"
                        style={{ color: isActive ? a.accent : undefined }}
                      >
                        {a.name}
                      </span>
                    </span>

                    <span className="col-span-12 font-mono text-[13px] text-chrome sm:col-span-3">
                      {a.genre}
                    </span>

                    <span className="col-span-8 text-sm leading-snug text-chrome-400 sm:col-span-2">
                      {count} release{count === 1 ? '' : 's'}
                    </span>

                    <span className="col-span-4 flex justify-end text-chrome-400 transition-transform duration-300 group-hover:translate-x-1.5 sm:col-span-1">
                      →
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section className="shell py-20 text-center lg:py-28">
        <Reveal>
          <p className="label mb-6">Not on this list yet?</p>
          <h2 className="display mx-auto max-w-3xl text-balance text-4xl leading-none sm:text-5xl lg:text-6xl">
            The roster is small on purpose
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-chrome">
            We take on a handful of projects a year so each one gets real attention.
          </p>
          <Link to="/demos/" className="btn-signal mt-9">
            Submit a demo
          </Link>
        </Reveal>
      </section>
    </>
  );
}
