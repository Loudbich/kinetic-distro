import { site } from '../content/site';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { contactSeo } from '../lib/seo';

const desks = [
  {
    k: 'Label & press',
    v: site.email,
    d: 'Partnerships, licensing, sync, promos, interviews — one inbox, read by a person.',
  },
];

export default function Contact() {
  return (
    <>
      <Seo route={contactSeo()} />

      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Start the
            <br />
            conversation<span className="accent-text">.</span>
          </>
        }
        intro="Small team, real inbox. Every message gets read, and almost every message gets an answer within a few days."
        meta={[
          { k: 'Based in', v: site.location },
          { k: 'Language', v: 'EN / FR' },
          { k: 'Response', v: 'A few days' },
        ]}
      />

      <section className="border-b border-white/10 bg-ink-800">
        <div className="shell py-20 lg:py-28">
          <ul className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 lg:grid-cols-3">
            {desks.map((d, i) => (
              <Reveal as="li" key={d.k} delay={i * 80} className="bg-ink-800 p-8 lg:p-10">
                <p className="label mb-8">{d.k}</p>
                <a
                  href={`mailto:${d.v}`}
                  className="display-tight link-underline block break-all text-xl leading-tight sm:text-2xl"
                >
                  {d.v}
                </a>
                <p className="mt-5 text-sm leading-relaxed text-chrome-400">{d.d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="shell grid grid-cols-1 gap-12 py-20 lg:grid-cols-12 lg:py-28">
          <Reveal className="lg:col-span-4">
            <p className="label mb-6">Elsewhere</p>
            <h2 className="display text-4xl leading-none sm:text-5xl">
              Or just
              <br />
              listen
            </h2>
          </Reveal>
          <div className="lg:col-span-8">
            <ul>
              {[
                { l: 'Bandcamp', h: site.links.bandcamp, d: 'Full catalogue · direct support' },
                { l: 'SoundCloud', h: site.links.soundcloud, d: 'Streams · remixes · works in progress' },
              ].map((x, i) => (
                <Reveal key={x.l} delay={i * 70}>
                  <a
                    href={x.h}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group grid grid-cols-12 items-center gap-4 border-b border-white/10 py-7 transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="col-span-6 display-tight text-2xl transition-colors group-hover:accent-text sm:col-span-4 sm:text-3xl">
                      {x.l}
                    </span>
                    <span className="col-span-6 font-mono text-[13px] text-chrome-400 sm:col-span-7">
                      {x.d}
                    </span>
                    <span className="col-span-12 text-chrome-400 transition-transform duration-300 group-hover:translate-x-1.5 sm:col-span-1 sm:text-right">
                      ↗
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="shell py-24 text-center lg:py-32">
        <Reveal>
          <p className="label mb-8">{site.name}</p>
          <p className="display mx-auto max-w-4xl text-balance text-3xl leading-tight sm:text-4xl lg:text-5xl">
            {site.manifestoLines[2]}
          </p>
        </Reveal>
      </section>
    </>
  );
}
