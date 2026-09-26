'use client';

import { Download, Receipt } from 'lucide-react';
import { useTransactionExport } from '@/hooks/useTransactionExport';
import type { TransactionRecord } from '@/services/transactionHistoryService';
import type { TransactionStatus } from '@/types/transaction';

interface TransactionHistoryTableProps {
  transactions: TransactionRecord[];
  isLoading?: boolean;
  error?: string | null;
}

const STATUS_COLORS: Record<TransactionStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  SUCCESS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function truncateHash(hash: string): string {
  return hash.length > 16 ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : hash;
}

/**
 * TransactionHistoryTable — the settlement history table with a CSV export.
 *
 * "Export to CSV" serialises exactly the rows this table is rendering, so the
 * downloaded file always matches what the user can see.
 */
export function TransactionHistoryTable({
  transactions,
  isLoading = false,
  error = null,
}: TransactionHistoryTableProps) {
  const {
    isExporting,
    error: exportError,
    didExport,
    exportToCsv,
    clearError,
  } = useTransactionExport();

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-6 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        Loading transactions...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
      >
        {error}
      </div>
    );
  }

  const hasRows = transactions.length > 0;

  return (
    <section className="w-full" aria-label="Transaction history">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transaction History
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400" data-testid="transaction-count">
            {transactions.length} transaction{transactions.length === 1 ? '' : 's'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportToCsv(transactions)}
          disabled={!hasRows || isExporting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {isExporting ? 'Preparing CSV...' : 'Export to CSV'}
        </button>
      </div>

      {exportError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
          <span>{exportError}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {didExport && !exportError && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
        >
          Your transactions have been exported.
        </p>
      )}

      {hasRows ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm" aria-label="Transactions">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Date
                </th>
                <th scope="col" className="px-4 py-3">
                  Hash
                </th>
                <th scope="col" className="px-4 py-3">
                  Type
                </th>
                <th scope="col" className="px-4 py-3">
                  Amount
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="bg-white dark:bg-gray-900">
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">
                    {truncateHash(transaction.hash)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{transaction.type}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {transaction.amount} {transaction.currency}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        STATUS_COLORS[transaction.status] ?? ''
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Receipt className="h-10 w-10 text-gray-300 dark:text-gray-600" aria-hidden="true" />
          <p className="text-base font-medium text-gray-500 dark:text-gray-400">
            No transactions yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Settlements appear here once an escrow is funded or released.
          </p>
        </div>
      )}
    </section>
  );
}
