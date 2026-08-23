import { useState } from 'react';
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

/** Cross-roster feed used on the home page. */
export function LabelTrackFeed({ tracks }: { tracks: FeedTrack[] }) {
  const [playing, setPlaying] = useState<string | null>(null);

  if (!tracks.length) return null;

  return (
    <section className="border-b border-white/10">
      <div className="shell py-20 lg:py-28">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="mb-4 flex items-center gap-2.5">
                <span className="h-2 w-2 animate-flicker accent-bg" />
                <span className="label">Live feed</span>
              </span>
              <h2 className="display text-4xl leading-none sm:text-5xl">
                Fresh from
                <br />
                the roster
              </h2>
            </div>
          </div>
        </Reveal>

        <ul className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {tracks.map((t, i) => (
            <Reveal as="li" key={t.id} delay={(i % 4) * 60} className="bg-ink">
              {playing === t.id ? (
                <div className="flex h-full items-center p-4">
                  <Player url={t.url} title={t.title} accent={t.accent} immediate className="w-full" />
                </div>
              ) : (
                <div className="group relative flex h-full flex-col p-6 transition-colors hover:bg-ink-700">
                  <span
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                    style={{ background: t.accent }}
                    aria-hidden="true"
                  />
                  <span className="relative mb-6 block aspect-square w-full overflow-hidden border border-white/10 bg-ink-700">
                    {t.artwork && (
                      <img
                        src={t.artwork}
                        alt=""
                        width={500}
                        height={500}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
                        aria-hidden="true"
                      />
                    )}
                    {/* The control sits on the artwork, where a play button is
                        expected, rather than floating beside the artist name. */}
                    <span className="absolute bottom-3 right-3 flex items-center">
                      <PlayButton accent={t.accent} label={t.title} onClick={() => setPlaying(t.id)} />
                    </span>
                  </span>
                  <span className="label mb-3 block" style={{ color: t.accent }}>
                    {t.artistName}
                  </span>
                  <span className="mt-auto block">
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block text-lg leading-snug transition-colors hover:text-[color:var(--hl)]"
                      style={{ ['--hl' as string]: t.accent }}
                    >
                      {t.title}
                    </a>
                    <span className="mt-2 flex items-center gap-3 font-mono text-[11px] text-chrome-300">
                      {t.date && <span>{fmtDate(t.date)}</span>}
                      {t.durationSec && <span>{fmtDuration(t.durationSec)}</span>}
                    </span>
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
