'use client';

import { useValueProps } from '@/hooks/useValueProps';

const GLOW_COLORS = [
  'bg-blue-500/30',
  'bg-emerald-500/30',
  'bg-purple-500/30',
];

/**
 * ValueProps — 3-column value proposition grid (Trustless Escrow, Instant
 * Settlement, Zero-Fee Layer) with glassmorphic borders and glowing
 * gradients that stay clipped within each card's bounds.
 */
export function ValueProps() {
  const { items, isLoading, error } = useValueProps();

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-2xl rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-400"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-3" aria-label="Value propositions">
      {isLoading &&
        Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}

      {!isLoading &&
        items.map((item, index) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20"
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full ${GLOW_COLORS[index % GLOW_COLORS.length]} blur-3xl transition-opacity duration-300 group-hover:opacity-80`}
            />

            <div className="relative">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="mb-3 text-xl font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-gray-300">{item.description}</p>
            </div>
          </div>
        ))}
    </div>
  );
}
