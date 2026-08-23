import { Link } from 'react-router-dom';
import { artists, site } from '../content/site';
import { allReleases } from '../content/catalog';
import Marquee from '../components/Marquee';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { aboutSeo } from '../lib/seo';

const principles = [
  {
    n: '01',
    t: 'Narrative over output',
    d: 'We would rather release four records that mean something than forty that fill a feed. Every entry in the catalogue has a reason to exist and a story it is telling.',
  },
  {
    n: '02',
    t: 'Genre is not the filter',
    d: 'Darkwave sits next to neo-soul, post-metal next to italo-disco. What holds the roster together is conviction and craft, not a shared BPM range.',
  },
  {
    n: '03',
    t: 'The artist owns the work',
    d: 'Masters stay with the artist. Splits are agreed before release. Reporting is raw. A label that needs to hide its numbers is not a label worth signing to.',
  },
  {
    n: '04',
    t: 'Build the whole world',
    d: 'Audio is one layer. Artwork, typography, video, text and the way a release is staged are all part of the record — so we work on all of it.',
  },
];

export default function About() {
  return (
    <>
      <Seo route={aboutSeo()} />

      <PageHeader
        eyebrow="About"
        title={
          <>
            Signal
            <br />
            over noise<span className="accent-text">.</span>
          </>
        }
        intro={site.shortDescription}
        meta={[
          { k: 'Founded', v: site.founded },
          { k: 'Based in', v: site.location },
          { k: 'Projects', v: String(artists.length) },
          { k: 'Releases', v: String(allReleases.length) },
        ]}
      />

      <section className="border-b border-white/10 bg-ink-800">
        <div className="shell grid grid-cols-1 gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
          <Reveal className="lg:col-span-3">
            <p className="label">The idea</p>
          </Reveal>
          <div className="lg:col-span-8">
            <Reveal>
              <p className="text-balance text-2xl leading-snug lg:text-3xl">
                Kinetic Distro started from a simple frustration: the tools to release music are
                everywhere, and almost none of them care what the music is about.
              </p>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-8 leading-relaxed text-chrome">
                Upload platforms solved logistics and left everything else — direction, identity,
                sequencing, meaning — to the artist, alone, usually at 2am. Traditional labels solved
                the creative side by taking ownership of the work. Neither felt like the right trade.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-6 leading-relaxed text-chrome">
                So we built the middle: a label that works like a creative studio and distributes like
                a platform. We take on a small number of projects, help shape them into complete
                releases, push them through every store that matters, and leave the masters where they
                belong.
              </p>
            </Reveal>
            <Reveal delay={190}>
              <p className="mt-6 leading-relaxed text-chrome">
                The roster runs from dark synthwave to post-metal to neo-soul because the filter was
                never genre. It was always whether the project had a world behind it.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="shell py-20 lg:py-28">
          <Reveal>
            <p className="label mb-14">Principles</p>
          </Reveal>
          <ul className="grid grid-cols-1 gap-x-16 gap-y-14 lg:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal as="li" key={p.n} delay={(i % 2) * 90}>
                <p className="label accent-text mb-6">{p.n}</p>
                <h2 className="display-tight text-balance text-3xl leading-tight">{p.t}</h2>
                <p className="mt-5 leading-relaxed text-chrome-400">{p.d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <Marquee
        items={['Narrative-driven releases', 'Artist-owned masters', 'Genre agnostic', 'Small on purpose']}
        className="display border-b border-white/10 py-5 text-3xl text-white/10 sm:text-4xl"
      />

      <section className="border-b border-white/10 bg-ink-800">
        <div className="shell grid grid-cols-1 gap-12 py-20 lg:grid-cols-12 lg:py-28">
          <Reveal className="lg:col-span-4">
            <p className="label mb-6">Where to find us</p>
            <h2 className="display text-4xl leading-none sm:text-5xl">Listen first</h2>
          </Reveal>
          <div className="lg:col-span-8">
            <ul className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
              {[
                { l: 'Bandcamp', h: site.links.bandcamp, d: 'Full catalogue, direct support' },
                { l: 'SoundCloud', h: site.links.soundcloud, d: 'Streams, remixes, works in progress' },
              ].map((x) => (
                <li key={x.l} className="bg-ink-800">
                  <a
                    href={x.h}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex h-full flex-col gap-8 p-8 transition-colors hover:bg-ink-700"
                  >
                    <span className="display-tight text-2xl transition-colors group-hover:accent-text">
                      {x.l} ↗
                    </span>
                    <span className="text-sm text-chrome-400">{x.d}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="shell py-24 text-center lg:py-32">
        <Reveal>
          <h2 className="display mx-auto max-w-3xl text-balance text-4xl leading-none sm:text-5xl lg:text-7xl">
            Meet the roster
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/roster/" className="btn-signal">
              See all {artists.length} projects
            </Link>
            <Link to="/contact/" className="btn-ghost">
              Contact
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
