'use client';

import { useIndustryHero } from '@/hooks/useIndustryHero';
import { IndustryHeroHeader } from './IndustryHeroHeader';
import { IndustryHeroSkeleton } from './IndustryHeroSkeleton';
import { IndustrySplitSection } from './IndustrySplitSection';

/**
 * IndustryHero — top-level Industry Solutions component.
 *
 * Consumes the useIndustryHero hook (Component -> Hook -> Service) and owns the
 * loading, error and empty states; all rendering of the header and the split
 * feature blocks is delegated to presentational children.
 */
export function IndustryHero() {
  const { hero, features, isLoading, error, refetch } = useIndustryHero();

  if (isLoading) {
    return <IndustryHeroSkeleton />;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-xl rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center"
      >
        <p className="text-base font-semibold text-rose-200">
          We couldn&apos;t load the industry solutions content.
        </p>
        <p className="mt-2 text-sm text-rose-300/80">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-rose-500/20 px-5 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!hero && features.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-300">
        No industry solutions content is published yet.
      </div>
    );
  }

  return (
    <div className="space-y-20 lg:space-y-28">
      {hero && <IndustryHeroHeader hero={hero} />}

      {features.map((feature, index) => (
        <IndustrySplitSection
          key={feature.id}
          feature={feature}
          priority={index === 0}
        />
      ))}
    </div>
  );
}

export default IndustryHero;
