'use client';

import { ArrowLeftRight, SearchX, Send } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  escrowStatusStyle,
  formatCorridor,
  formatEscrowStatus,
  formatFiatAmount,
  formatSignedAssetAmount,
  formatTransactionDate,
} from '@/lib/transactionFormatters';
import type { CrossBorderTransaction } from '@/types/transactionHistory';

interface TransactionHistoryListProps {
  transactions: CrossBorderTransaction[];
  isLoading?: boolean;
  /** Message to surface when the history could not be loaded. */
  error?: string | null;
  /**
   * Whether a search/filter is narrowing the list. Distinguishes "you have no
   * transactions yet" from "nothing matched", which need different copy and
   * different calls to action.
   */
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onCreateTransfer?: () => void;
  onRetry?: () => void;
}

/**
 * Chronological list view of a user's cross-border transactions.
 *
 * Renders four mutually exclusive states: loading, error, empty, and populated.
 * The empty state is deliberately split in two, because a first-time user needs
 * an invitation to send a transfer while a user who has over-filtered needs a
 * way back to the full list.
 */
export function TransactionHistoryList({
  transactions,
  isLoading = false,
  error = null,
  hasActiveFilters = false,
  onClearFilters,
  onCreateTransfer,
  onRetry,
}: TransactionHistoryListProps) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading transaction history"
        className="space-y-3"
      >
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            data-testid="transaction-skeleton"
            className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
      >
        <p>{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium transition hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  if (transactions.length === 0) {
    if (hasActiveFilters) {
      return (
        <EmptyState
          icon={SearchX}
          title="No transactions match your filters"
          description="Try widening your date range or clearing the filters to see your full history."
          action={
            onClearFilters
              ? { label: 'Clear filters', onClick: onClearFilters }
              : undefined
          }
        />
      );
    }

    return (
      <EmptyState
        icon={ArrowLeftRight}
        title="No cross-border transactions yet"
        description="Once you send or receive your first cross-border transfer, it will appear here with its escrow status."
        action={
          onCreateTransfer
            ? { label: 'Send your first transfer', onClick: onCreateTransfer }
            : undefined
        }
      />
    );
  }

  return (
    <ul aria-label="Cross-border transactions" className="space-y-3">
      {transactions.map((transaction) => (
        <li
          key={transaction.id}
          data-testid="transaction-row"
          className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Send
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 ${
                    transaction.direction === 'SENT'
                      ? 'text-red-500'
                      : 'rotate-180 text-green-600'
                  }`}
                />
                <span className="truncate">{transaction.counterparty}</span>
              </p>
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                {transaction.reference} ·{' '}
                {formatCorridor(
                  transaction.originCountry,
                  transaction.destinationCountry,
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {formatTransactionDate(transaction.createdAt)}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {formatSignedAssetAmount(
                  transaction.amount,
                  transaction.assetCode,
                  transaction.direction,
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {formatFiatAmount(
                  transaction.fiatAmount,
                  transaction.fiatCurrency,
                )}
              </p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${escrowStatusStyle(
                  transaction.escrowStatus,
                )}`}
              >
                {formatEscrowStatus(transaction.escrowStatus)}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
