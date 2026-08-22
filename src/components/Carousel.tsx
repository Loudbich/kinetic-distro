import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { artists } from '../content/site';
import art from './../content/covers.generated.json';
import Reveal from './Reveal';

/**
 * ARTIST CAROUSEL — the label's key visuals, on the home page.
 * -----------------------------------------------------------------------------
 * Slides come from the artwork manifest, so adding one is dropping a file in
 * assets/Caroussel named after the artist. Only artists on the roster can have
 * one, and the order follows the roster rather than the filesystem.
 *
 * Every slide is rendered in the markup and the inactive ones are hidden with
 * opacity, so the prerendered HTML carries all of them: a crawler with no
 * JavaScript still sees each artist and each link. The first is fetched
 * eagerly, the rest lazily.
 *
 * It advances on its own, but stops for anyone who is reading — pointer over
 * it, keyboard focus inside it, tab in the background — and never starts at all
 * under `prefers-reduced-motion`, where auto-advancing carousels are exactly
 * the pattern the setting exists to prevent.
 * -----------------------------------------------------------------------------
 */

type Variant = { url: string; width?: number; height?: number };
type Slide = { slug: string; name: string; tagline: string; accent: string; wide: Variant; mobile?: Variant };

const manifest = art.carousel as Record<string, { wide?: Variant; mobile?: Variant }>;

/** Roster order, not filesystem order, and only artists that actually have art. */
const slides: Slide[] = artists
  .filter((a) => manifest[a.slug]?.wide)
  .map((a) => ({
    slug: a.slug,
    name: a.name,
    tagline: a.tagline,
    accent: a.accent,
    wide: manifest[a.slug]!.wide!,
    mobile: manifest[a.slug]!.mobile,
  }));

const INTERVAL = 6500;

/**
 * The tall phone layout is only worth it once every slide has a portrait crop.
 * Squeezing a 2.39:1 key visual into a 4:5 box shows about a sixth of its
 * width, which loses whatever the picture was about; 16:9 trims it without
 * gutting it. Drop files in assets/Caroussel/mobile and this switches itself.
 */
const mobileRatio = slides.every((s) => s.mobile) ? 'aspect-[4/5]' : 'aspect-[16/9]';

export default function Carousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const region = useRef<HTMLDivElement>(null);

  const go = useCallback((next: number) => setIndex(((next % slides.length) + slides.length) % slides.length), []);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      // A background tab would otherwise queue up advances and jump on return.
      if (!document.hidden) setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused]);

  if (!slides.length) return null;

  const current = slides[index];

  return (
    <section
      className="relative border-b border-white/10 bg-ink"
      aria-roledescription="carousel"
      aria-label="Kinetic Distro artists"
    >
      <div
        ref={region}
        className="relative overflow-hidden"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!region.current?.contains(e.relatedTarget as Node)) setPaused(false);
        }}
      >
        {/* The ratio is set by the box, not the image, so switching to a
            portrait crop on small screens cannot shift the layout. */}
        <div className={`relative w-full ${mobileRatio} sm:aspect-[21/9] lg:aspect-[2.39/1]`}>
          {slides.map((slide, i) => (
            <div
              key={slide.slug}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              aria-hidden={i === index ? undefined : true}
            >
              <picture>
                {slide.mobile && <source media="(max-width: 639px)" srcSet={slide.mobile.url} />}
                <img
                  src={slide.wide.url}
                  alt={`${slide.name} — ${slide.tagline}`}
                  width={slide.wide.width}
                  height={slide.wide.height}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'low'}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </picture>
              {/* Keeps the caption legible over whatever the artwork does. */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent"
                aria-hidden="true"
              />
            </div>
          ))}

          <div className="absolute inset-x-0 bottom-0">
            <div className="shell pb-8 lg:pb-12">
              <Reveal>
                <p className="label mb-3" style={{ color: current.accent }}>
                  {current.name}
                </p>
                <p className="max-w-lg text-balance text-lg leading-snug sm:text-xl lg:text-2xl">
                  {current.tagline}
                </p>
                <Link
                  to={`/roster/${current.slug}/`}
                  className="label link-underline mt-5 inline-block hover:!text-paper"
                >
                  See {current.name} →
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="shell flex items-center justify-between gap-6 py-5">
          <ul className="flex items-center gap-2.5">
            {slides.map((slide, i) => (
              <li key={slide.slug}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={slide.name}
                  aria-current={i === index ? 'true' : undefined}
                  className="h-2.5 w-2.5 border transition-colors"
                  style={{
                    borderColor: i === index ? slide.accent : 'rgba(255,255,255,0.25)',
                    background: i === index ? slide.accent : 'transparent',
                  }}
                />
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous artist" className="btn-ghost !px-4 !py-2">
              ←
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next artist" className="btn-ghost !px-4 !py-2">
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
