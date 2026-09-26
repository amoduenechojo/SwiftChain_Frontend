'use client';

import { usePricingCards } from '@/hooks/usePricingCards';

function LoadingSkeleton() {
  return (
    <section aria-label="Pricing plans" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section aria-label="Pricing plans" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-12 text-center"
        >
          <p className="text-sm text-red-600">{message}</p>
          <button
            onClick={onRetry}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  card,
}: {
  card: import('@/types/pricing').PricingCard;
}) {
  const isHighlighted = card.highlighted;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 transition-shadow duration-200 ${
        isHighlighted
          ? 'z-10 -translate-y-2 border-blue-500 bg-white shadow-xl shadow-blue-500/10'
          : 'border-gray-200 bg-white shadow-sm hover:shadow-md'
      }`}
    >
      {isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-block rounded-full bg-blue-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">{card.name}</h3>
        <p className="mt-2 text-sm text-gray-500">{card.description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-extrabold text-gray-900">
          ${card.price}
        </span>
        <span className="text-sm text-gray-500">
          /{card.period}
        </span>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {card.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <a
        href={card.href}
        className={`block rounded-xl px-6 py-3 text-center text-sm font-semibold transition ${
          isHighlighted
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
        }`}
      >
        {card.ctaLabel}
      </a>
    </div>
  );
}

/**
 * PricingCards
 *
 * Renders the 3-tier pricing card layout (Starter, Growth, Enterprise)
 * with the Growth tier highlighted as "Most Popular" and slightly elevated.
 *
 * Architecture: Component → Hook (usePricingCards) → Service (pricingService)
 * Data source: backend API via pricingService.getPricingCards()
 */
export function PricingCards() {
  const { cards, isLoading, error, refetch } = usePricingCards();

  return (
    <section aria-label="Pricing plans" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Choose the plan that fits your logistics operation.
          </p>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : cards ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {cards.cards.map((card) => (
              <PricingCard key={card.id} card={card} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default PricingCards;