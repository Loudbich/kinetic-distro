import { useState } from 'react';
import { Link } from 'react-router-dom';
import { artists } from '../content/site';
import { allReleases, isAutoRelease, syncMeta } from '../content/catalog';
import Cover from '../components/Cover';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { releasesSeo } from '../lib/seo';
import { fmtDate } from '../lib/format';

type View = 'grid' | 'list';

export default function Releases() {
  const [view, setView] = useState<View>('grid');
  const sorted = [...allReleases].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <Seo route={releasesSeo()} />

      <PageHeader
        eyebrow="Catalogue"
        title={
          <>
            Every
            <br />
            transmission<span className="accent-text">.</span>
          </>
        }
        intro="Narrative-driven releases, catalogued in order. Each record is a complete statement — sequenced, art-directed and released as one piece."
        meta={[
          { k: 'Releases', v: String(allReleases.length) },
          { k: 'Curated entries', v: 'KD-001 → KD-007' },
          { k: 'Formats', v: 'Digital · Tape · Vinyl' },
        ]}
      />

      <div className="sticky top-[68px] z-30 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
        <div className="shell flex items-center justify-between py-4">
          <p className="label">
            {sorted.length} entries
            {syncMeta.isLive && (
              <span className="ml-4 hidden sm:inline">
                <span className="accent-text">●</span> synced {fmtDate(syncMeta.generatedAt!)}
              </span>
            )}
          </p>
          <div className="flex gap-6">
            {(['grid', 'list'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`label transition-colors ${view === v ? '!text-paper' : 'hover:!text-paper'}`}
              >
                {view === v && <span className="accent-text mr-2">▍</span>}
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="border-b border-white/10">
        <div className="shell py-16 lg:py-20">
          {view === 'grid' ? (
            <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((r, i) => {
                const artist = artists.find((a) => a.slug === r.artistSlugs[0]);
                return (
                  <Reveal as="li" key={r.slug} delay={(i % 3) * 80}>
                    <Link
                      to={`/releases/${r.slug}/`}
                      className="group block"
                      style={{ ['--accent' as string]: artist?.accent }}
                    >
                      <Cover
                        seed={r.slug}
                        accent={artist?.accent ?? '#FF4D12'}
                        image={r.image}
                        label={r.title}
                        className="aspect-square w-full border border-white/10"
                      />
                      <div className="mt-5 flex items-start justify-between gap-4">
                        <div>
                          <p className="label">
                            {r.catalog} · {r.type}
                            {isAutoRelease(r) && <span className="accent-text ml-2">auto</span>}
                          </p>
                          <h2 className="display-tight mt-2 text-2xl leading-tight transition-colors group-hover:text-[color:var(--accent)]">
                            {r.title}
                          </h2>
                          <p className="mt-1.5 font-mono text-[13px] text-chrome-400">
                            {r.artistDisplay}
                          </p>
                        </div>
                        <span className="label shrink-0 pt-1">{fmtDate(r.date).slice(-4)}</span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </ul>
          ) : (
            <ul>
              {sorted.map((r, i) => {
                const artist = artists.find((a) => a.slug === r.artistSlugs[0]);
                return (
                  <Reveal as="li" key={r.slug} delay={Math.min(i, 6) * 50}>
                    <Link
                      to={`/releases/${r.slug}/`}
                      className="group grid grid-cols-12 items-center gap-4 border-b border-white/10 py-6 transition-colors hover:bg-white/[0.03]"
                      style={{ ['--accent' as string]: artist?.accent }}
                    >
                      <span className="label col-span-3 sm:col-span-1">{r.catalog}</span>
                      <span className="col-span-9 display-tight text-xl transition-colors group-hover:text-[color:var(--accent)] sm:col-span-4 sm:text-2xl">
                        {r.title}
                      </span>
                      <span className="col-span-6 font-mono text-[13px] text-chrome sm:col-span-3">
                        {r.artistDisplay}
                      </span>
                      <span className="col-span-6 text-right font-mono text-[13px] text-chrome-400 sm:col-span-2 sm:text-left">
                        {r.type}
                      </span>
                      <span className="col-span-12 font-mono text-[13px] text-chrome-400 sm:col-span-2 sm:text-right">
                        {fmtDate(r.date)}
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="shell py-20 text-center lg:py-24">
        <Reveal>
          <p className="label mb-6">Support the artists directly</p>
          <a
            href="https://kineticdistro.bandcamp.com"
            target="_blank"
            rel="noreferrer noopener"
            className="btn-signal"
          >
            Buy on Bandcamp ↗
          </a>
        </Reveal>
      </section>
    </>
  );
}
