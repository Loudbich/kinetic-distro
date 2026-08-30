import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FeedTrack, SyncedTrack } from '../content/catalog';
import { fmtDate } from '../lib/format';
import Player from './Player';
import Reveal from './Reveal';

const fmtDuration = (sec: number | null) => {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
};

/**
 * A play control and the link out are separate elements on purpose: a button
 * nested inside an anchor is invalid, and the two do different things. The link
 * still opens SoundCloud, so the feed keeps working with JavaScript off — the
 * button only ever adds the option of staying here.
 */
function PlayButton({ accent, label, onClick }: { accent: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Play ${label}`}
      className="group/play relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-transparent"
      style={{ ['--pa' as string]: accent }}
    >
      <span
        className="flex h-full w-full items-center justify-center rounded-full opacity-0 transition-opacity group-hover/play:opacity-100"
        style={{ background: accent }}
        aria-hidden="true"
      />
      <svg
        viewBox="0 0 24 24"
        className="absolute h-3.5 w-3.5 fill-chrome transition-colors group-hover/play:fill-ink"
        aria-hidden="true"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
}

/* -------------------------------------------------------------------------- */

type ArtistFeedProps = {
  tracks: SyncedTrack[];
  accent: string;
  profileUrl?: string;
};

/** Compact list used on an artist page — everything is already their colour. */
export function ArtistTrackFeed({ tracks, accent, profileUrl }: ArtistFeedProps) {
  // One at a time: a second press replaces the first player rather than leaving
  // two of them loaded and audible.
  const [playing, setPlaying] = useState<string | null>(null);

  if (!tracks.length) return null;

  return (
    <section className="border-b border-white/10">
      <div className="shell py-20 lg:py-28">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label mb-4">Latest on SoundCloud</p>
              <p className="font-mono text-sm text-chrome-400">
                Synced automatically — {tracks.length} recent tracks
              </p>
            </div>
            {profileUrl && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="label link-underline hover:!text-paper"
              >
                Full profile ↗
              </a>
            )}
          </div>
        </Reveal>

        {/* `minmax(0,1fr)` via grid-cols-1: a grid track defaults to `auto`, so a
            long unbreakable track title stretched the column and scrolled the
            page — 793px wide inside a 365px screen. */}
        <ul className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
          {tracks.map((t, i) => (
            <Reveal as="li" key={t.id} delay={Math.min(i, 6) * 45} className="min-w-0">
              {playing === t.id ? (
                <div className="border-b border-white/10 py-4">
                  <Player url={t.url} title={t.title} accent={accent} immediate />
                </div>
              ) : (
                <div className="group flex items-center gap-4 border-b border-white/10 py-4 transition-colors hover:bg-white/[0.03]">
                  <span className="relative block h-12 w-12 shrink-0 overflow-hidden border border-white/10 bg-ink-700">
                    {t.artwork && (
                      <img
                        src={t.artwork}
                        alt=""
                        width={500}
                        height={500}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                        aria-hidden="true"
                      />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/45">
                      <PlayButton accent={accent} label={t.title} onClick={() => setPlaying(t.id)} />
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block truncate text-[15px] transition-colors hover:text-[color:var(--hl)]"
                      style={{ ['--hl' as string]: accent }}
                    >
                      {t.title}
                    </a>
                    {t.date && (
                      <span className="mt-0.5 block font-mono text-[11px] text-chrome-300">
                        {fmtDate(t.date)}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-chrome-300">
                    {fmtDuration(t.durationSec)}
                  </span>
                </div>
              )}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Cross-roster feed — one record per artist, shown as an index beside a stage.
 *
 * A grid of eight equal cards gave every artist the same small square and no
 * focus. Here the roster is a numbered index and the highlighted entry fills a
 * large stage; moving down the list wipes the next artwork over the previous
 * one with `clip-path`, in the direction of travel, rather than crossfading.
 *
 * Every row is a real button and every track keeps its link out, so the section
 * is fully readable prerendered and without JavaScript: the first entry is the
 * one on the stage, and the index is a list of eight links either way.
 *
 * It does not advance on its own. The hero carousel already does, and two
 * things moving unbidden on one page is noise rather than life.
 */
export function LabelTrackFeed({ tracks }: { tracks: FeedTrack[] }) {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);

  if (!tracks.length) return null;

  const current = tracks[active];
  // Which way the curtain travels. Reading down the index should feel like the
  // artwork is pushed up from below, and back up like it drops from above.
  const descending = active >= previous;

  const select = (i: number) => {
    setPrevious(active);
    setActive(i);
  };

  return (
    <section className="border-b border-white/10">
      <div className="shell py-20 lg:py-28">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="mb-4 flex items-center gap-2.5">
                <span className="h-2 w-2 animate-flicker accent-bg" />
                <span className="label">Most played</span>
              </span>
              <h2 className="display text-4xl leading-none sm:text-5xl">
                The tracks
                <br />
                that travelled
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-chrome-400">
              One per artist, ranked by plays on SoundCloud.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* STAGE — sticky on a phone so the artwork stays in view while the
              index below it is scanned. */}
          <Reveal className="mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
            {playing === current.id ? (
              <div className="border border-white/10 bg-ink p-4">
                <Player url={current.url} title={current.title} accent={current.accent} immediate />
              </div>
            ) : (
              <div className="relative aspect-square w-full overflow-hidden border border-white/10 bg-ink-700">
                {/* A curtain, not a crossfade: the incoming panel slides over
                    the outgoing one while its artwork lags behind, which reads
                    as the picture being uncovered rather than pushed.
                    `transform` rather than `clip-path` — Chrome will not
                    interpolate out of a degenerate `inset()` rectangle, so the
                    clip-path version simply never animated. */}
                {tracks.map((t, i) => {
                  const parked = descending ? 1 : -1;
                  return (
                    <div
                      key={t.id}
                      aria-hidden="true"
                      className="absolute inset-0 overflow-hidden motion-safe:transition-transform motion-safe:duration-[700ms] motion-safe:ease-[cubic-bezier(.22,1,.36,1)]"
                      style={{
                        transform: i === active ? 'translateY(0)' : `translateY(${parked * 100}%)`,
                        zIndex: i === active ? 2 : i === previous ? 1 : 0,
                      }}
                    >
                      <img
                        src={t.artwork}
                        srcSet={t.artworkSrcset}
                        // The stage is a little under half the width on a wide
                        // screen and nearly the full width on a phone.
                        sizes={t.artworkSrcset ? '(min-width: 1024px) 40vw, 90vw' : undefined}
                        alt=""
                        width={500}
                        height={500}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-[700ms] motion-safe:ease-[cubic-bezier(.22,1,.36,1)]"
                        style={{
                          transform: i === active ? 'translateY(0)' : `translateY(${parked * -28}%)`,
                        }}
                      />
                    </div>
                  );
                })}

                <span
                  key={`bar-${current.id}`}
                  className="absolute inset-x-0 top-0 z-[3] h-[3px] origin-left motion-safe:animate-sweep"
                  style={{ background: current.accent }}
                  aria-hidden="true"
                />

                <span className="absolute bottom-4 right-4 z-[3] flex items-center">
                  <PlayButton
                    accent={current.accent}
                    label={current.title}
                    onClick={() => setPlaying(current.id)}
                  />
                </span>
              </div>
            )}

            <p className="mt-5 min-h-[3.25rem]" aria-live="polite">
              <span className="label block" style={{ color: current.accent }}>
                {current.artistName}
              </span>
              <a
                href={current.url}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline mt-1.5 block text-lg leading-snug"
              >
                {current.title}
              </a>
              {current.releaseTitle && current.releaseSlug && (
                <Link
                  to={`/releases/${current.releaseSlug}/`}
                  className="link-underline mt-1.5 block font-mono text-[12px] text-chrome-400"
                >
                  from {current.releaseTitle}
                </Link>
              )}
            </p>
          </Reveal>

          {/* INDEX */}
          <ol className="lg:col-span-7">
            {tracks.map((t, i) => (
              <Reveal as="li" key={t.id} delay={Math.min(i, 6) * 45} className="min-w-0">
                {/* A real link, so the row is a destination and not just a
                    switch — but on a touch screen there is no hover to preview
                    with, so the first tap only brings the record to the stage
                    and the second one follows the link. On a pointer device
                    hover has already selected it, so a click leaves at once. */}
                <a
                  href={t.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={(e) => {
                    if (i !== active) {
                      e.preventDefault();
                      select(i);
                    }
                  }}
                  onMouseEnter={() => select(i)}
                  onFocus={() => select(i)}
                  aria-current={i === active ? 'true' : undefined}
                  className="group relative flex w-full items-center gap-4 border-b border-white/10 py-4 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <span
                    className="absolute left-0 top-0 h-full w-[2px] origin-top transition-transform duration-500"
                    style={{
                      background: t.accent,
                      transform: i === active ? 'scaleY(1)' : 'scaleY(0)',
                    }}
                    aria-hidden="true"
                  />
                  <span className="label w-7 shrink-0 pl-3">{String(i + 1).padStart(2, '0')}</span>

                  <span className="min-w-0 flex-1">
                    <span
                      className="label block transition-colors"
                      style={{ color: i === active ? t.accent : undefined }}
                    >
                      {t.artistName}
                    </span>
                    <span className="mt-1 block truncate text-[15px] sm:text-base">{t.title}</span>
                    {t.releaseTitle && (
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-chrome-400">
                        {t.releaseTitle}
                      </span>
                    )}
                  </span>

                  <span className="hidden shrink-0 font-mono text-[11px] text-chrome-300 sm:block">
                    {t.plays ? `${t.plays.toLocaleString('en')} plays` : t.date && fmtDate(t.date)}
                  </span>
                  <span
                    className="shrink-0 text-chrome-400 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </a>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
