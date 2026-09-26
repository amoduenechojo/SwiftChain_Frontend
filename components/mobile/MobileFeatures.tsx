'use client';

import { useMobileFeatures } from '@/hooks/useMobileFeatures';

/**
 * MobileFeatures — vertically stacked feature cards for mobile (Spatial
 * Anchoring, Smart Contracts, Immutable Audit). Card text uses
 * text-gray-100/text-gray-300 against the dark card background to keep
 * contrast ratios at WCAG AA, and padding is kept tight so cards read well
 * on narrow screens without overflowing.
 */
export function MobileFeatures() {
  const { features, isLoading, error } = useMobileFeatures();

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto w-full max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4" aria-label="Platform features">
      {isLoading &&
        Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl border border-white/10 bg-white/5"
          />
        ))}

      {!isLoading &&
        features.map((feature) => (
          <div
            key={feature.id}
            className="rounded-xl border border-white/10 bg-[#0b0f19] p-5"
          >
            <div className="text-3xl" aria-hidden="true">
              {feature.icon}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">
              {feature.description}
            </p>
          </div>
        ))}
    </div>
  );
}

export default MobileFeatures;
