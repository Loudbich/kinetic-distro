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

const sorted = [...allReleases].sort((a, b) => (a.date < b.date ? 1 : -1));

/**
 * Filter options come from the catalogue rather than a hardcoded list, so an
 * artist with nothing out yet never appears as a choice that returns nothing —
 * and a new release type starts filtering the day it exists.
 */
const artistOptions = artists
  .filter((a) => sorted.some((r) => r.artistSlugs.includes(a.slug)))
  .map((a) => ({ slug: a.slug, name: a.name }));

const typeOptions = [...new Set(sorted.map((r) => r.type))].sort();

/** The hand-numbered range, derived so it cannot drift as entries are added. */
const curatedRange = (() => {
  const kd = sorted.map((r) => r.catalog).filter((c) => c.startsWith('KD-')).sort();
  return kd.length ? `${kd[0]} → ${kd[kd.length - 1]}` : '—';
})();

export default function Releases() {
  const [view, setView] = useState<View>('grid');
  const [artist, setArtist] = useState('all');
  const [type, setType] = useState('all');

  const filtered = sorted.filter(
    (r) => (artist === 'all' || r.artistSlugs.includes(artist)) && (type === 'all' || r.type === type),
  );
  const filtering = artist !== 'all' || type !== 'all';
  const reset = () => {
    setArtist('all');
    setType('all');
  };

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
          { k: 'Curated entries', v: curatedRange },
          { k: 'Formats', v: 'Digital · Tape · Vinyl' },
        ]}
      />

      {/* Native selects rather than rows of chips: eleven artists and five types
          would wrap into a wall on a phone, and a select is one tap there. The
          page is prerendered unfiltered, so a crawler still reads every record
          and the list works with JavaScript off. */}
      <div className="sticky top-[68px] z-30 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
        <div className="shell flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-4">
          {/* `sm:contents` dissolves this wrapper on wider screens so its two
              children join the parent row. On a phone it keeps the count and the
              view toggle on one line, which saves the filter bar a whole row —
              it was 122px of fixed chrome under a 68px header. */}
          <div className="flex items-center justify-between gap-4 sm:contents">
            <p className="label shrink-0" aria-live="polite">
              {filtering ? `${filtered.length} of ${sorted.length} entries` : `${sorted.length} entries`}
              {syncMeta.isLive && !filtering && (
                <span className="ml-4 hidden lg:inline">
                  <span className="accent-text">●</span> synced {fmtDate(syncMeta.generatedAt!)}
                </span>
              )}
            </p>

            <span className="flex shrink-0 gap-5 sm:order-last">
              {(['grid', 'list'] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`label transition-colors ${view === v ? '!text-paper' : 'hover:!text-paper'}`}
                >
                  {view === v && <span className="accent-text mr-2">▍</span>}
                  {v}
                </button>
              ))}
            </span>
          </div>

          <div className="flex flex-nowrap items-center gap-2 sm:flex-wrap sm:gap-3">
            <label className="sr-only" htmlFor="filter-artist">
              Filter by artist
            </label>
            <select
              id="filter-artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="label min-w-0 flex-1 cursor-pointer border border-white/15 bg-ink px-3 py-1.5 !text-[11px] transition-colors hover:border-white/30 focus-visible:border-[color:var(--accent)] sm:flex-initial"
            >
              <option value="all">All artists</option>
              {artistOptions.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="filter-type">
              Filter by format
            </label>
            <select
              id="filter-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="label min-w-0 flex-1 cursor-pointer border border-white/15 bg-ink px-3 py-1.5 !text-[11px] transition-colors hover:border-white/30 focus-visible:border-[color:var(--accent)] sm:flex-initial"
            >
              <option value="all">All formats</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {filtering && (
              <button onClick={reset} className="label link-underline hover:!text-paper">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="border-b border-white/10">
        <div className="shell py-16 lg:py-20">
          {filtered.length === 0 ? (
            <Reveal>
              <p className="display-tight text-2xl">Nothing under that combination.</p>
              <p className="mt-4 max-w-md text-chrome">
                {artistOptions.find((a) => a.slug === artist)?.name ?? 'This artist'} has no{' '}
                {type === 'all' ? 'releases' : `${type.toLowerCase()} in the catalogue`} yet.
              </p>
              <button onClick={reset} className="btn-ghost mt-8">
                Show everything
              </button>
            </Reveal>
          ) : view === 'grid' ? (
            <ul className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r, i) => {
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
                        srcset={r.imageSrcset}
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
              {filtered.map((r, i) => {
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
