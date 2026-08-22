import { useState, type FormEvent } from 'react';
import { site } from '../content/site';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { demosSeo } from '../lib/seo';

const dos = [
  'One private streaming link — SoundCloud, Bandcamp, Dropbox or WeTransfer',
  'Three tracks maximum, in the order you want them heard',
  'Two or three sentences on what the project is and where it comes from',
  'Any existing visual world: artwork, references, moodboard, video',
  'Links to what you have already released, if anything',
];

const donts = [
  'Attachments over 25 MB — they bounce',
  'Mass BCC mailouts addressed to twelve labels at once',
  'Unmastered rough mixes with a promise that "the final will sound better"',
  'A full 14-track album on first contact',
  'Follow-ups more than once — we answer everything within two weeks',
];

export default function Demos() {
  const [form, setForm] = useState({
    project: '',
    name: '',
    email: '',
    link: '',
    genre: '',
    about: '',
  });
  const [sent, setSent] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  /**
   * No backend: this composes a pre-filled email in the visitor's own mail client.
   * To use a service instead (Formspree / Netlify Forms / your own endpoint),
   * replace the body of this handler with a fetch() — see README.
   */
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = `DEMO — ${form.project || 'Untitled project'}`;
    const body = [
      `Project: ${form.project}`,
      `Contact: ${form.name}`,
      `Email: ${form.email}`,
      `Genre / world: ${form.genre}`,
      `Listening link: ${form.link}`,
      '',
      'About the project:',
      form.about,
      '',
      '— Sent from www.kinetic-distro.com',
    ].join('\n');
    window.location.href = `mailto:${site.demoEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const field =
    'w-full border border-white/15 bg-ink-800 px-4 py-3.5 font-mono text-sm text-paper placeholder:text-chrome-300 transition-colors focus:border-[color:var(--accent)] focus:outline-none';

  return (
    <>
      <Seo route={demosSeo()} />

      <PageHeader
        eyebrow="Open call"
        title={
          <>
            Send us
            <br />
            the world<span className="accent-text">.</span>
          </>
        }
        intro="We read every submission and answer within two weeks — including the no. Here is how to make yours land."
        meta={[
          { k: 'Response time', v: '≤ 2 weeks' },
          { k: 'Signings per year', v: '3 – 5' },
          { k: 'Direct', v: site.demoEmail },
        ]}
      />

      <section className="border-b border-white/10 bg-ink-800">
        <div className="shell grid gap-12 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <Reveal>
            <p className="label mb-8 accent-text">Send this</p>
            <ul className="space-y-4">
              {dos.map((d) => (
                <li key={d} className="flex items-start gap-4 border-b border-white/10 pb-4 text-chrome">
                  <span className="accent-text mt-0.5 font-mono text-sm">+</span>
                  <span className="leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={100}>
            <p className="label mb-8">Skip this</p>
            <ul className="space-y-4">
              {donts.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-4 border-b border-white/10 pb-4 text-chrome-400"
                >
                  <span className="mt-0.5 font-mono text-sm text-chrome-300">−</span>
                  <span className="leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* FORM */}
      <section className="border-b border-white/10">
        <div className="shell grid gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
          <Reveal className="lg:col-span-4">
            <p className="label mb-6">Submission</p>
            <h2 className="display text-balance text-4xl leading-none sm:text-5xl">
              Six fields,
              <br />
              no forms to sign
            </h2>
            <p className="mt-6 leading-relaxed text-chrome-400">
              This opens a pre-filled email in your own mail client — nothing is stored on this site.
              Prefer to write it yourself? Use{' '}
              <a href={`mailto:${site.demoEmail}`} className="link-underline text-paper">
                {site.demoEmail}
              </a>
              .
            </p>
          </Reveal>

          <div className="lg:col-span-8">
            <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="label mb-3 block">Project name *</span>
                <input required value={form.project} onChange={update('project')} className={field} placeholder="e.g. Nosfera Disco Club" />
              </label>
              <label className="block">
                <span className="label mb-3 block">Your name *</span>
                <input required value={form.name} onChange={update('name')} className={field} placeholder="First and last" />
              </label>
              <label className="block">
                <span className="label mb-3 block">Email *</span>
                <input required type="email" value={form.email} onChange={update('email')} className={field} placeholder="you@domain.com" />
              </label>
              <label className="block">
                <span className="label mb-3 block">Genre / world</span>
                <input value={form.genre} onChange={update('genre')} className={field} placeholder="Ritual electronics, post-punk…" />
              </label>
              <label className="block sm:col-span-2">
                <span className="label mb-3 block">Listening link *</span>
                <input required type="url" value={form.link} onChange={update('link')} className={field} placeholder="https://…" />
              </label>
              <label className="block sm:col-span-2">
                <span className="label mb-3 block">What is this project? *</span>
                <textarea required rows={5} value={form.about} onChange={update('about')} className={`${field} resize-y`} placeholder="Two or three sentences. What is the world behind the record?" />
              </label>

              <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
                <button type="submit" className="btn-signal">
                  Open pre-filled email
                </button>
                {sent && (
                  <p className="font-mono text-[13px] text-chrome">
                    Your mail client should be open. If not, write to {site.demoEmail}.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="shell py-20 text-center lg:py-24">
        <Reveal>
          <p className="label mb-6">A note on the no</p>
          <p className="mx-auto max-w-2xl text-balance text-xl leading-snug text-chrome lg:text-2xl">
            A rejection from us means the record does not fit this catalogue right now. It does not
            mean the record is bad — keep going.
          </p>
        </Reveal>
      </section>
    </>
  );
}
