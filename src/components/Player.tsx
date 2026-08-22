import { useState } from 'react';

/**
 * SOUNDCLOUD PLAYBACK — loaded on demand, never before.
 * -----------------------------------------------------------------------------
 * The widget is a third-party iframe: embedding it on page load would hand
 * SoundCloud every visitor's IP address and let it set cookies before anyone
 * has asked to hear anything. This site self-hosts its fonts for exactly that
 * reason, so the same standard applies here — nothing contacts SoundCloud until
 * a visitor presses play, which is also why no page pays for an iframe nobody
 * used.
 *
 * The button is a real button, and the iframe replaces it in place with
 * `auto_play` set, so pressing play once plays once. Everything still works
 * without JavaScript: the surrounding markup keeps its ordinary link out to
 * SoundCloud, and this only ever adds a way to stay.
 * -----------------------------------------------------------------------------
 */

type Props = {
  /** Public SoundCloud permalink for a track or a set. */
  url: string;
  /** Named in the button and the iframe title, for screen readers. */
  title: string;
  accent: string;
  /** A set shows its tracklist and needs the room; a track does not. */
  variant?: 'track' | 'set';
  /**
   * Skip the facade and load straight away. For callers that already asked —
   * the track feeds put their own play button on each row, and making the
   * visitor press a second button inside the first one is not a consent gate,
   * just an obstacle.
   */
  immediate?: boolean;
  className?: string;
};

const widgetSrc = (url: string, accent: string) => {
  const params = new URLSearchParams({
    url,
    color: accent.replace('#', ''),
    auto_play: 'true',
    hide_related: 'true',
    show_comments: 'false',
    show_reposts: 'false',
    show_teaser: 'false',
    show_user: 'true',
    visual: 'false',
  });
  return `https://w.soundcloud.com/player/?${params}`;
};

export default function Player({
  url,
  title,
  accent,
  variant = 'track',
  immediate = false,
  className = '',
}: Props) {
  const [playing, setPlaying] = useState(immediate);
  const height = variant === 'set' ? 420 : 166;

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className={`group/play flex w-full items-center gap-4 border border-white/10 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] ${className}`}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover/play:scale-110"
          style={{ background: accent }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="ml-[2px] h-4 w-4 fill-ink">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="label block">Play on this page</span>
          <span className="mt-1 block truncate text-sm text-chrome-400">
            {title} · loads the SoundCloud player
          </span>
        </span>
      </button>
    );
  }

  return (
    <iframe
      title={`${title} — SoundCloud player`}
      src={widgetSrc(url, accent)}
      width="100%"
      height={height}
      frameBorder="0"
      allow="autoplay"
      loading="lazy"
      className={`block border border-white/10 ${className}`}
    />
  );
}
