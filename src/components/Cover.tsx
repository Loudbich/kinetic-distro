type Props = {
  seed: string;
  accent: string;
  label?: string;
  image?: string;
  /** Candidate widths, so a phone is not sent the file a wide screen needs. */
  srcset?: string;
  /**
   * Where to anchor the crop. Album art is square and centres fine, but a
   * portrait squeezed into a square slot loses the head at 50% — 'top' keeps
   * the face.
   */
  focus?: 'center' | 'top';
  className?: string;
};

/** Deterministic PRNG from a string seed — the same slug always yields the same artwork. */
function makeRng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

const S = 400;

/**
 * Generative placeholder artwork — full-bleed, deterministic, one of five compositions.
 * Swap for real covers by adding `image: '/covers/kd-00x.jpg'` in src/content/site.ts.
 */
export default function Cover({ seed, accent, label, image, srcset, focus = 'center', className = '' }: Props) {
  if (image) {
    return (
      <div className={`relative overflow-hidden bg-ink-700 ${className}`}>
        <img
          src={image}
          srcSet={srcset}
          // Roughly what the layout draws a cover at: a little under half the
          // width on a wide screen, nearly the full width on a phone.
          sizes={srcset ? '(min-width: 1024px) 45vw, 90vw' : undefined}
          alt={label ?? ''}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: focus === 'top' ? '50% 20%' : undefined }}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
        />
      </div>
    );
  }

  const r = makeRng(seed);
  // Spread modes evenly across seeds rather than relying on a single draw.
  const mode = seed.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 3), 0) % 5;
  const id = seed.replace(/[^a-z0-9]/gi, '');

  const layers: React.ReactNode[] = [];

  if (mode === 0) {
    // Horizontal signal stack — full-bleed bars of varying weight
    let y = 0;
    let i = 0;
    while (y < S) {
      const h = 6 + Math.floor(r() * 46);
      const accentBar = r() > 0.68;
      layers.push(
        <rect
          key={`b${i}`}
          x={0}
          y={y}
          width={S}
          height={h}
          fill={accentBar ? accent : i % 2 ? '#15181B' : '#1E2226'}
          opacity={accentBar ? 0.92 : 1}
        />,
      );
      y += h + 2;
      i++;
    }
    layers.push(
      <circle key="c" cx={S * (0.3 + r() * 0.45)} cy={S * 0.5} r={S * 0.26} fill="#0E1012" opacity="0.72" />,
      <circle
        key="c2"
        cx={S * 0.5}
        cy={S * 0.5}
        r={S * 0.34}
        fill="none"
        stroke="#F4F2ED"
        strokeWidth="1.5"
        opacity="0.25"
      />,
    );
  }

  if (mode === 1) {
    // Concentric transmission rings over a two-tone field
    const cx = S * (0.35 + r() * 0.3);
    const cy = S * (0.35 + r() * 0.3);
    layers.push(<rect key="bg" width={S} height={S} fill={`url(#lg${id})`} />);
    for (let i = 8; i >= 1; i--) {
      layers.push(
        <circle
          key={`r${i}`}
          cx={cx}
          cy={cy}
          r={i * 26}
          fill="none"
          stroke={i % 3 === 0 ? accent : '#F4F2ED'}
          strokeOpacity={i % 3 === 0 ? 0.95 : 0.14}
          strokeWidth={i % 3 === 0 ? 7 : 1.5}
        />,
      );
    }
    layers.push(
      <rect key="band" x={0} y={S * 0.62} width={S} height={S * 0.075} fill={accent} opacity="0.9" />,
      <rect key="band2" x={0} y={S * 0.73} width={S} height={4} fill="#F4F2ED" opacity="0.35" />,
    );
  }

  if (mode === 2) {
    // Diagonal split with halftone rules
    const k = 0.28 + r() * 0.34;
    layers.push(
      <rect key="bg" width={S} height={S} fill="#15181B" />,
      <polygon key="p1" points={`0,0 ${S},0 ${S},${S * k} 0,${S * (k + 0.3)}`} fill={accent} opacity="0.92" />,
      <polygon
        key="p2"
        points={`0,${S} ${S},${S} ${S},${S * (k + 0.42)} 0,${S * (k + 0.72)}`}
        fill={`url(#lg${id})`}
      />,
    );
    for (let i = 0; i < 26; i++) {
      layers.push(
        <rect key={`h${i}`} x={0} y={i * 15 + 4} width={S} height={2 + (i % 4)} fill="#0E1012" opacity="0.34" />,
      );
    }
    layers.push(
      <rect key="fr" x={26} y={26} width={S - 52} height={S - 52} fill="none" stroke="#F4F2ED" strokeWidth="1.5" opacity="0.4" />,
    );
  }

  if (mode === 3) {
    // Modular grid — 6×6 cells, sparse accent fills
    layers.push(<rect key="bg" width={S} height={S} fill="#0E1012" />);
    const n = 6;
    const c = S / n;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const v = r();
        const fill = v > 0.82 ? accent : v > 0.6 ? '#1E2226' : v > 0.42 ? '#15181B' : 'none';
        if (fill !== 'none') {
          layers.push(
            <rect key={`g${x}-${y}`} x={x * c} y={y * c} width={c} height={c} fill={fill} opacity={v > 0.82 ? 0.95 : 1} />,
          );
        }
        if (v > 0.9) {
          layers.push(
            <circle key={`gc${x}-${y}`} cx={x * c + c / 2} cy={y * c + c / 2} r={c * 0.28} fill="#0E1012" />,
          );
        }
      }
    }
    layers.push(
      <g key="grid" stroke="#F4F2ED" strokeOpacity="0.1" strokeWidth="1">
        {Array.from({ length: n - 1 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * c} y1={0} x2={(i + 1) * c} y2={S} />
        ))}
        {Array.from({ length: n - 1 }, (_, i) => (
          <line key={`hh${i}`} x1={0} y1={(i + 1) * c} x2={S} y2={(i + 1) * c} />
        ))}
      </g>,
    );
  }

  if (mode === 4) {
    // Monolith — rotated slab over a full-bleed gradient
    const rot = -34 + r() * 68;
    const w = 0.3 + r() * 0.34;
    const x0 = S * ((1 - w) / 2 + (r() - 0.5) * 0.16);
    const steps = 5 + Math.floor(r() * 8);
    const gap = (S * 1.3) / steps;
    layers.push(
      <rect key="bg" width={S} height={S} fill={`url(#lg${id})`} />,
      <rect key="band" x={0} y={S * (0.1 + r() * 0.7)} width={S} height={S * 0.06} fill="#0E1012" opacity="0.6" />,
      <g key="slab" transform={`rotate(${rot} ${S / 2} ${S / 2})`}>
        <rect x={x0} y={-S * 0.25} width={S * w} height={S * 1.5} fill="#0E1012" opacity="0.88" />
        <rect x={x0} y={-S * 0.25} width={S * w} height={S * 1.5} fill="none" stroke={accent} strokeWidth="3" />
        {Array.from({ length: steps }, (_, i) => (
          <rect
            key={`s${i}`}
            x={x0}
            y={-S * 0.18 + i * gap}
            width={S * w}
            height={i % 2 === 0 ? 4 + r() * 9 : 2}
            fill={i % 2 === 0 ? accent : '#F4F2ED'}
            opacity={i % 2 === 0 ? 0.9 : 0.26}
          />
        ))}
      </g>,
    );
  }

  return (
    <div className={`relative overflow-hidden bg-ink-800 ${className}`}>
      <svg viewBox={`0 0 ${S} ${S}`} className="h-full w-full" role="img" aria-label={label ?? 'Cover artwork'}>
        <defs>
          <linearGradient id={`lg${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
            <stop offset="55%" stopColor={accent} stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0E1012" stopOpacity="1" />
          </linearGradient>
          <clipPath id={`cp${id}`}>
            <rect width={S} height={S} />
          </clipPath>
        </defs>

        <rect width={S} height={S} fill="#0E1012" />
        <g clipPath={`url(#cp${id})`}>
          {layers}
          {/* scanlines */}
          <g>
            {Array.from({ length: 50 }, (_, i) => (
              <rect key={`sl${i}`} x={0} y={i * 8} width={S} height={1} fill="#000" opacity="0.2" />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
