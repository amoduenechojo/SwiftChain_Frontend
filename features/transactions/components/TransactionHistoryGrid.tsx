'use client';

import { Inbox } from 'lucide-react';
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

interface TransactionHistoryGridProps {
  transactions: CrossBorderTransaction[];
  onSelect?: (_transaction: CrossBorderTransaction) => void;
}

/**
 * Card grid view of a user's cross-border transactions.
 *
 * The same data as the list view, laid out as scannable cards. Every displayed
 * value goes through the shared formatters so a card and a row can never
 * disagree about how an amount or an escrow status reads.
 */
export function TransactionHistoryGrid({
  transactions,
  onSelect,
}: TransactionHistoryGridProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No cross-border transactions yet"
        description="Your transfers will appear here as cards once you have sent or received one."
      />
    );
  }

  return (
    <ul
      aria-label="Cross-border transactions"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {transactions.map((transaction) => {
        const escrowLabel = formatEscrowStatus(transaction.escrowStatus);

        return (
          <li key={transaction.id}>
            <article
              data-testid="transaction-card"
              className="flex h-full flex-col justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700"
            >
              <header className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {transaction.counterparty}
                  </h3>
                  <p
                    data-testid="card-reference"
                    className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400"
                  >
                    {transaction.reference}
                  </p>
                </div>
                <span
                  data-testid="card-escrow-status"
                  aria-label={`Escrow status: ${escrowLabel}`}
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${escrowStatusStyle(
                    transaction.escrowStatus,
                  )}`}
                >
                  {escrowLabel}
                </span>
              </header>

              <p
                data-testid="card-amount"
                className="mt-4 text-lg font-semibold text-slate-900 dark:text-white"
              >
                {formatSignedAssetAmount(
                  transaction.amount,
                  transaction.assetCode,
                  transaction.direction,
                )}
              </p>
              <p
                data-testid="card-fiat-amount"
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                {formatFiatAmount(
                  transaction.fiatAmount,
                  transaction.fiatCurrency,
                )}
              </p>

              <footer className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span data-testid="card-corridor">
                  {formatCorridor(
                    transaction.originCountry,
                    transaction.destinationCountry,
                  )}
                </span>
                <span data-testid="card-date">
                  {formatTransactionDate(transaction.createdAt)}
                </span>
              </footer>

              {onSelect && (
                <button
                  type="button"
                  onClick={() => onSelect(transaction)}
                  className="mt-4 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                  View details
                </button>
              )}
            </article>
          </li>
        );
      })}
    </ul>
  );
}
