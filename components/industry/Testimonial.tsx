'use client';

import { useTestimonial } from '@/hooks/useTestimonial';

function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading testimonial" className="mx-auto max-w-3xl space-y-4">
      <div className="mx-auto h-10 w-16 animate-pulse rounded bg-gray-200" />
      <div className="space-y-3">
        <div className="mx-auto h-5 w-full animate-pulse rounded bg-gray-200" />
        <div className="mx-auto h-5 w-11/12 animate-pulse rounded bg-gray-200" />
        <div className="mx-auto h-5 w-2/3 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mx-auto h-4 w-40 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
      <p className="text-sm text-red-600">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Testimonial
 *
 * Centered, high-impact industry testimonial with oversized quotation marks.
 *
 * Architecture: Component → Hook (useTestimonial) → Service (testimonialService)
 * Data source: backend API via testimonialService.getFeaturedTestimonial()
 */
export function Testimonial() {
  const { testimonial, isLoading, error, refetch } = useTestimonial();

  return (
    <section aria-label="Customer testimonial" className="px-6 py-20 sm:py-28">
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : testimonial ? (
        <figure className="mx-auto max-w-3xl text-center">
          <span
            aria-hidden="true"
            className="block font-serif text-7xl leading-none text-primary/20 sm:text-8xl"
          >
            &ldquo;
          </span>
          <blockquote className="-mt-4 font-serif text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">
            {testimonial.quote}
          </blockquote>
          <figcaption className="mt-8 font-sans text-base">
            <span className="font-semibold text-gray-900">{testimonial.authorName}</span>
            <span className="text-gray-500">
              {' '}
              &middot; {testimonial.authorRole}, {testimonial.authorCompany}
            </span>
          </figcaption>
        </figure>
      ) : null}
    </section>
  );
}

export default Testimonial;
