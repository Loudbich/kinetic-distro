import { useState } from 'react';
import Cover from './Cover';

/**
 * YOUTUBE PLAYBACK — loaded on demand, never before.
 * -----------------------------------------------------------------------------
 * Same standard as the SoundCloud player beside it: the embed is a third-party
 * iframe, so nothing reaches YouTube until a visitor presses play.
 *
 * The facade is the record's own sleeve rather than YouTube's thumbnail. A
 * thumbnail would be an image request to ytimg on page load, which is the exact
 * thing this is avoiding, and the sleeve is the better picture anyway. Playback
 * goes through youtube-nocookie.com, and `autoplay` means pressing play once
 * plays once.
 *
 * Without JavaScript the surrounding markup keeps its ordinary link out to
 * YouTube; this only ever adds a way to stay.
 * -----------------------------------------------------------------------------
 */

type Props = {
  /** A watch URL, a youtu.be link or a bare id — whatever the label pasted. */
  url: string;
  /** Named in the button and the iframe title, for screen readers. */
  title: string;
  accent: string;
  /** The record's sleeve, used as the facade. */
  poster?: string;
  posterSrcset?: string;
  /** Seeds the generative sleeve when the record has no artwork. */
  seed: string;
  className?: string;
};

/** The id, from any of the shapes a YouTube link comes in. */
const videoId = (url: string): string | undefined => {
  const byParam = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (byParam) return byParam[1];
  const byPath = url.match(/(?:youtu\.be\/|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  if (byPath) return byPath[1];
  return /^[A-Za-z0-9_-]{11}$/.test(url) ? url : undefined;
};

export default function VideoPlayer({
  url,
  title,
  accent,
  poster,
  posterSrcset,
  seed,
  className = '',
}: Props) {
  const [playing, setPlaying] = useState(false);
  const id = videoId(url);

  // A link the component cannot read is not worth a broken player; the page's
  // own YouTube link still stands.
  if (!id) return null;

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Play ${title} on this page`}
        className={`group/video relative block w-full overflow-hidden border border-white/10 ${className}`}
      >
        <Cover
          seed={seed}
          accent={accent}
          image={poster}
          srcset={posterSrcset}
          label=""
          className="aspect-video w-full"
        />
        <span
          className="pointer-events-none absolute inset-0 bg-ink/45 transition-colors duration-300 group-hover/video:bg-ink/30"
          aria-hidden="true"
        />
        <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 group-hover/video:scale-110"
            style={{ background: accent }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="ml-[3px] h-6 w-6 fill-ink">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="label text-center">Watch the video · loads YouTube</span>
        </span>
      </button>
    );
  }

  return (
    <iframe
      title={`${title} — YouTube player`}
      src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      loading="lazy"
      className={`aspect-video w-full border border-white/10 ${className}`}
    />
  );
}
