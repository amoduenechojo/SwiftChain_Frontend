'use client';

import { useState, useCallback } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { deliveriesService } from '@/services/deliveries.service';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';

export interface CsvDeliveryRow {
  pickupAddress: string;
  destination: string;
  packageSize: 'small' | 'medium' | 'large';
  description: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
}

export interface BulkImportResult {
  row: number;
  success: boolean;
  trackingNumber?: string;
  error?: string;
}

export interface BulkShipmentImportProps {
  onComplete?: (_results: BulkImportResult[]) => void;
}

function parseCsvContent(content: string): CsvDeliveryRow[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const requiredHeaders = [
    'pickupaddress',
    'destination',
    'packagesize',
    'description',
    'recipientname',
    'recipientphone',
    'recipientemail',
  ];

  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required CSV columns: ${missingHeaders.join(', ')}`);
  }

  const rows: CsvDeliveryRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx];
    });

    rows.push({
      pickupAddress: row['pickupaddress'],
      destination: row['destination'],
      packageSize: ['small', 'medium', 'large'].includes(row['packagesize'].toLowerCase())
        ? (row['packagesize'].toLowerCase() as 'small' | 'medium' | 'large')
        : 'small',
      description: row['description'],
      recipientName: row['recipientname'],
      recipientPhone: row['recipientphone'],
      recipientEmail: row['recipientemail'],
    });
  }

  return rows;
}

export function BulkShipmentImport({ onComplete }: BulkShipmentImportProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<BulkImportResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setResults([]);
      setFileName(file.name);
      setIsProcessing(true);
      setProgress({ current: 0, total: 0 });

      try {
        const content = await file.text();
        const rows = parseCsvContent(content);

        if (rows.length === 0) {
          throw new Error('CSV file is empty or has no valid data rows');
        }

        const importResults: BulkImportResult[] = [];
        setProgress({ current: 0, total: rows.length });

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            const delivery = await deliveriesService.createDelivery(row);
            importResults.push({
              row: i + 1,
              success: true,
              trackingNumber: delivery.trackingNumber,
            });
          } catch (err) {
            importResults.push({
              row: i + 1,
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
          }

          setProgress({ current: i + 1, total: rows.length });
        }

        setResults(importResults);

        const successCount = importResults.filter((r) => r.success).length;
        const failCount = importResults.filter((r) => !r.success).length;

        if (successCount > 0) {
          queryClient.invalidateQueries({ queryKey: ['deliveries'] });
          toastSuccess(
            `Bulk import complete`,
            `${successCount} shipment${successCount !== 1 ? 's' : ''} created${failCount > 0 ? `, ${failCount} failed` : ''}`
          );
        }

        if (failCount > 0 && successCount === 0) {
          toastError('Bulk import failed', 'All shipments failed to create');
        }

        onComplete?.(importResults);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to process CSV file';
        setError(message);
        toastError('Upload failed', message);
      } finally {
        setIsProcessing(false);
      }
    },
    [queryClient, toastSuccess, toastError, onComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const csvFile = droppedFiles.find((f) => f.type === 'text/csv' || f.name.endsWith('.csv'));

      if (csvFile) {
        void processFile(csvFile);
      } else {
        setError('Please upload a valid CSV file');
      }
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files ?? []);
      const csvFile = selectedFiles.find((f) => f.type === 'text/csv' || f.name.endsWith('.csv'));

      if (csvFile) {
        void processFile(csvFile);
      } else {
        setError('Please upload a valid CSV file');
      }

      e.target.value = '';
    },
    [processFile]
  );

  const handleReset = useCallback(() => {
    setFileName(null);
    setResults([]);
    setError(null);
    setProgress({ current: 0, total: 0 });
  }, []);

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Bulk Shipment Import
        </h2>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Upload a CSV file to create multiple shipments at once. New shipments will appear on the Active Deliveries page.
        </p>

        {!fileName ? (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed transition ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20'
                : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50'
            }`}
          >
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileInput}
              className="hidden"
              id="csv-upload-input"
              disabled={isProcessing}
            />

            <label
              htmlFor="csv-upload-input"
              className="flex cursor-pointer flex-col items-center justify-center gap-3 px-6 py-12"
            >
              <Upload
                className={`h-8 w-8 ${
                  isDragging
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              />
              <div className="text-center">
                <p
                  className={`text-sm font-semibold ${
                    isDragging
                      ? 'text-indigo-900 dark:text-indigo-300'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {isDragging ? 'Drop your CSV here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  CSV files only (.csv)
                </p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                  <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {fileName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {isProcessing
                      ? `Processing ${progress.current} of ${progress.total}...`
                      : 'Processing complete'}
                  </p>
                </div>
              </div>

              {!isProcessing && (
                <button
                  onClick={handleReset}
                  className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  aria-label="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300 dark:bg-indigo-500"
                    style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {progress.current} / {progress.total} shipments processed
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  {successCount > 0 && (
                    <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {successCount} succeeded
                    </span>
                  )}
                  {failCount > 0 && (
                    <span className="flex items-center gap-1 text-red-700 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      {failCount} failed
                    </span>
                  )}
                </div>

                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded-lg p-3 text-sm ${
                        result.success
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Row {result.row}:
                        </span>
                        {result.success ? (
                          <span className="ml-2 text-green-700 dark:text-green-400">
                            Created {result.trackingNumber}
                          </span>
                        ) : (
                          <span className="ml-2 text-red-700 dark:text-red-400">
                            {result.error}
                          </span>
                        )}
                      </div>
                      {result.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing shipments...
              </div>
            )}
          </div>
        )}

        {results.length > 0 && !isProcessing && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  {successCount > 0
                    ? `${successCount} shipment${successCount !== 1 ? 's' : ''} imported successfully`
                    : 'No shipments were imported'}
                </p>
                {successCount > 0 && (
                  <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                    New shipments are now visible on the Active Deliveries page.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
