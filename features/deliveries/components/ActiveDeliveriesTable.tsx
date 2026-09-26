'use client';

import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useTablePagination, DEFAULT_PAGE_SIZE } from '@/hooks/useTablePagination';
import type { Delivery } from '@/types/delivery';

interface ActiveDeliveriesTableProps {
  deliveries: Delivery[];
  isLoading?: boolean;
  error?: string | null;
  /** Rows per page. Defaults to 10 — pagination kicks in beyond that. */
  pageSize?: number;
  onRetry?: () => void;
}

const STATUS_COLORS: Record<Delivery['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  ACCEPTED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  IN_TRANSIT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

function formatDate(dateString: string): string {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * ActiveDeliveriesTable — the customer-facing table view of active shipments.
 *
 * Rows beyond `pageSize` (10 by default) are paginated client-side so the table
 * stays scannable regardless of how many shipments are in flight.
 */
export function ActiveDeliveriesTable({
  deliveries,
  isLoading = false,
  error = null,
  pageSize = DEFAULT_PAGE_SIZE,
  onRetry,
}: ActiveDeliveriesTableProps) {
  const {
    page,
    totalPages,
    totalItems,
    pageItems,
    rangeStart,
    rangeEnd,
    isPaginated,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    goToPage,
  } = useTablePagination(deliveries, { pageSize });

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-6 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        Loading deliveries...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20"
      >
        <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/30"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <Package className="h-10 w-10 text-gray-300 dark:text-gray-600" aria-hidden="true" />
        <p className="text-base font-medium text-gray-500 dark:text-gray-400">
          No active deliveries
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Shipments appear here as soon as they are created.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm" aria-label="Active deliveries">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-3">
                Tracking Number
              </th>
              <th scope="col" className="px-4 py-3">
                Route
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Amount
              </th>
              <th scope="col" className="px-4 py-3">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pageItems.map((delivery) => (
              <tr key={delivery.id} className="bg-white dark:bg-gray-900">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {delivery.trackingNumber}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {delivery.origin} to {delivery.destination}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      STATUS_COLORS[delivery.status] ?? ''
                    }`}
                  >
                    {delivery.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {delivery.amount} {delivery.currency ?? 'XLM'}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {formatDate(delivery.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400" data-testid="pagination-summary">
          Showing {rangeStart}-{rangeEnd} of {totalItems} deliveries
        </p>

        {isPaginated && (
          <nav className="flex items-center gap-1" aria-label="Deliveries pagination">
            <button
              type="button"
              onClick={previousPage}
              disabled={!canPreviousPage}
              aria-label="Previous page"
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => goToPage(pageNumber)}
                aria-label={`Page ${pageNumber}`}
                aria-current={pageNumber === page ? 'page' : undefined}
                className={`min-w-9 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  pageNumber === page
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={nextPage}
              disabled={!canNextPage}
              aria-label="Next page"
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
