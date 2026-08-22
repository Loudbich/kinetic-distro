import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article';
};

/**
 * Scroll-reveal that degrades to "always visible".
 *
 * The hidden state lives in CSS behind an `html.js` class added by an inline
 * script in index.html. Without JavaScript — a crawler, an AI agent, a reader
 * mode — the content renders fully visible, so nothing that matters for
 * indexing is ever hidden behind opacity: 0. It also keeps the server-rendered
 * markup byte-identical to the first client render, so hydration is clean.
 */
export default function Reveal({ children, delay = 0, className = '', as = 'div' }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in');
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as React.ElementType;

  return (
    <Tag ref={ref as never} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}
