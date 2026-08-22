import brand from '../content/covers.generated.json';

const assets = brand.brand as Record<string, string>;

/**
 * Both brand files are supplied matted on black. The site's ground is #08090A,
 * so dropping them in as-is leaves a visible black rectangle around the mark.
 * `screen` blending solves it exactly: black contributes nothing, so the matte
 * dissolves into whatever is behind it, while the silver artwork is untouched.
 *
 * This holds because the site is dark by design — it would need transparent
 * source files to survive a light background.
 */
const dissolveMatte = { mixBlendMode: 'screen' as const };

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
      width={200}
      height={200}
      className={className}
      style={dissolveMatte}
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
      width={1024}
      height={559}
      className={className}
      style={dissolveMatte}
    />
  );
}
