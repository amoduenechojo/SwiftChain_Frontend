'use client';

import { useCallback, useState } from 'react';
import { toCsv, downloadCsv, type CsvColumn } from '@/lib/csvExport';
import type { TransactionRecord } from '@/services/transactionHistoryService';

/** Column layout of the exported file — mirrors the on-screen table. */
export const TRANSACTION_CSV_COLUMNS: CsvColumn<TransactionRecord>[] = [
  { header: 'Date', value: (row) => row.date },
  { header: 'Transaction Hash', value: (row) => row.hash },
  { header: 'Type', value: (row) => row.type },
  { header: 'Amount', value: (row) => row.amount },
  { header: 'Currency', value: (row) => row.currency },
  { header: 'Status', value: (row) => row.status },
  { header: 'Counterparty', value: (row) => row.counterparty },
  { header: 'Delivery ID', value: (row) => row.deliveryId },
];

export interface UseTransactionExportResult {
  /** True while the file is being generated. */
  isExporting: boolean;
  /** Message shown when the export could not be produced. */
  error: string | null;
  /** True after a successful export, until the next attempt. */
  didExport: boolean;
  /** Serialises the supplied rows and hands the file to the browser. */
  exportToCsv: (rows: TransactionRecord[]) => void;
  clearError: () => void;
}

/**
 * Builds a dated filename, e.g. `swiftchain-transactions-2026-02-01.csv`.
 */
export function buildTransactionCsvFilename(now: Date = new Date()): string {
  const stamp = now.toISOString().split('T')[0];
  return `swiftchain-transactions-${stamp}.csv`;
}

/**
 * useTransactionExport — turns the rows currently held by the table into a CSV
 * download.
 *
 * The rows are passed in rather than refetched, so the file always matches what
 * the user is looking at, filters and sorting included.
 */
export function useTransactionExport(): UseTransactionExportResult {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [didExport, setDidExport] = useState(false);

  const exportToCsv = useCallback((rows: TransactionRecord[]) => {
    setDidExport(false);
    setError(null);

    if (rows.length === 0) {
      setError('There is nothing to export.');
      return;
    }

    setIsExporting(true);
    try {
      const csv = toCsv(rows, TRANSACTION_CSV_COLUMNS);
      downloadCsv(csv, buildTransactionCsvFilename());
      setDidExport(true);
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : 'Failed to generate the CSV file',
      );
    } finally {
      setIsExporting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isExporting, error, didExport, exportToCsv, clearError };
}
