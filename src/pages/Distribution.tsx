import { Link } from 'react-router-dom';
import { services, site } from '../content/site';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { distributionSeo } from '../lib/seo';

const steps = [
  {
    n: '01',
    t: 'Listen',
    d: 'You send the record. We listen to all of it, in order, the way you sequenced it. If it fits, we answer within two weeks.',
  },
  {
    n: '02',
    t: 'Frame',
    d: 'We agree on the shape of the release: format, date, singles, artwork direction, budget. Everything written down before anything is delivered.',
  },
  {
    n: '03',
    t: 'Build',
    d: 'Masters, metadata, artwork, press kit, visuals and the release page. Delivery to stores happens four weeks ahead of date, minimum.',
  },
  {
    n: '04',
    t: 'Transmit',
    d: 'Release week, pitching, premieres and paid support where it earns its place. Then we keep working the record instead of moving on.',
  },
];

const terms = [
  { k: 'Masters', v: 'You keep them. Always.' },
  { k: 'Term', v: 'Per-release deals. No lock-in catalogue grabs.' },
  { k: 'Split', v: 'Transparent, agreed in writing before release.' },
  { k: 'Reporting', v: 'Raw store data, not a summary we wrote.' },
];

export default function Distribution() {
  return (
    <>
      <Seo route={distributionSeo()} />

      <PageHeader
        eyebrow="What we do"
        title={
          <>
            Distribution
            <br />
            with a spine<span className="accent-text">.</span>
          </>
        }
        intro="Most distributors are a pipe: you upload, they deliver, nothing else happens. Kinetic Distro is the opposite — a small operation that works a small number of records properly."
      />

      {/* SERVICES */}
      <section className="border-b border-white/10 bg-ink-800">
        <div className="shell py-20 lg:py-28">
          <ul className="grid gap-px border border-white/10 bg-white/10 lg:grid-cols-2">
            {services.map((s, i) => (
              <Reveal as="li" key={s.id} delay={(i % 2) * 80} className="bg-ink-800 p-8 lg:p-12">
                <p className="label accent-text mb-8">{s.id}</p>
                <h2 className="display text-3xl leading-none sm:text-4xl">{s.title}</h2>
                <p className="mt-5 text-lg leading-relaxed text-chrome">{s.summary}</p>
                <ul className="mt-8 space-y-3.5 border-t border-white/10 pt-8">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm leading-relaxed text-chrome-400">
                      <span className="accent-text mt-0.5">▍</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* PROCESS */}
      <section className="border-b border-white/10">
        <div className="shell py-20 lg:py-28">
          <Reveal>
            <p className="label mb-12">How a release runs</p>
          </Reveal>
          <ol className="grid gap-x-12 gap-y-12 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 90}>
                <p className="display text-6xl leading-none text-white/10 lg:text-7xl">{s.n}</p>
                <h3 className="display-tight mt-6 text-2xl">{s.t}</h3>
                <p className="mt-4 text-sm leading-relaxed text-chrome-400">{s.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* TERMS */}
      <section className="border-b border-white/10 bg-ink-800">
        <div className="shell grid gap-12 py-20 lg:grid-cols-12 lg:py-28">
          <Reveal className="lg:col-span-4">
            <p className="label mb-6">The deal</p>
            <h2 className="display text-balance text-4xl leading-none sm:text-5xl">
              Plain terms,
              <br />
              written down
            </h2>
          </Reveal>
          <div className="lg:col-span-8">
            <dl>
              {terms.map((t, i) => (
                <Reveal key={t.k} delay={i * 70}>
                  <div className="grid grid-cols-1 gap-2 border-b border-white/10 py-6 sm:grid-cols-12 sm:gap-6">
                    <dt className="label sm:col-span-4">{t.k}</dt>
                    <dd className="text-lg leading-snug text-paper sm:col-span-8">{t.v}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="shell py-24 text-center lg:py-32">
        <Reveal>
          <h2 className="display mx-auto max-w-3xl text-balance text-4xl leading-none sm:text-5xl lg:text-7xl">
            Bring us a record<span className="accent-text">.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-chrome">
            Finished, half-finished or still a concept — if it has a world behind it, start the
            conversation.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/demos/" className="btn-signal">
              Submit a demo
            </Link>
            <a href={`mailto:${site.email}`} className="btn-ghost">
              {site.email}
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
