import Link from 'next/link';
import type { IndustryHeroContent } from '@/types/industry';

interface IndustryHeroHeaderProps {
  hero: IndustryHeroContent;
}

/**
 * IndustryHeroHeader — presentational page header for Industry Solutions
 * ("Modernizing the Global Supply Chain"). Receives content only; it never
 * fetches. Stats render as a semantic definition list for screen readers.
 */
export function IndustryHeroHeader({ hero }: IndustryHeroHeaderProps) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300 sm:text-sm">
        {hero.eyebrow}
      </p>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
        {hero.title}
      </h1>

      <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
        {hero.description}
      </p>

      {(hero.primaryCta || hero.secondaryCta) && (
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {hero.primaryCta && (
            <Link
              href={hero.primaryCta.href}
              className="inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:w-auto"
            >
              {hero.primaryCta.label}
            </Link>
          )}
          {hero.secondaryCta && (
            <Link
              href={hero.secondaryCta.href}
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:w-auto"
            >
              {hero.secondaryCta.label}
            </Link>
          )}
        </div>
      )}

      {hero.stats.length > 0 && (
        <dl className="mt-12 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {hero.stats.map((stat) => (
            <div
              key={stat.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4"
            >
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {stat.label}
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-white">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
}
