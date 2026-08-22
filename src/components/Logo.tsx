import brand from '../content/covers.generated.json';

const assets = brand.brand as Record<string, string>;
const opaque = new Set(brand.brandOpaque as string[]);
const sizes = brand.brandSize as Record<string, { width: number; height: number }>;

/** Intrinsic dimensions, read from the file at build time so a re-export at a
 *  different size cannot leave the markup declaring a stale aspect ratio. */
const dims = (name: string) => sizes[name] ?? undefined;

/**
 * A logo supplied matted on black leaves a visible rectangle on the site's
 * #08090A ground. `screen` blending removes it exactly — black contributes
 * nothing, so the matte dissolves while the silver artwork is untouched — but
 * it is only applied where it is needed: the build reads the alpha channel and
 * lists the files that lack one, so a proper cut-out is painted normally and
 * re-exporting a logo with transparency needs no code change.
 *
 * The blend only works because the site is dark by design; a light background
 * would need genuine transparency.
 */
const paint = (name: string) =>
  opaque.has(name) ? ({ mixBlendMode: 'screen' } as const) : undefined;

type Props = { className?: string; withText?: boolean };

/**
 * The Kinetic mark on its own — the square lockup, for tight spots where the
 * wordmark would be unreadable.
 */
export function Mark({ className = 'h-7 w-7' }: Props) {
  return (
    <img
      src={assets['logo-seul']}
      alt=""
      width={dims('logo-seul')?.width}
      height={dims('logo-seul')?.height}
      className={className}
      style={paint('logo-seul')}
      aria-hidden="true"
    />
  );
}

/**
 * Header lockup: the mark beside the name.
 *
 * The full brand file stacks the mark above `KINETIC DISTRO / GLOBAL AUDIO
 * NETWORK`, which cannot be read in a 68px bar — at that height the strapline
 * would be about two pixels tall. So the mark is used as the image and the name
 * is set in the site's own type, which stays crisp at any size. The full lockup
 * gets its proper showing in the footer, where there is room for it.
 */
export function Logo({ className = '', withText = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Mark className="h-7 w-7 shrink-0" />
      {withText && (
        <span className="display text-[15px] leading-none tracking-[0.02em]">
          Kinetic<span className="accent-text">.</span>Distro
        </span>
      )}
    </span>
  );
}

/** The complete brand lockup, for places with vertical room to show it whole. */
export function FullLogo({ className = '' }: Props) {
  return (
    <img
      src={assets.logo}
      alt="Kinetic Distro — global audio network"
      width={dims('logo')?.width}
      height={dims('logo')?.height}
      className={className}
      style={paint('logo')}
    />
  );
}
