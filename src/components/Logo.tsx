type Props = { className?: string; withText?: boolean };

/** The Kinetic mark: a signal glyph — three accelerating bars breaking a frame. */
export function Mark({ className = 'h-7 w-7' }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <rect x="0.75" y="0.75" width="30.5" height="30.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="21" width="20" height="3" fill="currentColor" />
      <rect x="6" y="14.5" width="13" height="3" fill="currentColor" opacity="0.7" />
      <rect x="6" y="8" width="6" height="3" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function Logo({ className = '', withText = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Mark className="h-6 w-6 shrink-0" />
      {withText && (
        <span className="display text-[15px] leading-none tracking-[0.02em]">
          Kinetic<span className="accent-text">.</span>Distro
        </span>
      )}
    </span>
  );
}
