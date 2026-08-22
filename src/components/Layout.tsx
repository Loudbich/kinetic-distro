import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { nav, site } from '../content/site';
import { FullLogo, Logo } from './Logo';
import Marquee from './Marquee';

/* -------------------------------------------------------------------------- */

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

/* -------------------------------------------------------------------------- */

function Header() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-paper focus:px-4 focus:py-2 focus:text-ink focus:font-mono focus:text-xs"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || open
            ? 'bg-ink/85 backdrop-blur-xl border-b border-white/10'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="shell flex h-[68px] items-center justify-between">
          <Link to="/" aria-label="Kinetic Distro — home" className="group">
            <Logo className="transition-opacity group-hover:opacity-70" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `label link-underline !text-[11px] transition-colors ${
                    isActive ? '!text-paper' : 'hover:!text-paper'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={site.links.bandcamp}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden btn-signal !px-5 !py-3 sm:inline-flex"
            >
              Listen
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] border border-white/15 transition-colors hover:border-white/50 lg:hidden"
            >
              <span
                className={`block h-[1.5px] w-5 bg-paper transition-transform duration-300 ${
                  open ? 'translate-y-[6.5px] rotate-45' : ''
                }`}
              />
              <span className={`block h-[1.5px] w-5 bg-paper transition-opacity ${open ? 'opacity-0' : ''}`} />
              <span
                className={`block h-[1.5px] w-5 bg-paper transition-transform duration-300 ${
                  open ? '-translate-y-[6.5px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-ink transition-all duration-500 lg:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="shell flex h-full flex-col justify-between pb-10 pt-28">
          <nav className="flex flex-col" aria-label="Mobile">
            {nav.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="group flex items-baseline gap-4 border-b border-white/10 py-5"
                style={{
                  transitionDelay: `${i * 40}ms`,
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateY(0)' : 'translateY(12px)',
                  transition: 'opacity .5s ease, transform .5s ease',
                }}
              >
                <span className="label !text-[10px]">0{i + 1}</span>
                <span className="display text-4xl group-hover:accent-text transition-colors">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a className="label hover:!text-paper" href={site.links.bandcamp} target="_blank" rel="noreferrer">
              Bandcamp
            </a>
            <a className="label hover:!text-paper" href={site.links.soundcloud} target="_blank" rel="noreferrer">
              SoundCloud
            </a>
            <a className="label hover:!text-paper" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-white/10 bg-ink-800">
      <Marquee
        items={['Kinetic Distro', 'Signal over noise', 'Artist-first distribution', 'Est. ' + site.founded, site.location]}
        className="display border-b border-white/10 py-4 text-2xl text-white/15 sm:text-3xl"
      />

      <div className="shell grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-5">
          <FullLogo className="w-52 max-w-full" />
          <p className="mt-6 max-w-sm text-balance text-lg leading-snug text-chrome">
            {site.shortDescription}
          </p>
          <p className="label mt-6">
            {site.location} · Est. {site.founded}
          </p>
        </div>

        <div className="lg:col-span-3">
          <p className="label mb-5">Navigate</p>
          <ul className="space-y-2.5">
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="link-underline text-sm text-chrome hover:text-paper">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <p className="label mb-5">Listen &amp; follow</p>
          <ul className="space-y-2.5">
            <li>
              <a
                href={site.links.bandcamp}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline text-sm text-chrome hover:text-paper"
              >
                Bandcamp ↗
              </a>
            </li>
            <li>
              <a
                href={site.links.soundcloud}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline text-sm text-chrome hover:text-paper"
              >
                SoundCloud ↗
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="link-underline text-sm text-chrome hover:text-paper">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell flex flex-col gap-3 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="label">© {year} {site.name}. All rights reserved.</p>
        <p className="label">Masters stay with the artists.</p>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
