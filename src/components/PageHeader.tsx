import type { ReactNode } from 'react';
import Reveal from './Reveal';

type Props = {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  meta?: { k: string; v: string }[];
};

export default function PageHeader({ eyebrow, title, intro, meta }: Props) {
  return (
    <section className="relative border-b border-white/10 pt-[68px]">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" aria-hidden="true" />
      <div className="shell relative py-20 lg:py-28">
        <Reveal>
          <p className="label mb-8">{eyebrow}</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display text-balance text-[13vw] leading-[0.84] sm:text-[9vw] lg:text-[6.5rem] xl:text-[8rem]">
            {title}
          </h1>
        </Reveal>
        {intro && (
          <Reveal delay={160}>
            <div className="mt-10 max-w-2xl text-lg leading-relaxed text-chrome lg:text-xl">{intro}</div>
          </Reveal>
        )}
        {meta && (
          <Reveal delay={220}>
            <dl className="mt-12 flex flex-wrap gap-x-14 gap-y-6 border-t border-white/10 pt-8">
              {meta.map((m) => (
                <div key={m.k}>
                  <dt className="label mb-2">{m.k}</dt>
                  <dd className="font-mono text-sm text-paper">{m.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </section>
  );
}
