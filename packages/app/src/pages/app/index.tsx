import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

const APPS = [
  {
    id: 'pi',
    href: '/app/pi',
    title: 'Pi Memory',
    subtitle: 'Digit Trainer',
    description:
      'Memorize the digits of π with guided practice. Challenge yourself to recall longer sequences and improve precision over time.',
    meta: 'π · Digits · Precision',
    symbol: 'π', // iconic memory challenge
    symbolClass: 'text-[4.5rem] font-serif font-bold leading-none',
  },
  {
    id: 'pitch',
    href: '/app/pitch',
    title: 'Pitch Perfect',
    subtitle: 'Music Trainer',
    description:
      'Train your ear by identifying musical pitches and melodies. Challenge yourself to recognize notes and improve your musical ear over time.',
    meta: 'Music · Pitch · Ear',
    symbol: '🎵', // iconic memory challenge
    symbolClass: 'text-[4.5rem] font-serif font-bold leading-none',
  },
  {
    id: 'recall',
    href: '/app/recall',
    title: 'Recall',
    subtitle: 'Number Memory',
    description:
      'Train your short-term memory by recalling sequences of numbers. Increase difficulty progressively and track how far you can remember.',
    meta: 'Digits · Sequence · Recall',
    symbol: '🧠', // memory / cognition
    symbolClass: 'text-[4.5rem] leading-none',
  },
];

const AppPage: NextPage = () => {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      data-theme="luxury"
      className="bg-base-100 relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden pt-16 pb-14">
      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Top rule */}
      <div className="via-primary fixed top-0 right-0 left-0 z-10 h-[3px] bg-gradient-to-r from-transparent to-transparent" />

      {/* Header */}
      <div className="relative z-10 mb-16 flex flex-col items-center gap-3 text-center">
        <span className="text-primary/40 text-[0.55rem] tracking-[0.5em] uppercase">
          Cognitive Toolkit
        </span>
        <h1 className="text-base-content font-serif text-4xl font-bold tracking-wide">
          Memory Games
        </h1>
        <div className="mt-1 flex items-center gap-3">
          <div className="bg-primary/30 h-px w-12" />
          <div className="bg-primary h-1 w-1 rounded-full" />
          <div className="bg-primary/30 h-px w-12" />
        </div>
        <p className="text-base-content/40 mt-1 text-[0.65rem] tracking-[0.2em] uppercase">
          Focus · Recall · Improve
        </p>
      </div>

      {/* Grid */}
      <div className="relative z-10 grid w-full max-w-3xl grid-cols-1 gap-px px-6 sm:grid-cols-2">
        {APPS.map((app, i) => {
          const isHovered = hovered === app.id;
          return (
            <button
              key={app.id}
              onClick={() => router.push(app.href)}
              onMouseEnter={() => setHovered(app.id)}
              onMouseLeave={() => setHovered(null)}
              className={[
                'group relative flex flex-col items-center justify-between gap-8',
                'w-full cursor-pointer px-8 py-12 text-center',
                'border-primary/10 border transition-all duration-500',
                'focus-visible:ring-primary outline-none focus-visible:ring-1',
                isHovered
                  ? 'bg-primary/[0.06] border-primary/30'
                  : 'bg-base-100/40 hover:bg-primary/[0.04]',
              ].join(' ')}>
              {/* Number */}
              <span className="text-primary/20 self-start text-[0.5rem] tracking-[0.4em] uppercase">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Symbol */}
              <div
                className={[
                  'text-base-content transition-all duration-500',
                  isHovered
                    ? 'text-primary scale-110 opacity-90'
                    : 'opacity-25',
                ].join(' ')}>
                <span className={app.symbolClass}>{app.symbol}</span>
              </div>

              {/* Text */}
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-base-content font-serif text-lg font-bold tracking-wider">
                  {app.title}
                </h2>
                <span className="text-primary/60 text-[0.6rem] tracking-[0.3em] uppercase">
                  {app.subtitle}
                </span>

                <div className="bg-primary/15 my-1 h-px w-8" />

                <p className="text-base-content/40 max-w-[200px] text-[0.65rem] leading-relaxed tracking-wide">
                  {app.description}
                </p>

                <span className="text-primary/30 mt-1 text-[0.55rem] tracking-[0.2em] uppercase">
                  {app.meta}
                </span>
              </div>

              {/* CTA */}
              <div
                className={[
                  'flex items-center gap-2 transition-all duration-300',
                  isHovered
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-1 opacity-0',
                ].join(' ')}>
                <span className="text-primary text-[0.6rem] tracking-[0.3em] uppercase">
                  Begin
                </span>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 8h8M8 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Glow */}
              <div
                className={[
                  'via-primary absolute right-0 bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent transition-all duration-500',
                  isHovered ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
              />
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-12 text-center">
        <p className="text-base-content/20 text-[0.5rem] tracking-[0.25em] uppercase">
          Memory · Recall · Focus · Precision · Cognitive Training
        </p>
      </div>

      {/* Bottom rule */}
      <div className="via-primary fixed right-0 bottom-0 left-0 z-10 h-[3px] bg-gradient-to-r from-transparent to-transparent" />
    </div>
  );
};

export default AppPage;
