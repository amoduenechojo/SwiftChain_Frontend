'use client';

import { Check, Minus } from 'lucide-react';
import { usePricingComparison } from '@/hooks/usePricingComparison';
import type { PricingFeatureValue } from '@/types/pricing';

function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading pricing comparison" className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 border-b border-gray-100 px-4 py-4">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 p-12 text-center">
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

function FeatureValueCell({ value }: { value: PricingFeatureValue }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="mx-auto h-5 w-5 text-success" aria-label="Included" />
    ) : (
      <Minus className="mx-auto h-5 w-5 text-gray-300" aria-label="Not included" />
    );
  }
  return <span className="text-sm text-gray-700">{value}</span>;
}

/**
 * ComparisonTable
 *
 * Responsive, horizontally-scrollable four-column pricing feature comparison.
 *
 * Architecture: Component → Hook (usePricingComparison) → Service (pricingService)
 * Data source: backend API via pricingService.getComparison()
 */
export function ComparisonTable() {
  const { comparison, isLoading, error, refetch } = usePricingComparison();

  return (
    <section aria-label="Pricing feature comparison" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : comparison ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th scope="col" className="w-2/5 px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Feature
                  </th>
                  {comparison.plans.map((plan) => (
                    <th
                      key={plan.id}
                      scope="col"
                      className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparison.rows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" className="px-4 py-4 text-sm font-medium text-gray-900">
                      {row.label}
                    </th>
                    {comparison.plans.map((plan) => (
                      <td key={plan.id} className="px-4 py-4 text-center">
                        <FeatureValueCell value={row.values[plan.id] ?? false} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default ComparisonTable;
