import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { notFoundSeo } from '../lib/seo';

export default function NotFound() {
  return (
    <>
      <Seo route={notFoundSeo()} />
      <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-[68px] noise">
        <div className="pointer-events-none absolute inset-0 grid-lines" aria-hidden="true" />
        <div className="shell relative py-24 text-center">
          <Reveal>
            <p className="label mb-10">Error 404</p>
            <h1 className="display text-[22vw] leading-[0.8] text-white/10 sm:text-[16vw]">404</h1>
            <p className="display mt-8 text-3xl leading-none sm:text-5xl">
              Signal lost<span className="accent-text">.</span>
            </p>
            <p className="mx-auto mt-6 max-w-md text-chrome">
              This transmission is not part of the catalogue.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link to="/" className="btn-signal">
                Back to base
              </Link>
              <Link to="/releases/" className="btn-ghost">
                Browse releases
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
